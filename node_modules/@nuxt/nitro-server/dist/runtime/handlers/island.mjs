import { serverDiagnostics } from "../diagnostics.mjs";
import { filterIslandProps, getIslandHash } from "../nuxt/src/app/island-hash.mjs";
import { findUnsafeIslandPropKey } from "../nuxt/src/app/island-props.mjs";
import { exceedsMaxBytes, exceedsMaxDepth } from "../utils/island-props.mjs";
import { traceAsync } from "../nuxt/src/app/internal/tracing.mjs";
import { islandCache, islandPropCache, prerenderRenderingURLs } from "../utils/cache.mjs";
import { createSSRContext } from "../utils/renderer/app.mjs";
import { getSSRRenderer } from "../utils/renderer/build-files.mjs";
import { renderInlineStyles } from "../utils/renderer/inline-styles.mjs";
import { getClientIslandResponse, getServerComponentHTML, getSlotIslandResponse } from "../utils/renderer/islands.mjs";
import { getQuery } from "ufo";
import { createError, defineEventHandler, getQuery as getQuery$1, getRequestHeader, getRequestWebStream, setResponseHeader, setResponseHeaders, setResponseStatus } from "h3";
import { useNitroApp } from "nitropack/runtime";
import { destr as destr$1 } from "destr";
import { VueResolver, walkResolver } from "@unhead/vue/utils";
import { getRequestDependencies } from "vue-bundle-renderer/runtime";
import { runtimeCompiler, tracingChannelNuxt } from "#internal/nuxt.config.mjs";
//#region src/runtime/handlers/island.ts
const ISLAND_SUFFIX_RE = /\.json(?:\?.*)?$/;
/**
* Renders in flight, keyed by island path, so that pages prerendered in parallel share a
* single render of an island they both embed instead of racing to write its cache entry
* (which fails the build with `EPERM` on Windows).
*/
const inFlightIslands = import.meta.prerender ? /* @__PURE__ */ new Map() : null;
const handler = defineEventHandler(async (event) => {
	setResponseHeaders(event, {
		"content-type": "application/json;charset=utf-8",
		"x-powered-by": "Nuxt"
	});
	if (!import.meta.prerender) return toResponse(event, await renderIsland(event));
	const islandPath = (event.path || "").replace(/\?.*$/, "");
	const stack = prerenderRenderingURLs.getStore();
	if (stack?.includes(islandPath)) {
		const chain = [...stack, islandPath].map((url) => `"${url}"`).join(" -> ");
		throw createError({
			statusCode: 508,
			statusMessage: `Loop detected while prerendering island "${islandPath}" (${chain}).`
		});
	}
	const inFlight = !stack?.some((url) => url.startsWith(ISLAND_PATH_PREFIX)) && inFlightIslands.get(islandPath);
	if (!inFlight) return toResponse(event, await prerenderIsland(event, islandPath));
	const shared = await inFlight.catch((error) => {
		throw createError({
			statusCode: error?.statusCode,
			statusMessage: error?.statusMessage,
			message: error?.message,
			cause: error
		});
	});
	if (shared && !("raw" in shared)) return toResponse(event, shared);
	return toResponse(event, await prerenderIsland(event, islandPath));
});
function toResponse(event, result) {
	return "raw" in result ? returnIslandResponse(event, result.raw) : result;
}
function prerenderIsland(event, islandPath) {
	const stack = prerenderRenderingURLs.getStore();
	const promise = prerenderRenderingURLs.run([...stack || [], islandPath], async () => {
		const cached = await islandCache.getItem(islandPath);
		if (cached) return cached;
		const result = await renderIsland(event);
		if (!("raw" in result)) {
			await islandCache.setItem(islandPath, result);
			await islandPropCache.setItem(islandPath, event.path);
		}
		return result;
	}).finally(() => {
		if (inFlightIslands.get(islandPath) === promise) inFlightIslands.delete(islandPath);
	});
	inFlightIslands.set(islandPath, promise);
	return promise;
}
async function renderIsland(event) {
	const nitroApp = useNitroApp();
	const islandContext = await getIslandContext(event);
	const ssrContext = {
		...createSSRContext(event),
		islandContext,
		noSSR: false,
		url: islandContext.url
	};
	const renderer = await getSSRRenderer();
	const renderResult = await (tracingChannelNuxt ? traceAsync("nuxt.island", {
		event,
		ssrContext,
		islandContext
	}, () => renderer.renderToString(ssrContext)) : renderer.renderToString(ssrContext)).catch(async (err) => {
		if (ssrContext["~renderResponse"] && err?.message === "skipping render") return {};
		await ssrContext.nuxt?.hooks.callHook("app:error", err);
		throw err;
	});
	await ssrContext.nuxt?.hooks.callHook("app:rendered", {
		ssrContext,
		renderResult
	});
	if (ssrContext["~renderResponse"]) {
		const response = ssrContext["~renderResponse"];
		if (response.statusCode && response.statusCode >= 400) throw createError({
			statusCode: response.statusCode,
			statusMessage: response.statusMessage
		});
		return { raw: response };
	}
	if (ssrContext.payload?.error) throw ssrContext.payload.error;
	const inlinedStyles = await renderInlineStyles(ssrContext.modules ?? []);
	if (inlinedStyles.length) ssrContext.head.push({ style: inlinedStyles });
	if (import.meta.dev) {
		const { styles } = getRequestDependencies(ssrContext, renderer.rendererContext);
		const link = [];
		for (const resource of Object.values(styles)) {
			if ("inline" in getQuery(resource.file)) continue;
			if (resource.file.includes("scoped") && !resource.file.includes("pages/")) link.push({
				rel: "stylesheet",
				href: renderer.rendererContext.buildAssetsURL(resource.file),
				crossorigin: ""
			});
		}
		if (link.length) ssrContext.head.push({ link });
	}
	const islandHead = {};
	for (const entry of ssrContext.head.entries.values()) for (const [key, value] of Object.entries(walkResolver(entry.input, VueResolver))) {
		const currentValue = islandHead[key];
		if (Array.isArray(currentValue)) currentValue.push(...value);
		else islandHead[key] = value;
	}
	const islandResponse = {
		id: islandContext.id,
		head: islandHead,
		html: getServerComponentHTML(renderResult.html),
		components: getClientIslandResponse(ssrContext),
		slots: getSlotIslandResponse(ssrContext)
	};
	await nitroApp.hooks.callHook("render:island", islandResponse, {
		event,
		islandContext
	});
	return islandResponse;
}
function returnIslandResponse(event, response) {
	for (const header in response.headers || {}) setResponseHeader(event, header, response.headers[header]);
	if (response.statusCode) setResponseStatus(event, response.statusCode, response.statusMessage);
	return response.body;
}
const ISLAND_PATH_PREFIX = "/__nuxt_island/";
const VALID_COMPONENT_NAME_RE = /^[a-z][\w.-]*$/i;
async function readGuardedIslandBody(event) {
	if (Number(getRequestHeader(event, "content-length")) > 65536) throw createError({
		statusCode: 413,
		statusMessage: "Island request body too large"
	});
	let received = 0;
	let raw = "";
	let overflowed = false;
	const stream = getRequestWebStream(event);
	if (stream) {
		const decoder = new TextDecoder();
		const reader = stream.getReader();
		try {
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				received += value.byteLength;
				if (received > 65536) {
					overflowed = true;
					continue;
				}
				raw += decoder.decode(value, { stream: true });
			}
		} finally {
			reader.releaseLock();
		}
		raw += decoder.decode();
	}
	if (overflowed) throw createError({
		statusCode: 413,
		statusMessage: "Island request body too large"
	});
	if (!raw) return {};
	if (exceedsMaxDepth(raw)) throw createError({
		statusCode: 400,
		statusMessage: "Island request body too deeply nested"
	});
	return destr$1(raw) || {};
}
async function getIslandContext(event) {
	let url = event.path || "";
	const islandPath = url.replace(/\?.*$/, "");
	if (import.meta.prerender && event.path && await islandPropCache.hasItem(islandPath)) url = await islandPropCache.getItem(islandPath);
	if (!url.startsWith(ISLAND_PATH_PREFIX)) throw createError({
		statusCode: 400,
		statusMessage: "Invalid island request path"
	});
	const componentParts = url.substring(15).replace(ISLAND_SUFFIX_RE, "").split("_");
	const hashId = componentParts.length > 1 ? componentParts.pop() : void 0;
	const componentName = componentParts.join("_");
	if (!componentName || !VALID_COMPONENT_NAME_RE.test(componentName)) throw createError({
		statusCode: 400,
		statusMessage: "Invalid island component name"
	});
	const rawContext = event.method === "GET" ? getQuery$1(event) : await readGuardedIslandBody(event);
	const serializedProps = typeof rawContext?.props === "string" ? rawContext.props : "{}";
	if (exceedsMaxBytes(serializedProps)) throw createError({
		statusCode: 413,
		statusMessage: "Island request props too large"
	});
	if (exceedsMaxDepth(serializedProps)) throw createError({
		statusCode: 400,
		statusMessage: "Island request props too deeply nested"
	});
	const clientContext = {};
	if (rawContext && typeof rawContext === "object") {
		for (const key in rawContext) if (key !== "props") clientContext[key] = rawContext[key];
	}
	const parsed = destr$1(serializedProps);
	if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw createError({
		statusCode: 400,
		statusMessage: "Invalid island request props"
	});
	const parsedProps = filterIslandProps(parsed);
	const expectedHash = getIslandHash({
		name: componentName,
		props: parsedProps,
		context: clientContext
	});
	if (!hashId || hashId !== expectedHash) throw createError({
		statusCode: 400,
		statusMessage: "Invalid island request hash"
	});
	if (runtimeCompiler && findUnsafeIslandPropKey(parsedProps)) {
		if (import.meta.dev) serverDiagnostics.NUXT_E8005();
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid island request props"
		});
	}
	return {
		url: typeof rawContext?.url === "string" ? rawContext.url : "/",
		id: hashId,
		name: componentName,
		props: parsedProps,
		slots: {},
		components: {}
	};
}
//#endregion
export { handler as default };
