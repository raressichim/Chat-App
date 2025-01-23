import { createStore } from "vuex";

const store = createStore({
  state: {
    sharedData: null,
  },
  mutations: {
    setSharedData(state, data) {
      state.sharedData = data;
    },
  },
  actions: {
    updateSharedData({ commit }, data) {
      commit("setSharedData", data);
    },
  },
  getters: {
    getSharedData: (state) => state.sharedData,
  },
});

export default store;
