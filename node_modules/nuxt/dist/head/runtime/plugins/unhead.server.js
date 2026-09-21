import { freezeHead } from "../island-head.js";
import { defineNuxtPlugin } from "#app/nuxt";
//#region src/head/runtime/plugins/unhead.server.ts
const plugin = defineNuxtPlugin({
	name: "nuxt:head",
	enforce: "pre",
	setup(nuxtApp) {
		const head = nuxtApp.ssrContext.head;
		if (nuxtApp.ssrContext.islandContext) {
			const unfreeze = freezeHead(head);
			nuxtApp.hooks.hookOnce("app:created", unfreeze);
		}
		nuxtApp.vueApp.use(head);
	}
});
//#endregion
export { plugin as default };
