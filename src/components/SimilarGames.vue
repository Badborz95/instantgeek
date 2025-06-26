<template>
    <div v-if="similarGames.length">
        <h2>Jeux similaires</h2>
        <div class="row">
            <div v-for="game in similarGames" :key="game.id" class="col-6 col-md-3 mb-4">
                <router-link :to="`/game/${game.id}`" class="text-decoration-none">
                    <div class="card h-100">
                        <img :src="`/assets/img/preview/${game.image}`" class="card-img-top" :alt="game.titre" />
                        <div class="card-body">
                            <h5 class="card-title">{{ game.titre }}</h5>
                            <p class="card-text">{{ game.price }}</p>
                        </div>
                    </div>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/index.js'


//Récpère les tags du jeu affiché
const props = defineProps({
    tags: {
        type: Array,
        required: true
    },
    currentGameId: {
        type: String,
        required: true
    }
})

const similarGames = ref([])

const fetchSimilarGames = async () => {
    const gamesRef = collection(db, 'games')
    const fetchedGames = []
    const snapshot = await getDocs(gamesRef)

    snapshot.forEach(docSnap => {
        const data = docSnap.data()
        const gameTags = data.tag || []

        if (docSnap.id !== props.currentGameId) {
            // Vérifie le nombre de tags en commun
            const commonTags = gameTags.filter(tag => props.tags.includes(tag))
            if (commonTags.length >= 3) { //Ajoute aux jeux récupérés uniquement ceux qui en ont au moins 3 en commun
                fetchedGames.push({
                    id: docSnap.id,
                    titre: data.name,
                    image: data.image,
                    price: `${data.price}€`
                })
            }
        }
    })

    similarGames.value = fetchedGames
}

watch(() => props.tags, fetchSimilarGames, { immediate: true })
</script>
