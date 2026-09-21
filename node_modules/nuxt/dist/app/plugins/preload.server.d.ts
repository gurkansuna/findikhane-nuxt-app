import { ObjectPlugin, Plugin } from "../nuxt.js";
//#region src/app/plugins/preload.server.d.ts
declare const plugin: Plugin & ObjectPlugin;
//#endregion
export { plugin as default };