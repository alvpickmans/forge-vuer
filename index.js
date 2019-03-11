import Vue from "vue";
import ForgeVuer from "./src/ForgeVuer.vue";

export default {
  install(Vue, options) {
    Vue.component("forge-vuer", ForgeVuer);
  }
};
