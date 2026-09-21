import { useRuntimeConfig } from "../nuxt.js";
import { manifestDiagnostics } from "../diagnostics/manifest.js";
import { appManifest } from "#build/nuxt.config.mjs";
import { $fetch } from "#build/fetch";
import { buildAssetsURL } from "#internal/nuxt/paths";
import _routeRulesMatcher from "#build/route-rules.mjs";
//#region src/app/composables/manifest.ts
const $fetch$1 = $fetch;
const routeRulesMatcher = _routeRulesMatcher;
let manifest;
function fetchManifest() {
	if (!appManifest) throw manifestDiagnostics.NUXT_E5001();
	let _manifest;
	if (import.meta.server) _manifest = import(
		/* webpackIgnore: true */
		/* @vite-ignore */
		"#app-manifest"
);
	else _manifest = $fetch$1(buildAssetsURL(`builds/meta/${(/* @__PURE__ */ useRuntimeConfig()).app.buildId}.json`), { responseType: "json" }).then((res) => {
		if (!res || typeof res !== "object" || !Array.isArray(res.prerendered)) throw manifestDiagnostics.NUXT_E5004();
		return res;
	});
	manifest = _manifest;
	_manifest.catch((e) => {
		if (manifest === _manifest) manifest = void 0;
		manifestDiagnostics.NUXT_E5002({ cause: e });
	});
	return _manifest;
}
/** @since 3.7.4 */
function getAppManifest() {
	if (!appManifest) throw manifestDiagnostics.NUXT_E5001();
	return manifest || fetchManifest();
}
function getRouteRules(arg) {
	const path = typeof arg === "string" ? arg : arg.path;
	try {
		return routeRulesMatcher(path);
	} catch (e) {
		manifestDiagnostics.NUXT_E5003({
			path,
			cause: e
		});
		return {};
	}
}
//#endregion
export { getAppManifest, getRouteRules };
