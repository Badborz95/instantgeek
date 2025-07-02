import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Import Bootstrap (CSS + icons + JS)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './firebase'; 

// Importez vos stores
import { useAuthStore } from './stores/authStore'; 
import { useCartStore } from './stores/cartStore';

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

import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

app.use(Toast)


app.mount('#app');