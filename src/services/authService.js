import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile // ✅ AMÉLIORATION : Importer updateProfile
} from 'firebase/auth';

import { auth, db } from '../firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';

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