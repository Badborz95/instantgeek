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

<!-- Template pour le processus de panier -->
<template v-if="isOnCartProcessPage">
  <div class="navbar-center-content flex-grow-1 d-flex justify-content-center align-items-center">
    <div class="ig-stepper">
            
      <div class="step" :class="{ 'completed': currentStep > 1, 'active': currentStep === 1 }">
        <div class="step-circle">1</div>
        <div class="step-label d-none d-sm-block">Panier</div>
      </div>

      <div class="step-line" :class="{ 'completed': currentStep >= 2 }"></div>

      <div class="step" :class="{ 'completed': currentStep > 2, 'active': currentStep === 2 }">
        <div class="step-circle">2</div>
        <div class="step-label d-none d-sm-block">Paiement</div>
      </div>

      <div class="step-line" :class="{ 'completed': currentStep >= 3 }"></div>

      <div class="step" :class="{ 'completed': currentStep > 3, 'active': currentStep === 3 }">
        <div class="step-circle">3</div>
        <div class="step-label d-none d-sm-block">Validation</div>
      </div>

    </div>
  </div>

  <div class="secure-payment-cart d-none d-md-flex align-items-center ms-auto">
    <i class="bi bi-check-circle-fill secure-icon-cart me-2"></i>
    <div class="text-end">
      <span class="secure-text-cart d-block">Paiement sécurisé</span>
      <span class="ssl-text-cart d-block">SSL Secured</span>
    </div>
  </div>
</template>

<!-- Template pour toutes les autres pages -->
      <template v-else>
<!-- Barre de recherche mobile -->
        <form class="search-form-mobile d-lg-none" :class="{ 'active': isSearchActiveMobile }" @submit.prevent="performSearchMobile">
          <input 
            class="form-control me-2 search-input-mobile" 
            type="search" 
            placeholder="Rechercher..." 
            aria-label="Search"
            v-model="searchQuery"
            ref="searchInputMobileRef"
          >
          <button class="btn search-filter-btn-mobile" type="button" @click="goToSearch"><i class="bi bi-filter"></i></button>

          <button class="btn search-close-btn-mobile" type="button" @click="closeSearchInputMobile"><i class="bi bi-x-lg"></i></button>
        </form>

<!-- Liens de navigation centraux (PC) -->
        <ul class="navbar-nav d-none d-lg-flex position-absolute top-50 start-50 translate-middle">
          <li class="nav-item"><router-link class="nav-link" to="/nouveautes">Nouveautés</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/precommandes">Précommandes</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/prochaines-sorties">Prochaines sorties</router-link></li>
        </ul>   

<!-- Icônes et actions de droite -->
        <div class="d-flex align-items-center ms-auto">
          
          <transition name="fade">
            <button v-if="!isSearchActiveMobile" class="btn btn-outline-secondary d-lg-none search-icon-mobile" type="button" @click="toggleSearchInputMobile">
              <i class="bi bi-search navbar-icon"></i>
            </button>
          </transition>


          <transition name="fade">
            <button v-if="!isSearchActive" class="btn btn-outline-secondary d-none d-lg-block search-icon-desktop" type="button" @click="toggleSearchInput">
              <i class="bi bi-search navbar-icon"></i>
            </button>
          </transition>

          <form class="search-form d-none d-lg-flex" :class="{ 'active': isSearchActive }" @submit.prevent="performSearch" ref="searchFormRef">
            <input 
              class="form-control me-2 search-input" 
              type="search" 
              placeholder="Rechercher..." 
              aria-label="Search"
              v-model="searchQuery"
              ref="searchInputRef"
              @blur="handleSearchBlur"
            >
            <button v-if="isSearchActive" class="btn search-filter-btn" type="button" @click="goToSearch"><i class="bi bi-filter"></i></button>
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
              <li v-if="authStore.isLoggedIn"><router-link class="dropdown-item" to="/mes-achats">Mes achats</router-link></li>
              <li v-if="authStore.isLoggedIn"><router-link class="dropdown-item d-flex justify-content-between align-items-center" to="/wishlist">Wishlist <span class="badge bg-danger rounded-pill">{{ wishlistStore.wishlistCount }}</span></router-link></li>
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
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { signOut } from '../services/authService';
import { isDarkMode, toggleDarkMode } from '../composables/darkMode.js';
import { searchQuery } from '../composables/searchState.js';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useWishlistStore } from '../stores/wishlistStore';

// --- INIT ---
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();


const isProfileDropdownOpen = ref(false);
let profileDropdown = null;
const searchNavigationFlag = ref(false);

const isSearchActive = ref(false);
const searchInputRef = ref(null);
const searchFormRef = ref(null);

const isSearchActiveMobile = ref(false);
const searchInputMobileRef = ref(null);

const goToSearch = () =>{
  router.push({path: '/recherche'});
}
const executeSearch = () => {
  if (searchQuery.value.trim() !== '' && route.query.q !== searchQuery.value.trim()) {
    searchNavigationFlag.value = true;
    router.push({ path: '/recherche', query: { q: searchQuery.value } });
  }
};

const performSearch = () => { executeSearch(); };
const performSearchMobile = () => { executeSearch(); };


const toggleSearchInput = () => {
  isSearchActive.value = !isSearchActive.value;
  if (isSearchActive.value) {
    nextTick(() => searchInputRef.value?.focus());
  } else {
    searchQuery.value = '';
  }
};

const closeSearchInput = () => {
  isSearchActive.value = false;
  searchQuery.value = '';
};

const handleSearchBlur = () => {
  setTimeout(() => {
    if (searchFormRef.value && !searchFormRef.value.contains(document.activeElement)) {
      closeSearchInput();
    }
  }, 150);
};

const toggleSearchInputMobile = () => {
  isSearchActiveMobile.value = !isSearchActiveMobile.value;
  if (isSearchActiveMobile.value) {
    if (isProfileDropdownOpen.value) profileDropdown?.hide();
    nextTick(() => searchInputMobileRef.value?.focus());
  } else {
    searchQuery.value = '';
  }
};

const closeSearchInputMobile = () => {
  isSearchActiveMobile.value = false;
  searchQuery.value = '';
};

const handleLogout = async () => {
  try {
    await signOut();
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

// --- LIFECYCLE & WATCHERS ---
let unsubscribeWishlist = null;

onMounted(() => {
  if (route.path === '/recherche' && route.query.q) {
    searchQuery.value = route.query.q;
  }
  const profileDropdownElement = document.getElementById('navbarDropdownProfile');
  if (profileDropdownElement) {
    profileDropdown = new Dropdown(profileDropdownElement);
    profileDropdownElement.addEventListener('show.bs.dropdown', () => isProfileDropdownOpen.value = true);
    profileDropdownElement.addEventListener('hide.bs.dropdown', () => isProfileDropdownOpen.value = false);
  }
});

watch(searchQuery, (newValue) => {
  if (newValue.trim() !== '') {
    executeSearch();
  } else if (route.path === '/recherche') {
    router.push('/');
  }
});

watch(() => route.fullPath, (newPath, oldPath) => {
  if (newPath === oldPath) return;

  if (searchNavigationFlag.value) {
    nextTick(() => {
      if (isSearchActive.value && searchInputRef.value) {
        searchInputRef.value.focus();
      } else if (isSearchActiveMobile.value && searchInputMobileRef.value) {
        searchInputMobileRef.value.focus();
      }
    });
    searchNavigationFlag.value = false;
  } 
  else {
    if (isProfileDropdownOpen.value) profileDropdown?.hide();
    if (isSearchActive.value) closeSearchInput();
    if (isSearchActiveMobile.value) closeSearchInputMobile();
  }
}, { flush: 'post' });

const isOnCartProcessPage = computed(() => ['/panier', '/paiement', '/validation'].includes(route.path));
const currentStep = computed(() => {
  switch (route.path) {
    case '/panier': return 1;
    case '/paiement': return 2;
    case '/validation': return 3;
    default: return 0;
  }
});
</script>

<style scoped>
.navbar {
  background-color: var(--background-two)!important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1030; 
  position: sticky;
  top: 0;
  border-bottom: 1px solid var(--border-separator-one);
}
.navbar-icon {
  font-size: 1.6rem;
  vertical-align: middle;
}
.nav-link {
  font-weight: 500;
  color: var(--text-one) !important;
  margin: 0 0.5rem;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
}

/* --- ANIMATION DE FONDU --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- BARRE DE RECHERCHE PC --- */
.search-icon-desktop {
  margin-right: 0.5rem;
  background-color: transparent;
  border: none;
  color: var(--text-one) !important;
  padding: 0.5rem;
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
  background-color: var(--interactive-comp-one) !important;
  color: var(--text-one) !important;
  border-color: var(--border-separator-one) !important;
  height: calc(1.5em + 0.75rem + 2px); 
  padding-right: 5rem;
}
.search-form .btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  padding: 0 0.5rem;
  font-size: 1.2rem;
}
.search-form .search-submit-btn {
  right: 2.5rem;
  color: var(--text-one);
}
.search-form .search-close-btn {
  right: 0.5rem;
  color: var(--solid-one);
}

.search-form .search-filter-btn {
  right: 2.4rem;
  color: var(--solid-one);
  font-size: 1.8rem;
}

/* === BLOC DE STYLE MODIFIÉ POUR LA RECHERCHE MOBILE === */
.search-icon-mobile {
    background-color: transparent;
    border: none;
    color: var(--text-one) !important;
    padding: 0.5rem;
}
.search-form-mobile {
  position: absolute; /* Ancrage à la navbar parente */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; /* Couvre uniquement la hauteur de la navbar */
  display: flex;
  align-items: center;
  background-color: var(--background-two); /* Même fond que la navbar */
  z-index: 100; 
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease; /* Animation simple de fondu */
  padding: 0 1rem; 
}
.search-form-mobile.active {
  opacity: 1;
  visibility: visible;
}
.search-input-mobile {
  flex-grow: 1;
  background-color: var(--interactive-comp-one) !important;
  color: var(--text-one) !important;
  border-color: var(--border-separator-one) !important;
}
.search-form-mobile .search-submit-btn {
  color: var(--text-one);
  margin-left: -2.5rem;
  z-index: 5;
  background: transparent;
  border: none;
}
.search-close-btn-mobile {
  background-color: transparent;
  border: none;
  color: var(--solid-one);
  font-size: 1.5rem;
  margin-left: 0.75rem; 
}

.search-filter-btn-mobile {
  background-color: transparent;
  border: none;
  color: var(--solid-one);
  font-size: 1.8rem;
  margin-left: 0.5rem; 
  background-color: transparent;
  border: none;
  color: var(--solid-one);
  font-size: 1.5rem;
  margin-left: 0.75rem; 
}
/* === FIN DU BLOC MODIFIÉ === */

/* --- DROPDOWN PROFIL --- */
.dropdown-toggle-no-caret::after { display: none !important; }
.profile-dropdown-menu {
  background-color: var(--interactive-comp-two); 
  border: 1px solid var(--border-separator-one); 
  border-radius: 8px; 
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); 
  min-width: 220px; 
  padding: 0.5rem 0; 
}
.profile-dropdown-menu .dropdown-item {
  color: var(--text-one); 
  padding: 0.75rem 1.25rem; 
  transition: background-color 0.2s ease, color 0.2s ease;
}
.profile-dropdown-menu .dropdown-item:hover,
.profile-dropdown-menu .dropdown-item:focus {
  background-color: var(--interactive-comp-three); 
  color: var(--text-two); 
}

/* --- STEPPER DE PAIEMENT --- */
.ig-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
.step {
  display: flex;
  align-items: center;
  color: var(--solid-one);
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
  margin-right: 0.75rem;
  border: 2px solid var(--solid-one);
  background-color: transparent;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
.step-label {
  font-weight: 500;
}
.step-line {
  flex-grow: 1;
  height: 2px;
  background-color: var(--solid-one);
  margin: 0 1.5rem;
  transition: background-color 0.3s ease;
}
.step.active, .step.completed {
  color: var(--text-two);
}
.step.active .step-circle, .step.completed .step-circle {
  background-color: var(--text-one);
  border-color: var(--text-one);
  color: var(--background-two);
}
.step-line.completed {
  background-color: var(--text-one);
}

@media (max-width: 767.98px) {
  .ig-stepper {
    max-width: 100%; 
    padding: 0 1rem;
  }

  .step-circle {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
    margin-right: 0.5rem;
  }

  .step-line {
    margin: 0 0.5rem;
  }

  @media (max-width: 575.98px) {
    .step-circle {
      margin-right: 0;
    }
  }
}

</style>