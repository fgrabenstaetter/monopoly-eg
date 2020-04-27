<template>
  <div class="home">
    <div id="content">

      <div class="welcome-screen">
        <div class="outer">
          <div class="inner">
            <div class="gradient-wrap">
              <div class="gradient"></div>
            </div>
            <div class="gradient-wrap">
              <div class="gradient"></div>
            </div>
          </div>
        </div>
        <img id="logo" src="../../../ui/img/ui/logo.png">
        <img id="montgolfiere" src="../../../ui/img/ui/montgolfiere.png">
        <img id="bus" src="../../../ui/img/ui/bus.png">
        <img id="bateau" src="../../../ui/img/ui/bateau.png">
        <router-link type="button" class="btn" to="Login">JOUER !</router-link>
      </div>
    </div>

    <div class="resolution-overlay-container">
      <div>
        Oups... c'est petit ici
        <br />Pense à étendre la fenêtre du jeu pour en profiter pleinement!
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home"
};
</script>