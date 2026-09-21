import { defineNuxtPlugin } from "../nuxt.js";
//#region src/app/plugins/preload.server.ts
const plugin = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:webpack-preload",
	setup(nuxtApp) {
		nuxtApp.vueApp.mixin({ beforeCreate() {
			const { modules } = this.$nuxt.ssrContext;
			const { __moduleIdentifier } = this.$options;
			if (__moduleIdentifier) modules.add(__moduleIdentifier);
		} });
	}
});
//#endregion
export { plugin as default };
