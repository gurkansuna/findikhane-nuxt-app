//#region src/types.d.ts
interface ResourceMeta {
  src?: string;
  file: string;
  css?: string[];
  assets?: string[];
  isEntry?: boolean;
  name?: string;
  isDynamicEntry?: boolean;
  sideEffects?: boolean;
  imports?: string[];
  dynamicImports?: string[];
  module?: boolean;
  prefetch?: boolean;
  preload?: boolean;
  resourceType?: "audio" | "document" | "embed" | "fetch" | "font" | "image" | "object" | "script" | "style" | "track" | "worker" | "video";
  mimeType?: string;
}
interface Manifest {
  [key: string]: ResourceMeta;
}
declare function defineManifest(manifest: Manifest): Manifest;
//#endregion
//#region src/runtime.d.ts
interface ModuleDependencies {
  scripts: Record<string, ResourceMeta>;
  styles: Record<string, ResourceMeta>;
  preload: Record<string, ResourceMeta>;
  prefetch: Record<string, ResourceMeta>;
}
interface SSRContext {
  renderResourceHints?: (...args: unknown[]) => unknown;
  renderScripts?: (...args: unknown[]) => unknown;
  renderStyles?: (...args: unknown[]) => unknown;
  modules?: Set<string>;
  _registeredComponents?: Set<string>;
  _requestDependencies?: ModuleDependencies;
  [key: string]: unknown;
}
interface RenderOptions {
  buildAssetsURL?: (id: string) => string;
  /** @deprecated Use `precomputed` instead for better performance */
  manifest?: Manifest;
  /** Precomputed dependency data */
  precomputed?: PrecomputedData;
  /**
   * Maximum number of entries kept in each layer of the per-request
   * module-set cache: one keyed by the sorted module ids of a request, one by
   * a hash of the ids in their original order. Both are bounded LRUs of this
   * size over the same dependency objects, so the working set stays bounded
   * instead of pinning manifest references for the lifetime of the renderer.
   *
   * Set to `0` (or any non-positive / non-finite value) to disable the
   * cache entirely; useful for prerender runs or for sites whose request
   * variation makes the cache pure overhead. Per-resource caches of rendered
   * markup are unaffected; those are bounded by the manifest, at roughly 1KB
   * per entry rendered.
   *
   * @default 1000
   */
  dependencySetsCacheSize?: number;
}
/** A request's merged dependencies as slot arrays, held with its rendered output. */
interface MergedOrder {
  styleSlots: number[];
  scriptSlots: number[];
  preloadSlots: number[];
  prefetchSlots: number[];
  mergeSlots: MergeSlots;
}
interface RenderedOutputs {
  order?: MergedOrder;
  styles?: string;
  scripts?: string;
  hints?: string;
  hintsWithoutScripts?: string;
  headerLink?: string;
  headerLinkWithoutScripts?: string;
}
interface RendererContext {
  buildAssetsURL: (id: string) => string;
  manifest?: Manifest;
  precomputed?: PrecomputedData;
  _dependencies: Record<string, ModuleDependencies>;
  _dependencySets: Map<string, ModuleDependencies>;
  _dependencySetAliases: Map<number, DependencySetAlias>;
  _aliasIdHashes: Record<string, number>;
  _aliasIdHashCount: number;
  _dependencySetsCacheSize: number;
  _entrypoints: string[];
  _renderedCache: WeakMap<ModuleDependencies, RenderedOutputs>;
  _fragments: Record<FragmentKind, string[]>;
  _flatDependencies: Record<string, FlatDependencies>;
  _mergeSlots: MergeSlots;
  _idScratch: string[];
  updateManifest: (manifest: Manifest) => void;
}
/** A module's contribution as slot arrays, including prefetch via its dynamic imports. */
interface FlatDependencies {
  scriptSlots: number[];
  styleSlots: number[];
  preloadSlots: number[];
  prefetchSlots: number[];
}
/** Interned resource slots, plus the stamp lanes a merge marks to deduplicate. */
interface MergeSlots {
  slotOf: Record<string, number>;
  count: number;
  idOf: string[];
  metaOf: ResourceMeta[];
  scripts: Uint8Array;
  styles: Uint8Array;
  preload: Uint8Array;
  prefetch: Uint8Array;
  epoch: number;
}
type FragmentKind = "style" | "script" | "preloadHint" | "prefetchHint" | "preloadHeader" | "prefetchHeader" | "href";
interface LinkAttributes {
  rel: string | null;
  href: string;
  as?: string | null;
  type?: string | null;
  crossorigin?: "" | null;
}
declare function createRendererContext({ manifest, precomputed, buildAssetsURL, dependencySetsCacheSize }: RenderOptions): RendererContext;
declare function getModuleDependencies(id: string, rendererContext: RendererContext): ModuleDependencies;
/** Keyed by a hash of the request's ids, so every lookup verifies them. */
interface DependencySetAlias {
  ids: string[];
  deps: ModuleDependencies;
}
declare function getAllDependencies(ids: Set<string>, rendererContext: RendererContext): ModuleDependencies;
interface RequestDependenciesOptions {
  /**
   * Module ids to exclude from dependency resolution. Excluded ids are
   * subtracted from the merged id set before resolution, so chunks reachable
   * only through them are also dropped. Has no effect on `renderStyles`,
   * `renderScripts`, or `getResources`, which deliberately ignore this option.
   */
  exclude?: Iterable<string>;
}
declare function getRequestDependencies(ssrContext: SSRContext, rendererContext: RendererContext, options?: RequestDependenciesOptions): ModuleDependencies;
declare function renderStyles(ssrContext: SSRContext, rendererContext: RendererContext): string;
declare function getResources(ssrContext: SSRContext, rendererContext: RendererContext): LinkAttributes[];
interface ResourceHintOptions extends RequestDependenciesOptions {
  /**
   * Whether to include hints for the client runtime, i.e. those rendered as
   * `rel="modulepreload"` or `as="script"`.
   *
   * @default true
   */
  scripts?: boolean;
}
declare function renderResourceHints(ssrContext: SSRContext, rendererContext: RendererContext, options?: ResourceHintOptions): string;
declare function renderResourceHeaders(ssrContext: SSRContext, rendererContext: RendererContext, options?: ResourceHintOptions): Record<string, string>;
declare function getPreloadLinks(ssrContext: SSRContext, rendererContext: RendererContext, options?: ResourceHintOptions): LinkAttributes[];
declare function getPrefetchLinks(ssrContext: SSRContext, rendererContext: RendererContext, options?: ResourceHintOptions): LinkAttributes[];
declare function renderScripts(ssrContext: SSRContext, rendererContext: RendererContext): string;
type RenderFunction = (ssrContext: SSRContext, rendererContext: RendererContext) => unknown;
type CreateApp<App> = (ssrContext: SSRContext) => App | Promise<App>;
type ImportOf<T> = T | {
  default: T;
} | Promise<T> | Promise<{
  default: T;
}>;
type RenderToString<App> = (app: App, ssrContext: SSRContext) => string | Promise<string>;
interface Renderer {
  rendererContext: RendererContext;
  renderToString: (ssrContext: SSRContext) => Promise<{
    html: string;
    renderResourceHeaders: () => Record<string, string>;
    renderResourceHints: () => string;
    renderStyles: () => string;
    renderScripts: () => string;
  }>;
}
declare function createRenderer<App>(createApp: ImportOf<CreateApp<App>>, renderOptions: RenderOptions & {
  renderToString: RenderToString<App>;
}): Renderer;
//#endregion
//#region src/precompute.d.ts
interface PrecomputedData {
  /** Pre-resolved dependencies for each module */
  dependencies: Record<string, ModuleDependencies>;
  /** List of entry point module IDs */
  entrypoints: string[];
  /** Module metadata needed at runtime (file paths, etc.) */
  modules: Record<string, Pick<ResourceMeta, "file" | "resourceType" | "mimeType" | "module" | "dynamicImports">>;
  /** Number of manifest entries, used to size runtime lookup tables. */
  resourceCount: number;
}
/**
 * Build-time utility to precompute all module dependencies from a manifest.
 * This eliminates recursive dependency resolution at runtime.
 *
 * @param manifest The build manifest
 * @returns Serializable precomputed data for runtime use
 */
declare function precomputeDependencies(manifest: Manifest): PrecomputedData;
//#endregion
export { Manifest as C, renderStyles as S, defineManifest as T, getRequestDependencies as _, RenderOptions as a, renderResourceHints as b, RequestDependenciesOptions as c, createRenderer as d, createRendererContext as f, getPreloadLinks as g, getPrefetchLinks as h, RenderFunction as i, ResourceHintOptions as l, getModuleDependencies as m, precomputeDependencies as n, Renderer as o, getAllDependencies as p, ModuleDependencies as r, RendererContext as s, PrecomputedData as t, SSRContext as u, getResources as v, ResourceMeta as w, renderScripts as x, renderResourceHeaders as y };