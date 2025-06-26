import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Importez createPinia
import App from './App.vue';
import router from './router';

// Import Bootstrap (CSS + icons + JS)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Initialisation Firebase (déjà configuré dans ./firebase/index.js)
// L'import suffit, car votre fichier firebase/index.js gère l'initialisation.
import './firebase'; 

// Importez vos stores
import { useAuthStore } from './stores/authStore'; 
import { useCartStore } from './stores/cartStore'; // Si vous voulez charger le panier au démarrage

const app = createApp(App);
const pinia = createPinia(); // Créez l'instance Pinia

app.use(pinia);
app.use(router);

// Initialiser l'écouteur d'authentification
const authStore = useAuthStore();
authStore.initAuthListener();

// ✅ 2. Initialisez l'écouteur du panier
const cartStore = useCartStore();
cartStore.init(); // Cela va charger le panier et écouter les changements d'utilisateur

app.mount('#app');