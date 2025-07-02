<template>
  <div class="settings-page-wrapper">
    <div class="container-fluid py-5">
      <div class="row justify-content-center">
        <div class="col-lg-10 col-md-12">
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
                  <router-link class="nav-link" :class="{ active: currentTab === 'profile' }" to="/parametres?tab=profile">Informations Personnelles</router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" :class="{ active: currentTab === 'address' }" to="/parametres?tab=address">Adresse de Facturation</router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" :class="{ active: currentTab === 'cards' }" to="/parametres?tab=cards">Mes Cartes (Démo)</router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" :class="{ active: currentTab === 'danger' }" to="/parametres?tab=danger">Zone de Danger</router-link>
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
                    <label for="addressSearch" class="form-label">Rechercher une adresse</label>
                    <input type="text" id="addressSearch" class="form-control" placeholder="Entrez une adresse..." 
                           v-model="searchQuery" @input="debouncedAddressSearch">
                    <div v-if="addressSuggestions.length && searchQuery.length > 2" class="list-group mt-2">
                        <a href="#" class="list-group-item list-group-item-action" 
                           v-for="suggestion in addressSuggestions" :key="suggestion.place_id"
                           @click.prevent="selectAddressSuggestion(suggestion)">
                            {{ suggestion.display_name }}
                        </a>
                    </div>
                  </div>

                  <div class="mb-3 text-start">
                      <label for="country" class="form-label">Pays</label>
                      <select id="country" class="form-control" v-model="form.billingAddress.country">
                        <option value="">Sélectionnez un pays</option>
                        <option v-for="country in countries" :key="country.code" :value="country.name">{{ country.name }}</option>
                      </select>
                  </div>

                  <div class="mb-3 text-start">
                    <label for="street" class="form-label">Adresse (rue, etc.)</label>
                    <input type="text" id="street" class="form-control" placeholder="123 rue de la République" v-model="form.billingAddress.street">
                    <div v-if="currentTab === 'address' && !form.billingAddress.street && authStore.isLoggedIn" class="form-text text-danger">
                      Veuillez saisir le nom de la rue pour que l'adresse soit complète.
                    </div>
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
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { deleteUserAccount } from '../services/authService';
import { collection, query, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const router = useRouter();
const route = useRoute();
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
const isAddCardFormVisible = ref(false);
const showAddCardSuccess = ref('');
const showAddCardError = ref('');

const countries = ref([]);

const searchQuery = ref('');
const addressSuggestions = ref([]);
let searchTimeout = null; // Pour le debounce

// --- Validation du formulaire d'ajout de carte ---
const isAddCardFormValid = computed(() => {
  const [month, year] = expiryInput.value.split('/');
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  const isExpiryValid = month && year && 
                        parseInt(month) >= 1 && parseInt(month) <= 12 &&
                        parseInt(year) >= currentYear &&
                        (parseInt(year) > currentYear || parseInt(month) >= currentMonth);

  return cardNameInput.value.trim() !== '' &&
         cardNumberInput.value.replace(/\s/g, '').length === 16 &&
         isExpiryValid &&
         cvcInput.value.length >= 3 && cvcInput.value.length <= 4;
});

// --- Fonctions du formulaire d'ajout de carte ---
const openAddCardForm = () => {
  isAddCardFormVisible.value = true;
  clearAddCardForm();
  showAddCardSuccess.value = '';
  showAddCardError.value = '';
};

const closeAddCardForm = () => {
  isAddCardFormVisible.value = false;
  clearAddCardForm();
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
      savedAt: serverTimestamp()
    };

    const savedCardsCollectionRef = collection(db, 'users', authStore.user.uid, 'savedCards');
    await addDoc(savedCardsCollectionRef, savedCardData);
    
    showAddCardSuccess.value = "Carte ajoutée avec succès (démo) !";
    clearAddCardForm();
    isAddCardFormVisible.value = false;

  } catch (error) {
    console.error("Erreur lors de l'ajout de la carte (démo) :", error);
    showAddCardError.value = "Erreur lors de l'ajout de la carte (démo).";
  }
};

// --- Watchers pour le formatage des entrées du nouveau formulaire ---
watch(() => expiryInput.value, (newValue) => {
  let cleaned = newValue.replace(/\D/g, '');
  if (cleaned.length > 2) {
    cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }
  expiryInput.value = cleaned.slice(0, 5);
});

watch(() => cardNumberInput.value, (newValue) => {
  let cleaned = newValue.replace(/\s/g, '');
  let formatted = '';
  for (let i = 0; i < cleaned.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += cleaned[i];
  }
  cardNumberInput.value = formatted.slice(0, 19);
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

// --- Gestion des onglets via l'URL ---
watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    currentTab.value = newTab;
  }
}, { immediate: true });

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

// --- Fonction pour charger les pays via REST Countries API ---
const loadCountries = async () => {
  try {
    // REST Countries API pour tous les pays
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data = await response.json();
    countries.value = data
      .map(country => ({
        code: country.cca2,
        name: country.name.common // Utilise le nom commun du pays
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  } catch (error) {
    console.error("Erreur lors du chargement des pays via REST Countries API :", error);
    errorMessage.value = "Impossible de charger la liste des pays.";
  }
};

// --- OpenStreetMap Nominatim Autocomplete ---

const addressSearch = async () => {
  addressSuggestions.value = [];
  if (searchQuery.value.length < 3) { // Minimum 3 caractères pour la recherche
    return;
  }

  try {
    // API Nominatim d'OpenStreetMap
    // 'q' pour la requête de recherche, 'format=json' pour le format de réponse
    // 'limit=5' pour limiter le nombre de suggestions, 'addressdetails=1' pour plus de détails
    // 'countrycodes=fr' pour restreindre à la France (ajuster si besoin)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery.value)}&format=json&limit=5&addressdetails=1&countrycodes=fr`;
    const response = await fetch(url, {
      headers: {
        // Il est recommandé de fournir un User-Agent pour Nominatim
        // C'est souvent l'URL de votre application ou votre email
        'User-Agent': 'MonApplicationDeCompte/1.0 (votre_email@example.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data = await response.json();
    addressSuggestions.value = data;
  } catch (error) {
    console.error("Erreur lors de la recherche d'adresse via Nominatim :", error);
    errorMessage.value = "Erreur lors de la recherche d'adresse.";
  }
};

// Fonction de debounce pour la recherche d'adresse
const debouncedAddressSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    addressSearch();
  }, 300); // Délai de 300ms
};

const selectAddressSuggestion = (suggestion) => {
  // Réinitialiser les champs d'adresse pour éviter les restes d'anciennes sélections
  form.value.billingAddress.street = '';
  form.value.billingAddress.city = '';
  form.value.billingAddress.postalCode = '';
  form.value.billingAddress.country = '';

  const address = suggestion.address;

  // Logique améliorée pour le champ 'street'
  let streetPart = '';
  if (address.house_number && address.road) {
      streetPart = `${address.house_number} ${address.road}`;
  } else if (address.road) {
      streetPart = address.road;
  } else if (address.pedestrian) {
      streetPart = address.pedestrian;
  } else if (address.footway) {
      streetPart = address.footway;
  } else if (address.path) {
      streetPart = address.path;
  } else if (address.street) {
      streetPart = address.street;
  }

  if (!streetPart && suggestion.namedetails && suggestion.namedetails.name) {
      streetPart = suggestion.namedetails.name;
  }
  if (!streetPart && suggestion.display_name) {
      const parts = suggestion.display_name.split(',');
      if (parts.length > 0) {
          streetPart = parts[0].trim();
      }
  }
  form.value.billingAddress.street = streetPart;

  // Logique améliorée pour le champ 'city'
  form.value.billingAddress.city = address.city || address.town || address.village || address.hamlet || address.county || '';

  // Logique améliorée pour le champ 'postalCode'
  form.value.billingAddress.postalCode = address.postcode || '';

  // Fallback si postcode n'est pas directement dans address,
  // ou si Nominatim inclut le code postal dans display_name sans le détailler ailleurs.
  if (!form.value.billingAddress.postalCode && suggestion.display_name) {
      // Expression régulière pour trouver un code postal français (5 chiffres)
      const frPostalCodeMatch = suggestion.display_name.match(/\b(\d{5})\b/);
      if (frPostalCodeMatch) {
          form.value.billingAddress.postalCode = frPostalCodeMatch[1];
      }
      // Vous pouvez ajouter d'autres regex pour d'autres formats de codes postaux si nécessaire
  }


  // Logique pour le champ 'country'
  const matchedCountry = countries.value.find(c => c.code.toLowerCase() === address.country_code);
  if (matchedCountry) {
    form.value.billingAddress.country = matchedCountry.name;
  } else {
    form.value.billingAddress.country = address.country || '';
  }

  searchQuery.value = suggestion.display_name;
  addressSuggestions.value = [];
};


// --- Navigation ---
function goBack() {
  router.push('/');
}

// --- Hooks de cycle de vie ---
onMounted(() => {
  if (authStore.isLoggedIn) {
    loadSavedCards();
  }
  loadCountries(); // Charge les pays au montage du composant

  // Pas de script Google Maps à initialiser ici avec Nominatim
  
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
  clearTimeout(searchTimeout); // Nettoie le timeout de recherche
});
</script>

<style scoped>
.settings-page-wrapper {
  background-color: var(--background-one);
  min-height: 100vh;
  color: var(--text-one);
  padding-top: 2rem;
  padding-bottom: 2rem;
}
.card {
  background-color: var(--background-two);
  border: 1px solid var(--border-separator-one);
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  color: var(--text-one);
}

p{
  color: var(--text-one) !important;
  font-size: 1rem;
  line-height: 1.5;
}

.card-header {
  background-color: var(--interactive-comp-one);
  color: var(--text-high-contrast);
  border-bottom: 1px solid var(--border-separator-one);
  border-radius: 15px 15px 0 0;
  padding: 1.5rem;
  text-align: center;
}

/* Styles pour les onglets de navigation */
.nav-tabs {
  border-bottom: none;
}

.nav-tabs .nav-item {
  margin-bottom: 0;
}

.nav-tabs .nav-link {
  color: var(--text-one);
  border: none;
  border-radius: 0;
  padding: 0.75rem 1.25rem;
  transition: all 0.3s ease;
  background-color: transparent;
  position: relative;
}

.nav-tabs .nav-link:hover {
  color: var(--text-high-contrast);
  background-color: var(--interactive-comp-two);
  border-color: transparent;
}

.nav-tabs .nav-link.active {
  color: var(--text-high-contrast);
  background-color: var(--background-two);
  border-color: var(--border-separator-one);
  border-bottom-color: var(--background-two);
  font-weight: 600;
}

/* Indicateur d'onglet actif */
.nav-tabs .nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--solid-one);
  border-radius: 2px;
}


.card-body {
  padding: 2rem;
}

h1, h3, h4 {
  color: var(--text-high-contrast);
  font-weight: 600;
}

.form-label {
  color: var(--text-one);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
  background-color: var(--interactive-comp-one);
  border: 1px solid var(--border-separator-one);
  color: var(--text-high-contrast);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}
.form-control:focus, .form-select:focus {
  background-color: var(--interactive-comp-two);
  border-color: var(--solid-one);
  box-shadow: 0 0 0 0.25rem rgba(80, 160, 189, 0.25); /* Garder le shadow pour la visibilité du focus */
}

.form-control:disabled {
  background-color: var(--background-two);
  opacity: 0.7;
}

.form-text {
  color: var(--text-one);
  opacity: 0.8;
  font-size: 0.875em;
}

hr {
    border: none;
    height: 1px;
    background-color: var(--border-separator-two);
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
    background-color: var(--solid-one);
    color: var(--text-high-contrast); /* Ajusté pour le contraste avec solid-one */
}
.btn-primary:hover {
    background-color: var(--solid-two);
}

.btn-secondary {
    background-color: var(--interactive-comp-three);
    color: var(--text-high-contrast);
}
.btn-secondary:hover {
    background-color: var(--interactive-comp-two);
}

.alert {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 1rem;
    text-align: left;
}

.alert-danger {
    background-color: var(--background-one); /* Utilisation d'une couleur plus claire pour le fond de l'alerte danger */
    color: #dc3545; /* Laisser un rouge vif pour le texte danger */
    border-color: #dc3545;
}
.alert-danger h4 {
    color: #dc3545;
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
    background-color: var(--background-one); /* Similaire aux alertes Bootstrap */
    color: #198754;
    border-color: #198754;
}

.alert-warning {
    background-color: var(--background-one); /* Similaire aux alertes Bootstrap */
    color: #ffc107;
    border-color: #ffc107;
}

.alert-info {
    background-color: var(--background-one); /* Similaire aux alertes Bootstrap */
    color: #0dcaf0;
    border-color: #0dcaf0;
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

.list-group {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--border-separator-one);
    border-radius: 8px;
    background-color: var(--background-two);
    z-index: 1000;
    position: absolute;
    width: 100%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.list-group-item {
    background-color: var(--background-two);
    color: var(--text-one);
    border: none;
    border-bottom: 1px solid var(--border-separator-three);
    padding: 0.75rem 1rem;
    cursor: pointer;
}

.list-group-item:hover, .list-group-item:focus {
    background-color: var(--interactive-comp-two);
    color: var(--text-high-contrast);
}

.list-group-item:last-child {
    border-bottom: none;
}
</style>