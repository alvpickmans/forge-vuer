import Vue from "vue";
import ForgeVuerComponent from "./src/ForgeVuer.vue";

export const ForgeVuer = ForgeVuerComponent;

/**
 * Options require clientId and clientSecret for 2legged auth.
 */
export default {
  install(Vue, options) {
    
    if(!options || !options.clientId || !options.clientSecret ){
      console.log(options);
      throw new Error('clientId and clientSecret are required. Please make sure you provide these on the options parameter');
    }

    Vue.prototype.$FORGE_VUER = {
      clientId: options.clientId,
      clientSecret: options.clientSecret
    };
    
    Vue.component(ForgeVuerComponent.name, ForgeVuerComponent);
  }
};

