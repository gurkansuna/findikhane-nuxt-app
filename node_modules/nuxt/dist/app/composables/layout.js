import { LayoutSymbol } from "../components/injections.js";
import { useRoute } from "./router.js";
import { computed, inject, unref } from "vue";
import _routeRulesMatcher from "#build/route-rules.mjs";
//#region src/app/composables/layout.ts
const routeRulesMatcher = _routeRulesMatcher;
function resolveLayoutName(route, name) {
	return unref(name) ?? route?.meta.layout ?? routeRulesMatcher(route?.path ?? "/").appLayout ?? "default";
}
/**
* Returns the layout rendered for the current route, resolved through the same chain as
* `<NuxtLayout>` (page `layout` meta, then the route rules `appLayout`, then `default`).
*
* Within a rendered `<NuxtLayout>` it reflects the enclosing layout; outside of one it
* returns the layout that would be resolved for the current route.
* @since 4.5.0
*/
function useLayout() {
	const injected = inject(LayoutSymbol, null);
	if (injected) return injected;
	const route = useRoute();
	return computed(() => resolveLayoutName(route));
}
//#endregion
export { resolveLayoutName, useLayout };
