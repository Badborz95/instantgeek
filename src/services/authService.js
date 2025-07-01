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
  const displayName = userData.displayName || email.split('@')[0];
  await updateProfile(user, { displayName });
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    createdAt: new Date(),
    ...userData
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
 * Met à jour les informations du profil d'un utilisateur.
 */
export async function updateUserProfile(uid, dataToUpdate) {
  if (!uid) throw new Error("UID de l'utilisateur non fourni.");
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, dataToUpdate);
  if (dataToUpdate.displayName) {
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, {
        displayName: dataToUpdate.displayName
      });
    }
  }
}

/**
 * Supprime le compte de l'utilisateur (créé avec email/mot de passe).
 */
export async function deleteEmailPasswordUser(password) {
  const user = auth.currentUser;
  if (!user) throw new Error("Aucun utilisateur n'est actuellement connecté.");
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  const userDocRef = doc(db, 'users', user.uid);
  await deleteDoc(userDocRef);
  await deleteUser(user);
}

/**
 * Supprime le compte de l'utilisateur (créé via un fournisseur OAuth).
 */
export async function deleteOauthUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Aucun utilisateur n'est actuellement connecté.");
  const providerId = user.providerData[0]?.providerId;
  let provider;
  if (providerId === 'google.com') {
    provider = new GoogleAuthProvider();
  } else if (providerId === 'facebook.com') {
    provider = new FacebookAuthProvider();
  } else {
    throw new Error("La suppression pour ce fournisseur n'est pas prise en charge.");
  }
  await reauthenticateWithPopup(user, provider);
  const userDocRef = doc(db, 'users', user.uid);
  await deleteDoc(userDocRef);
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