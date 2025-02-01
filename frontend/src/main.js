import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import router from "./router";
import store from "./state/store";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

loadFonts();

const toastOptions = {
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: true,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
};
createApp(App)
  .use(router)
  .use(vuetify)
  .use(store)
  .use(Toast, toastOptions)
  .mount("#app");
