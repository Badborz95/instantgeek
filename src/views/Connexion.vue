<template>
  <div class="login-page-wrapper vh-100 d-flex align-items-center justify-content-center">
    <div class="login-card-container d-flex shadow-lg">
      <div class="login-form-section p-4 d-flex flex-column justify-content-center align-items-center text-center">
        <h2 class="login-title mb-4">Se connecter</h2>

        <div v-if="errorMessage" class="alert alert-danger w-100 mb-3">{{ errorMessage }}</div>

        <div class="social-icons d-flex justify-content-center w-100 mb-4">
          <button @click="handleGoogleSignIn" class="btn social-icon-btn google-btn me-3" aria-label="Se connecter avec Google">
            <i class="bi bi-google"></i>
          </button>
          <button @click="redirectToDiscord" class="btn social-icon-btn discord-btn me-3" aria-label="Se connecter avec Discord">
            <i class="bi bi-discord"></i>
          </button>
          <button @click="handleFacebookSignIn" class="btn social-icon-btn facebook-btn" aria-label="Se connecter avec Facebook">
            <i class="bi bi-facebook"></i>
          </button>
        </div>

        <div class="social-login-separator my-3">— ou —</div>

        <form @submit.prevent="handleLogin" class="w-100">
          <div class="form-group mb-3 text-start">
            <label for="email" class="form-label text-uppercase">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-control login-input"
              required
              aria-label="Email"
            />
          </div>
          <div class="form-group mb-4 text-start">
            <label for="password" class="form-label text-uppercase ">Mot de passe</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-control login-input"
              required
              aria-label="Mot de passe"
            />
          </div>
          <button type="submit" class="btn login-btn w-100">Se connecter</button>
        </form>

        <div class="d-flex justify-content-between w-100 mt-3 small-links">
          <router-link to="/inscription" class="text-decoration-none">
            J'ai besoin de compte ?
          </router-link>
          <a href="#" @click.prevent="handlePasswordReset" class="text-decoration-none">
            Mot de passe oublié ?
          </a>
        </div>
      </div>

      <div class="login-image-section d-none d-md-flex align-items-center justify-content-center p-0">
        <router-link to="/" class="close-button" aria-label="Retour à l'accueil">
          <i class="bi bi-x-lg"></i> </router-link>
        <img
          src="/assets/img/connexion.jpg"
          alt="Illustration de jeux vidéo"
          class="img-fluid login-background-image"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { signIn, signInWithGoogle, signInWithFacebook, sendPasswordResetEmail } from '../services/authService';
import { useRouter } from 'vue-router';
import '../style.css'; 

const email = ref('');
const password = ref('');
const router = useRouter();
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';
  try {
    await signIn(email.value, password.value);
    router.push('/');
  } catch (e) {
    console.error("Erreur de connexion:", e.code);
    errorMessage.value = 'Email ou mot de passe incorrect.';
  }
}

async function handleGoogleSignIn() {
  errorMessage.value = '';
  try {
    await signInWithGoogle();
    router.push('/');
  } catch (e) {
    console.error("Erreur avec Google:", e);
    errorMessage.value = 'Impossible de se connecter avec Google pour le moment.';
  }
}

async function handleFacebookSignIn() {
  errorMessage.value = '';
  try {
    await signInWithFacebook();
    router.push('/');
  } catch (e) {
    console.error("Erreur avec Facebook:", e);
    errorMessage.value = 'Impossible de se connecter avec Facebook. Veuillez vérifier la configuration.';
  }
}

function redirectToDiscord() {
    const clientId = "VOTRE_CLIENT_ID_DISCORD";
    const redirectUri = encodeURIComponent(window.location.origin + "/callback/discord"); 
    const scope = encodeURIComponent("identify email"); 
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    window.location.href = discordAuthUrl;
}

async function handlePasswordReset() {
  if (!email.value) {
    alert('Veuillez entrer votre adresse email dans le champ "Email" pour réinitialiser votre mot de passe.');
    return;
  }
  try {
    await sendPasswordResetEmail(email.value);
    alert('Un e-mail de réinitialisation de mot de passe a été envoyé à ' + email.value + '. Veuillez vérifier votre boîte de réception.');
  } catch (e) {
    alert('Erreur lors de l\'envoi de l\'e-mail de réinitialisation : ' + e.message);
  }
}
</script>

<style scoped>
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
  color: var(--text-high-contrast);
  margin-bottom: 3rem;
  letter-spacing: 2px;
}

.form-group {
  width: 100%;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text-high-contrast);
}

.login-input {
  background-color: var(--interactive-comp-two);
  border: 1px solid var(--border-separator-one);
  color: #fff;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
}

.login-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.login-input:focus {
  background-color: var(--interactive-comp-three);
  border-color: var(--border-separator-three);
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
    color: inherit;
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
  background-color: #012833;
  border: 1px solid #004a60;
  color: #fff;
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
  background-color: #004a60;
  border-color: #50A0BD;
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
  color: #50A0BD;
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