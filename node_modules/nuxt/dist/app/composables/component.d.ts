import { defineComponent } from "vue";
//#region src/app/composables/component.d.ts
declare const NuxtComponentIndicator = "__nuxt_component";
/** @since 3.0.0 */
declare const defineNuxtComponent: typeof defineComponent;
//#endregion
export { NuxtComponentIndicator, defineNuxtComponent };