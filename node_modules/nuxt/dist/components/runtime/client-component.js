import { createCommentVNode, getCurrentInstance, h, onMounted, provide, shallowRef } from "vue";
import { clientNodePlaceholder } from "#build/nuxt.config.mjs";
import { useNuxtApp } from "#app/nuxt";
import { isPromise } from "@vue/shared";
import ServerPlaceholder from "#app/components/server-placeholder";
import { clientOnlySymbol } from "#app/components/client-only";
//#region src/components/runtime/client-component.ts
function createPlaceholder() {
	return clientNodePlaceholder ? createCommentVNode("placeholder") : h("div");
}
/* @__NO_SIDE_EFFECTS__ */
async function createClientPage(loader) {
	const m = await loader();
	const c = m.default || m;
	if (import.meta.dev) c.__clientOnlyPage = true;
	return pageToClientOnly(c);
}
const cache = /* @__PURE__ */ new WeakMap();
function pageToClientOnly(component) {
	if (import.meta.server) return ServerPlaceholder;
	if (cache.has(component)) return cache.get(component);
	const clone = { ...component };
	if (clone.render) clone.render = (ctx, cache, $props, $setup, $data, $options) => $setup.mounted$ ?? ctx.mounted$ ? h(component.render?.bind(ctx)(ctx, cache, $props, $setup, $data, $options)) : createPlaceholder();
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
		provide(clientOnlySymbol, true);
		const vm = getCurrentInstance();
		if (vm) vm._nuxtClientOnly = true;
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
			return (...args) => mounted$.value || !nuxtApp.isHydrating ? h(setupState(...args)) : createPlaceholder();
		});
		else return typeof setupState === "function" ? (...args) => mounted$.value || !nuxtApp.isHydrating ? h(setupState(...args)) : createPlaceholder() : Object.assign(setupState, { mounted$ });
	};
	cache.set(component, clone);
	return clone;
}
//#endregion
export { createClientPage };
