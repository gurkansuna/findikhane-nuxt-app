import { useStorage } from "nitropack/runtime";
import { AsyncLocalStorage } from "node:async_hooks";
import { NUXT_SHARED_DATA } from "#internal/nuxt/nitro-config.mjs";
//#region src/runtime/utils/cache.ts
/**
* Stack of URLs currently rendering in the active async context (oldest first).
* A repeated entry signals a render cycle.
*/
const prerenderRenderingURLs = import.meta.prerender ? new AsyncLocalStorage() : null;
const payloadCache = import.meta.prerender ? useStorage("internal:nuxt:prerender:payload") : null;
const islandCache = import.meta.prerender ? useStorage("internal:nuxt:prerender:island") : null;
const islandPropCache = import.meta.prerender ? useStorage("internal:nuxt:prerender:island-props") : null;
const sharedPrerenderPromises = import.meta.prerender && NUXT_SHARED_DATA ? /* @__PURE__ */ new Map() : null;
const sharedPrerenderKeys = /* @__PURE__ */ new Set();
const sharedPrerenderChains = import.meta.prerender && NUXT_SHARED_DATA ? /* @__PURE__ */ new Map() : null;
const sharedPrerenderCache = import.meta.prerender && NUXT_SHARED_DATA ? {
	get(key) {
		if (!sharedPrerenderKeys.has(key)) return;
		const currentChain = prerenderRenderingURLs?.getStore();
		const setChain = sharedPrerenderChains?.get(key);
		if (currentChain?.length && setChain?.length && setChain.some((url) => currentChain.includes(url))) return;
		return sharedPrerenderPromises.get(key) ?? useStorage("internal:nuxt:prerender:shared").getItem(key);
	},
	async set(key, value) {
		sharedPrerenderKeys.add(key);
		sharedPrerenderPromises.set(key, value);
		const chain = prerenderRenderingURLs?.getStore();
		if (chain?.length) sharedPrerenderChains.set(key, chain);
		try {
			const resolved = await value;
			await useStorage("internal:nuxt:prerender:shared").setItem(key, resolved);
		} catch {} finally {
			sharedPrerenderPromises.delete(key);
			sharedPrerenderChains?.delete(key);
		}
	}
} : null;
//#endregion
export { islandCache, islandPropCache, payloadCache, prerenderRenderingURLs, sharedPrerenderCache, sharedPrerenderPromises };
