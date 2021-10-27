import {ActionContext} from "vuex";
import {State} from "@/store/index";

export interface AuthState {
    token: string | null,
    username: string | null
}

const authStore = {
    state: {
        username: null,
        token: null
    },
    mutations: {
        initToken(state: AuthState, payload: AuthState) {
            state.token = payload.token;
            state.username = payload.username;
            console.log(payload);
            console.log(state, "state-log");
        }
    },
    actions: {
        setToken(context: ActionContext<AuthState, State>, payload: AuthState) {
            context.commit('initToken', payload)
            console.log(payload);
        }
        // incrementIfOddOnRootSum ({ state, commit, rootState }) {
        //     if ((state.count + rootState.count) % 2 === 1) {
        //         commit('increment')
        //     }
        // }
    },
    getters: {
        userInfo(state: AuthState) {
            return {
                username: state.username,
                token: state.token
            }
        }
    }
}

export default authStore;