import { appDiagnostics } from "../diagnostics/core.js";
import { useNuxtApp } from "../nuxt.js";
import { toArray } from "../utils.js";
import { useHead } from "../../head/runtime/composables.js";
import "./head.js";
import { computed, getCurrentInstance, ref } from "vue";
import { $fetch } from "#build/fetch";
import { appendHeader, getRequestHeader, getRequestHeaders, getResponseHeader, removeResponseHeader, setResponseHeader, setResponseStatus as setResponseStatus$1 } from "@nuxt/nitro-server/h3";
//#region src/app/composables/ssr.ts
const $fetch$1 = $fetch;
/** @since 3.0.0 */
function useRequestEvent(nuxtApp) {
	if (import.meta.client) return;
	nuxtApp ||= useNuxtApp();
	return nuxtApp.ssrContext?.event;
}
function useRequestHeaders(include) {
	if (import.meta.client) return {};
	const event = useRequestEvent();
	const _headers = event ? getRequestHeaders(event) : {};
	if (!include || !event) return _headers;
	const headers = Object.create(null);
	for (const _key of include) {
		const key = _key.toLowerCase();
		const header = _headers[key];
		if (header) headers[key] = header;
	}
	return headers;
}
/** @since 3.9.0 */
function useRequestHeader(header) {
	if (import.meta.client) return;
	const event = useRequestEvent();
	return event ? getRequestHeader(event, header) : void 0;
}
/** @since 3.2.0 */
function useRequestFetch() {
	if (import.meta.client) return $fetch$1;
	return useRequestEvent()?.$fetch || $fetch$1;
}
function setResponseStatus(arg1, arg2, arg3) {
	if (import.meta.client) return;
	if (arg1 && typeof arg1 !== "number") return setResponseStatus$1(arg1, arg2, arg3);
	const event = useRequestEvent();
	if (event) return setResponseStatus$1(event, arg1, arg2);
}
/** @since 3.14.0 */
function useResponseHeader(header) {
	if (import.meta.client) {
		if (import.meta.dev) return computed({
			get: () => void 0,
			set: () => appDiagnostics.NUXT_E1010()
		});
		return ref();
	}
	const event = useRequestEvent();
	return computed({
		get() {
			return getResponseHeader(event, header);
		},
		set(newValue) {
			if (!newValue) return removeResponseHeader(event, header);
			return setResponseHeader(event, header, newValue);
		}
	});
}
/** @since 3.8.0 */
function prerenderRoutes(path) {
	if (!import.meta.server || !import.meta.prerender) return;
	const paths = toArray(path);
	appendHeader(useRequestEvent(), "x-nitro-prerender", paths.map((p) => encodeURIComponent(p)).join(", "));
}
const PREHYDRATE_ATTR_KEY = "data-prehydrate-id";
function onPrehydrate(callback, key) {
	if (import.meta.client) return;
	if (typeof callback !== "string") throw appDiagnostics.NUXT_E1006();
	const vm = getCurrentInstance();
	if (vm && key) {
		vm.attrs[PREHYDRATE_ATTR_KEY] ||= "";
		key = ":" + key + ":";
		if (!vm.attrs[PREHYDRATE_ATTR_KEY].includes(key)) vm.attrs[PREHYDRATE_ATTR_KEY] += key;
	}
	const code = vm && key ? `document.querySelectorAll('[${PREHYDRATE_ATTR_KEY}*=${JSON.stringify(key)}]').forEach` + callback : callback + "()";
	useHead({ script: [{
		key: vm && key ? key : void 0,
		tagPosition: "bodyClose",
		tagPriority: "critical",
		innerHTML: code
	}] });
	return vm && key ? vm.attrs[PREHYDRATE_ATTR_KEY] : void 0;
}
//#endregion
export { onPrehydrate, prerenderRoutes, setResponseStatus, useRequestEvent, useRequestFetch, useRequestHeader, useRequestHeaders, useResponseHeader };
