<template>
  <div class="settings-page-wrapper">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div v-if="authStore.isLoading" class="text-center">
            <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          
          <div v-else class="card">
            <div class="card-header">
              <h1>Paramètres du compte</h1>
            </div>
            <div v-if="authStore.isLoggedIn" class="card-body">
              
              <h3 class="mb-3">Informations Personnelles</h3>
              
              <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
              <div v-if="errorMessage" class="alert alert-warning">{{ errorMessage }}</div>

              <form @submit.prevent="handleUpdateProfile">
                <div class="mb-3 text-start">
                  <label for="email" class="form-label">Adresse e-mail</label>
                  <input type="email" id="email" class="form-control" :value="authStore.user.email" disabled>
                  <div class="form-text">L'adresse e-mail ne peut pas être modifiée.</div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3 text-start">
                    <label for="firstname" class="form-label">Prénom</label>
                    <input type="text" id="firstname" class="form-control" v-model="form.firstname">
                  </div>
                  <div class="col-md-6 mb-3 text-start">
                    <label for="username" class="form-label">Nom</label>
                    <input type="text" id="username" class="form-control" v-model="form.username">
                  </div>
                </div>

                <div class="mb-3 text-start">
                  <label for="country" class="form-label">Pays</label>
                  <select id="country" class="form-control" v-model="form.country">
                    <option value="">Sélectionnez votre pays</option>
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
import { ref, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { deleteUserAccount } from '../services/authService';

const router = useRouter();
const authStore = useAuthStore();

// On utilise un 'ref' local pour le formulaire, pour ne pas modifier le store directement
const form = ref({
  firstname: '',
  username: '',
  country: '',
});

const countriesList = ref([]);
const successMessage = ref('');
const errorMessage = ref('');

// on utilise watchEffect pour remplir le formulaire de manière réactive
// Cette fonction se déclenchera automatiquement dès que authStore.userData sera disponible
watchEffect(() => {
  if (authStore.userData) {
    form.value.firstname = authStore.userData.firstname || '';
    form.value.username = authStore.userData.username || '';
    form.value.country = authStore.userData.country || '';
  }
});

onMounted(async () => {
  await fetchCountries();
});

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

async function handleUpdateProfile() {
  successMessage.value = '';
  errorMessage.value = '';

  if (!authStore.user) {
    errorMessage.value = "Utilisateur non trouvé.";
    return;
  }

  const dataToUpdate = {
    ...form.value,
    displayName: `${form.value.firstname} ${form.value.username}`
  };

  try {
    // On appelle l'action centralisée du store
    await authStore.updateUserProfile(dataToUpdate);
    successMessage.value = "Vos informations ont été mises à jour avec succès !";
  } catch (e) {
    errorMessage.value = "Une erreur est survenue lors de la mise à jour.";
    console.error(e);
  }
}

async function handleDeleteAccount() {
  errorMessage.value = '';
  if (!confirm("Êtes-vous absolument certain de vouloir supprimer votre compte ? Cette action est irréversible.")) return;
  
  const password = prompt("Pour confirmer la suppression, veuillez entrer votre mot de passe :");
  if (!password) {
    errorMessage.value = "La suppression a été annulée. Mot de passe non fourni.";
    return;
  }

  try {
    // On utilise un service qui gère les différents cas (email/password, google, etc.)
    await deleteUserAccount(password); 
    alert("Votre compte a été supprimé avec succès.");
    router.push('/');
  } catch (e) {
    console.error("Erreur lors de la suppression du compte:", e);
    errorMessage.value = e.message || "Une erreur est survenue lors de la suppression du compte.";
  }
}

function goBack() {
  router.back();
}
</script>

<style scoped>
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