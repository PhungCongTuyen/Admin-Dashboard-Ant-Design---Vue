<template>
  <div class="auth-page-container">
    <div class="auth-page-content">
      <div class="auth-page-input-field">
        <div class="auth-page-input-label">Email:</div>
        <a-input class="auth-page-input" placeholder="Email" v-model="email"/>
      </div>
      <div class="auth-page-input-field">
        <div class="auth-page-input-label">Password:</div>
        <a-input-password class="auth-page-input" placeholder="Password" type="password"  v-model="password"/>
      </div>
      <div class="auth-page-button">
        <a-button :loading="loading" type="danger" @click="signIn">Log In</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import store from "../store/index";
export default {
  name: "SignIn",
  data() {
    return {
      loading: false,
      email: "",
      password: ""
    }
  },
  methods: {
    signIn() {
      this.loading = true
      this.$store.dispatch('setToken',{token: "ádasdasda", username: this.email})
      localStorage.setItem('token', store.getters.userInfo.token)
      console.log(this.email, this.password);
      this.$router.history.push('/')

    }
  }
}
</script>

<style scoped lang="scss">
.auth-page-container {
  width: 100%;
  height: 100vh;
  position: relative;

  .auth-page-content {
    position: absolute;
    margin: auto;
    max-width: 450px;
    background-color: white;
    padding: 50px;
    top: 40%;
    left: 0;
    right: 0;

    .auth-page-input-field {
      display: flex;
      align-items: center;
      justify-content: space-between;
      &:first-child {
        margin-bottom: 10px;
      }
      .auth-page-input-label {

      }
      .auth-page-input {
        width: 250px;
      }
    }

    .auth-page-button {
      margin-top: 10px;
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
}
</style>