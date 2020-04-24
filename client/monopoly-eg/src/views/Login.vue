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
                aria-describedby="helpId"
                placeholder="Nom d'utilisateur"
              />
              <input
                type="password"
                v-model="form.password"
                class="form-control"
                aria-describedby="helpId"
                placeholder="Mot de passe"
              />
              <button type="submit" class="btn btn-primary">CONNEXION</button>
              <button
                type="button"
                class="btn btn-secondary"
                onclick="router.navigate('/signin')"
              >INSCRIPTION</button>
            </form>
          </div>
          <a id="forgot-password" href="#">Mot de passe oublié ?</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      form: {}
    };
  },
  methods: {
    login() {
      this.$http
        .post(`${this.$store.state.apiUrl}/login`, this.form)
        .then(res => {
          res = res.data;
          res.user.avatar = this.$store.getters.serverUrl + res.avatar;
          res.user.id = res.user._id;
          delete res.user._id;
          this.$store.dispatch("login", {jwt: res.token, user: res.user});
          this.$router.push('Lobby');
        })
        .catch(err => {
          console.log(err);
          if (err.status === 400) alert(err.response.data.status);
          // toast(err.response.data.status, 'danger', 5);
        });
    }
  }
};
</script>