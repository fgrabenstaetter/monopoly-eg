<template>
  <div class="home">
    <div id="content">
      <div class="background-container"></div>

      <div class="welcome-screen">
          <router-link type="button" class="btn btn-primary stylized" to="/login">JOUER !</router-link>
          <!-- <button type="button" onclick="router.navigate('/login'); return false;" class="btn btn-primary stylized">JOUER!</button> -->
      </div>
    </div>

    <div class="resolution-overlay-container">
        <div>Oups... c'est petit ici<br>Pense à étendre la fenêtre du jeu pour en profiter pleinement!</div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

// export default {
//   name: 'Home',
//   components: {
//     HelloWorld
//   }
// }
</script>