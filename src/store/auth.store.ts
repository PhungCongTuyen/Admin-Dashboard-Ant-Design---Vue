import {ActionContext} from "vuex";

export interface AuthState {
    token: string | null,
    email: string | null
}

export default {
  state: {
    email: null,
    token: null
  },
  mutations: {
    initToken(state: AuthState, payload: AuthState) {
      state.token = payload.token;
      state.email = payload.email;
      console.log(payload);
      console.log(state, "state-log");
    }
  },
  actions: {
    setToken(context: ActionContext<AuthState, AuthState>, payload: AuthState) {
      context.commit("initToken", payload);
      console.log(payload);
    }
  },
  getters: {
    userInfo(state: AuthState) {
      return {
        email: state.email,
        token: state.token
      };
    }
  }
};
