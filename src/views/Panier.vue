<template>
  <Navbar />
  <div class="panier-container container py-5" id="main-content">
    <div class="row g-4 mt-4">
      <div class="col-lg-8">
        <div class="cart-items-list">
          <div v-if="cartStore.items.length === 0" class="empty-cart-message">
            <i class="bi bi-bag-fill empty-cart-icon"></i>
            <h3>Votre panier est vide.</h3>
            <p>Découvrez notre catalogue de jeux et remplissez votre collection !</p>
            <router-link to="/" class="btn btn-primary mt-3">Explorer le catalogue</router-link>
          </div>
          <div v-else v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-details">
              <h5 class="item-name">{{ item.name }}</h5>
              <p class="item-price-unit">{{ item.price }} €</p>
            </div>
            <div class="item-quantity-controls">
              <button class="btn-quantity" @click="cartStore.decreaseQuantity(item.id)">
                <i class="bi bi-dash"></i>
              </button>
              <span class="quantity-display">{{ item.quantity }}</span>
              <button class="btn-quantity" @click="cartStore.increaseQuantity(item.id)">
                <i class="bi bi-plus"></i>
              </button>
            </div>
            <div class="item-subtotal">
              <p class="mb-0">{{ (item.price * item.quantity).toFixed(2) }} €</p>
            </div>
            <button class="btn-delete" @click="cartStore.removeItem(item.id)">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="order-summary">
          <h3 class="summary-title">RÉSUMÉ DE LA COMMANDE</h3>
          
          <div class="summary-details mt-4">
            <div class="d-flex justify-content-between fw-bold summary-total-final">
              <span>TOTAL :</span>
              <span class="display-6">{{ cartStore.totalPrice }} €</span>
            </div>
            <p class="mt-3 text-muted small">*Livraison instantanée par clé numérique.</p>
          </div>

          <hr class="my-4">

          <div class="address-section">
            <h4 class="address-title">Adresse de facturation</h4>

            <div v-if="!authStore.isLoggedIn" class="address-box-action">
              <p>Veuillez vous <router-link to="/connexion">connecter</router-link> pour utiliser une adresse enregistrée.</p>
            </div>

            <div v-else-if="!authStore.hasCompleteBillingAddress" class="address-box-action">
              <p>Aucune adresse de facturation trouvée.</p>
              <router-link to="/parametres" class="btn btn-sm btn-outline-primary">
                Ajouter une adresse
              </router-link>
            </div>
            
            <div v-else class="address-box-saved">
                <div class="address-details">
                    <strong>{{ authStore.userData.firstname }} {{ authStore.userData.username }}</strong><br>
                    {{ authStore.billingAddress.street }}<br>
                    {{ authStore.billingAddress.postalCode }} {{ authStore.billingAddress.city }}<br>
                    {{ authStore.billingAddress.country }}
                </div>
                <router-link to="/parametres" class="edit-address-btn" aria-label="Modifier l'adresse">
                    <i class="bi bi-pencil-square"></i>
                </router-link>
            </div>
          </div>

          <hr class="my-4">

          <div class="payment-section">
            <h4 class="payment-title">Informations de paiement</h4>
            <form class="credit-card-form">
              <div class="mb-3">
                <label for="card-name" class="form-label">Nom sur la carte</label>
                <input type="text" id="card-name" class="form-control" v-model="cardDetails.name" required>
              </div>
              <div class="mb-3">
                <label for="card-number" class="form-label">Numéro de carte</label>
                <input type="text" id="card-number" class="form-control" placeholder="0000 0000 0000 0000" v-model="cardDetails.number" maxlength="19" required>
              </div>
              <div class="row">
                <div class="col-7">
                  <label for="card-expiry" class="form-label">Expiration</label>
                  <div class="d-flex">
                    <select id="card-expiry-month" class="form-select me-2" v-model="cardDetails.expiryMonth" required>
                      <option disabled value="">Mois</option>
                      <option v-for="n in 12" :key="n" :value="n">{{ n.toString().padStart(2, '0') }}</option>
                    </select>
                    <select id="card-expiry-year" class="form-select" v-model="cardDetails.expiryYear" required>
                      <option disabled value="">Année</option>
                      <option v-for="n in 10" :key="n" :value="currentYear + n - 1">{{ currentYear + n - 1 }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-5">
                  <label for="card-cvc" class="form-label">CVC</label>
                  <input type="text" id="card-cvc" class="form-control" placeholder="123" v-model="cardDetails.cvc" maxlength="4" required>
                </div>
              </div>
            </form>
          </div>


          <button @click="proceedToValidation" class="btn-validate mt-4" :disabled="!canProceedToPayment">
            PAYER {{ cartStore.totalPrice }} €
          </button>
          <router-link to="/" class="btn btn-continue-shopping mt-3">
            Continuer mes achats
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import Navbar from '../components/Navbar.vue';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const cartStore = useCartStore();
const authStore = useAuthStore(); 
const router = useRouter();

// Vérifie si l'utilisateur peut procéder au paiement
const canProceedToPayment = computed(() => {
  return cartStore.items.length > 0 && 
         authStore.isLoggedIn && 
         authStore.hasCompleteBillingAddress &&
         isCardFormValid.value;
});

const currentYear = new Date().getFullYear();
const cardDetails = ref({
  name: '',
  number: '',
  expiryMonth: '',
  expiryYear: '',
  cvc: ''
});

const isCardFormValid = computed(() => {
  return cardDetails.value.name.trim() !== '' &&
         cardDetails.value.number.length >= 16 &&
         cardDetails.value.expiryMonth !== '' &&
         cardDetails.value.expiryYear !== '' &&
         cardDetails.value.cvc.length >= 3;
});

async function proceedToValidation() {
    if (!canProceedToPayment.value) {
        alert("Veuillez vous connecter et renseigner une adresse de facturation complète pour continuer.");
        return;
    }

    try {
        const orderData = {
            userId: authStore.user.uid,
            createdAt: serverTimestamp(),
            items: JSON.parse(JSON.stringify(cartStore.items)),
            totalPrice: cartStore.totalPrice,
            billingAddress: JSON.parse(JSON.stringify(authStore.billingAddress)),
            status: 'validée'
        };

        console.log("Objet orderData envoyé à Firestore :", orderData);
        console.log('État de authStore.user au moment du clic :', authStore.user);
        console.log('État de authStore.billingAddress :', authStore.billingAddress);

        const ordersCollectionRef = collection(db, 'orders');
        const newOrderRef = await addDoc(ordersCollectionRef, orderData);

        cartStore.clearCart();

        router.push({ name: 'validation', params: { orderId: newOrderRef.id } });

    } catch (error) {
        console.error("Erreur lors de la création de la commande : ", error);
        alert("Une erreur est survenue lors du paiement. Veuillez réessayer.");
    }
}
</script>

<style scoped>
/* Vos styles existants sont conservés, on ajoute juste ceux pour les nouveaux blocs */
.address-section, .payment-section {
  text-align: left;
}

.address-title, .payment-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-two);
  margin-bottom: 1rem;
}

.address-box-action {
  background-color: var(--interactive-comp-one);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}
.address-box-action p {
  margin-bottom: 0.5rem;
}

.address-box-saved {
  background-color: var(--interactive-comp-one);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border: 1px solid var(--border-separator-three);
}

.address-details {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-one);
}

.edit-address-btn {
  color: var(--solid-one);
  font-size: 1.3rem;
  text-decoration: none;
}

.payment-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}
.payment-option {
    background-color: var(--interactive-comp-one);
    border: 1px solid var(--border-separator-three);
    color: var(--text-one);
    padding: 0.75rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    font-weight: 500;
}
.payment-option:hover {
    border-color: var(--solid-one);
}
.payment-option.active {
    border-color: var(--solid-one);
    background-color: var(--interactive-comp-three);
    color: var(--text-two);
    box-shadow: 0 0 8px rgba(var(--solid-one-rgb), 0.3);
}
.payment-option i {
    margin-right: 0.5rem;
}

/* Le reste de vos styles .panier-container, etc., est inchangé */
/* Le conteneur principal hérite de la couleur de fond via la balise <main> ou <body> */
/* et de la couleur de texte par défaut. */
.panier-container {
  color: var(--text-one);
}

/* --- Liste des articles --- */
.cart-items-list {
  background-color: var(--background-two); /* Fond légèrement différent du fond de page */
  border-radius: 15px;
  padding: 1.5rem;
  max-height: 550px;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-separator-one);
}

.cart-item {
  display: flex;
  align-items: center;
  background-color: var(--interactive-comp-one); /* Un fond de carte interactif */
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  gap: 1rem;
}

.cart-item:last-child {
  margin-bottom: 0;
}

.item-image {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-details {
  flex-grow: 1;
}

.item-name {
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  color: var(--text-two); /* Texte plus contrasté pour les titres */
}

.item-price-unit {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-one);
  opacity: 0.8;
}

.item-quantity-controls {
  display: flex;
  align-items: center;
  background-color: var(--background-two);
  border-radius: 5px;
  padding: 0.25rem 0.5rem;
  flex-shrink: 0;
}

.btn-quantity {
  background: none;
  border: none;
  color: var(--text-one);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.5rem;
  transition: color 0.3s;
}

.btn-quantity:hover {
  color: var(--solid-one); /* Couleur d'accentuation au survol */
}

.quantity-display {
  padding: 0 0.75rem;
  font-weight: bold;
  color: var(--text-two);
}

.item-subtotal {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-two);
  text-align: right;
  min-width: 80px;
  flex-shrink: 0;
}

.btn-delete {
  background: none;
  border: none;
  color: var(--text-one);
  font-size: 1.7rem;
  cursor: pointer;
  transition: color 0.3s;
  margin-left: 1rem;
  flex-shrink: 0;
}

/* NOTE : Il est recommandé de créer une variable --danger-color pour cette couleur */
.btn-delete:hover {
  color: #ff6b6b; 
}

/* --- Résumé de la commande --- */
.order-summary {
  background-color: var(--background-two);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  border: 1px solid var(--border-separator-one);
  position: sticky;
  top: 2rem;
}

.summary-title {
  font-weight: bold;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: var(--text-two);
}

.summary-details {
  font-size: 1.1rem;
  color: var(--text-one);
}

.summary-details .text-muted {
    color: var(--text-one) !important;
    opacity: 0.7;
}

.summary-total-final {
  font-size: 1.4rem;
  color: var(--solid-one);
}

.summary-total-final .display-6 {
  font-size: 2.2rem;
}

.btn-validate {
  background-color: var(--solid-one);
  color: var(--background-one); /* Texte contrasté avec le fond du bouton */
  font-weight: bold;
  border: none;
  border-radius: 10px;
  padding: 0.9rem 1.5rem;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-size: 1.1rem;
}

.btn-validate:hover {
  background-color: var(--solid-two);
  transform: translateY(-2px);
}

.btn-validate:disabled {
  background-color: var(--border-separator-three);
  color: var(--text-one);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-continue-shopping {
  background-color: transparent;
  color: var(--solid-one);
  border: 1px solid var(--solid-one);
  border-radius: 10px;
  padding: 0.8rem 1.5rem;
  width: 100%;
  transition: background-color 0.3s, color 0.3s;
  font-weight: bold;
  text-decoration: none; /* Pour le router-link */
  display: inline-block; /* Pour que le padding/width s'applique bien */
}

.btn-continue-shopping:hover {
  background-color: var(--solid-one);
  color: var(--background-one);
}

/* --- Panier vide --- */
.empty-cart-message {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: var(--text-one);
  opacity: 0.7;
}

.empty-cart-icon {
  font-size: 4rem;
  color: var(--interactive-comp-two);
  margin-bottom: 1rem;
}

.empty-cart-message h3 {
  color: var(--text-two);
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

/* Le bouton primaire dans le message de panier vide */
.empty-cart-message .btn-primary {
    background-color: var(--solid-one);
    border-color: var(--solid-one);
    color: var(--background-one);
}
.empty-cart-message .btn-primary:hover {
    background-color: var(--solid-two);
    border-color: var(--solid-two);
}


/* --- Style de la barre de défilement --- */
.cart-items-list::-webkit-scrollbar {
  width: 8px;
}

.cart-items-list::-webkit-scrollbar-track {
  background: var(--background-two);
  border-radius: 10px;
}

.cart-items-list::-webkit-scrollbar-thumb {
  background-color: var(--border-separator-three);
  border-radius: 10px;
}

.container {
  flex-wrap: wrap !important;
  align-content: center !important;
}
</style>