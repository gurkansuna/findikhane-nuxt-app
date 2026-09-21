import { defineNuxtPlugin } from "../nuxt.js";
import { onNuxtReady } from "../composables/ready.js";
import { getAppManifest } from "../composables/manifest.js";
import { outdatedBuildInterval } from "#build/nuxt.config.mjs";
import { $fetch } from "#build/fetch";
import { buildAssetsURL } from "#internal/nuxt/paths";
//#region src/app/plugins/check-outdated-build.client.ts
const plugin = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
	if (import.meta.test) return;
	let timeout;
	async function getLatestManifest() {
		let currentManifest;
		try {
			currentManifest = await getAppManifest();
		} catch (e) {
			const err = e;
			if (!("status" in err && (err.status === 404 || err.status === 403))) throw err;
		}
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(getLatestManifest, outdatedBuildInterval);
		try {
			const meta = await $fetch(buildAssetsURL("builds/latest.json") + `?${Date.now()}`);
			if (meta.id !== currentManifest?.id) {
				nuxtApp.hooks.callHook("app:manifest:update", meta);
				if (timeout) clearTimeout(timeout);
			}
		} catch {}
	}
	onNuxtReady(() => {
		timeout = setTimeout(getLatestManifest, outdatedBuildInterval);
	});
});
//#endregion
export { plugin as default };
