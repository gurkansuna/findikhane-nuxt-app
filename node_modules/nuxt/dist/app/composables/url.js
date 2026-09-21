import { useRequestEvent } from "./ssr.js";
import { getRequestURL } from "@nuxt/nitro-server/h3";
//#region src/app/composables/url.ts
/** @since 3.5.0 */
function useRequestURL(opts) {
	if (import.meta.server) return getRequestURL(useRequestEvent(), opts);
	return new URL(globalThis.location.href);
}
//#endregion
export { useRequestURL };
