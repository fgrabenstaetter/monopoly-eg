<template>
  <div>
    <div class="background-container"></div>
    
    <div class="login-ui-container">
      <div class="card">
        <div class="card-header">CONNECTEZ-VOUS</div>
        <div class="card-body">
          <div class="form-group">
            <form @submit.prevent="login">
              <input
                type="text"
                v-model="form.nickname"
                class="form-control"
                placeholder="Nom d'utilisateur"
                autofocus
              >
              <input
                type="password"
                v-model="form.password"
                class="form-control"
                placeholder="Mot de passe"
              >
              <button v-if="btnLoading" class="btn btn-primary" disabled>CHARGEMENT...</button>
              <button v-else type="submit" class="btn btn-primary">CONNEXION</button>
              <router-link class="btn btn-secondary" to="/signin">INSCRIPTION</router-link>
            </form>
          </div>
          <router-link id="forgot-password" to="/reset-password">Mot de passe oublié ?</router-link>
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
 * Ecran de connexion
 */
export default {
  name: "Login",
  data() {
    return {
      // @vuese
      // Données du formulaire de connexion ('nickname' et 'password')
      form: {
        nickname: '',
        password: ''
      },
      // @vuese
      // Indique si le bouton de connexion est en chargement
      btnLoading: false
    };
  },
  methods: {
    /**
     * @vuese
     * Connecte l'utilisateur en envoyant les données du formulaire de connexion à l'API. Si connexion réussie, redirection vers /lobby.
     */
    login() {
      this.btnLoading = true;

      this.$http
        .post(`${this.$store.state.apiUrl}/login`, this.form)
        .then(res => {
          res = res.data;
          res.user.avatar = this.$store.getters.serverUrl + res.avatar;
          res.user.id = res.user._id;
          delete res.user._id;
          this.$store.dispatch("login", {jwt: res.token, user: res.user})
          .then(() => {
            this.$router.push('/lobby');
            this.btnLoading = false;
          });
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