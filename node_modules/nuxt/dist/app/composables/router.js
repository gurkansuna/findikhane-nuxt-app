import { useNuxtApp, useRuntimeConfig } from "../nuxt.js";
import { getUserTrace } from "../utils.js";
import { PageRouteSymbol } from "../components/injections.js";
import { navigationDiagnostics } from "../diagnostics/navigation.js";
import { createError as createError$1, showError } from "./error.js";
import { getCurrentInstance, getCurrentScope, hasInjectionContext, inject, onScopeDispose } from "vue";
import { sanitizeStatusCode } from "@nuxt/nitro-server/h3";
import { decodePath, encodePath, hasProtocol, isScriptProtocol, joinURL, parseQuery, parseURL, withQuery } from "ufo";
//#region src/app/composables/router.ts
/** @since 3.0.0 */
const useRouter = () => {
	return useNuxtApp()?.$router;
};
/**
* Whether the current effect scope is (a descendant of) the component instance's scope.
* A detached scope (e.g. `createSharedComposable`) outlives the component, so the
* per-page route injected there would freeze after navigation (#18903).
*/
function isScopeWithinInstance(instance) {
	const instanceScope = instance.scope;
	let scope = getCurrentScope();
	while (scope) {
		if (scope === instanceScope) return true;
		scope = scope.parent;
	}
	return false;
}
/** @since 3.0.0 */
const useRoute = (() => {
	if (import.meta.dev && !getCurrentInstance() && isProcessingMiddleware()) {
		const middleware = useNuxtApp()._processingMiddleware;
		const trace = getUserTrace().map(({ source, line, column }) => `at ${source}:${line}:${column}`).join("\n");
		navigationDiagnostics.NUXT_E2005({
			middleware: typeof middleware === "string" ? middleware : void 0,
			trace
		});
	}
	if (hasInjectionContext()) {
		const instance = getCurrentInstance();
		if (!instance || isScopeWithinInstance(instance)) return inject(PageRouteSymbol, useNuxtApp()._route);
	}
	return useNuxtApp()._route;
});
/** @since 3.0.0 */
const onBeforeRouteLeave = (guard) => {
	const unsubscribe = useRouter().beforeEach((to, from, next) => {
		if (to === from) return;
		return guard(to, from, next);
	});
	onScopeDispose(unsubscribe);
};
/** @since 3.0.0 */
const onBeforeRouteUpdate = (guard) => {
	const unsubscribe = useRouter().beforeEach(guard);
	onScopeDispose(unsubscribe);
};
/** @since 3.0.0 */
/* @__NO_SIDE_EFFECTS__ */
function defineNuxtRouteMiddleware(middleware) {
	return middleware;
}
/** @since 3.0.0 */
const addRouteMiddleware = (name, middleware, options = {}) => {
	const nuxtApp = useNuxtApp();
	const global = options.global || typeof name !== "string";
	const mw = typeof name !== "string" ? name : middleware;
	if (!mw) {
		navigationDiagnostics.NUXT_E2006({ cause: name });
		return;
	}
	if (global) nuxtApp._middleware.global.push(mw);
	else nuxtApp._middleware.named[name] = mw;
};
/** @since 3.0.0 */
const isProcessingMiddleware = () => {
	try {
		if (useNuxtApp()._processingMiddleware) return true;
	} catch {
		return false;
	}
	return false;
};
const HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
const HTML_ATTR_ENCODE_MAP = {
	"&": "&amp;",
	"\"": "&quot;",
	"'": "&#x27;",
	"<": "&lt;",
	">": "&gt;"
};
function encodeForHtmlAttr(value) {
	return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
/**
* A helper that aids in programmatic navigation within your Nuxt application.
*
* Can be called on the server and on the client, within pages, route middleware, plugins, and more.
* @param {RouteLocationRaw | undefined | null} [to] - The route to navigate to. Accepts a route object, string path, `undefined`, or `null`. Defaults to '/'.
* @param {NavigateToOptions} [options] - Optional customization for controlling the behavior of the navigation.
* @returns {Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw} The navigation result, which varies depending on context and options.
* @see https://nuxt.com/docs/4.x/api/utils/navigate-to
* @since 3.0.0
*/
const navigateTo = (to, options) => {
	to ||= "/";
	const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
	if (import.meta.client && options?.open) {
		const { protocol } = new URL(toPath, window.location.href);
		if (protocol && isScriptProtocol(protocol)) throw navigationDiagnostics.NUXT_E2002({
			toPath,
			protocol
		});
		const { target = "_blank", windowFeatures = {} } = options.open;
		const features = [];
		for (const [feature, value] of Object.entries(windowFeatures)) if (value !== void 0) features.push(`${feature.toLowerCase()}=${value}`);
		open(toPath, target, features.join(", "));
		return Promise.resolve();
	}
	const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
	const isExternal = options?.external || isExternalHost;
	if (isExternal) {
		if (!options?.external) throw navigationDiagnostics.NUXT_E2001({ toPath });
		const { protocol } = new URL(toPath, import.meta.client ? window.location.href : "http://localhost");
		if (protocol && isScriptProtocol(protocol)) throw navigationDiagnostics.NUXT_E2002({
			toPath,
			protocol
		});
	}
	const inMiddleware = isProcessingMiddleware();
	if (import.meta.client && !isExternal && inMiddleware) {
		if (options?.replace) {
			if (typeof to === "string") {
				const { pathname, search, hash } = parseURL(to);
				return {
					path: pathname,
					...search && { query: parseQuery(search) },
					...hash && { hash },
					replace: true
				};
			}
			return {
				...to,
				replace: true
			};
		}
		return to;
	}
	const router = useRouter();
	const nuxtApp = useNuxtApp();
	if (import.meta.server) {
		if (nuxtApp.ssrContext) {
			const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
			const location = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
			const redirect = async function(response) {
				await nuxtApp.callHook("app:redirected");
				const encodedHeader = encodeURL(location, isExternalHost);
				const encodedLoc = encodeForHtmlAttr(encodedHeader);
				nuxtApp.ssrContext["~renderResponse"] = {
					statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
					body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
					headers: { location: encodedHeader }
				};
				return response;
			};
			if (!isExternal && inMiddleware) {
				router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
				return to;
			}
			return redirect(!inMiddleware ? void 0 : false);
		}
	}
	if (isExternal) {
		nuxtApp._scope.stop();
		if (options?.replace) location.replace(toPath);
		else location.href = toPath;
		if (inMiddleware) {
			if (!nuxtApp.isHydrating) return false;
			return new Promise(() => {});
		}
		return Promise.resolve();
	}
	const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
	return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
/**
* This will abort navigation within a Nuxt route middleware handler.
* @since 3.0.0
*/
const abortNavigation = (err) => {
	if (import.meta.dev && !isProcessingMiddleware()) throw navigationDiagnostics.NUXT_E2003();
	if (!err) return false;
	err = createError$1(err);
	if (err.fatal) useNuxtApp().runWithContext(() => showError(err));
	throw err;
};
/**
* Sets the layout for the current page.
* @since 3.0.0
*/
const setPageLayout = (layout, props) => {
	const nuxtApp = useNuxtApp();
	if (import.meta.server) {
		if (import.meta.dev && getCurrentInstance() && nuxtApp.payload.state._layout !== layout) navigationDiagnostics.NUXT_E2007();
		nuxtApp.payload.state._layout = layout;
		nuxtApp.payload.state._layoutProps = props;
	}
	if (import.meta.dev && nuxtApp.isHydrating && nuxtApp.payload.serverRendered && nuxtApp.payload.state._layout !== layout) navigationDiagnostics.NUXT_E2008();
	const inMiddleware = isProcessingMiddleware();
	const middlewareTo = import.meta.server && inMiddleware && nuxtApp._middlewareTo;
	if (middlewareTo) {
		middlewareTo.meta.layout = layout;
		middlewareTo.meta.layoutProps = props;
	}
	if (inMiddleware || import.meta.server || nuxtApp.isHydrating) {
		const unsubscribe = useRouter().beforeResolve((to) => {
			to.meta.layout = layout;
			to.meta.layoutProps = props;
			unsubscribe();
		});
	}
	if (!inMiddleware) {
		const route = useRoute();
		route.meta.layout = layout;
		route.meta.layoutProps = props;
		if (import.meta.client) {
			const unsubscribe = useRouter().beforeResolve((to, from) => {
				if (to.path === from.path) {
					to.meta.layout = layout;
					to.meta.layoutProps = props;
				} else unsubscribe();
			});
			onScopeDispose(unsubscribe, true);
		}
	}
};
/**
* @internal
*/
function resolveRouteObject(to) {
	return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
/**
* @internal
*/
function encodeURL(location, isExternalHost = false) {
	const url = new URL(location, "http://localhost");
	if (!isExternalHost) return url.pathname.replace(/^\/{2,}/, "/") + url.search + url.hash;
	if (location.startsWith("//")) return url.toString().replace(url.protocol, "");
	return url.toString();
}
/**
* Encode the pathname of a route location string. Ensures decoded paths like
* `/café` are percent-encoded to match vue-router's encoded route records.
* Already-encoded paths are not double-encoded.
* @internal
*/
function encodeRoutePath(url) {
	const parsed = parseURL(url);
	return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
//#endregion
export { abortNavigation, addRouteMiddleware, defineNuxtRouteMiddleware, encodeRoutePath, encodeURL, navigateTo, onBeforeRouteLeave, onBeforeRouteUpdate, resolveRouteObject, setPageLayout, useRoute, useRouter };
