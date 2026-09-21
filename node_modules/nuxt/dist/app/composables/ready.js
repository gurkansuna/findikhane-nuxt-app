import { useNuxtApp } from "../nuxt.js";
import { requestIdleCallback } from "../compat/idle-callback.js";
//#region src/app/composables/ready.ts
/** @since 3.1.0 */
const onNuxtReady = (callback) => {
	if (import.meta.server) return;
	const nuxtApp = useNuxtApp();
	if (nuxtApp.isHydrating) nuxtApp.hooks.hookOnce("app:suspense:resolve", () => {
		requestIdleCallback(() => callback());
	});
	else requestIdleCallback(() => callback());
};
//#endregion
export { onNuxtReady };
