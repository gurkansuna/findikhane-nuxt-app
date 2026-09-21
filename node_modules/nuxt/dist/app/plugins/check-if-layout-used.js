import { defineNuxtPlugin } from "../nuxt.js";
import { useError } from "../composables/error.js";
import { renderDiagnostics } from "../diagnostics/render.js";
import { onNuxtReady } from "../composables/ready.js";
import { nextTick } from "vue";
import layouts from "#build/layouts";
//#region src/app/plugins/check-if-layout-used.ts
const plugin = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:checkIfLayoutUsed",
	setup(nuxtApp) {
		const error = /* @__PURE__ */ useError();
		function checkIfLayoutUsed() {
			if (!error.value && !nuxtApp._isNuxtLayoutUsed && Object.keys(layouts).length > 0) renderDiagnostics.NUXT_E4007();
		}
		if (import.meta.server) nuxtApp.hook("app:rendered", ({ renderResult }) => {
			if (renderResult?.html) nextTick(checkIfLayoutUsed);
		});
		else onNuxtReady(checkIfLayoutUsed);
	},
	env: { islands: false }
});
//#endregion
export { plugin as default };
