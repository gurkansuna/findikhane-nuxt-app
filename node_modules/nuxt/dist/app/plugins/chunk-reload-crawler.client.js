import { defineNuxtPlugin } from "../nuxt.js";
import { isBotUserAgent } from "../utils.js";
import { reloadNuxtApp } from "../composables/chunk.js";
//#region src/app/plugins/chunk-reload-crawler.client.ts
const plugin = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:chunk-reload-crawler",
	setup(nuxtApp) {
		let isHydrating = true;
		nuxtApp.hooks.hookOnce("app:suspense:resolve", () => {
			isHydrating = false;
		});
		nuxtApp.hook("app:chunkError", () => {
			if (isHydrating && isBotUserAgent(navigator.userAgent)) reloadNuxtApp();
		});
	}
});
//#endregion
export { plugin as default };
