import { useNuxtApp, useRuntimeConfig } from "../nuxt.js";
import { useRoute } from "./router.js";
import { useHead as useHead$1 } from "../../head/runtime/composables.js";
import "./head.js";
import { stateDiagnostics } from "../diagnostics/state.js";
import { getAppManifest, getRouteRules } from "./manifest.js";
import { getCurrentInstance, onServerPrefetch, reactive } from "vue";
import { appId, appManifest, multiApp, payloadExtraction, renderJsonPayloads } from "#build/nuxt.config.mjs";
import { hasProtocol, joinURL } from "ufo";
import { defineLink } from "@unhead/vue";
import { parse } from "devalue";
//#region src/app/composables/payload.ts
/** @since 3.0.0 */
async function loadPayload(url, opts = {}) {
	if (import.meta.server || !payloadExtraction) return null;
	if (await shouldLoadPayload(url)) return await _importPayload(await _getPayloadURL(url, opts), isCachedPayloadRoute(url) ? "default" : "force-cache") || null;
	return null;
}
let linkRelType;
function detectLinkRelType() {
	if (import.meta.server) return "preload";
	if (linkRelType) return linkRelType;
	const relList = document.createElement("link").relList;
	linkRelType = relList && relList.supports && relList.supports("prefetch") ? "prefetch" : "preload";
	return linkRelType;
}
/** @since 3.0.0 */
function preloadPayload(url, opts = {}) {
	const nuxtApp = useNuxtApp();
	const promise = shouldLoadPayload(url).then(async (shouldPreload) => {
		if (!shouldPreload) return;
		const payloadURL = await _getPayloadURL(url, opts);
		const rel = detectLinkRelType();
		const link = renderJsonPayloads ? defineLink({
			rel,
			as: "fetch",
			crossorigin: "anonymous",
			href: payloadURL
		}) : {
			rel: "modulepreload",
			crossorigin: "",
			href: payloadURL
		};
		if (import.meta.server) nuxtApp.runWithContext(() => useHead$1({ link: [link] }));
		else {
			const linkEl = document.createElement("link");
			linkEl.rel = rel;
			linkEl.setAttribute("as", "fetch");
			linkEl.crossOrigin = "anonymous";
			linkEl.href = payloadURL;
			document.head.appendChild(linkEl);
			return new Promise((resolve, reject) => {
				const cleanup = () => {
					linkEl.removeEventListener("load", onLoad);
					linkEl.removeEventListener("error", onError);
				};
				const onLoad = () => {
					cleanup();
					resolve();
				};
				const onError = () => {
					cleanup();
					reject();
				};
				linkEl.addEventListener("load", onLoad);
				linkEl.addEventListener("error", onError);
			});
		}
	});
	if (import.meta.server) onServerPrefetch(() => promise);
	return promise;
}
const filename = renderJsonPayloads ? "_payload.json" : "_payload.js";
const payloadBuildIdParam = "_b";
async function _getPayloadURL(url, opts = {}) {
	const u = new URL(url, "http://localhost");
	if (u.host !== "localhost" || hasProtocol(u.pathname, { acceptRelative: true })) throw stateDiagnostics.NUXT_E7001({ url });
	const config = /* @__PURE__ */ useRuntimeConfig();
	const hash = opts.hash || (opts.fresh || import.meta.dev ? Date.now() : config.app.buildId);
	const cdnURL = config.app.cdnURL;
	const baseOrCdnURL = cdnURL && await isPrerendered(url) ? cdnURL : config.app.baseURL;
	const payloadURL = joinURL(baseOrCdnURL, u.pathname, filename);
	if (!isCachedPayloadRoute(url)) u.search = "";
	if (hash) u.searchParams.set(payloadBuildIdParam, String(hash));
	return payloadURL + u.search;
}
async function _importPayload(payloadURL, cache) {
	if (import.meta.server || !payloadExtraction) return null;
	try {
		if (renderJsonPayloads) {
			const res = await fetch(payloadURL, import.meta.dev ? {} : { cache });
			if (!res.ok) {
				if (import.meta.dev) stateDiagnostics.NUXT_E7002({ url: payloadURL });
				return null;
			}
			return await parsePayload(await res.text());
		} else return await import(
			/* webpackIgnore: true */
			/* @vite-ignore */
			payloadURL
).then((r) => r.default || r);
	} catch (err) {
		stateDiagnostics.NUXT_E7002({
			url: payloadURL,
			cause: err
		});
	}
	return null;
}
function _shouldLoadPrerenderedPayload(rules) {
	if (rules.redirect) return false;
	if (rules.prerender) return true;
}
function _getRoutePath(url) {
	return new URL(url, "http://localhost").pathname;
}
/** @internal */
function isCachedPayloadRoute(url) {
	return !!getRouteRules({ path: _getRoutePath(url) }).payload;
}
async function _isPrerenderedInManifest(url) {
	if (!appManifest) return false;
	url = _getRoutePath(url);
	url = url === "/" ? url : url.replace(/\/$/, "");
	try {
		return (await getAppManifest()).prerendered.includes(url);
	} catch {
		return false;
	}
}
/**
* @internal
*/
async function shouldLoadPayload(url = useRoute().path) {
	const rules = getRouteRules({ path: _getRoutePath(url) });
	if (rules.ssr === false) return false;
	const res = _shouldLoadPrerenderedPayload(rules);
	if (res !== void 0) return res;
	if (rules.payload) return true;
	return await _isPrerenderedInManifest(url);
}
/** @since 3.0.0 */
async function isPrerendered(url = useRoute().path) {
	const res = _shouldLoadPrerenderedPayload(getRouteRules({ path: _getRoutePath(url) }));
	if (res !== void 0) return res;
	return await _isPrerenderedInManifest(url);
}
let payloadCache = null;
/** @since 3.4.0 */
async function getNuxtClientPayload() {
	if (import.meta.server) return null;
	if (payloadCache) return payloadCache;
	const el = multiApp ? document.querySelector(`[data-nuxt-data="${appId}"]`) : document.getElementById("__NUXT_DATA__");
	if (!el) return {};
	const inlineData = await parsePayload(el.textContent || "");
	const externalData = el.dataset.src ? await _importPayload(el.dataset.src, inlineData.prerenderedAt ? "force-cache" : "no-cache") : void 0;
	payloadCache = {
		...inlineData,
		...externalData,
		...multiApp ? window.__NUXT__?.[appId] : window.__NUXT__
	};
	if (payloadCache.config?.public) payloadCache.config.public = reactive(payloadCache.config.public);
	return payloadCache;
}
async function parsePayload(payload) {
	return await parse(payload, useNuxtApp()._payloadRevivers);
}
/**
* This is an experimental function for configuring passing rich data from server -> client.
* @since 3.4.0
*/
function definePayloadReducer(name, reduce) {
	if (import.meta.server) useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
}
/**
* This is an experimental function for configuring passing rich data from server -> client.
*
* This function _must_ be called in a Nuxt plugin that is `unshift`ed to the beginning of the Nuxt plugins array.
* @since 3.4.0
*/
function definePayloadReviver(name, revive) {
	if (import.meta.dev && getCurrentInstance()) stateDiagnostics.NUXT_E7004();
	if (import.meta.client) useNuxtApp()._payloadRevivers[name] = revive;
}
//#endregion
export { definePayloadReducer, definePayloadReviver, getNuxtClientPayload, isCachedPayloadRoute, isPrerendered, loadPayload, parsePayload, preloadPayload, shouldLoadPayload };
