import { generateRouteKey, wrapInKeepAlive } from "./utils.js";
import { Fragment, Suspense, createCommentVNode, defineComponent, h, inject, isVNode, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { appKeepalive, appPageTransition } from "#build/nuxt.config.mjs";
import { useNuxtApp } from "#app/nuxt";
import { RouterView } from "vue-router";
import { useRouter as useRouter$1 } from "#app/composables/router";
import { RouteProvider, defineRouteProvider } from "#app/components/route-provider";
import { _mergeTransitionProps, _wrapInTransition } from "#app/components/utils";
import { LayoutMetaSymbol, PageRouteSymbol } from "#app/components/injections";
//#region src/pages/runtime/page.ts
const _routeProviders = import.meta.dev ? /* @__PURE__ */ new Map() : /* @__PURE__ */ new WeakMap();
var page_default = defineComponent({
	name: "NuxtPage",
	inheritAttrs: false,
	props: {
		name: { type: String },
		transition: {
			type: [Boolean, Object],
			default: void 0
		},
		keepalive: {
			type: [Boolean, Object],
			default: void 0
		},
		route: { type: Object },
		pageKey: {
			type: [Function, String],
			default: null
		}
	},
	setup(props, { attrs, slots, expose }) {
		const nuxtApp = useNuxtApp();
		const pageRef = ref();
		const forkRoute = inject(PageRouteSymbol, null);
		const keepAliveInclude = /* @__PURE__ */ new Set();
		let previousPageKey;
		expose({ pageRef });
		const _layoutMeta = inject(LayoutMetaSymbol, null);
		let vnode;
		const done = nuxtApp.deferHydration();
		let isSuspensePending = false;
		let hasResolvedOnce = false;
		let pageStartPromise;
		let suspenseKey = 0;
		if (import.meta.client && nuxtApp.isHydrating) {
			const removeErrorHook = nuxtApp.hooks.hookOnce("app:error", done);
			const removeGuard = useRouter$1().beforeEach(() => {
				removeErrorHook();
				removeGuard();
			});
		}
		if (import.meta.client && props.pageKey) watch(() => props.pageKey, (next, prev) => {
			if (next !== prev) nuxtApp.callHook("page:loading:start");
		});
		if (import.meta.dev) nuxtApp._isNuxtPageUsed = true;
		let pageLoadingEndHookAlreadyCalled = false;
		if (import.meta.client) {
			const unsub = useRouter$1().beforeResolve(() => {
				pageLoadingEndHookAlreadyCalled = false;
			});
			onBeforeUnmount(() => {
				unsub();
				done();
			});
		}
		return () => {
			return h(RouterView, {
				name: props.name,
				route: props.route,
				...attrs
			}, { default: markStableSlot(import.meta.server ? (routeProps) => {
				return h(Suspense, { suspensible: true }, { default() {
					return h(RouteProvider, {
						vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
						route: routeProps.route,
						vnodeRef: pageRef
					});
				} });
			} : (routeProps) => {
				const isRenderingNewRouteInOldFork = haveParentRoutesRendered(forkRoute, routeProps.route, routeProps.Component);
				const hasSameChildren = forkRoute && forkRoute.matched.length === routeProps.route.matched.length;
				if (!routeProps.Component) {
					if (vnode && !hasSameChildren && !isStaleVNode(vnode)) return vnode;
					done();
					return;
				}
				if (vnode && _layoutMeta && !isStaleVNode(vnode) && !_layoutMeta.isCurrent(routeProps.route)) return vnode;
				if (isRenderingNewRouteInOldFork && forkRoute && (!_layoutMeta || _layoutMeta?.isCurrent(forkRoute))) {
					if ((hasSameChildren || vnode) && !isStaleVNode(vnode)) return vnode;
					return null;
				}
				const key = generateRouteKey(routeProps, props.pageKey);
				const willRenderAnotherChild = hasChildrenRoutes(forkRoute, routeProps.route, routeProps.Component);
				if (!nuxtApp.isHydrating && previousPageKey === key && !willRenderAnotherChild) nextTick(() => {
					if (!pageLoadingEndHookAlreadyCalled) {
						pageLoadingEndHookAlreadyCalled = true;
						nuxtApp.callHook("page:loading:end");
					}
				});
				if (isSuspensePending && previousPageKey !== key && hasResolvedOnce) suspenseKey++;
				previousPageKey = key;
				const hasTransition = !!(props.transition ?? routeProps.route.meta.pageTransition ?? appPageTransition);
				const transitionProps = hasTransition && _mergeTransitionProps([
					props.transition,
					routeProps.route.meta.pageTransition,
					appPageTransition,
					{ onAfterLeave() {
						nuxtApp["~transitionFinish"]?.();
						delete nuxtApp["~transitionFinish"];
						delete nuxtApp["~transitionPromise"];
						nuxtApp.callHook("page:transition:finish", routeProps.Component);
					} }
				]);
				const routeKeepaliveConfig = props.keepalive ?? routeProps.route.meta.keepalive ?? appKeepalive;
				const routerComponentType = routeProps.Component.type;
				const componentName = routerComponentType.name || routerComponentType.__name;
				if (routeProps.route.meta.keepalive && componentName) keepAliveInclude.add(componentName);
				let keepaliveConfig;
				if (keepAliveInclude.size > 0 && props.keepalive == null && (!routeKeepaliveConfig || typeof routeKeepaliveConfig === "object" && routeKeepaliveConfig && routeKeepaliveConfig.include)) {
					const baseConfig = typeof routeKeepaliveConfig === "object" && routeKeepaliveConfig ? { ...routeKeepaliveConfig } : {};
					const existingInclude = baseConfig.include ? Array.isArray(baseConfig.include) ? baseConfig.include : [baseConfig.include] : [];
					keepaliveConfig = {
						...baseConfig,
						include: Array.from(/* @__PURE__ */ new Set([...existingInclude, ...keepAliveInclude]))
					};
				} else keepaliveConfig = routeKeepaliveConfig;
				vnode = _wrapInTransition(hasTransition && transitionProps, wrapInKeepAlive(keepaliveConfig, h(Suspense, {
					key: suspenseKey,
					suspensible: true,
					onPending: () => {
						isSuspensePending = true;
						if (hasTransition && !nuxtApp["~transitionPromise"]) nuxtApp["~transitionPromise"] = new Promise((resolve) => {
							nuxtApp["~transitionFinish"] = resolve;
						});
						pageStartPromise = nuxtApp.callHook("page:start", routeProps.Component);
					},
					onResolve: async () => {
						isSuspensePending = false;
						hasResolvedOnce = true;
						if (import.meta.client && nuxtApp.isHydrating) nuxtApp["~restoreDeferredRoute"]?.();
						try {
							await nextTick();
							nuxtApp._route.sync?.();
							await pageStartPromise;
							await nuxtApp.callHook("page:finish", routeProps.Component);
							if (!pageLoadingEndHookAlreadyCalled && !willRenderAnotherChild) {
								pageLoadingEndHookAlreadyCalled = true;
								await nuxtApp.callHook("page:loading:end");
							}
						} finally {
							done();
						}
					}
				}, { default: () => {
					const routeProviderProps = {
						key: key || void 0,
						vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
						route: routeProps.route,
						renderKey: key || void 0,
						trackRootNodes: hasTransition,
						vnodeRef: pageRef,
						routeRecord: import.meta.dev ? routeProps.route.matched.find((m) => m.components?.default === routeProps.Component.type) : void 0
					};
					if (!keepaliveConfig) return h(RouteProvider, routeProviderProps);
					const routeProviderKey = import.meta.dev ? componentName : routerComponentType;
					let PageRouteProvider = _routeProviders.get(routeProviderKey);
					if (!PageRouteProvider) {
						PageRouteProvider = defineRouteProvider(componentName);
						_routeProviders.set(routeProviderKey, PageRouteProvider);
					}
					return h(PageRouteProvider, routeProviderProps);
				} }))).default();
				return vnode;
			}) });
		};
	}
});
function haveParentRoutesRendered(fork, newRoute, Component) {
	if (!fork) return false;
	const index = newRoute.matched.findIndex((m) => m.components?.default === Component?.type);
	if (index === -1) return false;
	const newParents = newRoute.matched.slice(0, index).filter((m) => m.components?.default);
	if (!newParents.length) return false;
	const forkParents = fork.matched.filter((m) => m.components?.default);
	return newParents.some((c, i) => c.components?.default !== forkParents[i]?.components?.default) || Component && generateRouteKey({
		route: newRoute,
		Component
	}) !== generateRouteKey({
		route: fork,
		Component
	});
}
function hasChildrenRoutes(fork, newRoute, Component) {
	if (!fork) return false;
	return newRoute.matched.findIndex((m) => m.components?.default === Component?.type) < newRoute.matched.length - 1;
}
function markStableSlot(fn) {
	const wrapped = ((routeProps) => {
		const result = fn(routeProps);
		if (Array.isArray(result)) return result;
		if (result == null || !isVNode(result)) return [createCommentVNode()];
		return [result];
	});
	wrapped._n = true;
	return wrapped;
}
function normalizeSlot(slot, data) {
	const slotContent = slot(data);
	return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
function isStaleVNode(vnode) {
	return !!vnode && (!!vnode.suspense?.isUnmounted || !!vnode.component?.isUnmounted);
}
//#endregion
export { page_default as default };
