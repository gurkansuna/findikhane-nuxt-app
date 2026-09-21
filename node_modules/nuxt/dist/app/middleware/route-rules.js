import { defineNuxtRouteMiddleware } from "../composables/router.js";
import { getRouteRules } from "../composables/manifest.js";
import { hasProtocol } from "ufo";
//#region src/app/middleware/route-rules.ts
const middleware = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
	if (import.meta.server || import.meta.test) return;
	const rules = getRouteRules({ path: to.path });
	if (rules.redirect) {
		const path = rules.redirect.includes("#") ? rules.redirect : rules.redirect + to.hash;
		if (hasProtocol(path, { acceptRelative: true })) {
			window.location.href = path;
			return false;
		}
		return path;
	}
});
//#endregion
export { middleware as default };
