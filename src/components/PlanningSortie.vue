<template>
    <div class="container-fluid py-2 preco">
        <div>
            <h1 class="mt-3 mb-5">Prochaines sorties</h1>
            <h2 class="text-center"><u>Juillet</u></h2>
            <br/>
            <ul id='precoIn'>
                <li v-for="game in gamesJuill" :key="game.id">
                    <div class="game-card GameJuill">
                        <a :href="game.link"><img :src="`/assets/img/preview/${game.image}`" :alt="game.titre" /></a>
                        <div class="game-text">
                            <h3 class="titre">{{ game.titre }}</h3>
                            <h3 class="prix">{{ game.price }}</h3>
                        </div>
                        <p class="dateSortie">{{ game.date }}</p>
                    </div>
                </li>
            </ul>
            <h2 class="text-center mt-4 mb-5"><u>Août</u></h2>
            <ul id='precoIn'>
                <li v-for="game in gamesAout" :key="game.id">
                    <div class="game-card GameAout">
                        <a :href="game.link"><img :src="`/assets/img/preview/${game.image}`" :alt="game.titre" /></a>
                        <div class="game-text">
                            <h3 class="titre">{{ game.titre }}</h3>
                            <h3 class="prix">{{ game.price }}</h3>
                        </div>
                        <p class="dateSortie">{{ game.date }}</p>
                    </div>
                </li>
            </ul>
            <h2 class="text-center mt-4 mb-5"><u>Septembre</u></h2>
            <ul id='precoIn'>
                <li v-for="game in gamesSept" :key="game.id">
                    <div class="game-card GameAout">
                        <a :href="game.link"><img :src="`/assets/img/preview/${game.image}`" :alt="game.titre" /></a>
                        <div class="game-text">
                            <h3 class="titre">{{ game.titre }}</h3>
                            <h3 class="prix">{{ game.price }}</h3>
                        </div>
                        <p class="dateSortie">{{ game.date }}</p>
                    </div>
                </li>
            </ul>
            <h2 class="text-center mt-4 mb-5"><u>Octobre</u></h2>
            <ul id='precoIn'>
                <li v-for="game in gamesOct" :key="game.id">
                    <div class="game-card GameAout">
                        <a :href="game.link"><img :src="`/assets/img/preview/${game.image}`" :alt="game.titre" /></a>
                        <div class="game-text">
                            <h3 class="titre">{{ game.titre }}</h3>
                            <h3 class="prix">{{ game.price }}</h3>
                        </div>
                        <p class="dateSortie">{{ game.date }}</p>
                    </div>
                </li>
            </ul>
            <h2 class="text-center mt-4 mb-5"><u>Novembre</u></h2>
            <ul id='precoIn'>
                <li v-for="game in gamesNov" :key="game.id">
                    <div class="game-card GameAout">
                        <a :href="game.link"><img :src="`/assets/img/preview/${game.image}`" :alt="game.titre" /></a>
                        <div class="game-text">
                            <h3 class="titre">{{ game.titre }}</h3>
                            <h3 class="prix">{{ game.price }}</h3>
                        </div>
                        <p class="dateSortie">{{ game.date }}</p>
                    </div>
                </li>
            </ul>
            <h2 class="text-center mt-4 mb-5"><u>Décembre</u></h2>
            <ul id='precoIn'>
                <li v-for="game in gamesDec" :key="game.id">
                    <div class="game-card GameAout">
                        <a :href="game.link"><img :src="`/assets/img/preview/${game.image}`" :alt="game.titre" /></a>
                        <div class="game-text">
                            <h3 class="titre">{{ game.titre }}</h3>
                            <h3 class="prix">{{ game.price }}</h3>
                        </div>
                        <p class="dateSortie">{{ game.date }}</p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/index.js';

const gamesJuill = ref([]);
const gamesAout = ref([]);
const gamesSept = ref([]);
const gamesOct = ref([]);
const gamesNov = ref([]);
const gamesDec = ref([]);

/*Fonction pour récupérer les jeux de la BDD Firebase*/
const fetchAllGames = async () => {
    const gamesRef = collection(db, 'games');

    const startDate = new Date('2025-07-01T00:00:00');
    const endDate = new Date('2025-12-31T23:59:59');

    const gamesQuery = query(
        gamesRef,
        where('dateSortie', '>=', startDate),
        where('dateSortie', '<=', endDate),
        orderBy('dateSortie')
    );

    try {
        const querySnapshot = await getDocs(gamesQuery);
        gamesJuill.value = [];
        gamesAout.value = [];
        gamesSept.value = [];
        gamesOct.value = [];
        gamesNov.value = [];
        gamesDec.value = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const sortie = data.dateSortie.toDate();
            const game = {
                id: doc.id,
                titre: data.name,
                link: data.link,
                image: data.image,
                price: `${data.price}€`,
                date: sortie.toLocaleDateString('fr-FR'),
            };
            switch (sortie.getMonth()) {
                case 6:
                    gamesJuill.value.push(game);
                    break;
                case 7:
                    gamesAout.value.push(game);
                    break;
                case 8:
                    gamesSept.value.push(game); 
                    break;
                case 9:
                    gamesOct.value.push(game);
                    break;
                case 10:
                    gamesNov.value.push(game);
                    break;
                case 11:
                    gamesDec.value.push(game);
                    break;
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
    }
};

// Exécute la fonction de récupération des jeux quand le composant est monté
onMounted(() => {
    fetchAllGames();
});
</script>

<style scoped>

h1, p{
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
    max-width: 1300px; /* ou 1200px selon votre préférence */
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

.dateSortie{
    text-align: start;
}

@media (min-width: 1250px) {

    h1, p{
    text-align: start;
    margin-left: 50px;
}

.dateSortie{
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
        padding: 0 80px; /* Plus d'espace sur grand écran */
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