import { defineStore } from 'pinia';
import { auth, db } from '../firebase'; // ✅ CORRECTION : Ajout de l'import de 'db'
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // Contient l'objet utilisateur Firebase si connecté
    isLoading: true, // Pour savoir si l'état d'authentification est chargé
    userData: null, // Données supplémentaires de l'utilisateur depuis Firestore
    userWishlistCount: null, // ⭐ AMÉLIORATION : Compteur pour la wishlist
    _authListenerUnsubscribe: null, // Pour se désinscrire de l'écouteur onAuthStateChanged
    _wishlistListenerUnsubscribe: null, // Pour se désinscrire de l'écouteur de la wishlist
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    // ⭐ AMÉLIORATION : Getter plus robuste pour le nom d'utilisateur
    // Il cherche d'abord dans vos données Firestore, puis le displayName de l'auth, et enfin l'email.
    currentUsername: (state) => {
      if (state.userData && state.userData.displayName) {
        return state.userData.displayName;
      }
      if (state.user && state.user.displayName) {
        return state.user.displayName;
      }
      if (state.user && state.user.email) {
        return state.user.email.split('@')[0]; // Retourne la partie avant le @ comme fallback
      }
      return 'Invité';
    },
  },

  actions: {
    initAuthListener() {
      // Évite de créer plusieurs écouteurs
      if (this._authListenerUnsubscribe) return;

      this._authListenerUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        this.isLoading = true;
        
        if (firebaseUser) {
          this.user = firebaseUser;
          // Récupère les données de Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            this.userData = userDocSnap.data();
          } else {
            // Cas où l'utilisateur auth existe mais pas le document Firestore (rare)
            this.userData = null;
            console.warn("L'utilisateur est authentifié mais pas de données trouvées dans Firestore.");
          }
          // ⭐ AMÉLIORATION : Lance l'écouteur pour la wishlist de l'utilisateur connecté
          this.listenToUserWishlist();

        } else {
          // Si l'utilisateur est déconnecté
          this.user = null;
          this.userData = null;
          // Stoppe l'écouteur de la wishlist car l'utilisateur est déconnecté
          if (this._wishlistListenerUnsubscribe) {
            this._wishlistListenerUnsubscribe();
            this._wishlistListenerUnsubscribe = null;
          }
          this.userWishlistCount = null;
        }
        
        this.isLoading = false;
      });
    },

    // ⭐ AMÉLIORATION : Action dédiée pour écouter les changements sur la wishlist
    listenToUserWishlist() {
        // Stoppe l'ancien écouteur s'il existe
        if (this._wishlistListenerUnsubscribe) {
            this._wishlistListenerUnsubscribe();
        }

        if (!this.user) return; // Ne fait rien si aucun utilisateur n'est connecté

        const wishlistDocRef = doc(db, 'users', this.user.uid, 'privateData', 'wishlist');
        
        this._wishlistListenerUnsubscribe = onSnapshot(wishlistDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().items) {
                this.userWishlistCount = docSnap.data().items.length;
            } else {
                this.userWishlistCount = 0;
            }
        }, (error) => {
            console.error("Erreur lors de l'écoute de la wishlist:", error);
            this.userWishlistCount = 0;
        });
    },

    // Action pour se désinscrire des écouteurs lors de la destruction du store (si nécessaire)
    cleanupListeners() {
        if (this._authListenerUnsubscribe) {
            this._authListenerUnsubscribe();
        }
        if (this._wishlistListenerUnsubscribe) {
            this._wishlistListenerUnsubscribe();
        }
    }
  },
});