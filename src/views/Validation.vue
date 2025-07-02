<template>
  <Navbar />
  <div class="validation-page-wrapper">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">

          <div v-if="isLoading" class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          
          <div v-else-if="order" class="card validation-card text-center shadow-lg">
            <div class="card-body p-4 p-md-5">
              <i class="bi bi-check-circle-fill success-icon"></i>
              <h1 class="card-title mt-3">Merci, {{ authStore.currentUsername }} !</h1>
              <p class="lead text-muted">Votre commande a été validée avec succès.</p>
              
              <div class="order-recap my-4">
                <p>Un e-mail de confirmation vous a été envoyé.</p>
                <p class="order-number">
                  Commande n° <strong>{{ orderId }}</strong>
                </p>
              </div>

              <hr>

              <div class="items-summary mt-4 text-start">
                <h5 class="mb-3">Vos articles :</h5>
                <ul class="list-group list-group-flush">
                  <li v-for="item in order.items" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                      <img :src="item.image" :alt="item.name" class="item-image me-2">
                      {{ item.name }} (x{{ item.quantity }})
                    </span>
                    <span class="fw-bold">{{ (item.price * item.quantity).toFixed(2) }} €</span>
                  </li>
                </ul>
                <div class="list-group-item d-flex justify-content-between align-items-center fw-bold total-price mt-2">
                    <span>Total payé</span>
                    <span>{{ order.totalPrice }} €</span>
                </div>
              </div>

              <div class="mt-5 d-grid gap-2 d-sm-flex justify-content-sm-center">
                <router-link to="/mes-achats" class="btn btn-primary btn-lg px-4 gap-3">Voir mes achats</router-link>
                <router-link to="/" class="btn btn-outline-secondary btn-lg px-4">Retour à l'accueil</router-link>
              </div>
            </div>
          </div>
          
          <div v-else class="alert alert-danger">
            Désolé, cette commande n'a pas pu être trouvée.
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../stores/authStore';
import Navbar from '../components/Navbar.vue';

const route = useRoute();
const authStore = useAuthStore();

const order = ref(null);
const isLoading = ref(true);
const orderId = route.params.orderId;

// Au chargement du composant, on va chercher la commande dans Firestore
onMounted(async () => {
  if (orderId) {
    try {
      const orderDocRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(orderDocRef);

      if (docSnap.exists()) {
        order.value = docSnap.data();
      } else {
        console.error("Aucune commande trouvée avec l'ID:", orderId);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la commande:", error);
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.validation-page-wrapper {
  background-color: var(--background-one);
  min-height: calc(100vh - 72px);
  display: flex;
  align-items: center;
}

.validation-card {
  background-color: var(--background-two);
  border: 1px solid var(--border-separator-one);
  border-radius: 15px;
  color: var(--text-one);
}

.success-icon {
  font-size: 5rem;
  color: var(--solid-one);
}

.card-title {
  color: var(--text-two);
  font-weight: 600;
}

.lead.text-muted {
    color: var(--text-one) !important;
    opacity: 0.8;
}

.order-recap {
  background-color: var(--interactive-comp-one);
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
}

.order-number {
  font-size: 1.1rem;
  margin-bottom: 0;
}
.order-number strong {
  font-family: 'Courier New', Courier, monospace;
  color: var(--text-two);
}

.items-summary .list-group-item {
  background-color: transparent;
  color: var(--text-one);
  border-color: var(--border-separator-three);
  padding: 0.75rem 0;
}

.items-summary .total-price {
    font-size: 1.2rem;
    color: var(--text-two);
    padding-top: 1rem;
}

.item-image {
  width: 40px;
  height: auto;
  border-radius: 4px;
  vertical-align: middle;
}

.btn-primary {
  background-color: var(--solid-one);
  border-color: var(--solid-one);
}
.btn-primary:hover {
  background-color: var(--solid-two);
  border-color: var(--solid-two);
}

.btn-outline-secondary {
    color: var(--text-one);
    border-color: var(--border-separator-three);
}
.btn-outline-secondary:hover {
    background-color: var(--interactive-comp-three);
    color: var(--text-two);
    border-color: var(--interactive-comp-three);
}

.spinner-border {
    color: var(--solid-one);
    width: 3rem;
    height: 3rem;
}
</style>