import { createStore } from "vuex";
import authStore, {AuthState} from "./auth.store";

export interface State {
    auth: AuthState
}

const store = createStore({
  modules: {
    auth: authStore,
  }
});
export default store;