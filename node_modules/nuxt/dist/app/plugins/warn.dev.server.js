import { defineNuxtPlugin } from "../nuxt.js";
//#region src/app/plugins/warn.dev.server.ts
const plugin = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.config.warnHandler ??= (msg, _instance, trace) => {
		console.warn(`[Vue warn]: ${msg}`, trace);
	};
});
//#endregion
export { plugin as default };
