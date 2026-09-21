import { performance } from "node:perf_hooks";
import { createDefu, defu } from "defu";
import { consola } from "consola";
import { AsyncLocalStorage } from "node:async_hooks";
import { getContext } from "unctx";
import { createConsoleReporter, defineDiagnostics } from "nostics";
import process from "node:process";
import { ansiFormatter } from "nostics/formatters/ansi";
import { colors } from "consola/utils";
import { isGreater, isGreaterOrEqual, satisfies } from "verkit";
import { readPackageJSON, resolvePackageJSON } from "pkg-types";
import { existsSync, lstatSync, promises, readFileSync, realpathSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { basename, dirname, isAbsolute, join, normalize, parse, relative, resolve } from "pathe";
import { interopDefault, lookupNodeModuleSubpath, parseNodeModulePath, resolveModuleExportNames } from "mlly";
import { resolveModulePath, resolveModuleURL } from "exsolve";
import { isRelative, withTrailingSlash, withoutTrailingSlash } from "ufo";
import { read, update } from "rc9";
import { createJiti } from "jiti";
import { captureStackTrace } from "errx";
import { glob } from "tinyglobby";
import { resolveAlias as resolveAlias$1, reverseResolveAlias } from "pathe/utils";
import ignore from "ignore";
import { applyDefaults } from "untyped";
import { loadConfig, setupDotenv } from "c12";
import { klona } from "klona";
import destr from "destr";
import { kebabCase, pascalCase, snakeCase } from "scule";
import { hash } from "ohash";
import { isAbsolute as isAbsolute$1, join as join$1, resolve as resolve$1 } from "node:path";
import { stat } from "node:fs/promises";
//#region src/logger.ts
const logger = consola;
function useLogger(tag, options = {}) {
	return tag ? logger.create(options).withTag(tag) : logger;
}
//#endregion
//#region src/diagnostics/_shared.ts
/**
* Resolve the docs URL for a stable `NUXT_B<NNNN>` code.
*
* Codes with a dedicated docs page pass this as their `see:` URL; codes whose
* inline why+fix is self-sufficient opt out with `docs: false`.
*/
const docsBase = (code) => `https://nuxt.com/docs/4.x/errors/${code.replace("NUXT_", "").toLowerCase()}`;
const reporters = [/* @__PURE__ */ createConsoleReporter(process.env.NODE_ENV === "test" ? void 0 : { formatter: ansiFormatter(colors) })];
//#endregion
//#region src/diagnostics/kit-api.ts
/**
* B8xxx
* Kit API diagnostics.
*/
const kitDiagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase,
	reporters,
	codes: {
		NUXT_B8001: {
			why: "The active Nuxt instance is unavailable in the current context.",
			fix: "Call this within a Nuxt module `setup()` function, or inside a `nuxt.hook()` callback.",
			docs: false
		},
		NUXT_B8002: {
			why: "The `base` argument to `createResolver(base)` is missing.",
			fix: "Pass `import.meta.url` or a directory path as the `base` argument to `createResolver()`.",
			docs: false
		},
		NUXT_B8003: {
			why: "Nitro is not initialized yet: `useNitro()` was called before the `ready` hook ran.",
			fix: "Move the `useNitro()` call inside a hook that runs after initialization, such as `nuxt.hook('ready', () => { ... })`.",
			docs: false
		},
		NUXT_B8004: {
			why: (p) => `Nuxt compatibility issues were found:\n${p.issues}`,
			fix: "Update the module to support the current Nuxt version, or check if a newer version of the module is available.",
			docs: false
		},
		NUXT_B8005: {
			why: "The Nuxt version cannot be determined: no current instance was passed.",
			fix: "Pass a valid Nuxt instance to `getNuxtVersion()`, or ensure `useNuxt()` is available in the current context.",
			docs: false
		},
		NUXT_B8006: {
			why: (p) => `No Nuxt version could be found from \`${p.cwd}\`.`,
			fix: "Run `npm install nuxt` in your project directory to install Nuxt.",
			docs: false
		},
		NUXT_B8007: {
			why: (p) => `The type template filename \`${p.template}\` is invalid.`,
			fix: "Rename the template filename to end with `.d.ts`.",
			docs: false
		},
		NUXT_B8008: {
			why: (p) => `The template value is invalid: ${p.template}.`,
			fix: "Pass a valid template object or a string path to `addTemplate()`.",
			docs: false
		},
		NUXT_B8009: {
			why: (p) => `The template was not found at \`${p.template}\`.`,
			fix: "Check that the `src` path exists and is an absolute path or resolvable from the module directory.",
			docs: false
		},
		NUXT_B8010: {
			why: (p) => `The template \`${p.template}\` provides neither \`getContents\` nor \`src\`.`,
			fix: "Add a `getContents` function or a `src` path to the template object.",
			docs: false
		},
		NUXT_B8011: {
			why: (p) => `The template is missing a \`filename\`: ${p.template}.`,
			fix: "Add a `filename` property to the template object, or provide a `src` path so the filename can be derived from it.",
			docs: false
		},
		NUXT_B8012: {
			why: (p) => `\`${p.name}\` was used outside of a Nuxt context.`,
			fix: "Register this module in the `modules` array of `nuxt.config` rather than calling it directly.",
			docs: false
		},
		NUXT_B8013: {
			why: (p) => p.message,
			fix: "Update the module to a version that supports the current Nuxt version, or set `experimental.enforceModuleCompatibility` to `true` to make this a fatal error.",
			docs: false
		},
		NUXT_B8014: {
			why: (p) => `Module \`${p.name}\` was slow to set up, taking \`${p.time}ms\`.`,
			fix: "Defer expensive operations to a later hook (e.g. `build:before`) to reduce startup time.",
			docs: false
		},
		NUXT_B8015: {
			why: (p) => `A Nuxt module must be a function or a string to import. Received: \`${p.received}\`.`,
			fix: "Pass a module function or a string package name to the `modules` array in `nuxt.config`.",
			docs: false
		},
		NUXT_B8016: {
			why: (p) => `The Nuxt module \`${p.module}\` is not a function.`,
			fix: "Ensure the module has a default export that is a function, using `defineNuxtModule()` to create a valid module.",
			docs: false
		},
		NUXT_B8017: {
			why: (p) => `The module \`${p.module}\` could not be loaded. It may not be installed.`,
			fix: (p) => `Run \`npm install ${p.module}\` to install it.`,
			docs: false
		},
		NUXT_B8018: {
			why: (p) => `An error occurred while importing the module \`${p.module}\`: ${p.error}.`,
			fix: "A sub-dependency of this module is missing. Install it, or check that the module is compatible with the current environment.",
			docs: false
		},
		NUXT_B8019: {
			why: (p) => `An error occurred while executing the ${p.phase} hook for module \`${p.name}\`: ${p.error}.`,
			fix: "Check the module's install/upgrade hook implementation, or report this issue to the module author.",
			docs: false
		}
	}
});
//#endregion
//#region src/context.ts
/**
* Direct access to the Nuxt global context - see https://github.com/unjs/unctx.
* @deprecated Use `getNuxtCtx` instead
*/
const nuxtCtx = getContext("nuxt");
/** async local storage for the name of the current nuxt instance */
const asyncNuxtStorage = getContext("asyncNuxtStorage", {
	asyncContext: true,
	AsyncLocalStorage
});
/** Direct access to the Nuxt context with asyncLocalStorage - see https://github.com/unjs/unctx. */
const getNuxtCtx = () => asyncNuxtStorage.tryUse();
/**
* Get access to Nuxt instance.
*
* Throws an error if Nuxt instance is unavailable.
* @example
* ```js
* const nuxt = useNuxt()
* ```
*/
function useNuxt() {
	const instance = asyncNuxtStorage.tryUse() || nuxtCtx.tryUse();
	if (!instance) throw kitDiagnostics.NUXT_B8001();
	return instance;
}
/**
* Get access to Nuxt instance.
*
* Returns null if Nuxt instance is unavailable.
* @example
* ```js
* const nuxt = tryUseNuxt()
* if (nuxt) {
*  // Do something
* }
* ```
*/
function tryUseNuxt() {
	return asyncNuxtStorage.tryUse() || nuxtCtx.tryUse();
}
function runWithNuxtContext(nuxt, fn) {
	return asyncNuxtStorage.call(nuxt, fn);
}
//#endregion
//#region src/compatibility.ts
const SEMANTIC_VERSION_RE = /-\d+\.[0-9a-f]+/;
function normalizeSemanticVersion(version) {
	return version.replace(SEMANTIC_VERSION_RE, "");
}
const builderMap = {
	"@nuxt/rspack-builder": "rspack",
	"@nuxt/vite-builder": "vite",
	"@nuxt/webpack-builder": "webpack"
};
function checkNuxtVersion(version, nuxt = useNuxt()) {
	const nuxtVersion = getNuxtVersion(nuxt);
	return satisfies(normalizeSemanticVersion(nuxtVersion), version, { includePrerelease: true });
}
/**
* Check version constraints and return incompatibility issues as an array
*/
async function checkNuxtCompatibility(constraints, nuxt = useNuxt()) {
	const issues = [];
	if (constraints.nuxt) {
		const nuxtVersion = getNuxtVersion(nuxt);
		if (!checkNuxtVersion(constraints.nuxt, nuxt)) issues.push({
			name: "nuxt",
			message: `Nuxt version \`${constraints.nuxt}\` is required but currently using \`${nuxtVersion}\``
		});
	}
	if (constraints.builder && typeof nuxt.options.builder === "string") {
		const currentBuilder = builderMap[nuxt.options.builder] || nuxt.options.builder;
		if (currentBuilder in constraints.builder) {
			const constraint = constraints.builder[currentBuilder];
			if (constraint === false) issues.push({
				name: "builder",
				message: `Not compatible with \`${nuxt.options.builder}\`.`
			});
			else for (const parent of [
				nuxt.options.rootDir,
				nuxt.options.workspaceDir,
				import.meta.url
			]) {
				const builderVersion = await readPackageJSON(nuxt.options.builder, { parent }).then((r) => r.version).catch(() => void 0);
				if (builderVersion) {
					if (!satisfies(normalizeSemanticVersion(builderVersion), constraint, { includePrerelease: true })) issues.push({
						name: "builder",
						message: `Not compatible with \`${builderVersion}\` of \`${currentBuilder}\`. This module requires \`${constraint}\`.`
					});
					break;
				}
			}
		}
	}
	await nuxt.callHook("kit:compatibility", constraints, issues);
	issues.toString = () => issues.map((issue) => ` - [${issue.name}] ${issue.message}`).join("\n");
	return issues;
}
/**
* Check version constraints and throw a detailed error if has any, otherwise returns true
*/
async function assertNuxtCompatibility(constraints, nuxt = useNuxt()) {
	const issues = await checkNuxtCompatibility(constraints, nuxt);
	if (issues.length) throw kitDiagnostics.NUXT_B8004({ issues: issues.toString() });
	return true;
}
/**
* Check version constraints and return true if passed, otherwise returns false
*/
async function hasNuxtCompatibility(constraints, nuxt = useNuxt()) {
	return !(await checkNuxtCompatibility(constraints, nuxt)).length;
}
/**
* Check if current Nuxt instance is of specified major version
*/
function isNuxtMajorVersion(majorVersion, nuxt = useNuxt()) {
	const version = getNuxtVersion(nuxt);
	return version[0] === majorVersion.toString() && version[1] === ".";
}
/**
* @deprecated Use `isNuxtMajorVersion(2, nuxt)` instead. This may be removed in \@nuxt/kit v5 or a future major version.
*/
function isNuxt2(nuxt = useNuxt()) {
	return isNuxtMajorVersion(2, nuxt);
}
/**
* @deprecated Use `isNuxtMajorVersion(3, nuxt)` instead. This may be removed in \@nuxt/kit v5 or a future major version.
*/
function isNuxt3(nuxt = useNuxt()) {
	return isNuxtMajorVersion(3, nuxt);
}
const NUXT_VERSION_RE = /^v/g;
/**
* Get nuxt version
*/
function getNuxtVersion(nuxt = useNuxt()) {
	const rawVersion = nuxt?._version || nuxt?.version || nuxt?.constructor?.version;
	if (typeof rawVersion !== "string") throw kitDiagnostics.NUXT_B8005();
	return rawVersion.replace(NUXT_VERSION_RE, "");
}
//#endregion
//#region src/module/define.ts
function defineNuxtModule(definition) {
	if (definition) return _defineNuxtModule(definition);
	return { with: (definition) => _defineNuxtModule(definition) };
}
function _defineNuxtModule(definition) {
	if (typeof definition === "function") return _defineNuxtModule({ setup: definition });
	const module = defu(definition, { meta: {} });
	module.meta.configKey ||= module.meta.name;
	async function getOptions(inlineOptions, nuxt = useNuxt()) {
		const nuxtConfigOptionsKey = module.meta.configKey || module.meta.name;
		const nuxtConfigOptions = nuxtConfigOptionsKey && nuxtConfigOptionsKey in nuxt.options ? nuxt.options[nuxtConfigOptionsKey] : {};
		const optionsDefaults = module.defaults instanceof Function ? await module.defaults(nuxt) : module.defaults ?? {};
		let options = defu(inlineOptions, nuxtConfigOptions, optionsDefaults);
		if (module.schema) {
			const { applyDefaults } = await import("untyped");
			options = await applyDefaults(module.schema, options);
		}
		return Promise.resolve(options);
	}
	function getModuleDependencies(nuxt = useNuxt()) {
		if (typeof module.moduleDependencies === "function") return module.moduleDependencies(nuxt);
		return module.moduleDependencies;
	}
	async function normalizedModule(inlineOptions, nuxt = tryUseNuxt()) {
		if (!nuxt) throw kitDiagnostics.NUXT_B8012({ name: module.meta.name || "module" });
		const uniqueKey = module.meta.name || module.meta.configKey;
		if (uniqueKey) {
			nuxt.options._requiredModules ||= {};
			if (nuxt.options._requiredModules[uniqueKey]) return false;
			nuxt.options._requiredModules[uniqueKey] = true;
		}
		if (module.meta.compatibility) {
			const issues = await checkNuxtCompatibility(module.meta.compatibility, nuxt);
			if (issues.length) {
				const errorMessage = `Module \`${module.meta.name}\` is disabled due to incompatibility issues:\n${issues.toString()}`;
				if (nuxt.options.experimental.enforceModuleCompatibility) {
					const error = new Error(errorMessage);
					error.name = "ModuleCompatibilityError";
					throw error;
				}
				kitDiagnostics.NUXT_B8013({ message: errorMessage });
				return;
			}
		}
		const _options = await getOptions(inlineOptions, nuxt);
		if (module.hooks) nuxt.hooks.addHooks(module.hooks);
		const moduleName = uniqueKey || module.meta.name || "<no name>";
		nuxt._perf?.startPhase(`module:${moduleName}`);
		const start = performance.now();
		let res;
		try {
			res = await module.setup?.call(null, _options, nuxt) ?? {};
		} finally {
			nuxt._perf?.endPhase(`module:${moduleName}`);
		}
		const perf = performance.now() - start;
		const setupTime = Math.round(perf * 100) / 100;
		if (setupTime > 5e3 && uniqueKey !== "@nuxt/telemetry") kitDiagnostics.NUXT_B8014({
			name: moduleName,
			time: setupTime
		});
		else if (nuxt.options.debug && nuxt.options.debug.modules) logger.info(`Module \`${moduleName}\` took \`${setupTime}ms\` to setup.`);
		if (res === false) return false;
		return defu(res, { timings: { setup: setupTime } });
	}
	normalizedModule.getMeta = () => Promise.resolve(module.meta);
	normalizedModule.getOptions = getOptions;
	normalizedModule.getModuleDependencies = getModuleDependencies;
	normalizedModule.onInstall = module.onInstall;
	normalizedModule.onUpgrade = module.onUpgrade;
	return normalizedModule;
}
//#endregion
//#region src/internal/trace.ts
const distURL = import.meta.url.replace(/\/dist\/.*$/, "/");
function getUserCaller() {
	if (!import.meta.dev) return null;
	const { source, line, column } = captureStackTrace().find((entry) => !entry.source.startsWith(distURL)) ?? {};
	if (!source) return null;
	return {
		source: source.replace(/^file:\/\//, ""),
		line,
		column
	};
}
const warnings = /* @__PURE__ */ new Set();
function warn(warning) {
	if (!warnings.has(warning)) {
		console.warn(warning);
		warnings.add(warning);
	}
}
//#endregion
//#region src/layers.ts
const layerMap = /* @__PURE__ */ new WeakMap();
/**
* Get the resolved directory paths for all layers in a Nuxt application.
*
* Returns an array of LayerDirectories objects, ordered by layer priority:
* - The first layer is the user/project layer (highest priority)
* - Earlier layers override later layers in the array
* - Base layers appear last in the array (lowest priority)
*
* @param nuxt - The Nuxt instance to get layers from. Defaults to the current Nuxt context.
* @returns Array of LayerDirectories objects, ordered by priority (user layer first)
*/
function getLayerDirectories(nuxt = useNuxt()) {
	return nuxt.options._layers.map((layer) => {
		if (layerMap.has(layer)) return layerMap.get(layer);
		const config = withTrailingSlash$2(layer.config.rootDir) === withTrailingSlash$2(nuxt.options.rootDir) ? nuxt.options : layer.config;
		const src = withTrailingSlash$2(config.srcDir || layer.cwd);
		const root = withTrailingSlash$2(config.rootDir || layer.cwd);
		const directories = {
			root,
			shared: withTrailingSlash$2(resolve(root, resolveAlias(config.dir?.shared || "shared", nuxt.options.alias))),
			server: withTrailingSlash$2(resolve(src, resolveAlias(config.serverDir || "server", nuxt.options.alias))),
			modules: withTrailingSlash$2(resolve(src, resolveAlias(config.dir?.modules || "modules", nuxt.options.alias))),
			public: withTrailingSlash$2(resolve(src, resolveAlias(config.dir?.public || "public", nuxt.options.alias))),
			app: src,
			appLayouts: withTrailingSlash$2(resolve(src, resolveAlias(config.dir?.layouts || "layouts", nuxt.options.alias))),
			appMiddleware: withTrailingSlash$2(resolve(src, resolveAlias(config.dir?.middleware || "middleware", nuxt.options.alias))),
			appPages: withTrailingSlash$2(resolve(src, resolveAlias(config.dir?.pages || "pages", nuxt.options.alias))),
			appPlugins: withTrailingSlash$2(resolve(src, resolveAlias(config.dir?.plugins || "plugins", nuxt.options.alias)))
		};
		layerMap.set(layer, directories);
		return directories;
	});
}
function withTrailingSlash$2(dir) {
	return dir.replace(/[^/]$/, "$&/");
}
//#endregion
//#region src/ignore.ts
function createIsIgnored(nuxt = tryUseNuxt()) {
	return (pathname, stats) => isIgnored(pathname, stats, nuxt);
}
const layerRootsCache = /* @__PURE__ */ new WeakMap();
/**
* Return a filter function to filter an array of paths
*/
function isIgnored(pathname, _stats, nuxt = tryUseNuxt()) {
	if (!nuxt) return false;
	if (!nuxt._ignore) {
		nuxt._ignore = ignore(nuxt.options.ignoreOptions);
		nuxt._ignore.add(resolveIgnorePatterns());
	}
	let cwds = layerRootsCache.get(nuxt);
	if (!cwds) {
		cwds = getLayerDirectories(nuxt).map((dirs) => dirs.root).sort((a, b) => b.length - a.length);
		layerRootsCache.set(nuxt, cwds);
	}
	for (const cwd of cwds) if (pathname.startsWith(cwd)) {
		const relativePath = pathname.slice(cwd.length);
		return !!(relativePath && nuxt._ignore.ignores(relativePath));
	}
	const relativePath = relative(nuxt.options.rootDir, pathname);
	if (relativePath[0] === "." && relativePath[1] === ".") return false;
	return !!(relativePath && nuxt._ignore.ignores(relativePath));
}
const NEGATION_RE = /^(!?)(.*)$/;
function resolveIgnorePatterns(relativePath) {
	const nuxt = tryUseNuxt();
	if (!nuxt) return [];
	const ignorePatterns = nuxt.options.ignore.flatMap((s) => resolveGroupSyntax(s));
	const nuxtignoreFile = join(nuxt.options.rootDir, ".nuxtignore");
	if (existsSync(nuxtignoreFile)) {
		const contents = readFileSync(nuxtignoreFile, "utf-8");
		ignorePatterns.push(...contents.trim().split(/\r?\n/));
	}
	if (relativePath) return ignorePatterns.map((p) => {
		const [_, negation = "", pattern] = p.match(NEGATION_RE) || [];
		if (pattern && pattern[0] === "*") return p;
		return negation + relative(relativePath, resolve(nuxt.options.rootDir, pattern || p));
	});
	return ignorePatterns;
}
/**
* This function turns string containing groups '**\/*.{spec,test}.{js,ts}' into an array of strings.
* For example will '**\/*.{spec,test}.{js,ts}' be resolved to:
* ['**\/*.spec.js', '**\/*.spec.ts', '**\/*.test.js', '**\/*.test.ts']
* @param group string containing the group syntax
* @returns {string[]} array of strings without the group syntax
*/
function resolveGroupSyntax(group) {
	let groups = [group];
	while (groups.some((group) => group.includes("{"))) groups = groups.flatMap((group) => {
		const [head, ...tail] = group.split("{");
		if (tail.length) {
			const [body = "", ...rest] = tail.join("{").split("}");
			return body.split(",").map((part) => `${head}${part}${rest.join("")}`);
		}
		return group;
	});
	return groups;
}
//#endregion
//#region src/utils.ts
/** @since 3.9.0 */
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}
/**
* Filter out items from an array in place. This function mutates the array.
* `predicate` get through the array from the end to the start for performance.
*
* This function should be faster than `Array.prototype.filter` on large arrays.
*/
function filterInPlace(array, predicate) {
	for (let i = array.length; i--;) if (!predicate(array[i], i, array)) array.splice(i, 1);
	return array;
}
const MODE_RE = /\.(server|client)(\.\w+)*$/;
const distDirURL = new URL(".", import.meta.url);
//#endregion
//#region src/constants.ts
/**
* Default extensions for files that may contain JSX.
* @internal
*/
const DEFAULT_JSX_FILE_EXTENSIONS = [".tsx", ".jsx"];
/** Default extensions for JavaScript/TypeScript files, in order of resolution priority. */
const DEFAULT_JS_FILE_EXTENSIONS = [
	".mjs",
	".js",
	".cjs",
	".mts",
	".ts",
	".cts",
	...DEFAULT_JSX_FILE_EXTENSIONS
];
//#endregion
//#region src/resolve.ts
/**
* Resolve the full path to a file or a directory (based on the provided type), respecting Nuxt alias and extensions options.
*
* If a path cannot be resolved, normalized input will be returned unless the `fallbackToOriginal` option is set to `true`,
* in which case the original input path will be returned.
*/
async function resolvePath(path, opts = {}) {
	const { type = "file" } = opts;
	const res = await _resolvePathGranularly(path, {
		...opts,
		type
	});
	if (res.type === type) return res.path;
	return opts.fallbackToOriginal ? path : res.path;
}
/**
* Try to resolve first existing file in paths
*/
async function findPath(paths, opts, pathType = "file") {
	for (const path of toArray(paths)) {
		const type = opts?.type || pathType;
		const res = await _resolvePathGranularly(path, {
			...opts,
			type
		});
		if (!res.type || res.type !== type) continue;
		if (res.virtual || await existsSensitive(res.path)) return res.path;
	}
	return null;
}
/**
* Resolve path aliases respecting Nuxt alias options
*/
function resolveAlias(path, alias) {
	alias ||= tryUseNuxt()?.options.alias || {};
	return resolveAlias$1(path, alias);
}
/**
* Create a relative resolver
*/
function createResolver(base) {
	if (!base) throw kitDiagnostics.NUXT_B8002();
	base = base.toString();
	if (base.startsWith("file://")) base = dirname(fileURLToPath(base));
	return {
		resolve: (...path) => resolve(base, ...path),
		resolvePath: (path, opts) => resolvePath(path, {
			cwd: base,
			...opts
		})
	};
}
async function resolveNuxtModule(base, paths) {
	const resolved = [];
	const resolver = createResolver(base);
	for (const path of paths) {
		if (path.startsWith(base)) {
			resolved.push(path.split("/index.ts")[0]);
			continue;
		}
		const resolvedPath = await resolver.resolvePath(path);
		const dir = parseNodeModulePath(resolvedPath).dir;
		if (dir) {
			resolved.push(dir);
			continue;
		}
		const index = resolvedPath.lastIndexOf(path);
		resolved.push(index === -1 ? dirname(resolvedPath) : resolvedPath.slice(0, index + path.length));
	}
	return resolved;
}
async function _resolvePathType(path, opts = {}, skipFs = false) {
	if (opts?.virtual && existsInVFS(path)) return {
		path,
		type: "file",
		virtual: true
	};
	if (skipFs) return;
	const stats = await promises.stat(path).catch(() => null);
	if (stats) return {
		path,
		type: stats.isFile() ? "file" : "dir",
		virtual: false
	};
}
function normalizeExtension(ext) {
	return ext.startsWith(".") ? ext : `.${ext}`;
}
async function _resolvePathGranularly(path, opts = { type: "file" }) {
	const _path = path;
	path = normalize(path);
	if (isAbsolute(path)) {
		const res = await _resolvePathType(path, opts);
		if (res && res.type === opts.type) return res;
	}
	const nuxt = tryUseNuxt();
	const cwd = opts.cwd || (nuxt ? nuxt.options.rootDir : process.cwd());
	const extensions = opts.extensions || (nuxt ? nuxt.options.extensions : [...DEFAULT_JS_FILE_EXTENSIONS, ".json"]);
	const modulesDir = nuxt ? nuxt.options.modulesDir : [];
	path = resolveAlias$1(path, opts.alias ?? nuxt?.options.alias ?? {});
	if (!isAbsolute(path)) path = resolve(cwd, path);
	const res = await _resolvePathType(path, opts);
	if (res && res.type === opts.type) return res;
	if (opts.type === "file") {
		for (const ext of extensions) {
			const normalizedExt = normalizeExtension(ext);
			const extPath = await _resolvePathType(path + normalizedExt, opts);
			if (extPath && extPath.type === "file") return extPath;
			const indexPath = await _resolvePathType(join(path, "index" + normalizedExt), opts, res?.type !== "dir");
			if (indexPath && indexPath.type === "file") return indexPath;
		}
		const resolvedModulePath = resolveModulePath(_path, {
			try: true,
			suffixes: ["", "index"],
			from: [cwd, ...modulesDir].map((d) => directoryToURL(d))
		});
		if (resolvedModulePath) return {
			path: resolvedModulePath,
			type: "file",
			virtual: false
		};
	}
	return { path };
}
async function existsSensitive(path) {
	return new Set(await promises.readdir(dirname(path)).catch(() => [])).has(basename(path));
}
function existsInVFS(path, nuxt = tryUseNuxt()) {
	if (!nuxt) return false;
	if (path in nuxt.vfs) return true;
	return (nuxt.apps.default?.templates ?? nuxt.options.build.templates).some((template) => template.dst === path);
}
/**
* Resolve absolute file paths in the provided directory with respect to `.nuxtignore` and return them sorted.
* @param path path to the directory to resolve files in
* @param pattern glob pattern or an array of glob patterns to match files
* @param opts options for globbing
* @param opts.followSymbolicLinks whether to follow symbolic links, default is `true`
* @param opts.ignore additional glob patterns to ignore
* @returns sorted array of absolute file paths
*/
async function resolveFiles(path, pattern, opts = {}) {
	const files = [];
	for (const p of await glob(pattern, {
		cwd: path,
		followSymbolicLinks: opts.followSymbolicLinks ?? true,
		absolute: true,
		ignore: opts.ignore
	})) if (!isIgnored(p)) files.push(p);
	return files.sort();
}
//#endregion
//#region src/internal/esm.ts
function directoryToURL(dir) {
	return pathToFileURL(dir + "/");
}
function tryResolveModule(id, url = import.meta.url) {
	return Promise.resolve(resolveModulePath(id, {
		from: url,
		suffixes: ["", "index"],
		try: true
	}));
}
function resolveModule(id, options) {
	return resolveModulePath(id, {
		from: options?.url ?? options?.paths ?? [import.meta.url],
		extensions: options?.extensions ?? DEFAULT_JS_FILE_EXTENSIONS
	});
}
async function importModule(id, opts) {
	const resolvedPath = resolveModule(id, opts);
	return await import(pathToFileURL(resolvedPath).href).then((r) => opts?.interopDefault !== false ? interopDefault(r) : r);
}
function tryImportModule(id, opts) {
	try {
		return importModule(id, opts).catch(() => void 0);
	} catch {}
}
/**
* @deprecated Please use `importModule` instead.
*/
function requireModule(id, opts) {
	const caller = getUserCaller();
	warn(`[@nuxt/kit] \`requireModule\` is deprecated${caller ? ` (used at \`${resolveAlias(caller.source)}:${caller.line}:${caller.column}\`)` : ""}. Please use \`importModule\` instead.`);
	const resolvedPath = resolveModule(id, opts);
	return createJiti(import.meta.url, { interopDefault: opts?.interopDefault !== false })(pathToFileURL(resolvedPath).href);
}
/**
* @deprecated Please use `tryImportModule` instead.
*/
function tryRequireModule(id, opts) {
	try {
		return requireModule(id, opts);
	} catch {}
}
//#endregion
//#region src/module/install.ts
const NODE_MODULES_RE = /[/\\]node_modules[/\\]/;
const ignoredConfigKeys = /* @__PURE__ */ new Set([
	"components",
	"imports",
	"pages",
	"devtools",
	"telemetry"
]);
/**
* Installs a set of modules on a Nuxt instance.
* @internal
*/
async function installModules(modulesToInstall, resolvedModulePaths, nuxt = useNuxt()) {
	const localLayerModuleDirs = [];
	for (const l of nuxt.options._layers) {
		const srcDir = l.config.srcDir || l.cwd;
		if (!NODE_MODULES_RE.test(srcDir)) localLayerModuleDirs.push(resolve(srcDir, l.config?.dir?.modules || "modules").replace(/\/?$/, "/"));
	}
	nuxt._moduleOptionsFunctions ||= /* @__PURE__ */ new Map();
	const resolvedModules = [];
	const modulesByMetaName = /* @__PURE__ */ new Map();
	const moduleLoadCache = /* @__PURE__ */ new Map();
	for (const [key] of modulesToInstall) moduleLoadCache.set(key, loadNuxtModuleInstance(key, nuxt));
	const inlineConfigKeys = new Set(await Promise.all([...modulesToInstall].map(async ([mod]) => {
		if (typeof mod === "string") return;
		const meta = await Promise.resolve(mod.getMeta?.());
		if (meta?.name) modulesByMetaName.set(meta.name, mod);
		if (meta?.configKey) {
			if (meta.configKey !== meta.name) modulesByMetaName.set(meta.configKey, mod);
			return meta.configKey;
		}
	})));
	let error;
	const dependencyMap = /* @__PURE__ */ new Map();
	for (const [key, options] of modulesToInstall) {
		const res = await (moduleLoadCache.get(key) || loadNuxtModuleInstance(key, nuxt)).catch((err) => {
			if (dependencyMap.has(key) && typeof key === "string") err.cause = `Could not resolve \`${key}\` (specified as a dependency of ${dependencyMap.get(key)}).`;
			throw err;
		});
		const dependencyMeta = await res.nuxtModule.getModuleDependencies?.(nuxt) || {};
		for (const [name, value] of Object.entries(dependencyMeta)) {
			if (!value.overrides && !value.defaults && !value.version && value.optional) continue;
			const resolvedModule = modulesByMetaName.has(name) ? resolveModuleWithOptions(modulesByMetaName.get(name), nuxt) : resolveModuleWithOptions(name, nuxt);
			const moduleToAttribute = typeof key === "string" ? `\`${key}\`` : "a module in `nuxt.options`";
			if (!resolvedModule?.module) {
				const message = `Could not resolve \`${name}\` (specified as a dependency of ${moduleToAttribute}).`;
				error = new TypeError(message);
				continue;
			}
			if (value.version) {
				const resolvePaths = [res.resolvedModulePath, ...nuxt.options.modulesDir].filter(Boolean);
				const pkg = await readPackageJSON(name, { from: resolvePaths }).catch(() => null);
				if (pkg?.version && !satisfies(pkg.version, value.version, { includePrerelease: true })) {
					const message = `Module \`${name}\` version (\`${pkg.version}\`) does not satisfy \`${value.version}\` (requested by ${moduleToAttribute}).`;
					error = new TypeError(message);
				}
			}
			if (value.overrides || value.defaults) {
				const currentFns = nuxt._moduleOptionsFunctions.get(resolvedModule.module) || [];
				nuxt._moduleOptionsFunctions.set(resolvedModule.module, [...currentFns, () => ({
					defaults: value.defaults,
					overrides: value.overrides
				})]);
			}
			if (value.optional === true) continue;
			nuxt.options.typescript.hoist.push(name);
			if (resolvedModule && !modulesToInstall.has(resolvedModule.module) && (!resolvedModule.resolvedPath || !resolvedModulePaths.has(resolvedModule.resolvedPath))) {
				if (typeof resolvedModule.module === "string" && inlineConfigKeys.has(resolvedModule.module)) continue;
				modulesToInstall.set(resolvedModule.module, resolvedModule.options);
				dependencyMap.set(resolvedModule.module, moduleToAttribute);
				const path = resolvedModule.resolvedPath || resolvedModule.module;
				if (typeof path === "string") resolvedModulePaths.add(path);
			}
		}
		resolvedModules.push({
			moduleToInstall: key,
			meta: await res.nuxtModule.getMeta?.(),
			nuxtModule: res.nuxtModule,
			buildTimeModuleMeta: res.buildTimeModuleMeta,
			resolvedModulePath: res.resolvedModulePath,
			inlineOptions: options
		});
	}
	if (error) throw error;
	for (const { nuxtModule, meta = {}, moduleToInstall, buildTimeModuleMeta, resolvedModulePath, inlineOptions } of resolvedModules) {
		const configKey = meta.configKey;
		const optionsFns = /* @__PURE__ */ new Set([
			...nuxt._moduleOptionsFunctions.get(moduleToInstall) || [],
			...meta?.name ? nuxt._moduleOptionsFunctions.get(meta.name) || [] : [],
			...configKey ? nuxt._moduleOptionsFunctions.get(configKey) || [] : []
		]);
		if (optionsFns.size > 0) {
			const overrides = [];
			const defaults = [];
			for (const fn of optionsFns) {
				const options = fn();
				overrides.push(options.overrides);
				defaults.push(options.defaults);
			}
			if (configKey) nuxt.options[configKey] = defu(...overrides, nuxt.options[configKey], ...defaults);
		}
		const isDisabled = configKey && !ignoredConfigKeys.has(configKey) && nuxt.options[configKey] === false;
		if (!isDisabled) await callLifecycleHooks(nuxtModule, meta, inlineOptions, nuxt);
		const path = typeof moduleToInstall === "string" ? moduleToInstall : void 0;
		await callModule(nuxt, nuxtModule, inlineOptions, {
			meta: defu({ disabled: isDisabled }, meta, buildTimeModuleMeta),
			nameOrPath: path,
			modulePath: resolvedModulePath || path,
			localLayerModuleDirs
		});
	}
	delete nuxt._moduleOptionsFunctions;
}
/**
* Installs a module on a Nuxt instance.
* @deprecated Use module dependencies.
*/
async function installModule(moduleToInstall, inlineOptions, nuxt = useNuxt()) {
	const { nuxtModule, buildTimeModuleMeta, resolvedModulePath } = await loadNuxtModuleInstance(moduleToInstall, nuxt);
	const localLayerModuleDirs = [];
	for (const dirs of getLayerDirectories(nuxt)) if (!NODE_MODULES_RE.test(dirs.app)) localLayerModuleDirs.push(dirs.modules);
	const meta = await nuxtModule.getMeta?.();
	let mergedOptions = inlineOptions;
	const configKey = meta?.configKey;
	if (configKey && nuxt._moduleOptionsFunctions) {
		const optionsFns = [...nuxt._moduleOptionsFunctions.get(moduleToInstall) || [], ...nuxt._moduleOptionsFunctions.get(configKey) || []];
		if (optionsFns.length > 0) {
			const overrides = [];
			const defaults = [];
			for (const fn of optionsFns) {
				const options = fn();
				overrides.push(options.overrides);
				defaults.push(options.defaults);
			}
			mergedOptions = defu(inlineOptions, ...overrides, nuxt.options[configKey], ...defaults);
			nuxt.options[configKey] = mergedOptions;
		}
	}
	const isDisabled = configKey && !ignoredConfigKeys.has(configKey) && nuxt.options[configKey] === false;
	if (!isDisabled) await callLifecycleHooks(nuxtModule, meta, mergedOptions, nuxt);
	const path = typeof moduleToInstall === "string" ? moduleToInstall : void 0;
	await callModule(nuxt, nuxtModule, mergedOptions, {
		meta: defu({ disabled: isDisabled }, meta, buildTimeModuleMeta),
		nameOrPath: path,
		modulePath: resolvedModulePath || path,
		localLayerModuleDirs
	});
}
function resolveModuleWithOptions(definition, nuxt) {
	const [module, options = {}] = Array.isArray(definition) ? definition : [definition, {}];
	if (!module) return;
	if (typeof module !== "string") return {
		module,
		options
	};
	const modAlias = resolveAlias(module, nuxt.options.alias);
	return {
		module,
		resolvedPath: resolveModulePath(modAlias, {
			try: true,
			from: nuxt.options.modulesDir.map((m) => directoryToURL(m.replace(/\/node_modules\/?$/, "/"))),
			suffixes: [
				"nuxt",
				"nuxt/index",
				"module",
				"module/index",
				"",
				"index"
			],
			extensions: DEFAULT_JS_FILE_EXTENSIONS
		}) || modAlias,
		options
	};
}
let _jitiCache;
function getSharedJiti(nuxt) {
	_jitiCache ||= /* @__PURE__ */ new WeakMap();
	let jiti = _jitiCache.get(nuxt);
	if (!jiti) {
		jiti = import("jiti").then(({ createJiti }) => createJiti(nuxt.options.rootDir, { alias: nuxt.options.alias }));
		_jitiCache.set(nuxt, jiti);
	}
	return jiti;
}
async function loadNuxtModuleInstance(nuxtModule, nuxt = useNuxt()) {
	let buildTimeModuleMeta = {};
	if (typeof nuxtModule === "function") return {
		nuxtModule,
		buildTimeModuleMeta
	};
	if (typeof nuxtModule !== "string") throw kitDiagnostics.NUXT_B8015({ received: `${typeof nuxtModule} (${JSON.stringify(nuxtModule)})` });
	const jiti = await getSharedJiti(nuxt);
	nuxtModule = resolveAlias(nuxtModule, nuxt.options.alias);
	if (isRelative(nuxtModule)) nuxtModule = resolve(nuxt.options.rootDir, nuxtModule);
	let src;
	try {
		src = resolveModuleURL(nuxtModule, {
			from: nuxt.options.modulesDir.map((m) => directoryToURL(m.replace(/\/node_modules\/?$/, "/"))),
			suffixes: [
				"nuxt",
				"nuxt/index",
				"module",
				"module/index",
				"",
				"index"
			],
			extensions: DEFAULT_JS_FILE_EXTENSIONS
		});
	} catch (error) {
		throw kitDiagnostics.NUXT_B8017({
			module: nuxtModule,
			cause: error
		});
	}
	const resolvedModulePath = fileURLToPath(src);
	let resolvedNuxtModule;
	try {
		resolvedNuxtModule = await jiti.import(src, { default: true });
	} catch (error) {
		throw kitDiagnostics.NUXT_B8018({
			module: nuxtModule,
			error: String(error),
			cause: error
		});
	}
	if (typeof resolvedNuxtModule !== "function") throw kitDiagnostics.NUXT_B8016({ module: nuxtModule });
	const moduleMetadataPath = new URL("module.json", src);
	if (existsSync(moduleMetadataPath)) buildTimeModuleMeta = JSON.parse(await promises.readFile(moduleMetadataPath, "utf-8"));
	return {
		nuxtModule: resolvedNuxtModule,
		buildTimeModuleMeta,
		resolvedModulePath
	};
}
function getDirectory(p) {
	try {
		return isAbsolute(p) && lstatSync(p).isFile() ? dirname(p) : p;
	} catch {}
	return p;
}
const normalizeModuleTranspilePath = (p) => {
	return getDirectory(p).split("node_modules/").pop();
};
async function callLifecycleHooks(nuxtModule, meta = {}, inlineOptions, nuxt = useNuxt()) {
	if (!meta.name || !meta.version) return;
	if (!nuxtModule.onInstall && !nuxtModule.onUpgrade) return;
	const previousVersion = read({
		dir: nuxt.options.rootDir,
		name: ".nuxtrc"
	})?.setups?.[meta.name];
	try {
		if (!previousVersion) await nuxtModule.onInstall?.(nuxt);
		else if (isGreater(meta.version, previousVersion)) await nuxtModule.onUpgrade?.(nuxt, inlineOptions, previousVersion);
		if (previousVersion !== meta.version) update({ setups: { [meta.name]: meta?.version } }, {
			dir: nuxt.options.rootDir,
			name: ".nuxtrc"
		});
	} catch (e) {
		kitDiagnostics.NUXT_B8019({
			phase: !previousVersion ? "install" : "upgrade",
			name: meta.name,
			error: String(e)
		});
	}
}
async function callModule(nuxt, nuxtModule, moduleOptions = {}, options) {
	const modulePath = options.modulePath;
	const nameOrPath = options.nameOrPath;
	const localLayerModuleDirs = options.localLayerModuleDirs;
	const fn = () => nuxt.options.experimental?.debugModuleMutation && nuxt._asyncLocalStorageModule ? nuxt._asyncLocalStorageModule.run(nuxtModule, () => nuxtModule(moduleOptions, nuxt)) : nuxtModule(moduleOptions, nuxt);
	const res = options.meta.disabled ? false : await fn();
	let entryPath;
	if (typeof modulePath === "string") {
		const parsed = parseNodeModulePath(modulePath);
		if (parsed.name) {
			const subpath = await lookupNodeModuleSubpath(modulePath) || ".";
			entryPath = join(parsed.name, subpath === "./" ? "." : subpath);
		}
		if (res !== false) {
			const moduleRoot = parsed.dir ? parsed.dir + parsed.name : await resolvePackageJSON(modulePath, { try: true }).then((r) => r ? dirname(r) : modulePath);
			nuxt.options.build.transpile.push(normalizeModuleTranspilePath(moduleRoot));
			const directory = moduleRoot.replace(/\/?$/, "/");
			if (moduleRoot !== nameOrPath && !localLayerModuleDirs.some((dir) => directory.startsWith(dir))) nuxt.options.modulesDir.push(join(moduleRoot, "node_modules"));
		}
	}
	if (nameOrPath) {
		entryPath ||= resolveAlias(nameOrPath, nuxt.options.alias);
		if (entryPath !== nameOrPath) options.meta.rawPath = nameOrPath;
	}
	nuxt.options._installedModules ||= [];
	nuxt.options._installedModules.push({
		meta: options.meta,
		module: nuxtModule,
		timings: (res || {}).timings,
		entryPath
	});
}
//#endregion
//#region src/module/compatibility.ts
function resolveNuxtModuleEntryName(m) {
	if (typeof m === "object" && !Array.isArray(m)) return m.name;
	if (Array.isArray(m)) return resolveNuxtModuleEntryName(m[0]);
	return m || false;
}
/**
* Check if a Nuxt module is installed by name.
*
* This will check both the installed modules and the modules to be installed. Note
* that it cannot detect if a module is _going to be_ installed programmatically by another module.
*/
function hasNuxtModule(moduleName, nuxt = useNuxt()) {
	return nuxt.options._installedModules.some(({ meta }) => meta.name === moduleName) || nuxt.options.modules.some((m) => moduleName === resolveNuxtModuleEntryName(m));
}
/**
* Checks if a Nuxt module is compatible with a given semver version.
*/
async function hasNuxtModuleCompatibility(module, semverVersion, nuxt = useNuxt()) {
	const version = await getNuxtModuleVersion(module, nuxt);
	if (!version) return false;
	return satisfies(normalizeSemanticVersion(version), semverVersion, { includePrerelease: true });
}
/**
* Get the version of a Nuxt module.
*
* Scans installed modules for the version, if it's not found it will attempt to load the module instance and get the version from there.
*/
async function getNuxtModuleVersion(module, nuxt = useNuxt()) {
	const moduleMeta = (typeof module === "string" ? { name: module } : await module.getMeta?.()) || {};
	if (moduleMeta.version) return moduleMeta.version;
	if (!moduleMeta.name) return false;
	for (const m of nuxt.options._installedModules) if (m.meta.name === moduleMeta.name && m.meta.version) return m.meta.version;
	if (hasNuxtModule(moduleMeta.name)) {
		const { nuxtModule, buildTimeModuleMeta } = await loadNuxtModuleInstance(moduleMeta.name, nuxt);
		return buildTimeModuleMeta.version || await nuxtModule.getMeta?.().then((r) => r.version) || false;
	}
	return false;
}
//#endregion
//#region src/loader/config.ts
const merger = createDefu((obj, key, value) => {
	if (Array.isArray(obj[key]) && Array.isArray(value)) {
		obj[key] = obj[key].concat(value);
		return true;
	}
});
async function loadNuxtConfig(opts) {
	const rootCwd = resolve(opts.cwd || process.cwd());
	const localLayers = (await glob("layers/*", {
		onlyDirectories: true,
		cwd: rootCwd
	})).map((d) => withTrailingSlash(d)).sort((a, b) => b.localeCompare(a));
	opts.overrides = defu(opts.overrides, { _extends: localLayers });
	const autoScanSources = new Set(localLayers);
	const localLayerDirs = new Set(localLayers.map((dir) => canonicalLayerDir(resolve(rootCwd, withoutTrailingSlash(dir)))));
	const extendsLocalLayerOrder = [];
	if (opts.dotenv !== false) await setupDotenv({
		cwd: opts.cwd || process.cwd(),
		...typeof opts.dotenv === "object" ? opts.dotenv : {}
	});
	const schemaPromise = loadNuxtSchema(opts.cwd || process.cwd());
	const seenLayerDirs = /* @__PURE__ */ new Set();
	const resolved = await withDefineNuxtConfig(() => loadConfig({
		name: "nuxt",
		configFile: "nuxt.config",
		rcFile: ".nuxtrc",
		extend: { extendKey: [
			"theme",
			"_extends",
			"extends"
		] },
		globalRc: true,
		merger,
		...opts,
		dotenv: false,
		async resolve(source, resolveOptions) {
			const custom = await opts.resolve?.(source, resolveOptions);
			if (custom) return custom;
			if (typeof source !== "string") return;
			const base = resolveOptions.cwd ? resolve(resolveOptions.cwd) : rootCwd;
			const aliased = resolveLayerExtendsAlias(source, rootCwd);
			const path = aliased ?? resolve(base, source);
			if (!existsSync(path)) return;
			const layerDir = canonicalLayerDir(path);
			if (base === rootCwd && !autoScanSources.has(source) && localLayerDirs.has(layerDir)) extendsLocalLayerOrder.push(layerDir);
			if (seenLayerDirs.has(layerDir)) return {
				config: {},
				cwd: layerDir,
				source
			};
			seenLayerDirs.add(layerDir);
			if (aliased) {
				const layer = await loadConfig({
					cwd: aliased,
					name: "nuxt",
					configFile: "nuxt.config",
					rcFile: false,
					extend: false,
					jiti: resolveOptions.jiti
				});
				return layer.configFile ? {
					config: layer.config,
					configFile: layer.configFile,
					cwd: aliased,
					source: aliased,
					meta: layer.meta
				} : {
					config: {},
					cwd: aliased,
					source
				};
			}
		}
	}));
	const { configFile, layers = [], cwd, meta } = resolved;
	const nuxtConfig = klona(resolved.config);
	nuxtConfig.rootDir ||= cwd;
	nuxtConfig._nuxtConfigFile = configFile;
	nuxtConfig._nuxtConfigFiles = [configFile];
	nuxtConfig._loadOptions = opts;
	if (typeof opts.envName === "string") nuxtConfig.envName = opts.envName;
	nuxtConfig.alias ||= {};
	if (meta?.name) {
		const alias = `#layers/${meta.name}`;
		nuxtConfig.alias[alias] ||= withTrailingSlash(nuxtConfig.rootDir);
	}
	const defaultBuildDir = join(nuxtConfig.rootDir, ".nuxt");
	if (!opts.overrides?._prepare && !nuxtConfig.dev && !nuxtConfig.buildDir && existsSync(defaultBuildDir)) nuxtConfig.buildDir = join(nuxtConfig.rootDir, "node_modules/.cache/nuxt/.nuxt");
	const NuxtConfigSchema = await schemaPromise;
	const layerSchemaKeys = [
		"future",
		"srcDir",
		"rootDir",
		"serverDir",
		"dir"
	];
	const layerSchema = Object.create(null);
	for (const key of layerSchemaKeys) if (key in NuxtConfigSchema) layerSchema[key] = NuxtConfigSchema[key];
	const _layers = [];
	const processedLayers = /* @__PURE__ */ new Set();
	const localRelativePaths = new Set(localLayers.map((layer) => withoutTrailingSlash(layer)));
	for (const layer of layers) {
		const resolvedRootDir = layer.config?.rootDir ?? layer.cwd;
		layer.config = {
			...layer.config || {},
			rootDir: resolvedRootDir
		};
		if (processedLayers.has(resolvedRootDir)) continue;
		processedLayers.add(resolvedRootDir);
		layer.config = await applyDefaults(layerSchema, layer.config);
		if (!layer.configFile || layer.configFile.endsWith(".nuxtrc")) continue;
		if (layer.cwd && cwd && localRelativePaths.has(relative(cwd, layer.cwd))) {
			layer.meta ||= {};
			layer.meta.name ||= basename(layer.cwd);
		}
		if (layer.meta?.name) {
			const alias = `#layers/${layer.meta.name}`;
			nuxtConfig.alias[alias] ||= withTrailingSlash(layer.config.rootDir || layer.cwd);
		}
		_layers.push(layer);
	}
	if (extendsLocalLayerOrder.length) reorderLocalLayersByExtends(_layers, extendsLocalLayerOrder, localLayerDirs);
	nuxtConfig._layers = _layers;
	if (!_layers.length) _layers.push({
		cwd,
		config: {
			rootDir: cwd,
			srcDir: cwd
		}
	});
	return await applyDefaults(NuxtConfigSchema, nuxtConfig);
}
/**
* Canonicalise a filesystem path to a layer directory: config-file paths collapse to their
* directory and symlinks resolve to their target, so different spellings of the same layer
* share one identity. The path must exist.
*/
function canonicalLayerDir(path) {
	return normalize(realpathSync(statSync(path).isDirectory() ? path : dirname(path)));
}
const LAYER_EXTENDS_ALIASES = [
	"~~",
	"@@",
	"~",
	"@"
];
/**
* Resolve a leading `~`, `~~`, `@` or `@@` alias in an `extends` source to an absolute path.
* Local layers live at the project root, so every alias resolves against `rootDir`. Returns
* `undefined` when the source is not alias-prefixed.
*/
function resolveLayerExtendsAlias(source, rootDir) {
	for (const alias of LAYER_EXTENDS_ALIASES) {
		if (source === alias) return rootDir;
		if (source.startsWith(`${alias}/`)) return join(rootDir, source.slice(alias.length + 1));
	}
}
/**
* Reorder local layers (from the `~~/layers/` directory) in place to match the order they are
* listed in `extends` (first entry = highest priority). Listed layers come first in that order;
* unlisted local layers keep their existing alphabetical order after them. Non-local layers keep
* their positions.
*/
function reorderLocalLayersByExtends(layers, extendsOrder, localLayerDirs) {
	const layerDir = (layer) => {
		const dir = withoutTrailingSlash(layer.config?.rootDir ?? layer.cwd ?? "");
		try {
			return normalize(realpathSync(dir));
		} catch {
			return normalize(dir);
		}
	};
	const priorityByDir = new Map(extendsOrder.map((dir, index) => [dir, index]));
	const localSlots = [];
	const localLayers = [];
	for (let index = 0; index < layers.length; index++) if (localLayerDirs.has(layerDir(layers[index]))) {
		localSlots.push(index);
		localLayers.push(layers[index]);
	}
	const orderedLocalLayers = localLayers.map((layer, index) => ({
		layer,
		index
	})).sort((a, b) => {
		return (priorityByDir.get(layerDir(a.layer)) ?? Number.POSITIVE_INFINITY) - (priorityByDir.get(layerDir(b.layer)) ?? Number.POSITIVE_INFINITY) || a.index - b.index;
	}).map((entry) => entry.layer);
	localSlots.forEach((slot, index) => {
		layers[slot] = orderedLocalLayers[index];
	});
}
function loadNuxtSchema(cwd) {
	const url = directoryToURL(cwd);
	const urls = [url];
	const nuxtPath = resolveModuleURL("nuxt", {
		try: true,
		from: url
	}) ?? resolveModuleURL("nuxt-nightly", {
		try: true,
		from: url
	});
	if (nuxtPath) urls.unshift(nuxtPath);
	return import(resolveModuleURL("@nuxt/schema", {
		try: true,
		from: urls
	}) ?? "@nuxt/schema").then((r) => r.NuxtConfigSchema);
}
async function withDefineNuxtConfig(fn) {
	const key = "defineNuxtConfig";
	const globalSelf = globalThis;
	if (!globalSelf[key]) {
		globalSelf[key] = (c) => c;
		globalSelf[key].count = 0;
	}
	globalSelf[key].count++;
	try {
		return await fn();
	} finally {
		globalSelf[key].count--;
		if (!globalSelf[key].count) delete globalSelf[key];
	}
}
//#endregion
//#region src/loader/schema.ts
function extendNuxtSchema(def) {
	useNuxt().hook("schema:extend", (schemas) => {
		schemas.push(typeof def === "function" ? def() : def);
	});
}
//#endregion
//#region src/loader/nuxt.ts
async function loadNuxt(opts) {
	opts.cwd = resolve(opts.cwd || opts.rootDir || ".");
	opts.overrides ||= opts.config || {};
	opts.overrides.dev = !!opts.dev;
	const resolvedPath = ["nuxt-nightly", "nuxt"].reduce((resolvedPath, pkg) => {
		const path = resolveModulePath(pkg, {
			try: true,
			from: [directoryToURL(opts.cwd)]
		});
		return path && path.length > resolvedPath.length ? path : resolvedPath;
	}, "");
	if (!resolvedPath) throw kitDiagnostics.NUXT_B8006({ cwd: opts.cwd });
	const { loadNuxt } = await import(pathToFileURL(resolvedPath).href).then((r) => interopDefault(r));
	return await loadNuxt(opts);
}
async function buildNuxt(nuxt) {
	const rootURL = directoryToURL(nuxt.options.rootDir);
	const { build } = await tryImportModule("nuxt-nightly", { url: rootURL }) || await importModule("nuxt", { url: rootURL });
	return runWithNuxtContext(nuxt, () => build(nuxt));
}
//#endregion
//#region src/head.ts
function setGlobalHead(head) {
	const nuxt = useNuxt();
	nuxt.options.app.head = defu(head, nuxt.options.app.head);
}
//#endregion
//#region src/imports.ts
function addImports(imports) {
	useNuxt().hook("imports:extend", (_imports) => {
		_imports.push(...toArray(imports));
	});
}
function addImportsDir(dirs, opts = {}) {
	useNuxt().hook("imports:dirs", (_dirs) => {
		for (const dir of toArray(dirs)) _dirs[opts.prepend ? "unshift" : "push"](dir);
	});
}
function addImportsSources(presets) {
	useNuxt().hook("imports:sources", (_presets) => {
		for (const preset of toArray(presets)) _presets.push(preset);
	});
}
//#endregion
//#region src/app-config.ts
/**
* Update Nuxt app configuration.
* @since 4.5.0
*/
function updateAppConfig(appConfig) {
	const nuxt = useNuxt();
	Object.assign(nuxt.options.appConfig, defu(appConfig, nuxt.options.appConfig));
}
//#endregion
//#region src/nitro.ts
const HANDLER_METHOD_RE = /\.(get|head|patch|post|put|delete|connect|options|trace)(\.\w+)*$/;
/**
* normalize handler object
*
*/
function normalizeHandlerMethod(handler) {
	const [, method = void 0] = handler.handler.match(HANDLER_METHOD_RE) || [];
	return {
		method: method?.toUpperCase(),
		...handler,
		handler: normalize(handler.handler)
	};
}
/**
* Adds a nitro server handler
*
*/
function addServerHandler(handler) {
	useNuxt().options.serverHandlers.push(normalizeHandlerMethod(handler));
}
/**
* Adds a nitro server handler for development-only
*
*/
function addDevServerHandler(handler) {
	useNuxt().options.devServerHandlers.push(handler);
}
/**
* Adds a Nitro plugin
*/
function addServerPlugin(plugin) {
	const nuxt = useNuxt();
	nuxt.options.nitro.plugins ||= [];
	nuxt.options.nitro.plugins.push(normalize(plugin));
}
/**
* Adds routes to be prerendered
*/
function addPrerenderRoutes(routes) {
	const nuxt = useNuxt();
	routes = toArray(routes).filter(Boolean);
	if (!routes.length) return;
	nuxt.hook("prerender:routes", (ctx) => {
		for (const route of routes) ctx.routes.add(route);
	});
}
/**
* Access to the Nitro instance
*
* **Note:** You can call `useNitro()` only after `ready` hook.
*
* **Note:** Changes to the Nitro instance configuration are not applied.
* @example
*
* ```ts
* nuxt.hook('ready', () => {
*   console.log(useNitro())
* })
* ```
*/
function useNitro() {
	const nuxt = useNuxt();
	if (!nuxt._nitro) throw kitDiagnostics.NUXT_B8003();
	return nuxt._nitro;
}
/**
* Add server imports to be auto-imported by Nitro
*/
function addServerImports(imports) {
	const nuxt = useNuxt();
	const _imports = toArray(imports);
	nuxt.hook("nitro:config", (config) => {
		config.imports ||= {};
		config.imports.imports ||= [];
		config.imports.imports.push(..._imports);
	});
}
/**
* Add directories to be scanned for auto-imports by Nitro
*/
function addServerImportsDir(dirs, opts = {}) {
	const nuxt = useNuxt();
	const _dirs = toArray(dirs);
	nuxt.hook("nitro:config", (config) => {
		config.imports ||= {};
		config.imports.dirs ||= [];
		config.imports.dirs[opts.prepend ? "unshift" : "push"](..._dirs);
	});
}
/**
* Add directories to be scanned by Nitro. It will check for subdirectories,
* which will be registered just like the `~~/server` folder is.
*/
function addServerScanDir(dirs, opts = {}) {
	useNuxt().hook("nitro:config", (config) => {
		config.scanDirs ||= [];
		for (const dir of toArray(dirs)) config.scanDirs[opts.prepend ? "unshift" : "push"](dir);
	});
}
//#endregion
//#region src/runtime-config.ts
/**
* Access 'resolved' Nuxt runtime configuration, with values updated from environment.
*
* This mirrors the runtime behavior of Nitro.
*/
function useRuntimeConfig() {
	const nuxt = useNuxt();
	return applyEnv(klona(nuxt.options.nitro.runtimeConfig), {
		prefix: "NITRO_",
		altPrefix: "NUXT_",
		envExpansion: nuxt.options.nitro.experimental?.envExpansion ?? !!process.env.NITRO_ENV_EXPANSION
	});
}
/**
* Update Nuxt runtime configuration.
*/
function updateRuntimeConfig(runtimeConfig) {
	const nuxt = useNuxt();
	Object.assign(nuxt.options.nitro.runtimeConfig, defu(runtimeConfig, nuxt.options.nitro.runtimeConfig));
	try {
		return useNitro().updateConfig({ runtimeConfig });
	} catch {}
}
function getEnv(key, opts, env = process.env) {
	const envKey = snakeCase(key).toUpperCase();
	return destr(env[opts.prefix + envKey] ?? env[opts.altPrefix + envKey]);
}
function _isObject(input) {
	return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
	for (const key in obj) {
		const subKey = parentKey ? `${parentKey}_${key}` : key;
		const envValue = getEnv(subKey, opts);
		if (_isObject(obj[key])) if (_isObject(envValue)) {
			obj[key] = {
				...obj[key],
				...envValue
			};
			applyEnv(obj[key], opts, subKey);
		} else if (envValue === void 0) applyEnv(obj[key], opts, subKey);
		else obj[key] = envValue ?? obj[key];
		else obj[key] = envValue ?? obj[key];
		if (opts.envExpansion && typeof obj[key] === "string") obj[key] = _expandFromEnv(obj[key]);
	}
	return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value, env = process.env) {
	return value.replace(envExpandRx, (match, key) => {
		return env[key] || match;
	});
}
//#endregion
//#region src/build.ts
const extendWebpackCompatibleConfig = (builder) => (fn, options = {}) => {
	const nuxt = useNuxt();
	if (options.dev === false && nuxt.options.dev) return;
	if (options.build === false && nuxt.options.build) return;
	nuxt.hook(`${builder}:config`, async (configs) => {
		if (options.server !== false) {
			const config = configs.find((i) => i.name === "server");
			if (config) await fn(config);
		}
		if (options.client !== false) {
			const config = configs.find((i) => i.name === "client");
			if (config) await fn(config);
		}
	});
};
/**
* Extend webpack config
*
* The fallback function might be called multiple times
* when applying to both client and server builds.
*/
const extendWebpackConfig = extendWebpackCompatibleConfig("webpack");
/**
* Extend rspack config
*
* The fallback function might be called multiple times
* when applying to both client and server builds.
*/
const extendRspackConfig = extendWebpackCompatibleConfig("rspack");
/**
* Extend Vite config
*/
function extendViteConfig(fn, options = {}) {
	const nuxt = useNuxt();
	if (options.dev === false && nuxt.options.dev) return;
	if (options.build === false && nuxt.options.build) return;
	if (options.server === false || options.client === false) {
		const caller = getUserCaller();
		warn(`[@nuxt/kit] calling \`extendViteConfig\` with only server/client environment is deprecated${caller ? ` (used at \`${resolveAlias(caller.source)}:${caller.line}:${caller.column}\`)` : ""}. Nuxt 5+ will use the Vite Environment API which shares a configuration between environments. You can likely use a Vite plugin to achieve the same result.`);
	}
	return nuxt.hook("vite:extend", ({ config }) => fn(config));
}
/**
* Append webpack plugin to the config.
*/
function addWebpackPlugin(pluginOrGetter, options) {
	extendWebpackConfig(async (config) => {
		const method = options?.prepend ? "unshift" : "push";
		const plugin = typeof pluginOrGetter === "function" ? await pluginOrGetter() : pluginOrGetter;
		config.plugins ||= [];
		config.plugins[method](...toArray(plugin));
	}, options);
}
/**
* Append rspack plugin to the config.
*/
function addRspackPlugin(pluginOrGetter, options) {
	extendRspackConfig(async (config) => {
		const method = options?.prepend ? "unshift" : "push";
		const plugin = typeof pluginOrGetter === "function" ? await pluginOrGetter() : pluginOrGetter;
		config.plugins ||= [];
		config.plugins[method](...toArray(plugin));
	}, options);
}
/**
* Append Vite plugin to the config.
*/
function addVitePlugin(pluginOrGetter, options = {}) {
	const nuxt = useNuxt();
	if (options.dev === false && nuxt.options.dev) return;
	if (options.build === false && nuxt.options.build) return;
	let needsEnvInjection = false;
	nuxt.hook("vite:extend", async ({ config }) => {
		config.plugins ||= [];
		const plugin = toArray(typeof pluginOrGetter === "function" ? await pluginOrGetter() : pluginOrGetter);
		if (options.server !== false && options.client !== false) {
			const method = options?.prepend ? "unshift" : "push";
			config.plugins[method](...plugin);
			return;
		}
		if (!config.environments?.ssr || !config.environments.client) {
			needsEnvInjection = true;
			return;
		}
		const environmentName = options.server === false ? "client" : "ssr";
		const defaultEnforce = options?.prepend ? "pre" : "post";
		const method = options?.prepend ? "unshift" : "push";
		for (const [enforce, plugins] of groupByEnforce(plugin, defaultEnforce)) {
			const pluginName = plugins.map((p) => p.name).join("|");
			config.plugins[method]({
				name: `${pluginName}:wrapper`,
				enforce,
				applyToEnvironment(environment) {
					if (environment.name === environmentName) return resolveNestedPlugins(plugins, config, environment, nuxt);
				}
			});
		}
	});
	nuxt.hook("vite:extendConfig", async (config, env) => {
		if (!needsEnvInjection) return;
		const plugin = toArray(typeof pluginOrGetter === "function" ? await pluginOrGetter() : pluginOrGetter);
		const method = options?.prepend ? "unshift" : "push";
		if (env.isClient && options.server === false) config.plugins[method](...plugin);
		if (env.isServer && options.client === false) config.plugins[method](...plugin);
	});
}
function groupByEnforce(plugins, defaultEnforce) {
	const groups = /* @__PURE__ */ new Map();
	for (const plugin of plugins) {
		const enforce = plugin.enforce ?? defaultEnforce;
		const group = groups.get(enforce);
		if (group) group.push(plugin);
		else groups.set(enforce, [plugin]);
	}
	return groups;
}
/**
* Vite only honours `apply` and `applyToEnvironment` for plugins it finds in the
* top-level plugin array, so plugins nested behind a wrapper have to be resolved
* by hand or (for example) dev-only plugins would leak into production builds.
*/
async function resolveNestedPlugins(plugins, config, environment, nuxt) {
	const configEnv = resolveConfigEnv(environment, config, nuxt);
	const resolved = [];
	for (const plugin of plugins) {
		const { apply, applyToEnvironment } = plugin;
		if (apply && (typeof apply === "function" ? !apply(config, configEnv) : apply !== configEnv.command)) continue;
		const applied = applyToEnvironment ? await applyToEnvironment(environment) : true;
		if (applied === true) {
			resolved.push(plugin);
			continue;
		}
		resolved.push(...await flattenPlugins(applied));
	}
	return resolved;
}
/**
* `getTopLevelConfig` is only available from Vite 6, and kit is used with older
* versions of nuxt (and therefore vite), so fall back to what we can infer.
*/
function resolveConfigEnv(environment, config, nuxt) {
	const topLevelConfig = environment.getTopLevelConfig?.() ?? environment.config;
	return {
		command: topLevelConfig?.command ?? (nuxt.options.dev ? "serve" : "build"),
		mode: topLevelConfig?.mode ?? config.mode ?? nuxt.options.vite?.mode ?? (nuxt.options.dev ? "development" : "production")
	};
}
async function flattenPlugins(option) {
	const resolved = await option;
	if (!resolved) return [];
	if (Array.isArray(resolved)) return (await Promise.all(resolved.map(flattenPlugins))).flat();
	return [resolved];
}
function addBuildPlugin(pluginFactory, options) {
	if (pluginFactory.vite) addVitePlugin(pluginFactory.vite, options);
	if (pluginFactory.webpack) addWebpackPlugin(pluginFactory.webpack, options);
	if (pluginFactory.rspack) addRspackPlugin(pluginFactory.rspack, options);
}
/**
* Set the build output for the given key. See {@link NuxtBuildOutputs}.
*/
function setBuildOutput(key, provider, nuxt = useNuxt()) {
	nuxt.buildOutputs[key] = provider;
}
//#endregion
//#region src/diagnostics/components.ts
/**
* B3xxx
* Component diagnostics.
*
* @internal
*/
const componentDiagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase,
	reporters,
	codes: {
		NUXT_B3001: {
			why: (p) => `Components directory not found: \`${p.dirPath}\`.`,
			fix: "If this is intentional, remove it from `components.dirs` in your `nuxt.config`.",
			docs: false
		},
		NUXT_B3002: {
			why: (p) => `Using server component \`${p.component}\` with \`ssr: false\` is not supported with auto-detected component islands.`,
			fix: "Set `experimental.componentIslands` to `true` in your `nuxt.config`, or convert the component to a client component.",
			docs: false
		},
		NUXT_B3003: {
			why: (p) => `Standalone server components (\`${p.component}\`) are not yet supported without enabling \`experimental.componentIslands\`.`,
			fix: "Set `experimental.componentIslands` to `true` in your `nuxt.config`.",
			docs: false
		},
		NUXT_B3004: {
			why: (p) => `\`${p.file}\` is using \`${p.component}\` which requires \`${p.requiredModule}\`.`,
			fix: (p) => `Run \`npx nuxt add ${p.requiredModule}\` to install it.`,
			docs: false
		},
		NUXT_B3005: {
			why: (p) => `Multiple hydration strategies are not supported in the same component \`<${p.component}>\` in \`${p.file}\`.`,
			fix: "Use only one hydration strategy attribute (e.g. `hydrate-on-visible` or `hydrate-on-idle`) per component.",
			docs: false
		},
		NUXT_B3006: {
			why: (p) => `Component \`<${p.component}>\` (used in \`${p.file}\`) has lazy-hydration props but is not declared as a lazy component.`,
			fix: (p) => `Rename it to \`<${p.lazyName} />\` or remove the lazy-hydration props.`,
			docs: false
		},
		NUXT_B3007: {
			why: (p) => `Using the \`nuxt-client\` attribute (in \`${p.file}\`) to render client components within islands requires \`experimental.componentIslands.selectiveClient\` to be enabled.`,
			fix: "Set `experimental.componentIslands.selectiveClient` to `true` in your `nuxt.config`.",
			docs: false
		},
		NUXT_B3008: {
			why: (p) => `Components not scanned from \`${p.scannedPath}\`, likely due to a directory casing mismatch.`,
			fix: (p) => `Rename the directory from \`${p.scannedPath}\` to \`${p.expectedPath}\` to match the expected casing.`,
			docs: false
		},
		NUXT_B3009: {
			why: (p) => `The component \`${p.component}\` (in \`${p.filePath}\`) is using the reserved "Lazy" prefix used for dynamic imports, which may cause it to break at runtime.`,
			fix: "Rename the component to avoid the `Lazy` prefix.",
			docs: false
		},
		NUXT_B3010: {
			why: (p) => `Component did not resolve to a file name in \`${p.filePath}\`.`,
			fix: "Rename the component file to something other than `index` (e.g. `MyComponent.vue`).",
			docs: false
		},
		NUXT_B3011: {
			why: (p) => `Two component files resolving to the same name \`${p.component}\`:\n\n - ${p.filePath}\n - ${p.duplicatePath}`,
			fix: "Rename one of the files or adjust the `components.dirs` prefix settings in your `nuxt.config`.",
			docs: false
		},
		NUXT_B3012: {
			why: (p) => `Overriding ${p.name} component.`,
			fix: "Specify a `priority` option when calling `addComponent` to avoid this warning.",
			docs: false
		},
		NUXT_B3013: {
			why: (p) => `Rendering client components within islands via the \`nuxt-client\` attribute (in \`${p.file}\`) is only supported with the Vite builder.`,
			fix: "Switch to the Vite builder with `builder: 'vite'` in your `nuxt.config`.",
			docs: false
		}
	}
});
//#endregion
//#region src/components.ts
/**
* Register a directory to be scanned for components and imported only when used.
*/
function addComponentsDir(dir, opts = {}) {
	const nuxt = useNuxt();
	nuxt.options.components ||= [];
	dir.priority ||= 0;
	nuxt.hook("components:dirs", (dirs) => {
		dirs[opts.prepend ? "unshift" : "push"](dir);
	});
}
/**
* This utility takes a file path or npm package that is scanned for named exports, which are get added automatically
*/
function addComponentExports(opts) {
	const nuxt = useNuxt();
	const components = [];
	nuxt.hook("components:dirs", async () => {
		const filePath = await resolvePath(opts.filePath);
		const names = await resolveModuleExportNames(filePath, { extensions: nuxt.options.extensions });
		components.length = 0;
		for (const name of names) components.push(normalizeComponent({
			name: pascalCase([opts.prefix || "", name === "default" ? "" : name]),
			export: name,
			...opts
		}));
	});
	addComponents(components);
}
/**
* Register a component by its name and filePath.
*/
function addComponent(opts) {
	addComponents([normalizeComponent(opts)]);
}
function addComponents(addedComponents) {
	const nuxt = useNuxt();
	nuxt.options.components ||= [];
	nuxt.hook("components:extend", (components) => {
		for (const component of addedComponents) {
			const existingComponentIndex = components.findIndex((c) => (c.pascalName === component.pascalName || c.kebabName === component.kebabName) && c.mode === component.mode);
			if (existingComponentIndex !== -1) {
				const existingComponent = components[existingComponentIndex];
				const existingPriority = existingComponent.priority ?? 0;
				const newPriority = component.priority ?? 0;
				if (newPriority < existingPriority) continue;
				if (newPriority === existingPriority) {
					const name = existingComponent.pascalName || existingComponent.kebabName;
					componentDiagnostics.NUXT_B3012({ name });
				}
				components.splice(existingComponentIndex, 1, component);
			} else components.push(component);
		}
	});
}
function normalizeComponent(opts) {
	if (!opts.mode) {
		const [, mode = "all"] = opts.filePath.match(MODE_RE) || [];
		opts.mode = mode;
	}
	return {
		export: opts.export || "default",
		chunkName: "components/" + kebabCase(opts.name),
		global: opts.global ?? false,
		kebabName: kebabCase(opts.name || ""),
		pascalName: pascalCase(opts.name || ""),
		prefetch: false,
		preload: false,
		mode: "all",
		shortPath: opts.filePath,
		priority: 0,
		meta: {},
		...opts
	};
}
//#endregion
//#region src/diagnostics/pages.ts
/**
* B4xxx
* Pages / routing diagnostics.
*
* @internal
*/
const pageDiagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase,
	reporters,
	codes: {
		NUXT_B4001: {
			why: (p) => `The file \`${p.pathname}\` is empty, so it cannot be a valid page.`,
			fix: "Add a `<template>` block to the page file, or remove the empty file from the `pages/` directory.",
			docs: false
		},
		NUXT_B4002: {
			why: "An `await` expression is used in a variable referenced by `definePageMeta`, which runs synchronously.",
			fix: (p) => `Move the \`await\` outside of variables referenced in \`definePageMeta\`, or use a static value instead (near offset ${p.offset}): ${p.codeSnippet}`,
			docs: false
		},
		NUXT_B4003: {
			why: (p) => `\`definePageMeta()\` is called ${p.callCount} times in \`${p.file}\`, but only one call is allowed.`,
			fix: "Merge all `definePageMeta()` calls into a single call.",
			docs: false
		},
		NUXT_B4004: {
			why: (p) => `The route name generated for \`${p.file}\` collides with the one already generated for \`${p.existingFile}\`.`,
			fix: "Set a custom name using `definePageMeta` within one of the page files.",
			docs: false
		},
		NUXT_B4005: {
			why: (p) => `\`${p.fnName}\` was called with a \`${p.receivedType}\` instead of an object literal (reading \`${p.file}\`).`,
			fix: (p) => `Pass a plain object literal to \`${p.fnName}()\`, e.g. \`${p.fnName}({ ... })\`. Variables and function calls are not supported.`,
			docs: false
		},
		NUXT_B4006: {
			why: (p) => `\`${p.fnName}\` was called with a non-serializable object literal (reading \`${p.file}\`).`,
			fix: "Use only JSON-serializable values (strings, numbers, booleans, arrays, plain objects) in `defineRouteRules()`.",
			docs: false
		},
		NUXT_B4007: {
			why: (p) => `\`${p.fnName}\` is called conditionally or used as an expression in \`${p.file}\`, but it is a compiler macro that is extracted at build time and always applies.`,
			fix: (p) => `Call \`${p.fnName}({ ... })\` once, as a statement at the top level of the \`<script setup>\` block.`,
			docs: false
		},
		NUXT_B4008: {
			why: "Server pages with `ssr: false` are not supported while component islands are auto-detected.",
			fix: "Set `experimental.componentIslands` to `true`.",
			docs: false
		},
		NUXT_B4009: {
			why: (p) => `No layout name could be resolved for \`${p.file}\` (\`index\` is ignored for the purpose of creating a layout name).`,
			fix: "Rename the layout file to something other than `index` (e.g. `layouts/default.vue`).",
			docs: false
		},
		NUXT_B4010: {
			why: (p) => `No middleware name could be resolved for \`${p.file}\` (\`index\` is ignored for the purpose of creating a middleware name).`,
			fix: "Rename the middleware file to something other than `index` (e.g. `middleware/auth.ts`).",
			docs: false
		},
		NUXT_B4011: {
			why: (p) => `While building the page tree: ${p.message}`,
			fix: "Check the page file naming and directory structure for issues.",
			docs: false
		},
		NUXT_B4012: {
			why: (p) => `The incremental route update for \`${p.event}\` on \`${p.path}\` failed, so a full rebuild was performed.`,
			fix: "This is usually harmless: the full rebuild will recover. If it happens repeatedly, check for unusual file naming in `pages/`.",
			docs: false
		},
		NUXT_B4013: {
			why: (p) => `A \`${p.name}\` middleware already exists at \`${p.foundPath}\`.`,
			fix: "Set `override: true` to replace it.",
			docs: false
		},
		NUXT_B4014: {
			why: (p) => `Layout \`${p.layoutName}\` is already provided by \`${p.existingPath}\` and was not overridden with \`${p.newPath}\`.`,
			fix: "Rename one of the layouts, or remove the duplicate layout registration.",
			docs: false
		},
		NUXT_B4016: {
			why: (p) => `Inline route rules for \`${p.path}\` cannot be represented exactly by Nitro route rules, so they were not applied: ${p.detail}.`,
			fix: "Define the affected route rules explicitly in `nitro.routeRules`.",
			docs: false
		},
		NUXT_B4017: {
			why: (p) => `Inline route rules for \`${p.path}\` generated \`${p.pattern}\`, which is already used by another page.`,
			fix: "The later inline route rules override the earlier ones. Use distinct routes, or define the rules explicitly in `nitro.routeRules`.",
			docs: false
		}
	}
});
//#endregion
//#region src/types.ts
const TYPE_RESOLVE_OPTIONS = {
	conditions: [
		"types",
		"import",
		"require"
	],
	extensions: [
		".js",
		".mjs",
		".cjs",
		".ts",
		".mts",
		".cts"
	]
};
const STRIPPABLE_EXT_RE = /\b\.(?:d\.ts|tsx?|jsx?)$/;
const RUNTIME_EXT_RE = /(?<!\.d)\.([cm])(?:ts|js)$/;
function isFile(path) {
	return promises.stat(path).then((s) => s.isFile(), () => false);
}
/**
* Rewrite a resolved module path to the declaration file TypeScript will load for it.
*
* A `.d.ts` / `.d.mts` / `.d.cts` or `.ts` / `.tsx` path is returned unchanged (or with
* the extension stripped, where TypeScript's extensionless `paths` retry will find it).
* A `.mjs` / `.cjs` / `.mts` / `.cts` runtime path is rewritten to an adjacent declaration
* sibling when one exists; otherwise it is returned as-is for the caller to handle.
*/
async function resolveDeclarationPath(absolutePath) {
	const stripped = absolutePath.replace(STRIPPABLE_EXT_RE, "");
	if (stripped !== absolutePath) return stripped;
	const runtimeMatch = absolutePath.match(RUNTIME_EXT_RE);
	if (runtimeMatch) {
		const base = absolutePath.slice(0, -runtimeMatch[0].length);
		if (await isFile(`${base}.d.ts`)) return base;
		const declaration = `${base}.d.${runtimeMatch[1]}ts`;
		if (await isFile(declaration)) return declaration;
	}
	return absolutePath;
}
/** Extract the package name (including scope) from a (possibly subpath) module specifier. */
function packageName(specifier) {
	const segments = specifier.split("/");
	return specifier[0] === "@" ? segments.slice(0, 2).join("/") : segments[0];
}
const rootCache = /* @__PURE__ */ new Map();
function resolveRoot(basePkg, from) {
	const cacheKey = `${basePkg}\0${from.map(String).join("\0")}`;
	if (rootCache.has(cacheKey)) return rootCache.get(cacheKey);
	const promise = (async () => {
		try {
			const r = resolveModulePath(basePkg, {
				from,
				...TYPE_RESOLVE_OPTIONS
			});
			return dirname(await resolvePackageJSON(r));
		} catch {
			return;
		}
	})();
	rootCache.set(cacheKey, promise);
	return promise;
}
/**
* Resolve auto-import / `tsConfig.paths` entries to the path TypeScript should load types from.
*
* A bare package resolves to its package root, so TypeScript follows the package's own
* `exports` / `types` (which may differ from the file its `.` export condition points at).
* A subpath export resolves to its entry's declaration sibling when one exists, otherwise to
* the resolved file itself.
*
* Returns `[specifier, absolutePath]` pairs, omitting any specifier that cannot be resolved.
*/
async function resolveTypePaths(packages, searchPaths) {
	const from = searchPaths.map((d) => directoryToURL(d));
	return (await Promise.allSettled(packages.map(async (pkg) => {
		if (pkg === packageName(pkg)) {
			const root = await resolveRoot(pkg, from);
			return root ? [pkg, root] : void 0;
		}
		const resolved = resolveModulePath(pkg, {
			from,
			try: true,
			...TYPE_RESOLVE_OPTIONS
		});
		return resolved ? [pkg, await resolveDeclarationPath(resolved)] : void 0;
	}))).flatMap((result) => result.status === "fulfilled" && result.value ? [result.value] : []);
}
//#endregion
//#region src/template.ts
/**
* Renders given template during build into the virtual file system (and optionally to disk in the project `buildDir`)
*/
function addTemplate(_template) {
	const nuxt = useNuxt();
	const template = normalizeTemplate(_template);
	filterInPlace(nuxt.options.build.templates, (p) => (p.dst || normalizeTemplate(p).dst) !== template.dst);
	try {
		const distDir = distDirURL.toString();
		const { source } = captureStackTrace().find((e) => e.source && !e.source.startsWith(distDir)) ?? {};
		if (source) {
			const path = normalize(fileURLToPath(source));
			if (existsSync(path)) template._path = path;
		}
	} catch {}
	nuxt.options.build.templates.push(template);
	return template;
}
/**
* Adds a virtual file that can be used within the Nuxt Nitro server build.
*/
function addServerTemplate(template) {
	const nuxt = useNuxt();
	nuxt.options.nitro.virtual ||= {};
	nuxt.options.nitro.virtual[template.filename] = template.getContents;
	return template;
}
/**
* Renders given types during build to disk in the project `buildDir`
* and register them as types.
*
* You can pass a second context object to specify in which context the type should be added.
*
* If no context object is passed, then it will only be added to the nuxt context.
*/
function addTypeTemplate(_template, context) {
	const nuxt = useNuxt();
	const template = addTemplate(_template);
	if (!template.filename.endsWith(".d.ts")) throw kitDiagnostics.NUXT_B8007({ template: template.filename });
	if (!context || context.nuxt) nuxt.hook("prepare:types", (payload) => {
		payload.references ||= [];
		payload.references.push({ path: template.dst });
	});
	if (context?.node) nuxt.hook("prepare:types", (payload) => {
		payload.nodeReferences ||= [];
		payload.nodeReferences.push({ path: template.dst });
	});
	if (context?.shared) nuxt.hook("prepare:types", (payload) => {
		payload.sharedReferences ||= [];
		payload.sharedReferences.push({ path: template.dst });
	});
	if (!context || context.nuxt || context.shared) nuxt.options.vite.vue = defu(nuxt.options.vite.vue, { script: { globalTypeFiles: [template.dst] } });
	if (context?.nitro) nuxt.hook("nitro:prepare:types", (payload) => {
		payload.references ||= [];
		payload.references.push({ path: template.dst });
	});
	return template;
}
/**
* Normalize a nuxt template object
*/
function normalizeTemplate(template, buildDir) {
	if (!template) throw kitDiagnostics.NUXT_B8008({ template: JSON.stringify(template) });
	if (typeof template === "string") template = { src: template };
	else template = { ...template };
	if (template.src) {
		if (!existsSync(template.src)) throw kitDiagnostics.NUXT_B8009({ template: template.src });
		if (!template.filename) {
			const srcPath = parse(template.src);
			template.filename = template.fileName || `${basename(srcPath.dir)}.${srcPath.name}.${hash(template.src).replace(/-/g, "_")}${srcPath.ext}`;
		}
	}
	if (!template.src && !template.getContents) throw kitDiagnostics.NUXT_B8010({ template: template.filename || template.src || JSON.stringify(template) });
	if (!template.filename) throw kitDiagnostics.NUXT_B8011({ template: JSON.stringify(template) });
	if (template.filename.endsWith(".d.ts") || template.filename.endsWith(".d.mts") || template.filename.endsWith(".d.cts")) template.write = true;
	template.dst ||= resolve(buildDir ?? useNuxt().options.buildDir, template.filename);
	return template;
}
/**
* Trigger rebuilding Nuxt templates
*
* You can pass a filter within the options to selectively regenerate a subset of templates.
*/
async function updateTemplates(options) {
	await tryUseNuxt()?.hooks.callHook("builder:generateApp", options);
}
function resolveLayerPaths(dirs, projectBuildDir) {
	const relativeRootDir = relativeWithDot(projectBuildDir, dirs.root);
	const relativeSrcDir = relativeWithDot(projectBuildDir, dirs.app);
	const relativeModulesDir = relativeWithDot(projectBuildDir, dirs.modules);
	const relativeSharedDir = relativeWithDot(projectBuildDir, dirs.shared);
	return {
		nuxt: [
			join(relativeSrcDir, "**/*"),
			join(relativeModulesDir, `*/runtime/**/*`),
			join(relativeRootDir, `test/nuxt/**/*`),
			join(relativeRootDir, `tests/nuxt/**/*`),
			join(relativeRootDir, `layers/*/app/**/*`),
			join(relativeRootDir, `layers/*/modules/*/runtime/**/*`)
		],
		nitro: [
			join(relativeModulesDir, `*/runtime/server/**/*`),
			join(relativeRootDir, `layers/*/server/**/*`),
			join(relativeRootDir, `layers/*/modules/*/runtime/server/**/*`)
		],
		node: [
			join(relativeModulesDir, `*.*`),
			join(relativeRootDir, `nuxt.config.*`),
			join(relativeRootDir, `.config/nuxt.*`),
			join(relativeRootDir, `layers/*/nuxt.config.*`),
			join(relativeRootDir, `layers/*/.config/nuxt.*`),
			join(relativeRootDir, `layers/*/modules/*.*`),
			join(relativeRootDir, `layers/*/modules/*/*.*`)
		],
		shared: [
			join(relativeSharedDir, `**/*`),
			join(relativeModulesDir, `*/shared/**/*`),
			join(relativeRootDir, `layers/*/shared/**/*`)
		],
		sharedDeclarations: [
			join(relativeSharedDir, `**/*.d.ts`),
			join(relativeModulesDir, `*/shared/**/*.d.ts`),
			join(relativeRootDir, `layers/*/shared/**/*.d.ts`)
		],
		globalDeclarations: [join(relativeRootDir, `*.d.ts`), join(relativeRootDir, `layers/*/*.d.ts`)]
	};
}
async function getPathSubstitution(absolutePath, buildDir) {
	return relativeWithDot(buildDir, await resolveDeclarationPath(absolutePath));
}
const excludedAlias = [/^@vue\/.*$/, /^#internal\/nuxt/];
async function _generateTypes(nuxt) {
	const include = /* @__PURE__ */ new Set(["./nuxt.d.ts"]);
	const nodeInclude = /* @__PURE__ */ new Set(["./nuxt.node.d.ts"]);
	const sharedInclude = /* @__PURE__ */ new Set(["./nuxt.shared.d.ts"]);
	const legacyInclude = /* @__PURE__ */ new Set([...include, ...nodeInclude]);
	const exclude = /* @__PURE__ */ new Set();
	const nodeExclude = /* @__PURE__ */ new Set();
	const sharedExclude = /* @__PURE__ */ new Set();
	const legacyExclude = /* @__PURE__ */ new Set();
	if (nuxt.options.typescript.includeWorkspace && nuxt.options.workspaceDir !== nuxt.options.srcDir) {
		include.add(join(relative(nuxt.options.buildDir, nuxt.options.workspaceDir), "**/*"));
		legacyInclude.add(join(relative(nuxt.options.buildDir, nuxt.options.workspaceDir), "**/*"));
	}
	const layerDirs = getLayerDirectories(nuxt);
	const sourceDirs = layerDirs.map((layer) => layer.app);
	for (const dir of nuxt.options.modulesDir) {
		if (!sourceDirs.some((srcDir) => dir.startsWith(srcDir))) exclude.add(relativeWithDot(nuxt.options.buildDir, dir));
		nodeExclude.add(relativeWithDot(nuxt.options.buildDir, dir));
		legacyExclude.add(relativeWithDot(nuxt.options.buildDir, dir));
	}
	for (const dir of ["dist", ".data"]) {
		exclude.add(relativeWithDot(nuxt.options.buildDir, resolve(nuxt.options.rootDir, dir)));
		nodeExclude.add(relativeWithDot(nuxt.options.buildDir, resolve(nuxt.options.rootDir, dir)));
		legacyExclude.add(relativeWithDot(nuxt.options.buildDir, resolve(nuxt.options.rootDir, dir)));
	}
	const rootDirWithSlash = withTrailingSlash$1(nuxt.options.rootDir);
	for (const dirs of layerDirs) if (!dirs.app.startsWith(rootDirWithSlash) || dirs.root === rootDirWithSlash || dirs.app.includes("node_modules")) {
		const rootGlob = join(relativeWithDot(nuxt.options.buildDir, dirs.root), "**/*");
		const paths = resolveLayerPaths(dirs, nuxt.options.buildDir);
		for (const path of paths.nuxt) {
			include.add(path);
			legacyInclude.add(path);
			if (path !== rootGlob) nodeExclude.add(path);
		}
		for (const path of paths.nitro) {
			exclude.add(path);
			nodeExclude.add(path);
			legacyExclude.add(path);
		}
		for (const path of paths.node) {
			nodeInclude.add(path);
			legacyInclude.add(path);
			exclude.add(path);
		}
		for (const path of paths.shared) {
			legacyInclude.add(path);
			sharedInclude.add(path);
		}
		for (const path of paths.sharedDeclarations) include.add(path);
		for (const path of paths.globalDeclarations) {
			include.add(path);
			legacyInclude.add(path);
			sharedInclude.add(path);
		}
	}
	const moduleEntryPaths = [];
	for (const m of nuxt.options._installedModules) {
		const path = m.meta?.rawPath || m.entryPath;
		if (path) moduleEntryPaths.push(getDirectory(path));
	}
	const modulePaths = await resolveNuxtModule(rootDirWithSlash, moduleEntryPaths);
	for (const path of modulePaths) {
		const relative = relativeWithDot(nuxt.options.buildDir, path);
		if (!path.includes("node_modules") && path.startsWith(rootDirWithSlash)) {
			include.add(join(relative, "runtime"));
			include.add(join(relative, "dist/runtime"));
			nodeInclude.add(join(relative, "*.*"));
		}
		legacyInclude.add(join(relative, "runtime"));
		legacyInclude.add(join(relative, "dist/runtime"));
		nodeExclude.add(join(relative, "runtime"));
		nodeExclude.add(join(relative, "dist/runtime"));
		exclude.add(join(relative, "runtime/server"));
		exclude.add(join(relative, "dist/runtime/server"));
		exclude.add(join(relative, "*.*"));
		exclude.add(join(relative, "dist/*.*"));
		legacyExclude.add(join(relative, "runtime/server"));
		legacyExclude.add(join(relative, "dist/runtime/server"));
	}
	const nestedModulesDirs = [];
	for (const dir of nuxt.options.modulesDir.toSorted()) {
		const withSlash = withTrailingSlash$1(dir);
		if (nestedModulesDirs.every((d) => !d.startsWith(withSlash))) nestedModulesDirs.push(withSlash);
	}
	let hasTypescriptVersionWithModulePreserve;
	for (const parent of nestedModulesDirs) hasTypescriptVersionWithModulePreserve ??= await readPackageJSON("typescript", { parent }).then((r) => r?.version && isGreaterOrEqual(r.version, "5.4.0")).catch(() => void 0);
	hasTypescriptVersionWithModulePreserve ??= true;
	const useDecorators = Boolean(nuxt.options.experimental?.decorators);
	const isV5OrHigher = (nuxt.options.future?.compatibilityVersion ?? 4) >= 5;
	const userExclude = nuxt.options.typescript?.tsConfig?.exclude ?? [];
	const tsConfig = defu(nuxt.options.typescript?.tsConfig, {
		compilerOptions: {
			esModuleInterop: true,
			skipLibCheck: true,
			target: "ESNext",
			allowJs: true,
			allowImportingTsExtensions: true,
			resolveJsonModule: true,
			moduleDetection: "force",
			isolatedModules: true,
			verbatimModuleSyntax: true,
			allowArbitraryExtensions: true,
			strict: nuxt.options.typescript?.strict ?? true,
			noUncheckedIndexedAccess: true,
			forceConsistentCasingInFileNames: true,
			noImplicitOverride: true,
			...isV5OrHigher ? { noUncheckedSideEffectImports: true } : {},
			...useDecorators ? { experimentalDecorators: false } : {},
			module: hasTypescriptVersionWithModulePreserve ? "preserve" : "ESNext",
			noEmit: true,
			lib: [
				"ESNext",
				...useDecorators ? ["esnext.decorators"] : [],
				"dom",
				"dom.iterable",
				"webworker"
			],
			libReplacement: false,
			jsx: "preserve",
			jsxImportSource: "vue",
			types: [],
			paths: {},
			moduleResolution: nuxt.options.future?.typescriptBundlerResolution || nuxt.options.experimental?.typescriptBundlerResolution ? "Bundler" : "Node",
			useDefineForClassFields: true,
			noImplicitThis: true,
			allowSyntheticDefaultImports: true
		},
		include: [...include],
		exclude: [...exclude]
	});
	const nodeTsConfig = defu(nuxt.options.typescript?.nodeTsConfig, {
		compilerOptions: {
			esModuleInterop: tsConfig.compilerOptions?.esModuleInterop,
			skipLibCheck: tsConfig.compilerOptions?.skipLibCheck,
			target: tsConfig.compilerOptions?.target,
			allowJs: tsConfig.compilerOptions?.allowJs,
			allowImportingTsExtensions: tsConfig.compilerOptions?.allowImportingTsExtensions,
			resolveJsonModule: tsConfig.compilerOptions?.resolveJsonModule,
			moduleDetection: tsConfig.compilerOptions?.moduleDetection,
			isolatedModules: tsConfig.compilerOptions?.isolatedModules,
			verbatimModuleSyntax: tsConfig.compilerOptions?.verbatimModuleSyntax,
			allowArbitraryExtensions: tsConfig.compilerOptions?.allowArbitraryExtensions,
			strict: tsConfig.compilerOptions?.strict,
			noUncheckedIndexedAccess: tsConfig.compilerOptions?.noUncheckedIndexedAccess,
			forceConsistentCasingInFileNames: tsConfig.compilerOptions?.forceConsistentCasingInFileNames,
			noImplicitOverride: tsConfig.compilerOptions?.noImplicitOverride,
			module: tsConfig.compilerOptions?.module,
			noEmit: true,
			types: [],
			paths: {},
			moduleResolution: tsConfig.compilerOptions?.moduleResolution,
			useDefineForClassFields: tsConfig.compilerOptions?.useDefineForClassFields,
			noImplicitThis: tsConfig.compilerOptions?.noImplicitThis,
			allowSyntheticDefaultImports: tsConfig.compilerOptions?.allowSyntheticDefaultImports
		},
		include: [...nodeInclude],
		exclude: [...nodeExclude]
	});
	const sharedTsConfig = defu(nuxt.options.typescript?.sharedTsConfig, {
		compilerOptions: {
			esModuleInterop: tsConfig.compilerOptions?.esModuleInterop,
			skipLibCheck: tsConfig.compilerOptions?.skipLibCheck,
			target: tsConfig.compilerOptions?.target,
			allowJs: tsConfig.compilerOptions?.allowJs,
			allowImportingTsExtensions: tsConfig.compilerOptions?.allowImportingTsExtensions,
			resolveJsonModule: tsConfig.compilerOptions?.resolveJsonModule,
			moduleDetection: tsConfig.compilerOptions?.moduleDetection,
			isolatedModules: tsConfig.compilerOptions?.isolatedModules,
			verbatimModuleSyntax: tsConfig.compilerOptions?.verbatimModuleSyntax,
			allowArbitraryExtensions: tsConfig.compilerOptions?.allowArbitraryExtensions,
			strict: tsConfig.compilerOptions?.strict,
			noUncheckedIndexedAccess: tsConfig.compilerOptions?.noUncheckedIndexedAccess,
			forceConsistentCasingInFileNames: tsConfig.compilerOptions?.forceConsistentCasingInFileNames,
			noImplicitOverride: tsConfig.compilerOptions?.noImplicitOverride,
			module: tsConfig.compilerOptions?.module,
			noEmit: true,
			types: [],
			paths: {},
			moduleResolution: tsConfig.compilerOptions?.moduleResolution,
			useDefineForClassFields: tsConfig.compilerOptions?.useDefineForClassFields,
			noImplicitThis: tsConfig.compilerOptions?.noImplicitThis,
			allowSyntheticDefaultImports: tsConfig.compilerOptions?.allowSyntheticDefaultImports
		},
		include: [...sharedInclude],
		exclude: [...sharedExclude]
	});
	const aliases = nuxt.options.alias;
	const basePath = tsConfig.compilerOptions.baseUrl ? resolve(nuxt.options.buildDir, tsConfig.compilerOptions.baseUrl) : nuxt.options.buildDir;
	tsConfig.compilerOptions ||= {};
	tsConfig.compilerOptions.paths ||= {};
	tsConfig.include ||= [];
	tsConfig.exclude ||= [];
	const importPaths = nuxt.options.modulesDir.map((d) => directoryToURL(d));
	for (const alias in aliases) {
		if (excludedAlias.some((re) => re.test(alias))) continue;
		let absolutePath = resolve(basePath, aliases[alias]);
		let stats = await promises.stat(absolutePath).catch(() => null);
		if (!stats) {
			const resolvedModule = resolveModulePath(aliases[alias], {
				try: true,
				from: importPaths,
				extensions: [
					...nuxt.options.extensions,
					".d.ts",
					".d.mts",
					".d.cts"
				]
			});
			if (resolvedModule) {
				absolutePath = resolvedModule;
				stats = await promises.stat(resolvedModule).catch(() => null);
			}
		}
		const relativePath = relativeWithDot(nuxt.options.buildDir, absolutePath);
		if (stats?.isDirectory() || aliases[alias].endsWith("/")) {
			tsConfig.compilerOptions.paths[alias] = [relativePath];
			tsConfig.compilerOptions.paths[`${alias}/*`] = [`${relativePath}/*`];
		} else {
			const path = stats?.isFile() ? await getPathSubstitution(absolutePath, nuxt.options.buildDir) : aliases[alias];
			tsConfig.compilerOptions.paths[alias] = [path];
		}
	}
	const references = [];
	const nodeReferences = [];
	const sharedReferences = [];
	await Promise.all([...nuxt.options.modules, ...nuxt.options._modules].map(async (id) => {
		if (typeof id !== "string") return;
		for (const parent of nestedModulesDirs) {
			const pkg = await readPackageJSON(id, { parent }).catch(() => null);
			if (pkg) {
				nodeReferences.push({ types: pkg.name ?? id });
				references.push({ types: pkg.name ?? id });
				return;
			}
		}
		nodeReferences.push({ types: id });
		references.push({ types: id });
	}));
	const declarations = [];
	await nuxt.callHook("prepare:types", {
		references,
		declarations,
		tsConfig,
		nodeTsConfig,
		nodeReferences,
		sharedTsConfig,
		sharedReferences
	});
	const legacyTsConfig = defu({}, {
		...tsConfig,
		include: [...tsConfig.include, ...legacyInclude],
		exclude: [...userExclude, ...legacyExclude]
	});
	const nonRootLayerDirs = layerDirs.map((dirs) => dirs.root).filter((root) => !rootDirWithSlash.startsWith(root));
	async function resolveConfig(tsConfig) {
		for (const alias in tsConfig.compilerOptions.paths) {
			const paths = tsConfig.compilerOptions.paths[alias];
			tsConfig.compilerOptions.paths[alias] = [...new Set(await Promise.all(paths.map(async (path) => {
				if (!isAbsolute(path)) return path;
				return (await promises.stat(path).catch(() => null))?.isFile() ? getPathSubstitution(path, nuxt.options.buildDir) : relativeWithDot(nuxt.options.buildDir, path);
			})))];
		}
		tsConfig.compilerOptions.paths = sortTsPaths(tsConfig.compilerOptions.paths, nonRootLayerDirs, nuxt.options.buildDir, nuxt.options.typescript?.hoist ?? []);
		tsConfig.include = [...new Set(tsConfig.include.map((p) => isAbsolute(p) ? relativeWithDot(nuxt.options.buildDir, p) : p))];
		tsConfig.exclude = [...new Set(tsConfig.exclude.map((p) => isAbsolute(p) ? relativeWithDot(nuxt.options.buildDir, p) : p))];
	}
	await Promise.all([
		resolveConfig(tsConfig),
		resolveConfig(nodeTsConfig),
		resolveConfig(sharedTsConfig),
		resolveConfig(legacyTsConfig)
	]);
	const declaration = [
		...references.map((ref) => renderReference(ref, nuxt.options.buildDir)),
		...declarations,
		"",
		"export {}",
		""
	].join("\n");
	const nodeDeclaration = [
		...nodeReferences.map((ref) => renderReference(ref, nuxt.options.buildDir)),
		"",
		"export {}",
		""
	].join("\n");
	return {
		declaration,
		sharedTsConfig,
		sharedDeclaration: [
			...sharedReferences.map((ref) => renderReference(ref, nuxt.options.buildDir)),
			"",
			"export {}",
			""
		].join("\n"),
		nodeTsConfig,
		nodeDeclaration,
		tsConfig,
		legacyTsConfig
	};
}
async function writeTypes(nuxt) {
	const { tsConfig, nodeTsConfig, nodeDeclaration, declaration, legacyTsConfig, sharedDeclaration, sharedTsConfig } = await _generateTypes(nuxt);
	const appTsConfigPath = resolve(nuxt.options.buildDir, "tsconfig.app.json");
	const legacyTsConfigPath = resolve(nuxt.options.buildDir, "tsconfig.json");
	const nodeTsConfigPath = resolve(nuxt.options.buildDir, "tsconfig.node.json");
	const sharedTsConfigPath = resolve(nuxt.options.buildDir, "tsconfig.shared.json");
	const declarationPath = resolve(nuxt.options.buildDir, "nuxt.d.ts");
	const nodeDeclarationPath = resolve(nuxt.options.buildDir, "nuxt.node.d.ts");
	const sharedDeclarationPath = resolve(nuxt.options.buildDir, "nuxt.shared.d.ts");
	await promises.mkdir(nuxt.options.buildDir, { recursive: true });
	await Promise.all([
		writeIfChanged(appTsConfigPath, JSON.stringify(tsConfig, null, 2)),
		writeIfChanged(legacyTsConfigPath, JSON.stringify(legacyTsConfig, null, 2)),
		writeIfChanged(nodeTsConfigPath, JSON.stringify(nodeTsConfig, null, 2)),
		writeIfChanged(sharedTsConfigPath, JSON.stringify(sharedTsConfig, null, 2)),
		writeIfChanged(declarationPath, declaration),
		writeIfChanged(nodeDeclarationPath, nodeDeclaration),
		writeIfChanged(sharedDeclarationPath, sharedDeclaration)
	]);
}
/**
* Types are regenerated on every start and are usually identical, so avoid
* touching the files: an unchanged mtime keeps editors and `tsc --watch` from
* redoing work they have already done.
*/
async function writeIfChanged(path, contents) {
	if (await promises.readFile(path, "utf8").catch(() => void 0) === contents) return;
	await promises.writeFile(path, contents);
}
/**
* Sort the paths in the tsconfig.json file, so
* - Hoisted package paths stay at the top (`typescript.hoist`)
* - Custom layer aliases follow, then generic `#layers/*` aliases
* - Generic `~`/`@` aliases come after layer aliases
* - `#build` alias is at the bottom (https://github.com/nuxt/nuxt/issues/30325)
*/
function sortTsPaths(paths, layerDirs, buildDir, hoist) {
	const hoistKeys = new Set(hoist);
	const hoistPaths = {};
	const customLayerPaths = {};
	const genericLayerPaths = {};
	const otherPaths = {};
	const buildPaths = {};
	for (const pathKey in paths) {
		if (pathKey.startsWith("#build")) {
			buildPaths[pathKey] = paths[pathKey];
			continue;
		}
		if (isHoistPathKey(pathKey, hoistKeys)) {
			hoistPaths[pathKey] = paths[pathKey];
			continue;
		}
		if (layerDirs.length && paths[pathKey].some((target) => isPathUnderLayerDirs(target, buildDir, layerDirs))) if (pathKey.startsWith("#layers")) genericLayerPaths[pathKey] = paths[pathKey];
		else customLayerPaths[pathKey] = paths[pathKey];
		else otherPaths[pathKey] = paths[pathKey];
	}
	return {
		...hoistPaths,
		...customLayerPaths,
		...genericLayerPaths,
		...otherPaths,
		...buildPaths
	};
}
const PATH_WILDCARD_RE = /\/?\*$/;
function isHoistPathKey(pathKey, hoistKeys) {
	return hoistKeys.has(pathKey.replace(PATH_WILDCARD_RE, ""));
}
function isPathUnderLayerDirs(target, buildDir, layerDirs) {
	const absolute = withTrailingSlash$1(resolve(buildDir, target.replace(PATH_WILDCARD_RE, "")));
	return layerDirs.some((dir) => absolute.startsWith(dir));
}
function renderReference(ref, baseDir) {
	return `/// <reference ${"path" in ref ? `path="${isAbsolute(ref.path) ? relative(baseDir, ref.path) : ref.path}"` : `types="${ref.types}"`} />`;
}
const RELATIVE_WITH_DOT_RE = /^([^.])/;
function relativeWithDot(from, to) {
	return relative(from, to).replace(RELATIVE_WITH_DOT_RE, "./$1") || ".";
}
function withTrailingSlash$1(dir) {
	return dir.replace(/[^/]$/, "$&/");
}
//#endregion
//#region src/layout.ts
const LAYOUT_RE = /["']/g;
function addLayout(template, name) {
	const nuxt = useNuxt();
	const { filename, src } = addTemplate(template);
	const layoutName = kebabCase(name || parse(filename).name).replace(LAYOUT_RE, "");
	nuxt.hook("app:templates", (app) => {
		if (layoutName in app.layouts) {
			const relativePath = reverseResolveAlias(app.layouts[layoutName].file, {
				...nuxt?.options.alias || {},
				...strippedAtAliases
			}).pop() || app.layouts[layoutName].file;
			pageDiagnostics.NUXT_B4014({
				layoutName,
				existingPath: relativePath,
				newPath: src || filename
			});
			return;
		}
		app.layouts[layoutName] = {
			file: join("#build", filename),
			name: layoutName
		};
	});
}
const strippedAtAliases = {
	"@": "",
	"@@": ""
};
//#endregion
//#region src/pages.ts
function extendPages(cb) {
	useNuxt().hook("pages:extend", cb);
}
function extendRouteRules(route, rule, options = {}) {
	const nuxt = useNuxt();
	for (const opts of [nuxt.options, nuxt.options.nitro]) {
		opts.routeRules ||= {};
		opts.routeRules[route] = options.override ? defu(rule, opts.routeRules[route]) : defu(opts.routeRules[route], rule);
	}
}
function addRouteMiddleware(input, options = {}) {
	const nuxt = useNuxt();
	const middlewares = toArray(input);
	nuxt.hook("app:resolve", (app) => {
		for (const middleware of middlewares) {
			const find = app.middleware.findIndex((item) => item.name === middleware.name);
			if (find >= 0) {
				const foundPath = app.middleware[find].path;
				if (foundPath === middleware.path) continue;
				if (options.override === true) app.middleware[find] = { ...middleware };
				else pageDiagnostics.NUXT_B4013({
					name: middleware.name,
					foundPath
				});
			} else if (options.prepend === true) app.middleware.unshift({ ...middleware });
			else app.middleware.push({ ...middleware });
		}
	});
}
//#endregion
//#region src/diagnostics/plugins.ts
/**
* B2xxx
* Plugin diagnostics (`addPlugin`, plugin metadata, plugin ordering).
*
* @internal
*/
const pluginDiagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase,
	reporters,
	codes: {
		NUXT_B2001: {
			why: (p) => `The second argument to \`${p.name}\` is a \`${p.type}\`, not an object literal.`,
			fix: "Pass an object literal as the second argument, e.g. `defineNuxtPlugin(() => {}, { name: 'my-plugin' })`.",
			docs: false
		},
		NUXT_B2002: {
			why: "Plugin options contain spread elements or computed keys, which are not supported.",
			fix: "Use static properties instead.",
			docs: false
		},
		NUXT_B2003: {
			why: "`dependsOn` is not an array of string literals.",
			fix: "Use string literals in the `dependsOn` array, e.g. `dependsOn: ['my-plugin']`.",
			docs: false
		},
		NUXT_B2004: {
			why: (p) => `Plugin \`${p.src}\` has no content.`,
			fix: "Add content to the plugin file, or remove it from the `plugins/` directory.",
			docs: false
		},
		NUXT_B2005: {
			why: (p) => `Plugin \`${p.src}\` has no default export and will be ignored at build time.`,
			fix: "Add `export default defineNuxtPlugin(() => {})` to your plugin.",
			docs: false
		},
		NUXT_B2006: {
			why: (p) => `Error parsing plugin \`${p.src}\`.`,
			fix: "Check the plugin file for syntax errors.",
			docs: false
		},
		NUXT_B2007: {
			why: (p) => `Plugin \`${p.src}\` is not wrapped in \`defineNuxtPlugin\`.`,
			fix: "Wrap your plugin with `defineNuxtPlugin`. This may enable enhancements in future.",
			docs: false
		},
		NUXT_B2008: {
			why: (p) => `Plugin \`${p.name}\` depends on \`${p.missing}\` but they are not registered.`,
			fix: "Register the missing dependency plugins, or remove them from the `dependsOn` array.",
			docs: false
		},
		NUXT_B2009: {
			why: (p) => `Circular dependency detected in plugins: ${p.cycle}.`,
			fix: "Restructure the plugin `dependsOn` declarations to break the cycle.",
			docs: false
		},
		NUXT_B2010: {
			why: (p) => `Failed to parse static properties from plugin \`${p.src}\`, falling back to non-optimized runtime meta.`,
			fix: "Use an object literal with static values as the second argument to `defineNuxtPlugin()`, and check the plugin file for syntax errors or unsupported constructs in the metadata.",
			docs: false
		},
		NUXT_B2011: {
			why: (p) => `Invalid plugin \`${p.src}\`. The \`src\` option is required.`,
			fix: "Pass a string path, or an object with a `src` property, to `addPlugin()`.",
			docs: false
		},
		NUXT_B2012: {
			why: (p) => {
				const dependencies = p.dependencies.map((name) => `\`${name}\``).join(", ");
				const plural = p.dependencies.length > 1;
				return `Plugin \`${p.name}\` depends on ${dependencies}, but ${plural ? "these dependencies are" : "this dependency is"} unavailable in the ${p.mode} build and will be ignored.`;
			},
			fix: "Do not depend on plugins that are unavailable in the same build environment; remove them from the `dependsOn` array.",
			docs: false
		}
	}
});
//#endregion
//#region src/plugin.ts
/**
* Normalize a nuxt plugin object
*/
const pluginSymbol = Symbol.for("nuxt plugin");
function normalizePlugin(plugin) {
	if (typeof plugin === "string") plugin = { src: plugin };
	else plugin = { ...plugin };
	if (pluginSymbol in plugin) return plugin;
	if (!plugin.src) throw pluginDiagnostics.NUXT_B2011({ src: JSON.stringify(plugin) });
	plugin.src = normalize(resolveAlias(plugin.src));
	if (!existsSync(plugin.src) && isAbsolute$1(plugin.src)) try {
		plugin.src = resolveModulePath(plugin.src, { extensions: tryUseNuxt()?.options.extensions ?? DEFAULT_JS_FILE_EXTENSIONS });
	} catch {}
	if (plugin.ssr) plugin.mode = "server";
	if (!plugin.mode) {
		const [, mode = "all"] = plugin.src.match(MODE_RE) || [];
		plugin.mode = mode;
	}
	plugin[pluginSymbol] = true;
	return plugin;
}
function addPlugin(_plugin, opts = {}) {
	const nuxt = useNuxt();
	const plugin = normalizePlugin(_plugin);
	filterInPlace(nuxt.options.plugins, (p) => normalizePlugin(p).src !== plugin.src);
	nuxt.options.plugins[opts.append ? "push" : "unshift"](plugin);
	return plugin;
}
/**
* Adds a template and registers as a nuxt plugin.
*/
function addPluginTemplate(plugin, opts = {}) {
	return addPlugin(typeof plugin === "string" ? { src: plugin } : {
		...plugin,
		src: addTemplate(plugin).dst
	}, opts);
}
//#endregion
//#region src/watch.ts
const RECHECK_DELAY = 70;
/**
* A single write moves the mtime more than once (truncate, then write) and
* chokidar may dispatch `change` off the first of those, so a mtime a hair
* newer than the one recorded is the tail of a write that *was* reported
* rather than one that was dropped.
*/
const MTIME_EPSILON = 10;
const RECOVERY_FLAG = Symbol.for("nuxt:watch-recovery");
/**
* chokidar suppresses a `change` event that lands within 50ms of the previous
* `change` for the same path, and never replays it. A save that follows a fast
* HMR round trip is therefore silently lost until the file is touched again,
* which looks exactly like broken HMR. This is true of every chokidar major
* Nuxt uses.
*
* Raw fs events are not throttled, so once chokidar has reported a file at
* least once we can use them to notice a modification that never surfaced as a
* `change` event, and re-emit it after the throttle window has passed.
*
* @param watcher the chokidar watcher to patch
* @returns a disposer releasing the recovery state; call it when the watcher closes
*/
function recoverThrottledChanges(watcher) {
	if (watcher[RECOVERY_FLAG]) return () => {};
	Object.defineProperty(watcher, RECOVERY_FLAG, {
		value: true,
		configurable: true
	});
	const tracked = /* @__PURE__ */ new Map();
	const pending = /* @__PURE__ */ new Map();
	let disposed = false;
	/**
	* With `cwd` set, chokidar emits high-level events relative to it while raw
	* events carry an absolute `watchedPath`, so everything is keyed absolutely
	* and the emitted path is kept alongside to re-emit in chokidar's namespace.
	*/
	const cwd = watcher.options?.cwd;
	const toKey = (path) => cwd ? resolve$1(cwd, path) : path;
	/**
	* `watchedPath` is the (possibly relative) path chokidar handed to `fs.watch`
	* and `path` is the name `fs.watch` reported, which is a basename both when
	* the file itself is watched and when its parent directory is. The two are
	* indistinguishable for a directory containing a child of the same name, so
	* pick whichever candidate chokidar has already reported a modification time
	* for, and use native separators to match the paths chokidar emits.
	*/
	const resolveTracked = (path, details) => {
		const watched = typeof details?.watchedPath === "string" ? details.watchedPath : void 0;
		if (!watched) {
			const key = toKey(path);
			return tracked.has(key) ? key : void 0;
		}
		const child = toKey(join$1(watched, path));
		if (tracked.has(child)) return child;
		const parent = toKey(watched);
		return tracked.has(parent) ? parent : void 0;
	};
	const track = (path, stats) => {
		if (disposed) return;
		const key = toKey(path);
		if (stats) {
			tracked.set(key, {
				mtimeMs: stats.mtimeMs,
				path
			});
			return;
		}
		stat(key).then((s) => {
			if (!disposed) tracked.set(key, {
				mtimeMs: s.mtimeMs,
				path
			});
		}, () => {});
	};
	const forget = (path) => {
		const key = toKey(path);
		tracked.delete(key);
		const timeout = pending.get(key);
		if (timeout) {
			clearTimeout(timeout);
			pending.delete(key);
		}
	};
	watcher.on("add", track);
	watcher.on("change", track);
	watcher.on("unlink", forget);
	watcher.on("raw", (event, path, details) => {
		if (disposed) return;
		if (event !== "change" && event !== "rename" && event !== "modified") return;
		if (typeof path !== "string" || !path) return;
		const file = resolveTracked(path, details);
		if (!file || pending.has(file)) return;
		const timeout = setTimeout(() => {
			pending.delete(file);
			if (disposed) return;
			stat(file).then((stats) => {
				if (disposed) return;
				const previous = tracked.get(file);
				if (!previous) return;
				tracked.set(file, {
					mtimeMs: stats.mtimeMs,
					path: previous.path
				});
				if (stats.mtimeMs - previous.mtimeMs <= MTIME_EPSILON) return;
				watcher.emit("change", previous.path, stats);
				watcher.emit("all", "change", previous.path, stats);
			}, () => {});
		}, RECHECK_DELAY);
		timeout.unref();
		pending.set(file, timeout);
	});
	return () => {
		disposed = true;
		for (const timeout of pending.values()) clearTimeout(timeout);
		pending.clear();
		tracked.clear();
	};
}
//#endregion
//#region src/diagnostics/build.ts
/**
* B1xxx
* Build / compilation diagnostics.
*
* @internal
*/
const buildDiagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase,
	reporters,
	codes: {
		NUXT_B1001: {
			why: (p) => `Could not compile template \`${p.filename}\`.`,
			fix: (p) => p.src ? `Check the template source file at \`${p.src}\` for syntax errors.` : "Check the `getContents` function of this template for errors.",
			docs: false
		},
		NUXT_B1002: {
			why: (p) => `Error reading template from \`${p.src}\`.`,
			fix: "Check that the template `src` path exists and is readable.",
			docs: false
		},
		NUXT_B1003: {
			why: "Invalid template. Templates must have either `src` or `getContents`.",
			fix: "Add a `getContents` function or a `src` path to the `addTemplate()` call.",
			docs: false
		},
		NUXT_B1004: {
			why: "Failed to install dependencies.",
			fix: (p) => `Try installing manually with \`npm install ${p.packages}\`.`,
			docs: false
		},
		NUXT_B1005: {
			why: (p) => `Plugin \`${p.plugin}\` failed to scan file \`${p.file}\`.`,
			fix: "Check the file for syntax errors, or report this issue to the plugin author.",
			docs: false
		},
		NUXT_B1006: {
			why: (p) => `Cannot read file \`${p.file}\`.`,
			fix: "Check that the file exists and has correct permissions.",
			docs: false
		},
		NUXT_B1007: {
			why: (p) => `Error in \`afterScan\` hook of plugin \`${p.plugin}\`.`,
			fix: "Check the plugin implementation or report this issue to the plugin author.",
			docs: false
		},
		NUXT_B1008: {
			why: (p) => `No factory function found for \`${p.function}\` in file \`${p.file}\`. This is a Nuxt bug.`,
			fix: "Please report this issue at https://github.com/nuxt/nuxt/issues with the file contents.",
			docs: false
		},
		NUXT_B1009: {
			why: (p) => `Duplicate keyed function name \`${p.functionName}\`${p.name && p.functionName !== p.name ? ` defined as \`${p.name}\`` : ""} with ${p.source ? `the same source \`${p.source}\`` : "no source"} found. Overwriting the existing entry.`,
			fix: "Ensure each keyed function has a unique name, or use a different source to distinguish them.",
			docs: false
		},
		NUXT_B1010: {
			why: (p) => `Failed to read file \`${p.file}\` as it changed during read.`,
			fix: "The file was modified while being read, usually by a concurrent process writing to it. Try restarting the build.",
			docs: false
		},
		NUXT_B1011: {
			why: (p) => `Failed to read file \`${p.file}\`.`,
			fix: "Check that the file exists and is readable, or try clearing the build cache with `nuxt clean`.",
			docs: false
		},
		NUXT_B1012: {
			why: (p) => `Skipping unsafe cache path: ${p.path}. This cache file has a path that escapes the project directory (possible path traversal).`,
			fix: "Delete the cache with `nuxt clean` and rebuild.",
			docs: false
		},
		NUXT_B1013: {
			why: (p) => `Failed to restore cached file \`${p.file}\`.`,
			fix: "Try clearing the build cache with `nuxt clean` and rebuilding from scratch.",
			docs: false
		},
		NUXT_B1014: {
			why: "Problem checking for external configuration files.",
			fix: "This is likely a transient file system error. If it persists, check file permissions in your project root.",
			docs: false
		},
		NUXT_B1015: {
			why: "Falling back to `chokidar-granular` as `@parcel/watcher` cannot be resolved in your project.",
			fix: "Install `@parcel/watcher` for better performance: `npm install -D @parcel/watcher`.",
			docs: false
		},
		NUXT_B1016: {
			why: "Failed to set up the `@parcel/watcher` file watcher.",
			fix: "This is likely an environment or file system issue. Watching for file changes may not work; restart the dev server and, if the problem persists, report it.",
			docs: false
		},
		NUXT_B1017: {
			why: (p) => `Loading \`${p.builder}\` builder failed.`,
			fix: (p) => `Run \`npm install ${p.builder}\` to install it.`,
			docs: false
		},
		NUXT_B1018: {
			why: (p) => `Loading \`${p.builder}\` server builder failed.`,
			fix: (p) => `Run \`npm install ${p.builder}\` to install it.`,
			docs: false
		},
		NUXT_B1019: {
			why: (p) => `Unknown component mode \`${p.mode}\`. This might be an internal Nuxt bug.`,
			fix: "If you are a module author, ensure the component `mode` is set to `client`, `server`, or `all`. Otherwise, please report this issue.",
			docs: false
		},
		NUXT_B1020: {
			why: "`experimental.watcher: \"builder\"` is set but the active builder does not implement `setupWatcher`. Falling back to the default file watcher.",
			fix: "Remove `experimental.watcher` from your `nuxt.config`, or use a builder that supports its own watcher.",
			docs: false
		}
	}
});
//#endregion
//#region src/diagnostics/config.ts
/**
* B5xxx
* Configuration diagnostics.
*
* @internal
*/
const configDiagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase,
	reporters,
	codes: {
		NUXT_B5001: {
			why: (p) => `No \`compatibilityDate\` is set in \`nuxt.config\`, so the \`${p.fallback}\` fallback is being used.`,
			fix: (p) => `Add \`compatibilityDate: '${p.latest}'\` to your \`nuxt.config.ts\`.`
		},
		NUXT_B5002: {
			why: (p) => `\`@nuxt/webpack-builder\` could not be installed in \`${p.rootDir}\`.`,
			fix: "Install it manually with `npm install -D @nuxt/webpack-builder`, or change the `builder` option to `vite` in `nuxt.config`.",
			docs: false
		},
		NUXT_B5003: {
			why: (p) => `The \`app\` namespace is reserved for Nuxt and exposed to the browser, but \`runtimeConfig.app.${p.key}\` is set.`,
			fix: "Move the key to `runtimeConfig.public` or a custom namespace."
		},
		NUXT_B5004: {
			why: (p) => `External configuration files are not supported: ${p.files}.`,
			fix: "Move these configurations into `nuxt.config.ts` and delete the external config files."
		},
		NUXT_B5005: {
			why: (p) => `Nuxt schema could not be loaded from \`${p.filePath}\`.`,
			fix: "Ensure the file exports a valid object with `defineNuxtSchema()` or as a plain object.",
			docs: false
		},
		NUXT_B5006: {
			why: (p) => `\`${p.option}\` is used in dev mode, which causes a memory leak.`,
			fix: "Remove the hash option from your webpack config.",
			docs: false
		},
		NUXT_B5007: {
			why: "The webpack server config `target` is not set to \"node\".",
			fix: "Set `target: \"node\"` in your webpack server configuration.",
			docs: false
		},
		NUXT_B5009: {
			why: "`@parcel/watcher` cannot be resolved in your project, so `chokidar` is being used instead.",
			fix: "Install `@parcel/watcher` for better file watching: `npm install -D @parcel/watcher`.",
			docs: false
		},
		NUXT_B5010: {
			why: (p) => `Required packages are not installed: ${p.names}.`,
			fix: (p) => `Run \`npm install ${p.install}\` to install them.`,
			docs: false
		},
		NUXT_B5011: {
			why: (p) => `Package \`${p.name}\` is missing.`,
			fix: (p) => `Run \`npx nuxt add ${p.name}\` to install it.`,
			docs: false
		}
	}
});
//#endregion
//#region src/diagnostics/head.ts
/**
* B6xxx
* Head / auto-import diagnostics.
*
* @internal
*/
const headDiagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase,
	reporters,
	codes: {
		NUXT_B6001: {
			why: (p) => `\`${p.file}\` imports head composables directly from \`${p.module}\`, which loses Nuxt's type safety.`,
			fix: "Import from `#imports` instead.",
			docs: false
		},
		NUXT_B6002: {
			why: (p) => `\`${p.name}\` is already auto-imported by Nuxt as a built-in, and overriding it will likely cause issues.`,
			fix: (p) => `Rename \`${p.name}\` in \`${p.file}\` so it no longer collides with the built-in auto-import.`,
			docs: false
		},
		NUXT_B6003: {
			why: "`unhead.legacy` is deprecated and will be removed.",
			fix: "Remove deprecated head patterns (`hid`, `vmid`, `children`, `body: true`) and resolve promise values before passing them to `useHead`.",
			docs: false
		},
		NUXT_B6004: {
			why: "`experimental.headNext` is deprecated. CAPO sorting is now the default.",
			fix: "Remove `experimental.headNext` from your `nuxt.config`, or set `unhead.legacy: true` to opt out temporarily.",
			docs: false
		},
		NUXT_B6005: {
			why: (p) => `Could not resolve \`${p.from}\` used by the auto-import \`${p.name}\`.`,
			fix: "Check the `from` path in `imports.presets` (or the module that registered this import). Auto-imports from an unresolvable module are silently skipped and can surface as unrelated type errors elsewhere.",
			docs: false
		}
	}
});
//#endregion
//#region src/diagnostics/bundler.ts
/**
* B7xxx
* Bundler (Vite / webpack / Nitro) diagnostics.
*
* @internal
*/
const bundlerDiagnostics = /* #__PURE__ */ defineDiagnostics({
	docsBase,
	reporters,
	codes: {
		NUXT_B7001: {
			why: "`rollup-plugin-visualizer` is not installed, so bundle analysis cannot run.",
			fix: "Run `npm install -D rollup-plugin-visualizer` to enable bundle analysis.",
			docs: false
		},
		NUXT_B7002: {
			why: (p) => `Some \`vite.optimizeDeps.include\` entries could not be resolved: ${p.deps}.`,
			fix: "Remove or correct these entries in the `vite.optimizeDeps.include` array of your `nuxt.config.ts`. Report entries added by a Nuxt module to the module author.",
			docs: false
		},
		NUXT_B7003: {
			why: "The server-side bundle produced more than one JS entry file.",
			fix: "Avoid using `optimization.splitChunks` in the server config.",
			docs: false
		},
		NUXT_B7004: {
			why: (p) => `Webpack entry \`${p.entryName}\` was not found.`,
			fix: (p) => `Check that the \`entry\` option in your webpack configuration points to an existing file. Expected entry name: \`${p.entryName}\`.`,
			docs: false
		},
		NUXT_B7005: {
			why: (p) => `No client entry was found in \`rollupOptions.input\`; expected an \`entry\` key or a string input but received ${p.input}.`,
			fix: "Set `vite.build.rollupOptions.input` to a string or an object with an `entry` key in your `nuxt.config`.",
			docs: false
		},
		NUXT_B7006: {
			why: (p) => `No server entry was found in \`rollupOptions.input\`; expected a \`server\` key or a string input but received ${p.input}.`,
			fix: "Set `vite.build.rollupOptions.input` to a string or an object with a `server` key in your `nuxt.config`.",
			docs: false
		},
		NUXT_B7007: {
			why: (p) => `The PostCSS plugin \`${p.pluginName}\` could not be loaded.`,
			fix: (p) => `Run \`npm install -D ${p.pluginName}\` to install the PostCSS plugin.`,
			docs: false
		},
		NUXT_B7008: {
			why: "`@vitejs/plugin-vue-jsx` is not installed, so JSX support is unavailable.",
			fix: "Run `npm install -D @vitejs/plugin-vue-jsx` to install it.",
			docs: false
		},
		NUXT_B7009: {
			why: (p) => `The Babel dependencies required for decorator support are missing: ${p.deps}.`,
			fix: (p) => `Run \`npm install -D ${p.install}\` to install the required Babel decorator dependencies.`,
			docs: false
		},
		NUXT_B7011: {
			why: (p) => `The PostCSS plugin \`${p.pluginName}\` could not be imported, which is unexpected.`,
			fix: (p) => `Run \`npm install -D ${p.pluginName}\` to install it, or report this issue at https://github.com/nuxt/nuxt/issues.`,
			docs: false
		},
		NUXT_B7012: {
			why: (p) => `A ViteNode socket payload of ${p.requiredSize} bytes exceeds the internal buffer limit of ${p.maxSize} bytes.`,
			fix: "Reduce the payload size sent through the ViteNode socket.",
			docs: false
		},
		NUXT_B7013: {
			why: "The ViteNode socket server was started without a configured socket path.",
			fix: "This is likely an internal Nuxt bug. Please report it at https://github.com/nuxt/nuxt/issues.",
			docs: false
		},
		NUXT_B7014: {
			why: (p) => `The webpack \`${p.name}\` build failed with errors.`,
			fix: "Fix the build errors listed above. If the errors are unclear, try running `nuxt cleanup` and rebuilding.",
			docs: false
		},
		NUXT_B7015: {
			why: "Payload extraction is disabled, which is suboptimal for full-static output.",
			fix: "Set `experimental.payloadExtraction` to `true` or `'client'`.",
			docs: false
		},
		NUXT_B7016: {
			why: (p) => `The configured \`spaLoadingTemplate\` path does not exist: \`${p.path}\`.`,
			fix: "Point `spaLoadingTemplate` in `nuxt.config` at an existing HTML file, or set it to `true` to use the default template.",
			docs: false
		},
		NUXT_B7017: {
			why: "Could not find the Nuxt dev server to attach Rspack HMR to; hot module replacement will be disabled.",
			fix: "This is likely an internal Nuxt bug. Please report it with a reproduction.",
			docs: false
		},
		NUXT_B7018: {
			why: "Failed to restrict vite-node socket permissions; closing the socket.",
			fix: "Check that the temporary directory used for the vite-node socket is writable and supports `chmod`.",
			docs: false
		},
		NUXT_B7019: {
			why: "The server webpack build does not externalize dependencies.",
			fix: "Externalize dependencies in the server build (`externals`) for better build performance.",
			docs: false
		},
		NUXT_B7020: {
			why: "The client build manifest is disabled, but Nuxt requires it to render the correct assets for each route.",
			fix: "Remove any `build.manifest: false` override from your `nuxt.config` `vite` options or from a Vite plugin `config`/`configEnvironment` hook.",
			docs: false
		},
		NUXT_B7021: {
			why: (p) => `The client build manifest was expected at \`${p.manifestFile}\` but was not emitted by the client build.`,
			fix: "Check that no Vite plugin removes or renames the client build manifest in a `generateBundle`/`writeBundle` hook. If this happens with no such plugin, please report it at https://github.com/nuxt/nuxt/issues.",
			docs: false
		}
	}
});
//#endregion
export { DEFAULT_JSX_FILE_EXTENSIONS, DEFAULT_JS_FILE_EXTENSIONS, addBuildPlugin, addComponent, addComponentExports, addComponentsDir, addDevServerHandler, addImports, addImportsDir, addImportsSources, addLayout, addPlugin, addPluginTemplate, addPrerenderRoutes, addRouteMiddleware, addRspackPlugin, addServerHandler, addServerImports, addServerImportsDir, addServerPlugin, addServerScanDir, addServerTemplate, addTemplate, addTypeTemplate, addVitePlugin, addWebpackPlugin, assertNuxtCompatibility, buildDiagnostics, buildNuxt, bundlerDiagnostics, checkNuxtCompatibility, componentDiagnostics, configDiagnostics, createIsIgnored, createResolver, defineNuxtModule, directoryToURL, extendNuxtSchema, extendPages, extendRouteRules, extendRspackConfig, extendViteConfig, extendWebpackConfig, findPath, getDirectory, getLayerDirectories, getNuxtCtx, getNuxtModuleVersion, getNuxtVersion, hasNuxtCompatibility, hasNuxtModule, hasNuxtModuleCompatibility, headDiagnostics, importModule, installModule, installModules, isIgnored, isNuxt2, isNuxt3, isNuxtMajorVersion, loadNuxt, loadNuxtConfig, loadNuxtModuleInstance, logger, normalizeModuleTranspilePath, normalizePlugin, normalizeSemanticVersion, normalizeTemplate, nuxtCtx, packageName, pageDiagnostics, pluginDiagnostics, recoverThrottledChanges, requireModule, resolveAlias, resolveDeclarationPath, resolveFiles, resolveIgnorePatterns, resolveModule, resolveModuleWithOptions, resolveNuxtModule, resolvePath, resolveTypePaths, runWithNuxtContext, setBuildOutput, setGlobalHead, tryImportModule, tryRequireModule, tryResolveModule, tryUseNuxt, updateAppConfig, updateRuntimeConfig, updateTemplates, useLogger, useNitro, useNuxt, useRuntimeConfig, writeTypes };
