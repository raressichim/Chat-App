import { createStore } from "vuex";

const store = createStore({
  state: {
    sharedData: JSON.parse(sessionStorage.getItem("sharedData")) || null,
  },
  mutations: {
    setSharedData(state, data) {
      state.sharedData = data;
      sessionStorage.setItem("sharedData", JSON.stringify(data)); // Persist to sessionStorage
    },
  },
  actions: {
    updateSharedData({ commit }, data) {
      commit("setSharedData", data);
    },
    syncSharedData({ commit }) {
      const data = JSON.parse(sessionStorage.getItem("sharedData"));
      commit("setSharedData", data); // Sync state with sessionStorage
    },
  },
  getters: {
    getSharedData: (state) => state.sharedData,
  },
});

export default store;
