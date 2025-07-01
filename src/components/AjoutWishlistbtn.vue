<template>
  <button @click.prevent="toggleWishlist" class="btn btn-sm wishlist-btn" 
          :class="{ 'in-wishlist': inList }">
    <i class="bi" :class="inList ? 'bi-heart-fill' : 'bi-heart'"></i>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { useWishlistStore } from '@/stores/wishlistStore';

// Props
const props = defineProps({
  gameId: {
    type: String,
    required: true,
  }
});

// Store
const wishlistStore = useWishlistStore();

// Computed pour vérifier si le jeu est dans la liste
const inList = computed(() => wishlistStore.isInWishlist(props.gameId));

// Méthode pour ajouter/retirer
const toggleWishlist = () => {
  if (inList.value) {
    wishlistStore.removeFromWishlist(props.gameId);
  } else {
    wishlistStore.addToWishlist(props.gameId);
  }
};
</script>

<style scoped>
.wishlist-btn {
    background-color: var(--interactive-comp-two);
    color: var(--text-two);
    border: 1px solid var(--border-separator-one);
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
}
.wishlist-btn:hover {
    background-color: var(--interactive-comp-three);
    border-color: var(--border-separator-two);
}
.wishlist-btn.in-wishlist {
    color: #E74C3C; /* Couleur rouge pour le coeur rempli */
    background-color: var(--interactive-comp-three);
}
</style>