import {ActionContext} from "vuex";

export interface AuthState {
    token: string | null,
    username: string | null
}

export default {
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
        setToken(context: ActionContext<AuthState, AuthState>, payload: AuthState) {
            context.commit('initToken', payload)
            console.log(payload);
        }
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
