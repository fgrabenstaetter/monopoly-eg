<template>
  <div id="app">
    <router-view/>

    <div class="resolution-overlay-container">
      <div>
        Oups... c'est petit ici
        <br />Pense à étendre la fenêtre du jeu pour en profiter pleinement!
      </div>
    </div>

    <div class="toast-notifications">
      <div v-for="(toast, index) in toasts" :key="index" class="toast-notification" :class="toast.type" v-html="toast.content"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      toasts: [],
      toastIdCounter: 0
    }
  },
  methods: {
    /**
     * Crée une notification "toast" (et l'ajoute à la liste de notifications affichées)
     * @param {string} content Contenu de la notification
     * @param {string} type Type de la notification (success, danger ou info)
     * @param {int} time Temps d'affichage de la notification (en secondes)
     */
    toast(content, type, time) {
      const newToast = {
        id: this.toastIdCounter++,
        content: content,
        type: type
      };

      this.toasts.push(newToast);
      
      setTimeout(() => {
        for (const i in this.toasts) {
          if (this.toasts[i].id == newToast.id) {
            this.toasts.splice(i, 1);
            break;
          }
        }
      }, time * 1000);
    },

    initSocketConnexion(socket) {
      socket.io.on('connect_error', () => {
          this.toast('Impossible de se connecter au serveur de sockets...', 'danger', 5);
          this.$router.push('/login');

      });

      socket.on('error', (err) => {
          if (err.type == 'UnauthorizedError' || err.code == 'invalid_token') {
              this.toast('Le token a expiré', 'danger', 5);
              this.$router.push('/login');
          }
      });

      socket.on('unauthorized', (err) => {
          if (err.data.type == 'UnauthorizedError' || err.data.code == 'invalid_token') {
              this.toast('Le token a expiré (token invalide)', 'danger', 5);
              this.$router.push('/login');
          }
      });

      socket.on('notLoggedRes', () => {
          this.$router.push('/login');
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
