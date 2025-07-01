<template>
  <div class="container-fluid py-2 logos">


<a href="#"><img src="/assets/img/logos/playstation_icon.png"/></a>
<a href="#"><img src="/assets/img/logos/xbox_game_console_play_icon.png"/></a>
<a href="#"><img src="/assets/img/logos/switch_icon.png"/></a>
<a href="#"><img src="/assets/img/logos/square_steam_icon.png"/></a>
<a href="#"><img src="/assets/img/logos/epic_games_icon.png"/></a>
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