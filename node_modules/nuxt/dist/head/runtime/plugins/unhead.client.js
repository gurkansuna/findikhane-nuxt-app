import { installClientHead } from "../install-client-head.js";
import { defineNuxtPlugin } from "#app/nuxt";
import { createHead } from "@unhead/vue/client";
import unheadOptions from "#build/unhead-options.mjs";
//#region src/head/runtime/plugins/unhead.client.ts
const plugin = defineNuxtPlugin({
	name: "nuxt:head",
	enforce: "pre",
	setup(nuxtApp) {
		const head = createHead(unheadOptions);
		installClientHead(nuxtApp, head);
	}
});
//#endregion
export { plugin as default };
