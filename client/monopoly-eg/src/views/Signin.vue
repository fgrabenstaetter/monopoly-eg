<template>
  <div>
    <div class="background-container"></div>
    <div class="signin-ui-container">
        <div class="card">
            <div class="card-header">
                INSCRIVEZ-VOUS
            </div>
            <div class="card-body">
                <div class="form-group">
                    <form @submit.prevent="signin">
                        <input v-model="form.nickname" type="text" class="form-control" placeholder="Pseudo" autofocus>
                        <input v-model="form.email" type="email" class="form-control" placeholder="Email">
                        <input v-model="form.password" type="password" class="form-control" placeholder="Mot de passe">
                        <button v-if="btnLoading" class="btn btn-primary" disabled>CHARGEMENT...</button>
                        <button v-else type="submit" class="btn btn-primary">INSCRIPTION</button>
                        <router-link class="btn btn-secondary" to="/login">ANNULER</router-link>
                    </form>
                </div>
                <a id="forgot-password" href="#">Mot de passe oublié ?</a>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
/**
 * @vuese
 * @group Views
 * Ecran d'inscription
 */
export default {
  name: "Signin",
  data() {
    return {
      // @vuese
      // Données du formulaire d'inscription ('nickname', 'email' et 'password')
      form: {
        nickname: '',
        email: '',
        password: ''
      },
      // @vuese
      // Indique si le bouton d'inscription est en chargement
      btnLoading: false
    };
  },
  methods: {
    /**
     * @vuese
     * Inscrit l'utilisateur en envoyant les données du formulaire à l'API. Si inscription réussie, redirection vers /login.
     */
    signin() {
      this.btnLoading = true;

      this.$http
        .post(`${this.$store.state.apiUrl}/register`, this.form)
        .then(() => {
          this.$router.push('/login');
          this.btnLoading = false;
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