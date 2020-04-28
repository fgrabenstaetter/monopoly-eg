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
                        <input v-model="form.nickname" type="text" class="form-control" placeholder="Pseudo">
                        <input v-model="form.email" type="email" class="form-control" placeholder="Email">
                        <input v-model="form.password" type="password" class="form-control" placeholder="Mot de passe">
                        <button type="submit" class="btn btn-primary">INSCRIPTION</button>
                        <router-link class="btn btn-secondary" to="Login">ANNULER</router-link>
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
  name: "Signin",
  data() {
    return {
      form: {}
    };
  },
  methods: {
    signin() {
      this.$http
        .post(`${this.$store.state.apiUrl}/register`, this.form)
        .then(() => {
          this.$router.push('Login');
        })
        .catch(err => {
          if (err.response.status === 400)
            this.$parent.toast(err.response.data.status, 'danger', 5);
        });
    }
  }
};
</script>