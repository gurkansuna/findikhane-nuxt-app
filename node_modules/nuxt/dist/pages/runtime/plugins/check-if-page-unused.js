import { renderDiagnostics } from "../../../app/diagnostics/render.js";
import { isRecordRendered } from "../../../app/diagnostics/rendered-records.js";
import { nextTick } from "vue";
import { defineNuxtPlugin } from "#app/nuxt";
import { useRouter } from "#app/composables/router";
import { useError } from "#app/composables/error";
import { onNuxtReady } from "#app/composables/ready";
//#region src/pages/runtime/plugins/check-if-page-unused.ts
function findUnrenderedNestedPage(route) {
	let parent;
	for (const record of route.matched) {
		if (!record.components?.default) continue;
		if (!Object.values(record.instances ?? {}).some(Boolean) && !isRecordRendered(record)) return parent ? {
			parent,
			child: record
		} : void 0;
		parent = record;
	}
}
const NESTED_PAGE_CONFIRMATION_DELAY = 1e3;
const plugin = defineNuxtPlugin({
	name: "nuxt:checkIfPageUnused",
	setup(nuxtApp) {
		const error = useError();
		function checkIfPageUnused() {
			if (!error.value && !nuxtApp._isNuxtPageUsed) renderDiagnostics.NUXT_E4011();
		}
		if (import.meta.server) nuxtApp.hook("app:rendered", ({ renderResult }) => {
			if (renderResult?.html) nextTick(checkIfPageUnused);
		});
		else {
			onNuxtReady(checkIfPageUnused);
			const router = useRouter();
			const warnedPaths = /* @__PURE__ */ new Set();
			nuxtApp.hook("page:finish", (vnode) => {
				const route = router.currentRoute.value;
				if (vnode && !route.matched.some((record) => record.components?.default === vnode.type)) return;
				Promise.resolve(nuxtApp["~transitionPromise"]).then(() => nextTick()).then(() => {
					if (error.value || router.currentRoute.value !== route) return;
					const candidate = findUnrenderedNestedPage(route);
					if (!candidate || warnedPaths.has(candidate.child.path)) return;
					setTimeout(() => {
						if (error.value || router.currentRoute.value !== route) return;
						const confirmed = findUnrenderedNestedPage(route);
						if (!confirmed || confirmed.child !== candidate.child || warnedPaths.has(confirmed.child.path)) return;
						warnedPaths.add(confirmed.child.path);
						renderDiagnostics.NUXT_E4016({
							fullPath: route.fullPath,
							childPath: confirmed.child.path,
							parentPath: confirmed.parent.path
						});
					}, NESTED_PAGE_CONFIRMATION_DELAY);
				});
			});
		}
	},
	env: { islands: false }
});
//#endregion
export { NESTED_PAGE_CONFIRMATION_DELAY, plugin as default, findUnrenderedNestedPage };
