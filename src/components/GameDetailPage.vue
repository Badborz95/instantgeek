<template>
  <div class="container-fluid py-2 gameDetailPage" v-if="game">
    <h1>{{ game.titre }}</h1>
    <h3>{{ game.price }}</h3>
    <p>Date de sortie : {{ game.date }}</p>
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

<style scoped></style>
