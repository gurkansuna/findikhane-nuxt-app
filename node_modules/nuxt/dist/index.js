import process from "node:process";
import fs, { existsSync, mkdirSync, promises, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { mkdir, open, readFile, readdir, rm, stat, unlink, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import { basename, dirname, extname, isAbsolute, join, normalize, parse, relative, resolve } from "pathe";
import { createDebugger, createHooks } from "hookable";
import ignore from "ignore";
import { addBuildPlugin, addComponent, addImportsSources, addPlugin, addPluginTemplate, addRouteMiddleware, addTemplate, addTypeTemplate, addVitePlugin, buildDiagnostics, componentDiagnostics, configDiagnostics, createIsIgnored, createResolver, defineNuxtModule, directoryToURL, findPath, getLayerDirectories, headDiagnostics, importModule, installModules, isIgnored, loadNuxtConfig, normalizeModuleTranspilePath, normalizePlugin, normalizeTemplate, nuxtCtx, packageName, pageDiagnostics, pluginDiagnostics, recoverThrottledChanges, resolveAlias, resolveDeclarationPath, resolveFiles, resolveIgnorePatterns, resolveModuleWithOptions, resolvePath, resolveTypePaths, runWithNuxtContext, setBuildOutput, tryUseNuxt, updateTemplates, useLogger, useNitro, useNuxt } from "@nuxt/kit";
import { readPackage, readPackageJSON, resolvePackageJSON } from "pkg-types";
import { hash, isEqual, serialize } from "ohash";
import onChange from "on-change";
import { formatDate, resolveCompatibilityDatesFromEnv } from "compatx";
import escapeStringRegexp from "escape-string-regexp";
import { joinURL, withTrailingSlash, withoutLeadingSlash } from "ufo";
import { ImpoundPlugin } from "impound";
import { defu } from "defu";
import { coerce, satisfies } from "verkit";
import { hasTTY, isCI, provider } from "std-env";
import { genArrayFromRaw, genDynamicImport, genDynamicTypeImport, genExport, genImport, genInlineTypeImport, genObjectFromRawEntries, genObjectKey, genSafeVariableName, genString, genTypeImport } from "knitwork";
import { resolveModulePath } from "exsolve";
import { addDependency } from "nypm";
import { filename, resolveAlias as resolveAlias$1, reverseResolveAlias } from "pathe/utils";
import { addRoute, createRouter, findAllRoutes } from "rou3";
import { fileURLToPath, pathToFileURL } from "node:url";
import picomatch from "picomatch";
import { klona } from "klona";
import { ScopeTracker, getUndeclaredIdentifiersInFunction, isReferenceIdentifier, parseAndWalk, walk } from "oxc-walker";
import { addFile, buildTree, compileParsePath, removeFile, toVueRouter4, vueRouterToRou3 } from "unrouting";
import { camelCase, kebabCase, pascalCase, splitByCase } from "scule";
import { createUnplugin } from "unplugin";
import { findExports, findStaticImports, parseStaticImport } from "mlly";
import MagicString from "magic-string";
import { generateTransform, rolldownString } from "rolldown-string";
import { streamingIifeCode } from "unhead/stream/iife";
import { unheadVueComposablesImports } from "@unhead/vue";
import { createUnimport, defineUnimportPreset, scanDirExports, toExports, toTypeDeclarationFile, toTypeReExports } from "unimport";
import { glob } from "tinyglobby";
import { performance } from "node:perf_hooks";
import { Diagnostic } from "nostics";
import { generateTypes, resolveSchema } from "untyped";
import { ELEMENT_NODE, parse as parse$1, walk as walk$1, walkSync } from "ultrahtml";
import { isObject } from "@vue/shared";
import { consola } from "consola";
import { createTar, parseTar } from "nanotar";
import { createTransformer, getTransformFilter } from "unctx/transform";
import { colors } from "consola/utils";
import { watch } from "chokidar";
import { debounce } from "perfect-debounce";
import { createJiti } from "jiti";
import { minifySync, transformSync } from "rolldown/utils";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region src/utils.ts
/** @since 3.9.0 */
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}
async function isDirectory(path) {
	try {
		return (await promises.lstat(path)).isDirectory();
	} catch (err) {
		const code = err.code;
		if (code === "ENOENT" || code === "ENOTDIR") return false;
		throw err;
	}
}
function isDirectorySync(path) {
	try {
		return statSync(path, { throwIfNoEntry: false })?.isDirectory() ?? false;
	} catch (err) {
		if (err.code === "ENOTDIR") return false;
		throw err;
	}
}
const LEADING_DOT_RE = /^\.+/g;
/**
* Normalizes a file extension from a string to just the extension part (without the dot).
* In case the string does not contain a dot, it returns the string as is.
*
* @example
* normalizeExtension('.ts') // 'ts'
* normalizeExtension('.d.ts') // 'd.ts'
* normalizeExtension('ts') // 'ts'
* normalizeExtension('d.ts') // 'ts'
*/
function normalizeExtension(input) {
	return input.replace(LEADING_DOT_RE, "");
}
function stripExtension(path) {
	return path.replace(/\.[^./\\]+$/, "");
}
function isWhitespace(char) {
	const c = typeof char === "string" ? char.charCodeAt(0) : char;
	return c === 32 || c === 9 || c === 10 || c === 13 || c === 12;
}
const JS_EXT_RE = /^[^?]*\.(?:[jt]sx?|[cm][jt]s)(?:$|\?)/;
const NUXT_LIB_RE = /^[^?]*node_modules\/(?:nuxt|nuxt3|nuxt-nightly|@nuxt)\//;
const STYLE_QUERY_RE$1 = /[?&]type=style/;
const MACRO_QUERY_RE$2 = /[?&]macro(?:=|&|$)/;
const DECLARATION_EXTENSIONS = [
	"d.ts",
	"d.mts",
	"d.cts",
	"d.vue.ts",
	"d.vue.mts",
	"d.vue.cts"
];
const logger = useLogger("nuxt");
function resolveToAlias(path, nuxt = tryUseNuxt()) {
	return reverseResolveAlias(path, {
		...nuxt?.options.alias || {},
		...strippedAtAliases$1
	}).pop() || path;
}
const strippedAtAliases$1 = {
	"@": "",
	"@@": ""
};
//#endregion
//#region src/core/features.ts
var features_exports = /* @__PURE__ */ __exportAll({
	ensurePackageInstalled: () => ensurePackageInstalled,
	installNuxtModule: () => installNuxtModule
});
const isStackblitz = provider === "stackblitz";
async function promptToInstall(name, installCommand, options) {
	for (const parent of options.searchPaths || []) if (await resolvePackageJSON(name, { parent }).catch(() => null)) return true;
	configDiagnostics.NUXT_B5011({ name });
	if (isCI) return false;
	if (options.prompt === true || options.prompt !== false && !isStackblitz) {
		if (await logger.prompt(`Do you want to install ${name} package?`, {
			type: "confirm",
			name: "confirm",
			initial: true
		}) !== true) return false;
	}
	logger.info(`Installing ${name}...`);
	try {
		await installCommand();
		logger.success(`Installed ${name}`);
		return true;
	} catch (err) {
		buildDiagnostics.NUXT_B1004({
			packages: name,
			cause: err
		});
		return false;
	}
}
const installPrompts = /* @__PURE__ */ new Set();
function installNuxtModule(name, options) {
	if (installPrompts.has(name)) return;
	installPrompts.add(name);
	const nuxt = useNuxt();
	return promptToInstall(name, async () => {
		const { runCommand } = await import("@nuxt/cli");
		await runCommand("module", [
			"add",
			name,
			"--cwd",
			nuxt.options.rootDir
		]);
	}, {
		rootDir: nuxt.options.rootDir,
		searchPaths: nuxt.options.modulesDir,
		...options
	});
}
function ensurePackageInstalled(name, options) {
	return promptToInstall(name, () => addDependency(name, {
		cwd: options.rootDir,
		dev: true
	}), options);
}
//#endregion
//#region src/dirs.ts
let _distDir = dirname(fileURLToPath(import.meta.url));
if (/(?:chunks|shared)$/.test(_distDir)) _distDir = dirname(_distDir);
const distDir = _distDir;
const pkgDir = resolve(distDir, "..");
//#endregion
//#region src/core/utils/names.ts
function getNameFromPath(path, relativeTo) {
	const relativePath = relativeTo ? normalize(path).replace(withTrailingSlash(normalize(relativeTo)), "") : basename(path);
	const prefixParts = splitByCase(dirname(relativePath));
	const fileName = basename(relativePath, extname(relativePath));
	const segments = resolveComponentNameSegments(fileName.toLowerCase() === "index" ? "" : fileName, prefixParts).filter(Boolean);
	return kebabCase(segments).replace(QUOTE_RE, "");
}
function hasSuffix(path, suffix) {
	return basename(path, extname(path)).endsWith(suffix);
}
function resolveComponentNameSegments(fileName, prefixParts) {
	/**
	* Array of fileName parts split by case, / or -
	* @example third-component -> ['third', 'component']
	* @example AwesomeComponent -> ['Awesome', 'Component']
	*/
	const fileNameParts = splitByCase(fileName);
	const fileNamePartsContent = fileNameParts.join("/").toLowerCase();
	const componentNameParts = prefixParts.flatMap((p) => splitByCase(p));
	let index = prefixParts.length - 1;
	const matchedSuffix = [];
	while (index >= 0) {
		const prefixPart = prefixParts[index];
		matchedSuffix.unshift(...splitByCase(prefixPart).map((p) => p.toLowerCase()));
		const matchedSuffixContent = matchedSuffix.join("/");
		if (fileNamePartsContent === matchedSuffixContent || fileNamePartsContent.startsWith(matchedSuffixContent + "/") || prefixPart.toLowerCase() === fileNamePartsContent && prefixParts[index + 1] && prefixParts[index] === prefixParts[index + 1]) componentNameParts.length = index;
		index--;
	}
	return [...componentNameParts, ...fileNameParts];
}
//#endregion
//#region src/core/utils/plugins.ts
/**
* Split a bundler module ID into its pathname and search (query) parts.
*
* Module IDs from Vite/webpack are already-normalized filesystem paths
* that may carry query strings (e.g. `?vue&type=style&lang=css`).
*/
function parseModuleId(id) {
	const qIndex = id.indexOf("?");
	if (qIndex === -1) return {
		pathname: id,
		search: ""
	};
	return {
		pathname: id.slice(0, qIndex),
		search: id.slice(qIndex)
	};
}
const NUXT_COMPONENT_RE = /[?&]nuxt_component=/;
const MACRO_RE$1 = /[?&]macro=/;
const VUE_QUERY_RE = /[?&]vue(?:&|$)/;
const SETUP_QUERY_RE = /[?&]setup(?:=|&|$)/;
const TYPE_QUERY_RE = /[?&]type=([^&]*)/;
function isVue(id, opts = {}) {
	const { search } = parseModuleId(id);
	if (id.endsWith(".vue") && !search) return true;
	if (!search) return false;
	if (NUXT_COMPONENT_RE.test(search)) return false;
	if (MACRO_RE$1.test(search) && (search === "?macro=true" || !opts.type || opts.type.includes("script"))) return true;
	if (!VUE_QUERY_RE.test(search)) return false;
	if (opts.type) {
		const type = SETUP_QUERY_RE.test(search) ? "script" : TYPE_QUERY_RE.exec(search)?.[1];
		if (!type || !opts.type.includes(type)) return false;
	}
	return true;
}
const JS_RE = /\.(?:[cm]?[jt]s|[jt]sx)$/;
/** Matches module IDs for Vue files (ignoring query strings). */
const VUE_ID_RE = /\.vue(?:\?|$)/;
function isJS(id) {
	const { pathname } = parseModuleId(id);
	return JS_RE.test(pathname);
}
function getLoader(id) {
	const { pathname } = parseModuleId(id);
	const ext = extname(pathname);
	if (ext === ".vue") return "vue";
	if (!JS_RE.test(ext)) return null;
	return ext.endsWith("x") ? "tsx" : "ts";
}
//#endregion
//#region src/core/utils/index.ts
function uniqueBy(arr, key) {
	if (arr.length < 2) return arr;
	const res = [];
	const seen = /* @__PURE__ */ new Set();
	for (const item of arr) {
		if (seen.has(item[key])) continue;
		seen.add(item[key]);
		res.push(item);
	}
	return res;
}
const QUOTE_RE = /["']/g;
const EXTENSION_RE = /\b\.\w+$/g;
const SX_RE = /\.[tj]sx$/;
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
//#region src/pages/utils.ts
function createPagesContext(options = {}) {
	const modes = options.shouldUseServerComponents ? ["server", "client"] : ["client"];
	const treeOptions = {
		roots: options.roots,
		modes,
		warn: (message) => pageDiagnostics.NUXT_B4011({ message })
	};
	const emitOptions = {
		onDuplicateRouteName: (_name, file, existingFile) => {
			pageDiagnostics.NUXT_B4004({
				file,
				existingFile
			});
		},
		attrs: { mode: modes }
	};
	const compiledParse = compileParsePath(treeOptions);
	let tree = buildTree([], treeOptions);
	const trackedFiles = /* @__PURE__ */ new Set();
	return {
		emit() {
			return toVueRouter4(tree, emitOptions);
		},
		addFile(filePath, priority = 0) {
			addFile(tree, {
				path: filePath,
				priority
			}, compiledParse);
			trackedFiles.add(filePath);
		},
		removeFile(filePath) {
			const removed = removeFile(tree, filePath);
			if (removed) trackedFiles.delete(filePath);
			return removed;
		},
		rebuild(files) {
			tree = buildTree(files, treeOptions);
			trackedFiles.clear();
			for (const f of files) trackedFiles.add(f.path);
		},
		trackedFiles
	};
}
async function resolvePagesRoutes(pattern, nuxt = useNuxt(), ctx, originalPagePaths) {
	const pagesDirs = getLayerDirectories(nuxt).map((d) => d.appPages);
	const inputFiles = [];
	for (let priority = 0; priority < pagesDirs.length; priority++) {
		const dir = pagesDirs[priority];
		const files = await resolveFiles(dir, pattern);
		for (const file of files) inputFiles.push({
			path: file,
			priority
		});
	}
	let pages;
	if (ctx) {
		ctx.rebuild(inputFiles);
		pages = ctx.emit();
	} else {
		const oneShot = createPagesContext({
			roots: pagesDirs,
			shouldUseServerComponents: !!nuxt.options.experimental.componentIslands
		});
		oneShot.rebuild(inputFiles);
		pages = oneShot.emit();
	}
	return augmentAndResolve(pages, ctx?.trackedFiles ?? new Set(inputFiles.map((f) => f.path)), nuxt, originalPagePaths);
}
async function augmentAndResolve(pages, trackedFiles, nuxt = useNuxt(), originalPagePaths) {
	const shouldAugment = nuxt.options.experimental.scanPageMeta || nuxt.options.experimental.typedPages;
	if (shouldAugment === false) {
		await nuxt.callHook("pages:extend", pages);
		return pages;
	}
	const extraPageMetaExtractionKeys = nuxt.options?.experimental?.extraPageMetaExtractionKeys || [];
	const augmentCtx = {
		extraExtractionKeys: /* @__PURE__ */ new Set(["middleware", ...extraPageMetaExtractionKeys]),
		fullyResolvedPaths: trackedFiles,
		originalPagePaths
	};
	if (shouldAugment === "after-resolve") {
		await nuxt.callHook("pages:extend", pages);
		await augmentPages(pages, nuxt.vfs, augmentCtx);
	} else {
		const augmentedPages = await augmentPages(pages, nuxt.vfs, augmentCtx);
		await nuxt.callHook("pages:extend", pages);
		await augmentPages(pages, nuxt.vfs, {
			pagesToSkip: augmentedPages,
			...augmentCtx
		});
		augmentedPages?.clear();
	}
	await nuxt.callHook("pages:resolved", pages);
	return pages;
}
async function augmentPages(routes, vfs, ctx = {}) {
	ctx.augmentedPages ??= /* @__PURE__ */ new Set();
	for (const route of routes) {
		if (route.file && !ctx.pagesToSkip?.has(route.file)) {
			const routeMeta = getRouteMeta(vfs[route.file] ?? fs.readFileSync(ctx.fullyResolvedPaths?.has(route.file) ? route.file : await resolvePath(route.file), "utf-8"), route.file, ctx.extraExtractionKeys);
			if (route.meta) routeMeta.meta = defu({}, routeMeta.meta, route.meta);
			if (route.rules) routeMeta.rules = defu({}, routeMeta.rules, route.rules);
			if (ctx.augmentedPages.has(route.file)) {
				delete routeMeta.name;
				delete routeMeta.path;
			}
			if (routeMeta.path !== void 0 && routeMeta.path !== route.path) ctx.originalPagePaths?.set(route, route.path);
			Object.assign(route, routeMeta);
			ctx.augmentedPages.add(route.file);
		}
		if (route.children && route.children.length > 0) await augmentPages(route.children, vfs, ctx);
	}
	return ctx.augmentedPages;
}
const SFC_SCRIPT_RE = /<script(?=\s|>)(?<attrs>[^>]*)>(?<content>[\s\S]*?)<\/script\s*>/gi;
function extractScriptContent(sfc) {
	const contents = [];
	for (const match of sfc.matchAll(SFC_SCRIPT_RE)) if (match?.groups?.content) contents.push({
		loader: match.groups.attrs && /[tj]sx/.test(match.groups.attrs) ? "tsx" : "ts",
		code: match.groups.content.trim()
	});
	return contents;
}
const PAGE_META_MACRO_NAMES = /* @__PURE__ */ new Set(["definePageMeta", "defineRouteRules"]);
const HAS_PAGE_MACRO_RE = new RegExp(`\\b(?:${[...PAGE_META_MACRO_NAMES].join("|")})\\b`);
const defaultExtractionKeys = [
	"name",
	"path",
	"props",
	"alias",
	"redirect",
	"middleware"
];
const DYNAMIC_META_KEY = "__nuxt_dynamic_meta_key";
const STATIC_EXPRESSION_WRAPPERS = /* @__PURE__ */ new Set([
	"ParenthesizedExpression",
	"TSAsExpression",
	"TSNonNullExpression",
	"TSSatisfiesExpression",
	"TSTypeAssertion"
]);
function unwrapStaticExpression(node) {
	let current = node;
	while (current && STATIC_EXPRESSION_WRAPPERS.has(current.type)) current = current.expression;
	return current;
}
/**
* The keys of `definePageMeta` whose values are read at build time, given the user's
* `experimental.extraPageMetaExtractionKeys`.
*
* Both halves of the macro pipeline have to agree on this set: `getRouteMeta` reads these keys
* into the route record, and `PageMetaPlugin` removes them from the macro module.
*/
function resolvePageMetaExtractionKeys(extraKeys = []) {
	return /* @__PURE__ */ new Set([...defaultExtractionKeys, ...extraKeys]);
}
/**
* Classify a property of a `definePageMeta` object literal.
*
* A property may only be removed from the macro module when it is also extracted into the route
* record, and vice versa, or its value is lost. Both sides call this so that the two cannot
* drift apart.
*/
function classifyPageMetaProperty(property, extractionKeys) {
	if (property.type !== "Property" || property.computed || property.kind !== "init" || property.method) return { kind: "runtime" };
	let key;
	if (property.key.type === "Identifier") key = property.key.name;
	else if (property.key.type === "Literal" && (typeof property.key.value === "string" || typeof property.key.value === "number")) key = String(property.key.value);
	else return { kind: "runtime" };
	const value = unwrapStaticExpression(property.value);
	if (key === "layout" && value?.type === "ObjectExpression") return value.properties.every((subProperty) => subProperty.type === "Property" && !subProperty.computed && subProperty.kind === "init" && !subProperty.method && subProperty.key.type === "Identifier" && (subProperty.key.name === "name" || subProperty.key.name === "props")) ? {
		kind: "reshape",
		key,
		node: value
	} : { kind: "runtime" };
	if (!extractionKeys.has(key)) return { kind: "runtime" };
	const serialized = isSerializable(property.value);
	return serialized.serializable ? {
		kind: "extract",
		key,
		value: serialized.value
	} : {
		kind: "dynamic",
		key
	};
}
const pageContentsCache = {};
const extractCache = {};
function getRouteMeta(contents, absolutePath, extraExtractionKeys = /* @__PURE__ */ new Set()) {
	if (!(absolutePath in pageContentsCache) || pageContentsCache[absolutePath] !== contents) {
		pageContentsCache[absolutePath] = contents;
		delete extractCache[absolutePath];
	}
	if (absolutePath in extractCache && extractCache[absolutePath]) return klona(extractCache[absolutePath]);
	const loader = getLoader(absolutePath);
	const scriptBlocks = !loader ? null : loader === "vue" ? extractScriptContent(contents) : [{
		code: contents,
		loader
	}];
	if (!scriptBlocks) {
		extractCache[absolutePath] = {};
		return {};
	}
	const extractedData = {};
	const extractionKeys = resolvePageMetaExtractionKeys(extraExtractionKeys);
	const dynamicProperties = /* @__PURE__ */ new Set();
	for (const script of scriptBlocks) {
		if (!HAS_PAGE_MACRO_RE.test(script.code)) continue;
		const macroCalls = [];
		const { program } = parseAndWalk(script.code, absolutePath.replace(/\.\w+$/, "." + script.loader), (node) => {
			if (node.type === "CallExpression" && node.callee.type === "Identifier" && PAGE_META_MACRO_NAMES.has(node.callee.name)) macroCalls.push({
				fnName: node.callee.name,
				node
			});
		});
		const topLevelCalls = /* @__PURE__ */ new Set();
		for (const statement of program.body) {
			if (statement.type !== "ExpressionStatement") continue;
			const expression = unwrapStaticExpression(statement.expression);
			if (expression?.type === "CallExpression") topLevelCalls.add(expression);
		}
		const extractedMacros = /* @__PURE__ */ new Set();
		for (const { fnName, node } of macroCalls) {
			if (!topLevelCalls.has(node)) pageDiagnostics.NUXT_B4007({
				fnName,
				file: absolutePath
			});
			if (extractedMacros.has(fnName)) continue;
			extractedMacros.add(fnName);
			const argument = unwrapStaticExpression(node.arguments[0]);
			if (argument?.type !== "ObjectExpression") {
				pageDiagnostics.NUXT_B4005({
					fnName,
					file: absolutePath,
					receivedType: String(argument?.type)
				});
				if (fnName === "definePageMeta") dynamicProperties.add("meta");
				continue;
			}
			if (fnName === "defineRouteRules") {
				const { value, serializable } = isSerializable(argument);
				if (!serializable) {
					pageDiagnostics.NUXT_B4006({
						fnName,
						file: absolutePath
					});
					continue;
				}
				extractedData.rules = value;
				continue;
			}
			const classified = /* @__PURE__ */ new Map();
			let hasRuntimeProperty = false;
			for (const property of argument.properties) {
				const classification = classifyPageMetaProperty(property, extractionKeys);
				if (classification.kind === "extract" || classification.kind === "dynamic") {
					classified.set(classification.key, classification);
					continue;
				}
				hasRuntimeProperty = true;
			}
			for (const key of extractionKeys) {
				const classification = classified.get(key);
				if (!classification) continue;
				if (classification.kind === "dynamic") {
					logger.debug(`Skipping extraction of \`${key}\` metadata as it is not JSON-serializable (reading \`${absolutePath}\`).`);
					dynamicProperties.add(extraExtractionKeys.has(key) ? "meta" : key);
					continue;
				}
				if (extraExtractionKeys.has(key)) {
					extractedData.meta ??= {};
					extractedData.meta[key] = classification.value;
				} else extractedData[key] = classification.value;
			}
			if (hasRuntimeProperty) dynamicProperties.add("meta");
		}
	}
	if (dynamicProperties.size) {
		extractedData.meta ??= {};
		extractedData.meta[DYNAMIC_META_KEY] = dynamicProperties;
	}
	extractCache[absolutePath] = extractedData;
	return klona(extractedData);
}
function serializeRouteValue(value, skipSerialisation = false) {
	if (skipSerialisation || value === void 0) return;
	return JSON.stringify(value);
}
function normalizeComponent(page, pageImport, routeName, islandKey) {
	if (page.mode === "server") return `() => createIslandPage(${routeName}, import.meta.server ? ${islandKey} : undefined)`;
	if (page.mode === "client") return `() => createClientPage(${pageImport})`;
	return pageImport;
}
function normalizeComponentWithName(page, isSyncImport, pageImportName, pageImport, routeName, metaRouteName, islandKey) {
	if (isSyncImport) return `Object.assign(${pageImportName}, { __name: ${metaRouteName} })`;
	if (page.mode === "server") return `() => createIslandPage(${routeName}, import.meta.server ? ${islandKey} : undefined)`;
	if (page.mode === "client") return `() => createClientPage(${pageImport}).then((c) => Object.assign(c, { __name: ${metaRouteName} }))`;
	return `${pageImport}.then((m) => Object.assign(m.default, { __name: ${metaRouteName} }))`;
}
function normalizeRoutes(routes, metaImports = /* @__PURE__ */ new Set(), options) {
	const nuxt = useNuxt();
	return {
		imports: metaImports,
		routes: genArrayFromRaw(routes.map((page) => {
			const markedDynamic = page.meta?.[DYNAMIC_META_KEY] ?? /* @__PURE__ */ new Set();
			const metaFiltered = {};
			let skipMeta = true;
			for (const key in page.meta || {}) if (key !== DYNAMIC_META_KEY && page.meta[key] !== void 0) {
				skipMeta = false;
				metaFiltered[key] = page.meta[key];
			}
			const skipAlias = toArray(page.alias).every((val) => !val);
			const route = {
				path: serializeRouteValue(page.path),
				props: serializeRouteValue(page.props),
				name: serializeRouteValue(page.name),
				meta: serializeRouteValue(metaFiltered, skipMeta),
				alias: serializeRouteValue(toArray(page.alias), skipAlias),
				redirect: serializeRouteValue(page.redirect)
			};
			for (const key of [...defaultExtractionKeys, "meta"]) if (route[key] === void 0) delete route[key];
			if (page.children?.length) route.children = normalizeRoutes(page.children, metaImports, options).routes;
			if (!page.file) return route;
			const file = normalize(page.file);
			const pageImportName = genSafeVariableName(filename(file) + hash(file).replace(/-/g, "_"));
			const metaImportName = pageImportName + "Meta";
			const metaImport = genImport(`${file}?macro=true`, [{
				name: "default",
				as: metaImportName
			}]);
			if (page._sync) metaImports.add(genImport(file, [{
				name: "default",
				as: pageImportName
			}]));
			const isSyncImport = page._sync && page.mode !== "client";
			const pageImport = isSyncImport ? pageImportName : genDynamicImport(file);
			const metaRouteName = options?.overrideMeta && !markedDynamic.has("name") ? route.name ?? `${metaImportName}?.name` : `${metaImportName}?.name ?? ${route.name}`;
			const islandKey = page.mode === "server" && page.file ? JSON.stringify(hash(relative(nuxt.options.rootDir, page.file))) : void 0;
			const component = nuxt.options.experimental.normalizePageNames ? normalizeComponentWithName(page, isSyncImport, pageImportName, pageImport, route.name, metaRouteName, islandKey) : normalizeComponent(page, pageImport, route.name, islandKey);
			let componentsObject;
			if (page.components) {
				const viewEntries = [];
				for (const viewName in page.components) {
					if (viewName === "default") continue;
					const viewFile = normalize(page.components[viewName]);
					viewEntries.push(`${JSON.stringify(viewName)}: ${genDynamicImport(viewFile)}`);
				}
				if (viewEntries.length > 0) componentsObject = `{ default: ${component}, ${viewEntries.join(", ")} }`;
			}
			const metaRoute = {
				name: metaRouteName,
				path: `${metaImportName}?.path ?? ${route.path}`,
				props: `${metaImportName}?.props ?? ${route.props ?? false}`,
				meta: `${metaImportName} || {}`,
				alias: `${metaImportName}?.alias || []`,
				redirect: `${metaImportName}?.redirect`,
				component
			};
			if (componentsObject) metaRoute.components = componentsObject;
			if (page.mode === "server") metaImports.add(`
let _createIslandPage
async function createIslandPage (name, islandKey) {
  _createIslandPage ||= await import(${JSON.stringify(options?.serverComponentRuntime)}).then(r => r.createIslandPage)
  return _createIslandPage(name, islandKey)
};`);
			else if (page.mode === "client") metaImports.add(`
let _createClientPage
async function createClientPage(loader) {
  _createClientPage ||= await import(${JSON.stringify(options?.clientComponentRuntime)}).then(r => r.createClientPage)
  return _createClientPage(loader);
}`);
			if (route.children) metaRoute.children = route.children;
			if (route.meta) metaRoute.meta = `{ ...(${metaImportName} || {}), ...${route.meta} }`;
			if (options?.overrideMeta) {
				for (const key of ["name", "path"]) {
					if (markedDynamic.has(key)) continue;
					metaRoute[key] = route[key] ?? `${metaImportName}?.${key}`;
				}
				for (const key of [
					"meta",
					"alias",
					"redirect",
					"props"
				]) {
					if (markedDynamic.has(key)) continue;
					if (route[key] == null) {
						delete metaRoute[key];
						continue;
					}
					metaRoute[key] = route[key];
				}
			} else {
				if (route.alias != null) metaRoute.alias = `${route.alias}.concat(${metaImportName}?.alias || [])`;
				if (route.redirect != null) metaRoute.redirect = route.redirect;
			}
			const { children, ...ownFields } = metaRoute;
			if (Object.values(ownFields).some((field) => field?.includes(metaImportName))) metaImports.add(metaImport);
			return metaRoute;
		}))
	};
}
function resolveRoutePaths(page, parent = "/") {
	return [joinURL(parent, page.path), ...page.children?.flatMap((child) => resolveRoutePaths(child, joinURL(parent, page.path))) || []];
}
const EMPTY_PARAM_REGEXP_RE = /:(\w+)\(\)([+*?]?)/g;
function canonicalizeParams(path) {
	return path.replace(EMPTY_PARAM_REGEXP_RE, ":$1$2");
}
/**
* Strip the leading segments an absolute child path shares with its parent's `fullPath`.
* Inserting only the remainder avoids re-declaring the parent's params on the child node.
* The remainder only determines the node's own params, as the absolute child path is
* re-applied as a path override afterwards and becomes the route's `fullPath`.
*
* Returns `undefined` when the child path does not extend the parent's full path, as there
* is then no remainder that declares the child's own params and nothing else.
*/
function relativizeToParent(parentFullPath, childPath) {
	if (!childPath.startsWith("/")) return childPath;
	const parentSegments = canonicalizeParams(parentFullPath).replace(/\/$/, "").split("/");
	const childSegments = childPath.split("/");
	for (let index = 0; index < parentSegments.length; index++) if (canonicalizeParams(childSegments[index] ?? "") !== parentSegments[index]) return;
	return childSegments.slice(parentSegments.length).join("/");
}
function isSerializable(node) {
	node = unwrapStaticExpression(node) || node;
	if (node.type === "Literal") {
		if (typeof node.value === "string" || typeof node.value === "number" || typeof node.value === "boolean" || node.value === null) return {
			value: node.value,
			serializable: true
		};
		return { serializable: false };
	}
	if (node.type === "UnaryExpression" && (node.operator === "-" || node.operator === "+")) {
		const arg = node.argument;
		if (arg.type === "Literal" && typeof arg.value === "number") return {
			value: node.operator === "-" ? -arg.value : arg.value,
			serializable: true
		};
		return { serializable: false };
	}
	if (node.type === "ArrayExpression") {
		const values = [];
		for (const element of node.elements) {
			if (!element || element.type === "SpreadElement") return { serializable: false };
			const { serializable, value } = isSerializable(element);
			if (!serializable) return { serializable: false };
			values.push(value);
		}
		return {
			value: values,
			serializable: true
		};
	}
	if (node.type === "ObjectExpression") {
		const value = {};
		for (const property of node.properties) {
			if (property.type !== "Property" || property.computed || property.kind !== "init" || property.method) return { serializable: false };
			let key;
			if (property.key.type === "Identifier") key = property.key.name;
			else if (property.key.type === "Literal" && (typeof property.key.value === "string" || typeof property.key.value === "number")) key = String(property.key.value);
			else return { serializable: false };
			const { serializable, value: propertyValue } = isSerializable(property.value);
			if (!serializable) return { serializable: false };
			value[key] = propertyValue;
		}
		return {
			value,
			serializable: true
		};
	}
	return { serializable: false };
}
function toRou3Patterns(pages, prefix = "/") {
	const routes = [];
	for (const page of pages) {
		const path = page.path.replace(/\([^)]*\)/g, "").replace(/:(\w+)\*.*/g, (_, name) => `**:${name}`).replace(/:([^/*]*)/g, (_, name) => `:${name.replace(/\W/g, (r) => r === "?" ? "" : "_")}`);
		routes.push(joinURL(prefix, path));
		if (page.children) routes.push(...toRou3Patterns(page.children, joinURL(prefix, path)));
	}
	return routes;
}
//#endregion
//#region src/pages/route-rules.ts
function globRouteRulesFromPages(pages) {
	return collectRouteRulesFromPages(pages, {}, "");
}
function collectRouteRulesFromPages(pages, paths, prefix) {
	for (const page of pages) {
		if (page.rules) {
			if (Object.keys(page.rules).length) {
				const path = prefix + page.path;
				const { patterns, issues } = vueRouterToRou3(path, { collapse: true });
				if (issues.length) for (const issue of issues) pageDiagnostics.NUXT_B4016({
					path,
					detail: issue.message
				});
				else for (const pattern of patterns) {
					if (pattern in paths && !isEqual(paths[pattern], page.rules)) pageDiagnostics.NUXT_B4017({
						path,
						pattern
					});
					paths[pattern] = page.rules;
				}
			}
			delete page.rules;
		}
		if (page.children?.length) collectRouteRulesFromPages(page.children, paths, prefix + page.path + "/");
	}
	return paths;
}
function removePagesRules(routes) {
	for (const route of routes) {
		delete route.rules;
		if (route.children?.length) removePagesRules(route.children);
	}
}
//#endregion
//#region src/pages/plugins/page-meta.ts
const HAS_MACRO_RE = /\bdefinePageMeta\s*\(\s*/;
const CODE_EMPTY = `
const __nuxt_page_meta = null
export default __nuxt_page_meta
`;
const CODE_DEV_EMPTY = `
const __nuxt_page_meta = {}
export default __nuxt_page_meta
`;
const CODE_HMR = `
// Vite
if (import.meta.hot) {
  import.meta.hot.accept(mod => {
    Object.assign(__nuxt_page_meta, mod)
  })
}
// webpack
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept((err) => {
    if (err) { window.location = window.location.href }
  })
}`;
const PageMetaPlugin = (options = {}) => createUnplugin(() => {
	const extractedKeys = new Set(options.extractedKeys);
	return {
		name: "nuxt:pages-macros-transform",
		enforce: "post",
		transform: {
			filter: {
				id: {
					include: /[?&]macro=true\b/,
					exclude: [/(?:\?|%3F).*type=(?:style|template)/]
				},
				code: { include: [
					HAS_MACRO_RE,
					/\bfrom\s+["'][^"'?]*\?[^"']*type=script[^"']*["']/,
					/export\s+\{\s*default\s*\}\s+from\s+["'][^"'?]*\?[^"']*type=script[^"']*["']/,
					/^(?!.*__nuxt_page_meta)(?!.*export\s+\{\s*default\s*\})(?!.*\bdefinePageMeta\s*\()[\s\S]*$/
				] }
			},
			handler(code, id, transformMeta) {
				const query = parseMacroQuery(id);
				if (query.type && query.type !== "script") return;
				const s = rolldownString(code, id, transformMeta);
				function result() {
					return generateTransform(s, id);
				}
				const hasMacro = HAS_MACRO_RE.test(code);
				const imports = findStaticImports(code);
				const scriptImport = imports.find((i) => parseMacroQuery(i.specifier).type === "script");
				if (scriptImport) {
					const reorderedQuery = rewriteQuery(scriptImport.specifier);
					const quotedSpecifier = getQuotedSpecifier(scriptImport.code)?.replace(scriptImport.specifier, reorderedQuery) ?? JSON.stringify(reorderedQuery);
					s.overwrite(0, code.length, `export { default } from ${quotedSpecifier}`);
					return result();
				}
				const currentExports = findExports(code);
				for (const match of currentExports) {
					if (match.type !== "default" || !match.specifier) continue;
					const reorderedQuery = rewriteQuery(match.specifier);
					const quotedSpecifier = getQuotedSpecifier(match.code)?.replace(match.specifier, reorderedQuery) ?? JSON.stringify(reorderedQuery);
					s.overwrite(0, code.length, `export { default } from ${quotedSpecifier}`);
					return result();
				}
				if (!hasMacro && !code.includes("export { default }") && !code.includes("__nuxt_page_meta")) {
					if (!code) {
						s.append(options.dev ? CODE_DEV_EMPTY + CODE_HMR : CODE_EMPTY);
						const { pathname } = parseModuleId(id);
						pageDiagnostics.NUXT_B4001({ pathname });
					} else s.overwrite(0, code.length, options.dev ? CODE_DEV_EMPTY + CODE_HMR : CODE_EMPTY);
					return result();
				}
				const importMap = /* @__PURE__ */ new Map();
				const addedImports = /* @__PURE__ */ new Set();
				for (const i of imports) {
					const parsed = parseStaticImport(i);
					for (const name of [
						parsed.defaultImport,
						...Object.values(parsed.namedImports || {}),
						parsed.namespacedImport
					].filter(Boolean)) importMap.set(name, i);
				}
				function isStaticIdentifier(name) {
					return !!(name && importMap.has(name));
				}
				function addImport(name) {
					if (!isStaticIdentifier(name)) return;
					const importValue = importMap.get(name).code.trim();
					if (!addedImports.has(importValue)) addedImports.add(importValue);
				}
				const declarationNodes = [];
				const addedDeclarations = /* @__PURE__ */ new Set();
				function addDeclaration(node) {
					const codeSectionKey = `${resolveStart(node)}-${resolveEnd(node)}`;
					if (addedDeclarations.has(codeSectionKey)) return;
					addedDeclarations.add(codeSectionKey);
					declarationNodes.push(node);
				}
				/**
				* Adds an import or a declaration to the extracted code.
				* @param name The name of the import or declaration to add.
				* @param node The node that is currently being processed. (To detect self-references)
				*/
				function addImportOrDeclaration(name, node) {
					if (isStaticIdentifier(name)) addImport(name);
					else {
						const declaration = scopeTracker.getDeclaration(name);
						if (declaration && declaration !== node) processDeclaration(declaration);
					}
				}
				const scopeTracker = new ScopeTracker({ preserveExitedScopes: true });
				function processDeclaration(scopeTrackerNode) {
					if (scopeTrackerNode?.type === "Variable") {
						addDeclaration(scopeTrackerNode);
						for (const decl of scopeTrackerNode.variableNode.declarations) {
							if (!decl.init) continue;
							const initScopeTracker = new ScopeTracker({ preserveExitedScopes: true });
							walk(decl.init, { scopeTracker: initScopeTracker });
							initScopeTracker.freeze();
							walk(decl.init, {
								scopeTracker: initScopeTracker,
								enter: (node, parent) => {
									if (node.type === "AwaitExpression") {
										const codeSnippet = code.slice(node.start, Math.min(node.end, node.start + 80));
										throw pageDiagnostics.NUXT_B4002({
											codeSnippet,
											offset: node.start
										});
									}
									if (!isReferenceIdentifier(node, parent) || node.type !== "Identifier" || initScopeTracker.isDeclared(node.name)) return;
									addImportOrDeclaration(node.name, scopeTrackerNode);
								}
							});
						}
					} else if (scopeTrackerNode?.type === "Function") {
						if (scopeTrackerNode.node.type === "ArrowFunctionExpression") return;
						if (!scopeTrackerNode.node.id?.name) return;
						addDeclaration(scopeTrackerNode);
						const undeclaredIdentifiers = getUndeclaredIdentifiersInFunction(scopeTrackerNode.node);
						for (const name of undeclaredIdentifiers) addImportOrDeclaration(name);
					}
				}
				const { program: ast } = parseAndWalk(code, id, {
					scopeTracker,
					parseOptions: { lang: query.lang ?? "ts" }
				});
				scopeTracker.freeze();
				let instances = 0;
				walk(ast, {
					scopeTracker,
					enter: (node) => {
						if (node.type !== "CallExpression" || node.callee.type !== "Identifier") return;
						if (!("name" in node.callee) || node.callee.name !== "definePageMeta") return;
						instances++;
						const meta = node.arguments[0];
						if (!meta) return;
						const metaCode = code.slice(meta.start, meta.end);
						const m = new MagicString(metaCode);
						if (meta.type === "ObjectExpression") {
							const omitProp = (prop, i) => {
								const nextProperty = meta.properties[i + 1];
								if (nextProperty) m.overwrite(prop.start - meta.start, nextProperty.start - meta.start, "");
								else if (code[prop.end] === ",") m.overwrite(prop.start - meta.start, prop.end - meta.start + 1, "");
								else m.overwrite(prop.start - meta.start, prop.end - meta.start, "");
							};
							for (let i = 0; i < meta.properties.length; i++) {
								const prop = meta.properties[i];
								const classification = classifyPageMetaProperty(prop, extractedKeys);
								if (classification.kind === "extract") {
									omitProp(prop, i);
									continue;
								}
								if (classification.kind !== "reshape") continue;
								for (const layoutProp of classification.node.properties) {
									if (layoutProp.type !== "Property" || layoutProp.key.type !== "Identifier") continue;
									if (layoutProp.key.name === "name") m.appendLeft(prop.start - meta.start, `layout: ${code.slice(layoutProp.value.start, layoutProp.value.end)},\n`);
									else if (layoutProp.key.name === "props") m.appendLeft(prop.start - meta.start, `layoutProps: ${code.slice(layoutProp.value.start, layoutProp.value.end)},\n`);
								}
								omitProp(prop, i);
							}
						}
						const definePageMetaScope = scopeTracker.getCurrentScope();
						walk(meta, {
							scopeTracker,
							enter(node, parent) {
								if (!isReferenceIdentifier(node, parent) || node.type !== "Identifier") return;
								const declaration = scopeTracker.getDeclaration(node.name);
								if (declaration) {
									if (declaration.isUnderScope(definePageMetaScope) && (scopeTracker.isCurrentScopeUnder(declaration.scope) || resolveStart(declaration) < node.start)) return;
								}
								if (isStaticIdentifier(node.name)) addImport(node.name);
								else if (declaration) processDeclaration(declaration);
							}
						});
						const extracted = [
							Array.from(addedImports).join("\n"),
							declarationNodes.sort((a, b) => resolveStart(a) - resolveStart(b)).map((node) => code.slice(resolveStart(node), resolveEnd(node))).join("\n"),
							`const __nuxt_page_meta = ${m.toString() || "null"}\nexport default __nuxt_page_meta` + (options.dev ? CODE_HMR : "")
						].join("\n");
						s.overwrite(0, code.length, extracted.trim());
					}
				});
				if (instances > 1) throw pageDiagnostics.NUXT_B4003({
					callCount: instances,
					file: id
				});
				if (!s.hasChanged() && !code.includes("__nuxt_page_meta")) s.overwrite(0, code.length, options.dev ? CODE_DEV_EMPTY + CODE_HMR : CODE_EMPTY);
				return result();
			}
		},
		vite: { handleHotUpdate: {
			order: "post",
			handler: ({ file, modules, server }) => {
				if (options.routesId && options.isPage?.(file)) {
					const macroModule = server.moduleGraph.getModuleById(file + "?macro=true");
					const routesModule = server.moduleGraph.getModuleById(options.routesId);
					const realModules = [];
					for (const mod of modules) if (mod.id && MACRO_STRIP_RE.test(mod.id)) {
						const realModule = server.moduleGraph.getModuleById(mod.id.replace(MACRO_STRIP_RE, (r) => r.endsWith("&") ? "?" : ""));
						if (realModule) realModules.push(realModule);
					}
					return [
						...modules,
						...realModules,
						...macroModule ? [macroModule] : [],
						...routesModule ? [routesModule] : []
					];
				}
			}
		} }
	};
});
const QUERY_START_RE = /^\?/;
const MACRO_RE = /&macro=true/;
function rewriteQuery(id) {
	return id.replace(/\?.+$/, (r) => "?macro=true&" + r.replace(QUERY_START_RE, "").replace(MACRO_RE, ""));
}
const MACRO_QUERY_RE$1 = /[?&]macro=true(?:&|$)/;
const MACRO_STRIP_RE = /\?macro=true&?/;
const TYPE_PARAM_RE = /[?&]type=([^?&]+)/;
const LANG_PARAM_RE = /[?&]lang=([^?&]+)/;
function parseMacroQuery(id) {
	const { search } = parseModuleId(id);
	const query = {
		type: TYPE_PARAM_RE.exec(search)?.[1],
		lang: LANG_PARAM_RE.exec(search)?.[1] ?? void 0
	};
	if (MACRO_QUERY_RE$1.test(search)) query.macro = "true";
	return query;
}
const QUOTED_SPECIFIER_RE = /(["']).*\1/;
function getQuotedSpecifier(id) {
	return id.match(QUOTED_SPECIFIER_RE)?.[0];
}
function resolveStart(node) {
	return "fnNode" in node ? node.fnNode.start : node.start;
}
function resolveEnd(node) {
	return "fnNode" in node ? node.fnNode.end : node.end;
}
//#endregion
//#region src/core/plugins/virtual.ts
const PREFIX = "virtual:nuxt:";
const PREFIX_RE = /^\/?virtual:nuxt:/;
function toVirtualId(absolutePath, nuxt) {
	return PREFIX + encodeURIComponent(relative(nuxt.options.rootDir, absolutePath));
}
function fromVirtualId(id, nuxt) {
	const search = id.match(QUERY_RE)?.[0] || "";
	const relativePart = withoutQuery(decodeURIComponent(withoutPrefix(id)));
	return resolve(nuxt.options.rootDir, relativePart) + search;
}
const RELATIVE_ID_RE = /^\.{1,2}[\\/]/;
const VirtualFSPlugin = (nuxt, options) => createUnplugin((_, meta) => {
	const extensions = ["", ...nuxt.options.extensions];
	const alias = {
		...nuxt.options.alias,
		...options.alias
	};
	const resolveWithExt = (id) => {
		for (const suffix of ["", "." + options.mode]) for (const ext of extensions) {
			const rId = id + suffix + ext;
			if (rId in nuxt.vfs) return rId;
		}
	};
	function resolveId(id, importer) {
		id = resolveAlias(id, alias);
		if (PREFIX_RE.test(id)) id = fromVirtualId(id, nuxt);
		const search = id.match(QUERY_RE)?.[0] || "";
		id = withoutQuery(id);
		if (process.platform === "win32" && isAbsolute(id)) id = resolve(id);
		const resolvedId = resolveWithExt(id);
		if (resolvedId) return toVirtualId(resolvedId, nuxt) + search;
		if (importer && RELATIVE_ID_RE.test(id)) {
			const path = resolve(dirname(withoutQuery(fromVirtualId(importer, nuxt))), id);
			const resolved = resolveWithExt(path);
			if (resolved) return toVirtualId(resolved, nuxt) + search;
		}
	}
	const relevantAliases = /* @__PURE__ */ new Set();
	for (const key in alias) {
		const value = alias[key];
		if (value && Object.keys(nuxt.vfs).some((vfsPath) => vfsPath.startsWith(value))) relevantAliases.add(escapeDirectory(key));
	}
	const vfsEntries = /* @__PURE__ */ new Set();
	for (const key in nuxt.vfs) if (!key.startsWith("#build/") && !key.startsWith(nuxt.options.buildDir)) vfsEntries.add(escapeDirectory(dirname(key)));
	const filter = { id: [
		PREFIX_RE,
		RELATIVE_ID_RE,
		/^#build\//,
		new RegExp("^(\\w:)?" + escapeDirectory(nuxt.options.buildDir)),
		...Array.from(vfsEntries).map((id) => new RegExp("^" + id)),
		...relevantAliases.size ? [new RegExp("^" + Array.from(relevantAliases).join("|") + "([\\\\/]|$)")] : []
	] };
	return {
		name: "nuxt:virtual",
		resolveId: meta.framework === "vite" ? void 0 : {
			order: "pre",
			filter,
			handler: resolveId
		},
		vite: { resolveId: {
			order: "pre",
			filter,
			handler(id, importer) {
				const res = resolveId(id, importer);
				if (res) return res;
				if (importer && PREFIX_RE.test(importer) && RELATIVE_ID_RE.test(id)) return this.resolve?.(id, withoutQuery(fromVirtualId(importer, nuxt)), { skipSelf: true });
			}
		} },
		load: {
			filter: { id: PREFIX_RE },
			handler(id) {
				const key = withoutQuery(fromVirtualId(id, nuxt));
				return {
					code: nuxt.vfs[key] || "",
					map: null
				};
			}
		}
	};
});
function withoutPrefix(id) {
	return id.replace(PREFIX_RE, "");
}
const QUERY_RE = /\?.*$/;
function withoutQuery(id) {
	return id.replace(QUERY_RE, "");
}
function escapeDirectory(path) {
	return escapeStringRegexp(path).replace(/\//g, "[\\\\/]");
}
//#endregion
//#region src/core/utils/route-rules.ts
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
//#region src/pages/plugins/route-injection.ts
const INJECTION_SINGLE_RE = /\bthis\.\$route\b|\b_ctx\.\$route\b/;
const RouteInjectionPlugin = (_nuxt) => createUnplugin(() => {
	return {
		name: "nuxt:route-injection-plugin",
		enforce: "post",
		transformInclude(id) {
			return isVue(id, { type: ["template", "script"] });
		},
		transform: {
			filter: { code: {
				include: INJECTION_SINGLE_RE,
				exclude: [`_ctx._.provides[__nuxt_route_symbol`, "this._.provides[__nuxt_route_symbol"]
			} },
			handler(code, id, meta) {
				const s = rolldownString(code, id, meta);
				parseAndWalk(code, id, (node) => {
					if (node.type !== "MemberExpression") return;
					if (node.object.type === "ThisExpression" && node.property.type === "Identifier" && node.property.name === "$route") {
						s.overwrite(node.start, node.end, "(this._.provides[__nuxt_route_symbol] || this.$route)");
						return;
					}
					if (node.object.type === "Identifier" && node.object.name === "_ctx" && node.property.type === "Identifier" && node.property.name === "$route") s.overwrite(node.start, node.end, "(_ctx._.provides[__nuxt_route_symbol] || _ctx.$route)");
				});
				if (s.hasChanged()) s.prepend("import { PageRouteSymbol as __nuxt_route_symbol } from '#app/components/injections';\n");
				return generateTransform(s, id);
			}
		}
	};
});
//#endregion
//#region src/pages/module.ts
const OPTIONAL_PARAM_RE = /^\/?:.*(?:\?|\(\.\*\)\*)$/;
const RELATIVE_WITH_DOT_RE = /^([^.])/;
function relativeWithDot(from, to) {
	return relative(from, to).replace(RELATIVE_WITH_DOT_RE, "./$1") || ".";
}
const pagesImportPresets = [
	{
		imports: ["definePageMeta"],
		from: "#app/composables/pages"
	},
	{
		imports: ["PageMeta"],
		from: "#app/composables/pages",
		type: true
	},
	{
		imports: ["useLink"],
		from: "vue-router"
	}
];
const routeRulesPresets = [{
	imports: ["defineRouteRules"],
	from: "#app/composables/pages"
}];
async function resolveRouterOptions(nuxt, builtInRouterOptions) {
	const context = { files: [] };
	for (const layer of nuxt.options._layers) {
		const path = await findPath(resolve(layer.config.srcDir, layer.config.dir?.app || "app", "router.options"));
		if (path) context.files.unshift({ path });
	}
	context.files.unshift({
		path: builtInRouterOptions,
		optional: true
	});
	await nuxt.callHook("pages:routerOptions", context);
	return context.files;
}
var module_default$4 = defineNuxtModule({
	meta: {
		name: "nuxt:pages",
		configKey: "pages"
	},
	defaults: (nuxt) => ({
		enabled: typeof nuxt.options.pages === "boolean" ? nuxt.options.pages : void 0,
		pattern: `**/*{${nuxt.options.extensions.join(",")}}`
	}),
	async setup(_options, nuxt) {
		const runtimeDir = resolve(distDir, "pages/runtime");
		const options = typeof _options === "boolean" ? {
			enabled: _options ?? nuxt.options.pages,
			pattern: `**/*{${nuxt.options.extensions.join(",")}}`
		} : { ..._options };
		options.pattern = Array.isArray(options.pattern) ? [...new Set(options.pattern)] : options.pattern;
		let inlineRulesCache = {};
		let updateRouteConfig;
		if (nuxt.options.experimental.inlineRouteRules) nuxt.hook("nitro:init", (nitro) => {
			updateRouteConfig = async (inlineRules) => {
				if (!isEqual(inlineRulesCache, inlineRules)) {
					await nitro.updateConfig({ routeRules: defu(inlineRules, nitro.options._config.routeRules) });
					inlineRulesCache = inlineRules;
				}
			};
		});
		const useExperimentalTypedPages = nuxt.options.experimental.typedPages;
		const builtInRouterOptions = await findPath(resolve(runtimeDir, "router.options")) || resolve(runtimeDir, "router.options");
		const pagesDirs = getLayerDirectories(nuxt).map((dirs) => dirs.appPages);
		const pagesCtx = nuxt.options.dev ? createPagesContext({
			roots: pagesDirs,
			shouldUseServerComponents: !!nuxt.options.experimental.componentIslands
		}) : void 0;
		const isPagePattern = picomatch(Array.isArray(options.pattern) ? options.pattern : [options.pattern]);
		const originalPagePaths = /* @__PURE__ */ new WeakMap();
		const handleRouteRules = async (pages) => {
			if (nuxt.options.experimental.inlineRouteRules) {
				const routeRules = globRouteRulesFromPages(pages);
				await updateRouteConfig?.(routeRules);
			} else removePagesRules(pages);
		};
		const resolvePagesRoutes$1 = async (pattern, nuxt) => {
			const pages = await resolvePagesRoutes(pattern, nuxt, pagesCtx, originalPagePaths);
			await handleRouteRules(pages);
			return pages;
		};
		/** Emit from existing tree + augment + hooks + route rules (used for incremental updates). */
		const augmentAndResolvePages = async (pages, trackedFiles, nuxt) => {
			const resolved = await augmentAndResolve(pages, trackedFiles, nuxt, originalPagePaths);
			await handleRouteRules(resolved);
			return resolved;
		};
		nuxt.options.alias["#vue-router"] = "vue-router";
		const routerPath = (await resolveTypePaths(["vue-router"], nuxt.options.modulesDir))[0]?.[1] || "vue-router";
		nuxt.hook("prepare:types", ({ tsConfig }) => {
			tsConfig.compilerOptions ||= {};
			tsConfig.compilerOptions.paths ||= {};
			tsConfig.compilerOptions.paths["#vue-router"] = [routerPath];
			delete tsConfig.compilerOptions.paths["#vue-router/*"];
		});
		const isNonEmptyDir = (dir) => existsSync(dir) && readdirSync(dir).length;
		const userPreference = options.enabled;
		const isPagesEnabled = async () => {
			if (typeof userPreference === "boolean") return userPreference;
			if ((await resolveRouterOptions(nuxt, builtInRouterOptions)).filter((p) => !p.optional).length > 0) return true;
			if (pagesDirs.some((dir) => isNonEmptyDir(dir))) return true;
			const pages = await resolvePagesRoutes$1(options.pattern, nuxt);
			if (pages.length) {
				if (nuxt.apps.default) nuxt.apps.default.pages = pages;
				return true;
			}
			return false;
		};
		options.enabled = await isPagesEnabled();
		nuxt.options.pages = options;
		Object.defineProperty(nuxt.options.pages, "toString", {
			enumerable: false,
			get: () => () => options.enabled
		});
		if (nuxt.options.dev && options.enabled) addPlugin(resolve(runtimeDir, "plugins/check-if-page-unused"));
		nuxt.hook("app:templates", (app) => {
			if (!nuxt.options.ssr && app.pages?.some((p) => p.mode === "server")) pageDiagnostics.NUXT_B4008();
		});
		const restartPaths = nuxt.options._layers.flatMap((layer) => {
			const pagesDir = (layer.config.rootDir === nuxt.options.rootDir ? nuxt.options.dir : layer.config.dir)?.pages || "pages";
			return [resolve(layer.config.srcDir || layer.cwd, layer.config.dir?.app || "app", "router.options.ts"), resolve(layer.config.srcDir || layer.cwd, pagesDir)];
		});
		nuxt.hooks.hook("builder:watch", async (event, relativePath) => {
			const path = resolve(nuxt.options.srcDir, relativePath);
			if (restartPaths.some((p) => p === path || path.startsWith(p + "/"))) {
				const newSetting = await isPagesEnabled();
				if (options.enabled !== newSetting) {
					logger.info("Pages", newSetting ? "enabled" : "disabled");
					return nuxt.callHook("restart");
				}
			}
		});
		const componentTypeHelpersPath = resolveModulePath("vue-component-type-helpers", {
			from: import.meta.url,
			try: true
		});
		addTypeTemplate({
			filename: "types/layouts.d.ts",
			getContents: ({ app, nuxt }) => {
				const componentTypeHelpers = componentTypeHelpersPath ? relativeWithDot(join(nuxt.options.buildDir, "types"), componentTypeHelpersPath) : "vue-component-type-helpers";
				return [
					genTypeImport("vue", ["ComputedRef", "MaybeRef"]),
					genTypeImport(componentTypeHelpers, ["ComponentProps"]),
					"",
					"declare module 'nuxt/app' {",
					"  interface NuxtLayouts {",
					...Object.values(app.layouts).map((layout) => `    ${genObjectKey(layout.name)}: ComponentProps<${genInlineTypeImport(layout.file)}>`),
					"  }",
					"  export type LayoutKey = keyof NuxtLayouts extends never ? string : keyof NuxtLayouts",
					"  interface PageMeta {",
					"    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false> | {",
					"      [K in LayoutKey]: {",
					"        name?: MaybeRef<K | false> | ComputedRef<K | false>",
					"        props?: NuxtLayouts[K]",
					"      }",
					"    }[LayoutKey]",
					"  }",
					"}"
				].join("\n");
			}
		});
		if (!options.enabled) {
			addPlugin(resolve(distDir, "app/plugins/router"));
			addTemplate({
				filename: "pages.mjs",
				getContents: () => ["export { useRoute } from '#app/composables/router'", "export const START_LOCATION = Symbol('router:start-location')"].join("\n")
			});
			addTemplate({
				filename: "router.options.mjs",
				getContents: () => {
					return ["export const hashMode = false", "export default {}"].join("\n");
				}
			});
			addTypeTemplate({
				filename: "types/middleware.d.ts",
				getContents: () => [
					"declare module 'nitropack/types' {",
					"  interface NitroRouteConfig {",
					"    appMiddleware?: string | string[] | Record<string, boolean>",
					"  }",
					"}",
					"declare module 'nitropack' {",
					"  interface NitroRouteConfig {",
					"    appMiddleware?: string | string[] | Record<string, boolean>",
					"  }",
					"}",
					"export {}"
				].join("\n")
			}, {
				nuxt: true,
				nitro: true,
				node: true
			});
			addComponent({
				name: "NuxtPage",
				priority: 10,
				filePath: resolve(distDir, "pages/runtime/page-placeholder")
			});
			nuxt.hook("nitro:init", (nitro) => {
				if (nuxt.options.dev || !nuxt.options.ssr || !nitro.options.static || !nitro.options.prerender.crawlLinks) return;
				nitro.options.prerender.routes.push("/");
			});
			return;
		}
		if (useExperimentalTypedPages) {
			const declarationFile = resolve(nuxt.options.buildDir, "types/typed-router.d.ts");
			const typedRouterOptions = {
				root: nuxt.options.rootDir,
				routesFolder: [],
				dts: declarationFile,
				logs: nuxt.options.debug && nuxt.options.debug.router,
				async beforeWriteFiles(rootPage) {
					for (const child of rootPage.children) child.delete();
					const pages = nuxt.apps.default?.pages || await resolvePagesRoutes$1(options.pattern, nuxt);
					if (nuxt.apps.default) nuxt.apps.default.pages = pages;
					function addPage(parent, page) {
						let route;
						if (page.path[0] === "/") {
							const insertedPath = relativizeToParent(parent.fullPath, page.path) ?? originalPagePaths.get(page) ?? page.path;
							route = parent.insert(insertedPath, page.file);
							if (route.path !== page.path) route.path = page.path;
						} else route = parent.insert(page.path, page.file);
						if (page.components) {
							for (const [viewName, file] of Object.entries(page.components)) if (viewName !== "default") route.components.set(viewName, file);
						}
						if (page.meta) route.addToMeta(page.meta);
						if (page.alias) route.addAlias(Array.isArray(page.alias) ? page.alias : [page.alias]);
						route.name = page.name || "";
						if (page.children) for (const child of page.children) addPage(route, child);
					}
					for (const page of pages) addPage(rootPage, page);
				}
			};
			nuxt.hook("prepare:types", ({ references }) => {
				references.push({ path: declarationFile });
			});
			const { createRoutesContext, resolveOptions } = await import("vue-router/unplugin");
			const context = createRoutesContext(resolveOptions(typedRouterOptions));
			await mkdir(dirname(declarationFile), { recursive: true });
			if (nuxt.options._prepare || !nuxt.options.dev) {
				await context.scanPages(false);
				const dts = await readFile(declarationFile, "utf-8");
				addTemplate({
					filename: "types/typed-router.d.ts",
					getContents: () => dts
				});
			}
			nuxt.hook("app:templatesGenerated", async (_app, _templates, options) => {
				if (!options?.filter || options.filter({ filename: "routes.mjs" })) await context.scanPages();
			});
		}
		nuxt.hook("prepare:types", ({ references, tsConfig }) => {
			references.push({ types: useExperimentalTypedPages ? "vue-router/auto-routes" : "vue-router" });
			tsConfig.vueCompilerOptions ||= {};
			tsConfig.vueCompilerOptions.plugins ||= [];
			tsConfig.vueCompilerOptions.plugins.push("vue-router/volar/sfc-route-blocks");
			if (useExperimentalTypedPages) tsConfig.vueCompilerOptions.plugins.push({
				name: "vue-router/volar/sfc-typed-router",
				options: { rootDir: nuxt.options.rootDir }
			});
		});
		nuxt.hook("imports:sources", (sources) => {
			const routerImports = sources.find((s) => typeof s === "object" && "from" in s && s.from === "#app/composables/router" && s.imports.includes("onBeforeRouteLeave"));
			if (routerImports) routerImports.from = "vue-router";
		});
		const updateTemplatePaths = getLayerDirectories(nuxt).flatMap((dirs) => [
			dirs.appPages,
			dirs.appLayouts,
			dirs.appMiddleware
		]);
		function isPage(file, pages = nuxt.apps.default?.pages) {
			if (!pages) return false;
			return pages.some((page) => page.file === file) || pages.some((page) => page.children && isPage(file, page.children));
		}
		nuxt.hooks.hookOnce("app:templates", async (app) => {
			app.pages ||= await resolvePagesRoutes$1(options.pattern, nuxt);
		});
		nuxt.hook("builder:watch", async (event, relativePath) => {
			const path = resolve(nuxt.options.srcDir, relativePath);
			const shouldAlwaysRegenerate = nuxt.options.experimental.scanPageMeta && isPage(path);
			if (event === "change" && !shouldAlwaysRegenerate) return;
			const layerIndex = pagesDirs.findIndex((dir) => path.startsWith(dir));
			if (pagesCtx && layerIndex !== -1 && !shouldAlwaysRegenerate) try {
				if (event === "add") {
					const relativeToDir = relative(pagesDirs[layerIndex], path);
					if (!isPagePattern(relativeToDir) || isIgnored(path)) return;
					pagesCtx.addFile(path, layerIndex);
				} else if (event === "unlink") {
					if (!pagesCtx.removeFile(path)) return;
				}
				const pages = pagesCtx.emit();
				nuxt.apps.default.pages = await augmentAndResolvePages(pages, pagesCtx.trackedFiles, nuxt);
			} catch (err) {
				pageDiagnostics.NUXT_B4012({
					event,
					path,
					cause: err
				});
				nuxt.apps.default.pages = await resolvePagesRoutes$1(options.pattern, nuxt);
			}
			else if (shouldAlwaysRegenerate || updateTemplatePaths.some((dir) => path.startsWith(dir))) nuxt.apps.default.pages = await resolvePagesRoutes$1(options.pattern, nuxt);
		});
		nuxt.hook("app:resolve", (app) => {
			if (app.mainComponent === resolve(nuxt.options.appDir, "components/welcome.vue")) app.mainComponent = resolve(runtimeDir, "app.vue");
			app.middleware.unshift({
				name: "validate",
				path: resolve(runtimeDir, "validate"),
				global: true
			});
		});
		nuxt.hook("app:resolve", (app) => {
			const nitro = useNitro();
			if (nitro.options.prerender.crawlLinks || Object.values(nitro.options.routeRules).some((rule) => rule.prerender)) app.plugins.push({
				src: resolve(runtimeDir, "plugins/prerender.server"),
				mode: "server"
			});
		});
		const prerenderRoutes = /* @__PURE__ */ new Set();
		function processPages(pages, currentPath = "/") {
			for (const page of pages) {
				if (page._sync) continue;
				if (OPTIONAL_PARAM_RE.test(page.path) && !page.children?.length) prerenderRoutes.add(currentPath);
				if (page.path.includes(":")) continue;
				const route = joinURL(currentPath, page.path);
				prerenderRoutes.add(route);
				if (page.children) processPages(page.children, route);
			}
		}
		nuxt.hook("pages:resolved", (pages) => {
			if (nuxt.options.dev) return;
			prerenderRoutes.clear();
			processPages(pages);
		});
		nuxt.hook("nitro:build:before", (nitro) => {
			if (nuxt.options.dev || nuxt.options.router.options.hashMode) return;
			nitro.options.ssrRoutes = [...nitro.options.ssrRoutes || [], ...toRou3Patterns(nuxt.apps.default?.pages || [])];
			if (!nitro.options.static) {
				const caseSensitiveRouteRules = !!nuxt.options.router.options.sensitive;
				const routeRulesRouter = createRouter();
				for (const [route, rules] of Object.entries(nitro.options.routeRules)) addRoute(routeRulesRouter, void 0, normalizeRouteRulePath(route, !caseSensitiveRouteRules), rules);
				for (const route of prerenderRoutes) if (defu({}, ...findAllRoutes(routeRulesRouter, void 0, normalizeRouteRulePath(route, !caseSensitiveRouteRules)).reverse()).prerender) nitro.options.prerender.routes.push(route);
			}
			if (!nitro.options.static || !nitro.options.prerender.crawlLinks) return;
			if (nuxt.options.ssr) {
				const [firstPage] = [...prerenderRoutes].sort();
				nitro.options.prerender.routes.push(firstPage || "/");
				return;
			}
			for (const route of nitro.options.prerender.routes || []) prerenderRoutes.add(route);
			nitro.options.prerender.routes = Array.from(prerenderRoutes);
		});
		nuxt.hook("imports:sources", (sources) => {
			sources.push(...pagesImportPresets);
			if (nuxt.options.experimental.inlineRouteRules) sources.push(...routeRulesPresets);
		});
		const componentStubPath = await resolvePath(resolve(runtimeDir, "component-stub"));
		if (nuxt.options.test && nuxt.options.dev) nuxt.hook("pages:extend", (routes) => {
			routes.push({
				_sync: true,
				path: "/__nuxt_component_test__/:pathMatch(.*)",
				file: componentStubPath
			});
		});
		nuxt.hook("pages:extend", (routes) => {
			const nitro = useNitro();
			let resolvedRoutes;
			for (const [path, rule] of Object.entries(nitro.options.routeRules)) {
				if (!rule.redirect) continue;
				resolvedRoutes ||= routes.flatMap((route) => resolveRoutePaths(route));
				if (resolvedRoutes.includes(path)) continue;
				routes.push({
					_sync: true,
					path: path.replace(/\/[^/]*\*\*/, "/:pathMatch(.*)"),
					file: componentStubPath
				});
			}
		});
		const extractedKeys = [...resolvePageMetaExtractionKeys(nuxt.options.experimental.extraPageMetaExtractionKeys)];
		nuxt.hook("modules:done", () => {
			addBuildPlugin(PageMetaPlugin({
				dev: nuxt.options.dev,
				isPage,
				routesId: toVirtualId(resolve(nuxt.options.buildDir, "routes.mjs"), nuxt),
				extractedKeys: nuxt.options.experimental.scanPageMeta ? extractedKeys : []
			}));
		});
		addPlugin(resolve(runtimeDir, "plugins/prefetch.client"));
		if (nuxt.options.experimental.templateRouteInjection) addBuildPlugin(RouteInjectionPlugin(nuxt), { server: false });
		addPlugin(resolve(runtimeDir, "plugins/router"));
		const getSources = (pages) => pages.filter((p) => Boolean(p.file)).flatMap((p) => [relative(nuxt.options.srcDir, p.file), ...p.children?.length ? getSources(p.children) : []]);
		nuxt.hook("build:manifest", (manifest) => {
			if (nuxt.options.dev) return;
			const sourceFiles = nuxt.apps.default?.pages?.length ? getSources(nuxt.apps.default.pages) : [];
			for (const [key, chunk] of Object.entries(manifest)) {
				if (chunk.src && Object.values(nuxt.apps).some((app) => app.pages?.some((page) => page.mode === "server" && page.file === join(nuxt.options.srcDir, chunk.src)))) {
					delete manifest[key];
					continue;
				}
				if (chunk.isEntry) chunk.dynamicImports = chunk.dynamicImports?.filter((i) => !sourceFiles.includes(i));
			}
		});
		const serverComponentRuntime = await findPath(join(distDir, "components/runtime/server-component")) ?? join(distDir, "components/runtime/server-component");
		const clientComponentRuntime = await findPath(join(distDir, "components/runtime/client-component")) ?? join(distDir, "components/runtime/client-component");
		addTemplate({
			filename: "routes.mjs",
			getContents({ app }) {
				if (!app.pages) return ROUTES_HMR_CODE + "export default []";
				const { routes, imports } = normalizeRoutes(app.pages, /* @__PURE__ */ new Set(), {
					serverComponentRuntime,
					clientComponentRuntime,
					overrideMeta: !!nuxt.options.experimental.scanPageMeta
				});
				return ROUTES_HMR_CODE + [...imports, `export default ${routes}`].join("\n");
			}
		});
		addTemplate({
			filename: "pages.mjs",
			getContents: () => "export { START_LOCATION, useRoute } from 'vue-router'"
		});
		nuxt.options.vite.resolve ||= {};
		nuxt.options.vite.resolve.dedupe ||= [];
		nuxt.options.vite.resolve.dedupe.push("vue-router");
		addTemplate({
			filename: "router.options.mjs",
			getContents: async ({ nuxt }) => {
				const routerOptionsFiles = await resolveRouterOptions(nuxt, builtInRouterOptions);
				const configRouterOptions = genObjectFromRawEntries(Object.entries(nuxt.options.router.options).map(([key, value]) => [key, genString(value)]));
				const hashModes = [];
				for (let index = 0; index < routerOptionsFiles.length; index++) if (routerOptionsFiles[index].path !== builtInRouterOptions) hashModes.unshift(`routerOptions${index}.hashMode`);
				return [
					...routerOptionsFiles.map((file, index) => genImport(file.path, `routerOptions${index}`)),
					`const configRouterOptions = ${configRouterOptions}`,
					`export const hashMode = ${[...hashModes, nuxt.options.router.options.hashMode].join(" ?? ")}`,
					"export default {",
					"...configRouterOptions,",
					...routerOptionsFiles.map((_, index) => `...routerOptions${index},`),
					"}"
				].join("\n");
			}
		});
		addTypeTemplate({
			filename: "types/middleware.d.ts",
			getContents: ({ app }) => {
				return [
					"import type { NavigationGuard } from 'vue-router'",
					`export type MiddlewareKey = ${app.middleware.filter((mw) => !mw.global).map((mw) => genString(mw.name)).join(" | ") || "never"}`,
					"declare module 'nuxt/app' {",
					"  interface PageMeta {",
					"    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>",
					"  }",
					"}"
				].join("\n");
			}
		});
		addTypeTemplate({
			filename: "types/nitro-middleware.d.ts",
			getContents: ({ app }) => {
				return [
					`export type MiddlewareKey = ${app.middleware.filter((mw) => !mw.global).map((mw) => genString(mw.name)).join(" | ") || "never"}`,
					"declare module 'nitropack/types' {",
					"  interface NitroRouteConfig {",
					"    appMiddleware?: MiddlewareKey | MiddlewareKey[] | Record<MiddlewareKey, boolean>",
					"  }",
					"}",
					"declare module 'nitropack' {",
					"  interface NitroRouteConfig {",
					"    appMiddleware?: MiddlewareKey | MiddlewareKey[] | Record<MiddlewareKey, boolean>",
					"  }",
					"}"
				].join("\n");
			}
		}, {
			nuxt: true,
			nitro: true,
			node: true
		});
		if (nuxt.options.experimental.viewTransition) addTypeTemplate({
			filename: "types/view-transitions.d.ts",
			getContents: () => {
				return [
					"import type { ViewTransitionPageOptions } from '../types/config'",
					"declare module 'nuxt/app' {",
					"  interface PageMeta {",
					"    viewTransition?: ViewTransitionPageOptions['enabled'] | ViewTransitionPageOptions",
					"  }",
					"}",
					"export {}"
				].join("\n");
			}
		});
		addComponent({
			name: "NuxtPage",
			priority: 10,
			filePath: resolve(distDir, "pages/runtime/page")
		});
	}
});
const ROUTES_HMR_CODE = `
if (import.meta.hot) {
  import.meta.hot.accept((mod) => {
    const router = import.meta.hot.data.router
    const generateRoutes = import.meta.hot.data.generateRoutes
    if (!router || !generateRoutes) {
      import.meta.hot.invalidate('[nuxt] Cannot replace routes because there is no active router. Reloading.')
      return
    }
    const addedRoutes = router.getRoutes().filter(r => !r._initial)
    router.clearRoutes()
    const routes = generateRoutes(mod.default || mod)
    function addRoutes (routes) {
      for (const route of routes) {
        router.addRoute(route)
      }
      for (const route of router.getRoutes()) {
        route._initial = true
      }
      for (const route of addedRoutes) {
        router.addRoute(route)
      }
      router.isReady().then(() => {
        // Resolve the current path against the new routes to get updated meta
        const newRoute = router.resolve(router.currentRoute.value.fullPath)
        // Clear old meta values and assign new ones
        for (const key of Object.keys(router.currentRoute.value.meta)) {
          delete router.currentRoute.value.meta[key]
        }
        Object.assign(router.currentRoute.value.meta, newRoute.meta)
      })
    }
    if (routes && 'then' in routes) {
      routes.then(addRoutes)
    } else {
      addRoutes(routes)
    }
  })
}

export function handleHotUpdate(_router, _generateRoutes) {
  if (import.meta.hot) {
    import.meta.hot.data ||= {}
    import.meta.hot.data.router = _router
    import.meta.hot.data.generateRoutes = _generateRoutes
    for (const route of _router.getRoutes()) {
      route._initial = true
    }
  }
}
`;
//#endregion
//#region src/head/plugins/unhead-imports.ts
const UNHEAD_LIB_RE = /node_modules[/\\](?:@unhead[/\\][^/\\]+|unhead)[/\\]/;
const NUXT_HEAD_RE = /node_modules[/\\]nuxt[/\\]dist[/\\]head[/\\]runtime[/\\]/;
function toImports(specifiers) {
	return specifiers.map((specifier) => {
		const imported = specifier.imported;
		return imported && imported.name !== specifier.local.name ? `${imported.name} as ${specifier.local.name}` : specifier.local.name;
	});
}
const UnheadVue = "@unhead/vue";
const UnheadVueRE = /@unhead\/vue/;
/**
* To use composable in an async context we need to pass Nuxt context to the Unhead composables.
*
* We swap imports from @unhead/vue to #app/composables/head and warn users for type safety.
*/
const UnheadImportsPlugin = (options) => createUnplugin(() => {
	return {
		name: "nuxt:head:unhead-imports",
		enforce: "post",
		transformInclude(id) {
			id = normalize(id);
			return (isJS(id) || isVue(id, { type: ["script"] })) && !id.startsWith("virtual:") && !id.startsWith(normalize(distDir)) && !UNHEAD_LIB_RE.test(id) && !NUXT_HEAD_RE.test(id);
		},
		transform: {
			filter: { code: { include: UnheadVueRE } },
			handler(code, id, meta) {
				const s = rolldownString(code, id, meta);
				const importsToAdd = [];
				parseAndWalk(code, id, function(node) {
					if (node.type === "ImportDeclaration" && [UnheadVue, "#app/composables/head"].includes(String(node.source.value))) {
						importsToAdd.push(...node.specifiers);
						const { start, end } = node;
						s.remove(start, end);
					}
				});
				const importsFromUnhead = importsToAdd.filter((specifier) => unheadVueComposablesImports[UnheadVue].includes(specifier.imported?.name));
				const importsFromHead = importsToAdd.filter((specifier) => !unheadVueComposablesImports[UnheadVue].includes(specifier.imported?.name));
				if (importsFromUnhead.length) {
					if (!normalize(id).includes("node_modules")) headDiagnostics.NUXT_B6001({
						module: UnheadVue,
						file: `./${relative(normalize(options.rootDir), normalize(id))}`
					});
					s.prepend(`${genImport("#app/composables/head", toImports(importsFromUnhead))}\n`);
				}
				if (importsFromHead.length) s.prepend(`${genImport(UnheadVue, toImports(importsFromHead))}\n`);
				return generateTransform(s, id);
			}
		}
	};
});
//#endregion
//#region src/head/module.ts
const components = [
	"NoScript",
	"Link",
	"Base",
	"Title",
	"Meta",
	"Style",
	"Head",
	"Html",
	"Body"
];
var module_default$3 = defineNuxtModule({
	meta: {
		name: "nuxt:meta",
		configKey: "unhead"
	},
	setup(options, nuxt) {
		const runtimeDir = resolve(distDir, "head/runtime");
		const legacy = options.legacy;
		const headNext = nuxt.options.experimental.headNext;
		nuxt.options.build.transpile.push("@unhead/vue");
		const componentsPath = resolve(runtimeDir, "components");
		for (const componentName of components) addComponent({
			name: componentName,
			filePath: componentsPath,
			export: componentName,
			priority: 10,
			kebabName: componentName
		});
		nuxt.options.alias["#unhead/composables"] = resolve(runtimeDir, "composables");
		addBuildPlugin(UnheadImportsPlugin({ rootDir: nuxt.options.rootDir }));
		if (nuxt.options.future.compatibilityVersion < 5 && !nuxt.options.dev) nuxt.options.optimization.treeShake.composables.client["@unhead/vue"] = [
			"useServerHead",
			"useServerSeoMeta",
			"useServerHeadSafe"
		];
		const importPaths = nuxt.options.modulesDir.map((d) => directoryToURL(d));
		const resolveNuxtUnhead = (id) => resolveModulePath(id, { from: import.meta.url });
		if (nuxt.options.future.compatibilityVersion >= 5 && options.vite !== false && nuxt.options.builder === "@nuxt/vite-builder") {
			const rolldownPath = resolveModulePath("rolldown/experimental", {
				try: true,
				from: importPaths
			});
			const lightningcssPath = resolveModulePath("lightningcss", {
				try: true,
				from: importPaths
			});
			const rolldownURL = rolldownPath ? pathToFileURL(rolldownPath).href : void 0;
			const lightningcssURL = lightningcssPath ? pathToFileURL(lightningcssPath).href : void 0;
			addVitePlugin(async () => {
				const { Unhead } = await import("@unhead/vue/vite");
				const viteOptions = options.vite || {};
				return Unhead({
					validate: !nuxt.options.test,
					minify: {
						js: rolldownURL ? async (code) => {
							const { minify } = await import(rolldownURL);
							return (await minify("inline.js", code)).code.trim();
						} : void 0,
						css: lightningcssURL ? async (code) => {
							const { transform } = await import(lightningcssURL);
							return new TextDecoder().decode(transform({
								filename: "inline.css",
								code: new TextEncoder().encode(code),
								minify: true
							}).code).trim();
						} : void 0
					},
					...viteOptions
				});
			});
		}
		const unheadLegacy = resolveNuxtUnhead("@unhead/vue/legacy");
		const unheadPlugins = resolveNuxtUnhead("@unhead/vue/plugins");
		addTemplate({
			filename: "unhead-options.mjs",
			getContents() {
				const isV5 = nuxt.options.future.compatibilityVersion >= 5;
				if (legacy) headDiagnostics.NUXT_B6003();
				if (headNext === false) headDiagnostics.NUXT_B6004();
				const disableCapoSorting = !isV5 && (legacy || headNext === false);
				const lines = [];
				if (!isV5) lines.push(`import { legacyPlugins } from ${JSON.stringify(unheadLegacy)};`);
				else lines.push(`import { TemplateParamsPlugin } from ${JSON.stringify(unheadPlugins)};`);
				lines.push(`export default {`);
				lines.push(`  disableDefaults: true,`);
				if (disableCapoSorting) lines.push(`  disableCapoSorting: true,`);
				lines.push(`  plugins: ${isV5 ? "[TemplateParamsPlugin]" : "legacyPlugins"},`);
				lines.push(`}`);
				return lines.join("\n");
			}
		});
		addTemplate({
			filename: "unhead.config.mjs",
			getContents() {
				return [`export const renderSSRHeadOptions = ${JSON.stringify(options.renderSSRHeadOptions || {})}`].join("\n");
			}
		});
		nuxt.hooks.hook("nitro:config", (config) => {
			config.virtual["#internal/unhead-options.mjs"] = () => nuxt.vfs["#build/unhead-options.mjs"] || "";
			config.virtual["#internal/unhead.config.mjs"] = () => nuxt.vfs["#build/unhead.config.mjs"] || "";
		});
		if (nuxt.options.future.compatibilityVersion >= 5) {
			const deprecated = /* @__PURE__ */ new Set([
				"useServerHead",
				"useServerHeadSafe",
				"useServerSeoMeta"
			]);
			nuxt.hooks.hook("imports:sources", (sources) => {
				for (const source of sources) if ("from" in source && source.from === "#app/composables/head" && "imports" in source && Array.isArray(source.imports)) source.imports = source.imports.filter((i) => !deprecated.has(typeof i === "string" ? i : i.name));
			});
		}
		const ssrStreamingEnabled = typeof nuxt.options.experimental.ssrStreaming === "object" && nuxt.options.experimental.ssrStreaming.enabled;
		if (ssrStreamingEnabled) {
			let iifeChunkFileName;
			nuxt.hooks.hook("nitro:config", (config) => {
				config.virtual["#internal/streaming-iife-chunk.mjs"] = () => `export const iifeChunkFileName = ${JSON.stringify(iifeChunkFileName)}`;
			});
			addVitePlugin({
				name: "nuxt:streaming-iife-chunk",
				applyToEnvironment: (env) => env.name === "client",
				buildStart() {
					if (nuxt.options.dev) return;
					const baseName = `streaming-iife.${createHash("sha256").update(streamingIifeCode).digest("hex").slice(0, 8)}.js`;
					const prefix = nuxt.options.app.buildAssetsDir.replace(/^\//, "");
					this.emitFile({
						type: "asset",
						fileName: prefix + baseName,
						source: streamingIifeCode
					});
					iifeChunkFileName = baseName;
				}
			});
			if (!nuxt.options.dev && nuxt.options.builder !== "@nuxt/vite-builder") {
				const makeIifeAssetPlugin = () => ({ apply(compiler) {
					if (compiler.options.name !== "client") return;
					compiler.hooks.thisCompilation.tap("nuxt:streaming-iife-chunk", (compilation) => {
						const { RawSource } = compiler.webpack.sources;
						const { PROCESS_ASSETS_STAGE_ADDITIONAL } = compiler.webpack.Compilation;
						compilation.hooks.processAssets.tap({
							name: "nuxt:streaming-iife-chunk",
							stage: PROCESS_ASSETS_STAGE_ADDITIONAL
						}, () => {
							const fileName = `streaming-iife.${createHash("sha256").update(streamingIifeCode).digest("hex").slice(0, 8)}.js`;
							if (!compilation.getAsset(fileName)) compilation.emitAsset(fileName, new RawSource(streamingIifeCode));
							iifeChunkFileName = fileName;
						});
					});
				} });
				addBuildPlugin({
					webpack: makeIifeAssetPlugin,
					rspack: makeIifeAssetPlugin
				});
			}
		}
		addPlugin({ src: resolve(runtimeDir, ssrStreamingEnabled ? "plugins/unhead-stream.client" : "plugins/unhead.client") });
		addPlugin({ src: resolve(runtimeDir, "plugins/unhead.server") });
	}
});
//#endregion
//#region src/imports/presets.ts
const commonPresets = [defineUnimportPreset({
	from: "vue-demi",
	imports: ["isVue2", "isVue3"]
})];
const granularAppPresets = [
	{
		from: "#app/components/nuxt-link",
		imports: ["defineNuxtLink"]
	},
	{
		imports: [
			"useNuxtApp",
			"tryUseNuxtApp",
			"defineNuxtPlugin",
			"definePayloadPlugin",
			"useRuntimeConfig",
			"defineAppConfig"
		],
		from: "#app/nuxt"
	},
	{
		imports: ["useAppConfig", "updateAppConfig"],
		from: "#app/config"
	},
	{
		imports: ["defineNuxtComponent"],
		from: "#app/composables/component"
	},
	{
		imports: [
			"useAsyncData",
			"useLazyAsyncData",
			"useNuxtData",
			"refreshNuxtData",
			"clearNuxtData",
			"createUseAsyncData"
		],
		from: "#app/composables/asyncData"
	},
	{
		imports: ["useHydration"],
		from: "#app/composables/hydrate"
	},
	{
		imports: ["callOnce"],
		from: "#app/composables/once"
	},
	{
		imports: ["useState", "clearNuxtState"],
		from: "#app/composables/state"
	},
	{
		imports: [
			"clearError",
			"createError",
			"isNuxtError",
			"showError",
			"useError"
		],
		from: "#app/composables/error"
	},
	{
		imports: [
			"useFetch",
			"useLazyFetch",
			"createUseFetch"
		],
		from: "#app/composables/fetch"
	},
	{
		imports: ["$fetch"],
		from: "#build/fetch.mjs"
	},
	{
		imports: ["useCookie", "refreshCookie"],
		from: "#app/composables/cookie"
	},
	{
		imports: [
			"onPrehydrate",
			"prerenderRoutes",
			"useRequestHeader",
			"useRequestHeaders",
			"useResponseHeader",
			"useRequestEvent",
			"useRequestFetch",
			"setResponseStatus"
		],
		from: "#app/composables/ssr"
	},
	{
		imports: ["onNuxtReady"],
		from: "#app/composables/ready"
	},
	{
		imports: [
			"preloadComponents",
			"prefetchComponents",
			"preloadRouteComponents"
		],
		from: "#app/composables/preload"
	},
	{
		imports: [
			"abortNavigation",
			"addRouteMiddleware",
			"defineNuxtRouteMiddleware",
			"setPageLayout",
			"navigateTo",
			"useRoute",
			"useRouter"
		],
		from: "#app/composables/router"
	},
	{
		imports: [
			"isPrerendered",
			"loadPayload",
			"preloadPayload",
			"definePayloadReducer",
			"definePayloadReviver"
		],
		from: "#app/composables/payload"
	},
	{
		imports: ["useLoadingIndicator"],
		from: "#app/composables/loading-indicator"
	},
	{
		imports: ["getAppManifest", "getRouteRules"],
		from: "#app/composables/manifest"
	},
	{
		imports: ["reloadNuxtApp"],
		from: "#app/composables/chunk"
	},
	{
		imports: ["useRequestURL"],
		from: "#app/composables/url"
	},
	{
		imports: ["usePreviewMode"],
		from: "#app/composables/preview"
	},
	{
		imports: ["useLayout"],
		from: "#app/composables/layout"
	},
	{
		imports: ["useRouteAnnouncer"],
		from: "#app/composables/route-announcer"
	},
	{
		imports: ["useAnnouncer"],
		from: "#app/composables/announcer"
	},
	{
		imports: ["useRuntimeHook"],
		from: "#app/composables/runtime-hook"
	},
	{
		imports: [
			"useHead",
			"useHeadSafe",
			"useServerHeadSafe",
			"useServerHead",
			"useSeoMeta",
			"useServerSeoMeta",
			"injectHead"
		],
		from: "#app/composables/head"
	}
];
const scriptsStubsPreset = {
	imports: [
		"useScriptTriggerConsent",
		"useScriptEventPage",
		"useScriptTriggerElement",
		"useScript",
		"useScriptGoogleAnalytics",
		"useScriptPlausibleAnalytics",
		"useScriptCrisp",
		"useScriptClarity",
		"useScriptCloudflareWebAnalytics",
		"useScriptVercelAnalytics",
		"useScriptPostHog",
		"useScriptFathomAnalytics",
		"useScriptMatomoAnalytics",
		"useScriptMixpanelAnalytics",
		"useScriptBingUet",
		"useScriptGoogleTagManager",
		"useScriptGoogleAdsense",
		"useScriptGoogleRecaptcha",
		"useScriptGoogleSignIn",
		"useScriptSegment",
		"useScriptMetaPixel",
		"useScriptXPixel",
		"useScriptTikTokPixel",
		"useScriptIntercom",
		"useScriptHotjar",
		"useScriptStripe",
		"useScriptLemonSqueezy",
		"useScriptVimeoPlayer",
		"useScriptYouTubePlayer",
		"useScriptGoogleMaps",
		"useScriptNpm",
		"useScriptUmamiAnalytics",
		"useScriptSnapchatPixel",
		"useScriptRybbitAnalytics",
		"useScriptDatabuddyAnalytics",
		"useScriptRedditPixel",
		"useScriptPayPal",
		"useScriptGravatar",
		"useScriptAhrefsAnalytics",
		"useScriptLinkedInInsight",
		"useScriptCalendly",
		"useScriptUsercentrics",
		"useScriptSpeedCurve"
	],
	priority: -1,
	from: "#app/composables/script-stubs"
};
const routerPreset = defineUnimportPreset({
	imports: ["onBeforeRouteLeave", "onBeforeRouteUpdate"],
	from: "#app/composables/router"
});
const vuePreset = defineUnimportPreset({
	from: "vue",
	imports: [
		"withCtx",
		"withDirectives",
		"withKeys",
		"withMemo",
		"withModifiers",
		"withScopeId",
		"onActivated",
		"onBeforeMount",
		"onBeforeUnmount",
		"onBeforeUpdate",
		"onDeactivated",
		"onErrorCaptured",
		"onMounted",
		"onRenderTracked",
		"onRenderTriggered",
		"onServerPrefetch",
		"onUnmounted",
		"onUpdated",
		"computed",
		"customRef",
		"isProxy",
		"isReactive",
		"isReadonly",
		"isRef",
		"markRaw",
		"proxyRefs",
		"reactive",
		"readonly",
		"ref",
		"shallowReactive",
		"shallowReadonly",
		"shallowRef",
		"toRaw",
		"toRef",
		"toRefs",
		"triggerRef",
		"unref",
		"watch",
		"watchEffect",
		"watchPostEffect",
		"watchSyncEffect",
		"onWatcherCleanup",
		"isShallow",
		"effect",
		"effectScope",
		"getCurrentScope",
		"onScopeDispose",
		"defineComponent",
		"defineAsyncComponent",
		"resolveComponent",
		"getCurrentInstance",
		"h",
		"inject",
		"hasInjectionContext",
		"nextTick",
		"provide",
		"toValue",
		"useModel",
		"useAttrs",
		"useCssModule",
		"useCssVars",
		"useSlots",
		"useTransitionState",
		"useId",
		"useTemplateRef",
		"useShadowRoot",
		"useCssVars"
	]
});
const vueTypesPreset = defineUnimportPreset({
	from: "vue",
	type: true,
	imports: [
		"Component",
		"ComponentPublicInstance",
		"ComputedRef",
		"DirectiveBinding",
		"ExtractDefaultPropTypes",
		"ExtractPropTypes",
		"ExtractPublicPropTypes",
		"InjectionKey",
		"PropType",
		"Ref",
		"MaybeRef",
		"MaybeRefOrGetter",
		"VNode",
		"WritableComputedRef"
	]
});
const appCompatPresets = [{
	imports: ["requestIdleCallback", "cancelIdleCallback"],
	from: "#app/compat/idle-callback"
}, {
	imports: ["setInterval"],
	from: "#app/compat/interval"
}];
const lazyHydrationMacroPreset = [{
	imports: ["defineLazyHydrationComponent"],
	from: "#app/composables/lazy-hydration"
}];
const defaultPresets = [
	...commonPresets,
	...granularAppPresets,
	routerPreset,
	vuePreset,
	vueTypesPreset
];
//#endregion
//#region src/components/templates.ts
const createImportMagicComments = (options) => {
	const { chunkName, prefetch, preload } = options;
	return [
		`webpackChunkName: "${chunkName}"`,
		prefetch === true || typeof prefetch === "number" ? `webpackPrefetch: ${prefetch}` : false,
		preload === true || typeof preload === "number" ? `webpackPreload: ${preload}` : false
	].filter(Boolean).join(", ");
};
const emptyComponentsPlugin = `
import { defineNuxtPlugin } from '#app/nuxt'
export default defineNuxtPlugin({
  name: 'nuxt:global-components',
})
`;
const componentsPluginTemplate = {
	filename: "components.plugin.mjs",
	getContents({ app }) {
		const lazyGlobalComponents = /* @__PURE__ */ new Set();
		const syncGlobalComponents = /* @__PURE__ */ new Set();
		for (const component of app.components) if (component.global === "sync") syncGlobalComponents.add(component.pascalName);
		else if (component.global) lazyGlobalComponents.add(component.pascalName);
		if (!lazyGlobalComponents.size && !syncGlobalComponents.size) return emptyComponentsPlugin;
		const lazyComponents = [...lazyGlobalComponents];
		const syncComponents = [...syncGlobalComponents];
		return `import { defineNuxtPlugin } from '#app/nuxt'
import { ${[...lazyComponents.map((c) => "Lazy" + c), ...syncComponents].join(", ")} } from '#components'
const lazyGlobalComponents = [
  ${lazyComponents.map((c) => `["${c}", Lazy${c}]`).join(",\n")},
  ${syncComponents.map((c) => `["${c}", ${c}]`).join(",\n")}
]

export default defineNuxtPlugin({
  name: 'nuxt:global-components',
  setup (nuxtApp) {
    for (const [name, component] of lazyGlobalComponents) {
      nuxtApp.vueApp.component(name, component)
      nuxtApp.vueApp.component('Lazy' + name, component)
    }
  }
})
`;
	}
};
const componentNamesTemplate = {
	filename: "component-names.mjs",
	getContents({ app }) {
		const componentNames = /* @__PURE__ */ new Set();
		for (const c of app.components) if (!c.island) componentNames.add(c.pascalName);
		return `export const componentNames = ${JSON.stringify([...componentNames])}`;
	}
};
const componentsIslandsTemplate = {
	filename: "components.islands.mjs",
	getContents({ app, nuxt }) {
		if (!nuxt.options.experimental.componentIslands) return "export const islandComponents = Object.create(null)\nexport const pageIslandRoutes = Object.create(null)\nexport const providePageIslandDepth = () => {}";
		const components = app.components;
		const pages = app.pages;
		const islands = components.filter((component) => component.island || component.mode === "server" && !components.some((c) => c.pascalName === component.pascalName && c.mode === "client"));
		const serverPages = pages?.filter((p) => p.mode === "server" && p.file && p.name) || [];
		const pageExports = serverPages.map((p) => {
			return `"page_${p.name}": defineAsyncComponent(${genDynamicImport(p.file)}.then(c => c.default || c))`;
		});
		const pageIslandRoutes = serverPages.map((p) => {
			return `  "page_${p.name}": ${JSON.stringify(hash(relative(nuxt.options.rootDir, p.file)))}`;
		});
		return [
			"import { defineAsyncComponent } from 'vue'",
			"export const islandComponents = import.meta.client ? Object.create(null) : Object.assign(Object.create(null), {",
			islands.map((c) => {
				const exp = c.export === "default" ? "c.default || c" : `c['${c.export}']`;
				const comment = createImportMagicComments(c);
				return `  "${c.pascalName}": defineAsyncComponent(${genDynamicImport(c.filePath, { comment })}.then(c => ${exp}))`;
			}).concat(pageExports).join(",\n"),
			"})",
			"export const pageIslandRoutes = import.meta.client ? Object.create(null) : Object.assign(Object.create(null), {",
			pageIslandRoutes.join(",\n"),
			"})",
			serverPages.length ? [
				"import { computed, provide } from 'vue'",
				"import { viewDepthKey } from 'vue-router'",
				"export const providePageIslandDepth = import.meta.client ? () => {} : (route, expectedIslandKey) => {",
				"  provide(viewDepthKey, computed(() => {",
				"    const depth = route.matched.findIndex(m => m.components?.default?.__nuxt_island === expectedIslandKey)",
				"    return depth === -1 ? 0 : depth + 1",
				"  }))",
				"}"
			].join("\n") : "export const providePageIslandDepth = () => {}"
		].join("\n");
	}
};
const NON_VUE_RE = /\b\.(?!vue)\w+$/g;
function resolveComponentTypes(app, baseDir, dynamic) {
	const serverPlaceholderPath = resolve(distDir, "app/components/server-placeholder");
	const componentTypes = [];
	for (const c of app.components) {
		if (c.island) continue;
		const filePath = c.declarationPath || c.filePath;
		let type = dynamic ? renderDynamicTypeImport(baseDir, filePath, c.export) : renderLegacyTypeImport(baseDir, filePath, c.export);
		if (c.mode === "server") if (app.components.some((other) => other.pascalName === c.pascalName && other.mode === "client")) {
			if (c.filePath.startsWith(serverPlaceholderPath)) continue;
		} else type = `IslandComponent<${type}>`;
		componentTypes.push([c.pascalName, type]);
	}
	return componentTypes;
}
function renderDynamicTypeImport(baseDir, filePath, exportName) {
	return genDynamicTypeImport(isAbsolute(filePath) ? relative(baseDir, filePath).replace(NON_VUE_RE, "") : filePath.replace(NON_VUE_RE, ""), exportName);
}
function renderLegacyTypeImport(baseDir, filePath, exportName) {
	return `typeof ${genDynamicImport(isAbsolute(filePath) ? relative(baseDir, filePath).replace(NON_VUE_RE, "") : filePath.replace(NON_VUE_RE, ""), { wrapper: false })}['${exportName}']`;
}
const islandType = "type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T";
const hydrationTypes = `
type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T
`;
const componentsDeclarationTemplate = {
	filename: "components.d.ts",
	write: true,
	getContents: ({ app, nuxt }) => {
		const componentTypes = resolveComponentTypes(app, nuxt.options.buildDir, nuxt.options.experimental.typescriptPlugin);
		return `
import type { DefineComponent, SlotsType } from 'vue'
${nuxt.options.experimental.componentIslands ? islandType : ""}
${hydrationTypes}

${componentTypes.map(([pascalName, type]) => `export const ${pascalName}: ${type}`).join("\n")}
${componentTypes.map(([pascalName, type]) => `export const Lazy${pascalName}: LazyComponent<${type}>`).join("\n")}

export const componentNames: string[]
`;
	}
};
const componentsTypeTemplate = {
	filename: "types/components.d.ts",
	getContents: ({ app, nuxt }) => {
		const componentTypes = resolveComponentTypes(app, join(nuxt.options.buildDir, "types"), nuxt.options.experimental.typescriptPlugin);
		return `
import type { DefineComponent, SlotsType } from 'vue'
${nuxt.options.experimental.componentIslands ? islandType : ""}
${hydrationTypes}
interface _GlobalComponents {
${componentTypes.map(([pascalName, type]) => `  ${genObjectKey(pascalName)}: ${type}`).join("\n")}
${componentTypes.map(([pascalName, type]) => `  ${genObjectKey(`Lazy${pascalName}`)}: LazyComponent<${type}>`).join("\n")}
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
`;
	}
};
const componentsMetadataTemplate = {
	filename: "components.json",
	write: true,
	getContents: ({ app }) => JSON.stringify(app.components, null, 2)
};
//#endregion
//#region src/components/scan.ts
const ISLAND_RE = /\.island(?:\.global)?$/;
const GLOBAL_RE = /\.global(?:\.island)?$/;
const COMPONENT_MODE_RE = /(?<=\.)(client|server)(?:\.global|\.island)*$/;
const MODE_REPLACEMENT_RE = /(?:\.(?:client|server))?(?:\.global|\.island)*$/;
/**
* Scan the components inside different components folders
* and return a unique list of components
* @param dirs all folders where components are defined
* @param srcDir src path of your app
* @returns {Promise} Component found promise
*/
async function scanComponents(dirs, srcDir) {
	const components = [];
	const componentsByName = /* @__PURE__ */ new Map();
	const filePaths = /* @__PURE__ */ new Set();
	const scannedPaths = [];
	for (const dir of dirs) {
		const resolvedNames = /* @__PURE__ */ new Map();
		const files = (await glob(dir.pattern, {
			cwd: dir.path,
			ignore: dir.ignore
		})).sort();
		if (files.length) {
			const siblings = new Set(await readdir(dirname(dir.path)).catch(() => []));
			const directory = basename(dir.path);
			if (!siblings.has(directory)) {
				const directoryLowerCase = directory.toLowerCase();
				for (const sibling of siblings) if (sibling.toLowerCase() === directoryLowerCase) {
					const nuxt = useNuxt();
					const original = resolveToAlias(dir.path, nuxt);
					const corrected = resolveToAlias(join(dirname(dir.path), sibling), nuxt);
					componentDiagnostics.NUXT_B3008({
						scannedPath: corrected,
						expectedPath: original
					});
					break;
				}
			}
		}
		for (const _file of files) {
			const filePath = join(dir.path, _file);
			if (scannedPaths.some((d) => filePath.startsWith(d)) || isIgnored(filePath)) continue;
			if (filePaths.has(filePath)) continue;
			filePaths.add(filePath);
			/**
			* Create an array of prefixes base on the prefix config
			* Empty prefix will be an empty array
			* @example prefix: 'nuxt' -> ['nuxt']
			* @example prefix: 'nuxt-test' -> ['nuxt', 'test']
			*/
			const prefixParts = [].concat(dir.prefix ? splitByCase(dir.prefix) : [], dir.pathPrefix !== false ? splitByCase(relative(dir.path, dirname(filePath))) : []);
			/**
			* In case we have index as filename the component become the parent path
			* @example third-components/index.vue -> third-component
			* if not take the filename
			* @example third-components/Awesome.vue -> Awesome
			*/
			let fileName = basename(filePath, extname(filePath));
			const island = ISLAND_RE.test(fileName) || dir.island;
			const global = GLOBAL_RE.test(fileName) || dir.global;
			const mode = island ? "server" : fileName.match(COMPONENT_MODE_RE)?.[1] || "all";
			fileName = fileName.replace(MODE_REPLACEMENT_RE, "");
			if (fileName.toLowerCase() === "index") fileName = dir.pathPrefix === false ? basename(dirname(filePath)) : "";
			const suffix = mode !== "all" ? `-${mode}` : "";
			const componentNameSegments = resolveComponentNameSegments(fileName.replace(QUOTE_RE, ""), prefixParts);
			const pascalName = pascalCase(componentNameSegments);
			if (LAZY_COMPONENT_NAME_REGEX.test(pascalName)) componentDiagnostics.NUXT_B3009({
				component: pascalName,
				filePath
			});
			if (resolvedNames.has(pascalName + suffix) || resolvedNames.has(pascalName)) {
				warnAboutDuplicateComponent(pascalName, filePath, resolvedNames.get(pascalName) || resolvedNames.get(pascalName + suffix));
				continue;
			}
			resolvedNames.set(pascalName + suffix, filePath);
			const kebabName = kebabCase(componentNameSegments);
			const shortPath = relative(srcDir, filePath);
			const chunkName = "components/" + kebabName + suffix;
			let component = {
				mode,
				global,
				island,
				prefetch: Boolean(dir.prefetch),
				preload: Boolean(dir.preload),
				filePath,
				declarationPath: filePath,
				pascalName,
				kebabName,
				chunkName,
				shortPath,
				export: "default",
				priority: dir.priority ?? 1,
				_scanned: true
			};
			if (typeof dir.extendComponent === "function") component = await dir.extendComponent(component) || component;
			if (!pascalName) {
				componentDiagnostics.NUXT_B3010({ filePath: resolveToAlias(filePath) });
				continue;
			}
			const existingEntries = componentsByName.get(component.pascalName);
			const existingEntry = existingEntries?.find((e) => e.component.mode === "all" || e.component.mode === component.mode);
			if (existingEntry) {
				const existingComponent = existingEntry.component;
				const existingPriority = existingComponent.priority ?? 0;
				const newPriority = component.priority ?? 0;
				if (newPriority > existingPriority) {
					components[existingEntry.index] = component;
					existingEntry.component = component;
				}
				if (newPriority > 0 && newPriority === existingPriority) warnAboutDuplicateComponent(pascalName, filePath, existingComponent.filePath);
				continue;
			}
			const entry = {
				component,
				index: components.length
			};
			if (existingEntries) existingEntries.push(entry);
			else componentsByName.set(component.pascalName, [entry]);
			components.push(component);
		}
		scannedPaths.push(withTrailingSlash(dir.path));
	}
	return components;
}
function warnAboutDuplicateComponent(componentName, filePath, duplicatePath) {
	componentDiagnostics.NUXT_B3011({
		component: componentName,
		filePath,
		duplicatePath
	});
}
const LAZY_COMPONENT_NAME_REGEX = /^Lazy(?=[A-Z])/;
//#endregion
//#region src/core/plugins/plugin-metadata.ts
const internalOrderMap = {
	"nuxt-pre-all": -50,
	"user-revivers": -40,
	"nuxt-revivers": -30,
	"user-pre": -20,
	"nuxt-default": -10,
	"user-default": 0,
	"nuxt-post": 10,
	"user-post": 20,
	"nuxt-post-all": 30
};
const orderMap = {
	pre: internalOrderMap["user-pre"],
	default: internalOrderMap["user-default"],
	post: internalOrderMap["user-post"]
};
const pluginDependenciesByMode = /* @__PURE__ */ new WeakMap();
function setPluginDependenciesForMode(nuxt, mode, plugins) {
	const dependencies = /* @__PURE__ */ new Map();
	for (const plugin of plugins) if (!plugin._metaUnknown && plugin.dependsOn) dependencies.set(normalize(plugin.src), plugin.dependsOn);
	const metadata = pluginDependenciesByMode.get(nuxt) || {};
	metadata[mode] = dependencies;
	pluginDependenciesByMode.set(nuxt, metadata);
}
const metaCache = {};
function extractMetadata(code, loader = "ts") {
	let meta = {};
	if (metaCache[code]) return metaCache[code];
	parseAndWalk(code, `file.${loader}`, (node) => {
		if (node.type !== "CallExpression" || node.callee.type !== "Identifier") return;
		const name = "name" in node.callee && node.callee.name;
		if (name !== "defineNuxtPlugin" && name !== "definePayloadPlugin") return;
		if (name === "definePayloadPlugin") meta.order = internalOrderMap["user-revivers"];
		const metaArg = node.arguments[1];
		if (metaArg) {
			if (metaArg.type !== "ObjectExpression") throw pluginDiagnostics.NUXT_B2001({
				name,
				type: metaArg.type
			});
			meta = extractMetaFromObject(metaArg.properties);
		}
		const plugin = node.arguments[0];
		if (plugin?.type === "ObjectExpression") meta = defu(extractMetaFromObject(plugin.properties), meta);
		else if (plugin && !isFunctionPluginExpression(plugin)) meta._metaUnknown = true;
		meta.order ||= orderMap[meta.enforce || "default"] || orderMap.default;
		delete meta.enforce;
	});
	metaCache[code] = meta;
	return meta;
}
function isFunctionPluginExpression(node) {
	return node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression";
}
const keys = {
	name: "name",
	order: "order",
	enforce: "enforce",
	dependsOn: "dependsOn",
	parallel: "parallel"
};
function isMetadataKey(key) {
	return typeof key !== "string" ? key.name in keys : key in keys;
}
function extractMetaFromObject(properties) {
	const meta = {};
	for (const property of properties) {
		if (property.type === "SpreadElement" || !("name" in property.key)) throw pluginDiagnostics.NUXT_B2002();
		const propertyKey = property.key.name;
		if (propertyKey === "hooks") {
			meta.hasHooks = true;
			continue;
		}
		if (propertyKey === "env") {
			meta.hasEnv = true;
			continue;
		}
		if (!isMetadataKey(propertyKey)) continue;
		if (property.value.type === "Literal") meta[propertyKey] = property.value.value;
		if (property.value.type === "UnaryExpression" && property.value.argument.type === "Literal") meta[propertyKey] = JSON.parse(property.value.operator + property.value.argument.raw);
		if (propertyKey === "dependsOn" && property.value.type === "ArrayExpression") {
			if (property.value.elements.some((e) => !e || e.type !== "Literal" || typeof e.value !== "string")) throw pluginDiagnostics.NUXT_B2003();
			meta[propertyKey] = property.value.elements.map((e) => e.value);
		}
	}
	return meta;
}
const RemovePluginMetadataPlugin = (nuxt, mode) => createUnplugin(() => {
	return {
		name: `nuxt:remove-plugin-metadata:${mode}`,
		transform(code, id, meta) {
			id = normalize(id);
			const plugin = nuxt.apps.default?.plugins.find((p) => p.src === id);
			if (!plugin) return;
			const filteredDependencies = pluginDependenciesByMode.get(nuxt)?.[mode]?.get(id);
			if (!code.trim()) {
				pluginDiagnostics.NUXT_B2004({ src: plugin.src });
				return {
					code: "export default () => {}",
					map: null
				};
			}
			if (!findExports(code).find((e) => e.type === "default" || e.names.includes("default"))) {
				pluginDiagnostics.NUXT_B2005({ src: plugin.src });
				return {
					code: "export default () => {}",
					map: null
				};
			}
			const s = rolldownString(code, id, meta);
			let wrapped = false;
			const wrapperNames = /* @__PURE__ */ new Set(["defineNuxtPlugin", "definePayloadPlugin"]);
			try {
				parseAndWalk(code, id, (node) => {
					if (node.type === "ImportSpecifier" && node.imported.type === "Identifier" && (node.imported.name === "defineNuxtPlugin" || node.imported.name === "definePayloadPlugin")) wrapperNames.add(node.local.name);
					if (node.type !== "CallExpression" || node.callee.type !== "Identifier") return;
					const name = "name" in node.callee && node.callee.name;
					if (!name || !wrapperNames.has(name)) return;
					wrapped = true;
					const removeExtractedMetadata = "order" in plugin || "name" in plugin;
					if (!filteredDependencies && !removeExtractedMetadata) return;
					for (const [argIndex, arg] of node.arguments.entries()) {
						if (arg.type !== "ObjectExpression") continue;
						for (const [propertyIndex, property] of arg.properties.entries()) {
							if (property.type === "SpreadElement" || !("name" in property.key)) continue;
							const propertyKey = property.key.name;
							if (propertyKey === "dependsOn" && filteredDependencies && property.value.type === "ArrayExpression") {
								const dependencies = property.value.elements.map((element) => element?.type === "Literal" && typeof element.value === "string" ? element.value : null);
								if (dependencies.length !== filteredDependencies.length || dependencies.some((dependency, index) => dependency !== filteredDependencies[index])) s.overwrite(property.value.start, property.value.end, JSON.stringify(filteredDependencies));
							}
							if (removeExtractedMetadata && (propertyKey === "order" || propertyKey === "enforce" || propertyKey === "name")) {
								const nextIndex = (arg.properties[propertyIndex + 1] || node.arguments[argIndex + 1])?.start || arg.end - 1;
								s.remove(property.start, nextIndex);
							}
						}
					}
				});
			} catch (e) {
				pluginDiagnostics.NUXT_B2006({
					src: plugin.src,
					cause: e
				});
				return;
			}
			if (!wrapped) pluginDiagnostics.NUXT_B2007({ src: plugin.src });
			return generateTransform(s, id);
		}
	};
});
//#endregion
//#region src/core/templates.ts
var templates_exports = /* @__PURE__ */ __exportAll({
	appComponentTemplate: () => appComponentTemplate,
	appConfigDeclarationTemplate: () => appConfigDeclarationTemplate,
	appConfigTemplate: () => appConfigTemplate,
	buildTypeTemplate: () => buildTypeTemplate,
	clientConfigTemplate: () => clientConfigTemplate,
	clientPluginTemplate: () => clientPluginTemplate,
	cssTemplate: () => cssTemplate,
	dollarFetchTemplate: () => dollarFetchTemplate,
	dollarFetchTypeTemplate: () => dollarFetchTypeTemplate,
	errorComponentTemplate: () => errorComponentTemplate,
	globalPolyfillsTemplate: () => globalPolyfillsTemplate,
	islandRendererTemplate: () => islandRendererTemplate,
	layoutTemplate: () => layoutTemplate,
	middlewareTemplate: () => middlewareTemplate,
	nuxtConfigTemplate: () => nuxtConfigTemplate,
	pluginsDeclaration: () => pluginsDeclaration,
	publicPathTemplate: () => publicPathTemplate,
	rootComponentTemplate: () => rootComponentTemplate,
	schemaNodeTemplate: () => schemaNodeTemplate,
	schemaTemplate: () => schemaTemplate,
	serverPluginTemplate: () => serverPluginTemplate,
	sharedAppConfigDeclarationTemplate: () => sharedAppConfigDeclarationTemplate,
	testComponentWrapperTemplate: () => testComponentWrapperTemplate,
	vueShim: () => vueShim
});
const vueShim = {
	filename: "types/vue-shim.d.ts",
	getContents: ({ nuxt }) => {
		if (!nuxt.options.typescript.shim) return "";
		return [
			"declare module '*.vue' {",
			"  import { DefineComponent } from 'vue'",
			"  const component: DefineComponent<{}, {}, any>",
			"  export default component",
			"}"
		].join("\n");
	}
};
const appComponentTemplate = {
	filename: "app-component.mjs",
	getContents: (ctx) => genExport(ctx.app.mainComponent, ["default"])
};
const rootComponentTemplate = {
	filename: "root-component.mjs",
	getContents: (ctx) => (ctx.nuxt.options.dev ? "import '#build/components.islands.mjs';\n" : "") + genExport(ctx.app.rootComponent, ["default"])
};
const errorComponentTemplate = {
	filename: "error-component.mjs",
	getContents: (ctx) => genExport(ctx.app.errorComponent, ["default"])
};
const islandRendererTemplate = {
	filename: "island-renderer.mjs",
	getContents(ctx) {
		if (!shouldEnableComponentIslands(ctx.nuxt, ctx.app)) return "const IslandRenderer = () => null\nexport default IslandRenderer";
		const islandRenderer = resolve(ctx.nuxt.options.appDir, "components/island-renderer");
		return [
			"import { defineAsyncComponent } from 'vue'",
			`const IslandRenderer = import.meta.server ? defineAsyncComponent(() => ${genDynamicImport(islandRenderer, { wrapper: false })}.then(r => r.default || r)) : () => null`,
			"export default IslandRenderer"
		].join("\n");
	}
};
const testComponentWrapperTemplate = {
	filename: "test-component-wrapper.mjs",
	getContents: (ctx) => genExport(resolve(ctx.nuxt.options.appDir, "components/test-component-wrapper"), ["default"])
};
const cssTemplate = {
	filename: "css.mjs",
	getContents: (ctx) => ctx.nuxt.options.css.map((i) => genImport(i)).join("\n")
};
const PLUGIN_TEMPLATE_RE = /_(?:45|46|47)/g;
const clientPluginTemplate = {
	filename: "plugins.client.mjs",
	async getContents(ctx) {
		const allPlugins = await annotatePlugins(ctx.nuxt, ctx.app.plugins.filter((p) => ctx.nuxt.options.dev || !p.mode || p.mode !== "server"));
		const clientPlugins = sortPluginsByDependsOn(filterPluginDependencies(allPlugins.filter((p) => !p.mode || p.mode !== "server"), {
			warn: ctx.nuxt.options.dev,
			mode: "client",
			allPlugins
		}));
		setPluginDependenciesForMode(ctx.nuxt, "client", clientPlugins);
		checkForCircularDependencies(clientPlugins);
		const exports = [];
		const imports = [];
		for (const plugin of clientPlugins) {
			const path = relative(ctx.nuxt.options.rootDir, plugin.src);
			const variable = genSafeVariableName(filename(plugin.src) || path).replace(PLUGIN_TEMPLATE_RE, "_") + "_" + hash(path).replace(/-/g, "_");
			exports.push(variable);
			imports.push(genImport(plugin.src, variable));
		}
		return [...imports, `export default ${genArrayFromRaw(exports)}`].join("\n");
	}
};
const serverPluginTemplate = {
	filename: "plugins.server.mjs",
	async getContents(ctx) {
		const allPlugins = await annotatePlugins(ctx.nuxt, ctx.app.plugins.filter((p) => ctx.nuxt.options.dev || !p.mode || p.mode !== "client"));
		const serverPlugins = sortPluginsByDependsOn(filterPluginDependencies(allPlugins.filter((p) => !p.mode || p.mode !== "client"), {
			warn: ctx.nuxt.options.dev,
			mode: "server",
			allPlugins
		}));
		setPluginDependenciesForMode(ctx.nuxt, "server", serverPlugins);
		checkForCircularDependencies(serverPlugins);
		const exports = [];
		const imports = [];
		for (const plugin of serverPlugins) {
			const path = relative(ctx.nuxt.options.rootDir, plugin.src);
			const variable = genSafeVariableName(filename(plugin.src) || path).replace(PLUGIN_TEMPLATE_RE, "_") + "_" + hash(path).replace(/-/g, "_");
			exports.push(variable);
			imports.push(genImport(plugin.src, variable));
		}
		return [...imports, `export default ${genArrayFromRaw(exports)}`].join("\n");
	}
};
const TS_RE = /\.[cm]?tsx?$/;
const JS_LETTER_RE = /\.(?<letter>[cm])?jsx?$/;
const pluginsDeclaration = {
	filename: "types/plugins.d.ts",
	getContents: async ({ nuxt, app }) => {
		const EXTENSION_RE = new RegExp(`(?<=\\w)(${nuxt.options.extensions.map((e) => escapeStringRegexp(e)).join("|")})$`, "g");
		const typesDir = join(nuxt.options.buildDir, "types");
		const tsImports = [];
		const pluginNames = [];
		function exists(path) {
			return app.templates.some((t) => t.write && path === t.dst) || existsSync(path);
		}
		for (const plugin of await annotatePlugins(nuxt, app.plugins)) {
			if (plugin.name) pluginNames.push(`'${plugin.name}'`);
			const pluginPath = resolve(typesDir, plugin.src);
			const relativePath = relative(typesDir, pluginPath);
			const correspondingDeclaration = pluginPath.replace(JS_LETTER_RE, ".d.$<letter>ts");
			if (correspondingDeclaration !== pluginPath && exists(correspondingDeclaration)) {
				tsImports.push(relativePath);
				continue;
			}
			if (exists(pluginPath)) {
				if (TS_RE.test(pluginPath)) {
					tsImports.push(relativePath.replace(EXTENSION_RE, ""));
					continue;
				}
				tsImports.push(relativePath);
			}
		}
		return `// Generated by Nuxt'
import type { Plugin } from '#app'

type Decorate<T extends Record<string, any>> = { [K in keyof T as K extends string ? \`$\${K}\` : never]: T[K] }

type InjectionType<A extends Plugin> = A extends {default: Plugin<infer T>} ? Decorate<T> : unknown

type NuxtAppInjections = \n  ${tsImports.map((p) => `InjectionType<typeof ${genDynamicImport(p, { wrapper: false })}>`).join(" &\n  ")}

declare module '#app' {
  interface NuxtApp extends NuxtAppInjections { }

  interface NuxtAppLiterals {
    pluginName: ${pluginNames.join(" | ")}
  }
}

declare module 'vue' {
  interface ComponentCustomProperties extends NuxtAppInjections { }
}

export { }
`;
	}
};
const IMPORT_NAME_RE = /\.\w+$/;
const GIT_RE = /^git\+/;
const schemaTemplate = {
	filename: "types/runtime-config.d.ts",
	getContents: async ({ nuxt }) => {
		const privateRuntimeConfig = Object.create(null);
		for (const key in nuxt.options.runtimeConfig) if (key !== "public" && key !== "nitro") privateRuntimeConfig[key] = nuxt.options.runtimeConfig[key];
		return [
			`import { RuntimeConfig as UserRuntimeConfig, PublicRuntimeConfig as UserPublicRuntimeConfig } from 'nuxt/schema'`,
			generateTypes(await resolveSchema(privateRuntimeConfig), {
				interfaceName: "SharedRuntimeConfig",
				addExport: false,
				addDefaults: false,
				allowExtraKeys: false,
				indentation: 2
			}),
			generateTypes(await resolveSchema(nuxt.options.runtimeConfig.public), {
				interfaceName: "SharedPublicRuntimeConfig",
				addExport: false,
				addDefaults: false,
				allowExtraKeys: false,
				indentation: 2
			}),
			`declare module '@nuxt/schema' {`,
			`  interface RuntimeConfig extends UserRuntimeConfig {}`,
			`  interface PublicRuntimeConfig extends UserPublicRuntimeConfig {}`,
			`}`,
			`declare module 'nuxt/schema' {`,
			`  interface RuntimeConfig extends SharedRuntimeConfig {}`,
			`  interface PublicRuntimeConfig extends SharedPublicRuntimeConfig {}`,
			"}",
			`declare module 'vue' {
        interface ComponentCustomProperties {
          $config: UserRuntimeConfig
        }
      }`
		].join("\n");
	}
};
const schemaNodeTemplate = {
	filename: "types/modules.d.ts",
	getContents: ({ nuxt }) => {
		const relativeRoot = relative(resolve(nuxt.options.buildDir, "types"), nuxt.options.rootDir);
		const getImportName = (name) => (name[0] === "." ? "./" + join(relativeRoot, name) : name).replace(IMPORT_NAME_RE, "");
		const modules = [];
		for (const m of nuxt.options._installedModules) {
			if (!m.meta || !m.meta.configKey || !m.meta.name) continue;
			if (m.meta.name.startsWith("nuxt:") || m.meta.name === "nuxt-config-schema") continue;
			modules.push([
				genString(m.meta.configKey),
				getImportName(m.entryPath || m.meta.name),
				m
			]);
		}
		const moduleOptionsInterface = (options) => [...modules.flatMap(([configKey, importName, mod]) => {
			let link;
			if (!mod.meta?.rawPath) link = `https://www.npmjs.com/package/${importName}`;
			if (typeof mod.meta?.docs === "string") link = mod.meta.docs;
			else if (mod.meta?.repository) {
				if (typeof mod.meta.repository === "string") link = mod.meta.repository;
				else if (typeof mod.meta.repository === "object" && "url" in mod.meta.repository && typeof mod.meta.repository.url === "string") link = mod.meta.repository.url;
				if (link) {
					if (link.startsWith("git+")) link = link.replace(GIT_RE, "");
					if (!link.startsWith("http")) link = "https://github.com/" + link;
				}
			}
			return [
				`    /**`,
				`     * Configuration for \`${importName}\``,
				...options.addJSDocTags && link ? [`     * @see ${link}`] : [],
				`     */`,
				`    [${configKey}]${options.unresolved ? "?" : ""}: typeof ${genDynamicImport(importName, { wrapper: false })}.default extends NuxtModule<infer O, unknown, boolean> ? ${options.unresolved ? "Partial<O>" : "O"} | false : Record<string, any> | false`
			];
		}), modules.length > 0 && options.unresolved ? `    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ${modules.map(([configKey, importName, mod]) => `[${genString(mod.meta?.rawPath || importName)}, Exclude<NuxtConfig[${configKey}], boolean>]`).join(" | ")})[],` : ""].filter(Boolean);
		const moduleDependencies = modules.flatMap(([_configKey, importName, mod]) => [`    [${genString(mod.meta.name || importName)}]?: ModuleDependencyMeta<typeof ${genDynamicImport(importName, { wrapper: false })}.default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false`]).join("\n");
		return [
			"import { NuxtModule, ModuleDependencyMeta } from '@nuxt/schema'",
			"declare module '@nuxt/schema' {",
			"  interface ModuleDependencies {",
			moduleDependencies,
			"  }",
			"  interface NuxtOptions {",
			...moduleOptionsInterface({
				addJSDocTags: false,
				unresolved: false
			}),
			"  }",
			"  interface NuxtConfig {",
			...moduleOptionsInterface({
				addJSDocTags: false,
				unresolved: true
			}),
			"  }",
			"}",
			"declare module 'nuxt/schema' {",
			"  interface ModuleDependencies {",
			moduleDependencies,
			"  }",
			"  interface NuxtOptions {",
			...moduleOptionsInterface({
				addJSDocTags: true,
				unresolved: false
			}),
			"  }",
			"  interface NuxtConfig {",
			...moduleOptionsInterface({
				addJSDocTags: true,
				unresolved: true
			}),
			"  }",
			"}"
		].join("\n");
	}
};
const layoutTemplate = {
	filename: "layouts.mjs",
	getContents({ app }) {
		return [`import { defineAsyncComponent } from 'vue'`, `export default ${genObjectFromRawEntries(Object.values(app.layouts).map(({ name, file }) => {
			return [name, `defineAsyncComponent(${genDynamicImport(file, { interopDefault: true })})`];
		}))}`].join("\n");
	}
};
const middlewareTemplate = {
	filename: "middleware.mjs",
	getContents({ app, nuxt }) {
		const globalMiddleware = app.middleware.filter((mw) => mw.global);
		const namedMiddleware = app.middleware.filter((mw) => !mw.global);
		const alias = nuxt.options.dev ? {
			...nuxt?.options.alias || {},
			...strippedAtAliases
		} : {};
		return [...globalMiddleware.map((mw) => genImport(mw.path, genSafeVariableName(mw.name))), ...!nuxt.options.dev ? [`export const globalMiddleware = ${genArrayFromRaw(globalMiddleware.map((mw) => genSafeVariableName(mw.name)))}`, `export const namedMiddleware = ${genObjectFromRawEntries(namedMiddleware.map((mw) => [mw.name, genDynamicImport(mw.path)]))}`] : [
			`const _globalMiddleware = ${genObjectFromRawEntries(globalMiddleware.map((mw) => [reverseResolveAlias(mw.path, alias).pop() || mw.path, genSafeVariableName(mw.name)]))}`,
			`for (const path in _globalMiddleware) {`,
			`  Object.defineProperty(_globalMiddleware[path], '_path', { value: path, configurable: true })`,
			`}`,
			`export const globalMiddleware = Object.values(_globalMiddleware)`,
			`const _namedMiddleware = ${genArrayFromRaw(namedMiddleware.map((mw) => ({
				name: genString(mw.name),
				path: genString(reverseResolveAlias(mw.path, alias).pop() || mw.path),
				import: genDynamicImport(mw.path)
			})))}`,
			`for (const mw of _namedMiddleware) {`,
			`  const i = mw.import`,
			`  mw.import = () => i().then(r => {`,
			`    Object.defineProperty(r.default || r, '_path', { value: mw.path, configurable: true })`,
			`    return r`,
			`  })`,
			`}`,
			`export const namedMiddleware = Object.fromEntries(_namedMiddleware.map(mw => [mw.name, mw.import]))`
		]].join("\n");
	}
};
const clientConfigTemplate = {
	filename: "nitro.client.mjs",
	getContents: ({ nuxt }) => {
		const appId = JSON.stringify(nuxt.options.appId);
		return ["export const useRuntimeConfig = () => ", (!nuxt.options.future.multiApp ? "window?.__NUXT__?.config || window?.useNuxtApp?.().payload?.config" : `window?.__NUXT__?.[${appId}]?.config || window?.useNuxtApp?.(${appId}).payload?.config`) || {}].join("\n");
	}
};
const APP_CONFIG_MERGE_TYPES = `type IsAny<T> = 0 extends 1 & T ? true : false

type MergedAppConfig<Resolved extends Record<string, unknown>, Custom extends Record<string, unknown>> = {
  [K in keyof (Resolved & Custom)]: K extends keyof Custom
    ? unknown extends Custom[K]
      ? Resolved[K]
      : IsAny<Custom[K]> extends true
        ? Resolved[K]
        : Custom[K] extends Record<string, any>
            ? Resolved[K] extends Record<string, any>
              ? MergedAppConfig<Resolved[K], Custom[K]>
              : Exclude<Custom[K], undefined>
            : Exclude<Custom[K], undefined>
    : Resolved[K]
}`;
const appConfigDeclarationTemplate = {
	filename: "types/app.config.d.ts",
	getContents({ app, nuxt }) {
		const typesDir = join(nuxt.options.buildDir, "types");
		return `
import type { AppConfigInput, CustomAppConfig } from 'nuxt/schema'
import type { Defu } from 'defu'
${app.configs.map((path) => relative(typesDir, path).replace(EXTENSION_RE, "")).map((id, index) => `import ${`cfg${index}`} from ${JSON.stringify(id)}`).join("\n")}

declare global {
  const defineAppConfig: <C extends AppConfigInput> (config: C) => C
}

declare const inlineConfig = ${JSON.stringify(nuxt.options.appConfig, null, 2)}
type ResolvedAppConfig = Defu<typeof inlineConfig, [${app.configs.map((_id, index) => `typeof cfg${index}`).join(", ")}]>
${APP_CONFIG_MERGE_TYPES}

declare module 'nuxt/schema' {
  interface AppConfig extends MergedAppConfig<ResolvedAppConfig, CustomAppConfig> { }
}
declare module '@nuxt/schema' {
  interface AppConfig extends MergedAppConfig<ResolvedAppConfig, CustomAppConfig> { }
}
`;
	}
};
const sharedAppConfigDeclarationTemplate = {
	filename: "types/shared-app.config.d.ts",
	getContents({ nuxt }) {
		return `
import type { CustomAppConfig } from 'nuxt/schema'

declare const inlineConfig = ${JSON.stringify(nuxt.options.appConfig, null, 2)}
${APP_CONFIG_MERGE_TYPES}

declare module 'nuxt/schema' {
  interface AppConfig extends MergedAppConfig<typeof inlineConfig, CustomAppConfig> { }
}
declare module '@nuxt/schema' {
  interface AppConfig extends MergedAppConfig<typeof inlineConfig, CustomAppConfig> { }
}
`;
	}
};
const appConfigTemplate = {
	filename: "app.config.mjs",
	write: true,
	getContents({ app, nuxt }) {
		return `
import { defuFn } from 'defu'

const inlineConfig = ${JSON.stringify(nuxt.options.appConfig, null, 2)}

/** client **/
import { _replaceAppConfig } from '#app/config'

// Vite - webpack is handled directly in #app/config
if (import.meta.dev && !import.meta.nitro && import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    _replaceAppConfig(newModule.default)
  })
}
/** client-end **/

${app.configs.map((id, index) => `import ${`cfg${index}`} from ${JSON.stringify(id)}`).join("\n")}

export default /*@__PURE__*/ defuFn(${app.configs.map((_id, index) => `cfg${index}`).concat(["inlineConfig"]).join(", ")})
`;
	}
};
const publicPathTemplate = {
	filename: "paths.mjs",
	getContents({ nuxt }) {
		return [
			"import { joinRelativeURL } from 'ufo'",
			!nuxt.options.dev && "import { useRuntimeConfig } from 'nitropack/runtime'",
			nuxt.options.dev ? `const getAppConfig = () => (${JSON.stringify(nuxt.options.app)})` : "const getAppConfig = () => useRuntimeConfig().app",
			"export const baseURL = () => getAppConfig().baseURL",
			"export const buildAssetsDir = () => getAppConfig().buildAssetsDir",
			"export const buildAssetsURL = (...path) => joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path)",
			"export const publicAssetsURL = (...path) => {",
			"  const appConfig = getAppConfig()",
			"  const publicBase = appConfig.cdnURL || appConfig.baseURL",
			"  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase",
			"}",
			"if (import.meta.client) {",
			"  globalThis.__buildAssetsURL = buildAssetsURL",
			"  globalThis.__publicAssetsURL = publicAssetsURL",
			"}"
		].filter(Boolean).join("\n");
	}
};
const globalPolyfillsTemplate = {
	filename: "global-polyfills.mjs",
	getContents() {
		return `
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}`;
	}
};
const dollarFetchTemplate = {
	filename: "fetch.mjs",
	getContents() {
		return [
			"import { $fetch as _$fetch } from 'ofetch'",
			"import { baseURL } from '#internal/nuxt/paths'",
			"if (!globalThis.$fetch) {",
			"  globalThis.$fetch = _$fetch.create({",
			"    baseURL: baseURL()",
			"  })",
			"}",
			"export const $fetch = globalThis.$fetch"
		].join("\n");
	}
};
const dollarFetchTypeTemplate = {
	filename: "fetch.d.ts",
	getContents() {
		return "export declare const $fetch: import('nitropack/types').$Fetch\n";
	}
};
function hasActiveComponentIslands(ctx) {
	return ctx.nuxt.options.experimental.componentIslands && (ctx.nuxt.options.experimental.componentIslands !== "auto" || ctx.app.pages?.some((p) => p.mode === "server") || ctx.app.components?.some((c) => c.mode === "server" && !ctx.app.components.some((other) => other.pascalName === c.pascalName && other.mode === "client")));
}
function shouldEnableComponentIslands(nuxt, app) {
	return nuxt.options.experimental.componentIslands && (nuxt.options.dev || hasActiveComponentIslands({
		nuxt,
		app
	}));
}
const nuxtConfigTemplate = {
	filename: "nuxt.config.mjs",
	async getContents(ctx) {
		const annotatedPlugins = ctx.nuxt.options.dev || ctx.nuxt.options.test ? null : await annotatePlugins(ctx.nuxt, ctx.app.plugins);
		const pluginsHaveDependencies = annotatedPlugins ? hasPluginDependencies(annotatedPlugins) : true;
		const pluginsRunInParallel = annotatedPlugins ? hasParallelPlugins(annotatedPlugins) : true;
		const pluginsHaveHooks = annotatedPlugins ? hasPluginHooks(annotatedPlugins) : true;
		const pluginsHaveIslandOptOut = annotatedPlugins ? hasIslandOptOutPlugins(annotatedPlugins) : true;
		const fetchDefaults = {
			...ctx.nuxt.options.experimental.defaults.useFetch,
			baseURL: void 0,
			headers: void 0
		};
		const componentIslandsActive = hasActiveComponentIslands(ctx);
		const componentIslands = shouldEnableComponentIslands(ctx.nuxt, ctx.app);
		const nitro = useNitro();
		const hasCachedRoutes = Object.values(nitro.options.routeRules).some((r) => r.isr || r.cache);
		const payloadExtraction = !!ctx.nuxt.options.experimental.payloadExtraction && (nitro.options.static || hasCachedRoutes || nitro.options.prerender.routes && nitro.options.prerender.routes.length > 0 || Object.values(nitro.options.routeRules).some((r) => r.prerender));
		return [
			...Object.entries(ctx.nuxt.options.app).map(([k, v]) => `export const ${camelCase("app-" + k)} = ${JSON.stringify(v)}`),
			`export const renderJsonPayloads = ${!!ctx.nuxt.options.experimental.renderJsonPayloads}`,
			`export const componentIslands = ${componentIslands}`,
			`export const componentIslandsActive = ${componentIslandsActive}`,
			`export const payloadExtraction = ${payloadExtraction}`,
			`export const prefetchPreloadTags = ${!!ctx.nuxt.options.experimental.prefetchPreloadTags}`,
			`export const cookieStore = ${!!ctx.nuxt.options.experimental.cookieStore}`,
			`export const appManifest = ${!!ctx.nuxt.options.experimental.appManifest}`,
			`export const remoteComponentIslands = ${typeof ctx.nuxt.options.experimental.componentIslands === "object" && ctx.nuxt.options.experimental.componentIslands.remoteIsland}`,
			`export const selectiveClient = ${typeof ctx.nuxt.options.experimental.componentIslands === "object" && Boolean(ctx.nuxt.options.experimental.componentIslands.selectiveClient)}`,
			`export const devPagesDir = ${ctx.nuxt.options.dev ? JSON.stringify(ctx.nuxt.options.dir.pages) : "null"}`,
			`export const devRootDir = ${ctx.nuxt.options.dev ? JSON.stringify(ctx.nuxt.options.rootDir) : "null"}`,
			`export const devLogs = ${JSON.stringify(ctx.nuxt.options.features.devLogs)}`,
			`export const nuxtLinkDefaults = ${JSON.stringify(ctx.nuxt.options.experimental.defaults.nuxtLink)}`,
			`export const asyncDataDefaults = ${JSON.stringify(ctx.nuxt.options.experimental.defaults.useAsyncData)}`,
			`export const useStateDefaults = ${JSON.stringify(ctx.nuxt.options.experimental.defaults.useState)}`,
			`export const fetchDefaults = ${JSON.stringify(fetchDefaults)}`,
			`export const vueAppRootContainer = ${ctx.nuxt.options.app.rootAttrs.id ? `'#${ctx.nuxt.options.app.rootAttrs.id}'` : `'body > ${ctx.nuxt.options.app.rootTag}'`}`,
			`export const viewTransition = ${ctx.nuxt.options.experimental.viewTransition}`,
			`export const appId = ${JSON.stringify(ctx.nuxt.options.appId)}`,
			`export const outdatedBuildInterval = ${ctx.nuxt.options.experimental.checkOutdatedBuildInterval}`,
			`export const multiApp = ${!!ctx.nuxt.options.future.multiApp}`,
			`export const chunkErrorEvent = ${ctx.nuxt.options.experimental.emitRouteChunkError ? ctx.nuxt.options.builder === "@nuxt/vite-builder" ? "\"vite:preloadError\"" : "\"nuxt:preloadError\"" : "false"}`,
			`export const crawlLinks = ${!!nitro.options.prerender.crawlLinks}`,
			`export const spaLoadingTemplateOutside = ${ctx.nuxt.options.experimental.spaLoadingTemplateLocation === "body"}`,
			`export const purgeCachedData = ${!!ctx.nuxt.options.experimental.purgeCachedData}`,
			`export const granularCachedData = ${!!ctx.nuxt.options.experimental.granularCachedData}`,
			`export const pendingWhenIdle = ${!!ctx.nuxt.options.experimental.pendingWhenIdle}`,
			`export const alwaysRunFetchOnKeyChange = ${!!ctx.nuxt.options.experimental.alwaysRunFetchOnKeyChange}`,
			`export const asyncCallHook = ${!!ctx.nuxt.options.experimental.asyncCallHook}`,
			`export const clientNodePlaceholder = ${!!ctx.nuxt.options.experimental.clientNodePlaceholder}`,
			`export const tracingChannelNuxt = ${!!(ctx.nuxt.options.tracingChannel && typeof ctx.nuxt.options.tracingChannel === "object" && ctx.nuxt.options.tracingChannel.nuxt)}`,
			`export const runtimeCompiler = ${!!ctx.nuxt.options.vue.runtimeCompiler}`,
			`export const hasPluginDependencies = ${pluginsHaveDependencies}`,
			`export const hasParallelPlugins = ${pluginsRunInParallel}`,
			`export const hasPluginHooks = ${pluginsHaveHooks}`,
			`export const hasIslandOptOutPlugins = ${pluginsHaveIslandOptOut}`
		].join("\n\n");
	}
};
const TYPE_FILENAME_RE = /\.([cm])?[jt]s$/;
const DECLARATION_RE = /\.d\.[cm]?ts$/;
const buildTypeTemplate = {
	filename: "types/build.d.ts",
	getContents({ app }) {
		let declarations = "";
		for (const file of app.templates) {
			if (file.write || !file.filename || DECLARATION_RE.test(file.filename)) continue;
			if (TYPE_FILENAME_RE.test(file.filename)) {
				const typeFilenames = /* @__PURE__ */ new Set([file.filename.replace(TYPE_FILENAME_RE, ".d.$1ts"), file.filename.replace(TYPE_FILENAME_RE, ".d.ts")]);
				if (app.templates.some((f) => f.filename && typeFilenames.has(f.filename))) continue;
			}
			const fullSpecifier = join("#build", file.filename);
			declarations += "declare module " + JSON.stringify(fullSpecifier) + ";\n";
			const bareSpecifier = fullSpecifier.replace(/\.m?js$/, "");
			if (bareSpecifier !== fullSpecifier) declarations += "declare module " + JSON.stringify(bareSpecifier) + ";\n";
		}
		return declarations;
	}
};
const strippedAtAliases = {
	"@": "",
	"@@": ""
};
//#endregion
//#region src/core/app.ts
function createApp(nuxt, options = {}) {
	return defu(options, {
		dir: nuxt.options.srcDir,
		extensions: nuxt.options.extensions,
		plugins: [],
		components: [],
		templates: []
	});
}
const structureVersions = /* @__PURE__ */ new WeakMap();
const resolvedStructureVersions = /* @__PURE__ */ new WeakMap();
/**
* Version of the app's file structure, bumped whenever a file is added to or removed
* from a watched directory. Scans whose result depends only on which files exist
* (layouts, middleware, plugins, components) can be reused while it is unchanged.
*
* While it is unchanged, `app:resolve` and `components:extend` are not re-run in dev.
* Modules whose contributions depend on state other than the file tree should call
* `updateTemplates()` with no filter to force a full re-resolution.
*/
function getAppStructureVersion(nuxt) {
	return structureVersions.get(nuxt) ?? 0;
}
function invalidateAppStructure(nuxt) {
	structureVersions.set(nuxt, getAppStructureVersion(nuxt) + 1);
}
const postTemplates = /* @__PURE__ */ new Set([
	clientPluginTemplate.filename,
	serverPluginTemplate.filename,
	pluginsDeclaration.filename
]);
async function generateApp(nuxt, app, options = {}) {
	const generateStart = performance.now();
	await resolveApp(nuxt, app);
	const resolvedAt = performance.now();
	app.templates = Object.values(templates_exports).concat(nuxt.options.build.templates);
	await nuxt.callHook("app:templates", app);
	const scannedAt = performance.now();
	app.templates = app.templates.map((tmpl) => normalizeTemplate(tmpl, nuxt.options.buildDir));
	const filteredTemplates = {
		pre: [],
		post: []
	};
	for (const template of app.templates) {
		if (options.filter && !options.filter(template)) continue;
		filteredTemplates[template.filename && postTemplates.has(template.filename) ? "post" : "pre"].push(template);
	}
	const templateContext = {
		nuxt,
		app
	};
	const writes = [];
	const dirs = /* @__PURE__ */ new Set();
	const changedTemplates = [];
	const FORWARD_SLASH_RE = /\//g;
	async function processTemplate(template) {
		const fullPath = template.dst || resolve(nuxt.options.buildDir, template.filename);
		const start = performance.now();
		const oldContents = nuxt.vfs[fullPath];
		const contents = await compileTemplate(template, templateContext).catch((e) => {
			if (!(e instanceof Diagnostic)) buildDiagnostics.NUXT_B1001({
				filename: template.filename,
				src: template.src,
				cause: e
			});
			throw e;
		});
		template.modified = oldContents !== contents;
		if (template.modified) {
			nuxt.vfs[fullPath] = contents;
			const aliasPath = "#build/" + template.filename;
			nuxt.vfs[aliasPath] = contents;
			if (process.platform === "win32") nuxt.vfs[fullPath.replace(FORWARD_SLASH_RE, "\\")] = contents;
			changedTemplates.push(template);
		}
		const perf = performance.now() - start;
		const compileTime = Math.round(perf * 100) / 100;
		if (nuxt.options.debug && nuxt.options.debug.templates || compileTime > 500) logger.info(`Compiled \`${template.filename}\` in ${compileTime}ms`);
		if (template.modified && template.write && !matchesDisk(fullPath, contents)) {
			dirs.add(dirname(fullPath));
			writes.push(() => writeFileSync(fullPath, contents, "utf8"));
		}
	}
	await Promise.allSettled(filteredTemplates.pre.map(processTemplate));
	await Promise.allSettled(filteredTemplates.post.map(processTemplate));
	for (const dir of dirs) mkdirSync(dir, { recursive: true });
	for (const write of writes) write();
	if (nuxt.options.debug && nuxt.options.debug.templates) logger.info(`Generated app in ${Math.round(performance.now() - generateStart)}ms (resolve ${Math.round(resolvedAt - generateStart)}ms, scan ${Math.round(scannedAt - resolvedAt)}ms, compile ${Math.round(performance.now() - scannedAt)}ms), ${changedTemplates.length} template(s) changed`);
	if (changedTemplates.length) await nuxt.callHook("app:templatesGenerated", app, changedTemplates, options);
}
/**
* On a fresh start the in-memory comparison always reports a template as
* modified, so check the file we are about to overwrite: an unchanged
* `buildDir` keeps its mtimes stable for anything downstream that caches
* against them.
*/
function matchesDisk(path, contents) {
	try {
		return readFileSync(path, "utf8") === contents;
	} catch {
		return false;
	}
}
/** @internal */
async function compileTemplate(template, ctx) {
	delete ctx.utils;
	if (template.src) try {
		return await promises.readFile(template.src, "utf-8");
	} catch (err) {
		throw buildDiagnostics.NUXT_B1002({
			src: template.src,
			cause: err
		});
	}
	if (template.getContents) return template.getContents({
		...ctx,
		options: template.options
	});
	throw buildDiagnostics.NUXT_B1003();
}
async function resolveApp(nuxt, app) {
	const version = getAppStructureVersion(nuxt);
	if (nuxt.options.dev && resolvedStructureVersions.get(app) === version) return;
	const layerDirs = getLayerDirectories(nuxt);
	const reversedLayerDirs = layerDirs.toReversed();
	app.mainComponent ||= await findPath(layerDirs.flatMap((d) => [join(d.app, "App"), join(d.app, "app")]));
	app.mainComponent ||= resolve(nuxt.options.appDir, "components/welcome.vue");
	app.rootComponent ||= await findPath(["~/app.root", resolve(nuxt.options.appDir, "components/nuxt-root.vue")]);
	app.errorComponent ||= await findPath(layerDirs.map((d) => join(d.app, "error"))) ?? resolve(nuxt.options.appDir, "components/nuxt-error-page.vue");
	const extensionGlob = nuxt.options.extensions.join(",");
	const layouts = {};
	for (const dirs of layerDirs) {
		const layoutFiles = await resolveFiles(dirs.appLayouts, `**/*{${extensionGlob}}`);
		for (const file of layoutFiles) {
			const name = getNameFromPath(file, dirs.appLayouts);
			if (!name) {
				pageDiagnostics.NUXT_B4009({ file: resolveToAlias(file, nuxt) });
				continue;
			}
			layouts[name] ||= {
				name,
				file
			};
		}
	}
	let middleware = [];
	for (const dirs of reversedLayerDirs) {
		const middlewareFiles = await resolveFiles(dirs.appMiddleware, [`*{${extensionGlob}}`, `*/index{${extensionGlob}}`]);
		for (const file of middlewareFiles) {
			const name = getNameFromPath(file);
			if (!name) {
				pageDiagnostics.NUXT_B4010({ file: resolveToAlias(file, nuxt) });
				continue;
			}
			middleware.push({
				name,
				path: file,
				global: hasSuffix(file, ".global")
			});
		}
	}
	const reversedLayers = nuxt.options._layers.slice().reverse();
	let plugins = [];
	for (let i = 0; i < reversedLayerDirs.length; i++) {
		const config = reversedLayers[i].config;
		const dirs = reversedLayerDirs[i];
		plugins.push(...[...config.plugins || [], ...await resolveFiles(dirs.appPlugins, [`*{${extensionGlob}}`, `*/index{${extensionGlob}}`])].map((plugin) => normalizePlugin(plugin)));
	}
	for (const p of nuxt.options.plugins.toReversed()) {
		const plugin = normalizePlugin(p);
		if (!plugins.some((p) => p.src === plugin.src)) plugins.unshift(plugin);
	}
	middleware = uniqueBy(await resolvePaths(nuxt, middleware.toReversed(), "path"), "name").reverse();
	plugins = uniqueBy(await resolvePaths(nuxt, plugins, "src"), "src");
	const configs = [];
	for (const dirs of layerDirs) {
		const appConfigPath = await findPath(join(dirs.app, "app.config"));
		if (appConfigPath) configs.push(appConfigPath);
	}
	Object.assign(app, {
		middleware,
		plugins,
		configs,
		layouts
	});
	await nuxt.callHook("app:resolve", app);
	app.middleware = uniqueBy(await resolvePaths(nuxt, app.middleware, "path"), "name");
	app.plugins = uniqueBy(await resolvePaths(nuxt, app.plugins, "src"), "src");
	app.configs = [...new Set(app.configs)];
	resolvedStructureVersions.set(app, version);
}
function resolvePaths(nuxt, items, key) {
	return Promise.all(items.map(async (item) => {
		if (!item[key]) return item;
		return {
			...item,
			[key]: await resolvePath(item[key], {
				alias: nuxt.options.alias,
				extensions: nuxt.options.extensions,
				fallbackToOriginal: true,
				virtual: true
			})
		};
	}));
}
const IS_TSX = /\.[jt]sx$/;
async function annotatePlugins(nuxt, plugins) {
	const _plugins = [];
	for (const plugin of plugins) try {
		const code = nuxt.vfs[plugin.src] ?? await promises.readFile(plugin.src, "utf-8");
		_plugins.push({
			...await extractMetadata(code, IS_TSX.test(plugin.src) ? "tsx" : "ts"),
			...plugin
		});
	} catch (e) {
		const relativePluginSrc = relative(nuxt.options.rootDir, plugin.src);
		const code = e instanceof Error ? e.name : "";
		if (code === "NUXT_B2001" || code === "NUXT_B2002") pluginDiagnostics.NUXT_B2010({ src: relativePluginSrc });
		else pluginDiagnostics.NUXT_B2010({
			src: relativePluginSrc,
			cause: e
		});
		_plugins.push({
			...plugin,
			_metaUnknown: true
		});
	}
	return _plugins.sort((a, b) => (a.order ?? orderMap.default) - (b.order ?? orderMap.default));
}
/**
* Reorder `order`-sorted plugins so each plugin's `dependsOn` entries appear earlier in the array.
* The original (order-sorted) sequence is preserved as the stable tiebreaker. Unknown dependency
* names are ignored to match the runtime resolver. Cycles are not resolved here; any plugin still
* pending after the walk is emitted in its original position. `checkForCircularDependencies`
* surfaces those graphs separately.
*/
function sortPluginsByDependsOn(plugins) {
	const known = /* @__PURE__ */ new Set();
	for (const plugin of plugins) if (plugin.name) known.add(plugin.name);
	const emitted = /* @__PURE__ */ new Set();
	const result = [];
	const pending = [];
	const tryEmit = (plugin) => {
		const deps = plugin.dependsOn;
		if (deps) {
			for (const dep of deps) if (known.has(dep) && !emitted.has(dep)) return false;
		}
		result.push(plugin);
		if (plugin.name) emitted.add(plugin.name);
		return true;
	};
	const flushPending = () => {
		let progressed = true;
		while (progressed) {
			progressed = false;
			for (let i = 0; i < pending.length;) if (tryEmit(pending[i])) {
				pending.splice(i, 1);
				progressed = true;
			} else i++;
		}
	};
	for (const plugin of plugins) if (!tryEmit(plugin)) pending.push(plugin);
	else flushPending();
	for (const plugin of pending) result.push(plugin);
	return result;
}
function filterPluginDependencies(plugins, options = {}) {
	const filter = !plugins.some((plugin) => plugin._metaUnknown);
	const pluginNames = new Set(plugins.map((plugin) => plugin.name));
	const allPluginNames = new Set((options.allPlugins || plugins).map((plugin) => plugin.name));
	const result = plugins.map((plugin) => {
		if (!plugin.dependsOn?.some((name) => !pluginNames.has(name))) return plugin;
		const missing = plugin.dependsOn.filter((name) => !pluginNames.has(name));
		if (options.warn) {
			const unavailable = options.mode ? missing.filter((name) => allPluginNames.has(name)) : [];
			const unregistered = options.mode ? missing.filter((name) => !allPluginNames.has(name)) : missing;
			if (unavailable.length && options.mode) pluginDiagnostics.NUXT_B2012({
				name: plugin.name,
				dependencies: unavailable,
				mode: options.mode
			});
			if (unregistered.length) pluginDiagnostics.NUXT_B2008({
				name: plugin.name,
				missing: unregistered.join(", ")
			});
		}
		if (!filter) return plugin;
		return {
			...plugin,
			dependsOn: plugin.dependsOn.filter((name) => pluginNames.has(name))
		};
	});
	return filter ? result : plugins;
}
function hasPluginDependencies(plugins) {
	for (const plugin of plugins) {
		if (plugin._metaUnknown) return true;
		if (plugin.dependsOn && plugin.dependsOn.length > 0) return true;
	}
	return false;
}
function hasParallelPlugins(plugins) {
	for (const plugin of plugins) {
		if (plugin._metaUnknown) return true;
		if (plugin.parallel) return true;
	}
	return false;
}
function hasPluginHooks(plugins) {
	for (const plugin of plugins) {
		if (plugin._metaUnknown) return true;
		if (plugin.hasHooks) return true;
	}
	return false;
}
function hasIslandOptOutPlugins(plugins) {
	for (const plugin of plugins) {
		if (plugin._metaUnknown) return true;
		if (plugin.hasEnv) return true;
	}
	return false;
}
function checkForCircularDependencies(_plugins) {
	const deps = Object.create(null);
	for (const plugin of _plugins) if (plugin.name) deps[plugin.name] = plugin.dependsOn || [];
	const checkDeps = (name, visited = []) => {
		if (visited.includes(name)) {
			pluginDiagnostics.NUXT_B2009({ cycle: `${visited.join(" -> ")} -> ${name}` });
			return [];
		}
		visited.push(name);
		return deps[name]?.length ? deps[name].flatMap((dep) => checkDeps(dep, [...visited])) : [];
	};
	for (const name in deps) checkDeps(name);
}
//#endregion
//#region src/components/plugins/loader.ts
const REPLACE_COMPONENT_TO_DIRECT_IMPORT_RE = /(?<=[\s(=;])_?resolveComponent\d*\s*\(\s*(?<quote>["'`])(?<lazy>lazy-|Lazy(?=[A-Z]))?(?<modifier>Idle|Visible|idle-|visible-|Interaction|interaction-|MediaQuery|media-query-|If|if-|Never|never-|Time|time-)?(?<name>[^'"`]*)\k<quote>[^)]*\)|(?<=\bh\s*\(\s*)(?<hLazy>lazy-|Lazy(?=[A-Z]))?(?<hModifier>Idle|Visible|idle-|visible-|Interaction|interaction-|MediaQuery|media-query-|If|if-|Never|never-|Time|time-)?(?<hName>[A-Z][\w$]*)\b/g;
const LoaderPlugin = (options) => createUnplugin(() => {
	const exclude = options.transform?.exclude || [];
	const include = options.transform?.include || [];
	const nuxt = tryUseNuxt();
	return {
		name: "nuxt:components-loader",
		enforce: "post",
		transformInclude(id) {
			if (exclude.some((pattern) => pattern.test(id))) return false;
			if (include.some((pattern) => pattern.test(id))) return true;
			return isVue(id, { type: ["template", "script"] }) || !!id.match(SX_RE);
		},
		transform(code, id, meta) {
			const components = options.getComponents();
			let num = 0;
			const imports = /* @__PURE__ */ new Set();
			const map = /* @__PURE__ */ new Map();
			const s = rolldownString(code, id, meta);
			for (const match of code.matchAll(REPLACE_COMPONENT_TO_DIRECT_IMPORT_RE)) {
				const groups = match.groups;
				const lazy = groups.hLazy || groups.lazy;
				const modifier = groups.hModifier || groups.modifier;
				const name = groups.hName || groups.name;
				const normalComponent = findComponent(components, name, options.mode);
				const modifierComponent = !normalComponent && modifier ? findComponent(components, modifier + name, options.mode) : null;
				const component = normalComponent || modifierComponent;
				if (component) {
					const internalInstall = component._internal_install;
					if (internalInstall && nuxt?.options.test === false) {
						if (!nuxt.options.dev) throw componentDiagnostics.NUXT_B3004({
							file: resolveToAlias(id, nuxt),
							component: component.pascalName,
							requiredModule: internalInstall
						});
						installNuxtModule(internalInstall);
					}
					let identifier = map.get(component) || `__nuxt_component_${num++}`;
					map.set(component, identifier);
					if (!component._raw && component.mode === "server" && !components.some((c) => c.pascalName === component.pascalName && c.mode === "client")) {
						imports.add(genImport(options.serverComponentRuntime, [{ name: "createServerComponent" }]));
						imports.add(`const ${identifier} = createServerComponent(${JSON.stringify(component.pascalName)})`);
						if (!options.experimentalComponentIslands) componentDiagnostics.NUXT_B3003({ component: name });
						s.overwrite(match.index, match.index + match[0].length, identifier);
						continue;
					}
					const isClientOnly = !component._raw && component.mode === "client";
					if (isClientOnly) {
						imports.add(genImport("#app/components/client-only", [{ name: "createClientOnly" }]));
						identifier += "_client";
					}
					if (lazy) {
						const dynamicImport = `${genDynamicImport(component.filePath, { interopDefault: false })}.then(c => c.${component.export ?? "default"} || c)`;
						if (modifier && normalComponent) {
							const relativePath = relative(options.srcDir, component.filePath);
							switch (modifier) {
								case "Visible":
								case "visible-":
									imports.add(genImport(options.clientDelayedComponentRuntime, [{ name: "createLazyVisibleComponent" }]));
									identifier += "_lazy_visible";
									imports.add(`const ${identifier} = createLazyVisibleComponent(${JSON.stringify(relativePath)}, ${dynamicImport})`);
									break;
								case "Interaction":
								case "interaction-":
									imports.add(genImport(options.clientDelayedComponentRuntime, [{ name: "createLazyInteractionComponent" }]));
									identifier += "_lazy_event";
									imports.add(`const ${identifier} = createLazyInteractionComponent(${JSON.stringify(relativePath)}, ${dynamicImport})`);
									break;
								case "Idle":
								case "idle-":
									imports.add(genImport(options.clientDelayedComponentRuntime, [{ name: "createLazyIdleComponent" }]));
									identifier += "_lazy_idle";
									imports.add(`const ${identifier} = createLazyIdleComponent(${JSON.stringify(relativePath)}, ${dynamicImport})`);
									break;
								case "MediaQuery":
								case "media-query-":
									imports.add(genImport(options.clientDelayedComponentRuntime, [{ name: "createLazyMediaQueryComponent" }]));
									identifier += "_lazy_media";
									imports.add(`const ${identifier} = createLazyMediaQueryComponent(${JSON.stringify(relativePath)}, ${dynamicImport})`);
									break;
								case "If":
								case "if-":
									imports.add(genImport(options.clientDelayedComponentRuntime, [{ name: "createLazyIfComponent" }]));
									identifier += "_lazy_if";
									imports.add(`const ${identifier} = createLazyIfComponent(${JSON.stringify(relativePath)}, ${dynamicImport})`);
									break;
								case "Never":
								case "never-":
									imports.add(genImport(options.clientDelayedComponentRuntime, [{ name: "createLazyNeverComponent" }]));
									identifier += "_lazy_never";
									imports.add(`const ${identifier} = createLazyNeverComponent(${JSON.stringify(relativePath)}, ${dynamicImport})`);
									break;
								case "Time":
								case "time-":
									imports.add(genImport(options.clientDelayedComponentRuntime, [{ name: "createLazyTimeComponent" }]));
									identifier += "_lazy_time";
									imports.add(`const ${identifier} = createLazyTimeComponent(${JSON.stringify(relativePath)}, ${dynamicImport})`);
							}
						} else {
							imports.add(genImport("vue", [{
								name: "defineAsyncComponent",
								as: "__defineAsyncComponent"
							}]));
							identifier += "_lazy";
							imports.add(`const ${identifier} = __defineAsyncComponent(${dynamicImport}${isClientOnly ? ".then(c => createClientOnly(c))" : ""})`);
						}
					} else {
						imports.add(genImport(component.filePath, [{
							name: component._raw ? "default" : component.export,
							as: identifier
						}]));
						if (isClientOnly) {
							imports.add(`const ${identifier}_wrapped = createClientOnly(${identifier})`);
							identifier += "_wrapped";
						}
					}
					s.overwrite(match.index, match.index + match[0].length, identifier);
				}
			}
			if (imports.size) s.prepend([...imports, ""].join("\n"));
			return generateTransform(s, id);
		}
	};
});
function findComponent(components, name, mode) {
	const id = pascalCase(name).replace(QUOTE_RE, "");
	const validModes = /* @__PURE__ */ new Set([
		"all",
		mode,
		void 0
	]);
	const component = components.find((component) => id === component.pascalName && validModes.has(component.mode));
	if (component) return component;
	const otherModeComponent = components.find((component) => id === component.pascalName);
	if (mode === "server" && otherModeComponent) return components.find((c) => c.pascalName === "ServerPlaceholder");
	return otherModeComponent;
}
//#endregion
//#region src/components/plugins/islands-transform.ts
const HAS_SLOT_OR_CLIENT_RE = /<slot[^>]*>|nuxt-client/;
const HAS_VFOR_RE = /\sv-for=/;
const TEMPLATE_RE$1 = /<template>[\s\S]*<\/template>/;
const NUXTCLIENT_ATTR_RE = /\s:?nuxt-client(?:="[^"]*")?/g;
const IMPORT_CODE = "\nimport { mergeProps as __mergeProps } from 'vue'\nimport { vforToArray as __vforToArray } from '#app/components/utils'\nimport { vforBound as __vforBound } from '#app/components/vfor'\nimport NuxtTeleportIslandComponent from '#app/components/nuxt-teleport-island-component'\nimport NuxtTeleportSsrSlot from '#app/components/nuxt-teleport-island-slot'";
const EXTRACTED_ATTRS_RE = /v-(?:if|else-if|else)(?:="[^"]*")?/g;
const KEY_RE = /:?key="[^"]"/g;
const V_FOR_ALIAS_RE = /\s+(in|of)\s+/;
const V_FOR_ATTR_RE = /(\sv-for=)(["'])([\s\S]*?)\2/;
function boundVForExpression(expression) {
	const match = V_FOR_ALIAS_RE.exec(expression);
	if (!match) return expression;
	const alias = expression.slice(0, match.index);
	const source = expression.slice(match.index + match[0].length);
	return `${alias} ${match[1]} __vforBound(${source})`;
}
function boundVForInTag(tag) {
	return tag.replace(V_FOR_ATTR_RE, (_full, prefix, quote, expression) => `${prefix}${quote}${boundVForExpression(expression)}${quote}`);
}
function wrapWithVForDiv(code, vfor) {
	return `<div v-for="${vfor}" style="display: contents;">${code}</div>`;
}
function findScriptBlocks(code) {
	const blocks = [];
	walkSync(parse$1(code), (node) => {
		if (node.type === ELEMENT_NODE && node.name === "script") blocks.push({
			attributes: node.attributes,
			contentStart: node.loc[0].end
		});
	});
	return blocks;
}
const IslandsTransformPlugin = (options) => createUnplugin((_options, meta) => {
	const isVite = meta.framework === "vite";
	return {
		name: "nuxt:server-only-component-transform",
		enforce: "pre",
		transformInclude(id) {
			if (!isVue(id)) return false;
			if (isVite && options.selectiveClient === "deep") return true;
			const { pathname } = parseModuleId(normalize(id));
			return isIslandFile(pathname, options);
		},
		transform: {
			filter: { code: { include: [HAS_SLOT_OR_CLIENT_RE, HAS_VFOR_RE] } },
			async handler(code, id, transformMeta) {
				const template = code.match(TEMPLATE_RE$1);
				if (!template) return;
				const startingIndex = template.index || 0;
				const s = rolldownString(code, id, transformMeta);
				const { pathname } = parseModuleId(normalize(id));
				const isIsland = isIslandFile(pathname, options);
				if (!HAS_SLOT_OR_CLIENT_RE.test(code) && !(isIsland && HAS_VFOR_RE.test(code))) return;
				const scriptBlocks = findScriptBlocks(code);
				const setupBlock = scriptBlocks.find(({ attributes }) => "setup" in attributes);
				if (setupBlock) s.appendRight(setupBlock.contentStart, IMPORT_CODE);
				else {
					const lang = scriptBlocks[0]?.attributes.lang;
					s.prepend(`<script setup${lang ? ` lang="${lang}"` : ""}>
import { mergeProps as __mergeProps } from 'vue'
import { vforToArray as __vforToArray } from '#app/components/utils'
import { vforBound as __vforBound } from '#app/components/vfor'
import NuxtTeleportIslandComponent from '#app/components/nuxt-teleport-island-component'
import NuxtTeleportSsrSlot from '#app/components/nuxt-teleport-island-slot'<\/script>`);
				}
				let hasNuxtClient = false;
				const ast = parse$1(template[0]);
				await walk$1(ast, (node) => {
					if (node.type !== ELEMENT_NODE) return;
					if (node.name === "slot") {
						if (!isIsland) return;
						const { attributes, children, loc } = node;
						const slotName = attributes.name ?? "default";
						if (attributes.name) delete attributes.name;
						if (attributes["v-bind"]) attributes._bind = extractAttributes(attributes, ["v-bind"])["v-bind"];
						const teleportAttributes = extractAttributes(attributes, [
							"v-if",
							"v-else-if",
							"v-else"
						]);
						attributes["v-for"] &&= boundVForExpression(attributes["v-for"]);
						const bindings = getPropsToString(attributes);
						s.appendLeft(startingIndex + loc[0].start, `<NuxtTeleportSsrSlot${attributeToString(teleportAttributes)} name="${slotName}" :props="${bindings}">`);
						if (children.length) {
							const attrString = attributeToString(attributes);
							const slice = code.slice(startingIndex + loc[0].end, startingIndex + loc[1].start).replaceAll(KEY_RE, "");
							s.overwrite(startingIndex + loc[0].start, startingIndex + loc[1].end, `<slot${attrString.replaceAll(EXTRACTED_ATTRS_RE, "")}/><template #fallback>${attributes["v-for"] ? wrapWithVForDiv(slice, attributes["v-for"]) : slice}</template>`);
						} else s.overwrite(startingIndex + loc[0].start, startingIndex + loc[0].end, boundVForInTag(code.slice(startingIndex + loc[0].start, startingIndex + loc[0].end).replaceAll(EXTRACTED_ATTRS_RE, "")));
						s.appendRight(startingIndex + loc[1].end, "</NuxtTeleportSsrSlot>");
						return;
					}
					if (node.name === "NuxtTeleportIslandComponent") return;
					if (!("nuxt-client" in node.attributes) && !(":nuxt-client" in node.attributes)) {
						if (isIsland && "v-for" in node.attributes) {
							const start = startingIndex + node.loc[0].start;
							const end = startingIndex + node.loc[0].end;
							const openTag = code.slice(start, end);
							const bounded = boundVForInTag(openTag);
							if (bounded !== openTag) s.overwrite(start, end, bounded);
						}
						return;
					}
					hasNuxtClient = true;
					if (!isVite || !options.selectiveClient) return;
					const { loc, attributes } = node;
					const attributeValue = attributes[":nuxt-client"] || attributes["nuxt-client"] || "true";
					const wrapperAttributes = extractAttributes(attributes, [
						"v-if",
						"v-else-if",
						"v-else"
					]);
					let startTag = code.slice(startingIndex + loc[0].start, startingIndex + loc[0].end).replace(NUXTCLIENT_ATTR_RE, "");
					if (wrapperAttributes) startTag = startTag.replaceAll(EXTRACTED_ATTRS_RE, "");
					if (isIsland && "v-for" in attributes) startTag = boundVForInTag(startTag);
					s.appendLeft(startingIndex + loc[0].start, `<NuxtTeleportIslandComponent${attributeToString(wrapperAttributes)} :nuxt-client="${attributeValue}">`);
					s.overwrite(startingIndex + loc[0].start, startingIndex + loc[0].end, startTag);
					s.appendRight(startingIndex + loc[1].end, "</NuxtTeleportIslandComponent>");
				});
				if (hasNuxtClient) {
					if (!options.selectiveClient) componentDiagnostics.NUXT_B3007({ file: id });
					else if (!isVite) componentDiagnostics.NUXT_B3013({ file: id });
				}
				return generateTransform(s, id);
			}
		}
	};
});
function isIslandFile(pathname, options) {
	const components = options.getComponents();
	if (components.some((component) => component.filePath === pathname && (component.island || component.mode === "server" && !components.some((c) => c.pascalName === component.pascalName && c.mode === "client")))) return true;
	return options.getServerPages?.().includes(pathname) ?? false;
}
/**
* extract attributes from a node
*/
function extractAttributes(attributes, names) {
	const extracted = {};
	for (const name of names) if (name in attributes) {
		extracted[name] = attributes[name];
		delete attributes[name];
	}
	return extracted;
}
function attributeToString(attributes) {
	return Object.entries(attributes).map(([name, value]) => value ? ` ${name}="${value}"` : ` ${name}`).join("");
}
function isBinding(attr) {
	return attr.startsWith(":");
}
function getPropsToString(bindings) {
	const vfor = bindings["v-for"]?.split(" in ").map((v) => v.trim());
	if (Object.keys(bindings).length === 0) return "undefined";
	const contentParts = [];
	for (const [name, value] of Object.entries(bindings)) if (name && name !== "_bind" && name !== "v-for") contentParts.push(isBinding(name) ? `[\`${name.slice(1)}\`]: ${value}` : `[\`${name}\`]: \`${value}\``);
	const content = contentParts.join(",");
	const data = bindings._bind ? `__mergeProps(${bindings._bind}, { ${content} })` : `{ ${content} }`;
	if (!vfor) return `[${data}]`;
	else return `__vforToArray(${vfor[1]}).map(${vfor[0]} => (${data}))`;
}
const COMPONENT_CHUNK_ID = `#build/component-chunk`;
const COMPONENT_CHUNK_RESOLVED_ID = "\0nuxt-component-chunk";
const ComponentsChunkPlugin = (options) => {
	const chunkIds = /* @__PURE__ */ new Map();
	const paths = /* @__PURE__ */ new Map();
	return [{
		name: "nuxt:components-chunk:client",
		apply: () => !options.dev,
		applyToEnvironment: (environment) => environment.name === "client",
		buildStart() {
			for (const c of options.getComponents()) {
				if (!c.filePath || c.mode === "server") continue;
				chunkIds.set(c.pascalName, this.emitFile({
					type: "chunk",
					name: `${c.pascalName}-chunk.mjs`,
					id: c.filePath,
					preserveSignature: "strict"
				}));
			}
		},
		generateBundle(_, bundle) {
			const ids = /* @__PURE__ */ new Set();
			for (const [name, id] of chunkIds.entries()) {
				const filename = this.getFileName(id);
				ids.add(filename);
				paths.set(name, filename);
			}
			for (const chunk of Object.values(bundle)) if (chunk.type === "chunk") {
				if (ids.has(chunk.fileName)) chunk.isEntry = false;
			}
		}
	}, {
		name: "nuxt:components-chunk:server",
		resolveId: {
			order: "pre",
			handler(id) {
				if (id === COMPONENT_CHUNK_ID) return COMPONENT_CHUNK_RESOLVED_ID;
			}
		},
		load(id) {
			if (id === COMPONENT_CHUNK_RESOLVED_ID) {
				if (options.dev) {
					const filePaths = {};
					for (const c of options.getComponents()) {
						if (!c.filePath || c.mode === "server") continue;
						filePaths[c.pascalName] = `@fs/${c.filePath}`;
					}
					return `export default ${genObjectFromRawEntries(Object.entries(filePaths).map(([name, path]) => [name, genString(path)]))}`;
				}
				return `export default ${genObjectFromRawEntries(Array.from(paths.entries()).map(([name, id]) => [name, genString("/" + id)]))}`;
			}
		}
	}];
};
//#endregion
//#region src/components/plugins/transform.ts
const COMPONENT_QUERY_RE = /[?&]nuxt_component=/;
function TransformPlugin$1(nuxt, options) {
	const componentUnimport = createUnimport({
		imports: [{
			name: "componentNames",
			from: "#build/component-names"
		}],
		virtualImports: ["#components"],
		injectAtEnd: true
	});
	const rootDirWithSlash = nuxt.options.rootDir.replace(/\/?$/, "/");
	function getComponentsImports() {
		const components = options.getComponents(options.mode);
		const clientOrServerModes = /* @__PURE__ */ new Set(["client", "server"]);
		return components.flatMap((c) => {
			const withMode = (mode) => mode ? `${c.filePath}${c.filePath.includes("?") ? "&" : "?"}nuxt_component=${mode}&nuxt_component_name=${c.pascalName}&nuxt_component_export=${c.export || "default"}` : c.filePath;
			const mode = !c._raw && c.mode && clientOrServerModes.has(c.mode) ? c.mode : void 0;
			return [{
				as: c.pascalName,
				from: withMode(mode),
				name: c.export || "default"
			}, {
				as: "Lazy" + c.pascalName,
				from: withMode([mode, "async"].filter(Boolean).join(",")),
				name: c.export || "default"
			}];
		});
	}
	return createUnplugin(() => [{
		name: "nuxt:components:imports-wrapper",
		enforce: "post",
		transformInclude(id) {
			id = normalize(id);
			return id.startsWith("virtual:") || id.startsWith("\0virtual:") || id.startsWith(nuxt.options.buildDir) || !isIgnored(id, void 0, nuxt);
		},
		transform: {
			filter: { id: COMPONENT_QUERY_RE },
			handler(_code, id) {
				const { search } = parseModuleId(id);
				const params = new URLSearchParams(search);
				const mode = params.get("nuxt_component");
				const bare = id.replace(/\?.*/, "");
				const componentExport = params.get("nuxt_component_export") || "default";
				const exportWording = componentExport === "default" ? "export default" : `export const ${componentExport} =`;
				if (mode === "async") return {
					code: ["import { defineAsyncComponent } from \"vue\"", `${exportWording} defineAsyncComponent(() => import(${JSON.stringify(bare)}).then(r => r[${JSON.stringify(componentExport)}] || r.default || r))`].join("\n"),
					map: null
				};
				else if (mode === "client") return {
					code: [
						genImport(bare, [{
							name: componentExport,
							as: "__component"
						}]),
						"import { createClientOnly } from \"#app/components/client-only\"",
						`${exportWording} createClientOnly(__component)`
					].join("\n"),
					map: null
				};
				else if (mode === "client,async") return {
					code: [
						"import { defineAsyncComponent } from \"vue\"",
						"import { createClientOnly } from \"#app/components/client-only\"",
						`${exportWording} defineAsyncComponent(() => import(${JSON.stringify(bare)}).then(r => createClientOnly(r[${JSON.stringify(componentExport)}] || r.default || r)))`
					].join("\n"),
					map: null
				};
				else if (mode === "server" || mode === "server,async") {
					const name = params.get("nuxt_component_name");
					return {
						code: [`import { createServerComponent } from ${JSON.stringify(options.serverComponentRuntime)}`, `${exportWording} createServerComponent(${JSON.stringify(name)})`].join("\n"),
						map: null
					};
				} else throw buildDiagnostics.NUXT_B1019({ mode: String(mode) });
			}
		}
	}, {
		name: "nuxt:components:imports-alias",
		enforce: "post",
		transformInclude(id) {
			id = normalize(id);
			return id.startsWith("virtual:") || id.startsWith("\0virtual:") || id.startsWith(nuxt.options.buildDir) || !isIgnored(id, void 0, nuxt);
		},
		transform: {
			filter: { code: /#components/ },
			async handler(code, id) {
				if (isAbsolute(id) && (/node_modules[\\/](?!\.virtual)/.test(id) || !id.includes(rootDirWithSlash))) {
					let pkg;
					try {
						pkg = await readPackage(id);
					} catch {}
					if (isObject(pkg) && isObject(pkg.imports) && Object.keys(pkg.imports).some((k) => k.includes("#components"))) return;
				}
				componentUnimport.modifyDynamicImports((imports) => {
					imports.length = 0;
					imports.push(...getComponentsImports());
					return imports;
				});
				const result = await componentUnimport.injectImports(code, id, {
					autoImport: false,
					transformVirtualImports: true
				});
				if (!result) return;
				return {
					code: result.code,
					map: nuxt.options.sourcemap.server || nuxt.options.sourcemap.client ? result.s.generateMap({ hires: true }) : void 0
				};
			}
		}
	}]);
}
//#endregion
//#region src/components/plugins/tree-shake.ts
const SSR_RENDER_RE = /ssrRenderComponent/;
const PLACEHOLDER_EXACT_RE = /^(?:fallback|placeholder)$/;
const CLIENT_ONLY_NAME_RE = /^(?:_unref\()?(?:_component_)?(?:Lazy|lazy_)?(?:client_only|ClientOnly\)?)$/;
const TreeShakeTemplatePlugin = (options) => createUnplugin(() => {
	const regexpMap = /* @__PURE__ */ new WeakMap();
	return {
		name: "nuxt:tree-shake-template",
		enforce: "post",
		transform: {
			filter: { id: { include: VUE_ID_RE } },
			handler(code, id, meta) {
				const components = options.getComponents();
				if (!regexpMap.has(components)) {
					const serverPlaceholderPath = resolve(distDir, "app/components/server-placeholder");
					const clientOnlyComponents = components.filter((c) => c.mode === "client" && !components.some((other) => other.mode !== "client" && other.pascalName === c.pascalName && !other.filePath.startsWith(serverPlaceholderPath))).flatMap((c) => [c.pascalName, c.kebabName.replaceAll("-", "_")]).concat(["ClientOnly", "client_only"]);
					regexpMap.set(components, [
						new RegExp(`(${clientOnlyComponents.join("|")})`),
						new RegExp(`^(${clientOnlyComponents.map((c) => `(?:(?:_unref\\()?(?:_component_)?(?:Lazy|lazy_)?${c}\\)?)`).join("|")})$`),
						clientOnlyComponents
					]);
				}
				const [COMPONENTS_RE, COMPONENTS_IDENTIFIERS_RE] = regexpMap.get(components);
				if (!COMPONENTS_RE.test(code)) return;
				const s = rolldownString(code, id, meta);
				const candidateNames = /* @__PURE__ */ new Set();
				const { program: ast } = parseAndWalk(code, id, (node) => {
					if (!isSsrRender(node)) return;
					const [componentCall, _, children] = node.arguments;
					if (!componentCall) return;
					if (componentCall.type === "Identifier" || componentCall.type === "MemberExpression" || componentCall.type === "CallExpression") {
						const componentName = getComponentName(node);
						if (!componentName || !COMPONENTS_IDENTIFIERS_RE.test(componentName) || children?.type !== "ObjectExpression") return;
						const slotsToRemove = CLIENT_ONLY_NAME_RE.test(componentName) ? children.properties.filter((prop) => prop.type === "Property" && prop.key.type === "Identifier" && !PLACEHOLDER_EXACT_RE.test(prop.key.name)) : children.properties;
						for (const slot of slotsToRemove) {
							s.remove(slot.start, slot.end + 1);
							const removedCode = `({${code.slice(slot.start, slot.end + 1)}})`;
							parseAndWalk(removedCode, id, (node) => {
								if (!isSsrRender(node)) return;
								const name = getComponentName(node);
								if (name) candidateNames.add(name);
							});
						}
					}
				});
				const componentsToRemove = [];
				if (candidateNames.size) {
					const referencedNames = getSetupReferencedNames(s.toString(), id);
					for (const name of candidateNames) if (!referencedNames.has(name)) componentsToRemove.push(name);
				}
				const removedNodes = /* @__PURE__ */ new WeakSet();
				for (const componentName of componentsToRemove) {
					removeImportDeclaration(ast, componentName, s);
					removeVariableDeclarator(ast, componentName, s, removedNodes);
					removeFromSetupReturn(ast, componentName, s);
				}
				return generateTransform(s, id);
			}
		}
	};
});
/**
* find and remove all property with the name parameter from the setup return statement and the __returned__ object
*/
function removeFromSetupReturn(codeAst, name, magicString) {
	let walkedInSetup = false;
	walk(codeAst, { enter(node) {
		if (walkedInSetup) this.skip();
		else if (node.type === "Property" && node.key.type === "Identifier" && node.key.name === "setup" && (node.value.type === "FunctionExpression" || node.value.type === "ArrowFunctionExpression")) {
			walkedInSetup = true;
			if (node.value.body?.type === "BlockStatement") {
				const returnStatement = node.value.body.body.find((statement) => statement.type === "ReturnStatement");
				if (returnStatement && returnStatement.argument?.type === "ObjectExpression") removePropertyFromObject(returnStatement.argument, name, magicString);
				const returnedVariableDeclaration = node.value.body.body.filter((statement) => statement.type === "VariableDeclaration").find((declaration) => declaration.declarations[0]?.id.type === "Identifier" && declaration.declarations[0]?.id.name === "__returned__" && declaration.declarations[0]?.init?.type === "ObjectExpression");
				if (returnedVariableDeclaration) {
					const init = returnedVariableDeclaration.declarations[0]?.init;
					if (init) removePropertyFromObject(init, name, magicString);
				}
			}
		}
	} });
}
/**
* remove a property from an object expression
*/
function removePropertyFromObject(node, name, magicString) {
	for (const property of node.properties) if (property.type === "Property" && property.key.type === "Identifier" && property.key.name === name) {
		magicString.remove(property.start, property.end + 1);
		return true;
	}
	return false;
}
/**
* is the node a call expression ssrRenderComponent()
*/
function isSsrRender(node) {
	return node.type === "CallExpression" && node.callee.type === "Identifier" && SSR_RENDER_RE.test(node.callee.name);
}
function removeImportDeclaration(ast, importName, magicString) {
	for (const node of ast.body) {
		if (node.type !== "ImportDeclaration" || !node.specifiers) continue;
		const specifierIndex = node.specifiers.findIndex((s) => s.local.name === importName);
		if (specifierIndex > -1) {
			if (node.specifiers.length > 1) {
				const specifier = node.specifiers[specifierIndex];
				magicString.remove(specifier.start, specifier.end + 1);
				node.specifiers.splice(specifierIndex, 1);
			} else magicString.remove(node.start, node.end);
			return true;
		}
	}
	return false;
}
/**
* return the set of identifiers referenced inside the setup function and the ssrRender function.
* identifiers inside variable declarations are skipped, so a component's own declaration does not count as a reference.
* a component whose name is absent from this set is not used anywhere and can be removed.
*/
function getSetupReferencedNames(code, id) {
	const names = /* @__PURE__ */ new Set();
	parseAndWalk(code, id, function(node) {
		if (node.type === "Property" && node.key.type === "Identifier" && node.value.type === "FunctionExpression" && node.key.name === "setup" || node.type === "FunctionDeclaration" && (node.id?.name === "_sfc_ssrRender" || node.id?.name === "ssrRender")) walk(node, { enter(node) {
			if (node.type === "VariableDeclaration") this.skip();
			else if (node.type === "Identifier") names.add(node.name);
			else if (node.type === "MemberExpression") {
				if (node.property.type === "Literal" && typeof node.property.value === "string") names.add(node.property.value);
				else if (node.property.type === "Identifier") names.add(node.property.name);
			}
		} });
	});
	return names;
}
/**
* retrieve the component identifier being used on ssrRender callExpression
* @param ssrRenderNode - ssrRender callExpression
*/
function getComponentName(ssrRenderNode) {
	const componentCall = ssrRenderNode.arguments[0];
	if (!componentCall) return;
	if (componentCall.type === "Identifier") return componentCall.name;
	else if (componentCall.type === "MemberExpression") {
		if (componentCall.property.type === "Literal") return componentCall.property.value;
	} else if (componentCall.type === "CallExpression") return getComponentName(componentCall);
}
/**
* remove a variable declaration within the code
*/
function removeVariableDeclarator(codeAst, name, magicString, removedNodes) {
	walk(codeAst, { enter(node) {
		if (node.type !== "VariableDeclaration") return;
		for (const declarator of node.declarations) {
			const toRemove = findMatchingPatternToRemove(declarator.id, node, name, removedNodes);
			if (toRemove) {
				magicString.remove(toRemove.start, toRemove.end + 1);
				removedNodes.add(toRemove);
			}
		}
	} });
}
/**
* find the Pattern to remove which the identifier is equal to the name parameter.
*/
function findMatchingPatternToRemove(node, toRemoveIfMatched, name, removedNodeSet) {
	if (node.type === "Identifier") {
		if (node.name === name) return toRemoveIfMatched;
	} else if (node.type === "ArrayPattern") {
		const elements = node.elements.filter((e) => e !== null && !removedNodeSet.has(e));
		for (const element of elements) {
			const matched = findMatchingPatternToRemove(element, elements.length > 1 ? element : toRemoveIfMatched, name, removedNodeSet);
			if (matched) return matched;
		}
	} else if (node.type === "ObjectPattern") {
		const properties = node.properties.filter((e) => e.type === "Property" && !removedNodeSet.has(e));
		for (const [index, property] of properties.entries()) {
			let nodeToRemove = property;
			if (properties.length < 2) nodeToRemove = toRemoveIfMatched;
			const matched = findMatchingPatternToRemove(property.value, nodeToRemove, name, removedNodeSet);
			if (matched) {
				if (matched === property) properties.splice(index, 1);
				return matched;
			}
		}
	} else if (node.type === "AssignmentPattern") {
		const matched = findMatchingPatternToRemove(node.left, toRemoveIfMatched, name, removedNodeSet);
		if (matched) return matched;
	}
}
//#endregion
//#region src/components/plugins/component-names.ts
const FILENAME_RE = /([^/\\]+)\.\w+$/;
/**
* Set the default name of components to their PascalCase name
*/
const ComponentNamePlugin = (options) => createUnplugin(() => {
	return {
		name: "nuxt:component-name-plugin",
		enforce: "post",
		transformInclude(id) {
			/* v8 ignore next 2 */
			return isVue(id) || !!id.match(SX_RE);
		},
		transform: {
			filter: { id: { include: FILENAME_RE } },
			handler(code, id, meta) {
				const filename = id.match(FILENAME_RE)?.[1];
				if (!filename) return;
				const component = options.getComponents().find((c) => c.filePath === id);
				if (!component) return;
				const NAME_RE = new RegExp(`__name:\\s*['"]${filename}['"]`);
				const s = rolldownString(code, id, meta);
				const nameMatch = NAME_RE.exec(code);
				if (nameMatch) s.overwrite(nameMatch.index, nameMatch.index + nameMatch[0].length, `__name: ${JSON.stringify(component.pascalName)}`);
				if (!nameMatch) parseAndWalk(code, id, function(node) {
					if (node.type !== "ExportDefaultDeclaration") return;
					const { start, end } = node.declaration;
					s.overwrite(start, end, `Object.assign(${code.slice(start, end)}, { __name: ${JSON.stringify(component.pascalName)} })`);
					this.skip();
				});
				return generateTransform(s, id);
			}
		}
	};
});
//#endregion
//#region src/components/plugins/lazy-hydration-transform.ts
const SCRIPT_RE$2 = /(?<=<script[^>]*>)[\s\S]*?(?=<\/script>)/gi;
const TEMPLATE_RE = /<template>([\s\S]*)<\/template>/;
const hydrationStrategyMap = {
	hydrateOnIdle: "Idle",
	hydrateOnVisible: "Visible",
	hydrateOnInteraction: "Interaction",
	hydrateOnMediaQuery: "MediaQuery",
	hydrateAfter: "Time",
	hydrateWhen: "If",
	hydrateNever: "Never"
};
const TEMPLATE_WITH_LAZY_HYDRATION_RE = /<template>[\s\S]*\b(?:hydrate-on-idle|hydrateOnIdle|hydrate-on-visible|hydrateOnVisible|hydrate-on-interaction|hydrateOnInteraction|hydrate-on-media-query|hydrateOnMediaQuery|hydrate-after|hydrateAfter|hydrate-when|hydrateWhen|hydrate-never|hydrateNever)\b[\s\S]*<\/template>/;
const LazyHydrationTransformPlugin = (options) => createUnplugin(() => {
	const exclude = options.transform?.exclude || [];
	const include = options.transform?.include || [];
	const nuxt = tryUseNuxt();
	return {
		name: "nuxt:components-loader-pre",
		enforce: "pre",
		transformInclude(id) {
			if (exclude.some((pattern) => pattern.test(id))) return false;
			if (include.some((pattern) => pattern.test(id))) return true;
			return isVue(id);
		},
		transform: {
			filter: { code: { include: TEMPLATE_WITH_LAZY_HYDRATION_RE } },
			async handler(code, id, meta) {
				const { 0: template, index: offset = 0 } = code.match(TEMPLATE_RE) || {};
				if (!template) return;
				try {
					const ast = parse$1(template);
					const scopeTracker = new ScopeTracker({ preserveExitedScopes: true });
					for (const { 0: script } of code.matchAll(SCRIPT_RE$2)) {
						if (!script) continue;
						try {
							parseAndWalk(script, id, { scopeTracker });
						} catch {}
					}
					const s = rolldownString(code, id, meta);
					const components = new Set(options.getComponents().map((c) => c.pascalName));
					await walk$1(ast, (node) => {
						if (node.type !== 1) return;
						if (scopeTracker.getDeclaration(node.name)) return;
						const pascalName = pascalCase(node.name.replace(/^(?:Lazy|lazy-)/, ""));
						if (!components.has(pascalName)) return;
						let strategy;
						for (const attr in node.attributes) {
							const isDynamic = attr.startsWith(":");
							const prop = camelCase(isDynamic ? attr.slice(1) : attr);
							if (prop in hydrationStrategyMap) if (strategy) componentDiagnostics.NUXT_B3005({
								component: node.name,
								file: id
							});
							else strategy = hydrationStrategyMap[prop];
						}
						if (strategy && !/^(?:Lazy|lazy-)/.test(node.name)) {
							if (node.name !== "template" && (nuxt?.options.dev || nuxt?.options.test)) {
								const relativePath = resolveToAlias(id, nuxt);
								componentDiagnostics.NUXT_B3006({
									component: node.name,
									file: relativePath,
									lazyName: `Lazy${pascalCase(node.name)}`
								});
							}
							return;
						}
						if (strategy) {
							const newName = "Lazy" + strategy + pascalName;
							const chunk = template.slice(node.loc[0].start, node.loc.at(-1).end);
							const chunkOffset = node.loc[0].start + offset;
							const { 0: startingChunk, index: startingPoint = 0 } = chunk.match(new RegExp(`<${node.name}[^>]*>`)) || {};
							s.overwrite(startingPoint + chunkOffset, startingPoint + chunkOffset + startingChunk.length, startingChunk.replace(node.name, newName));
							const { 0: endingChunk, index: endingPoint } = chunk.match(new RegExp(`<\\/${node.name}[^>]*>$`)) || {};
							if (endingChunk && endingPoint) s.overwrite(endingPoint + chunkOffset, endingPoint + chunkOffset + endingChunk.length, endingChunk.replace(node.name, newName));
						}
					});
					return generateTransform(s, id);
				} catch {}
			}
		}
	};
});
//#endregion
//#region src/components/plugins/lazy-hydration-macro-transform.ts
const LAZY_HYDRATION_MACRO_RE = /\bdefineLazyHydrationComponent\s*\(/;
const HYDRATION_TO_FACTORY = /* @__PURE__ */ new Map([
	["visible", "createLazyVisibleComponent"],
	["idle", "createLazyIdleComponent"],
	["interaction", "createLazyInteractionComponent"],
	["mediaQuery", "createLazyMediaQueryComponent"],
	["if", "createLazyIfComponent"],
	["time", "createLazyTimeComponent"],
	["never", "createLazyNeverComponent"]
]);
const LazyHydrationMacroTransformPlugin = (options) => createUnplugin(() => {
	const exclude = options.transform?.exclude || [];
	const include = options.transform?.include || [];
	return {
		name: "nuxt:lazy-hydration-macro",
		enforce: "post",
		transformInclude(id) {
			if (exclude.some((pattern) => pattern.test(id))) return false;
			if (include.some((pattern) => pattern.test(id))) return true;
			return isVue(id, { type: ["template", "script"] }) || isJS(id);
		},
		transform: {
			filter: { code: { include: LAZY_HYDRATION_MACRO_RE } },
			handler(code, id, meta) {
				const s = rolldownString(code, id, meta);
				const names = /* @__PURE__ */ new Set();
				const edits = [];
				parseAndWalk(code, id, (node, parent) => {
					if (node.type !== "CallExpression") return;
					if (node.callee?.type !== "Identifier") return;
					if (node.callee.name !== "defineLazyHydrationComponent") return;
					if (parent?.type !== "VariableDeclarator") return;
					if (parent.id.type !== "Identifier") return;
					if (node.arguments.length < 2) return;
					const [strategyArgument, loaderArgument] = node.arguments;
					if (!isStringLiteral(strategyArgument)) return;
					const strategy = strategyArgument.value;
					const functionName = HYDRATION_TO_FACTORY.get(strategy);
					if (!functionName) return;
					if (loaderArgument?.type !== "ArrowFunctionExpression") return;
					const { importExpression, importLiteral } = findImportExpression(loaderArgument.body);
					if (!importExpression || !isStringLiteral(importLiteral)) return;
					const rawPath = importLiteral.value;
					const filePath = resolveAlias$1(rawPath, options.alias || {});
					const relativePath = relative(options.srcDir, filePath);
					const originalLoader = code.slice(loaderArgument.start, loaderArgument.end);
					const replacement = `__${functionName}(${JSON.stringify(relativePath)}, ${originalLoader})`;
					edits.push({
						start: node.start,
						end: node.end,
						replacement
					});
					names.add(functionName);
				});
				for (const edit of edits) s.overwrite(edit.start, edit.end, edit.replacement);
				if (names.size) {
					const imports = genImport(options.clientDelayedComponentRuntime, [...names].map((name) => ({
						name,
						as: `__${name}`
					})));
					s.prepend(imports);
				}
				return generateTransform(s, id);
			}
		}
	};
});
function isStringLiteral(node) {
	return !!node && node.type === "Literal" && typeof node.value === "string";
}
function findImportExpression(node) {
	if (node.type === "ImportExpression") return {
		importExpression: node,
		importLiteral: node.source
	};
	if (node.type === "BlockStatement") {
		const returnStmt = node.body.find((stmt) => stmt.type === "ReturnStatement");
		if (returnStmt && returnStmt.argument) return findImportExpression(returnStmt.argument);
		return {};
	}
	if (node.type === "ParenthesizedExpression") return findImportExpression(node.expression);
	if (node.type === "AwaitExpression") return findImportExpression(node.argument);
	if (node.type === "ConditionalExpression") return findImportExpression(node.consequent) || findImportExpression(node.alternate);
	if (node.type === "MemberExpression") return findImportExpression(node.object);
	if (node.type === "CallExpression") return findImportExpression(node.callee);
	return {};
}
//#endregion
//#region src/components/module.ts
const isPureObjectOrString = (val) => !Array.isArray(val) && typeof val === "object" || typeof val === "string";
const SLASH_SEPARATOR_RE = /[\\/]/;
/**
* Compare two directory entries by the number of path segments.
*
* Returns a sort comparator value based on the count of path segments (split on slashes). Deeper (more segments) paths are ordered before shallower ones.
*
* @param dirA - First directory
* @param dirA.path - Path string
* @param dirB - Second directory
* @param dirB.path - Path string
* @returns A negative number if the first directory should come before the second, positive if after, or 0 if equal
*/
function compareDirByPathLength({ path: pathA }, { path: pathB }) {
	return pathB.split(SLASH_SEPARATOR_RE).filter(Boolean).length - pathA.split(SLASH_SEPARATOR_RE).filter(Boolean).length;
}
const DEFAULT_COMPONENTS_DIRS_RE = /\/components(?:\/(?:global|islands))?$/;
const STARTER_DOT_RE = /^\./g;
var module_default$2 = defineNuxtModule({
	meta: {
		name: "nuxt:components",
		configKey: "components"
	},
	defaults: { dirs: [] },
	async setup(moduleOptions, nuxt) {
		let componentDirs = [];
		const context = { components: [] };
		const getComponents = (mode) => {
			return mode && mode !== "all" ? context.components.filter((c) => c.mode === mode || c.mode === "all" || c.mode === "server" && !context.components.some((otherComponent) => otherComponent.mode !== "server" && otherComponent.pascalName === c.pascalName)) : context.components;
		};
		if (nuxt.options.experimental.normalizeComponentNames) addBuildPlugin(ComponentNamePlugin({ getComponents }));
		nuxt.hook("app:resolve", async () => {
			const allDirs = [];
			const layerCount = nuxt.options._layers.length;
			for (const [i, layer] of nuxt.options._layers.entries()) {
				const priority = layerCount - i;
				const layerDirs = normalizeDirs(layer.config.components, layer.config.srcDir, { priority });
				allDirs.push(...layerDirs);
			}
			await nuxt.callHook("components:dirs", allDirs);
			const userComponentDirs = [];
			const libraryComponentDirs = [];
			for (const dir of allDirs) {
				if (!isPureObjectOrString(dir)) continue;
				const dirOptions = typeof dir === "object" ? dir : { path: dir };
				const dirPath = resolveAlias(dirOptions.path);
				const extensions = (dirOptions.extensions || nuxt.options.extensions).map((e) => e.replace(STARTER_DOT_RE, ""));
				const _transpile = typeof dirOptions.transpile === "boolean" ? dirOptions.transpile : "auto";
				const transpile = _transpile === "auto" ? dirPath.includes("node_modules") : _transpile;
				if (transpile) nuxt.options.build.transpile.push(dirPath);
				if (!isDirectorySync(dirPath) && !DEFAULT_COMPONENTS_DIRS_RE.test(dirOptions.path)) componentDiagnostics.NUXT_B3001({ dirPath });
				const inNodeModules = dirPath.includes("node_modules");
				if (nuxt.options.dev && dirOptions.watch !== false && !inNodeModules) {
					if (!getLayerDirectories(nuxt).some((dirs) => dirPath === dirs.app.replace(/\/$/, "") || dirPath.startsWith(dirs.app)) && !nuxt.options.watch.includes(dirPath)) nuxt.options.watch.push(dirPath);
				}
				(inNodeModules ? libraryComponentDirs : userComponentDirs).push({
					global: moduleOptions.global,
					...dirOptions,
					path: dirPath,
					extensions,
					pattern: dirOptions.pattern || (extensions.length > 1 ? `**/*.{${extensions.join(",")}}` : `**/*.${extensions[0] || "*"}`),
					ignore: [
						"**/*{M,.m,-m}ixin.{js,ts,jsx,tsx}",
						`**/*.{${DECLARATION_EXTENSIONS.join(",")},}`,
						...dirOptions.ignore || []
					],
					transpile
				});
			}
			componentDirs = [...userComponentDirs, ...libraryComponentDirs];
		});
		addTemplate(componentsDeclarationTemplate);
		addTypeTemplate(componentsTypeTemplate);
		addPluginTemplate(componentsPluginTemplate);
		addTemplate(componentNamesTemplate);
		addTemplate(componentsIslandsTemplate);
		if (moduleOptions.generateMetadata) addTemplate(componentsMetadataTemplate);
		const serverComponentRuntime = await findPath(join(distDir, "components/runtime/server-component")) ?? join(distDir, "components/runtime/server-component");
		addBuildPlugin(TransformPlugin$1(nuxt, {
			getComponents,
			serverComponentRuntime,
			mode: "server"
		}), {
			server: true,
			client: false
		});
		addBuildPlugin(TransformPlugin$1(nuxt, {
			getComponents,
			serverComponentRuntime,
			mode: "client"
		}), {
			server: false,
			client: true
		});
		nuxt.hook("build:manifest", (manifest) => {
			const sourceFiles = /* @__PURE__ */ new Set();
			for (const c of getComponents()) if (c.global) sourceFiles.add(relative(nuxt.options.srcDir, c.filePath));
			for (const chunk of Object.values(manifest)) if (chunk.isEntry) chunk.dynamicImports = chunk.dynamicImports?.filter((i) => !sourceFiles.has(i));
		});
		const restartEvents = /* @__PURE__ */ new Set(["addDir", "unlinkDir"]);
		nuxt.hook("builder:watch", (event, relativePath) => {
			if (!restartEvents.has(event)) return;
			const path = resolve(nuxt.options.srcDir, relativePath);
			if (componentDirs.some((dir) => dir.path === path)) {
				logger.info(`Directory \`${relativePath}/\` ${event === "addDir" ? "created" : "removed"}`);
				return nuxt.callHook("restart");
			}
		});
		const serverPlaceholderPath = await findPath(join(distDir, "app/components/server-placeholder")) ?? join(distDir, "app/components/server-placeholder");
		const scannedStructureVersions = /* @__PURE__ */ new WeakMap();
		nuxt.hook("app:templates", async (app) => {
			const structureVersion = getAppStructureVersion(nuxt);
			if (nuxt.options.dev && context.components && scannedStructureVersions.get(nuxt) === structureVersion) {
				app.components = context.components;
				return;
			}
			const newComponents = await scanComponents(componentDirs, nuxt.options.srcDir);
			await nuxt.callHook("components:extend", newComponents);
			const modesByName = /* @__PURE__ */ new Map();
			for (const component of newComponents) {
				let modes = modesByName.get(component.pascalName);
				if (!modes) {
					modes = /* @__PURE__ */ new Set();
					modesByName.set(component.pascalName, modes);
				}
				modes.add(component.mode);
			}
			for (const component of newComponents) {
				if (!component._scanned && !(component.filePath in nuxt.vfs) && isAbsolute(component.filePath) && !existsSync(component.filePath)) component.filePath = resolveModulePath(resolveAlias(component.filePath), {
					try: true,
					extensions: nuxt.options.extensions
				}) ?? component.filePath;
				if (component.mode === "client" && !modesByName.get(component.pascalName)?.has("server")) {
					newComponents.push({
						...component,
						_raw: true,
						mode: "server",
						filePath: serverPlaceholderPath,
						chunkName: "components/" + component.kebabName
					});
					modesByName.get(component.pascalName).add("server");
				}
				if (component.mode === "server" && !nuxt.options.ssr && !modesByName.get(component.pascalName)?.has("client")) componentDiagnostics.NUXT_B3002({ component: component.pascalName });
			}
			context.components = newComponents;
			app.components = newComponents;
			scannedStructureVersions.set(nuxt, structureVersion);
		});
		nuxt.hook("prepare:types", ({ tsConfig }) => {
			tsConfig.compilerOptions.paths["#components"] = [resolve(nuxt.options.buildDir, "components")];
		});
		addBuildPlugin(TreeShakeTemplatePlugin({ getComponents }), { client: false });
		const sharedLoaderOptions = {
			getComponents,
			clientDelayedComponentRuntime: await findPath(join(distDir, "components/runtime/lazy-hydrated-component")) ?? join(distDir, "components/runtime/lazy-hydrated-component"),
			serverComponentRuntime,
			srcDir: nuxt.options.srcDir,
			transform: typeof nuxt.options.components === "object" && !Array.isArray(nuxt.options.components) ? nuxt.options.components.transform : void 0,
			experimentalComponentIslands: !!nuxt.options.experimental.componentIslands
		};
		addBuildPlugin(LoaderPlugin({
			...sharedLoaderOptions,
			mode: "client"
		}), { server: false });
		addBuildPlugin(LoaderPlugin({
			...sharedLoaderOptions,
			mode: "server"
		}), { client: false });
		if (nuxt.options.experimental.lazyHydration) {
			addBuildPlugin(LazyHydrationTransformPlugin({ ...sharedLoaderOptions }), { prepend: true });
			addBuildPlugin(LazyHydrationMacroTransformPlugin({
				...sharedLoaderOptions,
				alias: nuxt.options.alias
			}));
			addImportsSources(lazyHydrationMacroPreset);
		}
		if (nuxt.options.experimental.componentIslands) {
			const selectiveClient = typeof nuxt.options.experimental.componentIslands === "object" && nuxt.options.experimental.componentIslands.selectiveClient;
			addVitePlugin({
				name: "nuxt-server-component-hmr",
				handleHotUpdate(ctx) {
					const components = getComponents();
					const filePath = normalize(ctx.file);
					const comp = components.find((c) => c.filePath === filePath);
					if (comp?.mode === "server") ctx.server.ws.send({
						event: `nuxt-server-component:${comp.pascalName}`,
						type: "custom"
					});
				}
			}, { server: false });
			function getServerPages() {
				const paths = [];
				function visit(pages) {
					for (const page of pages) {
						if (page.mode === "server" && page.file) paths.push(normalize(page.file));
						if (page.children?.length) visit(page.children);
					}
				}
				for (const app of Object.values(nuxt.apps)) if (app.pages) visit(app.pages);
				return paths;
			}
			addBuildPlugin(IslandsTransformPlugin({
				getComponents,
				getServerPages,
				selectiveClient
			}), {
				client: false,
				prepend: true
			});
			if (selectiveClient && nuxt.options.builder === "@nuxt/vite-builder") addVitePlugin(() => ComponentsChunkPlugin({
				dev: nuxt.options.dev,
				getComponents
			}));
			else addTemplate({
				filename: "component-chunk.mjs",
				getContents: () => `export default {}`
			});
		}
	}
});
/**
* Normalize the various user-provided `components.dirs` shapes into a flat array of ComponentsDir entries.
*
* Handles:
* - Arrays (recursively flattened and sorted by path depth),
* - `true`/`undefined` (returns default islands, global, and components dirs under `cwd`),
* - Strings (resolved against `cwd` and alias resolution),
* - Objects (either a single dir shape or an object with a `dirs` array).
*
* Each resulting entry has its `path` resolved via `resolveAlias` and `cwd`, receives a `priority` from `options.priority` (default 0), and entries without a `path` are skipped. The final list is sorted by path depth (shallowest first).
*
* @param dir - The raw `dirs` configuration value (single entry, array, true/undefined for defaults, or an options object).
* @param cwd - Base directory used to resolve relative `path` values.
* @param options - Optional settings; currently supports `priority` to assign a priority to all returned entries.
* @param options.priority - Priority number to assign to all returned entries (default 0).
* @returns A normalized, flat, and sorted array of ComponentsDir objects ready for component scanning.
*/
function normalizeDirs(dir, cwd, options) {
	if (Array.isArray(dir)) return dir.map((dir) => normalizeDirs(dir, cwd, options)).flat().sort(compareDirByPathLength);
	if (dir === true || dir === void 0) return [
		{
			priority: options?.priority || 0,
			path: resolve(cwd, "components/islands"),
			island: true
		},
		{
			priority: options?.priority || 0,
			path: resolve(cwd, "components/global"),
			global: true
		},
		{
			priority: options?.priority || 0,
			path: resolve(cwd, "components")
		}
	];
	if (typeof dir === "string") return [{
		priority: options?.priority || 0,
		path: resolve(cwd, resolveAlias(dir))
	}];
	if (!dir) return [];
	const normalizedDirs = [];
	for (const d of "dirs" in dir ? dir.dirs || [] : [dir]) {
		const normalizedDir = typeof d === "string" ? { path: d } : d;
		if (!normalizedDir.path) continue;
		normalizedDirs.push({
			priority: options?.priority || 0,
			...normalizedDir,
			path: resolve(cwd, resolveAlias(normalizedDir.path))
		});
	}
	return normalizedDirs.sort(compareDirByPathLength);
}
//#endregion
//#region src/imports/transform.ts
const NODE_MODULES_RE = /[\\/]node_modules[\\/]/;
const IMPORTS_RE = /(['"])#imports\1/;
const TransformPlugin = ({ ctx, options, sourcemap }) => createUnplugin(() => {
	return {
		name: "nuxt:imports-transform",
		enforce: "post",
		transformInclude(id) {
			if (options.transform?.include?.some((pattern) => pattern.test(id))) return true;
			if (options.transform?.exclude?.some((pattern) => pattern.test(id))) return false;
			if (isVue(id, { type: ["script", "template"] })) return true;
			return isJS(id);
		},
		async transform(code, id) {
			id = normalize(id);
			const isNodeModule = NODE_MODULES_RE.test(id) && !options.transform?.include?.some((pattern) => pattern.test(id));
			if (isNodeModule && !IMPORTS_RE.test(code)) return;
			const { s, imports } = await ctx.injectImports(code, id, { autoImport: options.autoImport && !isNodeModule });
			if (imports.some((i) => i.from === "#app/composables/script-stubs") && tryUseNuxt()?.options.test === false) installNuxtModule("@nuxt/scripts");
			if (s.hasChanged()) return {
				code: s.toString(),
				map: sourcemap ? s.generateMap({ hires: true }) : void 0
			};
		}
	};
});
//#endregion
//#region src/imports/module.ts
const allNuxtPresets = [
	...pagesImportPresets,
	...routeRulesPresets,
	...defaultPresets
];
var module_default$1 = defineNuxtModule({
	meta: {
		name: "nuxt:imports",
		configKey: "imports"
	},
	defaults: (nuxt) => ({
		autoImport: true,
		scan: true,
		presets: defaultPresets,
		global: false,
		imports: [],
		dirs: [],
		transform: {
			include: [new RegExp("^" + escapeStringRegexp(nuxt.options.buildDir))],
			exclude: void 0
		},
		virtualImports: ["#imports"],
		polyfills: true
	}),
	setup(options, nuxt) {
		const presets = JSON.parse(JSON.stringify(options.presets));
		if (options.polyfills) presets.push(...appCompatPresets);
		let composablesDirs = [];
		if (options.scan) {
			for (const layer of nuxt.options._layers) {
				if (layer.config?.imports?.scan === false) continue;
				composablesDirs.push(resolve(layer.config.srcDir, "composables"), resolve(layer.config.srcDir, "utils"), resolve(layer.config.rootDir, layer.config.dir?.shared ?? "shared", "utils"), resolve(layer.config.rootDir, layer.config.dir?.shared ?? "shared", "types"));
				for (const dir of layer.config.imports?.dirs ?? []) if (dir) composablesDirs.push(resolve(layer.config.srcDir, resolveAlias(dir, nuxt.options.alias)));
			}
			nuxt.hook("modules:done", async () => {
				await nuxt.callHook("imports:dirs", composablesDirs);
				composablesDirs = composablesDirs.map((dir) => normalize(dir));
			});
			nuxt.hook("builder:watch", (event, relativePath) => {
				if (!["addDir", "unlinkDir"].includes(event)) return;
				const path = resolve(nuxt.options.srcDir, relativePath);
				if (composablesDirs.includes(path)) {
					logger.info(`Directory \`${relativePath}/\` ${event === "addDir" ? "created" : "removed"}`);
					return nuxt.callHook("restart");
				}
			});
		}
		let ctx;
		nuxt.hook("modules:done", async () => {
			await nuxt.callHook("imports:sources", presets);
			const { addons: inlineAddons, ...rest } = options;
			const [addons, addonsOptions] = Array.isArray(inlineAddons) ? [inlineAddons] : [[], inlineAddons];
			ctx = createUnimport({
				injectAtEnd: true,
				parser: "oxc",
				...rest,
				addons: {
					addons,
					vueTemplate: options.autoImport,
					vueDirectives: options.autoImport === false ? void 0 : true,
					...addonsOptions
				},
				presets
			});
			await nuxt.callHook("imports:context", ctx);
		});
		addTemplate({
			filename: "imports.mjs",
			getContents: async () => toExports(await ctx.getImports()) + "\nif (import.meta.dev) { console.warn(\"[nuxt] `#imports` should be transformed with real imports. There seems to be something wrong with the imports plugin.\") }"
		});
		nuxt.options.alias["#imports"] = join(nuxt.options.buildDir, "imports");
		addBuildPlugin(TransformPlugin({
			ctx: { injectImports: (code, id, options) => ctx.injectImports(code, id, options) },
			options,
			sourcemap: !!nuxt.options.sourcemap.server || !!nuxt.options.sourcemap.client
		}));
		const priorities = getLayerDirectories(nuxt).map((dirs, i) => [dirs.app, -i]).sort(([a], [b]) => b.length - a.length);
		const IMPORTS_TEMPLATE_RE = /\/imports\.(?:d\.ts|mjs)$/;
		function isImportsTemplate(template) {
			return IMPORTS_TEMPLATE_RE.test(template.filename);
		}
		const isIgnored = createIsIgnored(nuxt);
		const nuxtImportSources = new Set(allNuxtPresets.flatMap((i) => i.from));
		const nuxtImports = new Set(presets.flatMap((p) => nuxtImportSources.has(p.from) ? p.imports : []));
		const regenerateImports = async () => {
			await ctx.modifyDynamicImports(async (imports) => {
				imports.length = 0;
				if (options.scan) {
					const scannedImports = await scanDirExports(composablesDirs, { fileFilter: (file) => !isIgnored(file) });
					for (const i of scannedImports) i.priority ||= priorities.find(([dir]) => i.from.startsWith(dir))?.[1];
					imports.push(...scannedImports);
				}
				await nuxt.callHook("imports:extend", imports);
				for (const i of imports) if (!nuxtImportSources.has(i.from)) {
					const value = i.as || i.name;
					if (nuxtImports.has(value) && (!i.priority || i.priority >= 0)) {
						const relativePath = isAbsolute(i.from) ? `${resolveToAlias(i.from, nuxt)}` : i.from;
						headDiagnostics.NUXT_B6002({
							name: value,
							file: relativePath
						});
					}
				}
				return imports;
			});
			await updateTemplates({ filter: isImportsTemplate });
		};
		nuxt.hook("modules:done", () => regenerateImports());
		addDeclarationTemplates({
			generateTypeDeclarations: (options) => ctx.generateTypeDeclarations(options),
			getImports: () => ctx.getImports()
		}, options);
		nuxt.hook("builder:watch", async (_, relativePath) => {
			const path = resolve(nuxt.options.srcDir, relativePath);
			if (options.scan && composablesDirs.some((dir) => dir === path || path.startsWith(dir + "/"))) await regenerateImports();
		});
		nuxt.hook("app:templatesGenerated", async (_app, templates) => {
			if (templates.some((t) => !isImportsTemplate(t))) await regenerateImports();
		});
	}
});
function addDeclarationTemplates(ctx, options) {
	const nuxt = useNuxt();
	const resolvedImportPathMap = /* @__PURE__ */ new Map();
	const r = (i) => resolvedImportPathMap.get(i.typeFrom || i.from);
	const warnedUnresolvedSources = /* @__PURE__ */ new Set();
	const SUPPORTED_EXTENSION_RE = new RegExp(`\\.(?:${nuxt.options.extensions.map((i) => i.replace(".", "")).join("|")})$`);
	async function cacheImportPaths(imports) {
		const importSource = Array.from(new Set(imports.map((i) => i.typeFrom || i.from))).filter((from) => !resolvedImportPathMap.has(from) && !nuxt._dependencies?.has(from));
		const aliasedPaths = new Map(importSource.map((from) => [from, resolveAlias(from)]));
		const bareSpecifiers = importSource.filter((from) => !isAbsolute(aliasedPaths.get(from)));
		const resolved = new Map(await resolveTypePaths(bareSpecifiers, nuxt.options.modulesDir));
		for (const from of importSource) {
			if (warnedUnresolvedSources.has(from)) continue;
			const aliased = aliasedPaths.get(from);
			if (isAbsolute(aliased)) {
				if (!relative(nuxt.options.buildDir, aliased).startsWith("..") || resolveModulePath(aliased, {
					try: true,
					extensions: nuxt.options.extensions,
					suffixes: ["", "/index"]
				})) continue;
			} else if (resolved.has(from)) continue;
			warnedUnresolvedSources.add(from);
			const name = imports.find((i) => (i.typeFrom || i.from) === from);
			headDiagnostics.NUXT_B6005({
				name: name ? name.as || name.name : from,
				from
			});
		}
		await Promise.all(importSource.map(async (from) => {
			let path = aliasedPaths.get(from);
			if (!isAbsolute(path)) {
				const typePath = resolved.get(from);
				if (typePath && nuxt._dependencies?.has(packageName(from))) path = from;
				else path = typePath ?? path;
			}
			if (existsSync(path) && !await isDirectory(path)) {
				const declarationPath = await resolveDeclarationPath(path);
				path = declarationPath === path ? path.replace(SUPPORTED_EXTENSION_RE, "") : declarationPath;
			}
			if (isAbsolute(path)) path = relative(join(nuxt.options.buildDir, "types"), path);
			resolvedImportPathMap.set(from, path);
		}));
	}
	addTypeTemplate({
		filename: "imports.d.ts",
		getContents: async ({ nuxt }) => toExports(await ctx.getImports(), nuxt.options.buildDir, true, { declaration: true })
	});
	const GENERATED_BY_COMMENT = "// Generated by auto imports\n";
	const AUTO_IMPORTS_DISABLED_COMMENT = "// Implicit auto importing is disabled, you can explicitly import from `#imports` instead.\n";
	addTypeTemplate({
		filename: "types/imports.d.ts",
		getContents: async () => {
			await cacheImportPaths(await ctx.getImports());
			return GENERATED_BY_COMMENT + (options.autoImport ? await ctx.generateTypeDeclarations({ resolvePath: r }) : AUTO_IMPORTS_DISABLED_COMMENT);
		}
	});
	addTemplate({
		filename: "types/shared-imports.d.ts",
		getContents: async () => {
			if (!options.autoImport) return "// Generated by auto imports\n// Implicit auto importing is disabled, you can explicitly import from `#imports` instead.\n";
			const nitro = useNitro();
			const nuxtImports = await ctx.getImports();
			const nitroImports = await nitro.unimport?.getImports() ?? [];
			const nitroImportsByName = new Map(nitroImports.map((i) => [i.as || i.name, i]));
			const sharedImports = [];
			for (const i of nuxtImports) {
				const importName = i.as || i.name;
				const nitroImport = nitroImportsByName.get(importName);
				if (!nitroImport || i.dtsDisabled || nitroImport.dtsDisabled) continue;
				if (i.from !== nitroImport.from) continue;
				sharedImports.push(i);
			}
			await cacheImportPaths(sharedImports);
			const handCraftedDeclarations = `
  const useRuntimeConfig: (event?: import('h3').H3Event) => import('nuxt/schema').RuntimeConfig
  const useAppConfig: () => import('nuxt/schema').AppConfig
  const defineAppConfig: <C extends import('nuxt/schema').AppConfigInput>(config: C) => C
  const createError: typeof import('h3')['createError']
  const setResponseStatus: typeof import('h3')['setResponseStatus']`;
			const valueImports = sharedImports.filter((i) => !i.type);
			const typeImports = sharedImports.filter((i) => i.type);
			let dts = toTypeDeclarationFile(valueImports, { resolvePath: r }).replace(/^declare global \{$/m, `declare global {${handCraftedDeclarations}`);
			if (typeImports.length) dts += "\n" + toTypeReExports(typeImports, { resolvePath: r });
			return GENERATED_BY_COMMENT + dts;
		}
	});
}
//#endregion
//#region src/compiler/utils.ts
/**
* Creates a context object for scan plugins scoped to a specific file being scanned.
* All plugins scanning this file will share the same context instance.
*/
function createScanPluginContext(code, filePath) {
	let parseResult = null;
	let parsedStaticImports = null;
	return {
		walkParsed: (...args) => {
			if (parseResult) {
				const options = typeof args[0] === "function" ? { enter: args[0] } : args[0];
				walk(parseResult.program, options);
				return parseResult;
			}
			parseResult = parseAndWalk.call(null, code, filePath, args[0]);
			return parseResult;
		},
		getParsedStaticImports: () => {
			if (parsedStaticImports) return parsedStaticImports;
			parsedStaticImports = findStaticImports(code).map((i) => parseStaticImport(i));
			return parsedStaticImports;
		}
	};
}
function matchWithStringOrRegex(value, matcher) {
	if (typeof matcher === "string") return value === matcher;
	else if (matcher instanceof RegExp) return matcher.test(value);
	return false;
}
//#endregion
//#region src/core/utils/parse-utils.ts
function processImports(imports, alias) {
	/**
	* import alias -> original name; source with aliases resolved and without extension
	*/
	const directImports = /* @__PURE__ */ new Map();
	/**
	* import source with aliases resolved and without extension -> set of namespaces from that source
	*/
	const namespaces = /* @__PURE__ */ new Map();
	for (const i of imports) {
		const resolvedSpecifier = stripExtension(resolveAlias(i.specifier, alias));
		const namedImports = i.namedImports ?? {};
		for (const originalIdentifier in namedImports) {
			const localIdentifier = namedImports[originalIdentifier] || originalIdentifier;
			directImports.set(localIdentifier, {
				originalName: originalIdentifier,
				source: resolvedSpecifier
			});
		}
		if (i.namespacedImport || i.defaultImport) {
			if (!namespaces.has(resolvedSpecifier)) namespaces.set(resolvedSpecifier, { namespaces: /* @__PURE__ */ new Set() });
		}
		if (i.defaultImport) {
			const namespace = i.defaultImport;
			namespaces.get(resolvedSpecifier).namespaces.add(namespace);
			directImports.set(i.defaultImport, {
				originalName: "default",
				source: resolvedSpecifier
			});
		} else if (i.namespacedImport) {
			const namespace = i.namespacedImport;
			namespaces.get(resolvedSpecifier).namespaces.add(namespace);
		}
	}
	return {
		directImports,
		namespaces
	};
}
/**
* Checks if a node is a statically analyzable function call matching the given filter and returns parsed metadata about it.
*
* This is meant to statically identify functions and their origin in combination with scope tracking & imports analysis.
* @param node The AST node to check.
* @param filter A regular expression to match the function name.
* @returns An object containing the metadata about the function call, or null if it doesn't match.
*/
function parseStaticFunctionCall(node, filter) {
	const callExpression = node.type === "CallExpression" ? node : node.type === "ChainExpression" && node.expression.type === "CallExpression" ? node.expression : null;
	if (!callExpression) return null;
	let functionName;
	let identifierNode;
	if (callExpression.callee.type === "Identifier") {
		functionName = callExpression.callee.name;
		identifierNode = callExpression.callee;
	} else if (callExpression.callee.type === "ParenthesizedExpression") {
		if (callExpression.callee.expression.type === "Identifier") {
			functionName = callExpression.callee.expression.name;
			identifierNode = callExpression.callee;
		} else if ((callExpression.callee.expression.type === "TSAsExpression" || callExpression.callee.expression.type === "TSTypeAssertion" || callExpression.callee.expression.type === "TSNonNullExpression") && callExpression.callee.expression.expression.type === "Identifier") {
			functionName = callExpression.callee.expression.expression.name;
			identifierNode = callExpression.callee;
		}
	}
	if (functionName && identifierNode && filter.test(functionName)) return {
		name: functionName,
		namespace: null,
		node: identifierNode,
		callExpression
	};
	function getParsedMemberExpression(memberExpression) {
		let memberObjectName;
		if (memberExpression.object.type === "Identifier") memberObjectName = memberExpression.object.name;
		else if (memberExpression.object.type === "ParenthesizedExpression") {
			if (memberExpression.object.expression.type === "Identifier") memberObjectName = memberExpression.object.expression.name;
			else if ((memberExpression.object.expression.type === "TSAsExpression" || memberExpression.object.expression.type === "TSTypeAssertion" || memberExpression.object.expression.type === "TSNonNullExpression") && memberExpression.object.expression.expression.type === "Identifier") memberObjectName = memberExpression.object.expression.expression.name;
		}
		if (memberObjectName) {
			if (memberExpression.property.type === "Identifier" && filter.test(memberExpression.property.name)) return {
				name: memberExpression.property.name,
				namespace: memberObjectName,
				node: memberExpression.property
			};
			if (memberExpression.property.type === "Literal" && typeof memberExpression.property.value === "string" && filter.test(memberExpression.property.value)) return {
				name: memberExpression.property.value,
				namespace: memberObjectName,
				node: memberExpression
			};
		}
		return null;
	}
	if (callExpression.callee.type === "MemberExpression") {
		const val = getParsedMemberExpression(callExpression.callee);
		if (val) return {
			...val,
			callExpression
		};
	} else if (callExpression.callee.type === "ParenthesizedExpression") {
		let innerExpression = callExpression.callee.expression;
		if (innerExpression.type === "TSAsExpression" || innerExpression.type === "TSTypeAssertion" || innerExpression.type === "TSNonNullExpression") innerExpression = innerExpression.expression;
		if (innerExpression.type === "MemberExpression") {
			const val = getParsedMemberExpression(innerExpression);
			if (val) return {
				...val,
				node: callExpression.callee,
				callExpression
			};
		}
	}
	return null;
}
/**
* Parses static export declarations to extract local and exported identifiers.
* Considers only runtime value exports (not types).
*
* Doesn't handle barrel exports, destructured exports, literals in export names, etc.
*
* @example
* ```ts
* export const foo = 1 // { localName: 'foo', exportedName: 'foo' }
* export function bar() {} // { localName: 'bar', exportedName: 'bar' }
* export class Baz {} // { localName: 'Baz', exportedName: 'Baz' }
* export { foo } // { localName: 'foo', exportedName: 'foo' }
* export { foo as bar } // { localName: 'foo', exportedName: 'bar' }
* export default function foo() {} // { localName: 'foo', exportedName: 'default' }
* export default class Bar {} // { localName: 'Bar', exportedName: 'default' }
* ```
* @param node the export declaration node to parse
* @param filter optional regex to filter based on exported names
*/
function parseStaticExportIdentifiers(node, filter) {
	if (node.type === "ExportNamedDeclaration" && node.exportKind !== "type") {
		if (node.declaration?.type === "VariableDeclaration") return node.declaration.declarations.map((d) => {
			if (d.id.type === "Identifier" && (!filter || filter.test(d.id.name))) return {
				localName: d.id.name,
				exportedName: d.id.name
			};
			return null;
		}).filter((v) => !!v);
		if (node.declaration?.type === "FunctionDeclaration") {
			if (node.declaration.id?.type === "Identifier" && (!filter || filter.test(node.declaration.id.name))) return [{
				localName: node.declaration.id.name,
				exportedName: node.declaration.id.name
			}];
			return [];
		}
		if (node.declaration?.type === "ClassDeclaration") {
			if (node.declaration.id?.type === "Identifier" && (!filter || filter.test(node.declaration.id.name))) return [{
				localName: node.declaration.id.name,
				exportedName: node.declaration.id.name
			}];
			return [];
		}
		if (node.specifiers && node.specifiers.length) return node.specifiers.map((s) => {
			if (s.exported.type === "Identifier" && s.exportKind !== "type" && s.local.type === "Identifier" && (!filter || filter.test(s.exported.name))) return {
				localName: s.local.name,
				exportedName: s.exported.name
			};
			return null;
		}).filter((v) => !!v);
		return [];
	}
	if (node.type === "ExportDefaultDeclaration" && (!node.exportKind || node.exportKind === "value")) {
		if (node.declaration.type === "Identifier") return [{
			localName: node.declaration.name,
			exportedName: "default"
		}];
		if (node.declaration.type === "FunctionDeclaration") {
			if (node.declaration.id?.type === "Identifier") return [{
				localName: node.declaration.id.name,
				exportedName: "default"
			}];
			return [];
		}
		if (node.declaration.type === "ClassDeclaration") {
			if (node.declaration.id?.type === "Identifier") return [{
				localName: node.declaration.id.name,
				exportedName: "default"
			}];
			return [];
		}
	}
	if (node.type === "TSExportAssignment") {
		if (node.expression.type === "Identifier") {
			if (!filter || filter.test(node.expression.name)) return [{
				localName: node.expression.name,
				exportedName: "default"
			}];
		}
	}
	return [];
}
//#endregion
//#region src/compiler/plugins/keyed-function-factories.ts
/**
* Check if the node is a named export of a keyed function factory, and if so,
* return its VariableDeclarator node.
*/
function parseKeyedFunctionFactory(node, filter, scopeTracker) {
	if (node.type === "ExportNamedDeclaration") {
		const parsed = [];
		function processVariableDeclarator(node) {
			if (node.init?.type !== "CallExpression" && node.init?.type !== "ChainExpression") return;
			const functionCallMeta = parseStaticFunctionCall(node.init, filter);
			if (functionCallMeta && node?.id.type === "Identifier") parsed.push({
				factoryName: functionCallMeta.name,
				factoryNode: functionCallMeta.node,
				functionName: node.id.name,
				namespace: functionCallMeta.namespace
			});
		}
		if (node.declaration?.type === "VariableDeclaration") for (const d of node.declaration.declarations) processVariableDeclarator(d);
		else if (node.specifiers.length) for (const specifier of node.specifiers) {
			if (specifier.type !== "ExportSpecifier" || specifier.exported.type !== "Identifier" || specifier.local.type !== "Identifier") continue;
			const declaration = scopeTracker.getDeclaration(specifier.local.name);
			if (declaration?.type !== "Variable") continue;
			for (const d of declaration.variableNode.declarations) processVariableDeclarator(d);
		}
		return parsed;
	}
	if (node.type === "ExportDefaultDeclaration" && node.declaration.type === "CallExpression") {
		const functionCallMeta = parseStaticFunctionCall(node.declaration, filter);
		if (functionCallMeta) return [{
			factoryName: functionCallMeta.name,
			factoryNode: functionCallMeta.node,
			functionName: "default",
			namespace: functionCallMeta.namespace
		}];
		return [];
	}
	return [];
}
/**
* @param filePath
* @param scopeTracker
* @param namesToFactoryMeta - map of factory function names to their metadata; it is expected that the `source`s have had their aliases resolved and are without extensions
* @param imports
* @param autoImportsToSources
* @param alias
*/
function createFactoryProcessor(filePath, scopeTracker, namesToFactoryMeta, imports, autoImportsToSources, alias) {
	const { directImports, namespaces } = processImports(imports, alias);
	const localFactoryNames = new Set(namesToFactoryMeta.keys());
	for (const [localName, directImport] of directImports) if (namesToFactoryMeta.has(directImport.originalName)) localFactoryNames.add(localName);
	const LOCAL_FACTORY_NAMES_RE = new RegExp(`\\b(${[...localFactoryNames].map((f) => escapeStringRegexp(f)).join("|")})\\b`);
	function _resolvePath(path) {
		let p = path;
		if (isAbsolute(p)) return p;
		p = resolveAlias(p, alias);
		if (isAbsolute(p)) return p;
		return join(parse(filePath).dir, p);
	}
	function getFactoryByLocalName(localName) {
		if (!localName) return;
		const directImport = directImports.get(localName);
		if (directImport) return namesToFactoryMeta.get(directImport.originalName);
		return namesToFactoryMeta.get(localName);
	}
	function processFactory(walkContext, node, handler) {
		const parsedFactoryCalls = parseKeyedFunctionFactory(node, LOCAL_FACTORY_NAMES_RE, scopeTracker);
		if (!parsedFactoryCalls.length) return;
		for (const parsedFactoryCall of parsedFactoryCalls) {
			const factoryMeta = getFactoryByLocalName(parsedFactoryCall.factoryName);
			if (!factoryMeta) {
				buildDiagnostics.NUXT_B1008({
					function: parsedFactoryCall.functionName,
					file: filePath
				});
				continue;
			}
			const scopeTrackerNode = scopeTracker.getDeclaration(!parsedFactoryCall.namespace ? parsedFactoryCall.factoryName : parsedFactoryCall.namespace);
			function isFactoryImport(node) {
				return node?.type === "Import" && node.importNode.importKind !== "type";
			}
			let importSourceResolved;
			if (isFactoryImport(scopeTrackerNode)) importSourceResolved = stripExtension(_resolvePath(scopeTrackerNode.importNode.source.value));
			else if (!scopeTrackerNode) {
				const autoImportedSource = autoImportsToSources?.get(factoryMeta.name);
				if (autoImportedSource) importSourceResolved = stripExtension(_resolvePath(autoImportedSource));
			}
			if (!importSourceResolved) continue;
			const resolvedFactorySource = factoryMeta.source;
			if (!parsedFactoryCall.namespace && (isFactoryImport(scopeTrackerNode) && (scopeTrackerNode.node.type === "ImportSpecifier" && scopeTrackerNode.node.importKind !== "type" || scopeTrackerNode.node.type === "ImportDefaultSpecifier" && factoryMeta.name === "default") && importSourceResolved === resolvedFactorySource || !scopeTrackerNode && importSourceResolved === resolvedFactorySource)) {
				handler({
					parseFactoryResult: parsedFactoryCall,
					factory: factoryMeta
				});
				walkContext.skip();
				continue;
			}
			if (parsedFactoryCall.namespace) {
				const namespacedImportMeta = namespaces.get(resolvedFactorySource);
				const namespaceScopeTrackerNode = scopeTracker.getDeclaration(parsedFactoryCall.namespace);
				if (namespacedImportMeta && namespacedImportMeta.namespaces.has(parsedFactoryCall.namespace) && namespaceScopeTrackerNode?.type === "Import" && namespaceScopeTrackerNode.node.type === "ImportNamespaceSpecifier") handler({
					parseFactoryResult: parsedFactoryCall,
					factory: factoryMeta
				});
				walkContext.skip();
				continue;
			}
			logger.debug(`[nuxt:compiler] The factory function \`${factoryMeta.name}\` used to create \`${parsedFactoryCall.functionName}\` in file \`${filePath}\` is not imported and is not in auto-imports. Skipping processing.`);
		}
	}
	return { processFactory };
}
/**
* Scans raw source files for factory functions that need auto-injected keys
* so that it can register them for key injection.
*/
/**
* Scans a single file for factory function calls and returns the keyed functions found.
* Extracted as a standalone function so it can be reused for HMR (incremental re-scan).
*/
function scanFileForFactories(id, code, namesToFactoryMeta, autoImportsToSources, alias) {
	const results = [];
	const context = createScanPluginContext(code, id);
	const scopeTracker = new ScopeTracker({ preserveExitedScopes: true });
	const { processFactory } = createFactoryProcessor(id, scopeTracker, namesToFactoryMeta, context.getParsedStaticImports(), autoImportsToSources, alias);
	context.walkParsed({ scopeTracker });
	scopeTracker.freeze();
	let isWalkingSupportedSubtree = false;
	context.walkParsed({
		scopeTracker,
		enter(node) {
			if (node.type !== "Program" && !isWalkingSupportedSubtree && node.type !== "ExportNamedDeclaration" && node.type !== "ExportDefaultDeclaration" && node.type !== "ImportDeclaration") this.skip();
			if (node.type !== "ExportNamedDeclaration" && node.type !== "ExportDefaultDeclaration") return;
			isWalkingSupportedSubtree = true;
			processFactory(this, node, ({ parseFactoryResult, factory }) => {
				results.push({
					name: parseFactoryResult.functionName,
					source: id,
					argumentLength: factory.argumentLength
				});
			});
		},
		leave(node) {
			if (node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration" || node.type === "ImportDeclaration") isWalkingSupportedSubtree = false;
		}
	});
	return results;
}
const KeyedFunctionFactoriesScanPlugin = (options) => {
	const fileResults = /* @__PURE__ */ new Map();
	const namesToFactoryMeta = new Map(options.factories.map((f) => [f.name, {
		...f,
		source: stripExtension(resolveAlias(f.source, options.alias))
	}]));
	const KEYED_FUNCTION_FACTORY_NAMES_RE = new RegExp(`\\b(${options.factories.map((f) => escapeStringRegexp(f.name)).join("|")})\\b`);
	return {
		result: {
			fileResults,
			factoryNamesRegex: KEYED_FUNCTION_FACTORY_NAMES_RE,
			namesToFactoryMeta
		},
		name: "nuxt:keyed-function-factories",
		filter: {
			id: { include: JS_EXT_RE },
			code: { include: KEYED_FUNCTION_FACTORY_NAMES_RE }
		},
		scan({ id, autoImportsToSources }) {
			const results = [];
			const scopeTracker = new ScopeTracker({ preserveExitedScopes: true });
			const { processFactory } = createFactoryProcessor(id, scopeTracker, namesToFactoryMeta, this.getParsedStaticImports(), autoImportsToSources, options.alias);
			this.walkParsed({ scopeTracker });
			scopeTracker.freeze();
			let isWalkingSupportedSubtree = false;
			this.walkParsed({
				scopeTracker,
				enter(node) {
					if (node.type !== "Program" && !isWalkingSupportedSubtree && node.type !== "ExportNamedDeclaration" && node.type !== "ExportDefaultDeclaration" && node.type !== "ImportDeclaration") this.skip();
					if (node.type !== "ExportNamedDeclaration" && node.type !== "ExportDefaultDeclaration") return;
					isWalkingSupportedSubtree = true;
					processFactory(this, node, ({ parseFactoryResult, factory }) => {
						results.push({
							name: parseFactoryResult.functionName,
							source: id,
							argumentLength: factory.argumentLength
						});
					});
				},
				leave(node) {
					if (node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration" || node.type === "ImportDeclaration") isWalkingSupportedSubtree = false;
				}
			});
			fileResults.set(id, results);
		},
		afterScan: (nuxt) => {
			for (const functions of fileResults.values()) nuxt.options.optimization.keyedComposables.push(...functions);
		}
	};
};
/**
* A plugin that replaces placeholder macros with actual factory functions.
* This is necessary to ensure that the user is notified when the factory function isn't correctly
* registered - in which case, the resulting function created by the factory will not be registered for key injection.
*
* The plugin assumes that the code being processed has all imports added.
*/
const KeyedFunctionFactoriesPlugin = (options) => createUnplugin(() => {
	const namesToFactoryMeta = new Map(options.factories.map((f) => [f.name, {
		...f,
		source: stripExtension(resolveAlias(f.source, options.alias))
	}]));
	const KEYED_FUNCTION_FACTORY_NAMES_RE = new RegExp(`\\b(${options.factories.map((f) => escapeStringRegexp(f.name)).join("|")})\\b`);
	return {
		name: "nuxt:compiler:keyed-function-factories",
		enforce: "post",
		transform: {
			filter: {
				id: {
					include: JS_EXT_RE,
					exclude: [
						NUXT_LIB_RE,
						STYLE_QUERY_RE$1,
						MACRO_QUERY_RE$2
					]
				},
				code: { include: KEYED_FUNCTION_FACTORY_NAMES_RE }
			},
			async handler(code, id, meta) {
				const s = rolldownString(code, id, meta);
				const scopeTracker = new ScopeTracker({ preserveExitedScopes: true });
				const autoImports = await options.getAutoImports();
				const autoImportsToSources = new Map(autoImports.map((i) => [i.as || i.name, i.from]));
				const { processFactory } = createFactoryProcessor(id, scopeTracker, namesToFactoryMeta, findStaticImports(code).map((i) => parseStaticImport(i)), autoImportsToSources, options.alias);
				function rewriteFactoryMacro(node) {
					if (node.type === "Identifier") if (code[node.end] === "?" && code[node.end + 1] === ".") s.overwrite(node.start, node.end + 2, `${node.name}?.__nuxt_factory`);
					else s.overwrite(node.start, node.end, `${node.name}.__nuxt_factory`);
					else if (code[node.end] === "?" && code[node.end + 1] === ".") s.appendLeft(node.end + 2, "__nuxt_factory");
					else s.appendLeft(node.end, ".__nuxt_factory");
				}
				const { program } = parseAndWalk(code, id, { scopeTracker });
				scopeTracker.freeze();
				walk(program, {
					scopeTracker,
					enter(node) {
						if (node.type !== "ExportNamedDeclaration" && node.type !== "ExportDefaultDeclaration") return;
						processFactory(this, node, ({ parseFactoryResult }) => {
							rewriteFactoryMacro(parseFactoryResult.factoryNode);
						});
					}
				});
				return generateTransform(s, id);
			}
		}
	};
});
//#endregion
//#region src/compiler/plugins/keyed-functions.ts
const stringTypes = ["Literal", "TemplateLiteral"];
const SUPPORTED_EXT_RE$1 = /^[^?]*\.(?:m?[jt]sx?|vue)(?:$|\?)/;
const SCRIPT_RE$1 = /(?<=<script[^>]*>)[\s\S]*?(?=<\/script>)/i;
const NUXT_INJECTED_MARKER = "/* nuxt-injected */";
/**
* Builds the lookup state from a list of keyed functions.
*
* Note: `namesToSourcesToFunctionMeta` is a global copy that maps exported names to sources.
* It does NOT include local import renames — the transform handler builds per-file local
* name mappings separately. The `source`s have resolved aliases and are without extensions.
*/
function buildKeyedFunctionsState(keyedFunctions) {
	const namesToSourcesToFunctionMeta = /* @__PURE__ */ new Map();
	const defaultExportSources = /* @__PURE__ */ new Set();
	for (const f of keyedFunctions) {
		let functionName = f.name;
		const fnSource = typeof f.source === "string" ? stripExtension(f.source) : "";
		if (f.name === "default") {
			const parsedSource = parse(f.source);
			defaultExportSources.add(parsedSource.name);
			functionName = camelCase(parsedSource.name);
		}
		if (import.meta.dev) {
			const existingEntry = namesToSourcesToFunctionMeta.get(functionName)?.get(fnSource);
			if (existingEntry?.source && existingEntry.source === fnSource) buildDiagnostics.NUXT_B1009({
				functionName,
				name: f.name,
				source: f.source
			});
		}
		let sourcesToFunctionMeta = namesToSourcesToFunctionMeta.get(functionName);
		if (!sourcesToFunctionMeta) {
			sourcesToFunctionMeta = /* @__PURE__ */ new Map();
			namesToSourcesToFunctionMeta.set(functionName, sourcesToFunctionMeta);
		}
		sourcesToFunctionMeta.set(fnSource, {
			...f,
			source: typeof f.source === "string" ? fnSource : f.source
		});
	}
	const sources = /* @__PURE__ */ new Set();
	for (const sourcesToFunctionMeta of namesToSourcesToFunctionMeta.values()) for (const f of sourcesToFunctionMeta.values()) if (f.source && typeof f.source === "string") sources.add(f.source);
	return {
		namesToSourcesToFunctionMeta,
		defaultExportSources,
		sources,
		codeIncludeRE: new RegExp(`\\b(${[...namesToSourcesToFunctionMeta.keys(), ...defaultExportSources].map((f) => escapeStringRegexp(f)).join("|")})\\b`)
	};
}
const KeyedFunctionsPlugin = (options) => createUnplugin(() => {
	let state = buildKeyedFunctionsState(options.keyedFunctions);
	let lastKeyedFunctionsLength = options.keyedFunctions.length;
	function getState() {
		if (options.dev && options.getKeyedFunctions) {
			const current = options.getKeyedFunctions();
			if (current.length !== lastKeyedFunctionsLength) {
				state = buildKeyedFunctionsState(current);
				lastKeyedFunctionsLength = current.length;
			}
		}
		return state;
	}
	return {
		name: "nuxt:compiler:keyed-functions",
		enforce: "post",
		transform: {
			filter: {
				id: {
					include: SUPPORTED_EXT_RE$1,
					exclude: [
						NUXT_LIB_RE,
						STYLE_QUERY_RE$1,
						MACRO_QUERY_RE$2
					]
				},
				...!options.dev && { code: { include: state.codeIncludeRE } }
			},
			async handler(code, _id, meta) {
				const { namesToSourcesToFunctionMeta, sources } = getState();
				if (options.dev) {
					const { codeIncludeRE } = getState();
					if (!codeIncludeRE.test(code)) return;
				}
				const { 0: script = code, index: codeIndex = 0 } = code.match(SCRIPT_RE$1) || {
					0: code,
					index: 0
				};
				const id = stripExtension(_id);
				const { directImports, namespaces } = processImports(findStaticImports(script).map((i) => parseStaticImport(i)), options.alias);
				const shouldConsiderExports = sources.has(id);
				const localNamesToExportedName = /* @__PURE__ */ new Map();
				const possibleLocalFunctionNames = new Set(namesToSourcesToFunctionMeta.keys());
				for (const [localName, directImport] of directImports) {
					const functionName = directImport.originalName === "default" ? camelCase(parse(directImport.source).name) : directImport.originalName;
					if (namesToSourcesToFunctionMeta.has(functionName)) possibleLocalFunctionNames.add(localName);
				}
				const autoImports = await options.getAutoImports();
				const autoImportsToSources = new Map(autoImports.map((i) => [i.as || i.name, i.from]));
				/**
				* @param localName the local name of the function to get the meta for
				* @param source the resolved source of the function to get the meta for (needs to be WITHOUT EXTENSION)
				*/
				function getFunctionMetaByLocalName(localName, source) {
					if (!localName) return;
					const exportedName = localNamesToExportedName.get(localName);
					if (exportedName) return namesToSourcesToFunctionMeta.get(exportedName)?.get(source);
					const directImport = directImports.get(localName);
					if (directImport) {
						const functionName = directImport.originalName === "default" ? camelCase(parse(directImport.source).name) : directImport.originalName;
						const sourcesToMetas = namesToSourcesToFunctionMeta.get(functionName);
						if (!sourcesToMetas) return;
						const fnMeta = sourcesToMetas.get(source);
						if (fnMeta) return fnMeta;
						if (source.startsWith(options.appDir)) for (const [fnSource, meta] of sourcesToMetas) {
							if (meta.name !== functionName || !fnSource.startsWith(options.appDir)) continue;
							return meta;
						}
						if (!options.requireSource) {
							const backwardsCompatibleFnMeta = sourcesToMetas.get("");
							if (backwardsCompatibleFnMeta?.source === void 0) {
								if (stripExtension(resolveAlias(autoImportsToSources.get(localName) ?? "")) === source) return backwardsCompatibleFnMeta;
							} else if (backwardsCompatibleFnMeta.source instanceof RegExp && backwardsCompatibleFnMeta.source.test(source)) return backwardsCompatibleFnMeta;
						}
						return;
					}
					return namesToSourcesToFunctionMeta.get(localName)?.get(source);
				}
				function _resolvePath(path) {
					let p = path;
					if (isAbsolute(p)) return p;
					p = resolveAlias(p, options.alias);
					if (isAbsolute(p)) return p;
					return join(parse(id).dir, p);
				}
				const s = rolldownString(code, _id, meta);
				let count = 0;
				const scopeTracker = new ScopeTracker({ preserveExitedScopes: true });
				const { program } = parseAndWalk(code, _id, {
					scopeTracker,
					enter(node) {
						if (!shouldConsiderExports) return;
						if (node.type !== "ExportNamedDeclaration" && node.type !== "ExportDefaultDeclaration") return;
						const result = parseStaticExportIdentifiers(node);
						for (const exportMeta of result) {
							const { localName, exportedName } = exportMeta;
							const functionName = exportedName === "default" ? camelCase(parse(id).name) : getFunctionMetaByLocalName(exportedName, id)?.name;
							if (!functionName) continue;
							localNamesToExportedName.set(localName, functionName);
						}
					}
				});
				scopeTracker.freeze();
				for (const localName of localNamesToExportedName.keys()) possibleLocalFunctionNames.add(localName);
				const LOCAL_FUNCTION_NAMES_RE = new RegExp(`\\b(${[...possibleLocalFunctionNames].map((f) => escapeStringRegexp(f)).join("|")})\\b`);
				function processKeyedFunction(walkContext, node, handler) {
					if (node.type !== "CallExpression" && node.type !== "ChainExpression") return;
					const parsedCall = parseStaticFunctionCall(node, LOCAL_FUNCTION_NAMES_RE);
					if (!parsedCall) return;
					const functionScopeTrackerNode = scopeTracker.getDeclaration(!parsedCall.namespace ? parsedCall.name : parsedCall.namespace);
					function isKeyedFunctionImport(node) {
						return node?.type === "Import" && node.importNode.importKind !== "type";
					}
					let importSourceResolved;
					if (localNamesToExportedName.has(parsedCall.name) && functionScopeTrackerNode?.scope === "") importSourceResolved = id;
					else if (isKeyedFunctionImport(functionScopeTrackerNode)) importSourceResolved = stripExtension(_resolvePath(functionScopeTrackerNode.importNode.source.value));
					if (!importSourceResolved) {
						walkContext.skip();
						return;
					}
					const fnMeta = getFunctionMetaByLocalName(parsedCall.name, importSourceResolved);
					if (!fnMeta) {
						walkContext.skip();
						return;
					}
					if (!parsedCall.namespace) {
						if (parsedCall.callExpression.arguments.length >= fnMeta.argumentLength && !parsedCall.callExpression.arguments.some((a) => a.type === "SpreadElement")) {
							walkContext.skip();
							return;
						}
						if (isKeyedFunctionImport(functionScopeTrackerNode) && (functionScopeTrackerNode.node.type === "ImportSpecifier" && functionScopeTrackerNode.node.importKind !== "type" || functionScopeTrackerNode.node.type === "ImportDefaultSpecifier" && fnMeta.name === "default") && (typeof fnMeta.source === "string" && stripExtension(fnMeta.source) === importSourceResolved || typeof fnMeta.source === "string" && fnMeta.source.startsWith(options.appDir) || !options.requireSource && !fnMeta.source && stripExtension(_resolvePath(autoImportsToSources.get(parsedCall.name) ?? "")) === importSourceResolved || !options.requireSource && fnMeta.source instanceof RegExp && fnMeta.source.test(importSourceResolved)) || localNamesToExportedName.has(parsedCall.name) && functionScopeTrackerNode?.scope === "") handler({
							parsedCall,
							fnMeta
						});
						walkContext.skip();
						return;
					}
					if (parsedCall.namespace) {
						const namespacedImportMeta = namespaces.get(importSourceResolved);
						const namespaceScopeTrackerNode = scopeTracker.getDeclaration(parsedCall.namespace);
						if (namespacedImportMeta && namespacedImportMeta.namespaces.has(parsedCall.namespace) && namespaceScopeTrackerNode?.type === "Import" && namespaceScopeTrackerNode.node.type === "ImportNamespaceSpecifier") handler({
							parsedCall,
							fnMeta
						});
						walkContext.skip();
						return;
					}
				}
				walk(program, {
					scopeTracker,
					enter(node) {
						processKeyedFunction(this, node, ({ parsedCall, fnMeta }) => {
							const lastArgument = parsedCall.callExpression.arguments[parsedCall.callExpression.arguments.length - 1];
							if (lastArgument?.type === "Literal" && typeof lastArgument.value === "string" && lastArgument.end + 19 + 1 < parsedCall.callExpression.end) {
								let wasKeyInjected = true;
								for (let i = 0; i < 19; i++) if (code[codeIndex + lastArgument.end + 1 + i] !== NUXT_INJECTED_MARKER[i]) {
									wasKeyInjected = false;
									break;
								}
								if (wasKeyInjected) return;
							}
							switch (parsedCall.name) {
								case "useState":
									if (stringTypes.includes(parsedCall.callExpression.arguments[0]?.type) && typeof fnMeta.source === "string" && stripExtension(fnMeta.source) === stripExtension(resolveAlias("#app/composables/state", options.alias))) return;
									break;
								case "useFetch":
								case "useLazyFetch":
									if (stringTypes.includes(parsedCall.callExpression.arguments[1]?.type) && typeof fnMeta.source === "string" && stripExtension(fnMeta.source) === stripExtension(resolveAlias("#app/composables/fetch", options.alias))) return;
									break;
								case "useAsyncData":
								case "useLazyAsyncData": if (stringTypes.includes(parsedCall.callExpression.arguments[0]?.type) && typeof fnMeta.source === "string" && stripExtension(fnMeta.source) === stripExtension(resolveAlias("#app/composables/asyncData", options.alias))) return;
							}
							let i = codeIndex + parsedCall.callExpression.end - 2;
							while (i >= codeIndex + parsedCall.callExpression.start && isWhitespace(code[i])) i--;
							const endsWithComma = code[i] === ",";
							s.appendLeft(codeIndex + parsedCall.callExpression.end - 1, (parsedCall.callExpression.arguments.length && !endsWithComma ? ", " : "") + "'$" + hash(`${_id}-${++count}`).slice(0, 10) + `' ${NUXT_INJECTED_MARKER}`);
						});
					}
				});
				return generateTransform(s, _id);
			}
		}
	};
});
//#endregion
//#region src/compiler/module.ts
var module_default = defineNuxtModule({
	meta: {
		name: "nuxt:compiler",
		configKey: "compiler"
	},
	defaults: { scan: true },
	setup(_options, nuxt) {
		let unimport;
		nuxt.hook("imports:context", (ctx) => {
			unimport = ctx;
		});
		let scanResult;
		let scanDirPaths = [];
		let normalizedKeyedFunctions = [];
		nuxt.hook("build:before", async () => {
			addBuildPlugin(KeyedFunctionFactoriesPlugin({
				factories: nuxt.options.optimization.keyedComposableFactories,
				alias: nuxt.options.alias,
				getAutoImports: () => unimport?.getImports() || Promise.resolve([])
			}));
			if (_options.scan) {
				const scanPlugin = KeyedFunctionFactoriesScanPlugin({
					factories: nuxt.options.optimization.keyedComposableFactories,
					alias: nuxt.options.alias
				});
				scanResult = scanPlugin.result;
				await runScanPlugins([scanPlugin]);
			}
			normalizedKeyedFunctions = await Promise.all(nuxt.options.optimization.keyedComposables.map(async ({ source, ...rest }) => ({
				...rest,
				source: typeof source === "string" ? await resolvePath(source, { fallbackToOriginal: true }) : source
			})));
			addBuildPlugin(KeyedFunctionsPlugin({
				keyedFunctions: normalizedKeyedFunctions,
				getKeyedFunctions: () => normalizedKeyedFunctions,
				alias: nuxt.options.alias,
				getAutoImports: () => unimport?.getImports() || Promise.resolve([]),
				appDir: nuxt.options.appDir,
				requireSource: nuxt.options.future.compatibilityVersion >= 5,
				dev: nuxt.options.dev
			}));
		});
		async function runScanPlugins(plugins) {
			const autoImports = await unimport?.getImports() || [];
			const autoImportsToSources = new Map(autoImports.map((i) => [i.as || i.name, i.from]));
			const dirPaths = /* @__PURE__ */ new Set();
			const scanDirs = [];
			for (const layer of nuxt.options._layers) {
				if (layer.config?.compiler?.scan === false) continue;
				const composablesDir = resolve(layer.config.srcDir, "composables");
				if (!isDirectorySync(composablesDir) || dirPaths.has(composablesDir)) continue;
				dirPaths.add(composablesDir);
				const extensions = nuxt.options.extensions.map((e) => normalizeExtension(e));
				scanDirs.push({
					path: composablesDir,
					extensions,
					pattern: `**/*.{${extensions.join(",")}}`,
					ignore: [`**/*.{${DECLARATION_EXTENSIONS.join(",")}}`]
				});
			}
			scanDirPaths = scanDirs.map((d) => d.path);
			const _filePaths = [];
			await Promise.all(scanDirs.map(async (dir) => {
				const files = await resolveFiles(dir.path, dir.pattern, { ignore: dir.ignore });
				_filePaths.push(...files);
			}));
			const filePaths = await Promise.all(_filePaths.map((filePath) => resolvePath(filePath)));
			for (const filePath of filePaths) {
				if (!plugins.some((p) => {
					if (!p.filter?.id) return true;
					return matchFilter(filePath, p.filter.id);
				})) continue;
				try {
					const contents = await readFile(filePath, "utf-8");
					const pluginScanThisContext = createScanPluginContext(contents, filePath);
					await Promise.all(plugins.map(async (plugin) => {
						if (plugin.filter?.id && !matchFilter(filePath, plugin.filter.id)) return;
						if (plugin.filter?.code && !matchFilter(contents, plugin.filter.code)) return;
						try {
							await plugin.scan.call(pluginScanThisContext, {
								id: filePath,
								code: contents,
								nuxt,
								autoImportsToSources
							});
						} catch (e) {
							buildDiagnostics.NUXT_B1005({
								plugin: plugin.name,
								file: filePath,
								cause: e
							});
						}
					}));
				} catch (e) {
					buildDiagnostics.NUXT_B1006({
						file: filePath,
						cause: e
					});
				}
			}
			await Promise.all(plugins.map(async (plugin) => {
				if (!plugin.afterScan) return;
				try {
					await plugin.afterScan(nuxt);
				} catch (e) {
					buildDiagnostics.NUXT_B1007({
						plugin: plugin.name,
						cause: e
					});
				}
			}));
		}
		if (nuxt.options.dev && _options.scan) nuxt.hook("builder:watch", async (event, relativePath) => {
			if (!scanResult || ![
				"add",
				"change",
				"unlink"
			].includes(event)) return;
			const absolutePath = resolve(nuxt.options.srcDir, relativePath);
			if (!scanDirPaths.some((dir) => absolutePath === dir || absolutePath.startsWith(dir + "/"))) return;
			const { fileResults, factoryNamesRegex, namesToFactoryMeta } = scanResult;
			if (fileResults.get(absolutePath)?.length) {
				const resolvedSource = await resolvePath(absolutePath, { fallbackToOriginal: true });
				for (let i = normalizedKeyedFunctions.length - 1; i >= 0; i--) if (normalizedKeyedFunctions[i].source === resolvedSource) normalizedKeyedFunctions.splice(i, 1);
				fileResults.delete(absolutePath);
			}
			if (event === "unlink") return;
			let contents;
			try {
				contents = await readFile(absolutePath, "utf-8");
			} catch {
				return;
			}
			if (!factoryNamesRegex.test(contents)) return;
			const autoImports = await unimport?.getImports() || [];
			const autoImportsToSources = new Map(autoImports.map((i) => [i.as || i.name, i.from]));
			const newEntries = scanFileForFactories(absolutePath, contents, namesToFactoryMeta, autoImportsToSources, nuxt.options.alias);
			if (newEntries.length) {
				fileResults.set(absolutePath, newEntries);
				const normalized = await Promise.all(newEntries.map(async ({ source, ...rest }) => ({
					...rest,
					source: typeof source === "string" ? await resolvePath(source, { fallbackToOriginal: true }) : source
				})));
				normalizedKeyedFunctions.push(...normalized);
			}
		});
	}
});
function matchFilter(input, filter) {
	if (typeof filter === "function") return filter(input);
	const include = filter.include ? toArray(filter.include).some((v) => matchWithStringOrRegex(input, v)) : true;
	const exclude = filter.exclude ? toArray(filter.exclude).some((v) => matchWithStringOrRegex(input, v)) : false;
	return include && !exclude;
}
//#endregion
//#region src/core/cache.ts
async function getVueHash(nuxt) {
	const id = "vue";
	const { hash } = await getHashes(nuxt, {
		id,
		cwd: (layer) => layer.config.srcDir || layer.cwd,
		patterns: (layer) => {
			const srcDir = layer.config.srcDir || layer.cwd;
			return [
				"**",
				`!${relative(srcDir, layer.config.serverDir || join(layer.cwd, "server"))}/**`,
				`!${relative(srcDir, resolve(layer.cwd, layer.config.dir?.public || "public"))}/**`,
				"!node_modules/**",
				"!nuxt.config.*"
			];
		},
		configOverrides: {
			buildId: void 0,
			serverDir: void 0,
			nitro: void 0,
			devServer: void 0,
			runtimeConfig: void 0,
			logLevel: void 0,
			devServerHandlers: void 0,
			devtools: void 0
		}
	});
	const cacheFile = join(getCacheDir(nuxt), id, hash + ".tar");
	const buildIdCacheFile = cacheFile.replace(".tar", ".buildid");
	return {
		hash,
		async collectCache() {
			const start = Date.now();
			await persistBuildOutputs(nuxt);
			await writeCache(nuxt.options.buildDir, nuxt.options.buildDir, cacheFile);
			await mkdir(dirname(buildIdCacheFile), { recursive: true });
			await writeFile(buildIdCacheFile, nuxt.options.buildId);
			const elapsed = Date.now() - start;
			consola.success(`Cached Vue client and server builds in \`${elapsed}ms\`.`);
		},
		async restoreCache() {
			const start = Date.now();
			const res = await restoreCacheFromFile(nuxt.options.buildDir, cacheFile);
			const elapsed = Date.now() - start;
			if (res) {
				await restoreBuildOutputs(nuxt);
				consola.success(`Restored Vue client and server builds from cache in \`${elapsed}ms\`.`);
			}
			return res;
		}
	};
}
const BUILD_OUTPUTS_FILE = "build-outputs.json";
/**
* The bundler is skipped entirely on a cache hit, so the `nuxt/*` build outputs
* it would normally provide are snapshotted into the cached build directory and
* replayed on restore.
*/
async function persistBuildOutputs(nuxt) {
	const outputs = {};
	for (const key of Object.keys(nuxt.buildOutputs)) outputs[key] = String(await nuxt.buildOutputs[key]());
	await writeFile(resolve(nuxt.options.buildDir, BUILD_OUTPUTS_FILE), JSON.stringify(outputs), "utf8");
}
async function restoreBuildOutputs(nuxt) {
	const file = resolve(nuxt.options.buildDir, BUILD_OUTPUTS_FILE);
	if (!existsSync(file)) return;
	const outputs = JSON.parse(await readFile(file, "utf8"));
	for (const key of Object.keys(outputs)) {
		const code = outputs[key];
		setBuildOutput(key, () => code, nuxt);
	}
}
/**
* Restore cached buildId before modules are initialised.
*
* Modules and the nitro builder require `buildId`, so we must set
* `nuxt.options.buildId` and `nuxt.options.runtimeConfig.app.buildId`
* before modules install. This ensures the manifest and all downstream
* consumers use the same buildId that was used when the Vue build was cached.
*/
async function restoreCachedBuildId(nuxt) {
	const { hash } = await getVueHash(nuxt);
	const cacheDir = getCacheDir(nuxt);
	const buildIdCacheFile = join(cacheDir, "vue", hash + ".buildid");
	if (!existsSync(buildIdCacheFile)) return;
	const cachedBuildId = (await readFile(buildIdCacheFile, "utf-8")).trim();
	if (!cachedBuildId || !/^[\w-]+$/.test(cachedBuildId)) return;
	nuxt.options.buildId = cachedBuildId;
	nuxt.options.runtimeConfig.app.buildId = cachedBuildId;
	consola.debug(`Restored cached buildId: ${cachedBuildId}`);
}
async function cleanupCaches(nuxt) {
	const start = Date.now();
	const caches = await glob(["*/*.tar", "*/*.buildid"], {
		cwd: getCacheDir(nuxt),
		absolute: true
	});
	if (caches.length >= 10) {
		const cachesWithMeta = await Promise.all(caches.map(async (cache) => {
			return [cache, await stat(cache).then((r) => r.mtime.getTime()).catch(() => 0)];
		}));
		cachesWithMeta.sort((a, b) => a[1] - b[1]);
		for (const [cache] of cachesWithMeta.slice(0, cachesWithMeta.length - 10)) await unlink(cache);
		const elapsed = Date.now() - start;
		consola.success(`Cleaned up old build caches in \`${elapsed}ms\`.`);
	}
}
async function getHashes(nuxt, options) {
	if (nuxt[`_${options.id}BuildHash`]) return nuxt[`_${options.id}BuildHash`];
	const start = Date.now();
	const hashSources = [];
	let layerCtr = 0;
	for (const layer of nuxt.options._layers) {
		if (layer.cwd.includes("node_modules")) continue;
		const layerName = `layer#${layerCtr++}`;
		hashSources.push({
			name: `${layerName}:config`,
			data: serialize({
				...layer.config,
				...options.configOverrides || {}
			})
		});
		const normalizeFiles = (files) => files.map((f) => ({
			name: f.name,
			size: f.attrs?.size,
			data: hash(f.data)
		})).sort((a, b) => a.name.localeCompare(b.name));
		const isIgnored = createIsIgnored(nuxt);
		const sourceFiles = await readFilesRecursive(options.cwd(layer), {
			shouldIgnore: isIgnored,
			cwd: nuxt.options.rootDir,
			patterns: options.patterns(layer)
		});
		hashSources.push({
			name: `${layerName}:src`,
			data: normalizeFiles(sourceFiles)
		});
		const rootFiles = await readFilesRecursive(layer.config?.rootDir || layer.cwd, {
			shouldIgnore: isIgnored,
			cwd: nuxt.options.rootDir,
			patterns: [
				".nuxtrc",
				".npmrc",
				"package.json",
				"package-lock.json",
				"yarn.lock",
				"pnpm-lock.yaml",
				"tsconfig.json",
				"bun.lock",
				"bun.lockb"
			]
		});
		hashSources.push({
			name: `${layerName}:root`,
			data: normalizeFiles(rootFiles)
		});
	}
	hashSources.sort((a, b) => a.name.localeCompare(b.name));
	const res = nuxt[`_${options.id}BuildHash`] = {
		hash: hash(hashSources),
		sources: hashSources
	};
	const elapsed = Date.now() - start;
	consola.debug(`Computed \`${options.id}\` build hash in \`${elapsed}ms\`.`);
	return res;
}
async function readFilesRecursive(dir, opts) {
	if (Array.isArray(dir)) return (await Promise.all(dir.map((d) => readFilesRecursive(d, opts)))).flat();
	const files = await glob(opts.patterns, { cwd: dir });
	return (await Promise.all(files.map(async (fileName) => {
		if (!opts.shouldIgnore?.(fileName)) {
			const file = await readFileWithMeta(dir, fileName);
			if (!file) return;
			return {
				...file,
				name: relative(opts.cwd, join(dir, file.name))
			};
		}
	}))).filter(Boolean);
}
async function readFileWithMeta(dir, fileName, count = 0) {
	let fd = void 0;
	try {
		fd = await open(resolve(dir, fileName));
		const stats = await fd.stat();
		if (!stats?.isFile()) return;
		const mtime = stats.mtime.getTime();
		const data = await fd.readFile();
		if ((await fd.stat()).mtime.getTime() !== mtime) {
			await fd.close();
			fd = void 0;
			if (count < 5) return await readFileWithMeta(dir, fileName, count + 1);
			buildDiagnostics.NUXT_B1010({ file: fileName });
			return;
		}
		return {
			name: fileName,
			data,
			attrs: {
				mtime,
				size: stats.size
			}
		};
	} catch (err) {
		buildDiagnostics.NUXT_B1011({
			file: fileName,
			cause: err
		});
	} finally {
		await fd?.close();
	}
}
async function restoreCacheFromFile(cwd, cacheFile) {
	if (!existsSync(cacheFile)) return false;
	const resolvedCwd = resolve(cwd) + "/";
	const files = parseTar(await readFile(cacheFile));
	for (const file of files) {
		let fd = void 0;
		try {
			const filePath = resolve(cwd, file.name);
			if (!filePath.startsWith(resolvedCwd)) {
				buildDiagnostics.NUXT_B1012({ path: file.name });
				continue;
			}
			await mkdir(dirname(filePath), { recursive: true });
			const existingStats = await stat(filePath).catch(() => null);
			const cachedSize = file.data?.byteLength ?? 0;
			if (existingStats?.isFile() && existingStats.size === cachedSize) {
				const lastModified = Number.parseInt(file.attrs?.mtime?.toString().padEnd(13, "0") || "0");
				if (existingStats.mtime.getTime() >= lastModified) {
					consola.debug(`Skipping \`${file.name}\` (up to date or newer than cache)`);
					continue;
				}
			}
			fd = await open(filePath, "w");
			await fd.writeFile(file.data);
		} catch (err) {
			buildDiagnostics.NUXT_B1013({
				file: file.name,
				cause: err
			});
		} finally {
			await fd?.close();
		}
	}
	return true;
}
async function writeCache(cwd, sources, cacheFile) {
	const fileEntries = await readFilesRecursive(sources, {
		patterns: ["**/*", "!analyze/**"],
		cwd
	});
	const tarData = createTar(fileEntries);
	await mkdir(dirname(cacheFile), { recursive: true });
	await writeFile(cacheFile, tarData);
}
function getCacheDir(nuxt) {
	let cacheDir = join(nuxt.options.workspaceDir, "node_modules");
	if (!existsSync(cacheDir)) {
		for (const dir of nuxt.options.modulesDir.toSorted((a, b) => a.length - b.length)) if (existsSync(dir)) {
			cacheDir = dir;
			break;
		}
	}
	return join(cacheDir, ".cache/nuxt/builds");
}
//#endregion
//#region meta.js
const runtimeDependencies = [
	"devalue",
	"klona",
	"unhead",
	"@nuxt/nitro-server/h3",
	"defu",
	"ufo",
	"destr",
	"consola",
	"hookable",
	"unctx",
	"cookie-es",
	"perfect-debounce",
	"fnv1a-64",
	"object-identity",
	"ohash",
	"pathe",
	"uncrypto"
];
//#endregion
//#region package.json
var version = "4.5.2";
//#endregion
//#region src/core/utils/proxy.ts
async function installProxyDispatcher() {
	if (!(process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY)) return;
	const { Agent, EnvHttpProxyAgent, getGlobalDispatcher, setGlobalDispatcher } = await import("undici");
	const current = getGlobalDispatcher();
	if (current instanceof EnvHttpProxyAgent) return;
	if (current.constructor !== Agent) return;
	setGlobalDispatcher(new EnvHttpProxyAgent());
}
//#endregion
//#region src/core/plugins/import-protection.ts
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
		new RegExp(`^${escapeStringRegexp(mod.entryPath)}$`),
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
		const serverRelative = escapeStringRegexp(relative(nuxt.options.rootDir, resolve(nuxt.options.srcDir, nuxt.options.serverDir || "server")));
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
//#region src/core/plugins/unctx.ts
const TRANSFORM_MARKER = "/* _processed_nuxt_unctx_transform */\n";
const TRANSFORM_MARKER_RE = /^\/\* _processed_nuxt_unctx_transform \*\/\n/;
const UnctxTransformPlugin = (options) => createUnplugin(() => {
	let transformer;
	const filter = getTransformFilter(options.transformerOptions);
	return {
		name: "unctx:transform",
		enforce: "post",
		transformInclude(id) {
			return isVue(id, { type: ["template", "script"] }) || isJS(id);
		},
		transform: {
			filter: {
				...filter,
				code: {
					include: filter.code,
					exclude: TRANSFORM_MARKER_RE
				}
			},
			async handler(code) {
				const { shouldTransform, transform } = await (transformer ??= createTransformer(options.transformerOptions));
				if (!shouldTransform(code)) return;
				const result = transform(code);
				if (result) {
					result.magicString.prepend(TRANSFORM_MARKER);
					return {
						code: result.magicString.toString(),
						map: options.sourcemap ? result.magicString.generateMap({ hires: true }) : void 0
					};
				}
			}
		}
	};
});
//#endregion
//#region src/core/plugins/tree-shake.ts
const TreeShakeComposablesPlugin = (options) => createUnplugin(() => {
	const allComposableNames = new Set(Object.values(options.composables).flat());
	if (!allComposableNames.size) return [];
	return {
		name: "nuxt:tree-shake-composables:transform",
		enforce: "post",
		transformInclude(id) {
			return isVue(id, { type: ["script"] }) || isJS(id);
		},
		transform: {
			filter: { code: { include: new RegExp(`\\b(?:${[...allComposableNames].map((r) => escapeStringRegexp(r)).join("|")})\\b`) } },
			handler(code, id, meta) {
				const s = rolldownString(code, id, meta);
				const scopeTracker = new ScopeTracker({ preserveExitedScopes: true });
				const parseResult = parseAndWalk(code, id, { scopeTracker });
				scopeTracker.freeze();
				walk(parseResult.program, {
					scopeTracker,
					enter(node) {
						if (node.type !== "CallExpression" || node.callee.type !== "Identifier") return;
						const functionName = node.callee.name;
						const scopeTrackerNode = scopeTracker.getDeclaration(functionName);
						if (scopeTrackerNode) {
							if (scopeTrackerNode.type !== "Import") return;
							if (scopeTrackerNode.importNode.type !== "ImportDeclaration") return;
							const importPath = scopeTrackerNode.importNode.source.value;
							const importSpecifier = scopeTrackerNode.node;
							const importedName = importSpecifier.type === "ImportSpecifier" && importSpecifier.imported.type === "Identifier" ? importSpecifier.imported.name : importSpecifier.local.name;
							if (!(importPath === "#imports" ? allComposableNames.has(importedName) : options.composables[importPath]?.includes(importedName))) return;
						}
						if (!scopeTrackerNode && !allComposableNames.has(functionName)) return;
						s.overwrite(node.start, node.end, ` false && /*@__PURE__*/ ${functionName}${code.slice(node.callee.end, node.end)}`);
						this.skip();
					}
				});
				return generateTransform(s, id);
			}
		}
	};
});
//#endregion
//#region src/core/plugins/dev-only.ts
const DEVONLY_COMP_SINGLE_RE = /<(?:dev-only|DevOnly|lazy-dev-only|LazyDevOnly)(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?>[\s\S]*?<\/(?:dev-only|DevOnly|lazy-dev-only|LazyDevOnly)>/;
const DEVONLY_COMP_RE = /<(?:dev-only|DevOnly|lazy-dev-only|LazyDevOnly)(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?>[\s\S]*?<\/(?:dev-only|DevOnly|lazy-dev-only|LazyDevOnly)>/g;
const DevOnlyPlugin = () => createUnplugin(() => {
	return {
		name: "nuxt:server-devonly:transform",
		enforce: "pre",
		transformInclude(id) {
			return isVue(id, { type: ["template"] });
		},
		transform: {
			filter: { code: { include: DEVONLY_COMP_SINGLE_RE } },
			handler(code, id, meta) {
				const s = rolldownString(code, id, meta);
				for (const match of code.matchAll(DEVONLY_COMP_RE)) {
					const fallback = parse$1(match[0]).children[0].children?.find((n) => {
						if (n.name !== "template") return false;
						return "fallback" in n.attributes || "#fallback" in n.attributes || "v-slot:fallback" in n.attributes;
					});
					const replacement = fallback ? match[0].slice(fallback.loc[0].end, fallback.loc.at(-1).start) : "";
					s.overwrite(match.index, match.index + match[0].length, replacement);
				}
				return generateTransform(s, id);
			}
		}
	};
});
//#endregion
//#region src/core/plugins/layer-aliasing.ts
const ALIAS_RE = /(?<=['"])[~@]{1,2}(?=\/)/g;
const ALIAS_RE_SINGLE = /(?<=['"])[~@]{1,2}(?=\/)/;
const ALIAS_ID_RE = /^[~@]{1,2}\//;
const CSS_LANG_RE = /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:\?|$)/;
const LayerAliasingPlugin = (options) => createUnplugin((_options, meta) => {
	const aliases = {};
	for (const layer of options.layers) {
		const srcDir = layer.config.srcDir || layer.cwd;
		const rootDir = layer.config.rootDir || layer.cwd;
		aliases[srcDir] = {
			"~": layer.config?.alias?.["~"] || srcDir,
			"@": layer.config?.alias?.["@"] || srcDir,
			"~~": layer.config?.alias?.["~~"] || rootDir,
			"@@": layer.config?.alias?.["@@"] || rootDir
		};
	}
	const layers = Object.keys(aliases).sort((a, b) => b.length - a.length);
	const isCssLikeOnly = meta.framework === "vite";
	const transformInclude = (id) => {
		const _id = normalize(id);
		if (!layers.some((dir) => _id.startsWith(dir))) return false;
		if (isCssLikeOnly && !CSS_LANG_RE.test(id)) return false;
		return true;
	};
	return {
		name: "nuxt:layer-aliasing",
		enforce: "pre",
		vite: { resolveId: {
			order: "pre",
			filter: { id: ALIAS_ID_RE },
			handler(id, importer) {
				if (!importer) return;
				const layer = layers.find((l) => importer.startsWith(l));
				if (!layer) return;
				const resolvedId = resolveAlias(id, aliases[layer]);
				if (resolvedId !== id) return this.resolve(resolvedId, importer, { skipSelf: true });
			}
		} },
		transformInclude,
		transform: {
			filter: { code: { include: ALIAS_RE_SINGLE } },
			handler(code, id, meta) {
				const _id = normalize(id);
				const layer = layers.find((l) => _id.startsWith(l));
				if (!layer) return;
				const s = rolldownString(code, id, meta);
				for (const match of code.matchAll(ALIAS_RE)) {
					const replacement = aliases[layer]?.[match[0]];
					if (replacement && replacement !== match[0]) s.overwrite(match.index, match.index + match[0].length, replacement);
				}
				return generateTransform(s, id);
			}
		}
	};
});
//#endregion
//#region src/core/modules.ts
const addModuleTranspiles = (nuxt) => {
	const transpile = [];
	for (const t of nuxt.options.build.transpile) {
		if (t instanceof Function) continue;
		if (typeof t === "string") transpile.push(new RegExp(escapeStringRegexp(t)));
		else transpile.push(t);
	}
	for (const m of [...nuxt.options.modules, ...nuxt.options._modules]) {
		const mod = typeof m === "string" ? m : Array.isArray(m) ? m[0] : m.src;
		if (typeof mod !== "string") continue;
		const path = normalizeModuleTranspilePath(mod);
		if (!transpile.some((t) => t.test(path))) nuxt.options.build.transpile.push(path);
	}
};
//#endregion
//#region src/core/server.ts
async function bundleServer(nuxt) {
	try {
		const { bundle } = !nuxt.options.server.builder || typeof nuxt.options.server.builder === "string" ? await loadServerBuilder(nuxt, nuxt.options.server.builder) : nuxt.options.server.builder;
		await bundle(nuxt);
	} catch (error) {
		await nuxt.callHook("build:error", error);
		throw error;
	}
}
async function loadServerBuilder(nuxt, builder = "@nuxt/nitro-server") {
	try {
		if (builder === "@nuxt/nitro-server") return await import(builder);
		return await importModule(builder, { url: [new URL(import.meta.url), directoryToURL(nuxt.options.rootDir)] });
	} catch (err) {
		throw buildDiagnostics.NUXT_B1018({
			builder,
			cause: err
		});
	}
}
//#endregion
//#region src/core/perf.ts
const hasGC = typeof globalThis.gc === "function";
function getMemorySnapshot() {
	const mem = process.memoryUsage();
	return {
		rss: mem.rss,
		heapUsed: mem.heapUsed,
		heapTotal: mem.heapTotal
	};
}
function getRetainedMemorySnapshot() {
	if (hasGC) globalThis.gc();
	const mem = process.memoryUsage();
	return {
		rss: mem.rss,
		heapUsed: mem.heapUsed,
		heapTotal: mem.heapTotal
	};
}
function formatBytes(bytes) {
	const abs = Math.abs(bytes);
	if (abs < 1024) return `${bytes} B`;
	if (abs < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1048576).toFixed(1)} MB`;
}
function formatDuration(ms) {
	if (ms < 1) return `${Math.round(ms * 1e3)}µs`;
	if (ms < 1e3) return `${Math.round(ms)}ms`;
	if (ms < 6e4) return `${(ms / 1e3).toFixed(1)}s`;
	return `${(ms / 6e4).toFixed(1)}min`;
}
const ANSI_RE = /\x1B\[[0-9;]*m/g;
function pad(str, width, align = "left") {
	const diff = width - str.replace(ANSI_RE, "").length;
	if (diff <= 0) return str;
	const padding = " ".repeat(diff);
	return align === "right" ? padding + str : str + padding;
}
function round(n) {
	return Math.round(n * 100) / 100;
}
const SLOW_HOOK_THRESHOLD_MS = Number(process.env.NUXT_PERF_SLOW_HOOK_MS) || 50;
const HOOK_PHASE_THRESHOLD_MS = 5;
var NuxtPerfProfiler = class {
	#phases = [];
	#phaseStack = [];
	#hookPhases = [];
	#hookStartStack = [];
	#modules = [];
	#bundlerPluginTimings = /* @__PURE__ */ new Map();
	#bundlerPluginSpans = [];
	#globalStart;
	#globalMemoryBefore;
	#unsubscribe;
	/** Offset to convert performance.now() (ms) to epoch microseconds for trace events */
	#baseTs;
	constructor(options) {
		if (options?.startTime) this.#globalStart = performance.now() - (Date.now() - options.startTime);
		else this.#globalStart = performance.now();
		this.#globalMemoryBefore = getMemorySnapshot();
		this.#baseTs = Date.now() * 1e3 - this.#globalStart * 1e3;
	}
	installHookInterceptors(hooks) {
		const unsubBefore = hooks.beforeEach((event) => {
			this.#hookStartStack.push({
				name: event.name,
				time: performance.now(),
				memory: getMemorySnapshot()
			});
		});
		const unsubAfter = hooks.afterEach((event) => {
			let startIdx = -1;
			for (let i = this.#hookStartStack.length - 1; i >= 0; i--) if (this.#hookStartStack[i].name === event.name) {
				startIdx = i;
				break;
			}
			if (startIdx === -1) return;
			const start = this.#hookStartStack.splice(startIdx, 1)[0];
			const endTime = performance.now();
			const memoryAfter = getMemorySnapshot();
			const duration = round(endTime - start.time);
			this.#hookPhases.push({
				name: `hook:${event.name}`,
				startTime: start.time,
				endTime,
				duration,
				memoryBefore: start.memory,
				memoryAfter,
				memoryDelta: {
					rss: memoryAfter.rss - start.memory.rss,
					heapUsed: memoryAfter.heapUsed - start.memory.heapUsed
				}
			});
		});
		this.#unsubscribe = () => {
			unsubBefore();
			unsubAfter();
		};
	}
	startPhase(name) {
		this.#phaseStack.push({
			name,
			startTime: performance.now(),
			memoryBefore: getMemorySnapshot()
		});
	}
	endPhase(name) {
		let phaseIdx = this.#phaseStack.length - 1;
		if (name) {
			phaseIdx = -1;
			for (let i = this.#phaseStack.length - 1; i >= 0; i--) if (this.#phaseStack[i].name === name) {
				phaseIdx = i;
				break;
			}
			if (phaseIdx === -1) return;
		}
		if (phaseIdx < 0) return;
		const open = this.#phaseStack.splice(phaseIdx, 1)[0];
		const endTime = performance.now();
		const memoryAfter = getMemorySnapshot();
		const retainedMemory = this.#phaseStack.length === 0 && hasGC ? getRetainedMemorySnapshot() : void 0;
		this.#phases.push({
			name: open.name,
			startTime: open.startTime,
			endTime,
			duration: round(endTime - open.startTime),
			memoryBefore: open.memoryBefore,
			memoryAfter,
			memoryDelta: {
				rss: memoryAfter.rss - open.memoryBefore.rss,
				heapUsed: memoryAfter.heapUsed - open.memoryBefore.heapUsed
			},
			retainedMemory
		});
	}
	recordBundlerPluginHook(pluginName, hookName, durationMs, startTime) {
		let plugin = this.#bundlerPluginTimings.get(pluginName);
		if (!plugin) {
			plugin = /* @__PURE__ */ new Map();
			this.#bundlerPluginTimings.set(pluginName, plugin);
		}
		const entry = plugin.get(hookName);
		if (entry) {
			entry.totalTime += durationMs;
			entry.count++;
			if (durationMs > entry.maxTime) entry.maxTime = durationMs;
		} else plugin.set(hookName, {
			totalTime: durationMs,
			count: 1,
			maxTime: durationMs
		});
		if (startTime != null && durationMs > .1) this.#bundlerPluginSpans.push({
			pluginName,
			hookName,
			startTime,
			durationMs
		});
	}
	collectModuleTimings(installedModules) {
		for (const mod of installedModules) {
			const name = mod.meta?.name || "(anonymous)";
			const setupTime = mod.timings?.setup;
			if (setupTime != null) this.#modules.push({
				name,
				setupTime
			});
		}
	}
	getReport() {
		const totalDuration = round(performance.now() - this.#globalStart);
		const globalMemoryAfter = getMemorySnapshot();
		const allPhases = [...this.#phases];
		for (const hp of this.#hookPhases) {
			if (hp.duration < HOOK_PHASE_THRESHOLD_MS) continue;
			const hookName = hp.name.slice(5);
			if (!this.#phases.some((p) => p.name === hookName && p.startTime <= hp.startTime && p.endTime >= hp.endTime)) allPhases.push({
				...hp,
				name: hookName
			});
		}
		allPhases.sort((a, b) => a.startTime - b.startTime);
		function computeOwn(phase) {
			const children = allPhases.filter((other) => other !== phase && other.startTime >= phase.startTime && other.endTime <= phase.endTime);
			const directChildren = children.filter((child) => !children.some((other) => other !== child && child.startTime >= other.startTime && child.endTime <= other.endTime));
			let childTime = 0;
			let childRss = 0;
			let childHeap = 0;
			for (const child of directChildren) {
				childTime += child.duration;
				childRss += child.memoryDelta.rss;
				childHeap += child.memoryDelta.heapUsed;
			}
			return {
				ownDuration: round(Math.max(0, phase.duration - childTime)),
				ownMemoryDelta: {
					rss: phase.memoryDelta.rss - childRss,
					heapUsed: phase.memoryDelta.heapUsed - childHeap
				}
			};
		}
		return {
			totalDuration,
			totalMemoryDelta: {
				rss: globalMemoryAfter.rss - this.#globalMemoryBefore.rss,
				heapUsed: globalMemoryAfter.heapUsed - this.#globalMemoryBefore.heapUsed
			},
			hasGCSnapshots: hasGC,
			phases: allPhases.map((p) => {
				const own = computeOwn(p);
				return {
					name: p.name,
					duration: p.duration,
					ownDuration: own.ownDuration,
					memoryBefore: p.memoryBefore,
					memoryAfter: p.memoryAfter,
					memoryDelta: p.memoryDelta,
					ownMemoryDelta: own.ownMemoryDelta,
					retainedHeap: p.retainedMemory?.heapUsed
				};
			}),
			slowHooks: this.#computeSlowHooks(new Set(allPhases.map((p) => p.name))),
			modules: this.#modules.toSorted((a, b) => b.setupTime - a.setupTime),
			bundlerPlugins: [...this.#bundlerPluginTimings.entries()].map(([name, hookMap]) => {
				const hooks = {};
				for (const [hookName, t] of hookMap) hooks[hookName] = {
					totalTime: round(t.totalTime),
					count: t.count,
					maxTime: round(t.maxTime),
					avgTime: round(t.totalTime / t.count)
				};
				return {
					name,
					hooks
				};
			}).sort((a, b) => {
				const aTotal = Object.values(a.hooks).reduce((s, h) => s + h.totalTime, 0);
				return Object.values(b.hooks).reduce((s, h) => s + h.totalTime, 0) - aTotal;
			}),
			timestamp: (/* @__PURE__ */ new Date()).toISOString()
		};
	}
	printReport(options) {
		const report = this.getReport();
		const isSubPhase = (name) => name.startsWith("module:") || name.startsWith("vite:");
		const topPhases = report.phases.filter((p) => !isSubPhase(p.name));
		const subPhases = report.phases.filter((p) => isSubPhase(p.name));
		consola.log("");
		consola.log(colors.bold(colors.cyan(` ${options?.title || "Nuxt Performance Report"}`)));
		consola.log("");
		const colPhase = 24;
		const colDuration = 10;
		const colRss = 14;
		const colHeap = 14;
		const colRetained = 16;
		const showRetained = report.hasGCSnapshots;
		const maxDuration = Math.max(...topPhases.map((p) => p.ownDuration), 1);
		const headerCols = [
			pad(colors.bold("Phase"), colPhase),
			pad(colors.bold("Duration"), colDuration, "right"),
			pad(colors.bold("RSS Delta"), colRss, "right"),
			pad(colors.bold("Heap Delta"), colHeap, "right")
		];
		if (showRetained) headerCols.push(pad(colors.bold("Retained Heap"), colRetained, "right"));
		consola.log(`  ${headerCols.join("  ")}`);
		const separatorWidth = 68 + (showRetained ? 18 : 0);
		const separator = "  " + colors.dim("─".repeat(separatorWidth));
		consola.log(separator);
		const maxRss = Math.max(...topPhases.map((p) => Math.abs(p.ownMemoryDelta.rss)), 1);
		const barMax = 20;
		for (const phase of topPhases) {
			const dur = phase.ownDuration;
			const rss = phase.ownMemoryDelta.rss;
			const heap = phase.ownMemoryDelta.heapUsed;
			const durBar = dur > 0 ? Math.max(1, Math.round(Math.log(dur + 1) / Math.log(maxDuration + 1) * (barMax / 2))) : 0;
			const memBar = Math.abs(rss) > 0 ? Math.max(0, Math.round(Math.abs(rss) / maxRss * (barMax / 2))) : 0;
			const durColor = dur > 1e3 ? colors.red : dur > 200 ? colors.yellow : colors.green;
			const memColor = Math.abs(rss) > 52428800 ? colors.red : Math.abs(rss) > 10485760 ? colors.yellow : colors.green;
			const bar = durColor("█".repeat(durBar)) + memColor("░".repeat(memBar));
			const rowCols = [
				pad(phase.name, colPhase),
				pad(durColor(formatDuration(dur)), colDuration, "right"),
				pad(memColor((rss >= 0 ? "+" : "") + formatBytes(rss)), colRss, "right"),
				pad((heap >= 0 ? "+" : "") + formatBytes(heap), colHeap, "right")
			];
			if (showRetained) if (phase.retainedHeap != null) {
				const retainedColor = phase.retainedHeap > 209715200 ? colors.red : phase.retainedHeap > 104857600 ? colors.yellow : colors.green;
				rowCols.push(pad(retainedColor(formatBytes(phase.retainedHeap)), colRetained, "right"));
			} else rowCols.push(pad(colors.dim("—"), colRetained, "right"));
			consola.log(`  ${rowCols.join("  ")}  ${bar}`);
		}
		consola.log(separator);
		const totalCols = [
			pad(colors.bold("Total"), colPhase),
			pad(colors.bold(formatDuration(report.totalDuration)), colDuration, "right"),
			pad(colors.bold((report.totalMemoryDelta.rss >= 0 ? "+" : "") + formatBytes(report.totalMemoryDelta.rss)), colRss, "right"),
			pad(colors.bold((report.totalMemoryDelta.heapUsed >= 0 ? "+" : "") + formatBytes(report.totalMemoryDelta.heapUsed)), colHeap, "right")
		];
		if (showRetained) totalCols.push(pad("", colRetained));
		consola.log(`  ${totalCols.join("  ")}`);
		if (!showRetained) consola.log(colors.dim("  Tip: run with NODE_OPTIONS=--expose-gc to see retained heap per phase"));
		consola.log("");
		const significantModules = report.modules.filter((m) => m.setupTime > 5);
		if (significantModules.length > 0) {
			consola.log(colors.bold(` Modules`));
			consola.log("");
			for (const mod of significantModules) {
				const durColor = mod.setupTime > 500 ? colors.red : mod.setupTime > 100 ? colors.yellow : colors.dim;
				consola.log(`  ${colors.dim("•")} ${mod.name} ${colors.dim("—")} ${durColor(formatDuration(mod.setupTime))}`);
			}
			consola.log("");
		}
		if (report.bundlerPlugins.length > 0) {
			const rows = [];
			for (const plugin of report.bundlerPlugins) for (const [hook, timing] of Object.entries(plugin.hooks)) if (timing.avgTime > .5) rows.push({
				plugin: plugin.name,
				hook,
				timing
			});
			rows.sort((a, b) => b.timing.avgTime - a.timing.avgTime);
			if (rows.length > 0) {
				consola.log(colors.bold(` Bundler Plugins`));
				consola.log("");
				for (const { plugin, hook, timing } of rows.slice(0, 15)) {
					const durColor = timing.avgTime > 10 ? colors.red : timing.avgTime > 2 ? colors.yellow : colors.dim;
					const avgLabel = formatDuration(timing.avgTime) + "/file";
					const maxLabel = timing.maxTime > timing.avgTime * 2 ? `, max ${formatDuration(timing.maxTime)}` : "";
					consola.log(`  ${colors.dim("•")} ${plugin} ${colors.dim(hook)} ${colors.dim("—")} ${durColor(avgLabel)}${colors.dim(maxLabel)} ${colors.dim(`(${timing.count} calls)`)}`);
				}
				consola.log("");
			}
		}
		if (report.slowHooks.length > 0) {
			consola.log(colors.bold(colors.yellow(` Slow Hooks (>${SLOW_HOOK_THRESHOLD_MS}ms own time)`)));
			consola.log("");
			for (const hook of report.slowHooks) {
				const durColor = hook.ownDuration > 500 ? colors.red : hook.ownDuration > 200 ? colors.yellow : colors.dim;
				const ownLabel = hook.ownDuration !== hook.duration ? `${formatDuration(hook.ownDuration)} own / ${formatDuration(hook.duration)} total` : formatDuration(hook.ownDuration);
				consola.log(`  ${colors.dim("•")} ${hook.name} ${colors.dim("—")} ${durColor(ownLabel)} ${colors.dim(`(${hook.phase})`)}`);
			}
			consola.log("");
		}
		const significantSubs = subPhases.filter((p) => p.duration > 5);
		if (significantSubs.length > 0) {
			consola.log(colors.bold(` Details`));
			consola.log("");
			for (const phase of significantSubs) {
				const durColor = phase.duration > 500 ? colors.red : phase.duration > 100 ? colors.yellow : colors.dim;
				consola.log(`  ${colors.dim("•")} ${phase.name} ${colors.dim("—")} ${durColor(formatDuration(phase.duration))}`);
			}
			consola.log("");
		}
	}
	/**
	* Generate trace events in Chrome Trace Event format.
	* The output can be loaded in chrome://tracing or https://ui.perfetto.dev
	*/
	getTraceEvents() {
		const events = [];
		const pid = 1;
		const tidPhases = 1;
		const tidHooks = 2;
		const tidPluginBase = 10;
		/** Convert performance.now() (ms) to epoch microseconds (integer) */
		const toUs = (ms) => Math.round(ms * 1e3 + this.#baseTs);
		events.push({
			name: "process_name",
			ph: "M",
			ts: 0,
			pid,
			tid: 0,
			cat: "",
			args: { name: "Nuxt Build" }
		}, {
			name: "thread_name",
			ph: "M",
			ts: 0,
			pid,
			tid: tidPhases,
			cat: "",
			args: { name: "Build" }
		}, {
			name: "thread_name",
			ph: "M",
			ts: 0,
			pid,
			tid: tidHooks,
			cat: "",
			args: { name: "Hooks" }
		});
		/** Convert ms duration to integer microseconds */
		const durUs = (ms) => Math.round(ms * 1e3);
		const globalEnd = performance.now();
		events.push({
			name: "nuxt build",
			cat: "build",
			ph: "B",
			ts: toUs(this.#globalStart),
			pid,
			tid: tidPhases
		}, {
			name: "nuxt build",
			cat: "build",
			ph: "E",
			ts: toUs(globalEnd),
			pid,
			tid: tidPhases
		});
		for (const phase of this.#phases) events.push({
			name: phase.name,
			cat: "phase",
			ph: "B",
			ts: toUs(phase.startTime),
			pid,
			tid: tidPhases,
			args: { memoryBefore: {
				rss: phase.memoryBefore.rss,
				heapUsed: phase.memoryBefore.heapUsed
			} }
		}, {
			name: phase.name,
			cat: "phase",
			ph: "E",
			ts: toUs(phase.endTime),
			pid,
			tid: tidPhases,
			args: { memoryDelta: {
				rss: phase.memoryDelta.rss,
				heapUsed: phase.memoryDelta.heapUsed
			} }
		});
		for (const hp of this.#hookPhases) {
			const name = hp.name.startsWith("hook:") ? hp.name.slice(5) : hp.name;
			events.push({
				name,
				cat: "hook",
				ph: "B",
				ts: toUs(hp.startTime),
				pid,
				tid: tidHooks
			}, {
				name,
				cat: "hook",
				ph: "E",
				ts: toUs(hp.endTime),
				pid,
				tid: tidHooks
			});
		}
		const viteSpans = this.#bundlerPluginSpans.filter((s) => !s.pluginName.startsWith("nitro:"));
		const nitroSpans = this.#bundlerPluginSpans.filter((s) => s.pluginName.startsWith("nitro:"));
		const emitPluginSpans = (spans, label, baseTid) => {
			if (spans.length === 0) return;
			const sorted = spans.toSorted((a, b) => a.startTime - b.startTime);
			const laneEnds = [];
			for (const span of sorted) {
				const endTime = span.startTime + span.durationMs;
				let lane = laneEnds.findIndex((end) => end < span.startTime);
				if (lane === -1) {
					lane = laneEnds.length;
					laneEnds.push(0);
				}
				laneEnds[lane] = endTime;
				const tid = baseTid + lane;
				events.push({
					name: `${span.pluginName}:${span.hookName}`,
					cat: label,
					ph: "X",
					ts: toUs(span.startTime),
					dur: durUs(span.durationMs),
					pid,
					tid
				});
			}
			for (let i = 0; i < laneEnds.length; i++) {
				const suffix = laneEnds.length > 1 ? ` ${i + 1}` : "";
				events.push({
					name: "thread_name",
					ph: "M",
					ts: 0,
					pid,
					tid: baseTid + i,
					cat: "",
					args: { name: `${label}${suffix}` }
				});
			}
		};
		emitPluginSpans(viteSpans, "Vite Plugins", tidPluginBase);
		emitPluginSpans(nitroSpans, "Nitro Plugins", 110);
		for (const phase of this.#phases) {
			events.push({
				name: "Memory",
				cat: "memory",
				ph: "C",
				ts: toUs(phase.startTime),
				pid,
				tid: 0,
				args: {
					rss: phase.memoryBefore.rss,
					heapUsed: phase.memoryBefore.heapUsed
				}
			}, {
				name: "Memory",
				cat: "memory",
				ph: "C",
				ts: toUs(phase.endTime),
				pid,
				tid: 0,
				args: {
					rss: phase.memoryAfter.rss,
					heapUsed: phase.memoryAfter.heapUsed
				}
			});
			if (phase.retainedMemory) events.push({
				name: "Retained Memory",
				cat: "memory",
				ph: "C",
				ts: toUs(phase.endTime) + 1,
				pid,
				tid: 0,
				args: {
					heapRetained: phase.retainedMemory.heapUsed,
					rssRetained: phase.retainedMemory.rss
				}
			});
		}
		return events;
	}
	writeReport(buildDir, options) {
		const report = this.getReport();
		const reportPath = join(buildDir, "perf-report.json");
		const relativeReportPath = relative(process.cwd(), reportPath).replace(/^(?![^.]{1,2}\/)/, "./");
		const tracePath = join(buildDir, "perf-trace.json");
		const relativeTracePath = relative(process.cwd(), tracePath).replace(/^(?![^.]{1,2}\/)/, "./");
		try {
			mkdirSync(buildDir, { recursive: true });
			writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
			writeFileSync(tracePath, JSON.stringify({ traceEvents: this.getTraceEvents() }), "utf-8");
			if (!options?.quiet) {
				consola.log(colors.dim(` Data dump written to ${relativeReportPath}`));
				consola.log(colors.dim(` Trace written to ${relativeTracePath} (load in \`https://ui.perfetto.dev\`)`));
				consola.log("");
			}
		} catch {}
		return reportPath;
	}
	dispose() {
		this.#unsubscribe?.();
	}
	#computeSlowHooks(reportedPhaseNames) {
		const hooks = [];
		for (const hp of this.#hookPhases) {
			if (hp.duration < SLOW_HOOK_THRESHOLD_MS) continue;
			const hookName = hp.name.slice(5);
			if (reportedPhaseNames.has(hookName)) continue;
			let attributedTime = 0;
			for (const phase of this.#phases) {
				const overlapStart = Math.max(phase.startTime, hp.startTime);
				const overlapEnd = Math.min(phase.endTime, hp.endTime);
				if (overlapEnd > overlapStart) attributedTime += overlapEnd - overlapStart;
			}
			for (const other of this.#hookPhases) {
				if (other === hp) continue;
				if (other.startTime >= hp.startTime && other.endTime <= hp.endTime) attributedTime += other.duration;
			}
			const ownDuration = round(hp.duration - round(attributedTime));
			if (ownDuration >= SLOW_HOOK_THRESHOLD_MS) {
				const parentPhase = this.#phases.find((p) => p.startTime <= hp.startTime && p.endTime >= hp.endTime);
				hooks.push({
					name: hookName,
					duration: hp.duration,
					ownDuration,
					phase: parentPhase?.name || "(between phases)"
				});
			}
		}
		return hooks.sort((a, b) => b.ownDuration - a.ownDuration);
	}
};
//#endregion
//#region src/core/schema.ts
var schema_default = defineNuxtModule({
	meta: { name: "nuxt:nuxt-config-schema" },
	async setup(_, nuxt) {
		const resolver = createResolver(import.meta.url);
		let _resolveSchema;
		function getSchemaLoader() {
			_resolveSchema ||= import("untyped/babel-plugin").then(({ default: untypedPlugin }) => createJiti(fileURLToPath(import.meta.url), {
				fsCache: false,
				transformOptions: { babel: { plugins: [untypedPlugin] } }
			}));
			return _resolveSchema;
		}
		nuxt.hook("prepare:types", async (ctx) => {
			ctx.references.push({ path: "schema/nuxt.schema.d.ts" });
			ctx.sharedReferences.push({ path: "schema/nuxt.schema.d.ts" });
			ctx.nodeReferences.push({ path: "schema/nuxt.schema.d.ts" });
			ctx.nodeTsConfig.include ||= [];
			ctx.nodeTsConfig.include.push(relative(nuxt.options.buildDir, join(nuxt.options.rootDir, "nuxt.schema.*")), relative(nuxt.options.buildDir, join(nuxt.options.rootDir, "layers/*/nuxt.schema.*")));
			if (nuxt.options._prepare) await writeSchema(schema);
		});
		nuxt.hook("nitro:prepare:types", (ctx) => {
			ctx.references.push({ path: resolve(nuxt.options.buildDir, "schema/nuxt.schema.d.ts") });
		});
		let schema;
		nuxt.hook("modules:done", async () => {
			schema = await resolveSchema$1();
		});
		nuxt.hooks.hook("build:done", () => writeSchema(schema));
		const layerDirs = getLayerDirectories(nuxt);
		if (nuxt.options.dev) {
			const onChange = debounce(async () => {
				schema = await resolveSchema$1();
				await writeSchema(schema);
			});
			if (nuxt.options.experimental.watcher === "parcel") try {
				const { subscribe } = await importModule("@parcel/watcher", { url: [nuxt.options.rootDir, ...nuxt.options.modulesDir].map((dir) => directoryToURL(dir)) });
				for (const dirs of layerDirs) {
					const subscription = await subscribe(dirs.root, onChange, { ignore: ["!nuxt.schema.*"] });
					nuxt.hook("close", () => subscription.unsubscribe());
				}
				return;
			} catch {
				configDiagnostics.NUXT_B5009();
			}
			const isIgnored = createIsIgnored(nuxt);
			const rootDirs = layerDirs.map((layer) => layer.root);
			const SCHEMA_RE = /(?:^|\/)nuxt.schema.\w+$/;
			const watcher = watch(rootDirs, {
				...nuxt.options.watchers.chokidar,
				depth: 1,
				ignored: [
					(path, stats) => stats && !stats.isFile() || !SCHEMA_RE.test(path),
					isIgnored,
					/[\\/]node_modules[\\/]/
				],
				ignoreInitial: true
			});
			watcher.on("all", onChange);
			nuxt.hook("close", () => watcher.close());
		}
		async function resolveSchema$1() {
			globalThis.defineNuxtSchema = (val) => val;
			const schemaDefs = [nuxt.options.$schema];
			for (const dirs of layerDirs) {
				const filePath = await resolver.resolvePath(join(dirs.root, "nuxt.schema"));
				if (filePath && existsSync(filePath)) {
					let loadedConfig;
					try {
						loadedConfig = await (await getSchemaLoader()).import(filePath, { default: true });
					} catch (err) {
						configDiagnostics.NUXT_B5005({
							filePath,
							cause: err
						});
						continue;
					}
					schemaDefs.push(loadedConfig);
				}
			}
			await nuxt.hooks.callHook("schema:extend", schemaDefs);
			const schemas = await Promise.all(schemaDefs.map((schemaDef) => resolveSchema(schemaDef)));
			const schema = defu(...schemas);
			await nuxt.hooks.callHook("schema:resolved", schema);
			return schema;
		}
		async function writeSchema(schema) {
			await nuxt.hooks.callHook("schema:beforeWrite", schema);
			await mkdir(resolve(nuxt.options.buildDir, "schema"), { recursive: true });
			await writeFile(resolve(nuxt.options.buildDir, "schema/nuxt.schema.json"), JSON.stringify(schema, null, 2), "utf8");
			const types = generateTypes(schema, {
				addExport: true,
				interfaceName: "NuxtCustomSchema",
				partial: true,
				allowExtraKeys: false
			}) + `
export type CustomAppConfig = Exclude<NuxtCustomSchema['appConfig'], undefined>
type _CustomAppConfig = CustomAppConfig

declare module '@nuxt/schema' {
  interface NuxtConfig extends Omit<NuxtCustomSchema, 'appConfig'> {}
  interface NuxtOptions extends Omit<NuxtCustomSchema, 'appConfig'> {}
  interface CustomAppConfig extends _CustomAppConfig {}
}

declare module 'nuxt/schema' {
  interface NuxtConfig extends Omit<NuxtCustomSchema, 'appConfig'> {}
  interface NuxtOptions extends Omit<NuxtCustomSchema, 'appConfig'> {}
  interface CustomAppConfig extends _CustomAppConfig {}
}
`;
			const typesPath = resolve(nuxt.options.buildDir, "schema/nuxt.schema.d.ts");
			await writeFile(typesPath, types, "utf8");
			await nuxt.hooks.callHook("schema:written");
		}
	}
});
//#endregion
//#region src/core/plugins/async-context.ts
const WITH_ASYNC_CONTEXT_IMPORT_RE = /withAsyncContext as _withAsyncContext,?/;
const AsyncContextInjectionPlugin = (_nuxt) => createUnplugin(() => {
	return {
		name: "nuxt:vue-async-context",
		transformInclude(id) {
			return isVue(id, { type: ["template", "script"] });
		},
		transform: {
			filter: { code: { include: /_withAsyncContext/ } },
			handler(code, id, meta) {
				const s = rolldownString(code, id, meta);
				s.prepend("import { withAsyncContext as _withAsyncContext } from \"#app/composables/asyncContext\";\n");
				const match = WITH_ASYNC_CONTEXT_IMPORT_RE.exec(code);
				if (match) s.remove(match.index, match.index + match[0].length);
				return generateTransform(s, id);
			}
		}
	};
});
//#endregion
//#region src/core/utils/parse.ts
function transformAndMinify(input, options) {
	const oxcOptions = tryUseNuxt()?.options.oxc;
	const transformResult = transformSync("", input, {
		tsconfig: false,
		...oxcOptions?.transform.options,
		...options
	});
	const minifyResult = minifySync("", transformResult.code, { compress: { target: oxcOptions?.transform.options.target || "esnext" } });
	return {
		...transformResult,
		...minifyResult
	};
}
//#endregion
//#region src/core/plugins/prehydrate.ts
function PrehydrateTransformPlugin() {
	return createUnplugin(() => ({
		name: "nuxt:prehydrate-transform",
		transformInclude(id) {
			return isJS(id) || isVue(id, { type: ["script"] });
		},
		transform: {
			filter: { code: { include: /onPrehydrate\(/ } },
			handler(code, id, meta) {
				const s = rolldownString(code, id, meta);
				parseAndWalk(code, id, (node) => {
					if (node.type !== "CallExpression" || node.callee.type !== "Identifier") return;
					if (node.callee.name === "onPrehydrate") {
						const callback = node.arguments[0];
						if (!callback) return;
						if (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression") return;
						const needsAttr = callback.params.length > 0;
						const { code: result } = transformAndMinify(`forEach(${code.slice(callback.start, callback.end)})`, { lang: "ts" });
						const cleaned = result.slice(7).replace(/;$/, "");
						const args = [JSON.stringify(cleaned)];
						if (needsAttr) args.push(JSON.stringify(hash(result).slice(0, 10)));
						s.overwrite(callback.start, callback.end, args.join(", "));
					}
				});
				return generateTransform(s, id);
			}
		}
	}));
}
//#endregion
//#region src/core/plugins/extract-async-data-handlers.ts
const functionsToExtract = /* @__PURE__ */ new Set(["useAsyncData", "useLazyAsyncData"]);
const FUNCTIONS_RE = /\buse(?:Lazy)?AsyncData\b/;
const SUPPORTED_EXT_RE = /^[^?]*\.(?:m?[jt]sx?|vue)(?:$|\?)/;
const SCRIPT_RE = /(?<=<script[^>]*>)[\s\S]*?(?=<\/script>)/i;
const STYLE_QUERY_RE = /[?&]type=style/;
const MACRO_QUERY_RE = /[?&]macro(?:=|&|$)/;
const ExtractAsyncDataHandlersPlugin = (options) => createUnplugin(() => {
	const asyncDatas = {};
	let count = 0;
	return {
		name: "nuxt:extract-async-data-handlers",
		enforce: "post",
		resolveId(source) {
			if (source in asyncDatas) return source;
		},
		load(id) {
			if (id in asyncDatas) return asyncDatas[id];
		},
		transform: {
			filter: {
				id: {
					include: SUPPORTED_EXT_RE,
					exclude: [
						/nuxt\/(src|dist)\/app/,
						STYLE_QUERY_RE,
						MACRO_QUERY_RE
					]
				},
				code: { include: FUNCTIONS_RE }
			},
			handler(code, id, meta) {
				const { 0: script = code, index: codeIndex = 0 } = code.match(SCRIPT_RE) || {
					index: 0,
					0: code
				};
				let s;
				const scopeTracker = new ScopeTracker({ preserveExitedScopes: true });
				const parseResult = parseAndWalk(script, id, { scopeTracker });
				scopeTracker.freeze();
				walk(parseResult.program, {
					scopeTracker,
					enter(node) {
						if (node.type !== "CallExpression" || node.callee.type !== "Identifier" || !functionsToExtract.has(node.callee.name)) return;
						const fetcherFunction = node.arguments.find((fn) => fn.type === "ArrowFunctionExpression" || fn.type === "FunctionExpression");
						if (!fetcherFunction || fetcherFunction.type !== "ArrowFunctionExpression" && fetcherFunction.type !== "FunctionExpression" || !fetcherFunction.body) return;
						s ||= rolldownString(code, id, meta);
						const referencedVariables = /* @__PURE__ */ new Set();
						const imports = /* @__PURE__ */ new Set();
						walk(fetcherFunction.body, {
							scopeTracker,
							enter(innerNode, parent) {
								if (innerNode.type !== "Identifier") return;
								if (parent) {
									if (parent.type === "MemberExpression" && parent.property === innerNode && parent.computed === false) return;
									if (parent.type === "Property" && parent.key === innerNode && parent.computed === false) return;
									if (parent.type === "MethodDefinition" && parent.key === innerNode && parent.computed === false) return;
									if (parent.type === "PropertyDefinition" && parent.key === innerNode && parent.computed === false) return;
								}
								const declaration = scopeTracker.getDeclaration(innerNode.name);
								if (!declaration) return;
								if (declaration.type === "Import") imports.add(innerNode.name);
								else if (declaration.type !== "FunctionParam") {
									const functionBodyStart = fetcherFunction.body.start;
									const functionBodyEnd = fetcherFunction.body.end;
									if (declaration.start < functionBodyStart || declaration.end > functionBodyEnd) referencedVariables.add(innerNode.name);
								}
							}
						});
						const importStatements = /* @__PURE__ */ new Set();
						walk(parseResult.program, { enter(importDecl) {
							if (importDecl.type !== "ImportDeclaration") return;
							if (importDecl.specifiers?.some((spec) => spec.local && imports.has(spec.local.name))) importStatements.add(script.slice(importDecl.start, importDecl.end));
						} });
						const imps = Array.from(importStatements).join("\n");
						const key = `${dirname(id)}/async-data-chunk-${count++}.js`;
						const isBlockStatement = fetcherFunction.body.type === "BlockStatement";
						const startOffset = codeIndex + fetcherFunction.body.start;
						const endOffset = codeIndex + fetcherFunction.body.end;
						const chunk = s.clone();
						const parameters = [...referencedVariables].join(", ");
						const preface = `${imps}\nexport default async function (${parameters}) { ${isBlockStatement ? "" : "return "}`;
						const suffix = ` }`;
						if (isBlockStatement) {
							chunk.overwrite(0, startOffset + 1, preface);
							chunk.overwrite(endOffset - 1, code.length, suffix);
						} else {
							chunk.overwrite(0, startOffset, preface);
							chunk.overwrite(endOffset, code.length, suffix);
						}
						asyncDatas[key] = {
							code: chunk.toString(),
							map: options.sourcemap ? chunk.generateMap({ hires: true }) : void 0
						};
						const importCall = `() => import('${key}').then(r => (r.default || r)(${parameters}))`;
						s.overwrite(codeIndex + fetcherFunction.start, codeIndex + fetcherFunction.end, importCall);
					}
				});
				return generateTransform(s, id);
			}
		}
	};
});
//#endregion
//#region src/core/nuxt.ts
function createNuxt(options) {
	const hooks = createHooks();
	const { callHook, callHookParallel, callHookWith } = hooks;
	if (options.experimental.asyncCallHook) {
		hooks.callHook = (...args) => Promise.resolve().then(() => runWithNuxtContext(nuxt, () => callHook(...args)));
		hooks.callHookParallel = (...args) => Promise.resolve().then(() => runWithNuxtContext(nuxt, () => callHookParallel(...args)) ?? []);
	} else {
		hooks.callHook = (...args) => runWithNuxtContext(nuxt, () => callHook(...args));
		hooks.callHookParallel = (...args) => runWithNuxtContext(nuxt, () => callHookParallel(...args));
	}
	hooks.callHookWith = (...args) => runWithNuxtContext(nuxt, () => callHookWith(...args));
	const nuxt = {
		__name: randomUUID(),
		_version: version,
		_asyncLocalStorageModule: options.experimental.debugModuleMutation ? new AsyncLocalStorage() : void 0,
		hooks,
		callHook: hooks.callHook,
		addHooks: hooks.addHooks,
		hook: hooks.hook,
		ready: () => runWithNuxtContext(nuxt, () => initNuxt(nuxt)),
		close: async () => {
			await hooks.callHook("close", nuxt);
		},
		vfs: {},
		apps: {},
		buildOutputs: {
			ssrStyles: () => "export default {}",
			serverEntry: () => `export default () => { throw new Error('[nuxt] nuxt/entry was not replaced by a builder. Ensure a Nuxt builder (Vite, Webpack, or Rspack) is configured.') }`,
			clientManifest: () => "export default {}",
			clientPrecomputed: () => "export default undefined",
			entryChunkName: () => "export const entryFileName = undefined",
			entryIds: () => "export default []"
		},
		runWithContext: (fn) => runWithNuxtContext(nuxt, fn),
		options
	};
	if (options.experimental.debugModuleMutation) {
		const proxiedOptions = /* @__PURE__ */ new WeakMap();
		Object.defineProperty(nuxt, "options", { get() {
			const currentModule = nuxt._asyncLocalStorageModule.getStore();
			if (!currentModule) return options;
			if (proxiedOptions.has(currentModule)) return proxiedOptions.get(currentModule);
			nuxt._debug ||= {};
			nuxt._debug.moduleMutationRecords ||= [];
			const proxied = onChange(options, (keys, newValue, previousValue, applyData) => {
				if (newValue === previousValue && !applyData) return;
				let value = applyData?.args ?? newValue;
				if (Array.isArray(value)) value = [...value];
				else if (typeof value === "object") value = { ...value };
				nuxt._debug.moduleMutationRecords.push({
					module: currentModule,
					keys,
					target: "nuxt.options",
					value,
					timestamp: Date.now(),
					method: applyData?.name
				});
			}, {
				ignoreUnderscores: true,
				ignoreSymbols: true,
				pathAsArray: true
			});
			proxiedOptions.set(currentModule, proxied);
			return proxied;
		} });
	}
	if (!nuxtCtx.tryUse()) {
		nuxtCtx.set(nuxt);
		nuxt.hook("close", () => {
			nuxtCtx.unset();
		});
	}
	hooks.hookOnce("close", () => {
		hooks.removeAllHooks();
	});
	return nuxt;
}
function fullyUnwrap(value) {
	let current = value;
	let target = onChange.target(current);
	while (target !== current) {
		current = target;
		target = onChange.target(current);
	}
	return current;
}
/**
* Deeply replace any `on-change` proxies embedded in `value` with their plain targets.
*
* When `experimental.debugModuleMutation` is enabled, reading `nuxt.options` inside a module
* returns an `on-change` proxy. Merging helpers like `defu` read proxied nested objects and copy
* those proxy references into their result, which then gets written back into the real options via
* a normal assignment. `on-change` only unwraps the top level of an assigned value, so the nested
* proxies survive and later break consumers that treat the resolved config as plain data (e.g.
* `structuredClone` throwing `DataCloneError`). We strip them once module setup is finished.
*/
function stripDebugProxies(value, seen = /* @__PURE__ */ new WeakSet()) {
	const target = fullyUnwrap(value);
	if (target === null || typeof target !== "object" || seen.has(target)) return;
	seen.add(target);
	for (const key of Object.keys(target)) {
		const current = target[key];
		const unwrapped = fullyUnwrap(current);
		if (unwrapped !== current) target[key] = unwrapped;
		stripDebugProxies(unwrapped, seen);
	}
}
const fallbackCompatibilityDate = "2025-07-15";
const nightlies = {
	"nitropack": "nitropack-nightly",
	"nitro": "nitro-nightly",
	"h3": "h3-nightly",
	"nuxt": "nuxt-nightly",
	"@nuxt/schema": "@nuxt/schema-nightly",
	"@nuxt/kit": "@nuxt/kit-nightly"
};
let warnedAboutCompatDate = false;
async function initNuxt(nuxt) {
	nuxt._perf?.startPhase("init");
	const layerDirs = getLayerDirectories(nuxt);
	for (const config of nuxt.options._layers.map((layer) => layer.config).reverse()) if (config.hooks) nuxt.hooks.addHooks(config.hooks);
	if (nuxt.options.dev) nuxt.hook("listen", (server) => {
		nuxt._devServerListener = server;
	});
	nuxt.options.compatibilityDate = resolveCompatibilityDatesFromEnv(nuxt.options.compatibilityDate);
	if (!nuxt.options.compatibilityDate.default) {
		nuxt.options.compatibilityDate.default = fallbackCompatibilityDate;
		if (nuxt.options.dev && hasTTY && !isCI && !nuxt.options.test && !warnedAboutCompatDate) {
			warnedAboutCompatDate = true;
			configDiagnostics.NUXT_B5001({
				fallback: fallbackCompatibilityDate,
				latest: formatDate("latest")
			});
		}
	}
	const layersDir = withTrailingSlash$1(resolve(nuxt.options.rootDir, "layers"));
	nuxt.hook("builder:watch", (event, relativePath) => {
		const path = resolve(nuxt.options.srcDir, relativePath);
		if (event === "addDir" || event === "unlinkDir") {
			if (path.startsWith(layersDir)) return nuxt.callHook("restart", { hard: true });
		}
	});
	addTypeTemplate({
		filename: "types/nitro-layouts.d.ts",
		getContents: ({ app }) => {
			return [
				`export type LayoutKey = ${Object.keys(app.layouts).map((name) => genString(name)).join(" | ") || "string"}`,
				"declare module 'nitropack' {",
				"  interface NitroRouteConfig {",
				"    appLayout?: LayoutKey | false",
				"  }",
				"  interface NitroRouteRules {",
				"    appLayout?: LayoutKey | false",
				"  }",
				"}",
				"declare module 'nitropack/types' {",
				"  interface NitroRouteConfig {",
				"    appLayout?: LayoutKey | false",
				"  }",
				"  interface NitroRouteRules {",
				"    appLayout?: LayoutKey | false",
				"  }",
				"}"
			].join("\n");
		}
	}, {
		nuxt: true,
		nitro: true,
		node: true
	});
	if (nuxt.options.typescript.builder !== false) {
		const envMap = {
			"@nuxt/rspack-builder": "@rsbuild/core/types",
			"@nuxt/vite-builder": "vite/client",
			"@nuxt/webpack-builder": "webpack/module",
			"rspack": "@rsbuild/core/types",
			"vite": "vite/client",
			"webpack": "webpack/module",
			"shared": "@nuxt/schema/builder-env"
		};
		const overrideEnv = nuxt.options.typescript.builder && envMap[nuxt.options.typescript.builder];
		const defaultEnv = typeof nuxt.options.builder === "string" ? envMap[nuxt.options.builder] : false;
		const environmentTypes = overrideEnv || defaultEnv;
		if (environmentTypes) {
			nuxt.options.typescript.hoist.push(environmentTypes);
			addTypeTemplate({
				filename: "types/builder-env.d.ts",
				getContents: () => genImport(environmentTypes)
			});
		}
	}
	const packageJSON = await readPackageJSON(nuxt.options.rootDir).catch(() => ({}));
	nuxt._dependencies = /* @__PURE__ */ new Set([...Object.keys(packageJSON.dependencies || {}), ...Object.keys(packageJSON.devDependencies || {})]);
	nuxt["~runtimeDependencies"] = [...runtimeDependencies];
	let paths;
	const applyNitroTypePaths = async (nitroConfig) => {
		paths ||= await resolveTypescriptPaths(nuxt);
		nitroConfig.typescript = defu(nitroConfig.typescript, { tsConfig: { compilerOptions: { paths: { ...paths } } } });
	};
	if (nuxt.options.dev) nuxt.hook("nitro:build:before", (nitro) => applyNitroTypePaths(nitro.options));
	else nuxt.hook("nitro:config", applyNitroTypePaths);
	let serverBuilderReference;
	const getServerBuilderReference = () => {
		if (serverBuilderReference || typeof nuxt.options.server.builder !== "string") return serverBuilderReference;
		serverBuilderReference = nuxt.options.server.builder === "@nuxt/nitro-server" ? { path: resolveModulePath("@nuxt/nitro-server/augments", { from: import.meta.url }).replace(/\.mjs$/, ".d.mts") } : { types: nuxt.options.server.builder };
		return serverBuilderReference;
	};
	nuxt.hook("prepare:types", async (opts) => {
		opts.references.push({ path: resolve(nuxt.options.buildDir, "types/plugins.d.ts") });
		if (nuxt.options.typescript.shim) opts.references.push({ path: resolve(nuxt.options.buildDir, "types/vue-shim.d.ts") });
		opts.references.push({ path: resolve(nuxt.options.buildDir, "types/build.d.ts") });
		opts.references.push({ path: resolve(nuxt.options.buildDir, "types/app.config.d.ts") });
		opts.references.push({ path: resolve(nuxt.options.buildDir, "types/runtime-config.d.ts") });
		opts.references.push({ types: "nuxt/app" });
		opts.nodeReferences.push({ path: resolve(nuxt.options.buildDir, "types/modules.d.ts") });
		opts.nodeReferences.push({ path: resolve(nuxt.options.buildDir, "types/runtime-config.d.ts") });
		opts.nodeReferences.push({ path: resolve(nuxt.options.buildDir, "types/shared-app.config.d.ts") });
		opts.nodeReferences.push({ types: "nuxt" });
		opts.nodeReferences.push({ path: resolveModulePath("@nuxt/vite-builder", { from: import.meta.url }).replace(".mjs", ".d.mts") });
		if (typeof nuxt.options.builder === "string" && nuxt.options.builder !== "@nuxt/vite-builder") opts.nodeReferences.push({ types: nuxt.options.builder });
		const serverBuilderReference = getServerBuilderReference();
		if (serverBuilderReference) {
			opts.references.push(serverBuilderReference);
			opts.nodeReferences.push(serverBuilderReference);
			if (nuxt.options.server.builder === "@nuxt/nitro-server") opts.sharedReferences.push(serverBuilderReference);
		}
		opts.sharedReferences.push({ path: resolve(nuxt.options.buildDir, "types/runtime-config.d.ts") });
		opts.sharedReferences.push({ path: resolve(nuxt.options.buildDir, "types/shared-app.config.d.ts") });
		opts.sharedReferences.push({ path: resolve(nuxt.options.buildDir, "types/shared-imports.d.ts") });
		paths ||= await resolveTypescriptPaths(nuxt);
		opts.tsConfig.compilerOptions = defu(opts.tsConfig.compilerOptions, { paths: { ...paths } });
		opts.nodeTsConfig.compilerOptions = defu(opts.nodeTsConfig.compilerOptions, { paths: { ...paths } });
		opts.nodeTsConfig.compilerOptions.paths["#app/types"] ||= [resolve(nuxt.options.appDir, "types")];
		opts.sharedTsConfig.compilerOptions = defu(opts.sharedTsConfig.compilerOptions, { paths: { ...paths } });
		for (const dirs of layerDirs) {
			const declaration = join(dirs.root, "index.d.ts");
			if (existsSync(declaration)) {
				opts.references.push({ path: declaration });
				opts.nodeReferences.push({ path: declaration });
				opts.sharedReferences.push({ path: declaration });
			}
		}
	});
	nuxt.hook("nitro:prepare:types", (opts) => {
		opts.references.push({ path: resolve(nuxt.options.buildDir, "types/shared-app.config.d.ts") });
		opts.references.push({ path: resolve(nuxt.options.buildDir, "types/runtime-config.d.ts") });
		const serverBuilderReference = getServerBuilderReference();
		if (serverBuilderReference) opts.references.push(serverBuilderReference);
	});
	if (nuxt.options.scripts) {
		if (!nuxt.options._modules.some((m) => m === "@nuxt/scripts" || m === "@nuxt/scripts-nightly")) installNuxtModule("@nuxt/scripts");
	}
	addBuildPlugin(VirtualFSPlugin(nuxt, { mode: "server" }), { client: false });
	addBuildPlugin(VirtualFSPlugin(nuxt, {
		mode: "client",
		alias: {
			"#internal/nitro": join(nuxt.options.buildDir, "nitro.client.mjs"),
			"nitro/runtime": join(nuxt.options.buildDir, "nitro.client.mjs"),
			"nitropack/runtime": join(nuxt.options.buildDir, "nitro.client.mjs")
		}
	}), { server: false });
	addBuildPlugin(RemovePluginMetadataPlugin(nuxt, "server"), { client: false });
	addBuildPlugin(RemovePluginMetadataPlugin(nuxt, "client"), { server: false });
	addBuildPlugin(PrehydrateTransformPlugin());
	if (nuxt.options.experimental.localLayerAliases) addBuildPlugin(LayerAliasingPlugin({
		dev: nuxt.options.dev,
		root: nuxt.options.srcDir,
		layers: nuxt.options._layers.slice(1)
	}));
	nuxt.hook("modules:done", () => {
		const helperModule = resolveModulePath("unctx", {
			from: import.meta.url,
			try: true
		}) ?? "unctx";
		addBuildPlugin(UnctxTransformPlugin({
			sourcemap: !!nuxt.options.sourcemap.server || !!nuxt.options.sourcemap.client,
			transformerOptions: {
				...nuxt.options.optimization.asyncTransforms,
				helperModule
			}
		}));
		if (Object.keys(nuxt.options.optimization.treeShake.composables.server).length) addBuildPlugin(TreeShakeComposablesPlugin({ composables: nuxt.options.optimization.treeShake.composables.server }), { client: false });
		if (Object.keys(nuxt.options.optimization.treeShake.composables.client).length) addBuildPlugin(TreeShakeComposablesPlugin({ composables: nuxt.options.optimization.treeShake.composables.client }), { server: false });
		if (!nuxt.options.test) {
			const sharedDir = withTrailingSlash$1(resolve(nuxt.options.rootDir, nuxt.options.dir.shared));
			const relativeSharedDir = withTrailingSlash$1(relative(nuxt.options.rootDir, resolve(nuxt.options.rootDir, nuxt.options.dir.shared)));
			const sharedPatterns = [
				/^#shared\//,
				new RegExp("^" + escapeStringRegexp(sharedDir)),
				new RegExp("^" + escapeStringRegexp(relativeSharedDir))
			];
			const sharedProtectionConfig = {
				cwd: nuxt.options.rootDir,
				trace: true,
				include: sharedPatterns,
				patterns: createImportProtectionPatterns(nuxt, { context: "shared" })
			};
			addBuildPlugin({
				vite: () => ImpoundPlugin.vite(sharedProtectionConfig),
				webpack: () => ImpoundPlugin.webpack(sharedProtectionConfig),
				rspack: () => ImpoundPlugin.rspack(sharedProtectionConfig)
			}, {
				server: false,
				prepend: true
			});
			const nuxtProtectionConfig = {
				cwd: nuxt.options.rootDir,
				trace: true,
				exclude: [relative(nuxt.options.rootDir, join(nuxt.options.srcDir, "index.html")), ...sharedPatterns],
				patterns: createImportProtectionPatterns(nuxt, { context: "nuxt-app" })
			};
			addBuildPlugin({
				webpack: () => ImpoundPlugin.webpack(nuxtProtectionConfig),
				rspack: () => ImpoundPlugin.rspack(nuxtProtectionConfig)
			});
			for (const envOptions of [{ client: false }, { server: false }]) {
				const error = envOptions.client === false ? false : true;
				const vitePlugins = [ImpoundPlugin.vite({
					...nuxtProtectionConfig,
					error,
					...error === false && { warn: "once" }
				})].flat().map((p) => Object.assign(p, { name: `nuxt:import-protection:${p.name}` }));
				const mainPlugins = vitePlugins.filter((p) => !p.name.includes("trace"));
				const tracePlugins = vitePlugins.filter((p) => p.name.includes("trace"));
				if (mainPlugins.length) addVitePlugin(() => mainPlugins, {
					...envOptions,
					prepend: true
				});
				if (tracePlugins.length) addVitePlugin(() => tracePlugins, envOptions);
			}
		}
	});
	if (!nuxt.options.dev) {
		addBuildPlugin(DevOnlyPlugin());
		if (nuxt.options.experimental.extractAsyncDataHandlers) addBuildPlugin(ExtractAsyncDataHandlersPlugin({
			sourcemap: !!nuxt.options.sourcemap.client,
			rootDir: nuxt.options.rootDir
		}), { server: false });
	}
	if (nuxt.options.dev) {
		addPlugin(resolve(nuxt.options.appDir, "plugins/check-if-layout-used"));
		addPlugin(resolve(nuxt.options.appDir, "plugins/warn.dev.server"));
	}
	if (nuxt.options.experimental.asyncContext) addBuildPlugin(AsyncContextInjectionPlugin(nuxt), { client: false });
	if (nuxt.options.features.noScripts && !nuxt.options.dev) nuxt.hook("build:manifest", async (manifest) => {
		for (const chunk of Object.values(manifest)) if (chunk.resourceType === "script") {
			await rm(resolve(nuxt.options.buildDir, "dist/client", withoutLeadingSlash(nuxt.options.app.buildAssetsDir), chunk.file), { force: true });
			chunk.file = "";
		}
	});
	nuxt.options.build.transpile.push("nuxt/app");
	for (const layer of layerDirs) if (layer.root.includes("node_modules")) nuxt.options.build.transpile.push(layer.root.replace(/\/$/, ""));
	const locallyScannedLayersDirs = layerDirs.map((l) => join(l.root, "layers/"));
	const rootWithTrailingSlash = withTrailingSlash$1(nuxt.options.rootDir);
	for (const dirs of layerDirs) {
		if (dirs.root === rootWithTrailingSlash) continue;
		if (locallyScannedLayersDirs.every((dir) => !dirs.root.startsWith(dir))) nuxt.options.modulesDir.push(join(dirs.root, "node_modules"));
	}
	nuxt._perf?.endPhase("init");
	nuxt._perf?.startPhase("modules");
	await nuxt.callHook("modules:before");
	const { paths: watchedModulePaths, resolvedModulePaths, modules } = await resolveModules(nuxt);
	nuxt.options.watch.push(...watchedModulePaths);
	const islandsConfig = nuxt.options.experimental.componentIslands;
	if (nuxt.options.dev || !(typeof islandsConfig === "object" && islandsConfig.selectiveClient === "deep")) addComponent({
		name: "NuxtWelcome",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/welcome")
	});
	addComponent({
		name: "NuxtLayout",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/nuxt-layout")
	});
	addComponent({
		name: "NuxtErrorBoundary",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/nuxt-error-boundary")
	});
	addComponent({
		name: "ClientOnly",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/client-only")
	});
	addComponent({
		name: "DevOnly",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/dev-only")
	});
	addComponent({
		name: "ServerPlaceholder",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/server-placeholder")
	});
	addComponent({
		name: "NuxtLink",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/nuxt-link")
	});
	addComponent({
		name: "NuxtLoadingIndicator",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/nuxt-loading-indicator")
	});
	addComponent({
		name: "NuxtTime",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/nuxt-time.vue")
	});
	addComponent({
		name: "NuxtRouteAnnouncer",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/nuxt-route-announcer"),
		mode: "client"
	});
	addComponent({
		name: "NuxtAnnouncer",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/nuxt-announcer"),
		mode: "client"
	});
	if (nuxt.options.experimental.clientFallback) {
		addComponent({
			name: "NuxtClientFallback",
			_raw: true,
			priority: 10,
			filePath: resolve(nuxt.options.appDir, "components/client-fallback.client"),
			mode: "client"
		});
		addComponent({
			name: "NuxtClientFallback",
			_raw: true,
			priority: 10,
			filePath: resolve(nuxt.options.appDir, "components/client-fallback.server"),
			mode: "server"
		});
	}
	for (const name of ["NuxtImg", "NuxtPicture"]) addComponent({
		name,
		export: name,
		priority: -1,
		filePath: resolve(nuxt.options.appDir, "components/nuxt-stubs"),
		_internal_install: "@nuxt/image"
	});
	if (nuxt.options.builder === "@nuxt/webpack-builder" || nuxt.options.builder === "@nuxt/rspack-builder") addPlugin(resolve(nuxt.options.appDir, "plugins/preload.server"));
	if (nuxt.options.debug && nuxt.options.debug.hooks && (nuxt.options.debug.hooks === true || nuxt.options.debug.hooks.client)) addPlugin(resolve(nuxt.options.appDir, "plugins/debug-hooks"));
	if (nuxt.options.experimental.browserDevtoolsTiming) addPlugin(resolve(nuxt.options.appDir, "plugins/browser-devtools-timing.client"));
	await installModules(modules, resolvedModulePaths, nuxt);
	if (nuxt.options.experimental.debugModuleMutation) stripDebugProxies(nuxt.options);
	nuxt._ignore = ignore(nuxt.options.ignoreOptions);
	nuxt._ignore.add(resolveIgnorePatterns());
	await nuxt.callHook("modules:done");
	nuxt._perf?.endPhase("modules");
	nuxt._perf?.collectModuleTimings(nuxt.options._installedModules);
	nuxt.options.css = nuxt.options.css.filter((value, index, array) => !array.includes(value, index + 1));
	warnUnresolvableGlobalCss(nuxt);
	if (nuxt.options.experimental.componentIslands) addComponent({
		name: "NuxtIsland",
		priority: 10,
		filePath: resolve(nuxt.options.appDir, "components/nuxt-island")
	});
	if (nuxt.options.experimental.crossOriginPrefetch) addPlugin(resolve(nuxt.options.appDir, "plugins/cross-origin-prefetch.client"));
	const pagesEnabled = nuxt.options.pages !== false && nuxt.options.pages?.enabled !== false;
	if (pagesEnabled && nuxt.options.experimental.componentIslands) addPlugin(resolve(nuxt.options.appDir, "plugins/island-link-navigation.client"));
	if (pagesEnabled && nuxt.options.experimental.emitRouteChunkError === "automatic") addPlugin(resolve(nuxt.options.appDir, "plugins/chunk-reload.client"));
	if (pagesEnabled && nuxt.options.experimental.emitRouteChunkError === "automatic-immediate") addPlugin(resolve(nuxt.options.appDir, "plugins/chunk-reload-immediate.client"));
	if (pagesEnabled && nuxt.options.experimental.emitRouteChunkError) addPlugin(resolve(nuxt.options.appDir, "plugins/chunk-reload-crawler.client"));
	if (nuxt.options.experimental.restoreState) addPlugin(resolve(nuxt.options.appDir, "plugins/restore-state.client"));
	if (nuxt.options.experimental.viewTransition) addPlugin(resolve(nuxt.options.appDir, "plugins/view-transitions.client"));
	if (nuxt.options.experimental.renderJsonPayloads) addPlugin(resolve(nuxt.options.appDir, "plugins/revive-payload.server"));
	addRouteMiddleware({
		name: "manifest-route-rule",
		path: resolve(nuxt.options.appDir, "middleware/route-rules"),
		global: true
	});
	if (nuxt.options.experimental.appManifest) {
		if (nuxt.options.experimental.checkOutdatedBuildInterval !== false) addPlugin(resolve(nuxt.options.appDir, "plugins/check-outdated-build.client"));
	}
	if (nuxt.options.experimental.navigationRepaint) addPlugin({ src: resolve(nuxt.options.appDir, "plugins/navigation-repaint.client") });
	if (nuxt.options.vue.config && Object.values(nuxt.options.vue.config).some((v) => v !== null && v !== void 0)) addPluginTemplate({
		filename: "vue-app-config.mjs",
		getContents: () => `
import { defineNuxtPlugin } from '#app/nuxt'
export default defineNuxtPlugin({
  name: 'nuxt:vue-app-config',
  enforce: 'pre',
  setup (nuxtApp) {
    ${Object.keys(nuxt.options.vue.config).map((k) => `    nuxtApp.vueApp.config[${JSON.stringify(k)}] = ${JSON.stringify(nuxt.options.vue.config[k])}`).join("\n")}
  }
})`
	});
	nuxt.hooks.hook("builder:watch", (event, relativePath) => {
		const path = resolve(nuxt.options.srcDir, relativePath);
		if (watchedModulePaths.has(path)) return nuxt.callHook("restart", { hard: true });
		const layerRelativePaths = new Set(getLayerDirectories(nuxt).map((l) => relative(l.app, path)));
		for (const pattern of nuxt.options.watch) {
			if (typeof pattern === "string") {
				if (pattern === path || layerRelativePaths.has(pattern)) return nuxt.callHook("restart");
				continue;
			}
			for (const p of layerRelativePaths) if (pattern.test(p)) return nuxt.callHook("restart");
		}
		if (event === "addDir" && path === resolve(nuxt.options.srcDir, "app")) {
			logger.info(`\`${path}/\` ${event === "addDir" ? "created" : "removed"}`);
			return nuxt.callHook("restart", { hard: true });
		}
		if (["add", "unlink"].includes(event) && RESTART_RE.test(path)) {
			logger.info(`\`${path}\` ${event === "add" ? "created" : "removed"}`);
			return nuxt.callHook("restart");
		}
	});
	nuxt.options.build.transpile = nuxt.options.build.transpile.map((t) => {
		if (typeof t !== "string") return t;
		return normalize(t).split("node_modules/").pop();
	});
	addModuleTranspiles(nuxt);
	await bundleServer(nuxt);
	nuxt._perf?.startPhase("ready");
	if (nuxt.options.experimental.renderJsonPayloads && nuxt.options.ssr !== false) addPlugin(resolve(nuxt.options.appDir, "plugins/revive-payload.client"));
	if (nuxt.options.experimental.payloadExtraction) {
		if (pagesEnabled) addPlugin(resolve(nuxt.options.appDir, "plugins/payload.client"));
		if (nuxt.options.experimental.prefetchPreloadTags) addPlugin(resolve(nuxt.options.appDir, "plugins/prefetch-preload-tags.server"));
	}
	if (!satisfies(coerce(nuxt._version) ?? nuxt._version, nuxt.options.future.compatibilityVersion + ".x")) logger.info(`Running with compatibility version \`${nuxt.options.future.compatibilityVersion}\``);
	await nuxt.callHook("ready", nuxt);
	nuxt._perf?.endPhase("ready");
}
async function loadNuxt(opts) {
	await installProxyDispatcher();
	let perf;
	const cliStartTime = globalThis.__nuxt_cli__?.startTime;
	if (typeof opts.overrides?.debug === "object" && opts.overrides.debug.perf) {
		perf = new NuxtPerfProfiler({ startTime: cliStartTime });
		perf.startPhase("config");
	}
	const options = await loadNuxtConfig(opts);
	if (!perf && typeof options.debug === "object" && options.debug.perf) perf = new NuxtPerfProfiler({ startTime: cliStartTime });
	perf?.endPhase("config");
	options.appDir = options.alias["#app"] = withTrailingSlash$1(resolve(distDir, "app"));
	options._majorVersion = 4;
	for (const key in options.app.head || {}) options.app.head[key] = deduplicateArray(options.app.head[key]);
	if (options.builder === "@nuxt/vite-builder") {
		if (typeof options.devtools === "boolean" ? options.devtools : options.devtools?.enabled !== false) {
			if (!options._modules.some((m) => m === "@nuxt/devtools" || m === "@nuxt/devtools-nightly" || m === "@nuxt/devtools-edge")) options._modules.push("@nuxt/devtools");
		}
	}
	if (!options._modules.some((m) => m === "@nuxt/scripts" || m === "@nuxt/scripts-nightly")) options.imports = defu(options.imports, { presets: [scriptsStubsPreset] });
	if (options.builder === "@nuxt/webpack-builder") {
		if (!await Promise.resolve().then(() => features_exports).then((r) => r.ensurePackageInstalled("@nuxt/webpack-builder", {
			rootDir: options.rootDir,
			searchPaths: options.modulesDir
		}))) configDiagnostics.NUXT_B5002({ rootDir: options.rootDir });
	}
	options._modules.push(module_default$4, module_default$3, module_default$2);
	options._modules.push(module_default);
	const importIncludes = [];
	for (const layer of options._layers) if (layer.cwd && layer.cwd.includes("node_modules")) importIncludes.push(new RegExp(`(^|\\/)${escapeStringRegexp(layer.cwd.split("node_modules/").pop())}(\\/|$)(?!node_modules\\/)`));
	options._modules.push([module_default$1, { transform: { include: importIncludes } }]);
	options._modules.push(schema_default);
	options.modulesDir.push(resolve(options.workspaceDir, "node_modules"));
	options.modulesDir.push(resolve(pkgDir, "node_modules"));
	options.build.transpile.push("mocked-exports", "std-env");
	options.alias["vue-demi"] = resolve(options.appDir, "compat/vue-demi");
	options.alias["@vue/composition-api"] = resolve(options.appDir, "compat/capi");
	if (options.telemetry !== false && !process.env.NUXT_TELEMETRY_DISABLED) options._modules.push("@nuxt/telemetry");
	if (options.experimental.typescriptPlugin) options._modules.push("@dxup/nuxt");
	const allowedKeys = /* @__PURE__ */ new Set([
		"baseURL",
		"buildAssetsDir",
		"cdnURL",
		"buildId"
	]);
	for (const key in options.runtimeConfig.app) if (!allowedKeys.has(key)) {
		configDiagnostics.NUXT_B5003({ key });
		delete options.runtimeConfig.app[key];
	}
	const nitroOptions = options.nitro;
	createPortalProperties(nitroOptions.runtimeConfig, options, ["nitro.runtimeConfig", "runtimeConfig"]);
	createPortalProperties(nitroOptions.routeRules, options, ["nitro.routeRules", "routeRules"]);
	if (nitroOptions.handlers?.length && nitroOptions.handlers !== options.serverHandlers) options.serverHandlers.unshift(...nitroOptions.handlers);
	createPortalProperties(options.serverHandlers, options, ["nitro.handlers", "serverHandlers"]);
	if (nitroOptions.devHandlers?.length && nitroOptions.devHandlers !== options.devServerHandlers) options.devServerHandlers.unshift(...nitroOptions.devHandlers);
	createPortalProperties(options.devServerHandlers, options, ["nitro.devHandlers", "devServerHandlers"]);
	createPortalProperties(nitroOptions.tracingChannel, options, ["nitro.tracingChannel", "tracingChannel"]);
	Object.defineProperties(options, { nitro: {
		configurable: true,
		enumerable: true,
		get: () => nitroOptions,
		set(value) {
			Object.assign(nitroOptions, value);
		}
	} });
	const nuxt = createNuxt(options);
	if (perf) {
		nuxt._perf = perf;
		perf.installHookInterceptors(nuxt.hooks);
		const quiet = typeof options.debug === "object" && options.debug.perf === "quiet";
		const title = nuxt.options.dev ? "Nuxt Performance Report" : "Nuxt Build Performance";
		let flushed = false;
		const flush = () => {
			if (flushed || !perf) return;
			flushed = true;
			if (!quiet) perf.printReport({ title });
			perf.writeReport(nuxt.options.buildDir, { quiet });
			perf.dispose();
		};
		nuxt.hook("close", flush);
		process.once("exit", flush);
		nuxt.hook("close", () => {
			process.off("exit", flush);
		});
	}
	nuxt.runWithContext(() => {
		if (opts.overrides?.hooks) nuxt.hooks.addHooks(opts.overrides.hooks);
		if (nuxt.options.debug && nuxt.options.debug.hooks && (nuxt.options.debug.hooks === true || nuxt.options.debug.hooks.server)) createDebugger(nuxt.hooks, { tag: "nuxt" });
	});
	if (!nuxt.options._prepare && !nuxt.options.dev && nuxt.options.experimental.buildCache) nuxt.hooks.hookOnce("modules:before", () => restoreCachedBuildId(nuxt));
	if (opts.ready !== false) await nuxt.ready();
	return nuxt;
}
const RESTART_RE = /^(?:app|error|app\.config)\.(?:js|ts|mjs|jsx|tsx|vue)$/i;
function deduplicateArray(maybeArray) {
	if (!Array.isArray(maybeArray)) return maybeArray;
	const fresh = [];
	const hashes = /* @__PURE__ */ new Set();
	for (const item of maybeArray) {
		const _hash = hash(item);
		if (!hashes.has(_hash)) {
			hashes.add(_hash);
			fresh.push(item);
		}
	}
	return fresh;
}
function createPortalProperties(sourceValue, options, paths) {
	let sharedValue = sourceValue;
	for (const path of paths) {
		const segments = path.split(".");
		const key = segments.pop();
		let parent = options;
		while (segments.length) {
			const key = segments.shift();
			parent = parent[key] ||= {};
		}
		delete parent[key];
		Object.defineProperties(parent, { [key]: {
			configurable: true,
			enumerable: true,
			get: () => sharedValue,
			set(value) {
				sharedValue = value;
			}
		} });
	}
}
async function resolveModules(nuxt) {
	const modules = /* @__PURE__ */ new Map();
	const paths = /* @__PURE__ */ new Set();
	const resolvedModulePaths = /* @__PURE__ */ new Set();
	const configs = nuxt.options._layers.map((layer) => layer.config).reverse();
	for (const config of configs) {
		const definedModules = config.modules ?? [];
		for (const module of definedModules) {
			const resolvedModule = resolveModuleWithOptions(module, nuxt);
			if (resolvedModule && (!resolvedModule.resolvedPath || !resolvedModulePaths.has(resolvedModule.resolvedPath))) {
				modules.set(resolvedModule.module, resolvedModule.options);
				const path = resolvedModule.resolvedPath || resolvedModule.module;
				if (typeof path === "string") resolvedModulePaths.add(path);
			}
		}
		const modulesDir = resolve(config.srcDir, (config.rootDir === nuxt.options.rootDir ? nuxt.options.dir : config.dir)?.modules || "modules");
		const layerModules = await resolveFiles(modulesDir, [`*{${nuxt.options.extensions.join(",")}}`, `*/index{${nuxt.options.extensions.join(",")}}`]);
		for (const module of layerModules) {
			paths.add(module);
			if (!modules.has(module)) modules.set(module, {});
		}
	}
	for (const key of ["modules", "_modules"]) for (const module of nuxt.options[key]) {
		const resolvedModule = resolveModuleWithOptions(module, nuxt);
		if (resolvedModule && !modules.has(resolvedModule.module) && (!resolvedModule.resolvedPath || !resolvedModulePaths.has(resolvedModule.resolvedPath))) {
			modules.set(resolvedModule.module, resolvedModule.options);
			const path = resolvedModule.resolvedPath || resolvedModule.module;
			if (typeof path === "string") resolvedModulePaths.add(path);
		}
	}
	return {
		paths,
		resolvedModulePaths,
		modules
	};
}
const NESTED_PKG_RE = /^[^@]+\//;
async function resolveTypescriptPaths(nuxt) {
	nuxt.options.typescript.hoist ||= [];
	const packagesToResolve = [];
	const nightlyAliases = /* @__PURE__ */ new Map();
	for (const pkg of nuxt.options.typescript.hoist) {
		const [_pkg = pkg] = NESTED_PKG_RE.test(pkg) ? pkg.split("/") : [pkg];
		if (nuxt._dependencies?.has(_pkg) && !(_pkg in nightlies)) continue;
		if (_pkg in nightlies) {
			const nightly = nightlies[_pkg];
			const nightlyPkg = pkg.replace(_pkg, nightly);
			packagesToResolve.push(nightlyPkg);
			nightlyAliases.set(nightlyPkg, pkg);
		}
		packagesToResolve.push(pkg);
	}
	const resolved = await resolveTypePaths(packagesToResolve, nuxt.options.modulesDir);
	const paths = {};
	const nightlyResolved = /* @__PURE__ */ new Set();
	for (const [pkg, path] of resolved) if (nightlyAliases.has(pkg)) {
		const original = nightlyAliases.get(pkg);
		paths[original] = [path];
		paths[pkg] = [path];
		nightlyResolved.add(original);
	} else if (!nightlyResolved.has(pkg)) paths[pkg] = [path];
	return paths;
}
function withTrailingSlash$1(dir) {
	return dir.replace(/[^/]$/, "$&/");
}
const RELATIVE_CSS_ENTRY_RE = /^\.{1,2}\//;
/**
* Warn about `css` entries that cannot resolve, which otherwise fail silently:
* the dev server emits a `<link>` to a URL nothing serves, and production
* builds drop the styles entirely.
*/
function warnUnresolvableGlobalCss(nuxt) {
	for (const entry of nuxt.options.css) {
		if (typeof entry !== "string") continue;
		if (RELATIVE_CSS_ENTRY_RE.test(entry)) {
			const asAlias = "~/" + relative(nuxt.options.srcDir, resolve(nuxt.options.rootDir, entry));
			logger.warn(`\`css\` entries are resolved as module ids, not relative to \`nuxt.config\`. Replace \`${entry}\` with ${existsSync(resolve(nuxt.options.rootDir, entry)) ? `\`${asAlias}\`` : "an aliased or absolute path"}.`);
			continue;
		}
		const resolved = resolveAlias(entry, nuxt.options.alias);
		if (isAbsolute(resolved) && !resolved.startsWith(nuxt.options.buildDir) && !existsSync(resolved)) logger.warn(`\`css\` entry \`${entry}\` could not be found${resolved === entry ? "" : ` (resolved to \`${resolved}\`)`}.`);
	}
}
//#endregion
//#region src/core/external-config-files.ts
/**
* Check for those external configuration files that are not compatible with Nuxt,
* and warns the user about them.
* @see {@link https://nuxt.com/docs/4.x/getting-started/configuration#external-configuration-files}
*/
async function checkForExternalConfigurationFiles() {
	const foundFiles = (await Promise.all([
		checkViteConfig(),
		checkWebpackConfig(),
		checkNitroConfig(),
		checkPostCSSConfig()
	])).filter(Boolean);
	if (!foundFiles.length) return;
	configDiagnostics.NUXT_B5004({ files: foundFiles.map((file) => `\`${file}\``).join(", ") });
}
function checkViteConfig() {
	return checkConfigFileExistence("vite.config", [
		".js",
		".mjs",
		".ts",
		".cjs",
		".mts",
		".cts"
	]);
}
function checkWebpackConfig() {
	return checkConfigFileExistence("webpack.config", [
		".js",
		".mjs",
		".ts",
		".cjs",
		".mts",
		".cts",
		".coffee"
	]);
}
function checkNitroConfig() {
	return checkConfigFileExistence("nitro.config", [".ts", ".mts"]);
}
function checkPostCSSConfig() {
	return checkConfigFileExistence("postcss.config", [".js", ".cjs"]);
}
async function checkConfigFileExistence(fileName, extensions) {
	const configFile = await findPath(fileName, { extensions }).catch(() => null);
	return configFile ? basename(configFile) : void 0;
}
//#endregion
//#region src/core/builder.ts
async function build(nuxt) {
	nuxt._perf?.startPhase("app:generate");
	const app = createApp(nuxt);
	nuxt.apps.default = app;
	let closing = false;
	const writes = /* @__PURE__ */ new Set();
	const track = async (run) => {
		if (closing) return;
		const p = run();
		writes.add(p);
		try {
			await p;
		} finally {
			writes.delete(p);
		}
	};
	const generateApp$1 = debounce(() => generateApp(nuxt, app), void 0, { leading: true });
	await generateApp$1();
	nuxt._perf?.endPhase("app:generate");
	const builder = nuxt.options._prepare ? void 0 : await resolveBuilder(nuxt);
	if (nuxt.options.dev) {
		nuxt.hook("close", async () => {
			closing = true;
			generateApp$1.cancel();
			await Promise.allSettled(writes);
		});
		if (!nuxt.options._prepare) {
			if (nuxt.options.experimental.watcher === "builder" && builder?.setupWatcher) await builder.setupWatcher(nuxt);
			else {
				if (nuxt.options.experimental.watcher === "builder") buildDiagnostics.NUXT_B1020();
				watch$1(nuxt);
			}
			nuxt.hook("builder:watch", async (event, relativePath) => {
				if (event !== "change") invalidateAppStructure(nuxt);
				if (event === "add" || event === "unlink") {
					const path = resolve(nuxt.options.srcDir, relativePath);
					for (const dirs of getLayerDirectories(nuxt)) {
						const relativePath = relative(dirs.app, path);
						if (/^app\./i.test(relativePath)) {
							app.mainComponent = void 0;
							break;
						}
						if (/^error\./i.test(relativePath)) {
							app.errorComponent = void 0;
							break;
						}
					}
				}
				await track(() => generateApp$1());
			});
		}
		nuxt.hook("builder:generateApp", (options) => {
			if (options) return track(() => generateApp(nuxt, app, options));
			invalidateAppStructure(nuxt);
			return track(() => generateApp$1());
		});
	}
	if (!nuxt.options._prepare && !nuxt.options.dev && nuxt.options.experimental.buildCache) {
		const { restoreCache, collectCache } = await getVueHash(nuxt);
		if (await restoreCache()) {
			await nuxt.callHook("build:done");
			await nuxt.callHook("close", nuxt);
			return;
		}
		nuxt.hooks.hookOnce("build:done", () => collectCache());
		nuxt.hooks.hookOnce("close", () => cleanupCaches(nuxt));
	}
	await nuxt.callHook("build:before");
	if (nuxt.options._prepare) {
		nuxt.hook("prepare:types", () => nuxt.close());
		return;
	}
	if (nuxt.options.dev && !nuxt.options.test) nuxt.hooks.hookOnce("build:done", () => {
		checkForExternalConfigurationFiles().catch((e) => buildDiagnostics.NUXT_B1014({ cause: e }));
	});
	nuxt._perf?.startPhase("build:bundle");
	await builder?.bundle(nuxt);
	nuxt._perf?.endPhase("build:bundle");
	if (!nuxt.options.dev && nuxt.options.experimental.clearBuildHooks) clearBuildHooks(nuxt);
	if (!nuxt.options.dev && typeof globalThis.gc === "function") {
		nuxt._perf?.startPhase("build:gc");
		globalThis.gc();
		nuxt._perf?.endPhase("build:gc");
	}
	await nuxt.callHook("build:done");
	if (!nuxt.options.dev) await nuxt.callHook("close", nuxt);
}
const watchEvents = {
	create: "add",
	delete: "unlink",
	update: "change"
};
async function watch$1(nuxt) {
	if (nuxt.options.experimental.watcher === "parcel") {
		if (await createParcelWatcher()) return;
	}
	if (nuxt.options.experimental.watcher === "chokidar") return createWatcher();
	return createGranularWatcher();
}
function createWatcher() {
	const nuxt = useNuxt();
	const isIgnored = createIsIgnored(nuxt);
	const layerDirs = getLayerDirectories(nuxt);
	const paths = [];
	for (const layer of layerDirs) {
		paths.push(layer.app);
		if (!layer.server.startsWith(layer.app.replace(/\/?$/, "/"))) paths.push(layer.server);
	}
	const watcher = watch(paths, {
		...nuxt.options.watchers.chokidar,
		ignoreInitial: true,
		ignored: [isIgnored, /[\\/]node_modules[\\/]/]
	});
	const restartPaths = /* @__PURE__ */ new Set();
	const srcDir = nuxt.options.srcDir.replace(/\/?$/, "/");
	for (const pattern of nuxt.options.watch) {
		if (typeof pattern !== "string") continue;
		const path = resolve(nuxt.options.srcDir, pattern);
		if (!path.startsWith(srcDir)) restartPaths.add(path);
	}
	watcher.add([...restartPaths]);
	watcher.on("all", (event, path) => {
		if (event === "all" || event === "ready" || event === "error" || event === "raw") return;
		nuxt.callHook("builder:watch", event, normalize(path));
	});
	const disposeRecovery = recoverThrottledChanges(watcher);
	nuxt.hook("close", () => {
		disposeRecovery();
		return watcher?.close();
	});
}
function createGranularWatcher() {
	const nuxt = useNuxt();
	const isIgnored = createIsIgnored(nuxt);
	if (nuxt.options.debug && nuxt.options.debug.watchers) console.time("[nuxt] builder:chokidar:watch");
	let pending = 0;
	const ignoredDirs = /* @__PURE__ */ new Set([...nuxt.options.modulesDir, nuxt.options.buildDir]);
	const pathsToWatch = resolvePathsToWatch(nuxt);
	for (const dir of pathsToWatch) {
		pending++;
		const watcher = watch(dir, {
			...nuxt.options.watchers.chokidar,
			ignoreInitial: false,
			depth: 0,
			ignored: [isIgnored, /[\\/]node_modules[\\/]/]
		});
		const watchers = {};
		const disposers = /* @__PURE__ */ new Map();
		watcher.on("all", (event, path) => {
			if (event === "all" || event === "ready" || event === "error" || event === "raw") return;
			path = normalize(path);
			if (!pending) nuxt.callHook("builder:watch", event, path);
			if (event === "unlinkDir" && path in watchers) {
				watchers[path]?.close();
				disposers.get(path)?.();
				disposers.delete(path);
				delete watchers[path];
			}
			if (event === "addDir" && path !== dir && !ignoredDirs.has(path) && !pathsToWatch.has(path) && !(path in watchers) && !isIgnored(path)) {
				const pathWatcher = watchers[path] = watch(path, {
					...nuxt.options.watchers.chokidar,
					ignored: [isIgnored]
				});
				pathWatcher.on("all", (event, p) => {
					if (event === "all" || event === "ready" || event === "error" || event === "raw") return;
					nuxt.callHook("builder:watch", event, normalize(p));
				});
				const disposePathRecovery = recoverThrottledChanges(pathWatcher);
				disposers.set(path, disposePathRecovery);
				nuxt.hook("close", () => {
					disposePathRecovery();
					return pathWatcher?.close();
				});
			}
		});
		const disposeRecovery = recoverThrottledChanges(watcher);
		watcher.on("ready", () => {
			pending--;
			if (nuxt.options.debug && nuxt.options.debug.watchers && !pending) console.timeEnd("[nuxt] builder:chokidar:watch");
		});
		nuxt.hook("close", () => {
			disposeRecovery();
			for (const dispose of disposers.values()) dispose();
			disposers.clear();
			return watcher?.close();
		});
	}
}
async function createParcelWatcher() {
	const nuxt = useNuxt();
	if (nuxt.options.debug && nuxt.options.debug.watchers) console.time("[nuxt] builder:parcel:watch");
	let subscribe;
	try {
		({subscribe} = await importModule("@parcel/watcher", { url: [nuxt.options.rootDir, ...nuxt.options.modulesDir].map((d) => directoryToURL(d)) }));
	} catch {
		buildDiagnostics.NUXT_B1015();
		return false;
	}
	try {
		const pathsToWatch = resolvePathsToWatch(nuxt, { parentDirectories: true });
		for (const dir of pathsToWatch) {
			if (!await isDirectory(dir)) continue;
			const subscription = await subscribe(dir, (err, events) => {
				if (err) return;
				for (const event of events) {
					if (isIgnored(event.path)) continue;
					nuxt.callHook("builder:watch", watchEvents[event.type], normalize(event.path));
				}
			}, { ignore: [...nuxt.options.ignore, "node_modules"] });
			nuxt.hook("close", () => subscription.unsubscribe());
		}
		if (nuxt.options.debug && nuxt.options.debug.watchers) console.timeEnd("[nuxt] builder:parcel:watch");
		return true;
	} catch {
		buildDiagnostics.NUXT_B1016();
		return false;
	}
}
async function resolveBuilder(nuxt) {
	const source = typeof nuxt.options.builder === "string" ? await loadBuilder(nuxt, nuxt.options.builder) : nuxt.options.builder;
	return {
		...source,
		async bundle(nuxt) {
			try {
				await source.bundle(nuxt);
			} catch (error) {
				await nuxt.callHook("build:error", error);
				throw error;
			}
		}
	};
}
async function loadBuilder(nuxt, builder) {
	try {
		if (builder === "@nuxt/vite-builder") return await import(builder);
		return await importModule(builder, { url: [new URL(import.meta.url), directoryToURL(nuxt.options.rootDir)] });
	} catch (err) {
		throw buildDiagnostics.NUXT_B1017({
			builder,
			cause: err
		});
	}
}
const hooksToClear = [
	"vite:extend",
	"vite:extendConfig",
	"vite:configResolved",
	"vite:compiled",
	"webpack:config",
	"webpack:configResolved",
	"webpack:compile",
	"webpack:compiled",
	"webpack:change",
	"webpack:error",
	"webpack:done",
	"webpack:progress",
	"rspack:config",
	"rspack:configResolved",
	"rspack:compile",
	"rspack:compiled",
	"rspack:change",
	"rspack:error",
	"rspack:done",
	"build:manifest",
	"builder:watch",
	"builder:generateApp",
	"app:templatesGenerated"
];
function clearBuildHooks(nuxt) {
	if ("clearHook" in nuxt.hooks) for (const name of hooksToClear) nuxt.hooks.clearHook(name);
}
function resolvePathsToWatch(nuxt, opts = {}) {
	const pathsToWatch = /* @__PURE__ */ new Set();
	for (const dirs of getLayerDirectories(nuxt)) {
		if (!isIgnored(dirs.app)) pathsToWatch.add(dirs.app);
		if (!isIgnored(dirs.server) && !dirs.server.startsWith(dirs.app.replace(/\/?$/, "/"))) pathsToWatch.add(dirs.server);
	}
	for (const pattern of nuxt.options.watch) {
		if (typeof pattern !== "string") continue;
		const path = opts?.parentDirectories ? join(dirname(resolve(nuxt.options.srcDir, pattern)), "") : resolve(nuxt.options.srcDir, pattern);
		let shouldAdd = true;
		for (const w of [...pathsToWatch]) {
			if (w.startsWith(path)) pathsToWatch.delete(w);
			if (path.startsWith(w)) shouldAdd = false;
		}
		if (shouldAdd) pathsToWatch.add(path);
	}
	return pathsToWatch;
}
//#endregion
export { build, createNuxt, loadNuxt };
