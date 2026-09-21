import { useNuxtApp } from "../nuxt.js";
import { LayoutMetaSymbol, LayoutSymbol, PageRouteSymbol } from "./injections.js";
import { useRoute as useRoute$1, useRouter } from "../composables/router.js";
import { renderDiagnostics } from "../diagnostics/render.js";
import { _mergeTransitionProps, _wrapInTransition } from "./utils.js";
import { resolveLayoutName } from "../composables/layout.js";
import { Suspense, computed, defineComponent, h, inject, mergeProps, nextTick, onMounted, provide, shallowReactive, shallowRef, unref } from "vue";
import { appLayoutTransition } from "#build/nuxt.config.mjs";
import { useRoute } from "#build/pages";
import layouts from "#build/layouts";
//#region src/app/components/nuxt-layout.ts
const LayoutLoader = defineComponent({
	name: "LayoutLoader",
	inheritAttrs: false,
	props: {
		name: String,
		layoutProps: Object
	},
	setup(props, context) {
		return () => h(layouts[props.name], props.layoutProps, context.slots);
	}
});
var nuxt_layout_default = defineComponent({
	name: "NuxtLayout",
	inheritAttrs: false,
	props: {
		name: {
			type: [
				String,
				Boolean,
				Object
			],
			default: null
		},
		fallback: {
			type: [String, Object],
			default: null
		}
	},
	setup(props, context) {
		const nuxtApp = useNuxtApp();
		const injectedRoute = inject(PageRouteSymbol);
		const route = !injectedRoute || injectedRoute === useRoute$1() ? useRoute() : injectedRoute;
		const layout = computed(() => {
			let layout = resolveLayoutName(route, props.name);
			if (layout && !(layout in layouts)) {
				if (import.meta.dev && layout !== "default") renderDiagnostics.NUXT_E4001({
					layout,
					available: Object.keys(layouts).join(", ") || "none"
				});
				if (props.fallback) layout = unref(props.fallback);
			}
			return layout;
		});
		provide(LayoutSymbol, layout);
		const layoutRef = shallowRef();
		context.expose({ layoutRef });
		const done = nuxtApp.deferHydration();
		if (import.meta.client && nuxtApp.isHydrating) {
			const removeErrorHook = nuxtApp.hooks.hookOnce("app:error", done);
			const removeGuard = useRouter().beforeEach(() => {
				removeErrorHook();
				removeGuard();
			});
		}
		if (import.meta.dev) nuxtApp._isNuxtLayoutUsed = true;
		let lastLayout;
		return () => {
			const hasTransition = !!layout.value && layout.value in layouts && !!(route?.meta.layoutTransition ?? appLayoutTransition);
			const transitionProps = hasTransition && _mergeTransitionProps([
				route?.meta.layoutTransition,
				appLayoutTransition,
				{
					onBeforeLeave() {
						nuxtApp["~transitionPromise"] = new Promise((resolve) => {
							nuxtApp["~transitionFinish"] = resolve;
						});
					},
					onAfterLeave() {
						nuxtApp["~transitionFinish"]?.();
						delete nuxtApp["~transitionFinish"];
						delete nuxtApp["~transitionPromise"];
					}
				}
			]);
			const previouslyRenderedLayout = lastLayout;
			lastLayout = layout.value;
			return _wrapInTransition(transitionProps, { default: () => h(Suspense, {
				suspensible: true,
				onResolve: async () => {
					await nextTick(done);
				}
			}, { default: () => h(LayoutProvider, {
				layoutProps: mergeProps(context.attrs, route.meta.layoutProps ?? {}, { ref: layoutRef }),
				key: layout.value || void 0,
				name: layout.value,
				shouldProvide: !props.name,
				isRenderingNewLayout: (name) => {
					return name !== previouslyRenderedLayout && name === layout.value;
				},
				hasTransition
			}, context.slots) }) }).default();
		};
	}
});
const LayoutProvider = defineComponent({
	name: "NuxtLayoutProvider",
	inheritAttrs: false,
	props: {
		name: { type: [String, Boolean] },
		layoutProps: { type: Object },
		hasTransition: { type: Boolean },
		shouldProvide: { type: Boolean },
		isRenderingNewLayout: {
			type: Function,
			required: true
		}
	},
	setup(props, context) {
		const name = props.name;
		if (props.shouldProvide) provide(LayoutMetaSymbol, { isCurrent: (route) => name === false || name === resolveLayoutName(route) });
		const injectedRoute = inject(PageRouteSymbol);
		const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute$1();
		const enclosingLayout = inject(LayoutMetaSymbol, null);
		if (isNotWithinNuxtPage) {
			const vueRouterRoute = useRoute();
			const reactiveChildRoute = {};
			for (const _key in vueRouterRoute) {
				const key = _key;
				Object.defineProperty(reactiveChildRoute, key, {
					enumerable: true,
					get: () => {
						return props.isRenderingNewLayout(props.name) && (!enclosingLayout || enclosingLayout.isCurrent(vueRouterRoute)) ? vueRouterRoute[key] : injectedRoute[key];
					}
				});
			}
			provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
		}
		let vnode;
		if (import.meta.dev && import.meta.client) onMounted(() => {
			nextTick(() => {
				if (["#comment", "#text"].includes(vnode?.el?.nodeName)) if (name) renderDiagnostics.NUXT_E4002({ name });
				else renderDiagnostics.NUXT_E4003();
			});
		});
		return () => {
			if (!name || typeof name === "string" && !(name in layouts)) {
				if (import.meta.dev && import.meta.client && props.hasTransition) {
					vnode = context.slots.default?.();
					return vnode;
				}
				return context.slots.default?.();
			}
			if (import.meta.dev && import.meta.client && props.hasTransition) {
				vnode = h(LayoutLoader, {
					key: name,
					layoutProps: props.layoutProps,
					name
				}, context.slots);
				return vnode;
			}
			return h(LayoutLoader, {
				key: name,
				layoutProps: props.layoutProps,
				name
			}, context.slots);
		};
	}
});
//#endregion
export { nuxt_layout_default as default };
