import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser
} from 'firebase/auth';

import { auth, db } from '../firebase';
import { setDoc, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';

/**
 * Inscription complète avec email/mot de passe et données supplémentaires.
 */
export async function signUp(email, password, userData) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const displayName = `${userData.firstname} ${userData.username}`;
  await updateProfile(user, { displayName });
  
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: displayName,
    firstname: userData.firstname,
    username: userData.username,
    birthdate: userData.birthdate,
    country: userData.country,
    createdAt: new Date(),
    billingAddress: {
      street: "",
      city: "",
      postalCode: "",
      country: userData.country
    }
  });
  return user;
}

/**
 * Connexion avec email/mot de passe
 */
export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Fonction privée pour gérer la logique de connexion par popup (Google, Facebook, etc.)
 */
async function _signInWithProvider(provider) {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
  if (!userDocSnap.exists()) {
    userData.createdAt = new Date();
    userData.billingAddress = { street: "", city: "", postalCode: "", country: "" };
  }
  await setDoc(userDocRef, userData, { merge: true });
  return user;
}

/**
 * Connexion avec Google
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return _signInWithProvider(provider);
}

/**
 * Connexion avec Facebook
 */
export async function signInWithFacebook() {
  const provider = new FacebookAuthProvider();
  return _signInWithProvider(provider);
}

/**
 * Met à jour les informations du profil d'un utilisateur dans Firestore ET dans Firebase Auth.
 * C'EST LA FONCTION QUI MANQUAIT.
 */
export async function updateUserProfile(uid, dataToUpdate) {
  if (!uid) throw new Error("UID de l'utilisateur non fourni pour la mise à jour.");
  
  // Étape 1 : Mettre à jour le document dans Firestore
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, dataToUpdate);
  
  // Étape 2 : Mettre à jour le `displayName` dans Firebase Auth si il est modifié
  // C'est important pour que le nom soit à jour partout dans Firebase
  if (dataToUpdate.displayName) {
    const user = auth.currentUser;
    if (user && user.uid === uid) { // Sécurité supplémentaire
      await updateProfile(user, {
        displayName: dataToUpdate.displayName
      });
    }
  }
}

/**
 * Fonction de suppression unifiée et exportée.
 * Gère tous les cas de suppression de compte.
 * @param {string} [password] - Le mot de passe de l'utilisateur, requis uniquement pour la connexion par email.
 */
export async function deleteUserAccount(password) {
  const user = auth.currentUser;
  if (!user) throw new Error("Aucun utilisateur n'est actuellement connecté.");

  const providerId = user.providerData[0]?.providerId;

  // Étape 1 : Réauthentification de l'utilisateur (sécurité)
  if (providerId === 'password') {
    if (!password) throw new Error("Le mot de passe est requis pour supprimer le compte.");
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  } else if (providerId === 'google.com' || providerId === 'facebook.com') {
    let provider;
    if (providerId === 'google.com') provider = new GoogleAuthProvider();
    if (providerId === 'facebook.com') provider = new FacebookAuthProvider();
    await reauthenticateWithPopup(user, provider);
  } else {
    throw new Error("Type de compte non pris en charge pour la suppression.");
  }

  // Étape 2 : Suppression des données de l'utilisateur (une fois réauthentifié)
  const userDocRef = doc(db, 'users', user.uid);
  await deleteDoc(userDocRef);

  // Étape 3 : Suppression finale de l'utilisateur de Firebase Auth
  await deleteUser(user);
}

/**
 * Déconnexion
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * Réinitialisation du mot de passe
 */
export async function sendPasswordResetEmail(email) {
  await firebaseSendPasswordResetEmail(auth, email);
}