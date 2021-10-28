<template>
  <div class="auth-page-container">
    <div class="auth-page-content">
      <div class="auth-page-input-field">
        <div class="auth-page-input-label">Email:</div>
        <a-input class="auth-page-input" placeholder="Enter your email address..." v-model:value="email"/>
      </div>
      <div class="auth-page-input-field">
        <div class="auth-page-input-label">Password:</div>
        <a-input-password class="auth-page-input" placeholder="Enter your password..." type="password" v-model:value="password"/>
      </div>
      <div class="auth-page-button">
        <a-button :loading="loading" danger @click="signIn" type="primary">Log In</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import {defineComponent, ref} from "vue";

export default defineComponent({
  setup() {
    const email = ref<string>("");
    const password = ref<string>("");
    const loading = ref<boolean>(false);
    const store = useStore();
    const router = useRouter();

    const signIn = () => {
      loading.value = true;
      store.dispatch("setToken", {token: "ádasdasda", username: email.value});
      localStorage.setItem("token", store.getters.userInfo.token);
      console.log(email.value, password.value); 
      router.push("/images-management");
    };

    return {
      email,
      password,
      loading,
      signIn
    };
  },
});
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