<template>
    <Navbar />
    <div class="paiement-container container py-5" id="main-content">
        <h2 class="mb-4">Paiement par carte bancaire</h2>
        <form class="payment-form" @submit.prevent="submitPayment">
            <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">Total à payer :</span>
                <span class="fs-4 text-success">{{ totalPrice }} €</span>
            </div>
        </form>
        <form class="payment-form mt-4" @submit.prevent="submitPayment">
            <div class="mb-3">
                <label for="cardName" class="form-label">Nom sur la carte</label>
                <input type="text" id="cardName" v-model="cardName" class="form-control" required
                    autocomplete="cc-name" />
            </div>
            <div class="mb-3">
                <label for="cardNumber" class="form-label">Numéro de carte</label>
                <input type="text" id="cardNumber" v-model="cardNumber" class="form-control" required maxlength="19"
                    placeholder="1234 5678 9012 3456" autocomplete="cc-number" />
            </div>
            <div class="row">
                <div class="col-6 mb-3">
                    <label for="expiry" class="form-label">Date d'expiration</label>
                    <input type="text" id="expiry" v-model="expiry" class="form-control" required maxlength="5"
                        placeholder="MM/AA" autocomplete="cc-exp" />
                </div>
                <div class="col-6 mb-3">
                    <label for="cvc" class="form-label">CVC</label>
                    <input type="text" id="cvc" v-model="cvc" class="form-control" required maxlength="4"
                        placeholder="123" autocomplete="cc-csc" />
                </div>
            </div>
            <button type="submit" class="btn btn-primary w-100 mt-3" @click="goToValid">Payer</button>
        </form>
    </div>
    <Footer />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'; // Ajoute cette ligne
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import { useCartStore } from '../stores/cartStore';

const cartStore = useCartStore();
const totalPrice = computed(() => cartStore.totalPrice);
const cardName = ref('');
const cardNumber = ref('');
const expiry = ref('');
const cvc = ref('');

const router = useRouter();

function goToValid() {
  if (cartStore.items.length > 0) {
    router.push('/ValidationPaiement');
  }
}

</script>

<style scoped>
.paiement-container {
    max-width: 500px;
}

.payment-form {
    background: var(--background-two, #f8f9fa);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style>