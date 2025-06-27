import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from 'firebase/auth';

import { auth, db } from '../firebase';
import { setDoc, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';

/**
 * ✅ Inscription avec email/mot de passe
 * @param {string} email 
 * @param {string} password 
 * @param {string} [username] - Optionnel : un nom d'utilisateur pour le profil
 */
export async function signUp(email, password, username) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // ⭐ AMÉLIORATION : Mettre à jour le profil Firebase Auth avec un displayName
  // Si aucun nom d'utilisateur n'est fourni, on utilise la partie de l'email avant le '@'
  const displayName = username || email.split('@')[0];
  await updateProfile(user, { displayName });

  // Enregistrez les informations de l'utilisateur dans Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: displayName, // On enregistre aussi le displayName ici
    createdAt: new Date(),
    // Vous pouvez ajouter d'autres champs par défaut ici
  });

  return user;
}

/**
 * ✅ Connexion avec email/mot de passe
 * @param {string} email 
 * @param {string} password 
 */
export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * ✅ Connexion avec Google
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Vérifie si l'utilisateur a déjà un document pour ne pas écraser la date de création
  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);
  
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };

  if (!userDocSnap.exists()) {
    // Si c'est un nouvel utilisateur, on ajoute la date de création
    userData.createdAt = new Date();
  }

  // Enregistrez ou mettez à jour les informations de l'utilisateur dans Firestore
  // `merge: true` est important pour ne pas écraser les champs existants que vous pourriez avoir
  await setDoc(userDocRef, userData, { merge: true });

  return user;
}

/**
 * ✅ Déconnexion
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * ✅ Réinitialisation du mot de passe
 * @param {string} email 
 */
export async function sendPasswordResetEmail(email) {
  await firebaseSendPasswordResetEmail(auth, email);
}

/**
 * ✅ Supprime le compte de l'utilisateur actuellement connecté.
 * Nécessite le mot de passe de l'utilisateur pour se ré-authentifier.
 * @param {string} password - Le mot de passe actuel de l'utilisateur.
 */
export async function deleteUserAccount(password) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Aucun utilisateur n'est actuellement connecté.");
  }

  // 1. Créer une "crédential" pour prouver l'identité de l'utilisateur
  const credential = EmailAuthProvider.credential(user.email, password);

  // 2. Ré-authentifier l'utilisateur. C'est une exigence de sécurité de Firebase.
  await reauthenticateWithCredential(user, credential);

  // Si la ré-authentification réussit, on peut continuer.
  const userId = user.uid;

  // 3. Supprimer le document de l'utilisateur dans Firestore
  const userDocRef = doc(db, 'users', userId);
  await deleteDoc(userDocRef);

  // 4. Supprimer l'utilisateur de Firebase Authentication
  await deleteUser(user);
}
/**
 * ✅ Met à jour les informations du profil d'un utilisateur.
 * @param {string} uid - L'ID de l'utilisateur à mettre à jour.
 * @param {object} dataToUpdate - Un objet avec les champs à mettre à jour (ex: { firstname: 'NouveauPrénom' }).
 */
export async function updateUserProfile(uid, dataToUpdate) {
  if (!uid) throw new Error("UID de l'utilisateur non fourni.");

  const userDocRef = doc(db, 'users', uid);
  
  // 1. Mettre à jour le document dans Firestore
  await updateDoc(userDocRef, dataToUpdate);

  // 2. Si le nom d'affichage (displayName) est mis à jour, le mettre aussi à jour dans le profil Auth
  if (dataToUpdate.displayName) {
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, {
        displayName: dataToUpdate.displayName
      });
    }
  }
}