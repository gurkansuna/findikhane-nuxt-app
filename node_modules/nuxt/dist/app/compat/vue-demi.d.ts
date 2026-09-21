import { del, install, set } from "./capi.js";
export * from "vue";
//#region src/app/compat/vue-demi.d.ts
declare const Vue2: undefined;
declare const isVue2 = false;
declare const isVue3 = true;
//#endregion
export { Vue2, del, install, isVue2, isVue3, set };