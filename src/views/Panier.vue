<template>
  <Navbar />
  <div class="panier-container container py-5">
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
/* NOTE: Ces couleurs sont basées sur votre maquette.
   Remplacez-les par vos variables CSS de thème (ex: var(--background-two)) pour la cohérence. */

.panier-container {
  color: #E7FFFC;
  /* Couleur de texte claire */
}

/* --- Supprimez tous les styles liés à .progress-stepper, .step, .step-circle, .step-label, .step-line ici --- */
/* Conservez tous les autres styles de votre page panier, comme ci-dessous */

/* --- Liste des articles --- */
.cart-items-list {
  background-color: #1A3E40;
  border-radius: 15px;
  padding: 1.5rem;
  max-height: 550px;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.cart-item {
  display: flex;
  align-items: center;
  background-color: #1F4A4C;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
}

.item-price-unit {
  margin: 0;
  font-size: 0.9rem;
  color: #BEEDFF;
  opacity: 0.8;
}

.item-quantity-controls {
  display: flex;
  align-items: center;
  background-color: #1A3E40;
  border-radius: 5px;
  padding: 0.25rem 0.5rem;
  flex-shrink: 0;
}

.btn-quantity {
  background: none;
  border: none;
  color: #E7FFFC;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.5rem;
  transition: color 0.3s;
}

.btn-quantity:hover {
  color: #00dffc;
}

.quantity-display {
  padding: 0 0.75rem;
  font-weight: bold;
  color: #E7FFFC;
}

.item-subtotal {
  font-size: 1.2rem;
  font-weight: bold;
  color: #BEEDFF;
  text-align: right;
  min-width: 80px;
  flex-shrink: 0;
}

.btn-delete {
  background: none;
  border: none;
  color: #E7FFFC;
  font-size: 1.7rem;
  cursor: pointer;
  transition: color 0.3s;
  margin-left: 1rem;
  flex-shrink: 0;
}

.btn-delete:hover {
  color: #ff6b6b;
}

/* --- Résumé de la commande --- */
.order-summary {
  background-color: #1F4A4C;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.summary-title {
  font-weight: bold;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: #E7FFFC;
}

.summary-details {
  font-size: 1.1rem;
  color: #BEEDFF;
}

.summary-details hr {
  border-top: 1px solid rgba(190, 237, 255, 0.3);
  margin: 1rem 0;
}

.summary-total-final {
  font-size: 1.4rem;
  color: #00B8D4;
}

.summary-total-final .display-6 {
  font-size: 2.2rem;
}

.btn-validate {
  background-color: #00B8D4;
  color: #1A3E40;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  padding: 0.9rem 1.5rem;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 4px 10px rgba(0, 184, 212, 0.3);
  font-size: 1.1rem;
}

.btn-validate:hover {
  background-color: #00dffc;
  transform: translateY(-2px);
}

.btn-validate:disabled {
  background-color: #8A9A9C;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-continue-shopping {
  background-color: transparent;
  color: #BEEDFF;
  border: 1px solid #BEEDFF;
  border-radius: 10px;
  padding: 0.8rem 1.5rem;
  width: 100%;
  transition: background-color 0.3s, color 0.3s;
  font-weight: bold;
}

.btn-continue-shopping:hover {
  background-color: #BEEDFF;
  color: #1A3E40;
}

.empty-cart-message {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: #8A9A9C;
}

.empty-cart-icon {
  font-size: 4rem;
  color: #1F4A4C;
  margin-bottom: 1rem;
}

.empty-cart-message h3 {
  color: #E7FFFC;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

/* Style de la barre de défilement */
.cart-items-list::-webkit-scrollbar {
  width: 8px;
}

.cart-items-list::-webkit-scrollbar-track {
  background: #1A3E40;
  border-radius: 10px;
}

.cart-items-list::-webkit-scrollbar-thumb {
  background-color: #8A9A9C;
  border-radius: 10px;
}

.container {
  flex-wrap: wrap !important;
  align-content: center !important;
}
</style>