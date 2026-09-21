import { renderDiagnostics } from "../../app/diagnostics/render.js";
import { defineComponent } from "vue";
import { devPagesDir } from "#build/nuxt.config.mjs";
//#region src/pages/runtime/page-placeholder.ts
const PagePlaceholder = defineComponent({
	name: "NuxtPage",
	setup(_, props) {
		if (import.meta.dev) renderDiagnostics.NUXT_E4014({ dir: devPagesDir });
		return () => props.slots.default?.();
	}
});
//#endregion
export { PagePlaceholder as default };
