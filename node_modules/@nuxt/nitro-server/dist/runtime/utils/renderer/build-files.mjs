import { serverDiagnostics } from "../../diagnostics.mjs";
import { buildAssetsURL, publicAssetsURL } from "../paths.mjs";
import { lazyCachedFunction } from "./cache.mjs";
import { useRuntimeConfig } from "nitropack/runtime";
import { createRenderer } from "vue-bundle-renderer/runtime";
import { appRootAttrs, appRootTag, appSpaLoaderAttrs, appSpaLoaderTag, spaLoadingTemplateOutside } from "#internal/nuxt.config.mjs";
import { NUXT_NO_SSR } from "#internal/nuxt/nitro-config.mjs";
import { propsToString } from "@unhead/vue/server";
import { renderToString } from "vue/server-renderer";
//#region src/runtime/utils/renderer/build-files.ts
globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const getServerEntry = () => import("nuxt/entry").then((r) => r.default || r);
const getClientManifest = () => import("nuxt/manifest").then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getPrecomputedDependencies = () => import("nuxt/precomputed").then((r) => "default" in r ? r.default : r).then((r) => typeof r === "function" ? r() : r);
const getSSRRenderer = lazyCachedFunction(async () => {
	const createSSRApp = await getServerEntry();
	if (!createSSRApp) throw serverDiagnostics.NUXT_E8004();
	const precomputed = import.meta.dev ? void 0 : await getPrecomputedDependencies();
	const renderer = createRenderer(createSSRApp, {
		precomputed,
		manifest: import.meta.dev ? await getClientManifest() : void 0,
		renderToString: renderToString$1,
		buildAssetsURL
	});
	async function renderToString$1(input, context) {
		const html = await renderToString(input, context);
		if (import.meta.dev && process.env.NUXT_VITE_NODE_OPTIONS) renderer.rendererContext.updateManifest(await getClientManifest());
		return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
	}
	return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
	const precomputed = import.meta.dev ? void 0 : await getPrecomputedDependencies();
	const spaTemplate = await import("#spa-template").then((r) => r.template).catch(() => "").then((r) => {
		if (spaLoadingTemplateOutside) {
			const APP_SPA_LOADER_OPEN_TAG = `<${appSpaLoaderTag}${propsToString(appSpaLoaderAttrs)}>`;
			const APP_SPA_LOADER_CLOSE_TAG = `</${appSpaLoaderTag}>`;
			return APP_ROOT_OPEN_TAG + APP_ROOT_CLOSE_TAG + (r ? APP_SPA_LOADER_OPEN_TAG + r + APP_SPA_LOADER_CLOSE_TAG : "");
		} else return APP_ROOT_OPEN_TAG + r + APP_ROOT_CLOSE_TAG;
	});
	const renderer = createRenderer(() => () => {}, {
		precomputed,
		manifest: import.meta.dev ? await getClientManifest() : void 0,
		renderToString: () => spaTemplate,
		buildAssetsURL
	});
	const result = await renderer.renderToString({});
	const renderToString = (ssrContext) => {
		const config = useRuntimeConfig(ssrContext.event);
		ssrContext.modules ||= /* @__PURE__ */ new Set();
		ssrContext.payload.serverRendered = false;
		ssrContext.config = {
			public: config.public,
			app: config.app
		};
		return Promise.resolve(result);
	};
	return {
		rendererContext: renderer.rendererContext,
		renderToString
	};
});
function getRenderer(ssrContext) {
	return NUXT_NO_SSR || ssrContext.noSSR ? getSPARenderer() : getSSRRenderer();
}
const getServerApp = lazyCachedFunction(getServerEntry);
const getSSRStyles = lazyCachedFunction(() => import("nuxt/styles").then((r) => r.default || r));
//#endregion
export { APP_ROOT_CLOSE_TAG, APP_ROOT_OPEN_TAG, getRenderer, getSSRRenderer, getSSRStyles, getServerApp };
