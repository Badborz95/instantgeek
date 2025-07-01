import { defineStore } from 'pinia';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // updateDoc ajouté
import { auth, db } from '../firebase';
import { useWishlistStore } from './wishlistStore';
import { useCartStore } from './cartStore'; // Ajouté pour l'init

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // L'objet d'authentification Firebase
    userData: null, // Le document de profil depuis Firestore
    isLoading: true,
    _authListenerUnsubscribe: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    currentUsername: (state) => {
      // Priorité au displayName dans Firestore
      if (state.userData && state.userData.displayName) {
        return state.userData.displayName;
      }
      // Sinon, celui de l'authentification Firebase
      if (state.user && state.user.displayName) {
        return state.user.displayName;
      }
      // En dernier recours, l'email
      if (state.user && state.user.email) {
        return state.user.email.split('@')[0];
      }
      return 'Invité';
    },
    // NOUVEAU : Getter pour l'adresse de facturation
    billingAddress: (state) => state.userData?.billingAddress || null,
    
    // NOUVEAU : Getter pour vérifier si l'adresse est complète
    hasCompleteBillingAddress: (state) => {
      const addr = state.userData?.billingAddress;
      return !!(addr && addr.street && addr.city && addr.postalCode && addr.country);
    },
  },

  actions: {
    // MODIFIÉ : L'initialisation est plus complète
    initAuthListener() {
      if (this._authListenerUnsubscribe) return;

      this._authListenerUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        this.isLoading = true;
        const wishlistStore = useWishlistStore();
        const cartStore = useCartStore(); // On récupère le cartStore

        if (firebaseUser) {
          this.user = { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName };
          
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            this.userData = userDocSnap.data();
          } else {
            this.userData = null; // Important si le doc n'existe pas
          }
          
          // On initialise les stores qui dépendent de l'utilisateur
          await wishlistStore.fetchWishlist(); 
          await cartStore.init(); // On lance l'initialisation du panier ici

        } else {
          // Si l'utilisateur est déconnecté
          this.user = null;
          this.userData = null;
          wishlistStore.$reset(); 
          await cartStore.init(); // On init aussi pour charger le panier invité
        }
        
        this.isLoading = false;
      });
    },

    // NOUVEAU : Action pour mettre à jour le profil
    async updateUserProfile(dataToUpdate) {
      if (!this.user) throw new Error("Utilisateur non connecté.");
      
      const userDocRef = doc(db, 'users', this.user.uid);
      await updateDoc(userDocRef, dataToUpdate);

      // Met à jour le state local pour une réactivité immédiate
      this.userData = { ...this.userData, ...dataToUpdate };
    },

    cleanupListeners() {
      if (this._authListenerUnsubscribe) {
        this._authListenerUnsubscribe();
      }
    }
  },
});