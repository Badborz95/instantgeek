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
            <p class="mt-3 text-muted small">
              *Livraison instantanée par clé numérique.
            </p>
          </div>

          <button class="btn-validate" :disabled="cartStore.items.length === 0">
            VALIDER MA COMMANDE
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
import Navbar from '../components/Navbar.vue';
import { useCartStore } from '../stores/cartStore';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();
</script>

<style scoped>
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