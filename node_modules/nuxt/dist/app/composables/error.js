import { appDiagnostics } from "../diagnostics/core.js";
import { useNuxtApp } from "../nuxt.js";
import { isBotUserAgent } from "../utils.js";
import { useRouter } from "./router.js";
import { toRef } from "vue";
import { createError as createError$1 } from "@nuxt/nitro-server/h3";
//#region src/app/composables/error.ts
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
/** @since 3.0.0 */
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
/** @since 3.0.0 */
const showError = (error) => {
	const nuxtError = createError(error);
	try {
		const error = /* @__PURE__ */ useError();
		if (import.meta.client) useNuxtApp().hooks.callHook("app:error", nuxtError);
		error.value ||= nuxtError;
	} catch {
		throw nuxtError;
	}
	return nuxtError;
};
/**
* Notify the app of an error caught for a crawler without rendering the error
* page, so the bot indexes the server-rendered HTML instead (#32137, #35338).
*
* @internal
*/
const _notifyCrawlerError = (nuxtApp, error) => {
	const result = nuxtApp.callHook("app:error", createError(error));
	appDiagnostics.NUXT_E1012({
		userAgent: navigator.userAgent,
		cause: error
	});
	return result;
};
/**
* Show the error page unless the current client is a crawler, in which case the
* bot receives the already server-rendered HTML instead (#32137, #35338).
*
* @internal
*/
const _showErrorUnlessCrawler = async (nuxtApp, error) => {
	if (import.meta.client && isBotUserAgent(navigator.userAgent)) {
		await _notifyCrawlerError(nuxtApp, error);
		return;
	}
	await nuxtApp.runWithContext(() => showError(error));
};
/** @since 3.0.0 */
const clearError = async (options = {}) => {
	const nuxtApp = useNuxtApp();
	const error = /* @__PURE__ */ useError();
	nuxtApp.callHook("app:error:cleared", options);
	if (options.redirect) await useRouter().replace(options.redirect);
	error.value = void 0;
	if (import.meta.dev && import.meta.client) for (const el of document.querySelectorAll("nuxt-error-overlay")) el.remove();
};
/** @since 3.0.0 */
const isNuxtError = (error) => !!error && typeof error === "object" && "__nuxt_error" in error;
/** @since 3.0.0 */
const createError = (error) => {
	if (typeof error !== "string" && error.statusText) error.message ??= error.statusText;
	const nuxtError = createError$1(error);
	Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
		value: true,
		configurable: false,
		writable: false
	});
	Object.defineProperty(nuxtError, "status", {
		get: () => nuxtError.statusCode,
		configurable: true
	});
	Object.defineProperty(nuxtError, "statusText", {
		get: () => nuxtError.statusMessage,
		configurable: true
	});
	return nuxtError;
};
//#endregion
export { NUXT_ERROR_SIGNATURE, _notifyCrawlerError, _showErrorUnlessCrawler, clearError, createError, isNuxtError, showError, useError };
