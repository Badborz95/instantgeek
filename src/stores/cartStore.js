import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from './authStore'; // On a besoin de savoir qui est connecté
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Nom de la clé pour le panier des utilisateurs non connectés
const GUEST_CART_STORAGE_KEY = 'guestCart';

export const useCartStore = defineStore('cart', () => {
  // === STATE ===
  const items = ref([]); // La liste des produits dans le panier
  const authStore = useAuthStore();
  let cartListenerUnsubscribe = null; // Pour stopper l'écouteur Firestore

  // === GETTERS (Propriétés calculées) ===
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });

  const totalPrice = computed(() => {
    const total = items.value.reduce((total, item) => total + item.price * item.quantity, 0);
    return total.toFixed(2); // Garde 2 décimales pour l'affichage
  });
  
  /**
   * Sauvegarde le panier dans Firestore pour l'utilisateur connecté.
   */
  async function _updateFirestoreCart() {
    if (authStore.isLoggedIn && authStore.user) {
      const cartDocRef = doc(db, 'users', authStore.user.uid, 'privateData', 'cart');
      // On sauvegarde la version "pure" de l'array, sans les proxys de Vue
      await setDoc(cartDocRef, { items: JSON.parse(JSON.stringify(items.value)) });
    }
  }

  /**
   * Sauvegarde le panier dans le localStorage pour les invités.
   */
  function _updateGuestCart() {
    if (!authStore.isLoggedIn) {
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items.value));
    }
  }

  // === ACTIONS (Méthodes publiques) ===
  
  /**
   * Ajoute un produit au panier ou augmente sa quantité.
   * @param {object} product - Le produit à ajouter (doit avoir id, name, price, image)
   */
  function addItem(product) {
    const existingItem = items.value.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({ ...product, quantity: 1 });
    }
    authStore.isLoggedIn ? _updateFirestoreCart() : _updateGuestCart();
  }
  
  /**
   * Supprime un produit du panier.
   * @param {string} productId - L'ID du produit à retirer
   */
  function removeItem(productId) {
    items.value = items.value.filter(item => item.id !== productId);
    authStore.isLoggedIn ? _updateFirestoreCart() : _updateGuestCart();
  }

  /**
   * Augmente la quantité d'un produit.
   * @param {string} productId - L'ID du produit
   */
  function increaseQuantity(productId) {
    const item = items.value.find(item => item.id === productId);
    if (item) {
      item.quantity++;
    }
    authStore.isLoggedIn ? _updateFirestoreCart() : _updateGuestCart();
  }

  /**
   * Diminue la quantité d'un produit. Le retire si la quantité atteint 0.
   * @param {string} productId - L'ID du produit
   */
  function decreaseQuantity(productId) {
    const item = items.value.find(item => item.id === productId);
    if (item && item.quantity > 1) {
      item.quantity--;
    } else if (item && item.quantity === 1) {
      // Si la quantité est 1, on retire l'article
      removeItem(productId);
      return; // On sort pour ne pas appeler la sauvegarde deux fois
    }
    authStore.isLoggedIn ? _updateFirestoreCart() : _updateGuestCart();
  }

  /**
   * Vide complètement le panier.
   */
  function clearCart() {
    items.value = [];
    authStore.isLoggedIn ? _updateFirestoreCart() : _updateGuestCart();
  }

  /**
   * Initialise le store, charge le panier depuis le localStorage (invité)
   * et met en place l'écouteur pour les changements d'utilisateur (connexion/déconnexion).
   */
  async function init() {
    // Surveille les changements d'état de connexion de l'utilisateur
    watch(() => authStore.user, async (newUser, oldUser) => {
      // Stoppe l'ancien écouteur s'il y en avait un
      if (cartListenerUnsubscribe) {
        cartListenerUnsubscribe();
        cartListenerUnsubscribe = null;
      }

      if (newUser) { // L'utilisateur vient de se connecter
        const cartDocRef = doc(db, 'users', newUser.uid, 'privateData', 'cart');
        const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_STORAGE_KEY) || '[]');
        
        const firestoreDoc = await getDoc(cartDocRef);
        const firestoreCart = firestoreDoc.exists() ? firestoreDoc.data().items : [];

        // Fusionne le panier invité et le panier Firestore
        const mergedCart = [...firestoreCart];
        guestCart.forEach(guestItem => {
          const existingItem = mergedCart.find(item => item.id === guestItem.id);
          if (existingItem) {
            existingItem.quantity += guestItem.quantity; // Fusionne les quantités
          } else {
            mergedCart.push(guestItem);
          }
        });
        
        items.value = mergedCart;
        await _updateFirestoreCart(); // Sauvegarde le panier fusionné
        localStorage.removeItem(GUEST_CART_STORAGE_KEY); // Nettoie le panier invité

        // Met en place un écouteur en temps réel sur le panier Firestore
        cartListenerUnsubscribe = onSnapshot(cartDocRef, (doc) => {
          items.value = doc.exists() ? doc.data().items : [];
        });

      } else { // L'utilisateur est déconnecté ou invité
        const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_STORAGE_KEY) || '[]');
        items.value = guestCart;
      }
    }, { immediate: true }); // 'immediate: true' exécute le watch dès l'initialisation
  }

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    init,
  };
});