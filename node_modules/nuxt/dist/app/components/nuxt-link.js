import { useNuxtApp, useRuntimeConfig } from "../nuxt.js";
import { navigationDiagnostics } from "../diagnostics/navigation.js";
import { encodeRoutePath, navigateTo, resolveRouteObject, useRouter } from "../composables/router.js";
import { renderDiagnostics } from "../diagnostics/render.js";
import { cancelIdleCallback, requestIdleCallback } from "../compat/idle-callback.js";
import { onNuxtReady } from "../composables/ready.js";
import { preloadRouteComponents } from "../composables/preload.js";
import { computed, defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, resolveComponent, shallowRef, unref } from "vue";
import { componentIslands, nuxtLinkDefaults } from "#build/nuxt.config.mjs";
import { hasProtocol, isScriptProtocol, joinURL, parseQuery, withTrailingSlash, withoutTrailingSlash } from "ufo";
import { hashMode } from "#build/router.options.mjs";
//#region src/app/components/nuxt-link.ts
const firstNonUndefined = (...args) => args.find((arg) => arg !== void 0);
/**
* Reject URL strings that would resolve to a script-capable protocol when used as the
* `href` of an anchor element. Returns the value unchanged when safe, or `null`.
*
* The denylist is delegated to `ufo`'s `isScriptProtocol` so it stays in sync with the
* check used by `navigateTo` (currently `javascript:`, `data:`, `vbscript:`, `blob:`).
* ASCII whitespace and control characters are stripped first because browser URL
* parsers tolerate them before the scheme, and `view-source:` is peeled recursively
* because Chromium resolves it transparently to the inner URL.
*/
function sanitizeExternalHref(value) {
	let candidate = value.replace(/[\u0000-\u001F\s]+/g, "");
	while (candidate.toLowerCase().startsWith("view-source:")) candidate = candidate.slice(12);
	const colon = candidate.indexOf(":");
	if (colon > 0 && isScriptProtocol(candidate.slice(0, colon + 1))) return null;
	return value;
}
const NuxtLinkDevKeySymbol = Symbol("nuxt-link-dev-key");
/* @__NO_SIDE_EFFECTS__ */
function defineNuxtLink(options) {
	const componentName = options.componentName || "NuxtLink";
	function checkPropConflicts(props, main, sub) {
		if (import.meta.dev && props[main] !== void 0 && props[sub] !== void 0) renderDiagnostics.NUXT_E4010({
			componentName,
			main,
			sub
		});
	}
	function isHashLinkWithoutHashMode(link) {
		return !hashMode && typeof link === "string" && link.startsWith("#");
	}
	function resolveTrailingSlashBehavior(to, resolve, trailingSlash) {
		const effectiveTrailingSlash = trailingSlash ?? options.trailingSlash;
		if (!to || effectiveTrailingSlash !== "append" && effectiveTrailingSlash !== "remove") return to;
		if (typeof to === "string") return applyTrailingSlashBehavior(to, effectiveTrailingSlash);
		const path = "path" in to && to.path !== void 0 ? to.path : resolve(to).path;
		return {
			...to,
			name: void 0,
			path: applyTrailingSlashBehavior(path, effectiveTrailingSlash)
		};
	}
	function useNuxtLink(props) {
		const router = useRouter();
		const config = /* @__PURE__ */ useRuntimeConfig();
		const hasTarget = computed(() => !!unref(props.target) && unref(props.target) !== "_self");
		const isAbsoluteUrl = computed(() => {
			const path = unref(props.to) || unref(props.href) || "";
			return typeof path === "string" && hasProtocol(path, { acceptRelative: true });
		});
		const builtinRouterLink = resolveComponent("RouterLink");
		const useBuiltinLink = builtinRouterLink && typeof builtinRouterLink !== "string" ? builtinRouterLink.useLink : void 0;
		const isExternal = computed(() => {
			if (unref(props.external)) return true;
			const path = unref(props.to) || unref(props.href) || "";
			if (typeof path === "object") return false;
			return path === "" || isAbsoluteUrl.value;
		});
		const to = computed(() => {
			checkPropConflicts(props, "to", "href");
			const path = unref(props.to) || unref(props.href) || "";
			if (isExternal.value) return path;
			return resolveTrailingSlashBehavior(path, router.resolve, unref(props.trailingSlash));
		});
		const link = isExternal.value ? void 0 : useBuiltinLink?.({
			...props,
			to,
			viewTransition: unref(props.viewTransition)
		});
		const href = computed(() => {
			const effectiveTrailingSlash = unref(props.trailingSlash) ?? options.trailingSlash;
			if (!to.value || isAbsoluteUrl.value || isHashLinkWithoutHashMode(to.value)) {
				const raw = to.value;
				return typeof raw === "string" ? sanitizeExternalHref(raw) : raw;
			}
			if (isExternal.value) {
				const path = typeof to.value === "object" && "path" in to.value ? resolveRouteObject(to.value) : to.value;
				const href = typeof path === "object" ? router.resolve(path).href : path;
				const safe = typeof href === "string" ? sanitizeExternalHref(href) : href;
				return safe === null ? null : applyTrailingSlashBehavior(safe, effectiveTrailingSlash);
			}
			if (typeof to.value === "object") return router.resolve(to.value)?.href ?? null;
			return applyTrailingSlashBehavior(joinURL(config.app.baseURL, to.value), effectiveTrailingSlash);
		});
		return {
			to,
			hasTarget,
			isAbsoluteUrl,
			isExternal,
			href,
			isActive: link?.isActive ?? computed(() => to.value === router.currentRoute.value.path),
			isExactActive: link?.isExactActive ?? computed(() => to.value === router.currentRoute.value.path),
			route: link?.route ?? computed(() => router.resolve(to.value)),
			async navigate(_e) {
				if (href.value === null) {
					if (import.meta.dev) navigationDiagnostics.NUXT_E2011({ componentName });
					return;
				}
				await navigateTo(href.value, {
					replace: unref(props.replace),
					external: isExternal.value || hasTarget.value
				});
			}
		};
	}
	return defineComponent({
		name: componentName,
		props: {
			to: {
				type: [String, Object],
				default: void 0,
				required: false
			},
			href: {
				type: [String, Object],
				default: void 0,
				required: false
			},
			target: {
				type: String,
				default: void 0,
				required: false
			},
			rel: {
				type: String,
				default: void 0,
				required: false
			},
			noRel: {
				type: Boolean,
				default: void 0,
				required: false
			},
			prefetch: {
				type: Boolean,
				default: void 0,
				required: false
			},
			prefetchOn: {
				type: [String, Object],
				default: void 0,
				required: false
			},
			noPrefetch: {
				type: Boolean,
				default: void 0,
				required: false
			},
			activeClass: {
				type: String,
				default: void 0,
				required: false
			},
			exactActiveClass: {
				type: String,
				default: void 0,
				required: false
			},
			prefetchedClass: {
				type: String,
				default: void 0,
				required: false
			},
			replace: {
				type: Boolean,
				default: void 0,
				required: false
			},
			ariaCurrentValue: {
				type: String,
				default: void 0,
				required: false
			},
			external: {
				type: Boolean,
				default: void 0,
				required: false
			},
			custom: {
				type: Boolean,
				default: void 0,
				required: false
			},
			trailingSlash: {
				type: String,
				default: void 0,
				required: false
			}
		},
		useLink: useNuxtLink,
		setup(props, { slots }) {
			const router = useRouter();
			const { to, href, navigate, isExternal, hasTarget, isAbsoluteUrl } = useNuxtLink(props);
			const prefetched = shallowRef(false);
			const el = import.meta.server ? void 0 : ref(null);
			const elRef = import.meta.server ? void 0 : (ref) => {
				el.value = props.custom ? ref?.$el?.nextElementSibling : ref?.$el;
			};
			function shouldPrefetch(mode) {
				if (import.meta.server) return false;
				return Boolean(!prefetched.value && (typeof props.prefetchOn === "string" ? props.prefetchOn === mode : props.prefetchOn?.[mode] ?? options.prefetchOn?.[mode]) && (props.prefetch ?? options.prefetch) !== false && props.noPrefetch !== true && props.target !== "_blank" && !isSlowConnection());
			}
			async function prefetch(nuxtApp = useNuxtApp()) {
				if (import.meta.server) return;
				if (prefetched.value) return;
				if (href.value === null) return;
				prefetched.value = true;
				const path = typeof to.value === "string" ? to.value : isExternal.value ? resolveRouteObject(to.value) : router.resolve(to.value).fullPath;
				const normalizedPath = isExternal.value ? new URL(path, window.location.href).href : path;
				await Promise.all([nuxtApp.hooks.callHook("link:prefetch", normalizedPath)?.catch(() => {}), !import.meta.dev && !isExternal.value && !hasTarget.value && preloadRouteComponents(to.value, router).catch(() => {})]);
			}
			if (import.meta.client && !props.custom) {
				checkPropConflicts(props, "noPrefetch", "prefetch");
				if (shouldPrefetch("visibility")) {
					const nuxtApp = useNuxtApp();
					let idleId;
					let unobserve = null;
					onMounted(() => {
						const observer = useObserver();
						onNuxtReady(() => {
							idleId = requestIdleCallback(() => {
								if (el?.value?.tagName) unobserve = observer.observe(el.value, async () => {
									unobserve?.();
									unobserve = null;
									await prefetch(nuxtApp);
								});
							});
						});
					});
					onBeforeUnmount(() => {
						if (idleId) cancelIdleCallback(idleId);
						unobserve?.();
						unobserve = null;
					});
				}
			}
			if (import.meta.dev && import.meta.server && !props.custom) if (inject(NuxtLinkDevKeySymbol, false)) renderDiagnostics.NUXT_E4009();
			else provide(NuxtLinkDevKeySymbol, true);
			return () => {
				const target = props.target || null;
				checkPropConflicts(props, "noRel", "rel");
				const rel = firstNonUndefined(props.noRel ? "" : props.rel, options.externalRelAttribute, isAbsoluteUrl.value || hasTarget.value ? "noopener noreferrer" : "") || null;
				const getCustomSlotProps = (routerLinkSlotProps) => ({
					href: href.value,
					navigate,
					get route() {
						if (!href.value) return;
						const url = new URL(href.value, import.meta.client ? window.location.href : "http://localhost");
						return {
							path: url.pathname,
							fullPath: url.pathname,
							get query() {
								return parseQuery(url.search);
							},
							hash: url.hash,
							params: {},
							name: void 0,
							matched: [],
							redirectedFrom: void 0,
							meta: {},
							href: href.value
						};
					},
					rel,
					target,
					isExternal: isExternal.value || hasTarget.value,
					isActive: false,
					isExactActive: false,
					...routerLinkSlotProps,
					prefetch,
					prefetched: prefetched.value,
					shouldPrefetch
				});
				if (!isExternal.value && !hasTarget.value && !isHashLinkWithoutHashMode(to.value)) {
					const routerLinkProps = {
						ref: elRef,
						to: to.value,
						activeClass: props.activeClass || options.activeClass,
						exactActiveClass: props.exactActiveClass || options.exactActiveClass,
						replace: props.replace,
						ariaCurrentValue: props.ariaCurrentValue,
						custom: props.custom
					};
					if (!props.custom) {
						if (import.meta.client) {
							if (shouldPrefetch("interaction")) {
								routerLinkProps.onPointerenter = prefetch.bind(null, void 0);
								routerLinkProps.onFocus = prefetch.bind(null, void 0);
							}
							if (prefetched.value) routerLinkProps.class = props.prefetchedClass || options.prefetchedClass;
						}
						routerLinkProps.rel = props.rel || void 0;
						if (import.meta.server && componentIslands && useNuxtApp().ssrContext?.islandContext) {
							const flags = [];
							if (props.replace) flags.push("replace");
							if ((typeof props.prefetchOn === "string" ? props.prefetchOn === "visibility" : props.prefetchOn?.visibility ?? options.prefetchOn?.visibility) && (props.prefetch ?? options.prefetch) !== false && props.noPrefetch !== true) flags.push("prefetch");
							routerLinkProps["data-internal"] = flags.join(" ");
						}
					}
					return h(resolveComponent("RouterLink"), routerLinkProps, props.custom && slots.default ? { default: (slotProps) => slots.default(getCustomSlotProps(slotProps)) } : slots.default);
				}
				if (props.custom) {
					if (!slots.default) return null;
					return slots.default(getCustomSlotProps());
				}
				return h("a", {
					ref: el,
					href: href.value || null,
					rel,
					target,
					onClick: async (event) => {
						if (isExternal.value || hasTarget.value) return;
						event.preventDefault();
						try {
							const encodedHref = encodeRoutePath(href.value ?? "");
							return await (props.replace ? router.replace(encodedHref) : router.push(encodedHref));
						} finally {
							if (import.meta.client && isHashLinkWithoutHashMode(to.value)) {
								const rawHash = to.value.slice(1);
								let hash = rawHash;
								try {
									hash = decodeURIComponent(rawHash);
								} catch {}
								document.getElementById(hash)?.focus();
							}
						}
					}
				}, slots.default?.());
			};
		}
	});
}
const NuxtLink = /* @__PURE__ */ defineNuxtLink(nuxtLinkDefaults);
function applyTrailingSlashBehavior(to, trailingSlash) {
	if (trailingSlash !== "append" && trailingSlash !== "remove") return to;
	const normalizeFn = trailingSlash === "append" ? withTrailingSlash : withoutTrailingSlash;
	if (hasProtocol(to) && !to.startsWith("http")) return to;
	return normalizeFn(to, true);
}
/** @internal */
function useObserver() {
	if (import.meta.server) return;
	const nuxtApp = useNuxtApp();
	if (nuxtApp._observer) return nuxtApp._observer;
	let observer = null;
	const callbacks = /* @__PURE__ */ new Map();
	const observe = (element, callback) => {
		observer ||= new IntersectionObserver((entries) => {
			for (const entry of entries) {
				const callback = callbacks.get(entry.target);
				if ((entry.isIntersecting || entry.intersectionRatio > 0) && callback) callback();
			}
		});
		callbacks.set(element, callback);
		observer.observe(element);
		return () => {
			callbacks.delete(element);
			observer?.unobserve(element);
			if (callbacks.size === 0) {
				observer?.disconnect();
				observer = null;
			}
		};
	};
	return nuxtApp._observer = { observe };
}
const IS_2G_RE = /2g/;
/** @internal */
function isSlowConnection() {
	if (import.meta.server) return;
	const cn = navigator.connection;
	if (cn && (cn.saveData || IS_2G_RE.test(cn.effectiveType))) return true;
	return false;
}
//#endregion
export { NuxtLink as default, defineNuxtLink, isSlowConnection, useObserver };
