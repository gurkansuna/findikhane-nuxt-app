import { useNuxtApp } from "../nuxt.js";
import { useRouter } from "./router.js";
import { stateDiagnostics } from "../diagnostics/state.js";
//#region src/app/composables/once.ts
let _isHmrUpdating = false;
async function callOnce(...args) {
	const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
	if (typeof args[0] !== "string") args.unshift(autoKey);
	const [_key, fn, options] = args;
	if (!_key || typeof _key !== "string") throw stateDiagnostics.NUXT_E7010({ key: _key });
	if (fn !== void 0 && typeof fn !== "function") throw stateDiagnostics.NUXT_E7008({ type: typeof fn });
	const nuxtApp = useNuxtApp();
	if (options?.mode === "navigation") {
		const removeGuard = useRouter().beforeResolve(() => {
			nuxtApp.payload.once.delete(_key);
			removeGuard();
		});
	}
	if (nuxtApp.payload.once.has(_key)) {
		if (!import.meta.dev || !_isHmrUpdating) return;
	}
	nuxtApp._once ||= {};
	nuxtApp._once[_key] ||= fn() || true;
	try {
		await nuxtApp._once[_key];
	} catch (e) {
		delete nuxtApp._once[_key];
		throw e;
	}
	nuxtApp.payload.once.add(_key);
	delete nuxtApp._once[_key];
}
if (import.meta.hot) {
	import.meta.hot.on("vite:beforeUpdate", (payload) => {
		if (payload.updates.some((u) => u.type === "js-update")) _isHmrUpdating = true;
	});
	import.meta.hot.on("vite:afterUpdate", (payload) => {
		if (payload.updates.some((u) => u.type === "js-update")) _isHmrUpdating = false;
	});
}
//#endregion
export { callOnce };
