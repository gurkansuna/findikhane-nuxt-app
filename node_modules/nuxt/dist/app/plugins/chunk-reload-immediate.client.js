import { defineNuxtPlugin, useRuntimeConfig } from "../nuxt.js";
import { addRouteMiddleware } from "../composables/router.js";
import { reloadNuxtApp } from "../composables/chunk.js";
import { joinURL } from "ufo";
//#region src/app/plugins/chunk-reload-immediate.client.ts
const plugin = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:chunk-reload-immediate",
	setup(nuxtApp) {
		let currentlyNavigationTo = null;
		addRouteMiddleware((to) => {
			currentlyNavigationTo = to;
		});
		const config = /* @__PURE__ */ useRuntimeConfig();
		function reloadAppAtPath(to) {
			const path = joinURL(config.app.baseURL, to.fullPath);
			reloadNuxtApp({
				path,
				persistState: true
			});
		}
		nuxtApp.hook("app:chunkError", () => reloadAppAtPath(currentlyNavigationTo ?? nuxtApp._route));
		nuxtApp.hook("app:manifest:update", () => reloadAppAtPath(nuxtApp._route));
	}
});
//#endregion
export { plugin as default };
