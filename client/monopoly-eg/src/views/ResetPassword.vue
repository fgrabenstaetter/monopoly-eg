<template>
  <div>
    <div class="background-container"></div>
    
    <div class="login-ui-container">
      <div class="card">
        <div class="card-header">MOT DE PASSE OUBLIÉ</div>
        <div class="card-body">
          <div class="form-group">
            <form @submit.prevent="resetPassword">
              <input
                type="email"
                v-model="formEmail"
                class="form-control"
                placeholder="Adresse email de votre compte"
                autofocus
              >
              <button v-if="btnLoading" class="btn btn-primary" disabled>CHARGEMENT...</button>
              <button v-else type="submit" class="btn btn-primary">ENVOYER</button>
              <router-link class="btn btn-secondary" to="/login">ANNULER</router-link>
            </form>
          </div>
        </div>
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
/**
 * @vuese
 * @group Views
 * Ecran de récupération de mot de passe
 */
export default {
  name: "ResetPassword",
  data() {
    return {
      // @vuese
      // Adresse email saisie dans le formulaire de réinitialisation de mot de passe
      formEmail: '',
      // @vuese
      // Indique si le bouton de connexion est en chargement
      btnLoading: false
    };
  },
  methods: {
    /**
     * @vuese
     * Envoie une requête de réinitialisation de mot de passe à l'API du serveur
     */
    resetPassword() {
      this.btnLoading = true;

      this.$http
        .post(`${this.$store.state.apiUrl}/reset-password`, this.form)
        .then(res => {
            this.$parent.toast(res.status, 'success', 12);
            this.btnLoading = false;
            this.$router.push('/lobby');
        })
        .catch(err => {
          if (err.response.status === 400)
            this.$parent.toast(err.response.data.status, 'danger', 5);
          this.btnLoading = false;
        });
    }
  },
  mounted() {
    const input = document.querySelector('[autofocus]');
    if (input) input.focus();
  }
};
</script>