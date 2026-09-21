import { appDiagnostics } from "../../app/diagnostics/core.js";
import { getCurrentInstance } from "vue";
import { useNuxtApp } from "#app/nuxt";
import { useRoute } from "vue-router";
//#region src/pages/runtime/composables.ts
const warnRuntimeUsage = (method) => {
	appDiagnostics.NUXT_E1007({ name: method });
};
const definePageMeta = (meta) => {
	if (import.meta.dev) {
		const component = getCurrentInstance()?.type;
		try {
			const isRouteComponent = component && useRoute().matched.some((p) => Object.values(p.components || {}).includes(component));
			const isRenderingServerPage = import.meta.server && useNuxtApp().ssrContext?.islandContext;
			if (isRouteComponent || isRenderingServerPage || component?.__clientOnlyPage) return;
		} catch {}
		warnRuntimeUsage("definePageMeta");
	}
};
/**
* You can define route rules for the current page. Matching route rules will be created, based on the page's _path_.
*
* For example, a rule defined in `~/pages/foo/bar.vue` will be applied to `/foo/bar` requests. A rule in
* `~/pages/foo/[id].vue` will be applied to `/foo/**` requests.
*
* For more control, such as if you are using a custom `path` or `alias` set in the page's `definePageMeta`, you
* should set `routeRules` directly within your `nuxt.config`.
*/
const defineRouteRules = /* @__NO_SIDE_EFFECTS__ */ (rules) => {};
//#endregion
export { definePageMeta, defineRouteRules };
