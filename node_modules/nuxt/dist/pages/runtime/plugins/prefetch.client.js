import { toArray } from "../utils.js";
import { hasProtocol } from "ufo";
import { defineNuxtPlugin } from "#app/nuxt";
import layouts from "#build/layouts";
import { namedMiddleware } from "#build/middleware";
import { useRouter } from "#app/composables/router";
import { _loadAsyncComponent } from "#app/composables/preload";
//#region src/pages/runtime/plugins/prefetch.client.ts
const plugin = defineNuxtPlugin({
	name: "nuxt:prefetch",
	setup(nuxtApp) {
		const router = useRouter();
		nuxtApp.hooks.hook("app:mounted", () => {
			router.beforeEach(async (to) => {
				const layout = to?.meta?.layout;
				if (layout && typeof layouts[layout] === "function") await layouts[layout]();
			});
		});
		nuxtApp.hooks.hook("link:prefetch", (url) => {
			if (hasProtocol(url)) return;
			const route = router.resolve(url);
			if (!route) return;
			const layout = route.meta.layout;
			const middleware = toArray(route.meta.middleware).filter((m) => typeof m === "string");
			for (const name of middleware) {
				const handler = namedMiddleware[name];
				if (typeof handler === "function") handler();
			}
			if (typeof layout === "string" && layout in layouts) _loadAsyncComponent(layouts[layout]);
		});
	}
});
//#endregion
export { plugin as default };
