import { useNuxtApp } from "../nuxt.js";
import { navigationDiagnostics } from "../diagnostics/navigation.js";
import { isScriptProtocol } from "ufo";
//#region src/app/composables/chunk.ts
/** @since 3.3.0 */
function reloadNuxtApp(options = {}) {
	if (import.meta.server) return;
	const path = options.path || window.location.pathname;
	const url = new URL(path, window.location.href);
	if (url.host !== window.location.host) throw navigationDiagnostics.NUXT_E2010({ path });
	if (url.protocol && isScriptProtocol(url.protocol)) throw navigationDiagnostics.NUXT_E2002({
		toPath: path,
		protocol: url.protocol
	});
	let handledPath = {};
	try {
		handledPath = JSON.parse(sessionStorage.getItem("nuxt:reload") || "{}");
	} catch {}
	if (options.force || handledPath?.path !== path || handledPath?.expires < Date.now()) {
		try {
			sessionStorage.setItem("nuxt:reload", JSON.stringify({
				path,
				expires: Date.now() + (options.ttl ?? 1e4)
			}));
		} catch {}
		if (options.persistState) try {
			sessionStorage.setItem("nuxt:reload:state", JSON.stringify({ state: useNuxtApp().payload.state }));
		} catch {}
		if (window.location.pathname !== path) window.location.href = path;
		else window.location.reload();
	}
}
//#endregion
export { reloadNuxtApp };
