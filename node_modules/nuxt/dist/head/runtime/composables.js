import { unheadDiagnostics } from "../../app/diagnostics/head.js";
import { hasInjectionContext, inject } from "vue";
import { headSymbol, useHead as useHead$1, useHeadSafe as useHeadSafe$1, useSeoMeta as useSeoMeta$1, useServerHead as useServerHead$1, useServerHeadSafe as useServerHeadSafe$1, useServerSeoMeta as useServerSeoMeta$1 } from "@unhead/vue";
import { useNuxtApp } from "#app/nuxt";
//#region src/head/runtime/composables.ts
/**
* Injects the head client from the Nuxt context or Vue inject.
*/
function injectHead(nuxtApp) {
	const nuxt = nuxtApp || useNuxtApp();
	return nuxt.ssrContext?.head || nuxt.runWithContext(() => {
		if (hasInjectionContext()) {
			const head = inject(headSymbol);
			if (!head) throw unheadDiagnostics.NUXT_E6001();
			return head;
		}
	});
}
function useHead(input, options = {}) {
	const head = options.head || injectHead(options.nuxt);
	return useHead$1(input, {
		head,
		...options
	});
}
function useHeadSafe(input, options = {}) {
	const head = options.head || injectHead(options.nuxt);
	return useHeadSafe$1(input, {
		head,
		...options
	});
}
function useSeoMeta(input, options = {}) {
	const head = options.head || injectHead(options.nuxt);
	return useSeoMeta$1(input, {
		head,
		...options
	});
}
/**
* @deprecated Use `useHead` instead and wrap with `if (import.meta.server)`
*/
function useServerHead(input, options = {}) {
	const head = options.head || injectHead(options.nuxt);
	return useServerHead$1(input, {
		head,
		...options
	});
}
/**
* @deprecated Use `useHeadSafe` instead and wrap with `if (import.meta.server)`
*/
function useServerHeadSafe(input, options = {}) {
	const head = options.head || injectHead(options.nuxt);
	return useServerHeadSafe$1(input, {
		head,
		...options
	});
}
/**
* @deprecated Use `useSeoMeta` instead and wrap with `if (import.meta.server)`
*/
function useServerSeoMeta(input, options = {}) {
	const head = options.head || injectHead(options.nuxt);
	return useServerSeoMeta$1(input, {
		head,
		...options
	});
}
//#endregion
export { injectHead, useHead, useHeadSafe, useSeoMeta, useServerHead, useServerHeadSafe, useServerSeoMeta };
