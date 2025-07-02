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

        <div v-if="authStore.isLoggedIn && savedCards.length > 0" class="saved-cards-section mt-4">
            <h4 class="saved-cards-title">Mes cartes enregistrées (démo)</h4>
            <div class="card-list">
                <div v-for="card in savedCards" :key="card.id" class="saved-card-item card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="card-display">{{ card.cardName }} **** **** **** {{ card.last4 }}</span>
                            <button @click="removeSavedCard(card.id)" class="btn btn-sm btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                        <span class="text-muted small">Expire: {{ card.expiryMonth }}/{{ card.expiryYear }}</span>
                        <button @click="selectSavedCard(card)" class="btn btn-sm btn-primary mt-2 w-100">
                            Utiliser cette carte
                        </button>
                    </div>
                </div>
            </div>
            <hr class="my-4">
        </div>

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

            <div class="form-check mt-3">
                <input class="form-check-input" type="checkbox" id="saveCard" v-model="saveCardForFuture">
                <label class="form-check-label" for="saveCard">
                    Enregistrer cette carte pour de futurs achats (démo)
                </label>
            </div>
            <p class="text-muted small mt-2">
                *Ceci est une **démonstration uniquement**. Dans une application réelle, les informations de carte ne sont jamais stockées directement.
            </p>

            <button type="submit" class="btn btn-primary w-100 mt-3" :disabled="!isCardFormValid">Payer</button>
        </form>
    </div>
    <Footer />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const totalPrice = computed(() => cartStore.totalPrice);
const cardName = ref('');
const cardNumber = ref('');
const expiry = ref('');
const cvc = ref('');
const saveCardForFuture = ref(false);
const savedCards = ref([]);

let unsubscribeSavedCards = null; 

const isCardFormValid = computed(() => {
  const [month, year] = expiry.value.split('/');
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  const isExpiryValid = month && year &&
                        parseInt(month) >= 1 && parseInt(month) <= 12 &&
                        parseInt(year) >= currentYear &&
                        (parseInt(year) > currentYear || parseInt(month) >= currentMonth);

  return cardName.value.trim() !== '' &&
         cardNumber.value.replace(/\s/g, '').length === 16 &&
         isExpiryValid &&
         cvc.value.length >= 3 && cvc.value.length <= 4;
});

const loadSavedCards = () => {
  if (authStore.user && authStore.user.uid) {
    const q = query(collection(db, 'users', authStore.user.uid, 'savedCards'));
    unsubscribeSavedCards = onSnapshot(q, (snapshot) => {
      savedCards.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }, (error) => {
      console.error("Error loading saved cards:", error);
    });
  } else {
    savedCards.value = [];
  }
};

const removeSavedCard = async (cardId) => {
  if (confirm("Voulez-vous vraiment supprimer cette carte enregistrée ?")) {
    try {
      await deleteDoc(doc(db, 'users', authStore.user.uid, 'savedCards', cardId));
      alert("Carte supprimée avec succès (démo).");
    } catch (error) {
      console.error("Erreur lors de la suppression de la carte (démo):", error);
      alert("Erreur lors de la suppression de la carte (démo).");
    }
  }
};

const selectSavedCard = (card) => {
  cardName.value = card.cardName;
  cardNumber.value = '************' + card.last4;
  expiry.value = `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}`;
  cvc.value = ''; // CVC ne se sauvegarde pas pour des raisons de sécurité
};

// --- Paiement ---
async function submitPayment() {
  if (!isCardFormValid.value) {
    alert("Veuillez vérifier les informations de votre carte bancaire.");
    return;
  }

  if (cartStore.items.length === 0) {
    alert("Votre panier est vide. Impossible de procéder au paiement.");
    router.push('/panier');
    return;
  }

  if (!authStore.isLoggedIn || !authStore.hasCompleteBillingAddress) {
      alert("Veuillez vous connecter et renseigner une adresse de facturation complète.");
      router.push('/panier');
      return;
  }

  try {
      // Cree l'ordre dans Firestore
      const orderData = {
          userId: authStore.user.uid,
          createdAt: serverTimestamp(),
          items: JSON.parse(JSON.stringify(cartStore.items)),
          totalPrice: cartStore.totalPrice,
          billingAddress: JSON.parse(JSON.stringify(authStore.billingAddress)),
          status: 'validée'
      };

      const ordersCollectionRef = collection(db, 'orders');
      const newOrderRef = await addDoc(ordersCollectionRef, orderData);

      // Simulation de traitement de paiement
      if (saveCardForFuture.value && authStore.user && authStore.user.uid) {
          const last4Digits = cardNumber.value.replace(/\s/g, '').slice(-4);
          const [expMonth, expYear] = expiry.value.split('/');

          const savedCardData = {
              cardName: cardName.value,
              last4: last4Digits,
              expiryMonth: parseInt(expMonth),
              expiryYear: parseInt(expYear),
              savedAt: serverTimestamp()
          };

          const savedCardsCollectionRef = collection(db, 'users', authStore.user.uid, 'savedCards');
          await addDoc(savedCardsCollectionRef, savedCardData);
          console.log("Carte enregistrée (démo) pour futur usage.");
      }

      cartStore.clearCart(); // nettoyer le panier après la commande
      router.push({ name: 'validation', params: { orderId: newOrderRef.id } });

  } catch (error) {
      console.error("Erreur lors du traitement du paiement et de la création de la commande : ", error);
      alert("Une erreur est survenue lors du paiement. Veuillez réessayer.");
  }
}

watch(expiry, (newValue) => {
  let cleaned = newValue.replace(/\D/g, '');
  if (cleaned.length > 2) {
    cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }
  expiry.value = cleaned.slice(0, 5);
});

watch(cardNumber, (newValue) => {
  let cleaned = newValue.replace(/\s/g, '');
  let formatted = '';
  for (let i = 0; i < cleaned.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += cleaned[i];
  }
  cardNumber.value = formatted.slice(0, 19);
});

onMounted(() => {
  if (authStore.isLoggedIn) {
    loadSavedCards();
  }

  watch(() => authStore.isLoggedIn, (newVal) => {
    if (newVal) {
      loadSavedCards();
    } else {
      if (unsubscribeSavedCards) {
        unsubscribeSavedCards();
        unsubscribeSavedCards = null;
      }
      savedCards.value = [];
    }
  }, { immediate: true });
});

onUnmounted(() => {
  if (unsubscribeSavedCards) {
    unsubscribeSavedCards();
  }
});
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

.form-check-input {
    border-color: var(--border-separator-one);
    background-color: var(--interactive-comp-one);
}

.form-check-input:checked {
    background-color: var(--solid-one);
    border-color: var(--solid-one);
}

.form-check-label {
    color: var(--text-one);
}

.text-muted.small {
    color: var(--text-one) !important;
    opacity: 0.7;
}

.saved-cards-section {
    background: var(--background-two);
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid var(--border-separator-one);
}

.saved-cards-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-two);
    margin-bottom: 1rem;
}

.card-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.saved-card-item {
    background-color: var(--interactive-comp-one);
    border: 1px solid var(--border-separator-three);
    border-radius: 8px;
    color: var(--text-one);
}

.saved-card-item .card-body {
    padding: 1rem;
}

.card-display {
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
    font-size: 1rem;
    color: var(--text-two);
}
</style>