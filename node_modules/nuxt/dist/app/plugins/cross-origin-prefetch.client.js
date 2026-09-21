import { defineNuxtPlugin } from "../nuxt.js";
import { useHead as useHead$1 } from "../../head/runtime/composables.js";
import "../composables/head.js";
import { ref } from "vue";
import { defineScript } from "@unhead/vue";
//#region src/app/plugins/cross-origin-prefetch.client.ts
const SUPPORTED_PROTOCOLS = /* @__PURE__ */ new Set(["http:", "https:"]);
const plugin = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:cross-origin-prefetch",
	setup(nuxtApp) {
		const externalURLs = ref(/* @__PURE__ */ new Set());
		function generateRules() {
			return defineScript({
				type: "speculationrules",
				key: "speculationrules",
				innerHTML: { prefetch: [{
					source: "list",
					urls: [...externalURLs.value],
					requires: ["anonymous-client-ip-when-cross-origin"]
				}] }
			});
		}
		const head = useHead$1({ script: [generateRules()] });
		nuxtApp.hook("link:prefetch", (url) => {
			for (const protocol of SUPPORTED_PROTOCOLS) if (url.startsWith(protocol) && SUPPORTED_PROTOCOLS.has(new URL(url).protocol)) {
				externalURLs.value.add(url);
				head?.patch({ script: [generateRules()] });
				return;
			}
		});
	}
});
//#endregion
export { plugin as default };
