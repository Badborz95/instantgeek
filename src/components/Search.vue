<template>
    <div class="container-fluid py-2 preco">
        <div>
            <h1 class="mt-3 mb-5">Recherche</h1>
            <ul id='precoIn'>
                <li v-for="game in games" :key="game.id">
                    <div class="game-card">
                        <a :href="game.link"><img :src="`/assets/img/preview/${game.image}`" :alt="game.titre" /></a>
                        <div class="game-text">
                            <h3 class="titre">{{ game.titre }}</h3>
                            <h3 class="prix">{{ game.price }}</h3>
                        </div>
                        <p class="dateSortie">{{ game.date }}</p>
                    </div>
                </li>
            </ul>
            <div v-if="games.length === 0" class="text-center mt-2">
                <h4>Aucun jeu trouvé pour cette recherche.</h4>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/index.js';
import { searchQuery } from '../composables/searchState.js'

const allGames = ref([]);
const games = ref([]);

const fetchAllGames = async () => {
    const gamesRef = collection(db, 'games');
    const gamesQuery = query(gamesRef, orderBy('name'));
    try {
        const querySnapshot = await getDocs(gamesQuery);
        allGames.value = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            allGames.value.push({
                id: doc.id,
                titre: data.name,
                link: data.link,
                image: data.image,
                price: `${data.price}€`,
                date: data.dateSortie.toDate().toLocaleDateString('fr-FR'),
            });
        });
        filterGames();
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
    }
};

/* Filtrage des jeux selon searchQuery */
function filterGames() {
    if (!searchQuery.value) {
        games.value = allGames.value;
    } else {
        games.value = allGames.value.filter(game =>
            game.titre.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }
}

// Met à jour la liste à chaque changement de searchQuery
watch(searchQuery, filterGames);

onMounted(() => {
    fetchAllGames();
});
</script>

<style scoped>
h1,
p {
    text-align: center;
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;

}

a {
    text-decoration: none;
}

.container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.preco {
    align-items: end;
    justify-content: end;
}

#precoIn {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 0;
    max-width: 1300px;
    /* ou 1200px selon votre préférence */
    margin: 0 auto;
}

.game-card {
    width: 100%;
    height: auto;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    transition: all 300ms;
    margin: 0;
}

.game-card:hover {
    transform: scale(1.1);

}

.game-card img {
    inline-size: 100%;
    aspect-ratio: 16 / 9;
    object-fit: fill;
    display: grid;
    grid-template-rows: min-content;
    border-radius: 5%;
    box-shadow: #061d20 5px 10px 10px 0px;
}

.game-card img:hover {
    box-shadow: 4px 5px 17px -4px #268391;
}

.game-card h3 {
    margin-left: 1px;
    margin-top: 5px;
    font-size: 1em
}

.game-card .game-text {
    display: flex;
    justify-content: space-between;
}

.dateSortie {
    text-align: start;
}

@media (min-width: 1250px) {

    h1,
    p {
        text-align: start;
        margin-left: 50px;
    }

    .dateSortie {
        text-align: start;
        margin: 0px;
    }

    #precoIn {
        overflow-x: visible;
        grid-template-columns: 1fr 1fr 1fr;
        grid-auto-flow: row;
        margin-left: auto;
        margin-right: auto;
        gap: 50px;
        padding: 0 80px;
        /* Plus d'espace sur grand écran */
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