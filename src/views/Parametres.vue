<template>
  <div class="settings-page-wrapper">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10">
          <div v-if="authStore.isLoading" class="text-center py-5">
            <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          
          <div v-else class="card">
            <div class="card-header">
              <h1>Paramètres du compte</h1>
              <ul class="nav nav-tabs card-header-tabs mt-3">
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: currentTab === 'profile' }" @click="currentTab = 'profile'">Informations Personnelles</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: currentTab === 'address' }" @click="currentTab = 'address'">Adresse de Facturation</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: currentTab === 'cards' }" @click="currentTab = 'cards'">Mes Cartes (Démo)</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: currentTab === 'danger' }" @click="currentTab = 'danger'">Zone de Danger</a>
                </li>
              </ul>
            </div>

            <div v-if="authStore.isLoggedIn" class="card-body">
              
              <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
              <div v-if="errorMessage" class="alert alert-warning">{{ errorMessage }}</div>

              <div v-if="currentTab === 'profile'">
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
                  <button type="submit" class="btn btn-primary w-100 mt-3">Sauvegarder les modifications</button>
                </form>
              </div>

              <div v-if="currentTab === 'address'">
                <form @submit.prevent="handleUpdateProfile">
                  <h3 class="mb-3 mt-2 text-start">Adresse de Facturation</h3>
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
              </div>

              <div v-if="currentTab === 'cards'">
                <h3 class="mb-3 mt-2 text-start">Mes Cartes Enregistrées (Démo)</h3>
                
                <button v-if="!isAddCardFormVisible" @click="openAddCardForm" class="btn btn-primary w-100 mb-3">
                  <i class="bi bi-plus-circle me-2"></i>Ajouter une nouvelle carte
                </button>

                <div v-if="isAddCardFormVisible" class="add-card-form card p-4 mb-4">
                  <h4 class="mb-3">Ajouter une nouvelle carte</h4>
                  <div v-if="showAddCardSuccess" class="alert alert-success">{{ showAddCardSuccess }}</div>
                  <div v-if="showAddCardError" class="alert alert-warning">{{ showAddCardError }}</div>

                  <form @submit.prevent="handleAddCard">
                    <div class="mb-3">
                      <label for="cardNameInput" class="form-label">Nom sur la carte</label>
                      <input type="text" id="cardNameInput" class="form-control" v-model="cardNameInput" required>
                    </div>
                    <div class="mb-3">
                      <label for="cardNumberInput" class="form-label">Numéro de carte</label>
                      <input type="text" id="cardNumberInput" class="form-control" placeholder="0000 0000 0000 0000" v-model="cardNumberInput" maxlength="19" required>
                    </div>
                    <div class="row">
                      <div class="col-6 mb-3">
                        <label for="expiryInput" class="form-label">Expiration (MM/AA)</label>
                        <input type="text" id="expiryInput" class="form-control" placeholder="MM/AA" v-model="expiryInput" maxlength="5" required>
                      </div>
                      <div class="col-6 mb-3">
                        <label for="cvcInput" class="form-label">CVC</label>
                        <input type="text" id="cvcInput" class="form-control" placeholder="123" v-model="cvcInput" maxlength="4" required>
                      </div>
                    </div>
                    <button type="submit" class="btn btn-primary me-2" :disabled="!isAddCardFormValid">Enregistrer la carte</button>
                    <button type="button" class="btn btn-secondary" @click="closeAddCardForm">Annuler</button>
                  </form>
                </div>

                <div v-if="savedCards.length === 0 && !isAddCardFormVisible" class="alert alert-info text-center">
                  Vous n'avez pas de cartes enregistrées pour le moment.
                  <router-link to="/panier" class="alert-link">Ajoutez-en une lors de votre prochain achat !</router-link>
                </div>
                <div v-else class="card-list">
                    <div v-for="card in savedCards" :key="card.id" class="saved-card-item card mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="card-display">{{ card.cardName }} **** **** **** {{ card.last4 }}</span>
                                <button @click="removeSavedCard(card.id)" class="btn btn-sm btn-outline-danger">
                                    <i class="bi bi-trash"></i> Supprimer
                                </button>
                            </div>
                            <p class="text-muted small mb-0">Expire: {{ String(card.expiryMonth).padStart(2, '0') }}/{{ card.expiryYear }}</p>
                        </div>
                    </div>
                </div>
                <p class="text-muted small mt-3">
                  *Ceci est une **démonstration uniquement**. Dans une application réelle, les informations de carte ne sont jamais stockées directement sur votre serveur.
                </p>
              </div>

              <div v-if="currentTab === 'danger'">
                 <h3 class="mb-3 mt-2 text-start">Zone de Danger</h3>
                 <div class="alert alert-danger">
                   <h4 class="alert-heading">Supprimer votre compte</h4>
                   <p>La suppression de votre compte est une action permanente et irréversible. Toutes vos données seront effacées.</p>
                   <button @click="handleDeleteAccount" class="btn btn-danger">Supprimer mon compte</button>
                 </div>
              </div>

              <div class="mt-4 text-center">
                  <button @click="goBack" class="btn btn-secondary">Retour</button>
              </div>
            </div>
            <div v-else class="card-body text-center">
                <p>Vous devez être connecté pour accéder à vos paramètres.</p>
                <router-link to="/connexion" class="btn btn-primary">Se connecter</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { deleteUserAccount } from '../services/authService';
import { collection, query, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const router = useRouter();
const authStore = useAuthStore();

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
const currentTab = ref('profile');

const savedCards = ref([]);
let unsubscribeSavedCards = null;

// --- refs et états pour le formulaire d'ajout de carte ---
const cardNameInput = ref('');
const cardNumberInput = ref('');
const expiryInput = ref('');
const cvcInput = ref('');
const isAddCardFormVisible = ref(false); // Contrôle la visibilité du formulaire
const showAddCardSuccess = ref('');
const showAddCardError = ref('');

// --- Validation du formulaire d'ajout de carte ---
const isAddCardFormValid = computed(() => {
  const [month, year] = expiryInput.value.split('/');
  const currentYear = new Date().getFullYear() % 100; // Les deux derniers chiffres de l'année
  const currentMonth = new Date().getMonth() + 1; // Mois actuel (1-indexé)

  const isExpiryValid = month && year && 
                        parseInt(month) >= 1 && parseInt(month) <= 12 &&
                        parseInt(year) >= currentYear && // Année doit être au moins l'année actuelle
                        (parseInt(year) > currentYear || parseInt(month) >= currentMonth); // Si même année, mois doit être au moins le mois actuel

  return cardNameInput.value.trim() !== '' &&
         cardNumberInput.value.replace(/\s/g, '').length === 16 &&
         isExpiryValid &&
         cvcInput.value.length >= 3 && cvcInput.value.length <= 4;
});


// --- Fonctions du formulaire d'ajout de carte ---
const openAddCardForm = () => {
  isAddCardFormVisible.value = true;
  clearAddCardForm(); // Réinitialise le formulaire quand on l'ouvre
  showAddCardSuccess.value = ''; // Cache les messages précédents
  showAddCardError.value = '';
};

const closeAddCardForm = () => {
  isAddCardFormVisible.value = false;
  clearAddCardForm(); // Réinitialise le formulaire quand on le ferme
  showAddCardSuccess.value = '';
  showAddCardError.value = '';
};

const clearAddCardForm = () => {
  cardNameInput.value = '';
  cardNumberInput.value = '';
  expiryInput.value = '';
  cvcInput.value = '';
};

const handleAddCard = async () => {
  showAddCardSuccess.value = '';
  showAddCardError.value = '';

  if (!isAddCardFormValid.value) {
    showAddCardError.value = "Veuillez vérifier les informations de la carte.";
    return;
  }

  if (!authStore.isLoggedIn || !authStore.user.uid) {
    showAddCardError.value = "Vous devez être connecté pour ajouter une carte.";
    return;
  }

  try {
    const last4Digits = cardNumberInput.value.replace(/\s/g, '').slice(-4);
    const [expMonth, expYear] = expiryInput.value.split('/');

    const savedCardData = {
      cardName: cardNameInput.value,
      last4: last4Digits,
      expiryMonth: parseInt(expMonth),
      expiryYear: parseInt(expYear),
      savedAt: serverTimestamp() // Ajoute un timestamp
    };

    const savedCardsCollectionRef = collection(db, 'users', authStore.user.uid, 'savedCards');
    await addDoc(savedCardsCollectionRef, savedCardData);
    
    showAddCardSuccess.value = "Carte ajoutée avec succès (démo) !";
    clearAddCardForm(); // Efface le formulaire après succès
    isAddCardFormVisible.value = false; // Cache le formulaire

  } catch (error) {
    console.error("Erreur lors de l'ajout de la carte (démo) :", error);
    showAddCardError.value = "Erreur lors de l'ajout de la carte (démo).";
  }
};

// --- Watchers pour le formatage des entrées du nouveau formulaire ---
watch(() => expiryInput.value, (newValue) => {
  let cleaned = newValue.replace(/\D/g, ''); // Supprime les non-chiffres
  if (cleaned.length > 2) {
    cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }
  expiryInput.value = cleaned.slice(0, 5); // Limite à MM/AA
});

watch(() => cardNumberInput.value, (newValue) => {
  let cleaned = newValue.replace(/\s/g, ''); // Supprime les espaces existants
  let formatted = '';
  for (let i = 0; i < cleaned.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += cleaned[i];
  }
  cardNumberInput.value = formatted.slice(0, 19); // Max 19 caractères avec espaces
});


// --- Fetch et initialise les données du formulaire ---
watchEffect(() => {
  if (authStore.userData) {
    form.value.firstname = authStore.userData.firstname || '';
    form.value.username = authStore.userData.username || '';
    form.value.billingAddress = {
      street: authStore.userData.billingAddress?.street || '',
      city: authStore.userData.billingAddress?.city || '',
      postalCode: authStore.userData.billingAddress?.postalCode || '',
      country: authStore.userData.billingAddress?.country || '',
    };
  }
});

// --- Gère la mise à jour du profil ---
async function handleUpdateProfile() {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const dataToUpdate = {
      firstname: form.value.firstname,
      username: form.value.username,
      billingAddress: form.value.billingAddress,
      displayName: `${form.value.firstname} ${form.value.username}`
    };
    
    await authStore.updateUserProfile(dataToUpdate);
    successMessage.value = "Vos informations ont été mises à jour avec succès !";
  } catch (e) {
    errorMessage.value = "Une erreur est survenue lors de la mise à jour.";
    console.error("Erreur de mise à jour du profil:", e);
  }
}

// --- Gère la suppression de compte ---
async function handleDeleteAccount() {
  errorMessage.value = '';
  if (!confirm("Êtes-vous absolument certain de vouloir supprimer votre compte ? Cette action est irréversible.")) return;

  const providerId = authStore.user?.providerData[0]?.providerId;
  let password = null;

  if (providerId === 'password') {
      password = prompt("Pour confirmer la suppression, veuillez entrer votre mot de passe :");
      if (!password) {
        errorMessage.value = "La suppression a été annulée. Mot de passe non fourni.";
        return;
      }
  }

  try {
    await deleteUserAccount(password); 
    
    alert("Votre compte a été supprimé avec succès.");
    router.push('/');
    
  } catch (e) {
    console.error("Erreur lors de la suppression du compte:", e);
    if (e.code === 'auth/wrong-password') {
        errorMessage.value = "Mot de passe incorrect. La suppression a été annulée.";
    } else if (e.code === 'auth/popup-closed-by-user') {
        errorMessage.value = "La fenêtre de confirmation a été fermée. Suppression annulée.";
    } else {
        errorMessage.value = e.message || "Une erreur est survenue lors de la suppression.";
    }
  }
}

// --- Opérations Firestore pour les cartes simulées ---
const loadSavedCards = () => {
  if (authStore.user && authStore.user.uid) {
    const q = query(collection(db, 'users', authStore.user.uid, 'savedCards'));
    unsubscribeSavedCards = onSnapshot(q, (snapshot) => {
      savedCards.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }, (error) => {
      console.error("Erreur lors du chargement des cartes (démo) :", error);
      errorMessage.value = "Erreur lors du chargement des cartes enregistrées.";
    });
  } else {
    savedCards.value = [];
  }
};

const removeSavedCard = async (cardId) => {
  errorMessage.value = '';
  successMessage.value = '';
  if (confirm("Voulez-vous vraiment supprimer cette carte enregistrée (démo) ?")) {
    try {
      await deleteDoc(doc(db, 'users', authStore.user.uid, 'savedCards', cardId));
      successMessage.value = "Carte supprimée avec succès (démo).";
    } catch (error) {
      console.error("Erreur lors de la suppression de la carte (démo) :", error);
      errorMessage.value = "Erreur lors de la suppression de la carte (démo).";
    }
  }
};

// --- Navigation ---
function goBack() { 
  router.back(); 
}

// --- Hooks de cycle de vie ---
onMounted(() => {
  if (authStore.isLoggedIn) {
    loadSavedCards();
  }

  watchEffect(() => {
    if (authStore.isLoggedIn) {
      loadSavedCards();
    } else {
      if (unsubscribeSavedCards) {
        unsubscribeSavedCards();
        unsubscribeSavedCards = null;
      }
      savedCards.value = [];
    }
  });
});

onUnmounted(() => {
  if (unsubscribeSavedCards) {
    unsubscribeSavedCards();
  }
});
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

/* Styles pour les onglets de navigation */
.nav-tabs {
  border-bottom: none; /* Supprime la bordure inférieure par défaut de Bootstrap */
}

.nav-tabs .nav-item {
  margin-bottom: 0;
}

.nav-tabs .nav-link {
  color: var(--text-one); /* Couleur par défaut des liens */
  border: none;
  border-radius: 0;
  padding: 0.75rem 1.25rem;
  transition: all 0.3s ease;
  background-color: transparent;
  position: relative; /* Pour l'indicateur d'onglet actif */
}

.nav-tabs .nav-link:hover {
  color: var(--text-high-contrast);
  background-color: var(--interactive-comp-two);
  border-color: transparent;
}

.nav-tabs .nav-link.active {
  color: var(--text-high-contrast);
  background-color: var(--background-two); /* Correspond au fond du corps de la carte */
  border-color: var(--border-separator-one);
  border-bottom-color: var(--background-two); /* Cache la bordure inférieure quand l'onglet est actif */
  font-weight: 600;
}

/* Indicateur d'onglet actif */
.nav-tabs .nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -1px; /* Chevauche la bordure du corps de la carte */
  left: 0;
  width: 100%;
  height: 3px; /* Épaisseur du surlignement */
  background-color: var(--solid-one); /* Couleur du surlignement */
  border-radius: 2px;
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

.card-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.saved-card-item {
    background-color: var(--interactive-comp-one);
    border: 1px solid var(--border-separator-three);
    border-radius: 8px;
    color: var(--text-one);
}

.saved-card-item .card-body {
    padding: 1rem;
}

.card-display {
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
    font-size: 1rem;
    color: var(--text-two);
}

/* Styles pour le formulaire d'ajout de carte */
.add-card-form {
  background-color: var(--background-two);
  border: 1px solid var(--border-separator-one);
  border-radius: 15px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>