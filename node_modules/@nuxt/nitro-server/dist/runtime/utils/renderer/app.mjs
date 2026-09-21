import { sharedPrerenderCache } from "../cache.mjs";
import { encodePath } from "ufo";
import { useRuntimeConfig } from "nitropack/runtime";
import { NUXT_NO_SSR, NUXT_SHARED_DATA } from "#internal/nuxt/nitro-config.mjs";
import { createHead } from "@unhead/vue/server";
import unheadOptions from "#internal/unhead-options.mjs";
//#region src/runtime/utils/renderer/app.ts
const PRERENDER_NO_SSR_ROUTES = /* @__PURE__ */ new Set([
	"/index.html",
	"/200.html",
	"/404.html"
]);
function encodeEventPath(path) {
	const queryIndex = path.indexOf("?");
	if (queryIndex === -1) return encodePath(path);
	return encodePath(path.slice(0, queryIndex)) + path.slice(queryIndex);
}
function createSSRContext(event) {
	const url = encodeEventPath(event.path);
	const ssrContext = {
		url,
		event,
		runtimeConfig: useRuntimeConfig(event),
		noSSR: !!NUXT_NO_SSR || event.context.nuxt?.noSSR || (import.meta.prerender ? PRERENDER_NO_SSR_ROUTES.has(url) : false),
		head: createHead(unheadOptions),
		error: false,
		nuxt: void 0,
		payload: {},
		["~payloadReducers"]: Object.create(null),
		modules: /* @__PURE__ */ new Set()
	};
	if (import.meta.prerender) {
		if (NUXT_SHARED_DATA) ssrContext["~sharedPrerenderCache"] = sharedPrerenderCache;
		ssrContext.payload.prerenderedAt = Date.now();
	}
	return ssrContext;
}
function setSSRError(ssrContext, error) {
	ssrContext.error = true;
	ssrContext.payload = { error };
	ssrContext.url = error.url;
}
//#endregion
export { createSSRContext, setSSRError };
