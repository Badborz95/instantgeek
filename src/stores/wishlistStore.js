import { defineStore } from 'pinia';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { db } from '../firebase/index';
import { useAuthStore } from './authStore';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    gameIds: [],
    isLoading: false,
  }),

  getters: {
    isInWishlist: (state) => (gameId) => {
      return state.gameIds.includes(gameId);
    },
    wishlistCount: (state) => {
      return state.gameIds.length;
    }
  },

  actions: {
    async fetchWishlist() {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) return;

      this.isLoading = true;
      const docRef = doc(db, 'users', authStore.user.uid, 'wishlist', 'items');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Le champ contenant les jeux s'appelle 'ids'
        this.gameIds = docSnap.data().ids || []; 
      } else {
        this.gameIds = [];
      }
      this.isLoading = false;
    },

    async addToWishlist(gameId) {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) {
        alert("Veuillez vous connecter pour ajouter des jeux à votre wishlist.");
        return;
      }

      const docRef = doc(db, 'users', authStore.user.uid, 'wishlist', 'items');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Si le document existe, on met à jour le tableau
        await updateDoc(docRef, {
          ids: arrayUnion(gameId)
        });
      } else {
        // Sinon, on crée le document avec le premier jeu
        await setDoc(docRef, { ids: [gameId] });
      }
      
      if (!this.gameIds.includes(gameId)) {
        this.gameIds.push(gameId);
      }
    },

    async removeFromWishlist(gameId) {
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) return;

      const docRef = doc(db, 'users', authStore.user.uid, 'wishlist', 'items');

      await updateDoc(docRef, {
        ids: arrayRemove(gameId)
      });
      
      this.gameIds = this.gameIds.filter(id => id !== gameId);
    },
  },
});