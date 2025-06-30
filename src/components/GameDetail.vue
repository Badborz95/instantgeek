<template>
  <div class="container-fluid py-2 gameDetail" v-if="game" id="main-content">


    <div v-if="isMobile">
      <!--VERSION MOBILE-->
      <div class="background" :style="{ backgroundImage: `url(/assets/img/preview/${game.image})` }">
        <h1 class="title">{{ game.titre }}</h1>
        <div class="game-info">
          <h3 class="tags">
            <ul class="tag-list">
              <li v-for="(tag, index) in game.tags" :key="index" class="tag">
                {{ tag }}
              </li>
            </ul>
          </h3>

          <p class="synopsis">
            <TruncatedText :text="game.description" :maxLength="200" />
          </p>
        </div>
      </div>
      <div class="game-details">
        <div class="infos">
          <div class="infos1">
            <div class="paltform">
              <h3>{{ game.platform }}</h3>
            </div>
            <p>|</p>
            <div class="stock">
              <h3>En stock</h3>
            </div>
          </div>
          <h3 class="price">{{ game.price }}</h3>
        </div>
        <div class="buttons">
          <button class="favorite" @click="toggleWishlist" :class="{ 'in-wishlist': isGameInWishlist }">
          <i class="bi" :class="isGameInWishlist ? 'bi-heart-fill' : 'bi-heart'"></i>
          </button>
          <button class="cart" @click="ajouterAuPanier">
            <h3>Ajouter au panier</h3> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">!Font
              Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License -
              https://fontawesome.com/license/free
              Copyright 2025 Fonticons, Inc.-->
              <path
                d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
            </svg>
          </button>
        </div>
        <div class="description">
          <h3>Description</h3>
          {{ game.description }}
        </div>
      </div>
    </div>
    <div v-else>
      <!--VERSION DESKTOP-->
      <div class="background" :style="{ backgroundImage: `url(${game.hero})` }">
        <div>
          <img :src="`/assets/img/preview/${game.image}`" :alt="game.titre" />
        </div>
        <div class="desktop">
          <h1 class="title">{{ game.titre }}</h1>
          <div class="game-info">
            <h3 class="tags">
              <ul class="tag-list">
                <li v-for="(tag, index) in game.tags" :key="index" class="tag">
                  {{ tag }}
                </li>
              </ul>
            </h3>
            <p class="synopsis">
              <TruncatedText :text="game.description" :maxLength="450" />
            </p>
          </div>
          <div class="game-details">
            <div class="infos">
              <div class="infos1">
                <div class="paltform">
                  <h3>{{ game.platform }}</h3>
                </div>
                <p>|</p>
                <div class="stock">
                  <h3>En stock</h3>
                </div>
              </div>
              <h3 class="price">{{ game.price }}</h3>
            </div>
            <div class="buttons">
              <button class="favorite" @click="toggleWishlist" :class="{ 'in-wishlist': isGameInWishlist }">
                <i class="bi" :class="isGameInWishlist ? 'bi-heart-fill' : 'bi-heart'"></i>
                <span>{{ isGameInWishlist ? 'Dans la wishlist' : 'Ajouter aux favoris' }}</span>
              </button>
              <button class="cart" @click="ajouterAuPanier" >
                <h3>Ajouter au panier</h3> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">!Font
                  Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License -
                  https://fontawesome.com/license/free
                  Copyright 2025 Fonticons, Inc.-->
                  <path
                    d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
                </svg>
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
    <SimilarGames :tags="game.tags" :currentGameId="game.id" />
  </div>
  <div v-else>
    <p>Chargement du jeu...</p>
  </div>

</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue' 
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/index.js'
import TruncatedText from './TruncatedText.vue';
import SimilarGames from './SimilarGames.vue'
import { useCartStore } from '../stores/cartStore'
import { useWishlistStore } from '../stores/wishlistStore' 
import { useToast } from 'vue-toastification'


const toast = useToast()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const route = useRoute()
const gameId = ref(route.params.id) // ID du jeu dans l'URL
const game = ref(null)

const fetchGameById = async (id) => {
  try {
    const docRef = doc(db, 'games', id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      game.value = {
        id: docSnap.id,
        titre: data.name,
        link: data.link,
        image: data.image,
        price: `${Number(data.price).toFixed(2)}€`,
        date: data.dateSortie.toDate().toLocaleDateString('fr-FR'),
        description: data.description,
        tags: data.tag,
        platform: data.plateforme,
        hero: data.hero
      }
    } else {
      router.replace({ name: 'NotFound' }); // Assurez-vous que votre route 404 s'appelle 'NotFound'
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du jeu :', error)
  }
}

const isGameInWishlist = computed(() => {
  if (!game.value?.id) return false;
  return wishlistStore.isInWishlist(game.value.id);
});

const toggleWishlist = () => {
  if (!game.value?.id) return; // Sécurité

  if (isGameInWishlist.value) {
    wishlistStore.removeFromWishlist(game.value.id);
  } else {
    wishlistStore.addToWishlist(game.value.id);
  }
};

function ajouterAuPanier() {
  cartStore.addItem({
    id: game.value.id,
    name: game.value.titre,
    image: game.value.hero,
    price: parseFloat(game.value.price),
  })
  toast.success('Jeu ajouté au panier !', {
    timeout: 3000,
    position: 'bottom-right'
  })
}

// Facultatif : si on arrive sur ce composant déjà chargé mais avec un autre id (navigation interne)
watch(() => route.params.id, (newId) => {
  gameId.value = newId
  fetchGameById(newId)
})

//Vérifie si la taille de l'écran correspond à
const isMobile = ref(window.innerWidth < 768)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  if (gameId.value) {
    fetchGameById(gameId.value);
  }
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    gameId.value = newId;
    fetchGameById(newId);
  }
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.background {
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.5);
  padding: 0;
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}



.title {
  align-self: center;
  margin-bottom: 10px;
}

.game-info {
  align-self: flex-end;
  justify-content: flex-end;
}

.tags {
  width: 80%;
  justify-self: center;
  margin-bottom: 5px;
}

.tag-list {
  list-style-type: none;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.tag-list li {
  background-color: var(--background-one);
  padding: 7px;
  border-radius: 0.5em;
}

.synopsis {
  width: 70%;
  justify-self: center;
}

.title,
.tags,
.synopsis {
  padding: 15px;
  color: var(--text-two);
  background-color: color-mix(in srgb, var(--background-two) 80%, transparent);
  border-radius: 10px;
}

.price {
  font-size: 3em;
  justify-self: center;
  margin-top: 20px;
}

.game-details {
  background-color: var(--background-two);
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.infos {
  width: 92%;
  height: 200px;
  background-color: var(--interactive-comp-three);
  border-radius: 1em;
  margin-top: 20px;

}

.infos1 {
  display: flex;
  justify-content: space-evenly;
  background-color: var(--border-separator-two);
  width: 90%;
  justify-self: center;
  border-radius: 1em;
  padding: 5px;
  margin-top: 10px;
}

.infos p {
  font-size: 1.5em;
}

.buttons {
  display: flex;
  justify-content: space-between;
  width: 90%;
  margin-top: 20px;
  align-items: center;
}


.cart {
  width: 75%;
  display: flex;
  justify-content: space-evenly;
  height: 80px;
  background: var(--text-one);
  border-radius: 2em;
  border: solid 1px black;
  transition: background-color 0.3s, color 0.3s;
  font-weight: bold;
}

.cart:hover {
  background: var(--text-two);
}

.cart>svg {
  height: 60px;
  align-self: center;
}

.cart>h3 {
  align-self: center;
}

.favorite {
  width: 15%;
  height: 80px;
}

.description {
  height: auto;
  background-color: var(--background-two);
  padding: 20px 50px;
}

.description h3 {
  margin-bottom: 30px;
}

/* Style pour les boutons de la wishlist */

.favorite {
  width: 15%; /* Pour la version mobile */
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* Espace entre l'icône et le texte */
  border: 1px solid var(--border-separator-one);
  background-color: var(--interactive-comp-one);
  color: var(--text-one);
  border-radius: 2em;
  font-size: 1.5rem; /* Taille de l'icône */
  cursor: pointer;
  transition: all 0.3s ease;
}
.favorite:hover {
  background-color: var(--interactive-comp-three);
  border-color: var(--border-separator-three);
}

.favorite.in-wishlist {
  background-color: var(--interactive-comp-two);
  opacity: 0.5;
  color: var(--text-two);
  border-color: var(--border-separator-three);
}

/*VERSION DESKTOP*/
@media (min-width: 768px) {
  .background {
    height: 900px;
    padding: 8% 15%;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }


  .background::before {
    /*"détache" l'image de fondd des autres éléments en en créant une copie afin de la modifier*/
    content: "";
    position: absolute;
    inset: 0;
    background-image: inherit;
    background-size: cover;
    background-position: center;
    filter: blur(6px);
    z-index: 0;
    transform: scale(1.1);
    /* Évite les bords visibles du blur */
  }

  .background {
    position: relative;
    overflow: hidden;
  }

  .background>* {
    position: relative;
    z-index: 1;
    /*¨Place les éléments à l'intérieur devant le fond*/
  }

  .background img {
    width: 97%;
    border-radius: 20px;
  }

  .desktop {
    width: 60%;
  }

  .title {
    justify-self: flex-end;
    margin-right: 4%;
  }

  .tags {
    width: 60%;
    justify-self: flex-end;
  }

  .synopsis {
    width: 70%;
    justify-self: flex-end;
  }

  .game-info {
    padding-right: 4%;
  }

  .game-details {
    background-color: transparent;
  }
  .favorite {
      width: auto; /* La taille s'adapte au contenu */
      padding: 0 20px; /* Un peu d'espace horizontal */
      font-size: 1rem; /* Taille du texte normal */
  }
  .favorite i {
      font-size: 1.2rem; /* Taille de l'icône sur desktop */
  }
}
</style>
