<template>
    <Navbar />
    <div class="validation-container">
        <h2>Paiement valider !</h2>
        <router-link to="/" class="btn btn-continue-shopping mt-3">
            Continuer mes achats
        </router-link>
    </div>
    <Footer />
</template>

<script setup>
import { onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import { useCartStore } from '../stores/cartStore';

const cartStore = useCartStore();

onMounted(() => {
  cartStore.clearCart && cartStore.clearCart(); //reset du panier 
});
</script>

<style scoped>
.validation-container {
  min-height: 66vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.btn-continue-shopping {
  background-color: transparent;
  color: var(--solid-one);
  border: 1px solid var(--solid-one);
  border-radius: 10px;
  padding: 0.8rem 1.5rem;
  width: 80%;
  transition: background-color 0.3s, color 0.3s;
  font-weight: bold;
  text-decoration: none;
  display: inline-block;
}

.btn-continue-shopping:hover {
  background-color: var(--solid-one);
  color: var(--background-one);
}

@media (min-width: 1250px) {
.validation-container {
  min-height: 72vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
}
</style>