<template>
  <Navbar />
  <main>
    <div class="container py-5">
      <h1 class="mb-4">Ma Wishlist ({{ sortedGames.length }} jeux)</h1>

      <div class="d-flex justify-content-end mb-4">
        <select class="form-select" style="max-width: 200px;" v-model="sortBy">
          <option value="default">Trier par...</option>
          <option value="price-asc">Prix : le moins cher</option>
          <option value="price-desc">Prix : le plus cher</option>
          <option value="date-desc">Nouveautés</option>
        </select>
      </div>

      <div v-if="isLoading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="!games.length" class="text-center p-5 empty-wishlist-card">
        <h3>Votre wishlist est vide</h3>
        <p>Parcourez nos jeux et cliquez sur le cœur pour les ajouter !</p>
        <router-link to="/" class="btn btn-primary">Explorer les jeux</router-link>
      </div>

      <div v-else class="row g-4">
        <div v-for="game in sortedGames" :key="game.id" class="col-6 col-md-4 col-lg-3">

          <div class="card h-100 game-card">
            <router-link class="nav-link" :to="`/game/${game.id}`">
              <img :src="game.hero" class="card-img-top" :alt="game.titre">
            </router-link>

            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ game.titre }}</h5>
              <p class="card-text mt-auto mb-2 price">{{ game.price }} €</p>
              <button @click="wishlistStore.removeFromWishlist(game.id)" class="btn btn-danger btn-sm">
                <i class="bi bi-trash-fill"></i> Retirer
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import Navbar from '../components/Navbar.vue';
import { ref, onMounted, watch, computed } from 'vue';
import { useWishlistStore } from '../stores/wishlistStore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/index';

const wishlistStore = useWishlistStore();
const games = ref([]); // Contiendra les objets de jeu complets
const isLoading = ref(false);
const sortBy = ref('default');

const formatGameData = (doc) => {
  const data = doc.data();
  const dateObject = data.dateSortie.toDate();

  return {
    id: doc.id,
    titre: data.name,
    link: data.link,
    image: data.image,
    hero: data.hero,
    price: `${data.price.toFixed(2)}`,
    numericPrice: data.price,
    date: dateObject.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
    dateObject: dateObject,
    description: data.description,
    tags: data.tag,
    platform: data.plateforme
  };
};

// Filtrer les jeux en fonction de la plateforme sélectionnée
const sortedGames = computed(() => {
  // On crée une copie pour ne pas modifier la liste originale
  const gamesToSort = [...games.value];

  switch (sortBy.value) {
    case 'price-asc':
      // Tri par prix, du moins cher au plus cher
      return gamesToSort.sort((a, b) => a.numericPrice - b.numericPrice);
    case 'price-desc':
      // Tri par prix, du plus cher au moins cher
      return gamesToSort.sort((a, b) => b.numericPrice - a.numericPrice);
    case 'date-desc':
      // Tri par date, du plus récent au plus ancien
      return gamesToSort.sort((a, b) => b.dateObject - a.dateObject);
    default:
      // Pas de tri, on retourne la liste originale
      return gamesToSort;
  }
});

// Fonction pour récupérer les détails des jeux à partir des IDs
const fetchGameDetails = async (gameIds) => {
  if (gameIds.length === 0) {
    games.value = [];
    return;
  }
  isLoading.value = true;
  const gamesRef = collection(db, 'games');
  const q = query(gamesRef, where('__name__', 'in', gameIds));

  const querySnapshot = await getDocs(q);

  games.value = querySnapshot.docs.map(doc => formatGameData(doc));

  isLoading.value = false;
};

// Quand le composant est monté, on récupère la wishlist
onMounted(async () => {
  await wishlistStore.fetchWishlist();
  fetchGameDetails(wishlistStore.gameIds);
});

// Surveiller les changements dans la wishlist (exemple: suppression d'un item)
// pour mettre à jour la liste affichée en temps réel.
watch(() => wishlistStore.gameIds, (newIds) => {
  fetchGameDetails(newIds);
});
</script>

<style scoped>
/* Applique les variables CSS pour la page */
main {
  background-color: var(--background-one);
  color: var(--text-one);
  min-height: 100vh;
}

h1 {
  color: var(--text-high-contrast);
}

.form-select {
  background-color: var(--interactive-comp-one);
  color: var(--text-one);
  border-color: var(--border-separator-one);
}

.game-card {
  background-color: var(--background-two);
  border: 1px solid var(--border-separator-one);
  color: var(--text-one);
  transition: transform 0.2s ease-in-out;
}

.game-card:hover {
  transform: translateY(-5px);
  border-color: var(--border-separator-three);
}

.game-card .card-title {
  color: var(--text-two);
}

.game-card .price {
  color: var(--solid-one);
  font-weight: bold;
  font-size: 1.2rem;
}

.empty-wishlist-card {
  background-color: var(--background-two);
  border-radius: 8px;
  border: 1px dashed var(--border-separator-two);
}
</style>