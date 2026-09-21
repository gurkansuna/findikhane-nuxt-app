import { defineNuxtPlugin } from "../nuxt.js";
import { useRouter } from "../composables/router.js";
import { onNuxtReady } from "../composables/ready.js";
//#region src/app/plugins/navigation-repaint.client.ts
const plugin = /* @__PURE__ */ defineNuxtPlugin(() => {
	const router = useRouter();
	onNuxtReady(() => {
		router.beforeResolve(async () => {
			/**
			* This gives an opportunity for the browser to repaint, acknowledging user interaction.
			* It can reduce INP when navigating on prerendered routes.
			*
			* @see https://github.com/nuxt/nuxt/issues/26271#issuecomment-2178582037
			* @see https://vercel.com/blog/demystifying-inp-new-tools-and-actionable-insights
			*/
			await new Promise((resolve) => {
				setTimeout(resolve, 100);
				requestAnimationFrame(() => {
					setTimeout(resolve, 0);
				});
			});
		});
	});
});
//#endregion
export { plugin as default };
