import { defineNuxtPlugin } from "../nuxt.js";
import { useRouter } from "../composables/router.js";
import { injectHead } from "../../head/runtime/composables.js";
import "../composables/head.js";
import { onNuxtReady } from "../composables/ready.js";
import { stateDiagnostics } from "../diagnostics/state.js";
import { getAppManifest } from "../composables/manifest.js";
import { isCachedPayloadRoute, loadPayload } from "../composables/payload.js";
import { appManifest, prefetchPreloadTags, purgeCachedData } from "#build/nuxt.config.mjs";
import { withoutFragment } from "ufo";
//#region src/app/plugins/payload.client.ts
const forwardedPrefetchEntries = /* @__PURE__ */ new Map();
const plugin = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:payload",
	setup(nuxtApp) {
		const staticKeysToRemove = /* @__PURE__ */ new Set();
		const router = useRouter();
		if (prefetchPreloadTags) router.afterEach(() => {
			for (const entry of forwardedPrefetchEntries.values()) entry.dispose();
			forwardedPrefetchEntries.clear();
		});
		router.beforeResolve(async (to, from) => {
			const queryAware = isCachedPayloadRoute(to.path);
			const toURL = queryAware ? withoutFragment(to.fullPath) : to.path;
			if (toURL === (queryAware ? withoutFragment(from.fullPath) : from.path)) return;
			const payload = await loadPayload(toURL);
			if (!payload) return;
			if (purgeCachedData) for (const key of staticKeysToRemove) delete nuxtApp.static.data[key];
			for (const key in payload.data) {
				if (purgeCachedData) {
					if (!(key in nuxtApp.static.data)) staticKeysToRemove.add(key);
				}
				nuxtApp.static.data[key] = payload.data[key];
			}
		});
		onNuxtReady(() => {
			const head = prefetchPreloadTags ? injectHead(nuxtApp) : null;
			nuxtApp.hooks.hook("link:prefetch", async (url) => {
				const { hostname, pathname } = new URL(url, window.location.href);
				if (hostname !== window.location.hostname) return;
				const payload = await loadPayload(url).catch(() => {
					stateDiagnostics.NUXT_E7003({ url });
				});
				if (head && payload?.prefetchLinks?.length && !forwardedPrefetchEntries.has(pathname)) {
					const entry = head.push({ link: payload.prefetchLinks.map((link) => {
						const { rel: _rel, ...rest } = link;
						return {
							...rest,
							rel: "prefetch"
						};
					}) });
					forwardedPrefetchEntries.set(pathname, entry);
				}
			});
			if (appManifest && navigator.connection?.effectiveType !== "slow-2g") setTimeout(getAppManifest, 1e3);
		});
	}
});
//#endregion
export { plugin as default };
