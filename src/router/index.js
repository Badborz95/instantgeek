import { createRouter, createWebHistory } from 'vue-router'
import Accueil from '../views/Accueil.vue'

// Nous importons les composants pour les autres pages.
// Vous devrez créer ces fichiers dans votre dossier /views.
import Nouveautes from '../views/Nouveautes.vue'
import Precommandes from '../views/Precommandes.vue'
import ProchainesSorties from '../views/ProchainesSorties.vue'
import Inscription from '../views/Inscription.vue';
import Connexion from '../views/Connexion.vue';
import GameDetail from '../views/GameDetailPage.vue';
import NotFound from '../views/Page404.vue';
import Recherche from '../views/Recherche.vue';

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
        name: 'inscription', // Ajout d'un nom pour la route d'inscription
        component: Inscription 
    },
    { 
        path: '/connexion',
        name: 'connexion', // Ajout d'un nom pour la route de connexion
        component: Connexion 
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
        path: '/game/:id',
        name: 'gameDetailPage',
        component: GameDetail
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFound
    }
    // Ajoutez d'autres routes ici si nécessaire
  ],
  // Cette fonction permet de styliser le lien actif dans la navbar
  linkActiveClass: 'active' 
})

export default router
