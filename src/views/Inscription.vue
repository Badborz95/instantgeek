<template>
  <div class="login-page-wrapper vh-100 d-flex align-items-center justify-content-center">
    <div class="login-card-container d-flex shadow-lg">
      <div class="login-form-section p-4 d-flex flex-column justify-content-center align-items-center text-center">
        <h1 class="login-title mb-4 text-white">inscription</h1>

        <form @submit.prevent="handleSignUp" class="w-100">
          <div class="form-group mb-3 text-start">
            <label for="email" class="form-label text-uppercase text-white-50">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-control login-input"
              required
              aria-label="Email"
            />
          </div>
          <div class="form-group mb-3 text-start">
            <label for="password" class="form-label text-uppercase text-white-50">Mot de passe</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-control login-input"
              required
              aria-label="Mot de passe"
            />
          </div>
          <div class="form-group mb-3 text-start">
            <label for="username" class="form-label text-uppercase text-white-50">Nom</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-control login-input"
              required
              aria-label="Nom d'utilisateur"
            />
          </div>
          <div class="form-group mb-3 text-start">
            <label for="firstname" class="form-label text-uppercase text-white-50">Prénom</label>
            <input
              id="firstname"
              v-model="firstname"
              type="text"
              class="form-control login-input"
              required
              aria-label="Prénom"
            />
          </div>

          <div class="form-group mb-3 text-start">
            <label for="birthdate" class="form-label text-uppercase text-white-50">Date de naissance</label>
            <input
              id="birthdate"
              v-model="birthdate"
              type="date"
              class="form-control login-input"
              required
              aria-label="Date de naissance"
            />
          </div>

          <div class="form-group mb-4 text-start">
            <label for="country" class="form-label text-uppercase text-white-50">Pays</label>
            <select
              id="country"
              v-model="country"
              class="form-control login-input"
              required
              aria-label="Pays"
            >
              <option disabled value="">Veuillez sélectionner un pays</option>
              <option v-for="c in countriesList" :key="c.cca3" :value="c.name.common">
                {{ c.name.common }}
              </option>
            </select>
          </div>
          
          <button type="submit" class="btn login-btn w-100">valider</button>
        </form>

        <div class="d-flex justify-content-center w-100 mt-4 small-links">
          <router-link to="/connexion" class="text-decoration-none text-white-50">
            <i class="bi bi-arrow-left me-2"></i> RETOUR
          </router-link>
        </div>

        </div>

      <div class="login-image-section d-none d-md-flex align-items-center justify-content-center p-0">
        <router-link to="/" class="close-button" aria-label="Retour à l'accueil">
          <i class="bi bi-x-lg"></i> </router-link>
        <img
          src="/assets/img/inscription.jpg"
          alt="Illustration de jeux vidéo pour l'inscription"
          class="img-fluid login-background-image"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { signUp, signInWithGoogle } from '../services/authService';
import { useRouter } from 'vue-router';
// Les imports 'db', 'doc', 'setDoc' ne sont plus nécessaires ici car la logique est déplacée dans authService.js
// import { db } from '../firebase';
// import { doc, setDoc } from 'firebase/firestore';

const email = ref('');
const password = ref('');
const username = ref('');
const firstname = ref('');
const birthdate = ref('');
const country = ref('');


const countriesList = ref([]);

const router = useRouter();

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

onMounted(() => {
  fetchCountries();
});

async function handleSignUp() {

  const today = new Date();
  const birthDate = new Date(birthdate.value);
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  if (birthDate > eighteenYearsAgo) {
    alert('Vous devez avoir au moins 18 ans pour vous inscrire.');
    return; // Stoppe l'exécution de la fonction si l'utilisateur est mineur.
  }

  try {
    // Crée un objet userData avec toutes les informations collectées
    const userData = {
      username: username.value,
      firstname: firstname.value,
      birthdate: birthdate.value,
      country: country.value
    };

    // Passe l'objet userData à la fonction signUp
    const user = await signUp(email.value, password.value, userData);

    if (user && user.uid) {
      alert('Compte créé avec succès !');
      router.push('/');
    } else {
      // Cette erreur devrait être gérée par la fonction signUp si elle n'arrive pas à créer l'utilisateur
      throw new Error("Erreur inattendue lors de la création du compte.");
    }
  } catch (e) {
    alert('Erreur lors de l\'inscription : ' + e.message);
  }
}

async function handleGoogleSignIn() {
  try {
    // Pour Google, la création du document utilisateur et la fusion des données est gérée
    // directement dans _signInWithProvider de authService.js
    const user = await signInWithGoogle();
    if (user) {
      alert('Connexion Google réussie !');
      router.push('/');
    }
  } catch (e) {
    alert('Erreur avec Google : ' + e.message);
  }
}
</script>

<style scoped>
/* Votre style existant */
.login-page-wrapper {
  background-color: var(--background-one);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.login-card-container {
  width: 90%;
  max-width: 1300px;
  height: 780px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
}

.login-form-section {
  background-color: var(--interactive-comp-one);
  flex: 0 0 40%;
  padding: 40px !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.login-title {
  font-size: 2.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-high-contrast) !important;
  margin-bottom: 3rem;
  letter-spacing: 2px;
}

.form-group {
  width: 100%;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 100;
  margin-bottom: 0.25rem;
  color: var(--text-high-contrast) !important;
}

.login-input {
  background-color: var(--interactive-comp-two);
  border: 1px solid var(--border-separator-one);
  color: var(--text-high-contrast);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
}

.login-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.login-input:focus {
  background-color: var(--interactive-comp-three);
  border-color: var(--interactive-comp-four);
  box-shadow: 0 0 0 0.25rem rgba(80, 160, 189, 0.25);
  color: #fff;
}

.login-btn {
  background-color: var(--interactive-comp-three);
  border: none;
  color: var(--text-high-contrast);
  font-weight: bold;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  text-transform: uppercase;
  transition: background-color 0.3s ease;
  width: 100%;
}

.login-btn:hover {
  background-color: var(--interactive-comp-two);
  color: var(--text-high-contrast);
}

.small-links {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-high-contrast);
  margin-top: 1rem;
  width: 100%;
}

.small-links a {
    color: inherit !important;
}

.small-links a:hover {
  color: var(--text-one) !important;
}

.social-login-separator {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-high-contrast);
  margin: 1rem 0;
  width: 100%;
}

.social-icons {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
}

.social-icon-btn {
  background-color: var(--interactive-comp-one);
  border: 1px solid var(--border-separator-one);
  color: var(--text-high-contrast);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.social-icon-btn:hover {
  background-color: var(--interactive-comp-two);
  border-color: var(--interactive-comp-three);
}

.google-btn i { color: #DB4437; }
.discord-btn i { color: #7289DA; }
.facebook-btn i { color: #3b5998; }

.login-image-section {
  background-color: #F8F8F8;
  flex: 0 0 60%;
  border-radius: 0 15px 15px 0;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.close-button {
  position: absolute;
  top: 15px; 
  right: 15px;
  color: #fff;
  font-size: 1.8rem;
  text-decoration: none;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  width: 40px; 
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.6);
  color: var(--interactive-comp-four);
}

@media (max-width: 767.98px) {
  .login-card-container {
    flex-direction: column;
    min-height: auto;
    height: auto;
    border-radius: 15px;
    width: 95%;
  }

  .login-form-section {
    flex: 1 1 100%;
    border-radius: 15px;
    padding: 30px !important;
  }

  .login-image-section {
    display: none !important;
  }

  .login-title {
    font-size: 2.2rem;
  }
}

@media (min-width: 768px) and (max-width: 991.98px) {
  .login-card-container {
    max-width: 900px;
    height: 680px;
  }
  .login-form-section {
    flex: 0 0 45%;
  }
  .login-image-section {
    flex: 0 0 55%;
  }
}
</style>