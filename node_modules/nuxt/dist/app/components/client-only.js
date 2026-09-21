import { useNuxtApp } from "../nuxt.js";
import ServerPlaceholder from "./server-placeholder.js";
import { elToStaticVNode, sanitizeTag } from "./utils.js";
import { cloneVNode, createCommentVNode, createElementBlock, defineComponent, getCurrentInstance, h, onMounted, provide, shallowRef } from "vue";
import { clientNodePlaceholder } from "#build/nuxt.config.mjs";
import { isPromise } from "@vue/shared";
//#region src/app/components/client-only.ts
const clientOnlySymbol = Symbol.for("nuxt:client-only");
const STATIC_DIV = "<div></div>";
function isPlaceholderComment(el) {
	return el.nodeName === "#comment" && el.nodeValue === "placeholder";
}
function createPlaceholder(el) {
	if (el && !isPlaceholderComment(el)) return elToStaticVNode(el, STATIC_DIV);
	return clientNodePlaceholder ? createCommentVNode("placeholder") : h("div");
}
const ClientOnly = defineComponent({
	name: "ClientOnly",
	inheritAttrs: false,
	props: [
		"fallback",
		"placeholder",
		"placeholderTag",
		"fallbackTag"
	],
	...import.meta.dev && { slots: Object },
	setup(props, { slots, attrs }) {
		const mounted = shallowRef(false);
		onMounted(() => {
			mounted.value = true;
		});
		if (import.meta.dev) {
			const nuxtApp = useNuxtApp();
			nuxtApp._isNuxtPageUsed = true;
			nuxtApp._isNuxtLayoutUsed = true;
		}
		const vm = getCurrentInstance();
		if (vm) vm._nuxtClientOnly = true;
		provide(clientOnlySymbol, true);
		return () => {
			if (mounted.value) {
				const vnodes = slots.default?.();
				if (vnodes && vnodes.length === 1) return [cloneVNode(vnodes[0], attrs)];
				return vnodes;
			}
			const slot = slots.fallback || slots.placeholder;
			if (slot) return h(slot);
			const fallbackStr = props.fallback || props.placeholder || "";
			const fallbackTag = sanitizeTag(props.fallbackTag || props.placeholderTag, "span");
			return createElementBlock(fallbackTag, attrs, fallbackStr);
		};
	}
});
const cache = /* @__PURE__ */ new WeakMap();
/* @__NO_SIDE_EFFECTS__ */
function createClientOnly(component) {
	if (import.meta.server) return ServerPlaceholder;
	if (cache.has(component)) return cache.get(component);
	const clone = { ...component };
	if (clone.render) clone.render = (ctx, cache, $props, $setup, $data, $options) => {
		if ($setup.mounted$ ?? ctx.mounted$) {
			const res = component.render?.bind(ctx)(ctx, cache, $props, $setup, $data, $options);
			return res.children === null || typeof res.children === "string" ? cloneVNode(res) : h(res);
		}
		return createPlaceholder(ctx._.vnode.el);
	};
	else {
		const placeholderTemplate = clientNodePlaceholder ? "<!--placeholder-->" : "<div></div>";
		clone.template &&= `
      <template v-if="mounted$">${component.template}</template>
      <template v-else>${placeholderTemplate}</template>
    `;
	}
	clone.setup = (props, ctx) => {
		const nuxtApp = useNuxtApp();
		const mounted$ = shallowRef(nuxtApp.isHydrating === false);
		const instance = getCurrentInstance();
		if (nuxtApp.isHydrating) {
			const attrs = { ...instance.attrs };
			const directives = extractDirectives(instance);
			for (const key in attrs) delete instance.attrs[key];
			onMounted(() => {
				Object.assign(instance.attrs, attrs);
				instance.vnode.dirs = directives;
			});
		}
		onMounted(() => {
			mounted$.value = true;
		});
		const setupState = component.setup?.(props, ctx) || {};
		if (isPromise(setupState)) return Promise.resolve(setupState).then((setupState) => {
			if (typeof setupState !== "function") {
				setupState ||= {};
				setupState.mounted$ = mounted$;
				return setupState;
			}
			return (...args) => {
				if (mounted$.value || !nuxtApp.isHydrating) {
					const res = setupState(...args);
					return res.children === null || typeof res.children === "string" ? cloneVNode(res) : h(res);
				}
				return createPlaceholder(instance?.vnode.el);
			};
		});
		else {
			if (typeof setupState === "function") return (...args) => {
				if (mounted$.value) {
					const res = setupState(...args);
					const attrs = clone.inheritAttrs !== false ? ctx.attrs : void 0;
					return res.children === null || typeof res.children === "string" ? cloneVNode(res, attrs) : h(res, attrs);
				}
				return createPlaceholder(instance?.vnode.el);
			};
			return Object.assign(setupState, { mounted$ });
		}
	};
	cache.set(component, clone);
	return clone;
}
function extractDirectives(instance) {
	if (!instance || !instance.vnode.dirs) return null;
	const directives = instance.vnode.dirs;
	instance.vnode.dirs = null;
	return directives;
}
//#endregion
export { clientOnlySymbol, createClientOnly, ClientOnly as default };
