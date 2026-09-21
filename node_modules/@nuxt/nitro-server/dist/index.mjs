import { performance } from "node:perf_hooks";
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync, mkdirSync, promises, readFileSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import process from "node:process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { addRoute, createRouter, findAllRoutes } from "rou3";
import { compileRouterToString } from "rou3/compiler";
import { dirname, isAbsolute, join, relative, resolve } from "pathe";
import { joinURL, withTrailingSlash } from "ufo";
import { hash } from "ohash";
import nuxtPkg from "nuxt/package.json" with { type: "json" };
import { build, copyPublicAssets, createDevServer, createNitro, prepare, prerender, scanHandlers, writeTypes } from "nitropack";
import { addPlugin, addTemplate, addVitePlugin, bundlerDiagnostics, createIsIgnored, findPath, getDirectory, getLayerDirectories, logger, resolveAlias, resolveIgnorePatterns, resolveNuxtModule } from "@nuxt/kit";
import escapeRE from "escape-string-regexp";
import { defu } from "defu";
import { defineEventHandler, dynamicEventHandler, getRequestHeader, getRequestIP, handleCors, setHeader, setResponseStatus } from "h3";
import { addDependency } from "nypm";
import { hasTTY, isCI, isWindows } from "std-env";
import { ImpoundPlugin } from "impound";
import { resolveModulePath } from "exsolve";
import { runtimeDependencies } from "nitropack/runtime/meta";
//#region package.json
var version = "4.5.2";
//#endregion
//#region src/utils.ts
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}
const NODE_MODULES_RE = /\/node_modules\//g;
/**
* Build the regex Nitro uses to skip transforming files under `node_modules`,
* while still transforming files that belong to layers that happen to live
* inside a `node_modules` directory.
*
* Layer paths can contain multiple `/node_modules/` segments (nested npm
* installs; pnpm's `.pnpm/<id>/node_modules/<name>` store). The exclude
* pattern is `node_modules/(?!<alts>)` evaluated at every `node_modules/`
* boundary, so we push the suffix at each boundary to make the lookahead
* fail wherever the layer's own files live.
*/
function getLayerNodeModulesExcludePattern(layerRoots) {
	const excludePaths = [];
	for (const layerRoot of layerRoots) {
		const root = layerRoot.replace(/\/$/, "");
		NODE_MODULES_RE.lastIndex = 0;
		let match;
		while (match = NODE_MODULES_RE.exec(root)) {
			const suffix = root.slice(match.index + match[0].length);
			if (suffix) excludePaths.push(escapeRE(suffix));
			NODE_MODULES_RE.lastIndex = match.index + 1;
		}
	}
	return excludePaths.length ? new RegExp(`node_modules\\/(?!${excludePaths.join("|")})`) : /node_modules/;
}
let _distDir = dirname(fileURLToPath(import.meta.url));
if (/(?:chunks|shared)$/.test(_distDir)) _distDir = dirname(_distDir);
const distDir = _distDir;
//#endregion
//#region src/dev-request.ts
const LOOPBACK_HOSTS = /* @__PURE__ */ new Set([
	"localhost",
	"127.0.0.1",
	"[::1]",
	"::1"
]);
/**
* Whether the connected peer is a loopback address.
*
* This inspects the TCP peer address rather than request metadata, so a
* non-browser client cannot make itself look local by choosing its `Host`,
* `Origin`, `Referer` or `Sec-Fetch-*` headers. `x-forwarded-for` is ignored on
* purpose: only the address of the socket we are actually talking to counts.
*/
function isLoopbackPeer(event) {
	return isLoopbackAddress(getRequestIP(event));
}
function isLoopbackAddress(address) {
	if (!address) return false;
	let normalized = address.trim().toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
	const zoneIndex = normalized.indexOf("%");
	if (zoneIndex !== -1) normalized = normalized.slice(0, zoneIndex);
	if (normalized.startsWith("::ffff:")) normalized = normalized.slice(7);
	if (normalized === "::1") return true;
	return /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalized);
}
/**
* Header-based same-origin/allowed-host gate shared by dev-only handlers.
*
* A request with no `Sec-Fetch-Site`, `Origin` or `Referer` cannot be a
* cross-site browser request, so it is treated as local; this is the deliberate
* CSRF behaviour relied on by other dev handlers. Endpoints that disclose
* sensitive local state to non-browser clients must additionally require
* {@link isLoopbackPeer}, since these headers are all attacker-controlled over a
* direct connection.
*/
function isLocalDevRequest(event, allowedHosts) {
	const hostHeader = getRequestHeader(event, "host");
	if (allowedHosts !== true) {
		const host = hostHeader?.split(":")[0];
		if (!host || !allowedHosts.has(host)) return false;
	}
	const site = getRequestHeader(event, "sec-fetch-site");
	if (site !== void 0) return site === "same-origin" || site === "none";
	const initiator = getRequestHeader(event, "origin") || getRequestHeader(event, "referer");
	if (!initiator) return true;
	try {
		return new URL(initiator).host === hostHeader;
	} catch {
		return false;
	}
}
//#endregion
//#region src/templates/spa-loading-icon.ts
const template = () => {
	return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"80\" fill=\"none\" class=\"nuxt-spa-loading\" viewBox=\"0 0 37 25\"><path d=\"M24.236 22.006h10.742L25.563 5.822l-8.979 14.31a4 4 0 0 1-3.388 1.874H2.978l11.631-20 5.897 10.567\"/></svg><style>.nuxt-spa-loading{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%)}.nuxt-spa-loading>path{fill:none;stroke:#00dc82;stroke-width:4px;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:128;stroke-dashoffset:128;animation:nuxt-spa-loading-move 3s linear infinite}@keyframes nuxt-spa-loading-move{to{stroke-dashoffset:-128}}</style>";
};
//#endregion
//#region ../nuxt/src/core/plugins/import-protection.ts
function createImportProtectionPatterns(nuxt, options) {
	const patterns = [];
	const context = contextFlags[options.context];
	patterns.push([
		/^(nuxt|nuxt3|nuxt-nightly)$/,
		`\`nuxt\` or \`nuxt-nightly\` cannot be imported directly in ${context}.`,
		options.context === "nuxt-app" ? ["Import runtime Nuxt composables from `#app` or `#imports` instead."] : ["Use `#app` or `#imports` for runtime composables in your Vue app code."]
	]);
	patterns.push([
		/^((~|~~|@|@@)?\/)?nuxt\.config(\.|$)/,
		"Importing directly from a `nuxt.config` file is not allowed.",
		[
			"Use `useRuntimeConfig()` to access runtime config in your app.",
			"Use `useAppConfig()` to access config that doesn't need to be changed at runtime.",
			"Use a Nuxt module to access build-time configuration."
		]
	]);
	patterns.push([/(^|node_modules\/)@vue\/composition-api/]);
	for (const mod of nuxt.options._installedModules) if (mod.entryPath) patterns.push([
		new RegExp(`^${escapeRE(mod.entryPath)}$`),
		"Importing directly from module entry-points is not allowed.",
		["Import from the module's runtime directory instead (e.g. `my-module/runtime/...`)."]
	]);
	for (const i of [
		/(^|node_modules\/)@nuxt\/(cli|kit|test-utils)/,
		/(^|node_modules\/)nuxi/,
		/(^|node_modules\/)nitropack(?:-nightly)?(?:$|\/)(?!(?:dist\/)?(?:node_modules|presets|runtime|types))/,
		/(^|node_modules\/)nitro(?:-nightly)?\/(builder|meta|vite|tsconfig)/,
		/(^|node_modules\/)nuxt\/(config|kit|schema)/
	]) patterns.push([
		i,
		`This module cannot be imported in ${context}.`,
		["These are build-time only packages and cannot be used at runtime."]
	]);
	if (options.context === "nitro-app" || options.context === "shared") for (const i of ["#app", /^#build(\/|$)/]) patterns.push([
		i,
		`Vue app aliases are not allowed in ${context}.`,
		["Move this code to your Vue app directory or use a shared utility."]
	]);
	if (options.context === "nuxt-app" || options.context === "shared") {
		const serverRelative = escapeRE(relative(nuxt.options.rootDir, resolve(nuxt.options.srcDir, nuxt.options.serverDir || "server")));
		patterns.push([
			new RegExp("^" + serverRelative + "\\/(api|routes|middleware|plugins)\\/"),
			`Importing from server is not allowed in ${context}.`,
			["Use `$fetch()` or `useFetch()` to fetch data from server routes.", "Move shared logic to the `shared/` directory."]
		]);
		patterns.push([
			/^#server(\/|$)/,
			`Server aliases are not allowed in ${context}.`,
			["Use `$fetch()` or `useFetch()` to call server endpoints.", "Move shared logic to the `shared/` directory."]
		]);
	}
	return patterns;
}
const contextFlags = {
	"nitro-app": "server runtime",
	"nuxt-app": "the Vue part of your app",
	"shared": "the #shared directory"
};
//#endregion
//#region ../nuxt/src/core/utils/index.ts
/**
* Decode a route path for route-rule matching, returning it unchanged if it is not
* percent-encoded or cannot be decoded. Reserved characters (`%2F`, `%3F`, …) are
* left encoded, so decoding cannot introduce additional path segments. Only the path
* portion is decoded; a query string, if present, is left untouched to avoid
* double-decoding it.
*/
function decodeRoutePath(path) {
	if (!path.includes("%")) return path;
	const queryIndex = path.indexOf("?");
	const pathname = queryIndex === -1 ? path : path.slice(0, queryIndex);
	try {
		return queryIndex === -1 ? decodeURI(pathname) : decodeURI(pathname) + path.slice(queryIndex);
	} catch {
		return path;
	}
}
//#endregion
//#region ../nuxt/src/core/utils/route-rules.ts
/**
* Normalise a route-rule key or lookup path: decode percent-encoding, then case-fold when
* `fold` is set. Keys are matched in decoded form so that a rule may be authored either
* decoded (`/测试`, the usual case) or encoded (`/%E6%B5%8B%E8%AF%95`, the form the page route
* and the request path take). Decoding must precede case folding, or a percent-encoded
* non-ASCII character would never fold.
*
* @internal
*/
function normalizeRouteRulePath(path, fold) {
	const decoded = decodeRoutePath(path);
	return fold ? decoded.toLowerCase() : decoded;
}
//#endregion
//#region src/templates.ts
const nitroSchemaTemplate = {
	filename: "types/nitro-nuxt.d.ts",
	async getContents({ nuxt }) {
		const references = [];
		const declarations = [];
		await nuxt.callHook("nitro:prepare:types", {
			references,
			declarations
		});
		const typesDir = join(nuxt.options.buildDir, "types");
		return `
${[...references.map((ref) => renderReference(ref, typesDir)), ...declarations].join("\n")}

import type { RuntimeConfig } from 'nuxt/schema'
import type { H3Event } from 'h3'
import type { LogObject } from 'consola'
import type { NuxtIslandContext, NuxtIslandResponse, NuxtRenderChunkContext, NuxtRenderCloseContext, NuxtRenderHTMLContext, NuxtRenderRouteContext } from '#app/types'

declare module 'nitropack' {
  interface NitroRuntimeConfigApp {
    buildAssetsDir: string
    cdnURL: string
  }
  interface NitroRuntimeConfig extends RuntimeConfig {}
  interface NitroRouteConfig {
    ssr?: boolean
    streaming?: boolean
    noScripts?: boolean
    /** @deprecated Use \`noScripts\` instead */
    experimentalNoScripts?: boolean
  }
  interface NitroRouteRules {
    ssr?: boolean
    streaming?: boolean
    noScripts?: boolean
    /** @deprecated Use \`noScripts\` instead */
    experimentalNoScripts?: boolean
    appMiddleware?: Record<string, boolean>
    appLayout?: string | false
  }
  interface NitroRuntimeHooks {
    'dev:ssr-logs': (ctx: { logs: LogObject[], path: string }) => void | Promise<void>
    'render:html': (htmlContext: NuxtRenderHTMLContext, context: { event: H3Event, streaming?: boolean }) => void | Promise<void>
    'render:html:chunk': (chunkContext: NuxtRenderChunkContext, context: { event: H3Event }) => void | Promise<void>
    'render:html:close': (closeContext: NuxtRenderCloseContext, context: { event: H3Event }) => void | Promise<void>
    'render:route': (renderRouteContext: NuxtRenderRouteContext, context: { event: H3Event }) => void | Promise<void>
    'render:island': (islandResponse: NuxtIslandResponse, context: { event: H3Event, islandContext: NuxtIslandContext }) => void | Promise<void>
  }
}
declare module 'nitropack/types' {
  interface NitroRuntimeConfigApp {
    buildAssetsDir: string
    cdnURL: string
  }
  interface NitroRuntimeConfig extends RuntimeConfig {}
  interface NitroRouteConfig {
    ssr?: boolean
    streaming?: boolean
    noScripts?: boolean
    /** @deprecated Use \`noScripts\` instead */
    experimentalNoScripts?: boolean
  }
  interface NitroRouteRules {
    ssr?: boolean
    streaming?: boolean
    noScripts?: boolean
    /** @deprecated Use \`noScripts\` instead */
    experimentalNoScripts?: boolean
    appMiddleware?: Record<string, boolean>
    appLayout?: string | false
  }
  interface NitroRuntimeHooks {
    'dev:ssr-logs': (ctx: { logs: LogObject[], path: string }) => void | Promise<void>
    'render:html': (htmlContext: NuxtRenderHTMLContext, context: { event: H3Event, streaming?: boolean }) => void | Promise<void>
    'render:html:chunk': (chunkContext: NuxtRenderChunkContext, context: { event: H3Event }) => void | Promise<void>
    'render:html:close': (closeContext: NuxtRenderCloseContext, context: { event: H3Event }) => void | Promise<void>
    'render:route': (renderRouteContext: NuxtRenderRouteContext, context: { event: H3Event }) => void | Promise<void>
    'render:island': (islandResponse: NuxtIslandResponse, context: { event: H3Event, islandContext: NuxtIslandContext }) => void | Promise<void>
  }
}
`;
	}
};
function renderReference(ref, baseDir) {
	return `/// <reference ${"path" in ref ? `path="${isAbsolute(ref.path) ? relative(baseDir, ref.path) : ref.path}"` : `types="${ref.types}"`} />`;
}
//#endregion
//#region src/index.ts
const logLevelMapReverse = {
	silent: 0,
	info: 3,
	verbose: 3
};
const NUXT_BUILD_OUTPUT_MAP = {
	"nuxt/entry": "serverEntry",
	"nuxt/manifest": "clientManifest",
	"nuxt/precomputed": "clientPrecomputed",
	"nuxt/styles": "ssrStyles",
	"nuxt/entry-chunk": "entryChunkName",
	"nuxt/entry-ids": "entryIds"
};
async function bundle(nuxt) {
	const layerDirs = getLayerDirectories(nuxt);
	const excludePattern = [getLayerNodeModulesExcludePattern(layerDirs.map((dirs) => dirs.root))];
	const layerPublicAssetsDirs = [];
	for (const dirs of layerDirs) if (existsSync(dirs.public)) layerPublicAssetsDirs.push({ dir: dirs.public });
	const rootDirWithSlash = withTrailingSlash(nuxt.options.rootDir);
	const moduleEntryPaths = [];
	for (const m of nuxt.options._installedModules) {
		const path = m.meta?.rawPath || m.entryPath;
		if (path) moduleEntryPaths.push(getDirectory(path));
	}
	const modules = await resolveNuxtModule(rootDirWithSlash, moduleEntryPaths);
	addTemplate(nitroSchemaTemplate);
	const sharedDirs = /* @__PURE__ */ new Set();
	if (nuxt.options.nitro.imports !== false && nuxt.options.imports.scan !== false) for (const layer of nuxt.options._layers) {
		if (layer.config?.imports?.scan === false) continue;
		sharedDirs.add(resolve(layer.config.rootDir, layer.config.dir?.shared ?? "shared", "utils"));
		sharedDirs.add(resolve(layer.config.rootDir, layer.config.dir?.shared ?? "shared", "types"));
	}
	nuxt.options.nitro.plugins ||= [];
	nuxt.options.nitro.plugins = nuxt.options.nitro.plugins.map((plugin) => plugin ? resolveAlias(plugin, nuxt.options.alias) : plugin);
	if (nuxt.options.dev && nuxt.options.features.devLogs) {
		addPlugin(resolve(nuxt.options.appDir, "plugins/dev-server-logs"));
		nuxt.options.nitro.plugins.push(resolve(distDir, "runtime/plugins/dev-server-logs"));
		nuxt.options.nitro.externals = defu(nuxt.options.nitro.externals, { inline: [/#internal\/dev-server-logs-options/] });
		nuxt.options.nitro.virtual = defu(nuxt.options.nitro.virtual, { "#internal/dev-server-logs-options": () => `export const rootDir = ${JSON.stringify(nuxt.options.rootDir)};` });
	}
	if (nuxt.options.experimental.componentIslands) {
		const islandHandlerPath = JSON.stringify(resolve(distDir, "runtime/handlers/island"));
		const h3Path = JSON.stringify(resolve(distDir, "h3"));
		const ISLAND_RENDERER_KEY = "#internal/nuxt/island-renderer.mjs";
		nuxt.options.nitro.virtual ||= {};
		nuxt.options.nitro.virtual[ISLAND_RENDERER_KEY] = () => {
			if (nuxt.options.dev || nuxt.options.experimental.componentIslands !== "auto" || nuxt.apps.default?.pages?.some((p) => p.mode === "server") || nuxt.apps.default?.components?.some((c) => c.mode === "server" && !nuxt.apps.default?.components.some((other) => other.pascalName === c.pascalName && other.mode === "client"))) return `export { default } from ${islandHandlerPath}`;
			return `import { defineEventHandler } from ${h3Path}; export default defineEventHandler(() => {});`;
		};
		nuxt.options.serverHandlers.push({
			route: "/__nuxt_island/**",
			handler: "#internal/nuxt/island-renderer.mjs"
		});
		if (!nuxt.options.ssr && nuxt.options.experimental.componentIslands !== "auto") {
			nuxt.options.ssr = true;
			nuxt.options.nitro.routeRules ||= {};
			nuxt.options.nitro.routeRules["/**"] = defu(nuxt.options.nitro.routeRules["/**"], { ssr: false });
		}
	}
	const mockProxy = resolveModulePath("mocked-exports/proxy", { from: import.meta.url });
	const h3Entry = resolveModulePath("h3", { from: import.meta.url });
	const h3PackageJson = resolveModulePath("h3/package.json", { from: import.meta.url });
	const nitroConfig = defu(nuxt.options.nitro, {
		debug: nuxt.options.debug ? nuxt.options.debug.nitro : false,
		rootDir: nuxt.options.rootDir,
		workspaceDir: nuxt.options.workspaceDir,
		srcDir: nuxt.options.serverDir,
		dev: nuxt.options.dev,
		buildDir: nuxt.options.buildDir,
		experimental: {
			asyncContext: nuxt.options.experimental.asyncContext,
			typescriptBundlerResolution: nuxt.options.future.typescriptBundlerResolution || nuxt.options.typescript?.tsConfig?.compilerOptions?.moduleResolution?.toLowerCase() === "bundler" || nuxt.options.nitro.typescript?.tsConfig?.compilerOptions?.moduleResolution?.toLowerCase() === "bundler"
		},
		framework: {
			name: "nuxt",
			version: nuxtPkg.version || version
		},
		imports: nuxt.options.experimental.nitroAutoImports === false ? false : {
			autoImport: nuxt.options.imports.autoImport,
			dirs: [...sharedDirs],
			imports: [
				{
					as: "__buildAssetsURL",
					name: "buildAssetsURL",
					from: resolve(distDir, "runtime/utils/paths")
				},
				{
					as: "__publicAssetsURL",
					name: "publicAssetsURL",
					from: resolve(distDir, "runtime/utils/paths")
				},
				{
					as: "defineAppConfig",
					name: "defineAppConfig",
					from: resolve(distDir, "runtime/utils/config"),
					priority: -1
				}
			],
			presets: [{
				from: "h3",
				imports: ["H3Event", "H3Error"]
			}, {
				from: "h3",
				type: true,
				imports: [
					"EventHandler",
					"EventHandlerRequest",
					"EventHandlerResponse",
					"EventHandlerObject",
					"H3EventContext"
				]
			}],
			exclude: [...excludePattern, /[\\/]\.git[\\/]/]
		},
		esbuild: { options: { exclude: excludePattern } },
		analyze: !nuxt.options.test && nuxt.options.build.analyze && (nuxt.options.build.analyze === true || nuxt.options.build.analyze.enabled) ? {
			template: "treemap",
			projectRoot: nuxt.options.rootDir,
			filename: join(nuxt.options.analyzeDir, "{name}.html")
		} : false,
		scanDirs: layerDirs.map((dirs) => dirs.server),
		renderer: resolve(distDir, "runtime/handlers/renderer"),
		nodeModulesDirs: nuxt.options.modulesDir,
		baseURL: nuxt.options.app.baseURL,
		virtual: {
			"#internal/nuxt.config.mjs": () => nuxt.vfs["#build/nuxt.config.mjs"] || "",
			"#internal/nuxt/app-config": () => nuxt.vfs["#build/app.config.mjs"]?.replace(/\/\*\* client \*\*\/[\s\S]*\/\*\* client-end \*\*\//, "") || "",
			"#spa-template": async () => `export const template = ${JSON.stringify(await spaLoadingTemplate(nuxt))}`,
			"nuxt/entry-chunk": () => nuxt.buildOutputs.entryChunkName(),
			"nuxt/entry-ids": () => nuxt.buildOutputs.entryIds(),
			"#internal/streaming-iife-chunk.mjs": () => `export const iifeChunkFileName = undefined`,
			"#internal/nuxt/nitro-config.mjs": () => {
				const hasCachedRoutes = Object.values(nitro.options.routeRules).some((r) => r.isr || r.cache);
				return [
					`export const NUXT_NO_SSR = ${nuxt.options.ssr === false}`,
					`export const NUXT_EARLY_HINTS = ${nuxt.options.experimental.writeEarlyHints !== false}`,
					`export const NUXT_NO_SCRIPTS = ${nuxt.options.features.noScripts === "all" || !!nuxt.options.features.noScripts && !nuxt.options.dev}`,
					`export const NUXT_INLINE_STYLES = ${!!nuxt.options.features.inlineStyles}`,
					`export const PARSE_ERROR_DATA = ${!!nuxt.options.experimental.parseErrorData}`,
					`export const NUXT_JSON_PAYLOADS = ${!!nuxt.options.experimental.renderJsonPayloads}`,
					`export const NUXT_ASYNC_CONTEXT = ${!!nuxt.options.experimental.asyncContext}`,
					`export const NUXT_SHARED_DATA = ${!!nuxt.options.experimental.sharedPrerenderData}`,
					`export const NUXT_PAYLOAD_EXTRACTION = ${nuxt.options.experimental.payloadExtraction !== false}`,
					`export const NUXT_PAYLOAD_INLINE = ${nuxt.options.experimental.payloadExtraction !== true}`,
					`export const NUXT_RUNTIME_PAYLOAD_EXTRACTION = ${hasCachedRoutes}`,
					`export const NUXT_SSR_STREAMING = ${!!(typeof nuxt.options.experimental.ssrStreaming === "object" && nuxt.options.experimental.ssrStreaming.enabled)}`,
					`export const NUXT_SSR_STREAMING_BOT_RE = ${typeof nuxt.options.experimental.ssrStreaming === "object" && nuxt.options.experimental.ssrStreaming.botRegex instanceof RegExp ? String(nuxt.options.experimental.ssrStreaming.botRegex) : "/^$/"}`
				].join("\n");
			}
		},
		routeRules: {
			...typeof nuxt.options.experimental.ssrStreaming === "object" && nuxt.options.experimental.ssrStreaming.enabled ? { "/**": { streaming: true } } : {},
			"/__nuxt_error": { cache: false }
		},
		typescript: {
			strict: true,
			generateTsConfig: true,
			tsconfigPath: "tsconfig.server.json",
			tsConfig: {
				compilerOptions: {
					lib: [
						"esnext",
						"webworker",
						"dom.iterable"
					],
					skipLibCheck: true,
					noUncheckedIndexedAccess: true,
					allowArbitraryExtensions: true,
					allowImportingTsExtensions: true
				},
				include: [
					join(nuxt.options.buildDir, "types/nitro-nuxt.d.ts"),
					...modules.flatMap((m) => {
						const moduleDir = relativeWithDot(nuxt.options.buildDir, m);
						return [join(moduleDir, "runtime/server"), join(moduleDir, "dist/runtime/server")];
					}),
					...layerDirs.map((dirs) => relativeWithDot(nuxt.options.buildDir, join(dirs.server, "**/*"))),
					...layerDirs.map((dirs) => relativeWithDot(nuxt.options.buildDir, join(dirs.shared, "**/*.d.ts")))
				],
				exclude: [...nuxt.options.modulesDir.map((m) => relativeWithDot(nuxt.options.buildDir, m)), relativeWithDot(nuxt.options.buildDir, resolve(nuxt.options.rootDir, "dist"))]
			}
		},
		publicAssets: [nuxt.options.dev ? { dir: resolve(nuxt.options.buildDir, "dist/client") } : {
			dir: join(nuxt.options.buildDir, "dist/client", nuxt.options.app.buildAssetsDir),
			maxAge: 31536e3,
			baseURL: nuxt.options.app.buildAssetsDir
		}, ...layerPublicAssetsDirs],
		prerender: {
			ignoreUnprefixedPublicAssets: true,
			failOnError: true,
			concurrency: cpus().length * 4 || 4,
			routes: [].concat(nuxt.options.generate.routes)
		},
		sourceMap: nuxt.options.sourcemap.server,
		externals: {
			inline: [
				...nuxt.options.dev ? [] : [
					...nuxt.options.experimental.externalVue ? [] : ["vue", "@vue/"],
					"@nuxt/",
					nuxt.options.buildDir
				],
				...nuxt.options.build.transpile.filter((i) => typeof i === "string"),
				"nuxt/dist",
				"nuxt3/dist",
				"nuxt-nightly/dist",
				distDir,
				...layerDirs.map((dirs) => join(dirs.app, "app.config"))
			],
			traceInclude: [...nuxt.options.vue.runtimeCompiler && !nuxt.options.experimental.externalVue ? [...nuxt.options.modulesDir.reduce((targets, path) => {
				const serverRendererPath = resolve(path, "vue/server-renderer/index.js");
				if (existsSync(serverRendererPath)) targets.push(serverRendererPath);
				return targets;
			}, [])] : []]
		},
		alias: {
			...nuxt.options.vue.runtimeCompiler || nuxt.options.experimental.externalVue ? {} : {
				"estree-walker": mockProxy,
				"@babel/parser": mockProxy,
				"@vue/compiler-core": mockProxy,
				"@vue/compiler-dom": mockProxy,
				"@vue/compiler-ssr": mockProxy
			},
			"@vue/devtools-api": "vue-devtools-stub",
			"h3": h3Entry,
			"h3/package.json": h3PackageJson,
			...nuxt.options.alias,
			"#internal/nuxt/paths": resolve(distDir, "runtime/utils/paths")
		},
		replace: {
			"__VUE_PROD_DEVTOOLS__": String(false),
			"import.meta.test": String(!!nuxt.options.test)
		},
		rollupConfig: {
			output: { generatedCode: { symbols: true } },
			plugins: []
		},
		logLevel: logLevelMapReverse[nuxt.options.logLevel]
	});
	if (nuxt.options.experimental.serverAppConfig === true && nitroConfig.imports) {
		nitroConfig.imports.imports ||= [];
		nitroConfig.imports.imports.push({
			name: "useAppConfig",
			from: resolve(distDir, "runtime/utils/app-config"),
			priority: 20
		});
	}
	if (!nitroConfig.errorHandler && (nuxt.options.dev || !nuxt.options.experimental.noVueServer)) nitroConfig.errorHandler = resolve(distDir, "runtime/handlers/error");
	nitroConfig.srcDir = resolve(nuxt.options.rootDir, nuxt.options.srcDir, nitroConfig.srcDir);
	nitroConfig.ignore ||= [];
	nitroConfig.ignore.push(...resolveIgnorePatterns(nitroConfig.srcDir), `!${join(nuxt.options.buildDir, "dist/client", nuxt.options.app.buildAssetsDir, "**/*")}`);
	const validManifestKeys = [
		"prerender",
		"redirect",
		"appMiddleware",
		"appLayout",
		"cache",
		"isr",
		"swr",
		"ssr"
	];
	const caseSensitiveRouteRules = !!nuxt.options.router.options.sensitive;
	const warnedKeyCollisions = /* @__PURE__ */ new Set();
	function getRouteRulesRouter(fold) {
		const routeRulesRouter = createRouter();
		if (nuxt._nitro) {
			const normalizedKeys = /* @__PURE__ */ new Map();
			for (const [route, rules] of Object.entries(nuxt._nitro.options.routeRules)) {
				if (route === "/__nuxt_error") continue;
				if (validManifestKeys.every((key) => !(key in rules))) continue;
				const key = normalizeRouteRulePath(route, fold);
				const existing = normalizedKeys.get(key);
				if (existing !== void 0 && existing !== route && fold !== caseSensitiveRouteRules && !warnedKeyCollisions.has(key)) {
					warnedKeyCollisions.add(key);
					logger.warn(`Route rules for \`${existing}\` and \`${route}\` resolve to the same path; \`${route}\` takes precedence. Disambiguate the keys${fold ? " or set `router.options.sensitive: true`" : ""}.`);
				}
				normalizedKeys.set(key, route);
				addRoute(routeRulesRouter, void 0, key, rules);
			}
		}
		return routeRulesRouter;
	}
	const cachedMatchers = {};
	addTemplate({
		filename: "route-rules.mjs",
		getContents() {
			const key = hash(nuxt._nitro?.options.routeRules || {});
			if (cachedMatchers[key]) return cachedMatchers[key];
			const compile = (fold) => compileRouterToString(getRouteRulesRouter(fold), "", {
				matchAll: true,
				serialize(routeRules) {
					return `{${Object.entries(routeRules).filter(([name, value]) => value !== void 0 && validManifestKeys.includes(name)).map(([name, value]) => {
						if (name === "redirect") {
							const redirectOptions = value;
							value = typeof redirectOptions === "string" ? redirectOptions : redirectOptions.to;
						}
						if (name === "appMiddleware") {
							const appMiddlewareOptions = value;
							if (typeof appMiddlewareOptions === "string") value = { [appMiddlewareOptions]: true };
							else if (Array.isArray(appMiddlewareOptions)) {
								const normalizedRules = {};
								for (const middleware of appMiddlewareOptions) normalizedRules[middleware] = true;
								value = normalizedRules;
							}
						}
						if (name === "cache" || name === "isr" || name === "swr") {
							name = "payload";
							value = Boolean(value);
						}
						return `${name}: ${JSON.stringify(value)}`;
					}).join(",")}}`;
				}
			});
			const sensitiveMatcher = compile(false);
			const foldedMatcher = compile(true);
			return cachedMatchers[key] = [
				`import { defu } from 'defu'`,
				`import routerOptions from '#build/router.options.mjs'`,
				`const sensitiveMatcher = ${sensitiveMatcher}`,
				foldedMatcher === sensitiveMatcher ? `const foldedMatcher = sensitiveMatcher` : `const foldedMatcher = ${foldedMatcher}`,
				`const decodeRoutePath = ${decodeRoutePath.toString()}`,
				`const normalizePath = (path, fold) => {`,
				`  if (typeof path !== 'string') { return path }`,
				`  const decoded = decodeRoutePath(path)`,
				`  return fold ? decoded.toLowerCase() : decoded`,
				`}`,
				`export default (path) => routerOptions.sensitive`,
				`  ? defu({}, ...sensitiveMatcher('', normalizePath(path, false)).map(r => r.data).reverse())`,
				`  : defu({}, ...foldedMatcher('', normalizePath(path, true)).map(r => r.data).reverse())`
			].join("\n");
		}
	});
	if (nuxt.options.experimental.payloadExtraction) {
		if (nuxt.options.dev) nuxt.hook("nitro:config", (nitroConfig) => {
			nitroConfig.prerender ||= {};
			nitroConfig.prerender.routes ||= [];
			nitroConfig.routeRules ||= {};
			for (const route of nitroConfig.prerender.routes) {
				if (!route) continue;
				nitroConfig.routeRules[route] = defu(nitroConfig.routeRules[route], { prerender: true });
			}
		});
		nuxt.hook("nitro:init", (nitro) => {
			nitro.hooks.hook("build:before", (nitro) => {
				for (const [route, value] of Object.entries(nitro.options.routeRules)) if (!route.endsWith("*") && !route.endsWith("/_payload.json")) {
					if (value.ssr === false) continue;
					if (value.isr || value.cache || value.prerender && nuxt.options.dev) {
						const payloadKey = (route === "/" ? "" : route) + "/_payload.json";
						const defaults = { ssr: true };
						for (const key of [
							"isr",
							"cache",
							...nuxt.options.dev ? ["prerender"] : []
						]) if (key in value) defaults[key] = value[key];
						nitro.options.routeRules[payloadKey] = defu(nitro.options.routeRules[payloadKey], defaults);
					}
				}
			});
		});
	}
	if (nuxt.options.experimental.appManifest) {
		const buildId = nuxt.options.runtimeConfig.app.buildId ||= nuxt.options.buildId;
		const buildTimestamp = Date.now();
		const manifestPrefix = joinURL(nuxt.options.app.buildAssetsDir, "builds");
		const tempDir = join(nuxt.options.buildDir, "manifest");
		nitroConfig.prerender ||= {};
		nitroConfig.prerender.ignore ||= [];
		nitroConfig.prerender.ignore.push(joinURL(nuxt.options.app.baseURL, manifestPrefix));
		nitroConfig.publicAssets.unshift({
			dir: join(tempDir, "meta"),
			maxAge: 31536e3,
			baseURL: joinURL(manifestPrefix, "meta")
		}, {
			dir: tempDir,
			maxAge: 1,
			baseURL: manifestPrefix
		});
		nuxt.options.alias["#app-manifest"] = join(tempDir, `meta/${buildId}.json`);
		if (!nuxt.options.dev) nuxt.hook("build:before", async () => {
			await promises.mkdir(join(tempDir, "meta"), { recursive: true });
			await promises.writeFile(join(tempDir, `meta/${buildId}.json`), JSON.stringify({}));
		});
		nuxt.hook("nitro:config", (config) => {
			config.alias ||= {};
			config.alias["#app-manifest"] = join(tempDir, `meta/${buildId}.json`);
		});
		nuxt.hook("nitro:init", (nitro) => {
			nitro.hooks.hook("rollup:before", async (nitro) => {
				const prerenderedRoutes = /* @__PURE__ */ new Set();
				const routeRulesMatcher = getRouteRulesRouter(!caseSensitiveRouteRules);
				if (nitro._prerenderedRoutes?.length) {
					const payloadSuffix = nuxt.options.experimental.renderJsonPayloads ? "/_payload.json" : "/_payload.js";
					for (const route of nitro._prerenderedRoutes) if (!route.error && route.route.endsWith(payloadSuffix)) {
						const url = route.route.slice(0, -payloadSuffix.length) || "/";
						if (!defu({}, ...findAllRoutes(routeRulesMatcher, void 0, normalizeRouteRulePath(url, !caseSensitiveRouteRules)).reverse()).prerender) prerenderedRoutes.add(url);
					}
				}
				const manifest = {
					id: buildId,
					timestamp: buildTimestamp,
					prerendered: nuxt.options.dev ? [] : [...prerenderedRoutes]
				};
				await promises.mkdir(join(tempDir, "meta"), { recursive: true });
				await promises.writeFile(join(tempDir, "latest.json"), JSON.stringify({
					id: buildId,
					timestamp: buildTimestamp
				}));
				await promises.writeFile(join(tempDir, `meta/${buildId}.json`), JSON.stringify(manifest));
			});
		});
	}
	if (!nuxt.options.experimental.appManifest) nuxt.options.alias["#app-manifest"] = mockProxy;
	for (const [specifier, key] of Object.entries(NUXT_BUILD_OUTPUT_MAP)) {
		if (specifier === "nuxt/entry-chunk" || specifier === "nuxt/entry-ids") continue;
		nitroConfig.virtual[specifier] = () => nuxt.buildOutputs[key]();
	}
	const nitroDecoratorSetup = /* @__PURE__ */ new WeakMap();
	const setupNitroDecorators = (nitroConfig) => {
		const existingSetup = nitroDecoratorSetup.get(nitroConfig);
		if (existingSetup) return existingSetup;
		const setup = (async () => {
			const nitroDecoratorDeps = [
				"@rollup/plugin-babel",
				"@babel/plugin-proposal-decorators",
				"@babel/plugin-syntax-typescript"
			];
			let hasDeps = true;
			for (const pkg of nitroDecoratorDeps) try {
				await import(pkg);
			} catch (_err) {
				const err = _err;
				if (err.code !== "ERR_MODULE_NOT_FOUND" && err.code !== "MODULE_NOT_FOUND") throw err;
				if (!isCI && hasTTY) {
					logger.info("Decorator support requires additional dependencies.");
					if (await logger.prompt(`Install \`${nitroDecoratorDeps.join("` and `")}\`?`, {
						type: "confirm",
						initial: true
					})) {
						logger.start(`Installing ${nitroDecoratorDeps.map((d) => `\`${d}\``).join(" and ")}...`);
						await addDependency(nitroDecoratorDeps, {
							dev: true,
							cwd: nuxt.options.rootDir,
							silent: true
						});
						logger.info("Rerun Nuxt to enable decorator support.");
						process.exit(1);
					}
				}
				logger.warn(`Cannot find \`${pkg}\`. Install \`${nitroDecoratorDeps.join("` and `")}\` to enable decorator support.`);
				hasDeps = false;
				break;
			}
			if (hasDeps) {
				const { babel } = await import("@rollup/plugin-babel");
				nitroConfig.rollupConfig.plugins = toArray(await nitroConfig.rollupConfig.plugins || []);
				nitroConfig.rollupConfig.plugins.unshift(babel({
					babelHelpers: "bundled",
					configFile: false,
					extensions: [
						".ts",
						".js",
						".mjs",
						".mts"
					],
					plugins: [["@babel/plugin-syntax-typescript", { isTSX: false }], ["@babel/plugin-proposal-decorators", { version: "2023-11" }]]
				}), babel({
					babelHelpers: "bundled",
					configFile: false,
					extensions: [".tsx", ".jsx"],
					plugins: [["@babel/plugin-syntax-typescript", { isTSX: true }], ["@babel/plugin-proposal-decorators", { version: "2023-11" }]]
				}));
			}
		})();
		nitroDecoratorSetup.set(nitroConfig, setup);
		setup.catch(() => nitroDecoratorSetup.delete(nitroConfig));
		return setup;
	};
	if (nuxt.options.experimental.decorators) if (nuxt.options.dev) nuxt.hook("nitro:build:before", (nitro) => setupNitroDecorators(nitro.options));
	else await setupNitroDecorators(nitroConfig);
	nitroConfig.rollupConfig.plugins = await nitroConfig.rollupConfig.plugins || [];
	nitroConfig.rollupConfig.plugins = toArray(nitroConfig.rollupConfig.plugins);
	const sharedDir = withTrailingSlash(resolve(nuxt.options.rootDir, nuxt.options.dir.shared));
	const relativeSharedDir = withTrailingSlash(relative(nuxt.options.rootDir, resolve(nuxt.options.rootDir, nuxt.options.dir.shared)));
	const sharedPatterns = [
		/^#shared\//,
		new RegExp("^" + escapeRE(sharedDir)),
		new RegExp("^" + escapeRE(relativeSharedDir))
	];
	nitroConfig.rollupConfig.plugins.push(ImpoundPlugin.rollup({
		cwd: nuxt.options.rootDir,
		trace: true,
		include: sharedPatterns,
		patterns: createImportProtectionPatterns(nuxt, { context: "shared" })
	}), ImpoundPlugin.rollup({
		cwd: nuxt.options.rootDir,
		trace: true,
		patterns: createImportProtectionPatterns(nuxt, { context: "nitro-app" }),
		exclude: [/node_modules[\\/]nitro(?:pack)?(?:-nightly)?[\\/]|(packages|@nuxt)[\\/]nitro-server(?:-nightly)?[\\/](src|dist)[\\/]runtime[\\/]/, ...sharedPatterns]
	}));
	const isIgnored = createIsIgnored(nuxt);
	nitroConfig.devStorage ??= {};
	nitroConfig.devStorage.root ??= {
		driver: "fs",
		readOnly: true,
		base: nitroConfig.rootDir,
		watchOptions: { ignored: [isIgnored] }
	};
	nitroConfig.devStorage.src ??= {
		driver: "fs",
		readOnly: true,
		base: nitroConfig.srcDir,
		watchOptions: { ignored: [isIgnored] }
	};
	const cacheDriverPath = join(distDir, "runtime/utils/cache-driver.mjs");
	const cacheDriverOption = isWindows ? pathToFileURL(cacheDriverPath).href : cacheDriverPath;
	nuxt.options.typescript.hoist.push("nitro/types", "nitro/runtime", "nitropack/types", "nitropack/runtime", "nitropack", "defu", "h3", "consola", "ofetch", "crossws");
	await nuxt.callHook("nitro:config", nitroConfig);
	if (nitroConfig.static && nuxt.options.dev) {
		nitroConfig.routeRules ||= {};
		nitroConfig.routeRules["/**"] = defu(nitroConfig.routeRules["/**"], { prerender: true });
	}
	const excludedAlias = [
		/^@vue\/.*$/,
		"vue",
		/vue-router/,
		"vite/client",
		"#imports",
		"vue-demi",
		/^#app/,
		"~",
		"@",
		"~~",
		"@@",
		"h3",
		"h3/package.json"
	];
	const basePath = nitroConfig.typescript.tsConfig.compilerOptions?.baseUrl ? resolve(nuxt.options.buildDir, nitroConfig.typescript.tsConfig.compilerOptions?.baseUrl) : nuxt.options.buildDir;
	const aliases = nitroConfig.alias;
	const tsConfig = nitroConfig.typescript.tsConfig;
	tsConfig.compilerOptions ||= {};
	tsConfig.compilerOptions.paths ||= {};
	for (const _alias in aliases) {
		const alias = _alias;
		if (excludedAlias.some((pattern) => typeof pattern === "string" ? alias === pattern : pattern.test(alias))) continue;
		if (alias in tsConfig.compilerOptions.paths) continue;
		const absolutePath = resolve(basePath, aliases[alias]);
		const isDirectory = aliases[alias].endsWith("/") || await promises.stat(absolutePath).then((r) => r.isDirectory()).catch(() => null);
		tsConfig.compilerOptions.paths[alias] = [absolutePath];
		if (isDirectory) tsConfig.compilerOptions.paths[`${alias}/*`] = [`${absolutePath}/*`];
	}
	const appDir = nuxt.options.alias["#app"];
	if (appDir) {
		tsConfig.compilerOptions.paths["#app/island-hash"] ||= [resolve(appDir, "island-hash")];
		tsConfig.compilerOptions.paths["#app/island-props"] ||= [resolve(appDir, "island-props")];
		tsConfig.compilerOptions.paths["#app/internal/*"] ||= [resolve(appDir, "internal/*")];
		tsConfig.compilerOptions.paths["#app/types"] ||= [resolve(appDir, "types")];
	}
	nuxt._perf?.startPhase("nitro:createNitro");
	const nitro = await createNitro(nitroConfig, {
		compatibilityDate: nuxt.options.compatibilityDate,
		dotenv: nuxt.options._loadOptions?.dotenv
	});
	nuxt._perf?.endPhase("nitro:createNitro");
	if (nuxt.options.experimental.serverAppConfig === false && nitro.options.imports) {
		nitro.options.imports.presets ||= [];
		nitro.options.imports.presets = nitro.options.imports.presets.map((preset) => typeof preset === "string" || !("imports" in preset) ? preset : {
			...preset,
			imports: preset.imports.filter((i) => i !== "useAppConfig")
		});
	}
	if (nuxt.options.ssr && nitro.options.static && nuxt.options.experimental.payloadExtraction === false) bundlerDiagnostics.NUXT_B7015();
	const spaLoadingTemplateFilePath = await spaLoadingTemplatePath(nuxt);
	nuxt.hook("builder:watch", async (_event, relativePath) => {
		if (resolve(nuxt.options.srcDir, relativePath) === spaLoadingTemplateFilePath) await nitro.hooks.callHook("rollup:reload");
	});
	const cacheDir = resolve(nuxt.options.buildDir, "cache/nitro/prerender");
	await promises.rm(cacheDir, {
		recursive: true,
		force: true
	}).catch(() => {});
	nitro.options._config.storage = defu(nitro.options._config.storage, { "internal:nuxt:prerender": {
		driver: cacheDriverOption,
		base: cacheDir
	} });
	nuxt._nitro = nitro;
	await nuxt.callHook("nitro:init", nitro);
	if (nuxt._perf) nitro.hooks.hook("rollup:before", (_nitro, rollupConfig) => {
		const plugins = rollupConfig.plugins || [];
		for (const plugin of plugins) {
			if (!plugin || !plugin.name) continue;
			const pluginName = `nitro:${plugin.name}`;
			for (const hookName of [
				"transform",
				"resolveId",
				"load"
			]) {
				const original = plugin[hookName];
				if (typeof original !== "function") continue;
				plugin[hookName] = function(...args) {
					const start = performance.now();
					const record = () => nuxt._perf?.recordBundlerPluginHook(pluginName, hookName, performance.now() - start, start);
					try {
						const result = original.apply(this, args);
						if (result && typeof result === "object" && "then" in result) return result.finally(record);
						record();
						return result;
					} catch (err) {
						record();
						throw err;
					}
				};
			}
		}
	});
	nuxt["~runtimeDependencies"] ||= [];
	nuxt["~runtimeDependencies"].push(...runtimeDependencies, "unhead", "@unhead/vue", "@nuxt/devalue", "unstorage", ...nitro.options.inlineDynamicImports ? ["vue", "@vue/server-renderer"] : []);
	addVitePlugin({
		name: "nuxt:nitro:ssr-conditions",
		configEnvironment(name, config) {
			if (name === "ssr") {
				config.resolve ||= {};
				config.resolve.conditions = [...nitro.options.exportConditions || [], "import"];
			}
		}
	});
	addVitePlugin({
		name: "nuxt:nitro:vue-feature-flags",
		applyToEnvironment: (environment) => environment.name === "ssr" && environment.config.isProduction,
		configResolved(config) {
			for (const key in config.define) if (key.startsWith("__VUE")) nitro.options.replace[key] = config.define[key];
		}
	});
	nitro.vfs = nuxt.vfs = nitro.vfs || nuxt.vfs || {};
	nuxt.hook("close", () => nitro.hooks.callHook("close"));
	nitro.hooks.hook("prerender:routes", (routes) => {
		return nuxt.callHook("prerender:routes", { routes });
	});
	if (nuxt.options.vue.runtimeCompiler) {
		addVitePlugin({
			name: "nuxt:vue:runtime-compiler",
			applyToEnvironment: (environment) => environment.name === "client",
			enforce: "pre",
			resolveId(id, importer) {
				if (id === "vue") return this.resolve("vue/dist/vue.esm-bundler", importer, { skipSelf: true });
			}
		});
		for (const hook of ["webpack:config", "rspack:config"]) nuxt.hook(hook, (configuration) => {
			const clientConfig = configuration.find((config) => config.name === "client");
			if (!clientConfig.resolve) clientConfig.resolve.alias = {};
			if (Array.isArray(clientConfig.resolve.alias)) clientConfig.resolve.alias.push({
				name: "vue",
				alias: "vue/dist/vue.esm-bundler"
			});
			else clientConfig.resolve.alias.vue = "vue/dist/vue.esm-bundler";
		});
	}
	const devMiddlewareHandler = dynamicEventHandler();
	nitro.options.devHandlers.unshift({ handler: devMiddlewareHandler });
	nitro.options.devHandlers.push(...nuxt.options.devServerHandlers);
	nitro.options.handlers.unshift({
		route: "/__nuxt_error",
		lazy: true,
		handler: resolve(distDir, "runtime/handlers/renderer")
	});
	if (nuxt.options.experimental.chromeDevtoolsProjectSettings) {
		const cacheDir = resolve(nuxt.options.rootDir, "node_modules/.cache/nuxt");
		let projectConfiguration = await readFile(join(cacheDir, "chrome-workspace.json"), "utf-8").then((r) => JSON.parse(r)).catch(() => null);
		if (!projectConfiguration) {
			projectConfiguration = { uuid: randomUUID() };
			await mkdir(cacheDir, { recursive: true });
			await writeFile(join(cacheDir, "chrome-workspace.json"), JSON.stringify(projectConfiguration), "utf-8");
		}
		nitro.options.devHandlers.push({
			route: "/.well-known/appspecific/com.chrome.devtools.json",
			handler: defineEventHandler((event) => {
				if (!isLoopbackPeer(event) || !isLocalDevRequest(event, getDevHandlerAllowedHosts(nuxt))) {
					setResponseStatus(event, 403);
					return "Forbidden";
				}
				return { workspace: {
					...projectConfiguration,
					root: nuxt.options.rootDir
				} };
			})
		});
	}
	if (!nuxt.options.dev && nuxt.options.experimental.noVueServer) nitro.hooks.hook("rollup:before", (nitro) => {
		if (nitro.options.preset === "nitro-prerender") {
			nitro.options.errorHandler = resolve(distDir, "runtime/handlers/error");
			return;
		}
		const nuxtErrorHandler = nitro.options.handlers.findIndex((h) => h.route === "/__nuxt_error");
		if (nuxtErrorHandler >= 0) nitro.options.handlers.splice(nuxtErrorHandler, 1);
		nitro.options.renderer = void 0;
	});
	nitro.hooks.hook("types:extend", (types) => {
		types.tsConfig ||= {};
		const rootDirGlob = relativeWithDot(nuxt.options.buildDir, join(nuxt.options.rootDir, "**/*"));
		types.tsConfig.include = types.tsConfig.include?.filter((i) => i !== rootDirGlob);
	});
	nuxt.hook("prepare:types", async (opts) => {
		if (!nuxt.options.dev) {
			await scanHandlers(nitro);
			await writeTypes(nitro);
		}
		opts.tsConfig.exclude ||= [];
		opts.tsConfig.exclude.push(relative(nuxt.options.buildDir, resolve(nuxt.options.rootDir, nitro.options.output.dir)));
		opts.tsConfig.exclude.push(relative(nuxt.options.buildDir, resolve(nuxt.options.rootDir, nuxt.options.serverDir)));
		opts.references.push({ path: resolve(nuxt.options.buildDir, "types/nitro.d.ts") });
		opts.sharedTsConfig.compilerOptions ||= {};
		opts.sharedTsConfig.compilerOptions.paths ||= {};
		for (const key in nuxt.options.alias) if (nitro.options.alias[key] && nitro.options.alias[key] === nuxt.options.alias[key]) {
			const dirKey = join(key, "*");
			if (opts.tsConfig.compilerOptions?.paths[key]) opts.sharedTsConfig.compilerOptions.paths[key] = opts.tsConfig.compilerOptions.paths[key];
			if (opts.tsConfig.compilerOptions?.paths[dirKey]) opts.sharedTsConfig.compilerOptions.paths[dirKey] = opts.tsConfig.compilerOptions.paths[dirKey];
		}
	});
	if (nitro.options.static) nitro.hooks.hook("prerender:routes", (routes) => {
		for (const route of ["/200.html", "/404.html"]) routes.add(route);
		if (!nuxt.options.ssr) routes.add("/index.html");
	});
	if (!nuxt.options.dev) nitro.hooks.hook("rollup:before", async (nitro) => {
		await copyPublicAssets(nitro);
		await nuxt.callHook("nitro:build:public-assets", nitro);
	});
	async function symlinkDist() {
		if (nitro.options.static) {
			const distDir = resolve(nuxt.options.rootDir, "dist");
			if (!existsSync(distDir)) await promises.symlink(nitro.options.output.publicDir, distDir, "junction").catch(() => {});
		}
	}
	let waitUntilCompile;
	if (nuxt.options.dev) {
		let nitroBuilt = false;
		const diskServerEntry = join(nuxt.options.buildDir, "dist/server/server.dev.mjs");
		nitro.options.rollupConfig = defu(nitro.options.rollupConfig, { external: [/server\.dev\.mjs/] });
		for (const builder of ["webpack", "rspack"]) {
			nuxt.hook(`${builder}:compile`, ({ name, compiler }) => {
				if (name === "server") nitro.options.virtual["nuxt/entry"] = () => {
					const memfs = compiler.outputFileSystem;
					mkdirSync(join(nuxt.options.buildDir, "dist/server"), { recursive: true });
					writeFileSync(diskServerEntry, memfs.readFileSync(join(nuxt.options.buildDir, "dist/server/server.mjs"), "utf-8"));
					return `export { default } from ${JSON.stringify(pathToFileURL(diskServerEntry).href + "?v=" + Date.now())}`;
				};
			});
			nuxt.hook(`${builder}:compiled`, () => {
				if (nitroBuilt) nitro.hooks.callHook("rollup:reload");
			});
		}
		nuxt.hook("vite:compiled", () => {
			nuxt.server.reload();
		});
		nuxt.hook("server:devHandler", (h, options) => {
			devMiddlewareHandler.set(defineEventHandler((event) => {
				if (options.cors(event.path)) {
					if (handleCors(event, nuxt.options.devServer.cors)) return null;
					setHeader(event, "Vary", "Origin");
				}
				return h(event);
			}));
		});
		nuxt.server = createDevServer(nitro);
		waitUntilCompile = new Promise((resolve) => nitro.hooks.hook("compiled", () => {
			nitroBuilt = true;
			resolve();
		}));
	}
	nuxt.hook("build:done", async () => {
		nuxt._perf?.startPhase("nitro:build");
		try {
			await nuxt.callHook("nitro:build:before", nitro);
			await prepare(nitro);
			if (nuxt.options.dev) {
				await build(nitro);
				await waitUntilCompile;
				return;
			}
			await prerender(nitro);
			logger.restoreAll();
			await build(nitro);
			logger.wrapAll();
			await symlinkDist();
		} finally {
			nuxt._perf?.endPhase("nitro:build");
		}
	});
}
const RELATIVE_RE = /^([^.])/;
function relativeWithDot(from, to) {
	return relative(from, to).replace(RELATIVE_RE, "./$1") || ".";
}
async function spaLoadingTemplatePath(nuxt) {
	if (typeof nuxt.options.spaLoadingTemplate === "string") return resolve(nuxt.options.srcDir, nuxt.options.spaLoadingTemplate);
	const possiblePaths = nuxt.options._layers.map((layer) => resolve(layer.config.srcDir, layer.config.dir?.app || "app", "spa-loading-template.html"));
	return await findPath(possiblePaths) ?? resolve(nuxt.options.srcDir, nuxt.options.dir?.app || "app", "spa-loading-template.html");
}
function getDevHandlerAllowedHosts(nuxt) {
	const allowedHosts = nuxt.options.vite?.server?.allowedHosts;
	if (allowedHosts === true) return true;
	const hosts = new Set(LOOPBACK_HOSTS);
	if (Array.isArray(allowedHosts)) {
		for (const host of allowedHosts) if (typeof host === "string" && host) hosts.add(host);
	}
	return hosts;
}
async function spaLoadingTemplate(nuxt) {
	if (nuxt.options.spaLoadingTemplate === false) return "";
	const spaLoadingTemplate = await spaLoadingTemplatePath(nuxt);
	try {
		if (existsSync(spaLoadingTemplate)) return readFileSync(spaLoadingTemplate, "utf-8").trim();
	} catch {}
	if (nuxt.options.spaLoadingTemplate === true) return template();
	if (nuxt.options.spaLoadingTemplate) bundlerDiagnostics.NUXT_B7016({ path: nuxt.options.spaLoadingTemplate });
	return "";
}
//#endregion
export { bundle };
