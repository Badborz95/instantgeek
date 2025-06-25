<template>
  <div class="container-fluid py-2 gameDetail" v-if="game">
    <div class="background" :style="{ backgroundImage: `url(/assets/img/preview/${game.image})` }">
      <h1 class="title">{{ game.titre }}</h1>
      <div class="game-info">
        <h3 class="tags">Tags :{{ game.price }}</h3>
        <p class="synopsis">
          Synopsis : <!---<TruncatedText :text="game.titre" :maxLength="80" />-->
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quas et est perspiciatis vel at culpa alias, libero
          maiores, eos esse, ex voluptatibus dicta soluta a nobis neque vitae illum blanditiis.
        </p>
      </div>
    </div>
    <div class="game-details">
      <div class="infos">
        <div class="paltform"></div>
        <div class="stock"></div>
        <div class="price"></div>
      </div>
      <div class="buttons">
        <div class="favorite"></div>
        <div class="cart"></div>
      </div>
      <div class="description"></div>
    </div>

  </div>
  <div v-else>
    <p>Chargement du jeu...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/index.js'
import TruncatedText from './TruncatedText.vue';

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
        price: `${data.price}€`,
        date: data.dateSortie.toDate().toLocaleDateString('fr-FR'),
      }
    } else {
      router.replace({ name: 'not-found' }); //Redirige vers la page 404 si aucun ID trouvé
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du jeu :', error)
  }
}

onMounted(() => {
  if (gameId.value) fetchGameById(gameId.value)
})

// Facultatif : si on arrive sur ce composant déjà chargé mais avec un autre id (navigation interne)
watch(() => route.params.id, (newId) => {
  gameId.value = newId
  fetchGameById(newId)
})
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title {
  align-self: center;
}

.game-info {
  align-self: flex-end;
  justify-content: flex-end;
}

.tags {
  width: 30%;
  justify-self: flex-end;
}

.synopsis {
  width: 50%;
  justify-self: flex-end;
}

.title,
.tags,
.synopsis {
  padding: 15px;
  color: var(--text-two);
  background-color: color-mix(in srgb, var(--background-two) 80%, transparent);
  border-radius: 10px;
}

.game-details {
  background-color: var(--background-two);
  height: 500px;
}
</style>
