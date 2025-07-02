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
 * @param {string} email L'email de l'utilisateur.
 * @param {string} password Le mot de passe de l'utilisateur.
 * @param {object} userData Un objet contenant firstname, username, birthdate, country.
 * @returns {Promise<object>} L'objet utilisateur Firebase.
 */
export async function signUp(email, password, userData) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const displayName = `${userData.firstname || ''} ${userData.username || ''}`.trim();
  if (displayName) {
    await updateProfile(user, { displayName });
  }
  
  // Crée ou met à jour le document utilisateur dans Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: displayName, // Utilise le displayName que nous venons de créer
    firstname: userData.firstname,
    username: userData.username,
    birthdate: userData.birthdate,
    country: userData.country,
    createdAt: new Date(), // Utilise un objet Date natif ou un timestamp Firestore si tu préfères
    billingAddress: {
      street: "",
      city: "",
      postalCode: "",
      country: userData.country // Initialise le pays de l'adresse de facturation
    }
  }, { merge: true }); // Utilise merge:true pour éviter d'écraser des champs existants si le doc existe déjà (ex: via signInWithPopup)
  
  return user;
}

/**
 * Connexion avec email/mot de passe
 * @param {string} email L'email de l'utilisateur.
 * @param {string} password Le mot de passe de l'utilisateur.
 * @returns {Promise<object>} L'objet utilisateur Firebase.
 */
export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Fonction privée pour gérer la logique de connexion par popup (Google, Facebook, etc.)
 * @param {object} provider Le fournisseur d'authentification (ex: GoogleAuthProvider).
 * @returns {Promise<object>} L'objet utilisateur Firebase.
 */
async function _signInWithProvider(provider) {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);
  
  // Prépare les données à fusionner ou créer dans Firestore
  const userDataToStore = {
    uid: user.uid,
    email: user.email,
    // Utilise le displayName de Firebase Auth ou par défaut
    displayName: user.displayName || user.email.split('@')[0], 
  };

  // Si le document n'existe pas, ajoute les champs initiaux
  if (!userDocSnap.exists()) {
    userDataToStore.createdAt = new Date();
    userDataToStore.billingAddress = { street: "", city: "", postalCode: "", country: "" };
    userDataToStore.firstname = user.displayName ? user.displayName.split(' ')[0] : '';
    userDataToStore.username = user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '';
  }

  // Fusionne les données dans Firestore.
  // Cela gère les cas où l'utilisateur s'est déjà inscrit par email et se connecte ensuite via un fournisseur,
  // ou l'inverse, en ajoutant seulement les champs manquants.
  await setDoc(userDocRef, userDataToStore, { merge: true });
  return user;
}

/**
 * Connexion avec Google
 * @returns {Promise<object>} L'objet utilisateur Firebase.
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return _signInWithProvider(provider);
}

/**
 * Connexion avec Facebook
 * @returns {Promise<object>} L'objet utilisateur Firebase.
 */
export async function signInWithFacebook() {
  const provider = new FacebookAuthProvider();
  return _signInWithProvider(provider);
}

/**
 * Met à jour les informations du profil d'un utilisateur dans Firestore ET dans Firebase Auth.
 * @param {string} uid L'UID de l'utilisateur à mettre à jour.
 * @param {object} dataToUpdate Les données à mettre à jour (ex: { firstname: '...', username: '...', billingAddress: {...} }).
 * @returns {Promise<void>}
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
 * Fonction de suppression unifiée du compte utilisateur.
 * Gère tous les cas de suppression de compte, y compris la réauthentification.
 * @param {string} [password] - Le mot de passe de l'utilisateur, requis uniquement pour la connexion par email/mot de passe.
 * @returns {Promise<void>}
 */
export async function deleteUserAccount(password) {
  const user = auth.currentUser;
  if (!user) throw new Error("Aucun utilisateur n'est actuellement connecté.");

  const providerId = user.providerData[0]?.providerId;

  // Étape 1 : Réauthentification de l'utilisateur (mesure de sécurité critique)
  if (providerId === 'password') {
    if (!password) throw new Error("Le mot de passe est requis pour supprimer le compte.");
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  } else if (providerId === 'google.com' || providerId === 'facebook.com') {
    let provider;
    if (providerId === 'google.com') provider = new GoogleAuthProvider();
    if (providerId === 'facebook.com') provider = new FacebookAuthProvider();
    // La réauthentification par popup est essentielle pour les fournisseurs sociaux
    await reauthenticateWithPopup(user, provider);
  } else {
    // Si d'autres fournisseurs sont ajoutés plus tard, ils devraient être gérés ici
    throw new Error("Type de compte non pris en charge pour la suppression.");
  }

  // Étape 2 : Suppression des données de l'utilisateur dans Firestore
  // Ceci est crucial pour GDPR et la propreté de la base de données
  const userDocRef = doc(db, 'users', user.uid);
  await deleteDoc(userDocRef);

  // Étape 3 : Suppression finale de l'utilisateur de Firebase Authentication
  await deleteUser(user);
}

/**
 * Déconnexion de l'utilisateur.
 * @returns {Promise<void>}
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * Envoie un e-mail de réinitialisation de mot de passe à l'adresse fournie.
 * @param {string} email L'email de l'utilisateur.
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(email) {
  await firebaseSendPasswordResetEmail(auth, email);
}