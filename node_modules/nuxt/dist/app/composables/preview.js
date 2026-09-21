import { useNuxtApp } from "../nuxt.js";
import { useRoute, useRouter } from "./router.js";
import { refreshNuxtData } from "./asyncData.js";
import { useState } from "./state.js";
import { toRef, watch } from "vue";
//#region src/app/composables/preview.ts
let unregisterRefreshHook;
/** @since 3.11.0 */
function usePreviewMode(options = {}) {
	const preview = useState("_preview-state", () => ({
		enabled: false,
		state: {}
	}));
	if (preview.value._initialized) return {
		enabled: toRef(preview.value, "enabled"),
		state: preview.value.state
	};
	if (import.meta.client) preview.value._initialized = true;
	const shouldEnable = options.shouldEnable ?? defaultShouldEnable;
	function checkEnabled() {
		if (preview.value.enabled) return;
		const result = shouldEnable(preview.value.state);
		if (typeof result === "boolean") preview.value.enabled = result;
	}
	checkEnabled();
	if (import.meta.client && !preview.value.enabled) {
		const nuxtApp = useNuxtApp();
		if (nuxtApp["~restoreDeferredRoute"]) nuxtApp.hooks.hookOnce("app:suspense:resolve", () => nuxtApp.runWithContext(checkEnabled));
	}
	watch(() => preview.value.enabled, (value) => {
		if (value) {
			const newState = (options.getState ?? getDefaultState)(preview.value.state);
			if (newState !== preview.value.state) Object.assign(preview.value.state, newState);
			if (import.meta.client && !unregisterRefreshHook) {
				(options.onEnable ?? refreshNuxtData)();
				unregisterRefreshHook = options.onDisable ?? useRouter().afterEach(() => refreshNuxtData());
			}
		} else if (unregisterRefreshHook) {
			unregisterRefreshHook();
			unregisterRefreshHook = void 0;
		}
	}, {
		immediate: true,
		flush: "sync"
	});
	return {
		enabled: toRef(preview.value, "enabled"),
		state: preview.value.state
	};
}
function defaultShouldEnable() {
	return useRoute().query["preview"] === "true";
}
function getDefaultState(state) {
	if (state.token !== void 0) return state;
	const route = useRoute();
	state.token = Array.isArray(route.query.token) ? route.query.token[0] : route.query.token;
	return state;
}
//#endregion
export { usePreviewMode };
