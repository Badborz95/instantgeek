<template>
    <div class="container-fluid py-2 preco">
        <div>
            <h1 class="mt-3 mb-5">Recherche</h1>
            <form id="filter" action="" >
                <select v-model="selectedPlatform" @change="filterGames">
                    <option value="">Systèmes</option>
                    <option value="Steam">Steam</option>
                    <option value="Switch">Nintendo Switch</option>
                    <option value="Playstation">PlayStation</option>
                    <option value="Xbox">Xbox Series</option>
                </select>

                <select v-model="selectedGenre" @change="filterGames">
                    <option value="">Genres</option>
                    <option value="Action">Action</option>
                    <option value="Aventure">Aventure</option>
                    <option value="Histoire">Histoire</option>
                    <option value="Horreur">Horreur</option>
                    <option value="Indies">Indies</option>
                    <option value="Infiltration">Infiltration</option>
                    <option value="Multijoueur">Multijoueur</option>
                    <option value="RPG">RPG</option>
                    <option value="Difficulté">Difficulté</option>
                    <option value="FPS">FPS</option>
                    <option value="Roguelite">Roguelite</option>
                    <option value="Sport">Sport</option>
                    <option value="Anime">Anime</option>
                    <option value="Gestion">Gestion</option>
                    <option value="Stratégie">Stratégie</option>
                    <option value="Course">Course</option>
                    <option value="Simulation">Simulation</option>
                </select>

                <div class ="price">
                    <span>Entre</span>
                    <input type="number" v-model="selectedPriceMin" placeholder="Prix min" @input="filterGames" />
                    <span>à</span>
                    <input type="number" v-model="selectedPriceMax" placeholder="Prix max" @input="filterGames" />
                    <span>€</span>
                </div>
            </form>



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
const selectedPlatform = ref('');
const selectedGenre = ref('');
const selectedPriceMin = ref(null); 
const selectedPriceMax = ref(null);

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
                plateforme: data.plateforme,
                price: `${data.price}€`,
                date: data.dateSortie.toDate().toLocaleDateString('fr-FR'),
                tag: data.tag || []
            });
        });
        filterGames();
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
    }
};

/* Filtrage des jeux selon searchQuery */
function filterGames() {
    let filtered = allGames.value;

    // Filtre par searchQuery
    if (searchQuery.value) {
        filtered = filtered.filter(game =>
            game.titre.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }

    // Filtre par plateforme sélectionnée
    if (selectedPlatform.value) {
        filtered = filtered.filter(game =>
            game.plateforme.includes(selectedPlatform.value)
        );
    }

    // Filtre par genre sélectionné
    if (selectedGenre.value) {
        filtered = filtered.filter(game =>
            game.tag.includes(selectedGenre.value)
        );
    }
    // Filtre par prix minimum
    if (selectedPriceMin.value !== null && selectedPriceMin.value !== '') {
        filtered = filtered.filter(game => {
            const price = parseFloat(game.price.replace('€', ''));
            return price >= selectedPriceMin.value;
        });
    }
    // Filtre par prix maximum
    if (selectedPriceMax.value !== null && selectedPriceMax.value !== '') {
        filtered = filtered.filter(game => {
            const price = parseFloat(game.price.replace('€', ''));
            return price <= selectedPriceMax.value;
        });
    }

    games.value = filtered;
}

// Met à jour la liste à chaque changement de searchQuery ou selectedPlatform
watch([searchQuery, selectedPlatform, selectedGenre], filterGames);

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