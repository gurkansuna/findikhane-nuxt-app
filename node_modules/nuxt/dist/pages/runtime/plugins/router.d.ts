import { Plugin } from "#app/nuxt";
import { Router } from "vue-router";
//#region src/pages/runtime/plugins/router.d.ts
declare const plugin: Plugin<{
  router: Router;
}>;
//#endregion
export { plugin as default };