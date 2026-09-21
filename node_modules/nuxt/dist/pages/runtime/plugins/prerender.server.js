import { crawlLinks } from "#build/nuxt.config.mjs";
import { joinURL } from "ufo";
import { defineNuxtPlugin } from "#app/nuxt";
import _routeRulesMatcher from "#build/route-rules.mjs";
import routerOptions, { hashMode } from "#build/router.options.mjs";
import { prerenderRoutes } from "#app/composables/ssr";
import _routes from "#build/routes";
//#region src/pages/runtime/plugins/prerender.server.ts
const routeRulesMatcher = _routeRulesMatcher;
let routes;
const plugin = defineNuxtPlugin(async () => {
	if (!import.meta.server || !import.meta.prerender || hashMode) return;
	if (routes && !routes.length) return;
	routes ||= Array.from(processRoutes(await routerOptions.routes?.(_routes) ?? _routes));
	const batch = routes.splice(0, 10);
	prerenderRoutes(batch);
});
const OPTIONAL_PARAM_RE = /^\/?:.*(?:\?|\(\.\*\)\*)$/;
function shouldPrerender(path) {
	return crawlLinks || !!routeRulesMatcher(path).prerender;
}
function processRoutes(routes, currentPath = "/", routesToPrerender = /* @__PURE__ */ new Set()) {
	for (const route of routes) {
		if (OPTIONAL_PARAM_RE.test(route.path) && !route.children?.length && shouldPrerender(currentPath)) routesToPrerender.add(currentPath);
		if (route.path.includes(":")) continue;
		const fullPath = joinURL(currentPath, route.path);
		if (shouldPrerender(fullPath)) routesToPrerender.add(fullPath);
		if (route.children) processRoutes(route.children, fullPath, routesToPrerender);
	}
	return routesToPrerender;
}
//#endregion
export { plugin as default };
