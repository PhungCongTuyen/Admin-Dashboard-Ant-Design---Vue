<template>
  <a-layout class="layout-dashboard" id="layout-dashboard">
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible :width="230">
      <div class="logo"/>
      <a-menu theme="dark" mode="inline" :selectedKeys="href">
        <!--        <a-menu-item key="/" @click="handleRouting('/')">-->
        <!--          <home-outlined/>-->
        <!--          <span>Home</span>-->
        <!--        </a-menu-item>-->
        <a-menu-item key="/images-management" @click="handleRouting('/images-management')" v-if="['admin', 'moderator'].includes(role)">
          <picture-outlined/>
          <span>Images Management</span>
        </a-menu-item>
        <a-sub-menu key="sub1" v-if="role === 'admin'">
          <template #title>
            <span>
              <gift-outlined/>
              <span>Award</span>
            </span>
          </template>
          <a-menu-item key="/awards-management" @click="handleRouting('/awards-management')" v-if="role === 'admin'">
            <file-done-outlined/>
            <span>Management</span>
          </a-menu-item>
          <a-menu-item key="/award-settings" @click="handleRouting('/award-settings')" v-if="role === 'admin'">
            <setting-outlined/>
            <span>Settings</span>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="/account-management" @click="handleRouting('/account-management')" v-if="role === 'admin'">
          <user-outlined/> 
          <span>Account Management</span>
        </a-menu-item>
        <a-menu-item key="/logs" @click="handleRouting('/logs')" v-if="role === 'admin'">
          <database-outlined/>
          <span>Logs</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="layout-dashboard-header">
        <menu-unfold-outlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
        />
        <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)"/>
        <a-dropdown :trigger="['click']">
          <a>
            <span class="username">{{ username }}</span>
            <user-outlined :style="{transform: 'scale(1.5)'}"/>
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item key="0">
                <a @click="handleLogOut()"
                   :style="{color: 'black', display: 'flex', justifyContent:'space-between', alignItems: 'center'}">
                  <span>Log Out</span>
                  <logout-outlined :style="{paddingLeft: '10px'}"/>
                </a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-layout-header>
      <a-layout-content class="layout-dashboard-content">
        <router-view/>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted} from "vue";
import {useRouter} from "vue-router";
import {getUserDetailApi} from "@/services/apis/user.api";
import {message} from "ant-design-vue";
import {useStore} from "vuex";

export default defineComponent({
    setup() {
    /*----------------------- variables ---------------------------*/
        const router = useRouter();
        const store = useStore();
        const role = ref("");
        const username = ref("");
        const collapsed = ref(false);
        const route = ref(window.location.href.split("/"));
        const href = ref(["/" + route.value[3]]);
        /*----------------------- functions ---------------------------*/
        const handleLogOut = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            router.push("/login");
        };
        const handleRouting = (value: string) => {
            router.push(value);
            href.value = [value];
        };

        const getUserDetail = () => {
            getUserDetailApi().then((res) => {
                username.value = res.data.email;
                role.value = res.data.role;
                localStorage.setItem("role", res.data.role);
                store.dispatch("setUserInfo", {
                    email: res.data.email,
                    role: res.data.role,
                    id: res.data.id,
                });
            }).catch((e) => message.error(e.response.message));
        };

        /*------------------------- hooks -----------------------------*/
        onMounted(getUserDetail);
        return {
            username,
            collapsed,
            href, 
            role,
            handleLogOut,
            handleRouting
        };
    },
});

</script>

<style lang="scss">
.layout-dashboard {
  height: 100vh;

  .layout-dashboard-log-out {
    padding-right: 10px !important;
  }

  .layout-dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 0 20px 0 0;

    .username {
      margin-right: 10px;
    }
  }

  .layout-dashboard-content {
    background-color: white;
    margin: 24px 16px;
    padding: 24px;
  }

  .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #1890ff;
    }
  }

  .logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px;
  }


}

</style>
