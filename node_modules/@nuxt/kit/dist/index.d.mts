import { ConsolaInstance, ConsolaOptions } from "consola";
import { UseContext } from "unctx";
import "pkg-types";
import { GlobOptions } from "tinyglobby";
import { LoadConfigOptions } from "c12";
import { Component, ComponentsDir, ModuleDefinition, ModuleMeta, ModuleOptions, Nuxt, NuxtAppConfig, NuxtBuildOutputs, NuxtCompatibility, NuxtCompatibilityIssues, NuxtConfig, NuxtHooks, NuxtMiddleware, NuxtModule, NuxtOptions, NuxtPlugin, NuxtPluginTemplate, NuxtServerTemplate, NuxtTemplate, NuxtTypeTemplate, ResolvedNuxtTemplate, SchemaDefinition } from "@nuxt/schema";
import { Import, Preset } from "unimport";
import { Configuration, WebpackPluginInstance } from "webpack";
import { Plugin, UserConfig } from "vite";
import { Nitro, NitroDevEventHandler, NitroEventHandler, NitroRouteConfig } from "nitropack/types";
//#region src/module/define.d.ts
/**
 * Define a Nuxt module, automatically merging defaults with user provided options, installing
 * any hooks that are provided, and calling an optional setup function for full control.
 */
declare function defineNuxtModule<TOptions extends ModuleOptions>(definition: ModuleDefinition<TOptions, Partial<TOptions>, false> | NuxtModule<TOptions, Partial<TOptions>, false>): NuxtModule<TOptions, TOptions, false>;
declare function defineNuxtModule<TOptions extends ModuleOptions>(): {
  with: <TOptionsDefaults extends Partial<TOptions>>(definition: ModuleDefinition<TOptions, TOptionsDefaults, true> | NuxtModule<TOptions, TOptionsDefaults, true>) => NuxtModule<TOptions, TOptionsDefaults, true>;
};
//#endregion
//#region src/module/install.d.ts
type ModuleToInstall = string | NuxtModule<ModuleOptions, Partial<ModuleOptions>, false>;
/**
 * Installs a set of modules on a Nuxt instance.
 * @internal
 */
declare function installModules(modulesToInstall: Map<ModuleToInstall, Record<string, any>>, resolvedModulePaths: Set<string>, nuxt?: Nuxt): Promise<void>;
/**
 * Installs a module on a Nuxt instance.
 * @deprecated Use module dependencies.
 */
declare function installModule<T extends string | NuxtModule, Config extends Extract<NonNullable<NuxtConfig['modules']>[number], [T, any]>>(moduleToInstall: T, inlineOptions?: [Config] extends [never] ? any : Config[1], nuxt?: Nuxt): Promise<void>;
declare function resolveModuleWithOptions(definition: NuxtModule<any> | string | false | undefined | null | [(NuxtModule | string)?, Record<string, any>?], nuxt: Nuxt): {
  resolvedPath?: string;
  module: string | NuxtModule<any>;
  options: Record<string, any>;
} | undefined;
declare function loadNuxtModuleInstance(nuxtModule: string | NuxtModule, nuxt?: Nuxt): Promise<{
  nuxtModule: NuxtModule<any>;
  buildTimeModuleMeta: ModuleMeta;
  resolvedModulePath?: string;
}>;
declare function getDirectory(p: string): string;
declare const normalizeModuleTranspilePath: (p: string) => string;
//#endregion
//#region src/module/compatibility.d.ts
/**
 * Check if a Nuxt module is installed by name.
 *
 * This will check both the installed modules and the modules to be installed. Note
 * that it cannot detect if a module is _going to be_ installed programmatically by another module.
 */
declare function hasNuxtModule(moduleName: string, nuxt?: Nuxt): boolean;
/**
 * Checks if a Nuxt module is compatible with a given semver version.
 */
declare function hasNuxtModuleCompatibility(module: string | NuxtModule, semverVersion: string, nuxt?: Nuxt): Promise<boolean>;
/**
 * Get the version of a Nuxt module.
 *
 * Scans installed modules for the version, if it's not found it will attempt to load the module instance and get the version from there.
 */
declare function getNuxtModuleVersion(module: string | NuxtModule, nuxt?: Nuxt | any): Promise<string | false>;
//#endregion
//#region src/loader/config.d.ts
interface LoadNuxtConfigOptions extends Omit<LoadConfigOptions<NuxtConfig>, 'overrides'> {
  overrides?: Exclude<LoadConfigOptions<NuxtConfig>['overrides'], Promise<any> | Function>;
}
declare function loadNuxtConfig(opts: LoadNuxtConfigOptions): Promise<NuxtOptions>;
//#endregion
//#region src/loader/schema.d.ts
declare function extendNuxtSchema(def: SchemaDefinition | (() => SchemaDefinition)): void;
//#endregion
//#region src/loader/nuxt.d.ts
interface LoadNuxtOptions extends LoadNuxtConfigOptions {
  /** Load nuxt with development mode */
  dev?: boolean;
  /** Use lazy initialization of nuxt if set to false */
  ready?: boolean;
}
declare function loadNuxt(opts: LoadNuxtOptions): Promise<Nuxt>;
declare function buildNuxt(nuxt: Nuxt): Promise<any>;
//#endregion
//#region src/layers.d.ts
interface LayerDirectories {
  /** Nuxt rootDir (`/` by default) */
  readonly root: string;
  /** Nitro source directory (`/server` by default) */
  readonly server: string;
  /** Local modules directory (`/modules` by default) */
  readonly modules: string;
  /** Shared directory (`/shared` by default) */
  readonly shared: string;
  /** Public directory (`/public` by default) */
  readonly public: string;
  /** Nuxt srcDir (`/app/` by default) */
  readonly app: string;
  /** Layouts directory (`/app/layouts` by default) */
  readonly appLayouts: string;
  /** Middleware directory (`/app/middleware` by default) */
  readonly appMiddleware: string;
  /** Pages directory (`/app/pages` by default) */
  readonly appPages: string;
  /** Plugins directory (`/app/plugins` by default) */
  readonly appPlugins: string;
}
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
declare function getLayerDirectories(nuxt?: Nuxt): LayerDirectories[];
//#endregion
//#region src/constants.d.ts
/**
 * Default extensions for files that may contain JSX.
 * @internal
 */
declare const DEFAULT_JSX_FILE_EXTENSIONS: string[];
/** Default extensions for JavaScript/TypeScript files, in order of resolution priority. */
declare const DEFAULT_JS_FILE_EXTENSIONS: string[];
//#endregion
//#region src/head.d.ts
declare function setGlobalHead(head: NuxtAppConfig['head']): void;
//#endregion
//#region src/imports.d.ts
declare function addImports(imports: Import | Import[]): void;
declare function addImportsDir(dirs: string | string[], opts?: {
  prepend?: boolean;
}): void;
declare function addImportsSources(presets: Preset | Preset[]): void;
//#endregion
//#region src/app-config.d.ts
/**
 * Update Nuxt app configuration.
 * @since 4.5.0
 */
declare function updateAppConfig(appConfig: Record<string, unknown>): void;
//#endregion
//#region src/runtime-config.d.ts
/**
 * Access 'resolved' Nuxt runtime configuration, with values updated from environment.
 *
 * This mirrors the runtime behavior of Nitro.
 */
declare function useRuntimeConfig(): Record<string, any>;
/**
 * Update Nuxt runtime configuration.
 */
declare function updateRuntimeConfig(runtimeConfig: Record<string, unknown>): void | Promise<void>;
//#endregion
//#region src/build.d.ts
type Arrayable<T> = T | T[];
type Thenable<T> = T | Promise<T>;
type RspackCompatiblePluginInstance = {
  apply: (...args: any[]) => void;
  [k: string]: any;
};
interface ExtendConfigOptions {
  /**
   * Install plugin on dev
   * @default true
   */
  dev?: boolean;
  /**
   * Install plugin on build
   * @default true
   */
  build?: boolean;
  /**
   * Install plugin on server side
   * @default true
   */
  server?: boolean;
  /**
   * Install plugin on client side
   * @default true
   */
  client?: boolean;
  /**
   * Prepends the plugin to the array with `unshift()` instead of `push()`.
   */
  prepend?: boolean;
}
interface ExtendWebpackConfigOptions extends ExtendConfigOptions {}
interface ExtendViteConfigOptions extends Omit<ExtendConfigOptions, 'server' | 'client'> {
  /**
   * Extend server Vite configuration
   * @default true
   * @deprecated calling \`extendViteConfig\` with only server/client environment is deprecated.
   * Nuxt 5+ uses the Vite Environment API which shares a configuration between environments.
   * You can likely use a Vite plugin to achieve the same result.
   */
  server?: boolean;
  /**
   * Extend client Vite configuration
   * @default true
   * @deprecated calling \`extendViteConfig\` with only server/client environment is deprecated.
   * Nuxt 5+ uses the Vite Environment API which shares a configuration between environments.
   * You can likely use a Vite plugin to achieve the same result.
   */
  client?: boolean;
}
type ExtendWebpacklikeConfig = (fn: (config: Configuration) => void, options?: ExtendWebpackConfigOptions) => void;
/**
 * Extend webpack config
 *
 * The fallback function might be called multiple times
 * when applying to both client and server builds.
 */
declare const extendWebpackConfig: ExtendWebpacklikeConfig;
/**
 * Extend rspack config
 *
 * The fallback function might be called multiple times
 * when applying to both client and server builds.
 */
declare const extendRspackConfig: ExtendWebpacklikeConfig;
/**
 * Extend Vite config
 */
declare function extendViteConfig(fn: ((config: UserConfig) => Thenable<void>), options?: ExtendViteConfigOptions): (() => void) | undefined;
/**
 * Append webpack plugin to the config.
 */
declare function addWebpackPlugin(pluginOrGetter: Arrayable<WebpackPluginInstance> | (() => Thenable<Arrayable<WebpackPluginInstance>>), options?: ExtendWebpackConfigOptions): void;
/**
 * Append rspack plugin to the config.
 */
declare function addRspackPlugin(pluginOrGetter: Arrayable<RspackCompatiblePluginInstance> | (() => Thenable<Arrayable<RspackCompatiblePluginInstance>>), options?: ExtendWebpackConfigOptions): void;
/**
 * Append Vite plugin to the config.
 */
declare function addVitePlugin(pluginOrGetter: Arrayable<Plugin> | (() => Thenable<Arrayable<Plugin>>), options?: ExtendConfigOptions): void;
interface AddBuildPluginFactory {
  vite?: () => Thenable<Arrayable<Plugin>>;
  webpack?: () => Thenable<Arrayable<WebpackPluginInstance>>;
  rspack?: () => Thenable<Arrayable<RspackCompatiblePluginInstance>>;
}
declare function addBuildPlugin(pluginFactory: AddBuildPluginFactory, options?: ExtendConfigOptions): void;
/**
 * Set the build output for the given key. See {@link NuxtBuildOutputs}.
 */
declare function setBuildOutput<K extends keyof NuxtBuildOutputs>(key: K, provider: NuxtBuildOutputs[K], nuxt?: Nuxt): void;
//#endregion
//#region src/compatibility.d.ts
declare function normalizeSemanticVersion(version: string): string;
/**
 * Check version constraints and return incompatibility issues as an array
 */
declare function checkNuxtCompatibility(constraints: NuxtCompatibility, nuxt?: Nuxt): Promise<NuxtCompatibilityIssues>;
/**
 * Check version constraints and throw a detailed error if has any, otherwise returns true
 */
declare function assertNuxtCompatibility(constraints: NuxtCompatibility, nuxt?: Nuxt): Promise<true>;
/**
 * Check version constraints and return true if passed, otherwise returns false
 */
declare function hasNuxtCompatibility(constraints: NuxtCompatibility, nuxt?: Nuxt): Promise<boolean>;
type NuxtMajorVersion = 2 | 3 | 4;
/**
 * Check if current Nuxt instance is of specified major version
 */
declare function isNuxtMajorVersion(majorVersion: NuxtMajorVersion, nuxt?: Nuxt): boolean;
/**
 * @deprecated Use `isNuxtMajorVersion(2, nuxt)` instead. This may be removed in \@nuxt/kit v5 or a future major version.
 */
declare function isNuxt2(nuxt?: Nuxt): boolean;
/**
 * @deprecated Use `isNuxtMajorVersion(3, nuxt)` instead. This may be removed in \@nuxt/kit v5 or a future major version.
 */
declare function isNuxt3(nuxt?: Nuxt): boolean;
/**
 * Get nuxt version
 */
declare function getNuxtVersion(nuxt?: Nuxt | any): string;
//#endregion
//#region src/components.d.ts
/**
 * Register a directory to be scanned for components and imported only when used.
 */
declare function addComponentsDir(dir: ComponentsDir, opts?: {
  prepend?: boolean;
}): void;
type AddComponentOptions = {
  name: string;
  filePath: string;
} & Partial<Exclude<Component, 'shortPath' | 'async' | 'level' | 'import' | 'asyncImport'>>;
/**
 * This utility takes a file path or npm package that is scanned for named exports, which are get added automatically
 */
declare function addComponentExports(opts: Omit<AddComponentOptions, 'name'> & {
  prefix?: string;
}): void;
/**
 * Register a component by its name and filePath.
 */
declare function addComponent(opts: AddComponentOptions): void;
//#endregion
//#region src/context.d.ts
/**
 * Direct access to the Nuxt global context - see https://github.com/unjs/unctx.
 * @deprecated Use `getNuxtCtx` instead
 */
declare const nuxtCtx: UseContext<Nuxt>;
/** Direct access to the Nuxt context with asyncLocalStorage - see https://github.com/unjs/unctx. */
declare const getNuxtCtx: () => Nuxt | null;
/**
 * Get access to Nuxt instance.
 *
 * Throws an error if Nuxt instance is unavailable.
 * @example
 * ```js
 * const nuxt = useNuxt()
 * ```
 */
declare function useNuxt(): Nuxt;
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
declare function tryUseNuxt(): Nuxt | null;
declare function runWithNuxtContext<T extends (...args: any[]) => any>(nuxt: Nuxt, fn: T): ReturnType<T>;
//#endregion
//#region src/ignore.d.ts
declare function createIsIgnored(nuxt?: Nuxt | null | undefined): (pathname: string, stats?: unknown) => boolean;
/**
 * Return a filter function to filter an array of paths
 */
declare function isIgnored(pathname: string, _stats?: unknown, nuxt?: Nuxt | null | undefined): boolean;
declare function resolveIgnorePatterns(relativePath?: string): string[];
//#endregion
//#region src/layout.d.ts
declare function addLayout(template: NuxtTemplate | string, name?: string): void;
//#endregion
//#region src/pages.d.ts
declare function extendPages(cb: NuxtHooks['pages:extend']): void;
interface ExtendRouteRulesOptions {
  /**
   * Override route rule config
   * @default false
   */
  override?: boolean;
}
declare function extendRouteRules(route: string, rule: NitroRouteConfig, options?: ExtendRouteRulesOptions): void;
interface AddRouteMiddlewareOptions {
  /**
   * Override existing middleware with the same name, if it exists
   * @default false
   */
  override?: boolean;
  /**
   * Prepend middleware to the list
   * @default false
   */
  prepend?: boolean;
}
declare function addRouteMiddleware(input: NuxtMiddleware | NuxtMiddleware[], options?: AddRouteMiddlewareOptions): void;
//#endregion
//#region src/plugin.d.ts
declare function normalizePlugin(plugin: NuxtPlugin | string): NuxtPlugin;
/**
 * Registers a nuxt plugin and to the plugins array.
 *
 * Note: You can use mode or .client and .server modifiers with fileName option
 * to use plugin only in client or server side.
 *
 * Note: By default plugin is prepended to the plugins array. You can use second argument to append (push) instead.
 * @example
 * ```js
 * import { createResolver } from '@nuxt/kit'
 * const resolver = createResolver(import.meta.url)
 *
 * addPlugin({
 *   src: resolver.resolve('templates/foo.js'),
 *   filename: 'foo.server.js' // [optional] only include in server bundle
 * })
 * ```
 */
interface AddPluginOptions {
  append?: boolean;
}
declare function addPlugin(_plugin: NuxtPlugin | string, opts?: AddPluginOptions): NuxtPlugin;
/**
 * Adds a template and registers as a nuxt plugin.
 */
declare function addPluginTemplate(plugin: NuxtPluginTemplate | string, opts?: AddPluginOptions): NuxtPlugin;
//#endregion
//#region src/resolve.d.ts
interface ResolvePathOptions {
  /** Base for resolving paths from. Default is Nuxt rootDir. */
  cwd?: string;
  /** An object of aliases. Default is Nuxt configured aliases. */
  alias?: Record<string, string>;
  /**
   * The file extensions to try.
   * Default is Nuxt configured extensions.
   *
   * Isn't considered when `type` is set to `'dir'`.
   */
  extensions?: string[];
  /**
   * Whether to resolve files that exist in the Nuxt VFS (for example, as a Nuxt template).
   * @default false
   */
  virtual?: boolean;
  /**
   * Whether to fallback to the original path if the resolved path does not exist instead of returning the normalized input path.
   * @default false
   */
  fallbackToOriginal?: boolean;
  /**
   * The type of the path to be resolved.
   * @default 'file'
   */
  type?: PathType;
}
/**
 * Resolve the full path to a file or a directory (based on the provided type), respecting Nuxt alias and extensions options.
 *
 * If a path cannot be resolved, normalized input will be returned unless the `fallbackToOriginal` option is set to `true`,
 * in which case the original input path will be returned.
 */
declare function resolvePath(path: string, opts?: ResolvePathOptions): Promise<string>;
/**
 * Try to resolve first existing file in paths
 */
declare function findPath(paths: string | string[], opts?: ResolvePathOptions, pathType?: PathType): Promise<string | null>;
/**
 * Resolve path aliases respecting Nuxt alias options
 */
declare function resolveAlias(path: string, alias?: Record<string, string>): string;
interface Resolver {
  resolve(...path: string[]): string;
  resolvePath(path: string, opts?: ResolvePathOptions): Promise<string>;
}
/**
 * Create a relative resolver
 */
declare function createResolver(base: string | URL): Resolver;
declare function resolveNuxtModule(base: string, paths: string[]): Promise<string[]>;
type PathType = 'file' | 'dir';
/**
 * Resolve absolute file paths in the provided directory with respect to `.nuxtignore` and return them sorted.
 * @param path path to the directory to resolve files in
 * @param pattern glob pattern or an array of glob patterns to match files
 * @param opts options for globbing
 * @param opts.followSymbolicLinks whether to follow symbolic links, default is `true`
 * @param opts.ignore additional glob patterns to ignore
 * @returns sorted array of absolute file paths
 */
declare function resolveFiles(path: string, pattern: string | string[], opts?: {
  followSymbolicLinks?: boolean;
  ignore?: GlobOptions['ignore'];
}): Promise<string[]>;
//#endregion
//#region src/nitro.d.ts
/**
 * Adds a nitro server handler
 *
 */
declare function addServerHandler(handler: NitroEventHandler): void;
/**
 * Adds a nitro server handler for development-only
 *
 */
declare function addDevServerHandler(handler: NitroDevEventHandler): void;
/**
 * Adds a Nitro plugin
 */
declare function addServerPlugin(plugin: string): void;
/**
 * Adds routes to be prerendered
 */
declare function addPrerenderRoutes(routes: string | string[]): void;
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
declare function useNitro(): Nitro;
/**
 * Add server imports to be auto-imported by Nitro
 */
declare function addServerImports(imports: Import | Import[]): void;
/**
 * Add directories to be scanned for auto-imports by Nitro
 */
declare function addServerImportsDir(dirs: string | string[], opts?: {
  prepend?: boolean;
}): void;
/**
 * Add directories to be scanned by Nitro. It will check for subdirectories,
 * which will be registered just like the `~~/server` folder is.
 */
declare function addServerScanDir(dirs: string | string[], opts?: {
  prepend?: boolean;
}): void;
//#endregion
//#region src/template.d.ts
/**
 * Renders given template during build into the virtual file system (and optionally to disk in the project `buildDir`)
 */
declare function addTemplate<T>(_template: NuxtTemplate<T> | string): ResolvedNuxtTemplate<T>;
/**
 * Adds a virtual file that can be used within the Nuxt Nitro server build.
 */
declare function addServerTemplate(template: NuxtServerTemplate): NuxtServerTemplate;
/**
 * Renders given types during build to disk in the project `buildDir`
 * and register them as types.
 *
 * You can pass a second context object to specify in which context the type should be added.
 *
 * If no context object is passed, then it will only be added to the nuxt context.
 */
declare function addTypeTemplate<T>(_template: NuxtTypeTemplate<T>, context?: {
  nitro?: boolean;
  nuxt?: boolean;
  node?: boolean;
  shared?: boolean;
}): ResolvedNuxtTemplate<T>;
/**
 * Normalize a nuxt template object
 */
declare function normalizeTemplate<T>(template: NuxtTemplate<T> | string, buildDir?: string): ResolvedNuxtTemplate<T>;
/**
 * Trigger rebuilding Nuxt templates
 *
 * You can pass a filter within the options to selectively regenerate a subset of templates.
 */
declare function updateTemplates(options?: {
  filter?: (template: ResolvedNuxtTemplate<any>) => boolean;
}): Promise<void>;
declare function writeTypes(nuxt: Nuxt): Promise<void>;
//#endregion
//#region src/types.d.ts
/**
 * Rewrite a resolved module path to the declaration file TypeScript will load for it.
 *
 * A `.d.ts` / `.d.mts` / `.d.cts` or `.ts` / `.tsx` path is returned unchanged (or with
 * the extension stripped, where TypeScript's extensionless `paths` retry will find it).
 * A `.mjs` / `.cjs` / `.mts` / `.cts` runtime path is rewritten to an adjacent declaration
 * sibling when one exists; otherwise it is returned as-is for the caller to handle.
 */
declare function resolveDeclarationPath(absolutePath: string): Promise<string>;
/** Extract the package name (including scope) from a (possibly subpath) module specifier. */
declare function packageName(specifier: string): string;
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
declare function resolveTypePaths(packages: string[], searchPaths: string[]): Promise<Array<[string, string]>>;
//#endregion
//#region src/watch.d.ts
/**
 * The subset of a chokidar `FSWatcher` this helper needs. Callers hold
 * different chokidar majors (Nuxt core watches with v5, Vite bundles v3), so
 * the parameter is structural rather than an import of either package.
 */
interface RecoverableWatcher {
  on: (event: any, listener: (...args: any[]) => void) => any;
  emit: (event: any, ...args: any[]) => any;
  options?: {
    cwd?: string | undefined;
  } | undefined;
}
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
declare function recoverThrottledChanges(watcher: RecoverableWatcher): () => void;
//#endregion
//#region src/logger.d.ts
declare const logger: ConsolaInstance;
declare function useLogger(tag?: string, options?: Partial<ConsolaOptions>): ConsolaInstance;
//#endregion
//#region src/diagnostics/build.d.ts
/**
 * B1xxx
 * Build / compilation diagnostics.
 *
 * @internal
 */
declare const buildDiagnostics: import("nostics").Diagnostics<{
  readonly NUXT_B1001: {
    readonly why: (p: {
      filename: string;
    }) => string;
    readonly fix: (p: {
      src?: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B1002: {
    readonly why: (p: {
      src: string;
    }) => string;
    readonly fix: "Check that the template `src` path exists and is readable.";
    readonly docs: false;
  };
  readonly NUXT_B1003: {
    readonly why: "Invalid template. Templates must have either `src` or `getContents`.";
    readonly fix: "Add a `getContents` function or a `src` path to the `addTemplate()` call.";
    readonly docs: false;
  };
  readonly NUXT_B1004: {
    readonly why: "Failed to install dependencies.";
    readonly fix: (p: {
      packages: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B1005: {
    readonly why: (p: {
      plugin: string;
      file: string;
    }) => string;
    readonly fix: "Check the file for syntax errors, or report this issue to the plugin author.";
    readonly docs: false;
  };
  readonly NUXT_B1006: {
    readonly why: (p: {
      file: string;
    }) => string;
    readonly fix: "Check that the file exists and has correct permissions.";
    readonly docs: false;
  };
  readonly NUXT_B1007: {
    readonly why: (p: {
      plugin: string;
    }) => string;
    readonly fix: "Check the plugin implementation or report this issue to the plugin author.";
    readonly docs: false;
  };
  readonly NUXT_B1008: {
    readonly why: (p: {
      function: string;
      file: string;
    }) => string;
    readonly fix: "Please report this issue at https://github.com/nuxt/nuxt/issues with the file contents.";
    readonly docs: false;
  };
  readonly NUXT_B1009: {
    readonly why: (p: {
      functionName: string;
      name?: string;
      source?: string;
    }) => string;
    readonly fix: "Ensure each keyed function has a unique name, or use a different source to distinguish them.";
    readonly docs: false;
  };
  readonly NUXT_B1010: {
    readonly why: (p: {
      file: string;
    }) => string;
    readonly fix: "The file was modified while being read, usually by a concurrent process writing to it. Try restarting the build.";
    readonly docs: false;
  };
  readonly NUXT_B1011: {
    readonly why: (p: {
      file: string;
    }) => string;
    readonly fix: "Check that the file exists and is readable, or try clearing the build cache with `nuxt clean`.";
    readonly docs: false;
  };
  readonly NUXT_B1012: {
    readonly why: (p: {
      path: string;
    }) => string;
    readonly fix: "Delete the cache with `nuxt clean` and rebuild.";
    readonly docs: false;
  };
  readonly NUXT_B1013: {
    readonly why: (p: {
      file: string;
    }) => string;
    readonly fix: "Try clearing the build cache with `nuxt clean` and rebuilding from scratch.";
    readonly docs: false;
  };
  readonly NUXT_B1014: {
    readonly why: "Problem checking for external configuration files.";
    readonly fix: "This is likely a transient file system error. If it persists, check file permissions in your project root.";
    readonly docs: false;
  };
  readonly NUXT_B1015: {
    readonly why: "Falling back to `chokidar-granular` as `@parcel/watcher` cannot be resolved in your project.";
    readonly fix: "Install `@parcel/watcher` for better performance: `npm install -D @parcel/watcher`.";
    readonly docs: false;
  };
  readonly NUXT_B1016: {
    readonly why: "Failed to set up the `@parcel/watcher` file watcher.";
    readonly fix: "This is likely an environment or file system issue. Watching for file changes may not work; restart the dev server and, if the problem persists, report it.";
    readonly docs: false;
  };
  readonly NUXT_B1017: {
    readonly why: (p: {
      builder: string;
    }) => string;
    readonly fix: (p: {
      builder: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B1018: {
    readonly why: (p: {
      builder: string;
    }) => string;
    readonly fix: (p: {
      builder: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B1019: {
    readonly why: (p: {
      mode: string;
    }) => string;
    readonly fix: "If you are a module author, ensure the component `mode` is set to `client`, `server`, or `all`. Otherwise, please report this issue.";
    readonly docs: false;
  };
  readonly NUXT_B1020: {
    readonly why: "`experimental.watcher: \"builder\"` is set but the active builder does not implement `setupWatcher`. Falling back to the default file watcher.";
    readonly fix: "Remove `experimental.watcher` from your `nuxt.config`, or use a builder that supports its own watcher.";
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
//#region src/diagnostics/plugins.d.ts
/**
 * B2xxx
 * Plugin diagnostics (`addPlugin`, plugin metadata, plugin ordering).
 *
 * @internal
 */
declare const pluginDiagnostics: import("nostics").Diagnostics<{
  readonly NUXT_B2001: {
    readonly why: (p: {
      type: string;
      name: string;
    }) => string;
    readonly fix: "Pass an object literal as the second argument, e.g. `defineNuxtPlugin(() => {}, { name: 'my-plugin' })`.";
    readonly docs: false;
  };
  readonly NUXT_B2002: {
    readonly why: "Plugin options contain spread elements or computed keys, which are not supported.";
    readonly fix: "Use static properties instead.";
    readonly docs: false;
  };
  readonly NUXT_B2003: {
    readonly why: "`dependsOn` is not an array of string literals.";
    readonly fix: "Use string literals in the `dependsOn` array, e.g. `dependsOn: ['my-plugin']`.";
    readonly docs: false;
  };
  readonly NUXT_B2004: {
    readonly why: (p: {
      src: string;
    }) => string;
    readonly fix: "Add content to the plugin file, or remove it from the `plugins/` directory.";
    readonly docs: false;
  };
  readonly NUXT_B2005: {
    readonly why: (p: {
      src: string;
    }) => string;
    readonly fix: "Add `export default defineNuxtPlugin(() => {})` to your plugin.";
    readonly docs: false;
  };
  readonly NUXT_B2006: {
    readonly why: (p: {
      src: string;
    }) => string;
    readonly fix: "Check the plugin file for syntax errors.";
    readonly docs: false;
  };
  readonly NUXT_B2007: {
    readonly why: (p: {
      src: string;
    }) => string;
    readonly fix: "Wrap your plugin with `defineNuxtPlugin`. This may enable enhancements in future.";
    readonly docs: false;
  };
  readonly NUXT_B2008: {
    readonly why: (p: {
      name: string;
      missing: string;
    }) => string;
    readonly fix: "Register the missing dependency plugins, or remove them from the `dependsOn` array.";
    readonly docs: false;
  };
  readonly NUXT_B2009: {
    readonly why: (p: {
      cycle: string;
    }) => string;
    readonly fix: "Restructure the plugin `dependsOn` declarations to break the cycle.";
    readonly docs: false;
  };
  readonly NUXT_B2010: {
    readonly why: (p: {
      src: string;
    }) => string;
    readonly fix: "Use an object literal with static values as the second argument to `defineNuxtPlugin()`, and check the plugin file for syntax errors or unsupported constructs in the metadata.";
    readonly docs: false;
  };
  readonly NUXT_B2011: {
    readonly why: (p: {
      src: string;
    }) => string;
    readonly fix: "Pass a string path, or an object with a `src` property, to `addPlugin()`.";
    readonly docs: false;
  };
  readonly NUXT_B2012: {
    readonly why: (p: {
      name: string;
      dependencies: string[];
      mode: "client" | "server";
    }) => string;
    readonly fix: "Do not depend on plugins that are unavailable in the same build environment; remove them from the `dependsOn` array.";
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
//#region src/diagnostics/components.d.ts
/**
 * B3xxx
 * Component diagnostics.
 *
 * @internal
 */
declare const componentDiagnostics: import("nostics").Diagnostics<{
  readonly NUXT_B3001: {
    readonly why: (p: {
      dirPath: string;
    }) => string;
    readonly fix: "If this is intentional, remove it from `components.dirs` in your `nuxt.config`.";
    readonly docs: false;
  };
  readonly NUXT_B3002: {
    readonly why: (p: {
      component: string;
    }) => string;
    readonly fix: "Set `experimental.componentIslands` to `true` in your `nuxt.config`, or convert the component to a client component.";
    readonly docs: false;
  };
  readonly NUXT_B3003: {
    readonly why: (p: {
      component: string;
    }) => string;
    readonly fix: "Set `experimental.componentIslands` to `true` in your `nuxt.config`.";
    readonly docs: false;
  };
  readonly NUXT_B3004: {
    readonly why: (p: {
      file: string;
      component: string;
      requiredModule: string;
    }) => string;
    readonly fix: (p: {
      requiredModule: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B3005: {
    readonly why: (p: {
      component: string;
      file: string;
    }) => string;
    readonly fix: "Use only one hydration strategy attribute (e.g. `hydrate-on-visible` or `hydrate-on-idle`) per component.";
    readonly docs: false;
  };
  readonly NUXT_B3006: {
    readonly why: (p: {
      component: string;
      file: string;
    }) => string;
    readonly fix: (p: {
      lazyName: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B3007: {
    readonly why: (p: {
      file: string;
    }) => string;
    readonly fix: "Set `experimental.componentIslands.selectiveClient` to `true` in your `nuxt.config`.";
    readonly docs: false;
  };
  readonly NUXT_B3008: {
    readonly why: (p: {
      scannedPath: string;
    }) => string;
    readonly fix: (p: {
      scannedPath: string;
      expectedPath: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B3009: {
    readonly why: (p: {
      component: string;
      filePath: string;
    }) => string;
    readonly fix: "Rename the component to avoid the `Lazy` prefix.";
    readonly docs: false;
  };
  readonly NUXT_B3010: {
    readonly why: (p: {
      filePath: string;
    }) => string;
    readonly fix: "Rename the component file to something other than `index` (e.g. `MyComponent.vue`).";
    readonly docs: false;
  };
  readonly NUXT_B3011: {
    readonly why: (p: {
      component: string;
      filePath: string;
      duplicatePath: string;
    }) => string;
    readonly fix: "Rename one of the files or adjust the `components.dirs` prefix settings in your `nuxt.config`.";
    readonly docs: false;
  };
  readonly NUXT_B3012: {
    readonly why: (p: {
      name: string;
    }) => string;
    readonly fix: "Specify a `priority` option when calling `addComponent` to avoid this warning.";
    readonly docs: false;
  };
  readonly NUXT_B3013: {
    readonly why: (p: {
      file: string;
    }) => string;
    readonly fix: "Switch to the Vite builder with `builder: 'vite'` in your `nuxt.config`.";
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
//#region src/diagnostics/pages.d.ts
/**
 * B4xxx
 * Pages / routing diagnostics.
 *
 * @internal
 */
declare const pageDiagnostics: import("nostics").Diagnostics<{
  readonly NUXT_B4001: {
    readonly why: (p: {
      pathname: string;
    }) => string;
    readonly fix: "Add a `<template>` block to the page file, or remove the empty file from the `pages/` directory.";
    readonly docs: false;
  };
  readonly NUXT_B4002: {
    readonly why: "An `await` expression is used in a variable referenced by `definePageMeta`, which runs synchronously.";
    readonly fix: (p: {
      codeSnippet: string;
      offset: number;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B4003: {
    readonly why: (p: {
      callCount: number;
      file: string;
    }) => string;
    readonly fix: "Merge all `definePageMeta()` calls into a single call.";
    readonly docs: false;
  };
  readonly NUXT_B4004: {
    readonly why: (p: {
      file: string;
      existingFile: string;
    }) => string;
    readonly fix: "Set a custom name using `definePageMeta` within one of the page files.";
    readonly docs: false;
  };
  readonly NUXT_B4005: {
    readonly why: (p: {
      fnName: string;
      file: string;
      receivedType: string;
    }) => string;
    readonly fix: (p: {
      fnName: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B4006: {
    readonly why: (p: {
      fnName: string;
      file: string;
    }) => string;
    readonly fix: "Use only JSON-serializable values (strings, numbers, booleans, arrays, plain objects) in `defineRouteRules()`.";
    readonly docs: false;
  };
  readonly NUXT_B4007: {
    readonly why: (p: {
      fnName: string;
      file: string;
    }) => string;
    readonly fix: (p: {
      fnName: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B4008: {
    readonly why: "Server pages with `ssr: false` are not supported while component islands are auto-detected.";
    readonly fix: "Set `experimental.componentIslands` to `true`.";
    readonly docs: false;
  };
  readonly NUXT_B4009: {
    readonly why: (p: {
      file: string;
    }) => string;
    readonly fix: "Rename the layout file to something other than `index` (e.g. `layouts/default.vue`).";
    readonly docs: false;
  };
  readonly NUXT_B4010: {
    readonly why: (p: {
      file: string;
    }) => string;
    readonly fix: "Rename the middleware file to something other than `index` (e.g. `middleware/auth.ts`).";
    readonly docs: false;
  };
  readonly NUXT_B4011: {
    readonly why: (p: {
      message: string;
    }) => string;
    readonly fix: "Check the page file naming and directory structure for issues.";
    readonly docs: false;
  };
  readonly NUXT_B4012: {
    readonly why: (p: {
      event: string;
      path: string;
    }) => string;
    readonly fix: "This is usually harmless: the full rebuild will recover. If it happens repeatedly, check for unusual file naming in `pages/`.";
    readonly docs: false;
  };
  readonly NUXT_B4013: {
    readonly why: (p: {
      name: string;
      foundPath: string;
    }) => string;
    readonly fix: "Set `override: true` to replace it.";
    readonly docs: false;
  };
  readonly NUXT_B4014: {
    readonly why: (p: {
      layoutName: string;
      existingPath: string;
      newPath: string;
    }) => string;
    readonly fix: "Rename one of the layouts, or remove the duplicate layout registration.";
    readonly docs: false;
  };
  readonly NUXT_B4016: {
    readonly why: (p: {
      path: string;
      detail: string;
    }) => string;
    readonly fix: "Define the affected route rules explicitly in `nitro.routeRules`.";
    readonly docs: false;
  };
  readonly NUXT_B4017: {
    readonly why: (p: {
      path: string;
      pattern: string;
    }) => string;
    readonly fix: "The later inline route rules override the earlier ones. Use distinct routes, or define the rules explicitly in `nitro.routeRules`.";
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
//#region src/diagnostics/config.d.ts
/**
 * B5xxx
 * Configuration diagnostics.
 *
 * @internal
 */
declare const configDiagnostics: import("nostics").Diagnostics<{
  readonly NUXT_B5001: {
    readonly why: (p: {
      fallback: string;
    }) => string;
    readonly fix: (p: {
      latest: string;
    }) => string;
  };
  readonly NUXT_B5002: {
    readonly why: (p: {
      rootDir: string;
    }) => string;
    readonly fix: "Install it manually with `npm install -D @nuxt/webpack-builder`, or change the `builder` option to `vite` in `nuxt.config`.";
    readonly docs: false;
  };
  readonly NUXT_B5003: {
    readonly why: (p: {
      key: string;
    }) => string;
    readonly fix: "Move the key to `runtimeConfig.public` or a custom namespace.";
  };
  readonly NUXT_B5004: {
    readonly why: (p: {
      files: string;
    }) => string;
    readonly fix: "Move these configurations into `nuxt.config.ts` and delete the external config files.";
  };
  readonly NUXT_B5005: {
    readonly why: (p: {
      filePath: string;
    }) => string;
    readonly fix: "Ensure the file exports a valid object with `defineNuxtSchema()` or as a plain object.";
    readonly docs: false;
  };
  readonly NUXT_B5006: {
    readonly why: (p: {
      option: string;
    }) => string;
    readonly fix: "Remove the hash option from your webpack config.";
    readonly docs: false;
  };
  readonly NUXT_B5007: {
    readonly why: "The webpack server config `target` is not set to \"node\".";
    readonly fix: "Set `target: \"node\"` in your webpack server configuration.";
    readonly docs: false;
  };
  readonly NUXT_B5009: {
    readonly why: "`@parcel/watcher` cannot be resolved in your project, so `chokidar` is being used instead.";
    readonly fix: "Install `@parcel/watcher` for better file watching: `npm install -D @parcel/watcher`.";
    readonly docs: false;
  };
  readonly NUXT_B5010: {
    readonly why: (p: {
      names: string;
    }) => string;
    readonly fix: (p: {
      install: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B5011: {
    readonly why: (p: {
      name: string;
    }) => string;
    readonly fix: (p: {
      name: string;
    }) => string;
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
//#region src/diagnostics/head.d.ts
/**
 * B6xxx
 * Head / auto-import diagnostics.
 *
 * @internal
 */
declare const headDiagnostics: import("nostics").Diagnostics<{
  readonly NUXT_B6001: {
    readonly why: (p: {
      module: string;
      file: string;
    }) => string;
    readonly fix: "Import from `#imports` instead.";
    readonly docs: false;
  };
  readonly NUXT_B6002: {
    readonly why: (p: {
      name: string;
    }) => string;
    readonly fix: (p: {
      name: string;
      file: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B6003: {
    readonly why: "`unhead.legacy` is deprecated and will be removed.";
    readonly fix: "Remove deprecated head patterns (`hid`, `vmid`, `children`, `body: true`) and resolve promise values before passing them to `useHead`.";
    readonly docs: false;
  };
  readonly NUXT_B6004: {
    readonly why: "`experimental.headNext` is deprecated. CAPO sorting is now the default.";
    readonly fix: "Remove `experimental.headNext` from your `nuxt.config`, or set `unhead.legacy: true` to opt out temporarily.";
    readonly docs: false;
  };
  readonly NUXT_B6005: {
    readonly why: (p: {
      name: string;
      from: string;
    }) => string;
    readonly fix: "Check the `from` path in `imports.presets` (or the module that registered this import). Auto-imports from an unresolvable module are silently skipped and can surface as unrelated type errors elsewhere.";
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
//#region src/diagnostics/bundler.d.ts
/**
 * B7xxx
 * Bundler (Vite / webpack / Nitro) diagnostics.
 *
 * @internal
 */
declare const bundlerDiagnostics: import("nostics").Diagnostics<{
  readonly NUXT_B7001: {
    readonly why: "`rollup-plugin-visualizer` is not installed, so bundle analysis cannot run.";
    readonly fix: "Run `npm install -D rollup-plugin-visualizer` to enable bundle analysis.";
    readonly docs: false;
  };
  readonly NUXT_B7002: {
    readonly why: (p: {
      deps: string;
    }) => string;
    readonly fix: "Remove or correct these entries in the `vite.optimizeDeps.include` array of your `nuxt.config.ts`. Report entries added by a Nuxt module to the module author.";
    readonly docs: false;
  };
  readonly NUXT_B7003: {
    readonly why: "The server-side bundle produced more than one JS entry file.";
    readonly fix: "Avoid using `optimization.splitChunks` in the server config.";
    readonly docs: false;
  };
  readonly NUXT_B7004: {
    readonly why: (p: {
      entryName: string;
    }) => string;
    readonly fix: (p: {
      entryName: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B7005: {
    readonly why: (p: {
      input: string;
    }) => string;
    readonly fix: "Set `vite.build.rollupOptions.input` to a string or an object with an `entry` key in your `nuxt.config`.";
    readonly docs: false;
  };
  readonly NUXT_B7006: {
    readonly why: (p: {
      input: string;
    }) => string;
    readonly fix: "Set `vite.build.rollupOptions.input` to a string or an object with a `server` key in your `nuxt.config`.";
    readonly docs: false;
  };
  readonly NUXT_B7007: {
    readonly why: (p: {
      pluginName: string;
    }) => string;
    readonly fix: (p: {
      pluginName: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B7008: {
    readonly why: "`@vitejs/plugin-vue-jsx` is not installed, so JSX support is unavailable.";
    readonly fix: "Run `npm install -D @vitejs/plugin-vue-jsx` to install it.";
    readonly docs: false;
  };
  readonly NUXT_B7009: {
    readonly why: (p: {
      deps: string;
    }) => string;
    readonly fix: (p: {
      install: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B7011: {
    readonly why: (p: {
      pluginName: string;
    }) => string;
    readonly fix: (p: {
      pluginName: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_B7012: {
    readonly why: (p: {
      requiredSize: number;
      maxSize: number;
    }) => string;
    readonly fix: "Reduce the payload size sent through the ViteNode socket.";
    readonly docs: false;
  };
  readonly NUXT_B7013: {
    readonly why: "The ViteNode socket server was started without a configured socket path.";
    readonly fix: "This is likely an internal Nuxt bug. Please report it at https://github.com/nuxt/nuxt/issues.";
    readonly docs: false;
  };
  readonly NUXT_B7014: {
    readonly why: (p: {
      name: string;
    }) => string;
    readonly fix: "Fix the build errors listed above. If the errors are unclear, try running `nuxt cleanup` and rebuilding.";
    readonly docs: false;
  };
  readonly NUXT_B7015: {
    readonly why: "Payload extraction is disabled, which is suboptimal for full-static output.";
    readonly fix: "Set `experimental.payloadExtraction` to `true` or `'client'`.";
    readonly docs: false;
  };
  readonly NUXT_B7016: {
    readonly why: (p: {
      path: string;
    }) => string;
    readonly fix: "Point `spaLoadingTemplate` in `nuxt.config` at an existing HTML file, or set it to `true` to use the default template.";
    readonly docs: false;
  };
  readonly NUXT_B7017: {
    readonly why: "Could not find the Nuxt dev server to attach Rspack HMR to; hot module replacement will be disabled.";
    readonly fix: "This is likely an internal Nuxt bug. Please report it with a reproduction.";
    readonly docs: false;
  };
  readonly NUXT_B7018: {
    readonly why: "Failed to restrict vite-node socket permissions; closing the socket.";
    readonly fix: "Check that the temporary directory used for the vite-node socket is writable and supports `chmod`.";
    readonly docs: false;
  };
  readonly NUXT_B7019: {
    readonly why: "The server webpack build does not externalize dependencies.";
    readonly fix: "Externalize dependencies in the server build (`externals`) for better build performance.";
    readonly docs: false;
  };
  readonly NUXT_B7020: {
    readonly why: "The client build manifest is disabled, but Nuxt requires it to render the correct assets for each route.";
    readonly fix: "Remove any `build.manifest: false` override from your `nuxt.config` `vite` options or from a Vite plugin `config`/`configEnvironment` hook.";
    readonly docs: false;
  };
  readonly NUXT_B7021: {
    readonly why: (p: {
      manifestFile: string;
    }) => string;
    readonly fix: "Check that no Vite plugin removes or renames the client build manifest in a `generateBundle`/`writeBundle` hook. If this happens with no such plugin, please report it at https://github.com/nuxt/nuxt/issues.";
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
//#region src/internal/esm.d.ts
interface ResolveModuleOptions {
  /** @deprecated use `url` with URLs pointing at a file - never a directory */
  paths?: string | string[];
  url?: URL | URL[];
  /** @default ['.mjs', '.js', '.cjs', '.mts', '.ts', '.cts', '.tsx', '.jsx'] */
  extensions?: string[];
}
declare function directoryToURL(dir: string): URL;
/**
 * Resolve a module from a given root path using an algorithm patterned on
 * the upcoming `import.meta.resolve`. It returns a file URL
 *
 * @internal
 */
declare function tryResolveModule(id: string, url: URL | URL[]): Promise<string | undefined>;
/** @deprecated pass URLs pointing at files */
declare function tryResolveModule(id: string, url: string | string[]): Promise<string | undefined>;
declare function resolveModule(id: string, options?: ResolveModuleOptions): string;
interface ImportModuleOptions extends ResolveModuleOptions {
  /** Automatically de-default the result of requiring the module. */
  interopDefault?: boolean;
}
declare function importModule<T = unknown>(id: string, opts?: ImportModuleOptions): Promise<T>;
declare function tryImportModule<T = unknown>(id: string, opts?: ImportModuleOptions): Promise<T | undefined> | undefined;
/**
 * @deprecated Please use `importModule` instead.
 */
declare function requireModule<T = unknown>(id: string, opts?: ImportModuleOptions): T;
/**
 * @deprecated Please use `tryImportModule` instead.
 */
declare function tryRequireModule<T = unknown>(id: string, opts?: ImportModuleOptions): T | undefined;
//#endregion
export { type AddComponentOptions, type AddPluginOptions, type AddRouteMiddlewareOptions, DEFAULT_JSX_FILE_EXTENSIONS, DEFAULT_JS_FILE_EXTENSIONS, type ExtendConfigOptions, type ExtendRouteRulesOptions, type ExtendViteConfigOptions, type ExtendWebpackConfigOptions, type ImportModuleOptions, type LayerDirectories, type LoadNuxtConfigOptions, type LoadNuxtOptions, type NuxtMajorVersion, type RecoverableWatcher, type ResolveModuleOptions, type ResolvePathOptions, type Resolver, addBuildPlugin, addComponent, addComponentExports, addComponentsDir, addDevServerHandler, addImports, addImportsDir, addImportsSources, addLayout, addPlugin, addPluginTemplate, addPrerenderRoutes, addRouteMiddleware, addRspackPlugin, addServerHandler, addServerImports, addServerImportsDir, addServerPlugin, addServerScanDir, addServerTemplate, addTemplate, addTypeTemplate, addVitePlugin, addWebpackPlugin, assertNuxtCompatibility, buildDiagnostics, buildNuxt, bundlerDiagnostics, checkNuxtCompatibility, componentDiagnostics, configDiagnostics, createIsIgnored, createResolver, defineNuxtModule, directoryToURL, extendNuxtSchema, extendPages, extendRouteRules, extendRspackConfig, extendViteConfig, extendWebpackConfig, findPath, getDirectory, getLayerDirectories, getNuxtCtx, getNuxtModuleVersion, getNuxtVersion, hasNuxtCompatibility, hasNuxtModule, hasNuxtModuleCompatibility, headDiagnostics, importModule, installModule, installModules, isIgnored, isNuxt2, isNuxt3, isNuxtMajorVersion, loadNuxt, loadNuxtConfig, loadNuxtModuleInstance, logger, normalizeModuleTranspilePath, normalizePlugin, normalizeSemanticVersion, normalizeTemplate, nuxtCtx, packageName, pageDiagnostics, pluginDiagnostics, recoverThrottledChanges, requireModule, resolveAlias, resolveDeclarationPath, resolveFiles, resolveIgnorePatterns, resolveModule, resolveModuleWithOptions, resolveNuxtModule, resolvePath, resolveTypePaths, runWithNuxtContext, setBuildOutput, setGlobalHead, tryImportModule, tryRequireModule, tryResolveModule, tryUseNuxt, updateAppConfig, updateRuntimeConfig, updateTemplates, useLogger, useNitro, useNuxt, useRuntimeConfig, writeTypes };