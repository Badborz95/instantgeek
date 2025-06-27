<template>
    <div class="container-fluid py-2 preco" id="main-content">
        <div>
            <h1 class="mt-3 mb-5">Recherche</h1>
            <form id="filter">
                <select v-model="selectedPlatform" @change="filterGames" class="form-select">
                    <option value="">Systèmes</option>
                    <option value="Steam">Steam</option>
                    <option value="Switch">Nintendo Switch</option>
                    <option value="Playstation">PlayStation</option>
                    <option value="Xbox">Xbox Series</option>
                </select>

                <select v-model="selectedGenre" @change="filterGames" class="form-select">
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
                    <input type="number" v-model="selectedPriceMin" placeholder="Prix min" @input="filterGames" class="form-control"/>
                    <span>à</span>
                    <input type="number" v-model="selectedPriceMax" placeholder="Prix max" @input="filterGames" class="form-control" />
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

#filter {
  display: flex;
  flex-direction: row;
  gap: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-inline: contain;
  scrollbar-color: var(--interactive-comp-two) var(--interactive-comp-one);
  scroll-snap-type: inline mandatory;
  scroll-padding-inline: 30px;
  padding-bottom: 10px;
  flex-wrap: nowrap;
}

#filter > * {
  flex: 0 0 auto;
  scroll-snap-align: start;
}

.form-select {
  --bs-form-select-bg-img: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  display: block;
  width: 40%;
  padding: 0.375rem 2.25rem 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-high-contrast);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: var(--interactive-comp-one);
  background-image: var(--bs-form-select-bg-img), var(--bs-form-select-bg-icon, none);
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  border: var(--bs-border-width) solid var(--border-separator-one);
  border-radius: var(--bs-border-radius);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  margin-top: 10px;
}

.form-select:hover {
  border-color: var(--border-separator-two);
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.price {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.price input {
  min-width: 70px;
  max-width: 90px;
  width: 90px;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  box-sizing: border-box;
  background-color: var(--interactive-comp-one);
  border: var(--bs-border-width) solid var(--border-separator-one);
  color: var(--text-high-contrast);
}

.price input:hover {
  border-color: var(--border-separator-two);
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.price input::placeholder {
  color: var(--text-high-contrast);
  opacity: 0.5; 
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

    .form-select{
        width: 15%;
    }

        #filter {
        justify-content: center;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 2rem;
    }

}
</style>