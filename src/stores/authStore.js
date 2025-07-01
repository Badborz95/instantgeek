import { defineStore } from 'pinia';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useWishlistStore } from './wishlistStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoading: true,
    userData: null,
    _authListenerUnsubscribe: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    currentUsername: (state) => {
      if (state.userData && state.userData.displayName) {
        return state.userData.displayName;
      }
      if (state.user && state.user.displayName) {
        return state.user.displayName;
      }
      if (state.user && state.user.email) {
        return state.user.email.split('@')[0];
      }
      return 'Invité';
    },
  },

  actions: {
    initAuthListener() {
      if (this._authListenerUnsubscribe) return;

      this._authListenerUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        this.isLoading = true;
        const wishlistStore = useWishlistStore();
        
        if (firebaseUser) {
          this.user = firebaseUser;
          
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            this.userData = userDocSnap.data();
          } else {
            this.userData = null;
          }
          
          await wishlistStore.fetchWishlist(); 

        } else {
          // Si l'utilisateur est déconnecté
          this.user = null;
          this.userData = null;
          wishlistStore.$reset(); // On réinitialise le store de la wishlist
        }
        
        this.isLoading = false;
      });
    },

    cleanupListeners() {
      if (this._authListenerUnsubscribe) {
        this._authListenerUnsubscribe();
      }
    }
  },
});