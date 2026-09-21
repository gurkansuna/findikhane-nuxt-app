import { serverDiagnostics } from "../diagnostics.mjs";
import { traceAsync } from "../nuxt/src/app/internal/tracing.mjs";
import { payloadCache, prerenderRenderingURLs } from "../utils/cache.mjs";
import { createSSRContext, setSSRError } from "../utils/renderer/app.mjs";
import { buildAssetsURL, publicAssetsURL } from "../utils/paths.mjs";
import { APP_ROOT_CLOSE_TAG, APP_ROOT_OPEN_TAG, getRenderer, getServerApp } from "../utils/renderer/build-files.mjs";
import { renderInlineStyles } from "../utils/renderer/inline-styles.mjs";
import { renderStreamedIslandTeleports, replaceIslandTeleports } from "../utils/renderer/islands.mjs";
import { renderPayloadJsonScript, renderPayloadResponse, renderPayloadScript, splitPayload } from "../utils/renderer/payload.mjs";
import { getQuery, joinURL } from "ufo";
import { appendResponseHeader, createError, getQuery as getQuery$1, getRequestHeader, getResponseStatus, getResponseStatusText, removeResponseHeader, setResponseHeader, writeEarlyHints } from "h3";
import { defineRenderHandler, getRouteRules, useNitroApp } from "nitropack/runtime";
import destr from "destr";
import { getPrefetchLinks, getPreloadLinks, getRequestDependencies, renderResourceHeaders } from "vue-bundle-renderer/runtime";
import { appHead, appTeleportAttrs, appTeleportTag, componentIslands, componentIslandsActive, tracingChannelNuxt } from "#internal/nuxt.config.mjs";
import { AsyncLocalStorage } from "node:async_hooks";
import { NUXT_ASYNC_CONTEXT, NUXT_EARLY_HINTS, NUXT_INLINE_STYLES, NUXT_JSON_PAYLOADS, NUXT_NO_SCRIPTS, NUXT_PAYLOAD_EXTRACTION, NUXT_PAYLOAD_INLINE, NUXT_RUNTIME_PAYLOAD_EXTRACTION, NUXT_SSR_STREAMING, NUXT_SSR_STREAMING_BOT_RE, PARSE_ERROR_DATA } from "#internal/nuxt/nitro-config.mjs";
import { propsToString, renderSSRHead } from "@unhead/vue/server";
import { renderToWebStream } from "vue/server-renderer";
import { createBootstrapScript, renderSSRHeadSuspenseChunk, renderShell } from "@unhead/vue/stream/server";
import { streamingIifeCode } from "@unhead/vue/stream/iife";
import { renderSSRHeadOptions } from "#internal/unhead.config.mjs";
import entryIds from "nuxt/entry-ids";
import { entryFileName } from "nuxt/entry-chunk";
import { iifeChunkFileName } from "#internal/streaming-iife-chunk.mjs";
import { relative } from "pathe";
//#region src/runtime/handlers/renderer.ts
globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
if (NUXT_ASYNC_CONTEXT && !("AsyncLocalStorage" in globalThis)) globalThis.AsyncLocalStorage = AsyncLocalStorage;
const HAS_APP_TELEPORTS = !!(appTeleportTag && appTeleportAttrs.id);
const APP_TELEPORT_OPEN_TAG = HAS_APP_TELEPORTS ? `<${appTeleportTag}${propsToString(appTeleportAttrs)}>` : "";
const APP_TELEPORT_CLOSE_TAG = HAS_APP_TELEPORTS ? `</${appTeleportTag}>` : "";
const PAYLOAD_URL_RE = NUXT_JSON_PAYLOADS ? /^[^?]*\/_payload.json(?:\?.*)?$/ : /^[^?]*\/_payload.js(?:\?.*)?$/;
const PAYLOAD_FILENAME = NUXT_JSON_PAYLOADS ? "_payload.json" : "_payload.js";
const PAYLOAD_BUILD_ID_PARAM = "_b";
let entryPath;
const SSR_BOT_RE = NUXT_SSR_STREAMING_BOT_RE;
const handler = defineRenderHandler((event) => {
	const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery$1(event) : null;
	if (ssrError && !("__unenv__" in event.node.req)) throw createError({
		status: 404,
		statusText: "Page Not Found: /__nuxt_error",
		message: "Page Not Found: /__nuxt_error"
	});
	if (import.meta.prerender && prerenderRenderingURLs) {
		const renderingURL = event.path;
		const stack = prerenderRenderingURLs.getStore();
		if (stack?.includes(renderingURL)) {
			const chain = [...stack, renderingURL].filter((url) => !url.startsWith("/__nuxt_error")).map((url) => `"${url}"`).join(" -> ");
			throw createError({
				status: 508,
				statusText: `Loop detected while prerendering "${renderingURL}" (${chain}). Check for \`useFetch\`/\`$fetch\` calls targeting a URL that is currently being rendered.`
			});
		}
		return prerenderRenderingURLs.run([...stack || [], renderingURL], () => renderRoute(event, ssrError));
	}
	return renderRoute(event, ssrError);
});
async function renderRoute(event, ssrError) {
	const nitroApp = useNitroApp();
	const ssrContext = createSSRContext(event);
	ssrContext.head.push(appHead);
	if (ssrError) {
		const status = ssrError.status || ssrError.statusCode;
		if (status) ssrError.status = ssrError.statusCode = Number.parseInt(status);
		if (PARSE_ERROR_DATA && typeof ssrError.data === "string") try {
			ssrError.data = destr(ssrError.data);
		} catch {}
		setSSRError(ssrContext, ssrError);
	}
	const routeOptions = getRouteRules(event);
	if (routeOptions.ssr === false) ssrContext.noSSR = true;
	const _PAYLOAD_EXTRACTION = !ssrContext.noSSR && (import.meta.prerender && NUXT_PAYLOAD_EXTRACTION || NUXT_RUNTIME_PAYLOAD_EXTRACTION && (routeOptions.isr || routeOptions.cache));
	const _PAYLOAD_INLINE = !_PAYLOAD_EXTRACTION || NUXT_PAYLOAD_INLINE;
	const isRenderingPayload = (_PAYLOAD_EXTRACTION || import.meta.dev && routeOptions.prerender) && PAYLOAD_URL_RE.test(ssrContext.url);
	if (isRenderingPayload) {
		const payloadURL = new URL(ssrContext.url, "http://localhost");
		const url = payloadURL.pathname.slice(0, -`/${PAYLOAD_FILENAME}`.length) || "/";
		payloadURL.searchParams.delete(PAYLOAD_BUILD_ID_PARAM);
		ssrContext.url = url + payloadURL.search;
		event._path = event.node.req.url = ssrContext.url;
		const cacheKey = getPayloadCacheKey(ssrContext.url);
		if (import.meta.prerender && payloadCache && await payloadCache.hasItem(cacheKey)) return payloadCache.getItem(cacheKey);
	}
	const payloadURL = _PAYLOAD_EXTRACTION ? buildPayloadURL(ssrContext) : void 0;
	const renderer = await getRenderer(ssrContext);
	if (NUXT_EARLY_HINTS && !isRenderingPayload && !import.meta.prerender) {
		const { link } = renderResourceHeaders({}, renderer.rendererContext);
		if (link) writeEarlyHints(event, link);
	}
	if (NUXT_INLINE_STYLES) for (const id of entryIds) ssrContext.modules.add(id);
	const canStream = NUXT_SSR_STREAMING && !ssrContext.noSSR && !ssrError && !isRenderingPayload && !import.meta.prerender && !(NUXT_NO_SCRIPTS && componentIslandsActive) && !routeOptions.noScripts && !!routeOptions.streaming && !routeOptions.cache && !routeOptions.isr && !routeOptions.redirect;
	const renderRouteContext = {
		canStream,
		prefersStream: !!(NUXT_SSR_STREAMING && !SSR_BOT_RE.test(getRequestHeader(event, "user-agent") || ""))
	};
	await nitroApp.hooks.callHook("render:route", renderRouteContext, { event });
	if (NUXT_SSR_STREAMING && canStream && renderRouteContext.prefersStream) {
		const streamArgs = {
			event,
			ssrContext,
			renderer,
			routeOptions,
			ssrError,
			_PAYLOAD_EXTRACTION,
			_PAYLOAD_INLINE,
			payloadURL
		};
		return tracingChannelNuxt ? traceAsync("nuxt.render", {
			event,
			ssrContext,
			streaming: true
		}, () => renderStreamedResponse(streamArgs)) : renderStreamedResponse(streamArgs);
	}
	const _rendered = await (tracingChannelNuxt ? traceAsync("nuxt.render", {
		event,
		ssrContext,
		streaming: false
	}, () => renderer.renderToString(ssrContext)) : renderer.renderToString(ssrContext)).catch(async (error) => {
		if ((ssrContext["~renderResponse"] || ssrContext._renderResponse) && error.message === "skipping render") return {};
		const _err = !ssrError && ssrContext.payload?.error || error;
		await ssrContext.nuxt?.hooks.callHook("app:error", _err);
		throw _err;
	});
	const inlinedStyles = NUXT_INLINE_STYLES && !ssrContext["~renderResponse"] && !ssrContext._renderResponse && !isRenderingPayload ? await renderInlineStyles(ssrContext.modules ?? []) : [];
	await ssrContext.nuxt?.hooks.callHook("app:rendered", {
		ssrContext,
		renderResult: _rendered
	});
	if (ssrContext["~renderResponse"] || ssrContext._renderResponse) return ssrContext["~renderResponse"] || ssrContext._renderResponse;
	if (ssrContext.payload?.error && !ssrError) throw ssrContext.payload.error;
	if (isRenderingPayload) {
		const response = renderPayloadResponse(ssrContext);
		if (import.meta.prerender && payloadCache) await payloadCache.setItem(getPayloadCacheKey(ssrContext.url), response);
		return response;
	}
	if (_PAYLOAD_EXTRACTION && import.meta.prerender) {
		appendResponseHeader(event, "x-nitro-prerender", joinURL(ssrContext.url.replace(/\?.*$/, ""), PAYLOAD_FILENAME));
		if (payloadCache) await payloadCache.setItem(getPayloadCacheKey(ssrContext.url), renderPayloadResponse(ssrContext));
	}
	const NO_SCRIPTS = NUXT_NO_SCRIPTS || routeOptions.noScripts;
	const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
	if (entryFileName && !NO_SCRIPTS) {
		let path = entryPath;
		if (!path) {
			path = buildAssetsURL(entryFileName);
			if (ssrContext.runtimeConfig.app.cdnURL || /^(?:\/|\.+\/)/.test(path)) entryPath = path;
			else {
				path = relative(event.path.replace(/\/[^/]+$/, "/"), joinURL("/", path));
				if (!/^(?:\/|\.+\/)/.test(path)) path = `./${path}`;
			}
		}
		ssrContext.head.push({ script: [{
			type: "importmap",
			innerHTML: { imports: { "#entry": path } }
		}] });
	}
	if (_PAYLOAD_EXTRACTION && !_PAYLOAD_INLINE && !NO_SCRIPTS) ssrContext.head.push({ link: [NUXT_JSON_PAYLOADS ? {
		rel: "preload",
		as: "fetch",
		crossorigin: "anonymous",
		href: payloadURL
	} : {
		rel: "modulepreload",
		crossorigin: "",
		href: payloadURL
	}] });
	if (inlinedStyles.length) ssrContext.head.push({ style: inlinedStyles });
	const link = [];
	for (const resource of Object.values(styles)) {
		if (import.meta.dev && "inline" in getQuery(resource.file)) continue;
		link.push({
			rel: "stylesheet",
			href: renderer.rendererContext.buildAssetsURL(resource.file),
			crossorigin: ""
		});
	}
	if (link.length) ssrContext.head.push({ link });
	if (!NO_SCRIPTS) {
		const dependencyOptions = ssrContext["~lazyHydratedModules"]?.size ? { exclude: ssrContext["~lazyHydratedModules"] } : void 0;
		const excludeHrefs = new Set(link.map((l) => l.href));
		for (const id of ssrContext["~neverHydratedModules"] ?? []) {
			const file = renderer.rendererContext.manifest?.[id]?.file;
			if (file) excludeHrefs.add(renderer.rendererContext.buildAssetsURL(file));
		}
		const hints = [];
		for (const l of getPreloadLinks(ssrContext, renderer.rendererContext, dependencyOptions)) if (!excludeHrefs.has(l.href)) hints.push(l);
		for (const l of getPrefetchLinks(ssrContext, renderer.rendererContext, dependencyOptions)) if (!excludeHrefs.has(l.href)) hints.push(l);
		ssrContext.head.push({ link: hints });
		ssrContext.head.push({ script: _PAYLOAD_INLINE ? NUXT_JSON_PAYLOADS ? renderPayloadJsonScript({
			ssrContext,
			data: stripInlineOnlyPayloadFields(ssrContext.payload)
		}) : renderPayloadScript({
			ssrContext,
			data: stripInlineOnlyPayloadFields(ssrContext.payload),
			routeOptions
		}) : NUXT_JSON_PAYLOADS ? renderPayloadJsonScript({
			ssrContext,
			data: splitPayload(ssrContext).initial,
			src: payloadURL
		}) : renderPayloadScript({
			ssrContext,
			data: splitPayload(ssrContext).initial,
			routeOptions,
			src: payloadURL
		}) }, {
			tagPosition: "bodyClose",
			tagPriority: "high"
		});
	}
	if (!routeOptions.noScripts) {
		const tagPosition = _PAYLOAD_EXTRACTION && !_PAYLOAD_INLINE && !NUXT_JSON_PAYLOADS ? "bodyClose" : "head";
		ssrContext.head.push({ script: Object.values(scripts).map((resource) => ({
			type: resource.module ? "module" : null,
			src: renderer.rendererContext.buildAssetsURL(resource.file),
			defer: resource.module ? null : true,
			tagPosition,
			crossorigin: ""
		})) });
	}
	const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = renderSSRHead(ssrContext.head, renderSSRHeadOptions);
	const htmlContext = {
		htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
		head: normalizeChunks([headTags]),
		bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
		bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
		body: [componentIslands ? replaceIslandTeleports(ssrContext, _rendered.html) : _rendered.html, APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG],
		bodyAppend: [bodyTags]
	};
	await nitroApp.hooks.callHook("render:html", htmlContext, { event });
	return {
		body: renderHTMLDocument(htmlContext),
		statusCode: getResponseStatus(event),
		statusMessage: getResponseStatusText(event),
		headers: {
			"content-type": "text/html;charset=utf-8",
			"x-powered-by": "Nuxt"
		}
	};
}
async function renderStreamedResponse(ctx) {
	const { event, ssrContext, renderer, routeOptions, ssrError, _PAYLOAD_EXTRACTION, _PAYLOAD_INLINE, payloadURL } = ctx;
	const nitroApp = useNitroApp();
	const NO_SCRIPTS = NUXT_NO_SCRIPTS || !!routeOptions?.noScripts;
	const { link: linkHeader } = renderResourceHeaders({}, renderer.rendererContext);
	if (linkHeader) appendResponseHeader(event, "link", linkHeader);
	const entryInlineStyles = NUXT_INLINE_STYLES ? await renderInlineStyles(new Set(entryIds)) : [];
	if (entryInlineStyles.length) ssrContext.head.push({ style: entryInlineStyles });
	const { styles: entryStyles, scripts: entryScripts } = getRequestDependencies({}, renderer.rendererContext);
	const shellLinks = [];
	for (const resource of Object.values(entryStyles)) {
		if (import.meta.dev && "inline" in getQuery(resource.file)) continue;
		shellLinks.push({
			rel: "stylesheet",
			href: renderer.rendererContext.buildAssetsURL(resource.file),
			crossorigin: ""
		});
	}
	if (shellLinks.length) ssrContext.head.push({ link: shellLinks });
	if (entryFileName && !NO_SCRIPTS) {
		let path = entryPath;
		if (!path) {
			path = buildAssetsURL(entryFileName);
			if (ssrContext.runtimeConfig.app.cdnURL || /^(?:\/|\.+\/)/.test(path)) entryPath = path;
			else {
				path = relative(event.path.replace(/\/[^/]+$/, "/"), joinURL("/", path));
				if (!/^(?:\/|\.+\/)/.test(path)) path = `./${path}`;
			}
		}
		ssrContext.head.push({ script: [{
			tagPosition: "head",
			tagPriority: "critical",
			type: "importmap",
			innerHTML: { imports: { "#entry": path } }
		}] });
	}
	if (_PAYLOAD_EXTRACTION && !_PAYLOAD_INLINE && !NO_SCRIPTS) ssrContext.head.push({ link: [NUXT_JSON_PAYLOADS ? {
		rel: "preload",
		as: "fetch",
		crossorigin: "anonymous",
		href: payloadURL
	} : {
		rel: "modulepreload",
		crossorigin: "",
		href: payloadURL
	}] });
	if (!NO_SCRIPTS) {
		ssrContext.head.push({ link: getPreloadLinks({}, renderer.rendererContext) });
		ssrContext.head.push({ link: getPrefetchLinks({}, renderer.rendererContext) });
	}
	if (!NO_SCRIPTS) ssrContext.head.push({ script: Object.values(entryScripts).map((resource) => ({
		type: resource.module ? "module" : null,
		src: renderer.rendererContext.buildAssetsURL(resource.file),
		defer: resource.module ? null : true,
		tagPosition: "head",
		crossorigin: ""
	})) });
	if (!NO_SCRIPTS && !import.meta.dev && iifeChunkFileName) ssrContext.head.push({ link: [{
		rel: "preload",
		as: "script",
		href: buildAssetsURL(iifeChunkFileName)
	}] });
	const createSSRApp = await getServerApp();
	let vueApp;
	try {
		vueApp = await createSSRApp(ssrContext);
	} catch (error) {
		if ((ssrContext["~renderResponse"] || ssrContext._renderResponse) && error?.message === "skipping render") {
			removeResponseHeader(event, "link");
			return ssrContext["~renderResponse"] || ssrContext._renderResponse;
		}
		await ssrContext.nuxt?.hooks.callHook("app:error", error);
		throw error;
	}
	if (ssrContext["~renderResponse"] || ssrContext._renderResponse) {
		removeResponseHeader(event, "link");
		return ssrContext["~renderResponse"] || ssrContext._renderResponse;
	}
	const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = renderShell(ssrContext.head);
	const cspNonce = headTags.match(/<script[^>]+\bnonce="([^"]*)"/)?.[1];
	const nonceAttr = cspNonce ? ` nonce="${cspNonce}"` : "";
	const bootstrapScript = NO_SCRIPTS ? "" : createBootstrapScript(void 0, cspNonce);
	let iifeScript = "";
	if (!NO_SCRIPTS) if (!import.meta.dev && iifeChunkFileName) iifeScript = `<script async${nonceAttr} src="${buildAssetsURL(iifeChunkFileName)}"><\/script>`;
	else iifeScript = `<script${nonceAttr}>${streamingIifeCode}<\/script>`;
	const shellContext = {
		htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
		head: normalizeChunks([bootstrapScript, headTags]),
		bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
		bodyPrepend: normalizeChunks([iifeScript, bodyTagsOpen]),
		body: [],
		bodyAppend: []
	};
	if (import.meta.dev) {
		const initialBodyLen = shellContext.body.length;
		const initialAppendLen = shellContext.bodyAppend.length;
		await nitroApp.hooks.callHook("render:html", shellContext, {
			event,
			streaming: true
		});
		if (shellContext.body.length !== initialBodyLen || shellContext.bodyAppend.length !== initialAppendLen) serverDiagnostics.NUXT_E8001({ path: event.path });
	} else await nitroApp.hooks.callHook("render:html", shellContext, {
		event,
		streaming: true
	});
	const shellHtml = `<!DOCTYPE html><html${joinAttrs(shellContext.htmlAttrs)}><head>${joinTags(shellContext.head)}</head><body${joinAttrs(shellContext.bodyAttrs)}>` + joinTags(shellContext.bodyPrepend);
	const reader = renderToWebStream(vueApp, ssrContext).getReader();
	let firstChunk;
	try {
		const { done, value } = await reader.read();
		if (!done) firstChunk = value;
	} catch (error) {
		reader.releaseLock();
		removeResponseHeader(event, "link");
		if (ssrContext["~renderResponse"] || ssrContext._renderResponse) return ssrContext["~renderResponse"] || ssrContext._renderResponse;
		const _err = !ssrError && ssrContext.payload?.error || error;
		await ssrContext.nuxt?.hooks.callHook("app:error", _err);
		throw _err;
	}
	if (ssrContext["~renderResponse"] || ssrContext._renderResponse) {
		reader.cancel().catch(() => {});
		removeResponseHeader(event, "link");
		return ssrContext["~renderResponse"] || ssrContext._renderResponse;
	}
	if (ssrContext.payload?.error && !ssrError) {
		reader.cancel().catch(() => {});
		removeResponseHeader(event, "link");
		throw ssrContext.payload.error;
	}
	const committedSnapshot = import.meta.dev ? {
		status: getResponseStatus(event),
		statusText: getResponseStatusText(event),
		headers: snapshotResponseHeaders(event)
	} : null;
	const encoder = new TextEncoder();
	let chunkIndex = 0;
	const enqueueChunk = async (controller, chunk) => {
		const chunkContext = {
			chunk,
			index: chunkIndex++
		};
		await nitroApp.hooks.callHook("render:html:chunk", chunkContext, { event });
		controller.enqueue(chunkContext.chunk);
	};
	const emittedStyles = new Set(Object.values(entryStyles).map((r) => r.file));
	const inlinedCss = new Set(entryInlineStyles.map((s) => String(s.innerHTML)));
	const renderRouteStyles = async () => {
		let tags = "";
		if (NUXT_INLINE_STYLES) {
			for (const style of await renderInlineStyles(ssrContext.modules ?? [])) {
				const css = String(style.innerHTML);
				if (!css || inlinedCss.has(css)) continue;
				inlinedCss.add(css);
				tags += `<style${nonceAttr}>${css}</style>`;
			}
			return tags;
		}
		for (const resource of Object.values(getRequestDependencies(ssrContext, renderer.rendererContext).styles)) {
			if (emittedStyles.has(resource.file)) continue;
			if (import.meta.dev && "inline" in getQuery(resource.file)) continue;
			emittedStyles.add(resource.file);
			tags += `<link rel="stylesheet" crossorigin href="${renderer.rendererContext.buildAssetsURL(resource.file)}">`;
		}
		return tags;
	};
	const outputStream = new ReadableStream({
		async start(controller) {
			try {
				await enqueueChunk(controller, encoder.encode(shellHtml));
				await enqueueChunk(controller, encoder.encode(await renderRouteStyles() + APP_ROOT_OPEN_TAG));
				if (firstChunk) {
					await enqueueChunk(controller, firstChunk);
					const headChunk = renderSSRHeadSuspenseChunk(ssrContext.head);
					if (headChunk && !NO_SCRIPTS) await enqueueChunk(controller, encoder.encode(`<script${nonceAttr}>${headChunk};document.currentScript.remove()<\/script>`));
				}
				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						await enqueueChunk(controller, value);
						const headChunk = renderSSRHeadSuspenseChunk(ssrContext.head);
						if (headChunk && !NO_SCRIPTS) await enqueueChunk(controller, encoder.encode(`<script${nonceAttr}>${headChunk};document.currentScript.remove()<\/script>`));
					}
				} finally {
					reader.releaseLock();
				}
				if (!NO_SCRIPTS) {
					const finalHeadChunk = renderSSRHeadSuspenseChunk(ssrContext.head);
					if (finalHeadChunk) await enqueueChunk(controller, encoder.encode(`<script${nonceAttr}>${finalHeadChunk};document.currentScript.remove()<\/script>`));
				}
				await ssrContext.nuxt?.hooks.callHook("app:rendered", {
					ssrContext,
					renderResult: {}
				});
				if (ssrContext.payload?.error && !ssrError) await ssrContext.nuxt?.hooks.callHook("app:error", ssrContext.payload.error);
				if (!NO_SCRIPTS) ssrContext.head.push({ script: _PAYLOAD_INLINE ? NUXT_JSON_PAYLOADS ? renderPayloadJsonScript({
					ssrContext,
					data: ssrContext.payload
				}) : renderPayloadScript({
					ssrContext,
					data: ssrContext.payload,
					routeOptions
				}) : NUXT_JSON_PAYLOADS ? renderPayloadJsonScript({
					ssrContext,
					data: splitPayload(ssrContext).initial,
					src: payloadURL
				}) : renderPayloadScript({
					ssrContext,
					data: splitPayload(ssrContext).initial,
					routeOptions,
					src: payloadURL
				}) }, {
					tagPosition: "bodyClose",
					tagPriority: "high"
				});
				const closingHead = applyRenderOptions(ssrContext.head.render(), renderSSRHeadOptions);
				const closeContext = { bodyAppend: normalizeChunks([bodyTags, closingHead.bodyTags]) };
				await nitroApp.hooks.callHook("render:html:close", closeContext, { event });
				const teleportHtml = APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG;
				const islandTeleports = NO_SCRIPTS ? "" : renderStreamedIslandTeleports(ssrContext, nonceAttr);
				const closingHtml = APP_ROOT_CLOSE_TAG + await renderRouteStyles() + teleportHtml + (ssrContext.teleports?.body || "") + islandTeleports + joinTags(closeContext.bodyAppend) + "</body></html>";
				await enqueueChunk(controller, encoder.encode(closingHtml));
				controller.close();
				if (committedSnapshot) {
					const currentStatus = getResponseStatus(event);
					const currentStatusText = getResponseStatusText(event);
					const currentHeaders = snapshotResponseHeaders(event);
					const lateMutations = [];
					if (currentStatus !== committedSnapshot.status) lateMutations.push(`response status changed from ${committedSnapshot.status || 200} to ${currentStatus} (e.g. \`setResponseStatus\`)`);
					if (currentStatusText !== committedSnapshot.statusText) lateMutations.push(`response statusText changed (e.g. \`setResponseStatus\`)`);
					if (currentHeaders !== committedSnapshot.headers) lateMutations.push(`response headers changed during render (e.g. \`useCookie\`, \`useResponseHeader\`, \`setHeader\`)`);
					if (lateMutations.length) serverDiagnostics.NUXT_E8002({
						mutations: lateMutations.join("\n  - "),
						path: event.path
					});
				}
			} catch (error) {
				await Promise.resolve(ssrContext.nuxt?.hooks.callHook("app:error", error)).catch(() => {});
				ssrContext.payload ||= {};
				ssrContext.payload.error ||= error;
				try {
					if (!NO_SCRIPTS) {
						ssrContext.head.push({ script: NUXT_JSON_PAYLOADS ? renderPayloadJsonScript({
							ssrContext,
							data: ssrContext.payload
						}) : renderPayloadScript({
							ssrContext,
							data: ssrContext.payload,
							routeOptions
						}) }, {
							tagPosition: "bodyClose",
							tagPriority: "high"
						});
						const tail = applyRenderOptions(ssrContext.head.render(), renderSSRHeadOptions);
						controller.enqueue(encoder.encode(tail.bodyTags));
					}
				} catch {}
				controller.enqueue(encoder.encode(APP_ROOT_CLOSE_TAG + "</body></html>"));
				controller.close();
			}
		},
		cancel(reason) {
			reader.cancel(reason).catch(() => {});
		}
	});
	setResponseHeader(event, "content-type", "text/html;charset=utf-8");
	setResponseHeader(event, "x-powered-by", "Nuxt");
	return { body: outputStream };
}
function applyRenderOptions(payload, options) {
	if (!options.omitLineBreaks) return payload;
	return {
		headTags: payload.headTags.replaceAll("\n", ""),
		bodyTags: payload.bodyTags.replaceAll("\n", ""),
		bodyTagsOpen: payload.bodyTagsOpen.replaceAll("\n", ""),
		htmlAttrs: payload.htmlAttrs,
		bodyAttrs: payload.bodyAttrs
	};
}
function snapshotResponseHeaders(event) {
	const headers = event.node.res.getHeaders();
	return Object.entries(headers).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).sort().join("\n");
}
function getPayloadCacheKey(url) {
	const { pathname, search } = new URL(url, "http://localhost");
	return (pathname === "/" ? "/" : pathname.replace(/\/$/, "")) + (search ? encodeURIComponent(search) : "") + ".json";
}
function buildPayloadURL(ssrContext) {
	const url = new URL(ssrContext.url, "http://localhost");
	const baseURL = ssrContext.runtimeConfig.app.cdnURL || ssrContext.runtimeConfig.app.baseURL;
	const payloadURL = joinURL(baseURL, url.pathname, PAYLOAD_FILENAME);
	url.searchParams.set(PAYLOAD_BUILD_ID_PARAM, ssrContext.runtimeConfig.app.buildId);
	return payloadURL + url.search;
}
function normalizeChunks(chunks) {
	const result = [];
	for (const _chunk of chunks) {
		const chunk = _chunk?.trim();
		if (chunk) result.push(chunk);
	}
	return result;
}
function joinTags(tags) {
	return tags.join("");
}
function joinAttrs(chunks) {
	if (chunks.length === 0) return "";
	return " " + chunks.join(" ");
}
function renderHTMLDocument(html) {
	return `<!DOCTYPE html><html${joinAttrs(html.htmlAttrs)}><head>${joinTags(html.head)}</head><body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body></html>`;
}
function stripInlineOnlyPayloadFields(payload) {
	if (!payload.prefetchLinks) return payload;
	const { prefetchLinks: _, ...rest } = payload;
	return rest;
}
//#endregion
export { handler as default };
