import Vuex from 'vuex';
import authStore, {AuthState} from "./auth.store";
import Vue from "vue";

Vue.use(Vuex);

export interface State {
    authStore: AuthState
}

const store = new Vuex.Store({
    modules: {
        authStore: authStore,
    }
})
export default store;