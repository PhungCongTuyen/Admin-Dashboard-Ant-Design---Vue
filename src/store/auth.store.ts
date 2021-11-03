import { ActionContext } from "vuex";

export interface AuthState {
    token: string | null;
    email: string | null;
    id: string | null;
    role: string | null;
}

export default {
    state: {
        email: null,
        token: null,
        id: null,
        role: null,
    },
    mutations: {
        initUserInfo(state: AuthState, payload: AuthState) {
            state.token = payload.token;
            state.email = payload.email;
            state.id = payload.id;
            state.role = payload.role;
        },
    },
    actions: {
        setUserInfo(
            context: ActionContext<AuthState, AuthState>,
            payload: AuthState
        ) {
            context.commit("initUserInfo", payload);
        },
    },
    getters: {
        userInfo(state: AuthState) {
            return {
                email: state.email,
                token: state.token,
                id: state.id,
                role: state.role,
            };
        },
    },
};
