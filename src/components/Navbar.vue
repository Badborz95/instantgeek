<template>
  <nav class="navbar navbar-expand-lg shadow-sm">
    <div class="container-fluid">
      <router-link class="navbar-brand fw-bold me-auto" to="/">
        <img
          src="/assets/img/Logo.png"
          alt="Logo"
          width="150"
          height="50"
          class="d-inline-block align-text-top"
        >
      </router-link>

      <template v-if="isOnCartProcessPage">
        <div class="navbar-center-content flex-grow-1 d-flex justify-content-center align-items-center">
          
          <div class="ig-stepper">
            <div class="step" :class="{ 'completed': currentStep > 1, 'active': currentStep === 1 }">
              <div class="step-circle">1</div>
              <div class="step-label">Panier</div>
            </div>
            
            <div class="step-line" :class="{ 'completed': currentStep >= 2 }"></div>

            <div class="step" :class="{ 'completed': currentStep > 2, 'active': currentStep === 2 }">
              <div class="step-circle">2</div>
              <div class="step-label">Paiement</div>
            </div>
            
            <div class="step-line" :class="{ 'completed': currentStep >= 3 }"></div>
            
            <div class="step" :class="{ 'completed': currentStep > 3, 'active': currentStep === 3 }">
              <div class="step-circle">3</div>
              <div class="step-label">Validation</div>
            </div>
          </div>
          </div>
        <div class="secure-payment-cart d-flex align-items-center ms-auto">
          <i class="bi bi-check-circle-fill secure-icon-cart me-2"></i>
          <div class="text-end">
            <span class="secure-text-cart d-block">Paiement sécurisé</span>
            <span class="ssl-text-cart d-block">SSL Secured</span>
          </div>
        </div>
      </template>

      <template v-else>
        <form class="search-form-mobile-overlay d-lg-none" :class="{ 'active': isSearchActiveMobile }" @submit.prevent="performSearchMobile">
            <input 
                class="form-control me-2 search-input-mobile-overlay" 
                type="search" 
                placeholder="Rechercher..." 
                aria-label="Search"
                v-model="searchTermMobile"
                ref="searchInputMobileRef"
            >
            <button class="btn search-submit-btn" type="submit"><i class="bi bi-search"></i></button>
            <button class="btn search-close-btn-mobile-overlay" type="button" @click="closeSearchInputMobile"><i class="bi bi-x-lg"></i></button>
        </form>

        <ul class="navbar-nav d-none d-lg-flex position-absolute top-50 start-50 translate-middle">
          <li class="nav-item"><router-link class="nav-link" to="/nouveautes">Nouveautés</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/precommandes">Précommandes</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/prochaines-sorties">Prochaines sorties</router-link></li>
        </ul>

        <div class="d-flex align-items-center ms-auto">
          
          <transition name="fade">
            <button v-if="!isSearchActiveMobile" class="btn btn-outline-secondary d-lg-none search-icon-mobile" type="button" @click="toggleSearchInputMobile">
              <i class="bi bi-search navbar-icon"></i>
            </button>
          </transition>

          <transition name="fade">
            <button v-if="!isSearchActive" key="search-icon" class="btn btn-outline-secondary d-none d-lg-block search-icon-desktop" type="button" @click="toggleSearchInput">
              <i class="bi bi-search navbar-icon"></i>
            </button>
          </transition>

          <form class="search-form d-none d-lg-flex" :class="{ 'active': isSearchActive }" @submit.prevent="performSearch" ref="searchFormRef">
              <input 
                  class="form-control me-2 search-input" 
                  type="search" 
                  placeholder="Rechercher..." 
                  aria-label="Search"
                  v-model="searchTerm"
                  ref="searchInputRef"
                  @blur="handleSearchBlur"
              >
              <button class="btn search-submit-btn" type="submit"><i class="bi bi-search"></i></button>
              <button v-if="isSearchActive" class="btn search-close-btn" type="button" @click="closeSearchInput"><i class="bi bi-x-lg"></i></button>
          </form>

          <div class="nav-item dropdown">
            <a class="nav-link text ms-2 dropdown-toggle-no-caret" href="#" id="navbarDropdownProfile" role="button" data-bs-toggle="dropdown" aria-expanded="false" @click="toggleProfileDropdown">
              <i v-if="authStore.isLoggedIn" class="bi bi-person-fill connected-profile-icon navbar-icon"></i>
              <i v-else class="bi bi-person-circle navbar-icon"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end profile-dropdown-menu" aria-labelledby="navbarDropdownProfile" :class="{ 'show': isProfileDropdownOpen }">
                <li v-if="authStore.isLoggedIn"><span class="dropdown-header">Bienvenue, {{ authStore.currentUsername }}!</span><hr class="dropdown-divider"></li>
                <li class="d-lg-none"><router-link class="dropdown-item" to="/nouveautes">Nouveautés</router-link></li>
                <li class="d-lg-none"><router-link class="dropdown-item" to="/precommandes">Précommandes</router-link></li>
                <li class="d-lg-none"><router-link class="dropdown-item" to="/prochaines-sorties">Prochaines sorties</router-link></li>
                <li class="d-lg-none" v-if="!authStore.isLoggedIn"><hr class="dropdown-divider"></li>
                <li><router-link class="dropdown-item" to="/support">Support 24/7</router-link></li>
                <li v-if="authStore.isLoggedIn"><router-link class="dropdown-item" to="/mes-achats">Mes achats</router-link></li>
                <li v-if="authStore.isLoggedIn"><router-link class="dropdown-item d-flex justify-content-between align-items-center" to="/wishlist">Wishlist <span v-if="authStore.userWishlistCount !== null" class="badge bg-danger rounded-pill">{{ authStore.userWishlistCount }}</span><span v-else class="badge bg-danger rounded-pill">0</span></router-link></li>
                <li v-if="authStore.isLoggedIn"><router-link class="dropdown-item" to="/parametres">Paramètres</router-link></li>
                <li v-if="authStore.isLoggedIn"><hr class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item d-flex justify-content-between align-items-center" @click.stop="toggleDarkMode">
                    <span>{{ isDarkMode ? 'Mode clair' : 'Mode sombre' }}</span>
                    <i :class="isDarkMode ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'"></i>
                  </button>
                </li>
                <li v-if="authStore.isLoggedIn"><hr class="dropdown-divider"></li>
                <li><router-link v-if="!authStore.isLoggedIn" class="dropdown-item custom-auth-link" to="/connexion">Se connecter</router-link><a v-else class="dropdown-item custom-auth-link" href="#" @click.prevent="handleLogout">Déconnexion</a></li>
            </ul>
          </div>
          <router-link class="nav-link text ms-2" to="/panier"><i class="bi bi-cart3 navbar-icon"></i></router-link>
        </div>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { Dropdown } from 'bootstrap';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore'; 
import { signOut } from '../services/authService'; 
import { doc, onSnapshot } from 'firebase/firestore'; 
import { db } from '../firebase'; 

const route = useRoute();
const authStore = useAuthStore(); 
const isDarkMode = ref(true); 
const isProfileDropdownOpen = ref(false); 
let profileDropdown = null; 
let unsubscribeWishlist = null; 
const isSearchActive = ref(false); 
const searchTerm = ref('');
const searchInputRef = ref(null);
const searchFormRef = ref(null);
const toggleSearchInput = () => {
  isSearchActive.value = !isSearchActive.value;
  if (isSearchActive.value) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  } else {
    searchTerm.value = '';
  }
};
const closeSearchInput = () => {
  isSearchActive.value = false;
  searchTerm.value = '';
};
const performSearch = () => {
  if (!searchTerm.value) return;
  console.log("Recherche PC lancée pour :", searchTerm.value);
  closeSearchInput();
};
const handleSearchBlur = () => {
  setTimeout(() => {
    if (searchFormRef.value && !searchFormRef.value.contains(document.activeElement)) {
      closeSearchInput();
    }
  }, 150);
};
const isSearchActiveMobile = ref(false);
const searchTermMobile = ref('');
const searchInputMobileRef = ref(null);
const toggleSearchInputMobile = () => {
  isSearchActiveMobile.value = !isSearchActiveMobile.value;
  if (isSearchActiveMobile.value) {
    if (isProfileDropdownOpen.value && profileDropdown) profileDropdown.hide();
    nextTick(() => searchInputMobileRef.value?.focus());
  } else {
    searchTermMobile.value = '';
  }
};
const closeSearchInputMobile = () => {
  isSearchActiveMobile.value = false;
  searchTermMobile.value = '';
};
const performSearchMobile = () => {
  if (!searchTermMobile.value) return;
  console.log("Recherche Mobile lancée pour :", searchTermMobile.value);
  closeSearchInputMobile();
};
const handleLogout = async () => {
  try {
    await signOut(); 
    console.log("Déconnexion réussie !");
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
  }
};
const toggleProfileDropdown = () => {
  if (profileDropdown) {
    isProfileDropdownOpen.value ? profileDropdown.hide() : profileDropdown.show();
  }
  if (isSearchActiveMobile.value) closeSearchInputMobile();
};
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.body.classList.toggle('dark-mode', isDarkMode.value);
};
onMounted(() => {
  const profileDropdownElement = document.getElementById('navbarDropdownProfile');
  if (profileDropdownElement) {
    profileDropdown = new Dropdown(profileDropdownElement);
    profileDropdownElement.addEventListener('show.bs.dropdown', () => isProfileDropdownOpen.value = true);
    profileDropdownElement.addEventListener('hide.bs.dropdown', () => isProfileDropdownOpen.value = false);
  }
  document.body.classList.toggle('dark-mode', isDarkMode.value);
});
const isOnCartProcessPage = computed(() => ['/panier', '/paiement', '/validation'].includes(route.path));
const currentStep = computed(() => {
  switch (route.path) {
    case '/panier': return 1;
    case '/paiement': return 2;
    case '/validation': return 3;
    default: return 0;
  }
});
watch(route, () => {
  if (isProfileDropdownOpen.value && profileDropdown) profileDropdown.hide();
  if (isSearchActive.value) closeSearchInput();
  if (isSearchActiveMobile.value) closeSearchInputMobile();
});
watch(() => authStore.user, (newUser) => {
  if (unsubscribeWishlist) unsubscribeWishlist();
  if (newUser) {
    const wishlistDocRef = doc(db, 'users', newUser.uid, 'privateData', 'wishlist');
    unsubscribeWishlist = onSnapshot(wishlistDocRef, (docSnap) => {
      authStore.userWishlistCount = docSnap.exists() && docSnap.data().items ? docSnap.data().items.length : 0;
    }, (error) => {
      console.error("Erreur d'écoute wishlist:", error);
      authStore.userWishlistCount = 0;
    });
  } else {
    authStore.userWishlistCount = null;
  }
}, { immediate: true });
</script>

<style scoped>
/* Styles pour l'animation de fondu */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- Barre de recherche PC --- */
.search-icon-desktop {
  margin-right: 0.5rem;
}
.search-form {
  display: flex; 
  align-items: center;
  position: relative; 
  width: 0; 
  opacity: 0;
  overflow: hidden; 
  transition: width 0.3s ease-out, opacity 0.3s ease-out;
  flex-shrink: 0; 
  margin-right: 0.5rem; 
}
.search-form.active {
  width: 280px; 
  opacity: 1;
}
.search-input {
  flex-grow: 1;
  background-color: var(--background-three) !important;
  color: var(--text-one) !important;
  border-color: var(--border-separator-one) !important;
  height: calc(1.5em + 0.75rem + 2px); 
  padding-right: 5rem;
}

.search-form .search-submit-btn,
.search-form .search-close-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  padding: 0 0.5rem;
  font-size: 1.2rem;
  transition: right 0.3s ease;
}
.search-form .search-submit-btn {
  right: 0.5rem;
  color: var(--text-one);
}
.search-form.active .search-submit-btn {
  right: 2.5rem;
  color: var(--highlight-color);
}
.search-form .search-close-btn {
  right: 0.5rem;
  color: var(--danger-color);
}

/* --- Styles pour la recherche MOBILE (overlay) --- */
.search-form-mobile-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-two); 
  z-index: 1031; 
  opacity: 0;
  visibility: hidden;
  transform: translateY(-20%); /* Commence un peu plus haut */
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
  padding: 0 1rem; 
}
.search-form-mobile-overlay.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.search-input-mobile-overlay {
  flex-grow: 1;
  background-color: var(--background-three) !important;
  color: var(--text-one) !important;
  border-color: var(--border-separator-one) !important;
}
.search-close-btn-mobile-overlay {
  background-color: transparent;
  border: none;
  color: var(--danger-color);
  font-size: 1.5rem;
  margin-left: 0.75rem; 
}
.search-form-mobile-overlay .search-submit-btn {
  color: var(--text-one);
  margin-left: -2.5rem;
  z-index: 5;
}

/* --- Styles Généraux --- */
.navbar-icon {
  font-size: 1.6rem;
  vertical-align: middle;
}
.navbar {
  background-color: var(--background-two)!important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative; 
  z-index: 1030; 
}
.nav-link {
  font-weight: 500;
  color: var(--text-one) !important;
  margin: 0 0.5rem;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
}
.nav-link:hover,
.nav-link.active {
  color: #BEEDFF;
}
.search-icon-mobile,
.search-icon-desktop {
  background-color: transparent;
  border: none;
  color: var(--text-one) !important;
  padding: 0.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
}
.search-icon-mobile:hover,
.search-icon-desktop:hover { color: #BEEDFF !important; }

/* Styles du menu dropdown et autres... */
.dropdown-toggle-no-caret::after { display: none !important; }
.profile-dropdown-menu {
  background-color: var(--interactive-comp-two); 
  border: none; 
  border-radius: 8px; 
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4); 
  min-width: 200px; 
  padding: 0.5rem 0; 
}
.profile-dropdown-menu .dropdown-item {
  color: var(--text-one); 
  padding: 0.75rem 1.25rem; 
  transition: background-color 0.2s ease, color 0.2s ease;
}
.profile-dropdown-menu .dropdown-item:hover,
.profile-dropdown-menu .dropdown-item:focus {
  background-color: var(--background-three); 
  color: var(--highlight-color); 
}
/* --- STYLES POUR LE STEPPER DE PAIEMENT STYLE INSTANT GAMING --- */

.ig-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px; /* Limite la largeur pour un meilleur aspect */
  margin: 0 auto; /* Centre le stepper */
}

.step {
  display: flex;
  align-items: center;
  /* La couleur par défaut est celle des étapes non actives */
  color: var(--text-secondary, #868e96); 
  transition: color 0.3s ease;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  margin-right: 0.75rem;
  /* Style par défaut : un simple cercle gris */
  border: 2px solid var(--text-secondary, #868e96);
  background-color: transparent;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.step-label {
  font-size: 1rem;
  font-weight: 500;
}

.step-line {
  flex-grow: 1;
  height: 2px;
  background-color: var(--text-secondary, #868e96);
  margin: 0 1.5rem; /* Espace la ligne des étapes */
  transition: background-color 0.3s ease;
}


/* --- GESTION DES ÉTATS ACTIFS ET COMPLÉTÉS --- */

/* Style pour une étape ACTIVE (celle en cours) */
.step.active {
  color: var(--text-one, #ffffff); /* Texte blanc/brillant */
}

.step.active .step-circle {
  background-color: var(--text-one, #ffffff);
  border-color: var(--text-one, #ffffff);
  color: var(--background-two, #121212); /* Texte noir sur fond blanc */
}

/* Style pour une étape COMPLÉTÉE (les précédentes) */
.step.completed {
    color: var(--text-one, #ffffff); /* Le texte reste blanc */
}
.step.completed .step-circle {
    /* Le cercle reste blanc, comme pour une étape active */
    background-color: var(--text-one, #ffffff);
    border-color: var(--text-one, #ffffff);
    color: var(--background-two, #121212);
}

/* Style pour une ligne COMPLÉTÉE */
.step-line.completed {
  background-color: var(--text-one, #ffffff); /* La ligne devient blanche */
}
</style>