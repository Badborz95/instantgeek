<template>
    <div v-if="similarGames.length" class="similar">
        <h2>Jeux similaires</h2>
        <div class="row">
            <ul class="media-scroller snaps-inline" id='similarIn'>
            <div v-for="game in similarGames" :key="game.id" class="col-6 col-md-3 mb-4">
                <router-link :to="`/game/${game.id}`" class="text-decoration-none">
                    <div class="game-card mt-4 mb-5">
                        <router-link class="nav-link" :to="`/game/${game.id}`"><img
                                :src="`/assets/img/preview/${game.image}`" :alt="game.titre" /></router-link>
                        <div class="game-text">
                            <h3 class="titre">{{ game.titre }} :</h3>
                            <h3 class="prix">{{ game.price }}</h3>
                        </div>
                        <h2></h2>
                    </div>
                </router-link>
            </div>
            </ul>
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
            if (commonTags.length >= 2) { //Ajoute aux jeux récupérés uniquement ceux qui en ont au moins 3 en commun
                fetchedGames.push({
                    id: docSnap.id,
                    titre: data.name,
                    image: data.image,
                    price: `${data.price}€`,
                    commonTagCount: commonTags.length //enregistre le nombre de tags en commun
                })
            }
        }
    })

    fetchedGames.sort((a, b) => b.commonTagCount - a.commonTagCount) //Trie les jeux en mettand d'abord ceux qui ont le plus de tags en commun
    similarGames.value = fetchedGames.slice(0, 12) //Affiche un maximum de 12 jeux
}

watch(() => props.tags, fetchSimilarGames, { immediate: true })
</script>

<style scoped>
:global(body) {
    margin: 0;
    overflow-x: hidden;
}

.similar {
    width: 100%;
    height: 340px;
    padding: 30px;
}

.game-card {
    width: 200px;
    height: 150px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    transition: all 300ms;
}

.game-card:hover {
    transform: scale(1.1);
}

.game-card img {
    inline-size: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: grid;
    gap: 20px;
    grid-template-rows: min-content;
    border-radius: 5%;
    box-shadow: #061d20 5px 10px 10px 0px;
}

.game-card img:hover {
    box-shadow: 4px 5px 17px -4px #268391;
}

.game-card h3 {
    margin-left: 10px;
    margin-top: 5px;
    font-size: 1.4em;
    color: var(--text-one);
}

.game-card .game-text {
    display: flex;
    justify-content: space-between;
}


.media-scroller {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 25%;
    gap: 150px;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-inline: contain;
    scrollbar-color: var(--interactive-comp-two) var(--interactive-comp-one);
}

.snaps-inline {
    scroll-snap-type: inline mandatory;
    scroll-padding-inline: 0px;
}

.snaps-inline>* {
    scroll-snap-align: start;
}


@media (min-width: 1250px) {
.similar{
  height: 1250px;
}

#similarIn{
  overflow-x: hidden;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-auto-flow: row;
  padding-right: 50px;
  gap: 50px;
}
  .game-card {
    width: 350px;
    height: 275px;
    margin-bottom: 0;
  }

  .game-text {
    font-size: 1.3em;
  }

}
</style>