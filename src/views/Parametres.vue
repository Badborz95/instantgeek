<template>
  <div class="settings-page-wrapper">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10">
          <div class="card" v-if="!authStore.isLoading">
            <div class="card-header">
              <h1>Paramètres du compte</h1>
            </div>
            <div class="card-body" v-if="authStore.isLoggedIn">
              
              <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
              <div v-if="errorMessage" class="alert alert-warning">{{ errorMessage }}</div>

              <form @submit.prevent="handleUpdateProfile">
                <h3 class="mb-3 mt-2 text-start">Informations Personnelles</h3>
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
                
                <hr class="my-4">

                <h3 class="mb-3 text-start">Adresse de Facturation</h3>

                <div class="mb-3 text-start">
                    <label for="country" class="form-label">Pays</label>
                    <input type="text" id="country" class="form-control" v-model="form.billingAddress.country">
                </div>

                <div class="mb-3 text-start">
                  <label for="street" class="form-label">Adresse (rue, etc.)</label>
                  <input type="text" id="street" class="form-control" placeholder="123 rue de la République" v-model="form.billingAddress.street">
                </div>

                <div class="row">
                  <div class="col-md-7 mb-3 text-start">
                    <label for="city" class="form-label">Ville</label>
                    <input type="text" id="city" class="form-control" v-model="form.billingAddress.city">
                  </div>
                  <div class="col-md-5 mb-3 text-start">
                    <label for="postalCode" class="form-label">Code Postal</label>
                    <input type="text" id="postalCode" class="form-control" v-model="form.billingAddress.postalCode">
                  </div>
                </div>
                
                <button type="submit" class="btn btn-primary w-100 mt-3">Sauvegarder les modifications</button>
              </form>
              
              <hr class="my-4">

              <div class="alert alert-danger">
                 <h4 class="alert-heading">Zone de Danger</h4>
                 <p>La suppression de votre compte est une action permanente et irréversible.</p>
                 <button @click="handleDeleteAccount" class="btn btn-danger">Supprimer mon compte</button>
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
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { deleteUserAccount } from '../services/authService';

const router = useRouter();
const authStore = useAuthStore();

// Formulaire local pour éviter de muter le store directement
const form = ref({
  firstname: '',
  username: '',
  billingAddress: {
    street: '',
    city: '',
    postalCode: '',
    country: ''
  }
});

const successMessage = ref('');
const errorMessage = ref('');

// Synchronise le formulaire local avec les données du store à chaque changement
watchEffect(() => {
  if (authStore.userData) {
    form.value.firstname = authStore.userData.firstname || '';
    form.value.username = authStore.userData.username || '';
    // Fusionne l'adresse de facturation pour éviter les erreurs si elle est absente
    form.value.billingAddress = {
      street: authStore.userData.billingAddress?.street || '',
      city: authStore.userData.billingAddress?.city || '',
      postalCode: authStore.userData.billingAddress?.postalCode || '',
      country: authStore.userData.billingAddress?.country || '',
    };
  }
});

// Gère la sauvegarde en appelant l'action du store
async function handleUpdateProfile() {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const dataToUpdate = {
      ...form.value,
      displayName: `${form.value.firstname} ${form.value.username}`
    };
    await authStore.updateUserProfile(dataToUpdate);
    successMessage.value = "Vos informations ont été mises à jour avec succès !";
  } catch (e) {
    errorMessage.value = "Une erreur est survenue lors de la mise à jour.";
    console.error(e);
  }
}

// Fonctions inchangées
function goBack() { router.back(); }
async function handleDeleteAccount() {
  errorMessage.value = '';
  if (!confirm("Êtes-vous certain de vouloir supprimer votre compte ?")) return;
  const password = prompt("Veuillez entrer votre mot de passe pour confirmer :");
  if (!password) return;

  try {
    await deleteUserAccount(password);
    alert("Compte supprimé.");
    router.push('/');
  } catch (e) {
    errorMessage.value = "Erreur lors de la suppression : " + e.message;
  }
}

// Navigation retour
function goBack() {
  router.back();
}
</script>

<style scoped>
/* Vos styles sont conservés */
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