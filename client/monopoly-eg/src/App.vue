<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <router-view/>

    <div v-if="toastContent" v-html="toastContent" class="toast-notification" :class="toastClass">{{toastContent}}</div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      toastContent: '',
      toastClass: ''
    }
  },
  methods: {
    /**
     * Crée une notification "toast"
     * @param {string} content Contenu de la notification
     * @param {string} type Type de la notification (success, danger ou info)
     * @param {int} time Temps d'affichage de la notification (en secondes)
     */
    toast(content, type, time) {
      this.toastContent = content;
      this.toastClass = type;
      setTimeout(() => {
        this.toastContent = "";
      }, time * 1000);
    },

    initSocketConnexion(socket) {
      socket.io.on('connect_error', () => {
          this.toast('Impossible de se connecter au serveur de sockets...', 'danger', 5);
          this.$router.push('Login');

      });

      socket.on('error', (err) => {
          if (err.type == 'UnauthorizedError' || err.code == 'invalid_token') {
              this.toast('Le token a expiré', 'danger', 5);
              this.$router.push('Login');
          }
      });

      socket.on('unauthorized', (err) => {
          if (err.data.type == 'UnauthorizedError' || err.data.code == 'invalid_token') {
              this.toast('Le token a expiré (token invalide)', 'danger', 5);
              this.$router.push('Login');
          }
      });

      socket.on('notLoggedRes', () => {
          this.$router.push('Login');
      });

      socket.on('disconnect', () => {
          setTimeout( () => {
              socket.connect();
          }, 400);
      });
    }
  }
}
</script>

<style lang="scss">
  @import "@/assets/styles/_fonts.scss";
  @import "@/assets/styles/_colors.scss";
  @import "@/assets/styles/_general.scss";
  @import "@/assets/styles/_background.scss";
  @import "@/assets/styles/_board.scss";
  @import "@/assets/styles/_login.scss";
  @import "@/assets/styles/_profile.scss";
  @import "@/assets/styles/_chat.scss";
  @import "@/assets/styles/_resolution-overlay.scss";
  @import "@/assets/styles/_loader-overlay.scss";
  @import "@/assets/styles/_welcome-screen.scss";
  @import "@/assets/styles/_lobby.scss";
  @import "@/assets/styles/_game.scss";
</style>
