import { defineStore } from 'pinia';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useWishlistStore } from './wishlistStore';
import { useCartStore } from './cartStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // L'objet d'authentification Firebase
    userData: null, // Le document de profil depuis Firestore
    isLoading: true,
    _authListenerUnsubscribe: null,
    _userDataListenerUnsubscribe: null, // Nouveau pour le listener userData
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
    billingAddress: (state) => state.userData?.billingAddress || null,
    
    hasCompleteBillingAddress: (state) => {
      const addr = state.userData?.billingAddress;
      return !!(addr && addr.street && addr.city && addr.postalCode && addr.country);
    },
  },

  actions: {
    initAuthListener() {
      // Nettoyage des listeners précédents si la fonction est appelée plusieurs fois
      this.cleanupListeners(); // Appelle la fonction de nettoyage au début

      this._authListenerUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        this.isLoading = true;
        const wishlistStore = useWishlistStore();
        const cartStore = useCartStore();

        if (firebaseUser) {
          this.user = { uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName };
          
          // Mettre en place un listener en temps réel pour userData
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          this._userDataListenerUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              this.userData = docSnap.data();
            } else {
              this.userData = null;
              console.warn("Document utilisateur Firestore non trouvé pour UID:", firebaseUser.uid);
            }
            this.isLoading = false; // Mettre à jour isLoading une fois les données de l'utilisateur chargées
          }, (error) => {
            console.error("Erreur lors du chargement du document utilisateur Firestore:", error);
            this.userData = null;
            this.isLoading = false;
          });

          // Initialise les stores qui dépendent de l'utilisateur
          await wishlistStore.fetchWishlist(); 
          await cartStore.init();

        } else {
          // Si l'utilisateur est déconnecté
          this.user = null;
          this.userData = null;
          // Nettoie le listener userData si l'utilisateur est déconnecté
          if (this._userDataListenerUnsubscribe) {
            this._userDataListenerUnsubscribe();
            this._userDataListenerUnsubscribe = null;
          }
          wishlistStore.$reset(); 
          await cartStore.init();
          this.isLoading = false; // Fin du chargement après déconnexion
        }
      });
    },

    // Action pour mettre à jour le profil
    async updateUserProfile(dataToUpdate) {
      if (!this.user) throw new Error("Utilisateur non connecté.");
      
      const userDocRef = doc(db, 'users', this.user.uid);
      await updateDoc(userDocRef, dataToUpdate);

      // Le listener onSnapshot ci-dessus mettra automatiquement à jour this.userData
      // Il n'est donc plus nécessaire de le faire manuellement ici
      // this.userData = { ...this.userData, ...dataToUpdate };
    },

    cleanupListeners() {
      if (this._authListenerUnsubscribe) {
        this._authListenerUnsubscribe();
        this._authListenerUnsubscribe = null;
      }
      if (this._userDataListenerUnsubscribe) {
        this._userDataListenerUnsubscribe();
        this._userDataListenerUnsubscribe = null;
      }
    }
  },
});