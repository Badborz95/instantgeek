<template>
  <div class="container-fluid py-2 logos">
    <a href="/recherche?platform=Playstation"><img src="/assets/img/logos/playstation_icon.png" alt="Playstation"/></a>
    <a href="/recherche?platform=Xbox"><img src="/assets/img/logos/xbox_game_console_play_icon.png" alt="Xbox"/></a>
    <a href="/recherche?platform=Switch"><img src="/assets/img/logos/switch_icon.png" alt="Switch"/></a>
    <a href="/recherche?platform=Steam"><img src="/assets/img/logos/square_steam_icon.png" alt="Steam"/></a>
    <a href="/recherche?platform=Epic%20Games"><img src="/assets/img/logos/epic_games_icon.png" alt="Epic Games"/></a>
  </div>
  

</template>

<script setup>

</script>

<style>
.logos{
    height: 200px;
    display: flex;
    justify-content: space-evenly;
    align-items:center;
    background-color: var(--interactive-comp-three);
}

.logos img{
  height: 100px;
  max-width: 120px;
  width: auto;
  object-fit: contain;
}

@media(max-width:800px){
  .logos img{
    height: 60px;
    max-width: 70px;
  }
  .logos{
    height: 100px;
  }
}
</style>