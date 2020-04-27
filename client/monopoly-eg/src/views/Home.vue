<template>
  <div class="home">
    <div id="content">
      <div class="background-container"></div>

      <div class="welcome-screen">
          <router-link type="button" class="btn btn-primary stylized" to="Login">JOUER !</router-link>
      </div>
    </div>

    <div class="resolution-overlay-container">
        <div>Oups... c'est petit ici<br>Pense à étendre la fenêtre du jeu pour en profiter pleinement!</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>