import { createRouter, createWebHistory } from 'vue-router'
import Accueil from '../views/Accueil.vue'

// Nous importons les composants pour les autres pages.
import Nouveautes from '../views/Nouveautes.vue'
import Precommandes from '../views/Precommandes.vue'
import ProchainesSorties from '../views/ProchainesSorties.vue'
import Inscription from '../views/Inscription.vue';
import Connexion from '../views/Connexion.vue';
import Panier from '../views/Panier.vue';
import GameDetail from '../views/GameDetailPage.vue';
import NotFound from '../views/Page404.vue';
import Recherche from '../views/Recherche.vue';
import Parametres from '../views/Parametres.vue';
import Wishlist from '../views/Wishlist.vue'
import Validation from '../views/Validation.vue';
import MesAchats from '../views/MesAchats.vue'
import Paiement from '../views/Paiement.vue';
import Conditions from '../views/Conditions.vue';
import Politique from '../views/Politique.vue';
import A_Propos from '../views/A_Propos.vue';
import Contact from '../views/Contact.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'accueil',
      component: Accueil
    },
    {
      path: '/nouveautes',
      name: 'nouveautes',
      component: Nouveautes
    },
    {
      path: '/precommandes',
      name: 'precommandes',
      component: Precommandes
    },
    {
        path: '/prochaines-sorties',
        name: 'prochaines-sorties',
        component: ProchainesSorties
    },
    { 
        path: '/inscription',
        name: 'inscription', 
        component: Inscription 
    },
    { 
        path: '/connexion',
        name: 'connexion', 
        component: Connexion 
    },
    {
    path: '/parametres',
    name: 'Parametres',
    component: Parametres, 
    },
    {
      path: '/panier',
      name: 'panier',
      component: Panier
    },
    {
      path: '/validation/:orderId',
      name: 'validation',
      component: Validation
    },
    {
      path: '/mes-achats',
      name: 'mesAchats',
      component: MesAchats
    },
    {
      path: '/game/:id',
      name: 'gameDetailPage',
      component: GameDetail
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    },
    {
      path: '/recherche',
      name: 'recherche',
      component: Recherche
    },
    {
      path: '/paiement',
      name: 'paiement',
      component: Paiement
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: Wishlist
    },
    {
      path: '/conditions',
      name: 'conditions',
      component: Conditions
    },
    {
      path: '/politique',
      name: 'politique',
      component: Politique
    },
    {
      path: '/a_propos',
      name: 'a_propos',
      component: A_Propos
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact
    },
  ],
  
  // Permet de garder l'historique de navigation
  history: createWebHistory(import.meta.env.BASE_URL),
  
  // Cette fonction permet de styliser le lien actif dans la navbar
  linkActiveClass: 'active',

  scrollBehavior(to, from, savedPosition) {
    // Toujours revenir en haut de la page en changeant de page
    return { top: 0 }
  }
  
})

export default router
