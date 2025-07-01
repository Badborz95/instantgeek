<template>
  <Navbar />
  <div class="purchases-wrapper">
    <div class="container py-5">
      <h1 class="mb-4">Mes Achats</h1>

      <div v-if="isLoading" class="text-center mt-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div v-else-if="orders.length === 0" class="text-center empty-purchases-message">
        <i class="bi bi-cart-x-fill empty-icon"></i>
        <h3 class="mt-3">Aucun achat pour le moment</h3>
        <p>Il est temps de commencer votre collection !</p>
        <router-link to="/" class="btn btn-primary mt-3">Explorer le catalogue</router-link>
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="card order-card mb-4 shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <span class="order-id-label">Commande</span>
              <strong class="order-id">{{ order.id }}</strong>
            </div>
            <span class="order-date">{{ formatOrderDate(order.createdAt) }}</span>
          </div>
          <div class="card-body">
            <ul class="list-group list-group-flush">
              <li v-for="item in order.items" :key="item.id" class="list-group-item item-row d-flex align-items-center">
                <img :src="item.image" :alt="item.name" class="item-image me-3">
                <div class="flex-grow-1">
                  <h5 class="item-name">{{ item.name }}</h5>
                  <p class="item-quantity mb-0">Quantité : {{ item.quantity }}</p>
                </div>
                <div class="item-price text-end">
                  <strong>{{ (item.price * item.quantity).toFixed(2) }} €</strong>
                </div>
              </li>
            </ul>
          </div>
          <div class="card-footer text-end">
            <strong>Total : {{ order.totalPrice }} €</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../stores/authStore';
import Navbar from '../components/Navbar.vue';

const authStore = useAuthStore();
const orders = ref([]);
const isLoading = ref(true);

// Récupère les commandes de l'utilisateur connecté
onMounted(async () => {
  if (!authStore.isLoggedIn) {
    isLoading.value = false;
    return;
  }
  
  try {
    const ordersCollectionRef = collection(db, 'orders');
    // Crée une requête pour filtrer les commandes par userId et les trier par date
    const q = query(
      ordersCollectionRef, 
      where("userId", "==", authStore.user.uid),
      orderBy("createdAt", "desc") // Affiche les plus récentes en premier
    );
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      orders.value.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
  } finally {
    isLoading.value = false;
  }
});

// Fonction pour formater la date
function formatOrderDate(timestamp) {
  if (!timestamp || !timestamp.toDate) {
    return 'Date inconnue';
  }
  return timestamp.toDate().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}
</script>

<style scoped>
.purchases-wrapper {
  background-color: var(--background-one);
  min-height: calc(100vh - 72px);
  color: var(--text-one);
}

h1 {
  color: var(--text-two);
  font-weight: 600;
}

.order-card {
  background-color: var(--background-two);
  border: 1px solid var(--border-separator-one);
  border-radius: 15px;
}

.card-header, .card-footer {
  background-color: var(--interactive-comp-one);
  border-bottom: 1px solid var(--border-separator-one);
  color: var(--text-two);
  font-weight: bold;
}
.card-footer {
  border-top: 1px solid var(--border-separator-one);
  font-size: 1.2rem;
}

.order-id-label {
  color: var(--text-one);
  font-size: 0.9rem;
  margin-right: 0.5rem;
}
.order-id {
  font-family: 'Courier New', Courier, monospace;
}
.order-date {
  font-size: 0.9rem;
  font-weight: normal;
  color: var(--text-one);
}

.item-row {
  background-color: transparent;
  padding: 1rem 0;
}

.item-image {
  width: 80px;
  height: auto;
  border-radius: 8px;
}

.item-name {
  font-size: 1.1rem;
  color: var(--text-two);
  font-weight: 500;
}
.item-quantity {
  font-size: 0.9rem;
  color: var(--text-one);
}

.item-price {
  min-width: 80px;
}

.empty-purchases-message {
  margin-top: 5rem;
  color: var(--text-one);
  opacity: 0.7;
}

.empty-icon {
  font-size: 5rem;
  color: var(--interactive-comp-two);
}
.empty-purchases-message .btn-primary {
  background-color: var(--solid-one);
  border-color: var(--solid-one);
}

.spinner-border {
  color: var(--solid-one);
}
</style>