import { defineNuxtPlugin } from "../nuxt.js";
//#region src/app/plugins/browser-devtools-timing.client.ts
const plugin = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:browser-devtools-timing",
	enforce: "pre",
	setup(nuxtApp) {
		nuxtApp.hooks.beforeEach((event) => {
			event.__startTime = performance.now();
		});
		nuxtApp.hooks.afterEach((event) => {
			performance.measure(event.name, {
				start: event.__startTime,
				detail: { devtools: {
					dataType: "track-entry",
					track: "nuxt",
					color: "tertiary-dark"
				} }
			});
		});
	}
});
//#endregion
export { plugin as default };
