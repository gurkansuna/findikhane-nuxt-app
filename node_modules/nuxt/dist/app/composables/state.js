import { useNuxtApp } from "../nuxt.js";
import { toArray } from "../utils.js";
import { stateDiagnostics } from "../diagnostics/state.js";
import { isRef, toRef } from "vue";
import { useStateDefaults } from "#build/nuxt.config.mjs";
//#region src/app/composables/state.ts
const useStateKeyPrefix = "$s";
function useState(...args) {
	const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
	if (typeof args[0] !== "string") args.unshift(autoKey);
	const [_key, init] = args;
	if (!_key || typeof _key !== "string") throw stateDiagnostics.NUXT_E7009({ key: _key });
	if (init !== void 0 && typeof init !== "function") throw stateDiagnostics.NUXT_E7007({ type: typeof init });
	const key = useStateKeyPrefix + _key;
	const nuxtApp = useNuxtApp();
	const state = toRef(nuxtApp.payload.state, key);
	if (init) nuxtApp._state[key] ??= { _default: init };
	if (state.value === void 0 && init) {
		const initialValue = init();
		if (isRef(initialValue)) {
			nuxtApp.payload.state[key] = initialValue;
			return initialValue;
		}
		state.value = initialValue;
	}
	return state;
}
/** @since 3.6.0 */
function clearNuxtState(keys, opts) {
	const reset = opts?.reset ?? useStateDefaults.resetOnClear;
	const nuxtApp = useNuxtApp();
	const _allKeys = Object.keys(nuxtApp.payload.state).filter((key) => key.startsWith(useStateKeyPrefix)).map((key) => key.substring(2));
	const _keys = !keys ? _allKeys : typeof keys === "function" ? _allKeys.filter(keys) : toArray(keys);
	for (const _key of _keys) {
		const key = useStateKeyPrefix + _key;
		if (key in nuxtApp.payload.state) if (reset && nuxtApp._state[key]) nuxtApp.payload.state[key] = nuxtApp._state[key]._default();
		else delete nuxtApp.payload.state[key];
	}
}
//#endregion
export { clearNuxtState, useState };
