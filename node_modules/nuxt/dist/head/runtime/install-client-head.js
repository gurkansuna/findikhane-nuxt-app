import { appHead } from "#build/nuxt.config.mjs";
//#region src/head/runtime/install-client-head.ts
function installClientHead(nuxtApp, head) {
	head.push(appHead);
	nuxtApp.vueApp.use(head);
	let pauseDOMUpdates = true;
	const syncHead = () => {
		pauseDOMUpdates = false;
		head.render();
	};
	head.hooks?.hook("dom:beforeRender", (context) => {
		context.shouldRender = !pauseDOMUpdates;
	});
	nuxtApp.hooks.hook("page:start", () => {
		pauseDOMUpdates = true;
	});
	nuxtApp.hooks.hook("page:finish", () => {
		if (!nuxtApp.isHydrating) syncHead();
	});
	nuxtApp.hooks.hook("app:error", syncHead);
	nuxtApp.hooks.hook("app:suspense:resolve", syncHead);
	const originalPush = head.push.bind(head);
	head.push = ((input, options) => {
		const entry = originalPush(input, options);
		const originalDispose = entry.dispose.bind(entry);
		entry.dispose = () => {
			const transitionPromise = nuxtApp["~transitionPromise"];
			if (transitionPromise) transitionPromise.finally(originalDispose);
			else originalDispose();
		};
		return entry;
	});
}
//#endregion
export { installClientHead };
