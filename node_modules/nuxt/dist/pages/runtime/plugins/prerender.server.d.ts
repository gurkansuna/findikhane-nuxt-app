import { ObjectPlugin, Plugin } from "#app/nuxt";
//#region src/pages/runtime/plugins/prerender.server.d.ts
declare const plugin: Plugin & ObjectPlugin;
//#endregion
export { plugin as default };