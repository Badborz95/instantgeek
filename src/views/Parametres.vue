<template>
  <div class="settings-page-wrapper">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h1>Paramètres du compte</h1>
            </div>
            <div class="card-body">
              
              <h3 class="mb-3">Informations Personnelles</h3>
              
              <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
              <div v-if="errorMessage" class="alert alert-warning">{{ errorMessage }}</div>

              <form @submit.prevent="handleUpdateProfile">
                <div class="mb-3 text-start">
                  <label for="email" class="form-label">Adresse e-mail</label>
                  <input type="email" id="email" class="form-control" :value="user?.email" disabled>
                  <div class="form-text">L'adresse e-mail ne peut pas être modifiée.</div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3 text-start">
                    <label for="firstname" class="form-label">Prénom</label>
                    <input type="text" id="firstname" class="form-control" v-model="firstname">
                  </div>
                  <div class="col-md-6 mb-3 text-start">
                    <label for="username" class="form-label">Nom</label>
                    <input type="text" id="username" class="form-control" v-model="username">
                  </div>
                </div>

                <div class="mb-3 text-start">
                  <label for="country" class="form-label">Pays</label>
                  <select id="country" class="form-control" v-model="country">
                    <option v-if="!country" value="">Sélectionnez votre pays</option>
                    <option v-for="c in countriesList" :key="c.cca3" :value="c.name.common">
                      {{ c.name.common }}
                    </option>
                  </select>
                </div>
                
                <button type="submit" class="btn btn-primary w-100">Sauvegarder les modifications</button>
              </form>
              
              <hr class="my-4">

              <div class="alert alert-danger">
                <h4 class="alert-heading">Zone de Danger</h4>
                <p>
                  La suppression de votre compte est une action permanente et irréversible.
                </p>
                <button @click="handleDeleteAccount" class="btn btn-danger">
                  Supprimer mon compte
                </button>
              </div>
              
              <div class="mt-4 text-center">
                  <button @click="goBack" class="btn btn-secondary">Retour</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { deleteUserAccount, updateUserProfile } from '../services/authService';

const router = useRouter();
const user = auth.currentUser;

// Références pour les données du formulaire
const firstname = ref('');
const username = ref('');
const country = ref('');

// Référence pour la liste des pays
const countriesList = ref([]);

// Références pour les messages de feedback
const successMessage = ref('');
const errorMessage = ref('');

// Fonction pour charger la liste des pays depuis l'API
async function fetchCountries() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca3');
    if (!response.ok) throw new Error('Failed to fetch countries');
    const data = await response.json();
    countriesList.value = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
  } catch (error) {
    console.error(error.message);
  }
}

// Au chargement du composant, on charge les données de l'utilisateur ET la liste des pays
onMounted(async () => {
  if (user) {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      firstname.value = userData.firstname || '';
      username.value = userData.username || '';
      country.value = userData.country || '';
    }
  }
  // On charge aussi la liste des pays
  await fetchCountries();
});

// Fonction pour sauvegarder les modifications du profil
async function handleUpdateProfile() {
  successMessage.value = '';
  errorMessage.value = '';

  if (!user) {
    errorMessage.value = "Utilisateur non trouvé.";
    return;
  }

  const dataToUpdate = {
    firstname: firstname.value,
    username: username.value,
    country: country.value,
    displayName: `${firstname.value} ${username.value}`
  };

  try {
    await updateUserProfile(user.uid, dataToUpdate);
    successMessage.value = "Vos informations ont été mises à jour avec succès !";
  } catch (e) {
    console.error("Erreur lors de la mise à jour du profil:", e);
    errorMessage.value = "Une erreur est survenue lors de la mise à jour.";
  }
}

// Fonction pour le bouton "Retour"
function goBack() {
  router.back();
}

// Fonction pour supprimer le compte utilisateur
async function handleDeleteAccount() {
  errorMessage.value = '';
  const isConfirmed = confirm("Êtes-vous absolument certain de vouloir supprimer votre compte ? Cette action est irréversible.");
  if (!isConfirmed) return;
  
  const password = prompt("Pour confirmer la suppression, veuillez entrer votre mot de passe :");
  if (!password) {
    errorMessage.value = "La suppression a été annulée. Mot de passe non fourni.";
    return;
  }

  try {
    await deleteUserAccount(password);
    alert("Votre compte a été supprimé avec succès.");
    router.push('/');
  } catch (e) {
    console.error("Erreur lors de la suppression du compte:", e);
    if (e.code === 'auth/wrong-password') {
      errorMessage.value = "Mot de passe incorrect. La suppression a été annulée.";
    } else {
      errorMessage.value = "Une erreur est survenue lors de la suppression du compte.";
    }
  }
}
</script>

<style scoped>
/* Utilisation de vos variables CSS du .dark-mode */
.settings-page-wrapper {
  background-color: var(--background-one, #01070A);
  min-height: 100vh;
  color: var(--text-one, #76C6E3);
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.card {
  background-color: var(--background-two, #0E181C);
  border: 1px solid var(--border-separator-one, #024457);
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  color: var(--text-one, #76C6E3);
}

.card-header {
  background-color: var(--interactive-comp-one, #0E181C);
  color: var(--text-high-contrast, #FFFFFF);
  border-bottom: 1px solid var(--border-separator-one, #024457);
  border-radius: 15px 15px 0 0;
  padding: 1.5rem;
  text-align: center;
}

.card-body {
  padding: 2rem;
}

h1, h3, h4 {
  color: var(--text-high-contrast, #FFFFFF);
  font-weight: 600;
}

.form-label {
  color: var(--text-one, #76C6E3);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-control, .form-select { /* Appliqué aussi à select */
  background-color: var(--interactive-comp-one, #0E181C);
  border: 1px solid var(--border-separator-one, #024457);
  color: var(--text-high-contrast, #FFFFFF);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}
.form-control:focus, .form-select:focus {
  background-color: var(--interactive-comp-two, #003747);
  border-color: var(--solid-one, #50A0BD);
  box-shadow: 0 0 0 0.25rem rgba(80, 160, 189, 0.25);
}

.form-control:disabled {
  background-color: var(--background-two, #0E181C);
  opacity: 0.7;
}

.form-text {
  color: var(--text-one, #76C6E3);
  opacity: 0.8;
  font-size: 0.875em;
}

hr {
    border: none;
    height: 1px;
    background-color: var(--border-separator-two, #1D667D);
    opacity: 0.5;
}

.btn {
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    border: none;
    transition: all 0.2s ease-in-out;
}

.btn-primary {
    background-color: var(--solid-one, #50A0BD);
    color: black;
}
.btn-primary:hover {
    background-color: var(--solid-two, #4394B0);
}

.btn-secondary {
    background-color: var(--interactive-comp-three, #024457);
    color: var(--text-high-contrast, #FFFFFF);
}
.btn-secondary:hover {
    background-color: var(--interactive-comp-two, #003747);
}

.alert {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 1rem;
    text-align: left;
}

.alert-danger {
    background-color: rgba(220, 53, 69, 0.15);
    color: var(--text-high-contrast);
    border-color: rgba(220, 53, 69, 0.3);
}
.alert-danger h4 {
    color: var(--text-high-contrast);
}

.btn-danger {
    background-color: #dc3545;
    color: white;
    border: none;
}
.btn-danger:hover {
    background-color: #bb2d3b;
}

.alert-success {
    background-color: rgba(25, 135, 84, 0.15);
    color: #d1e7dd;
    border-color: rgba(25, 135, 84, 0.3);
}

.alert-warning {
    background-color: rgba(255, 193, 7, 0.15);
    color: #fff3cd;
    border-color: rgba(255, 193, 7, 0.3);
}
</style>