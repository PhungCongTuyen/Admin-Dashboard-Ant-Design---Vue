<template>
  <div class="auth-page-container">
    <div class="auth-page-content">
      <div class="auth-page-input-field">
        <div class="auth-page-input-label">Email:</div>
        <a-input class="auth-page-input" placeholder="Enter your email address..." v-model:value="email" type="email"/>
      </div>
      <div class="auth-page-input-field">
        <div class="auth-page-input-label">Password:</div>
        <a-input-password class="auth-page-input" placeholder="Enter your password..." type="password"
                          v-model:value="password"/>
      </div>
      <div class="auth-page-button">
        <a-button :loading="loading" danger @click="signIn" type="primary">Log In</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {useRouter} from "vue-router";
import {defineComponent, ref} from "vue";
import {logInApi} from "@/services/apis/auth.api";
import {message} from "ant-design-vue";
import {isValidEmail} from "@/utils/validator";

export default defineComponent({
    setup() {
        const email = ref<string>("");
        const password = ref<string>("");
        const loading = ref<boolean>(false);
        const router = useRouter();



        const signIn = () => {
            if (!isValidEmail(email.value)) {
                message.error("Invalid Email. Please try again!");
                return;
            }
            loading.value = true;
            logInApi({email: email.value, password: password.value}).then((res) => {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", res.data.role);
                router.push("/images-management");
                loading.value = false;
            }).catch((e) => {
                loading.value = false;
                if (e.response) {
                    message.error({
                      content: e.response.data.message,
                      // style: {
                      //   right: "10px",
                      //   textAlign: "right"
                      // }
                    });
                }
            });
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