import { del, install, set } from "./capi.js";
export * from "vue";
//#region src/app/compat/vue-demi.ts
const Vue2 = void 0;
const isVue2 = false;
const isVue3 = true;
//#endregion
export { Vue2, del, install, isVue2, isVue3, set };
