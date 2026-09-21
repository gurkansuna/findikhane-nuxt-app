//#region src/parse.d.ts
interface ParsePathOptions {
  /**
   * File extensions to strip. If omitted, all extensions are stripped.
   */
  extensions?: string[];
  postfix?: string;
  /** Warn about invalid characters in dynamic parameters. */
  warn?: (message: string) => void;
  /**
   * Mode suffixes to detect (e.g. `['client', 'server']`).
   * Detected as `.mode` before the file extension.
   */
  modes?: string[];
  /** Root paths to strip from file paths. Longest match wins. */
  roots?: string[];
}
type SegmentType = "static" | "dynamic" | "optional" | "catchall" | "group" | "repeatable" | "optional-repeatable";
interface ParsedPathSegmentToken {
  type: SegmentType;
  value: string;
}
type ParsedPathSegment = ParsedPathSegmentToken[];
interface ParsedPath {
  /** Original file path before processing. */
  file: string;
  segments: ParsedPathSegment[];
  meta?: {
    /** Detected modes (e.g. `['client', 'vapor']`). */
    modes?: string[];
    /** Named view from `@name` suffix. */
    name?: string;
  };
}
declare function parsePath(filePaths: string[], options?: ParsePathOptions): ParsedPath[];
/**
 * Pre-compile parsing options for repeated calls.
 *
 * Returns a callable that has the same signature as `parsePath` (minus options)
 * but reuses pre-built regexes and mode lists, avoiding re-compilation on each
 * invocation.
 *
 * @example
 * const parse = compileParsePath({ roots: ['pages/'], modes: ['client', 'server'] })
 * const result = parse(['pages/index.vue'])
 */
interface CompiledParsePath {
  (filePaths: string[]): ParsedPath[];
  /**
   * @internal
   */
  "~compiled": true;
}
declare function compileParsePath(options?: ParsePathOptions): CompiledParsePath;
declare function parseSegment(segment: string, absolutePath?: string, warn?: (message: string) => void): ParsedPathSegmentToken[];
//#endregion
//#region src/tree.d.ts
interface RouteNodeFile {
  /** Original file path (before root stripping / extension removal) */
  "path": string;
  /** Relative path reconstructed from parsed segments (for sorting) */
  "relativePath": string;
  /** Named view slot (`'default'` unless `@name` suffix was used) */
  "viewName": string;
  /** Mode variants (e.g. `['client']`, `['server']`) */
  "modes"?: string[];
  /** Route group names from transparent group segments */
  "groups": string[];
  /** Original parsed segments (including groups) */
  "originalSegments": ParsedPathSegment[];
  /** Layer priority — lower number wins. @default 0 */
  "priority": number;
  /**
   * Precomputed key for duplicate detection
   * @internal
   */
  "~dedupeKey"?: string;
}
/**
 * A node in the route tree.
 *
 * "Page nodes" have files; "structural nodes" don't.
 * Page nodes create nesting boundaries; structural nodes collapse into children.
 */
interface RouteNode {
  rawSegment: string;
  segment: ParsedPathSegment;
  /** Attached files. Empty = structural node. */
  files: RouteNodeFile[];
  children: Map<string, RouteNode>;
  parent: RouteNode | null;
}
/** Input file with optional layer priority. */
interface InputFile {
  path: string;
  /** Layer priority — lower number wins. @default 0 */
  priority?: number;
}
interface BuildTreeOptions extends ParsePathOptions {
  /**
   * How to resolve duplicate files at the same tree position.
   *
   * - `'first-wins'` — keep existing unless the new file has strictly lower
   *   priority number. Equal priority keeps the first.
   * - `'last-wins'` — always replace with the later file.
   * - `'error'` — throw on duplicates.
   *
   * @default 'first-wins'
   */
  duplicateStrategy?: "first-wins" | "last-wins" | "error";
}
interface RouteTree {
  "root": RouteNode;
  /**
   * Whether the tree has been modified since the last converter output.
   * Set to `true` by `addFile` / `removeFile` / `buildTree`.
   * Converters (e.g. `toVueRouter4`) can set this to `false` after caching.
   * @internal
   */
  "~dirty": boolean;
  /**
   * Index from file path to the node that contains it.
   * Enables O(1) lookup for `removeFile`.
   * @internal
   */
  "~fileIndex": Map<string, RouteNode>;
}
/**
 * Build a route tree from file paths.
 *
 * Accepts `string[]`, `InputFile[]`, or `ParsedPath[]`.
 * On collision, the file with the lowest priority number wins.
 */
declare function buildTree(input: string[] | InputFile[] | ParsedPath[], options?: BuildTreeOptions): RouteTree;
/**
 * Add a single file to an existing route tree.
 *
 * Parses the file path and inserts it into the tree in-place, avoiding a full
 * rebuild. Useful for dev-server HMR when a file is added or renamed.
 *
 * The `options` parameter accepts either raw `BuildTreeOptions` or a
 * pre-compiled `CompiledParsePath` (from `compileParsePath()`) for faster
 * repeated calls.
 */
declare function addFile(tree: RouteTree, filePath: string | InputFile, options?: BuildTreeOptions | CompiledParsePath): void;
/**
 * Remove a file from an existing route tree by its original file path.
 *
 * Prunes empty structural nodes left behind. Returns `true` if the file was
 * found and removed.
 */
declare function removeFile(tree: RouteTree, filePath: string): boolean;
/** Walk the tree depth-first, calling `visitor` for each non-root node. */
declare function walkTree(tree: RouteTree, visitor: (node: RouteNode, depth: number, parent: RouteNode | null) => void): void;
/** True if the node has files attached (is a "page node"). */
declare function isPageNode(node: RouteNode): boolean;
//#endregion
//#region src/converters.d.ts
/**
 * Maps an `attrs` record to typed optional properties on the route.
 *
 * Each key becomes an optional property whose value is a single literal
 * from the array. The attr is only set when exactly one mode matches.
 *
 * @example
 * type R = InferAttrs<{ mode: ['client', 'server'] }>
 * // { mode?: 'client' | 'server' }
 */
type InferAttrs<T extends Record<string, string[]>> = { [K in keyof T]?: T[K][number]; };
type VueRoute<Attrs extends Record<string, string[]> = {}> = {
  name?: string;
  path: string;
  file?: string;
  /** Named view files keyed by view name. Only present when named views exist. */
  components?: Record<string, string>;
  modes?: string[];
  children: VueRoute<Attrs>[];
  meta?: Record<string, unknown>;
} & ([keyof Attrs] extends [never] ? {
  [key: string]: unknown;
} : InferAttrs<Attrs>);
interface VueRouterEmitOptions<Attrs extends Record<string, string[]> = {}> {
  /**
   * Custom route name generator.
   * Receives `/`-separated name (e.g. `'users/id'`), returns final name.
   * Default: Nuxt-style — strip trailing `/index`, replace `/` with `-`.
   */
  getRouteName?: (rawName: string) => string;
  /** Called when two routes resolve to the same generated name. */
  onDuplicateRouteName?: (name: string, file: string, existingFile: string) => void;
  /**
   * Collapse modes into single-value attributes.
   *
   * Each key becomes a typed top-level property on the route. When a route has
   * exactly one matching mode the attribute is set to that value string; when
   * none or multiple modes match, the attribute is omitted and the raw `modes`
   * array is emitted instead.
   *
   * The return type of `toVueRouter4` infers typed properties from the attrs
   * definition so that, e.g., `attrs: { mode: ['client', 'server'] }` produces
   * routes with `mode?: 'client' | 'server'`.
   *
   * @example
   * // Input: route has modes: ['server']
   * toVueRouter4(tree, { attrs: { mode: ['client', 'server'] } })
   * // Output: { ..., mode: 'server' }  (no `modes` property)
   *
   * @example
   * // Custom method-based routing
   * toVueRouter4(tree, { attrs: { method: ['get', 'post'] } })
   * // For a route with modes: ['get'] → { ..., method: 'get' }
   */
  attrs?: Attrs;
}
interface Rou3Route {
  path: string;
  file: string;
}
interface RegExpRoute {
  pattern: RegExp;
  keys: string[];
  file: string;
}
/**
 * Convert a route tree to Vue Router 4 route definitions.
 *
 * Results are cached on the tree and deep-cloned on return, so mutations
 * to the returned array do not affect the cache. The cache is automatically
 * invalidated when `addFile` / `removeFile` mark the tree as dirty.
 */
declare function toVueRouter4<const Attrs extends Record<string, string[]> = never>(tree: RouteTree, options?: VueRouterEmitOptions<[Attrs] extends [never] ? {} : Attrs>): VueRoute<[Attrs] extends [never] ? {} : Attrs>[];
declare function toRou3(tree: RouteTree): Rou3Route[];
interface VueRouterToRou3Options {
  /**
   * Expand params whose custom regexp is a finite alternation of literal
   * values (e.g. `:locale(de|fr)`) into one concrete path per branch.
   *
   * When `false`, such params are emitted as a single rou3 dynamic param
   * (`:locale`) instead of being enumerated.
   *
   * @default true
   */
  expand?: boolean;
  /**
   * Upper bound on the number of paths a single input may expand to. Once the
   * cartesian product of enumerable branches would exceed this, expansion is
   * abandoned and the offending params fall back to dynamic rou3 params.
   *
   * @default 100
   */
  maxExpansions?: number;
  /**
   * Collapse each resulting path into a glob using only `*` and `**`
   * wildcards. A bare whole-segment param (`:id`) becomes a single-segment
   * `*` wildcard, which rou3 matches exactly, so `/products/:id` becomes
   * `['/products/*']` and later segments stay intact. A bare optional param
   * (`:id?`) becomes a trailing `*` (optional in rou3) or, mid-path, expands
   * into both variants (with and without the segment). Anything rou3's
   * wildcards cannot represent exactly (a regexp constraint, a partial
   * segment like `prefix-:id`, a repeatable param) collapses into a `**` catch-all from that segment onwards, e.g.
   * `/users/:id(\d+)/edit` becomes `['/users/**']`. Enumerable params are
   * still expanded first (subject to `expand`), so `/:locale(en|nl)/account`
   * becomes `['/en/account', '/nl/account']`. Useful for deriving route-rule
   * keys or region prefixes rather than faithful matchers.
   *
   * @default false
   */
  collapse?: boolean;
}
interface VueRouterToRou3Result {
  /** The converted rou3 patterns. */
  patterns: string[];
  /**
   * One entry per lossy or widening step taken during conversion, e.g. a
   * collapsed catch-all, a dropped regexp or an abandoned expansion. Empty
   * when the conversion is faithful. Lets callers surface risky conversions
   * to their users.
   */
  issues: VueRouterToRou3Issue[];
}
interface VueRouterToRou3Issue {
  /**
   * - `collapsed`: the path (or its remainder) was replaced with a `**`
   *   catch-all, which also matches nested paths the original did not.
   * - `dropped-regexp`: a param's custom regexp was dropped, either because
   *   the param is repeatable (rou3 does not enforce constraints there) or
   *   because the regexp contains `/` (rou3 splits patterns on slashes and
   *   cannot represent it).
   * - `max-expansions`: enumerating an alternation was abandoned because it
   *   would exceed `maxExpansions`; a dynamic param was emitted instead.
   */
  type: "collapsed" | "dropped-regexp" | "max-expansions";
  /** The param name involved, if the issue concerns a single param. */
  param?: string;
  message: string;
}
/**
 * Convert a compiled Vue Router path string (e.g. from a route definition's
 * `path`) into one or more rou3 patterns.
 *
 * Params carrying a finite alternation regexp are expanded into concrete
 * paths, so `/:locale(de|fr)/account/verify` becomes
 * `['/de/account/verify', '/fr/account/verify']`. Other params degrade to
 * rou3 dynamic (`:id`), repeatable (`:id+`), optional (`:id?`) or catch-all
 * (`:id*` / `**`) segments. Custom regexps are preserved as rou3 param
 * constraints where rou3 enforces them (plain and optional params); they are
 * dropped on repeatable params (rou3 ignores them there) and when the regexp
 * contains `/` (rou3 cannot represent it).
 *
 * Any lossy or widening step taken along the way is recorded in `issues`, so
 * callers can surface risky conversions to their users.
 *
 * @example
 * vueRouterToRou3('/:locale(de|fr)/account/verify').patterns
 * // => ['/de/account/verify', '/fr/account/verify']
 *
 * @example
 * vueRouterToRou3('/users/:id(\\d+)').patterns
 * // => ['/users/:id(\\d+)']
 */
declare function vueRouterToRou3(path: string, options?: VueRouterToRou3Options): VueRouterToRou3Result;
declare function toRegExp(tree: RouteTree): RegExpRoute[];
interface ToVueRouterSegmentOptions {
  /**
   * Whether there are non-index segments following this one.
   * When `true`, catchall tokens use `([^/]*)*` (restrictive);
   * when `false` (default), they use `(.*)*` (permissive).
   */
  hasSucceeding?: boolean;
}
/**
 * Convert a single parsed segment (an array of tokens returned by
 * `parseSegment`) into a Vue Router 4 path segment string.
 *
 * @example
 * const tokens = parseSegment('[id]')
 * toVueRouterSegment(tokens) // => ':id()'
 */
declare function toVueRouterSegment(tokens: ParsedPathSegmentToken[], options?: ToVueRouterSegmentOptions): string;
/**
 * Convert an array of parsed path segments into a full Vue Router 4 path
 * string. Automatically determines `hasSucceeding` for each segment so that
 * mid-path catchalls use the restrictive `([^/]*)*` pattern.
 *
 * @example
 * const parsed = parsePath(['users/[id].vue'])[0]
 * toVueRouterPath(parsed.segments) // => '/users/:id()'
 */
declare function toVueRouterPath(segments: ParsedPathSegment[]): string;
//#endregion
//#region src/url-pattern.d.ts
/**
 * Convert rou3 / Nitro route patterns into URLPattern pathname syntax.
 *
 * rou3 describes its own syntax as "URLPattern-compatible", and most tokens
 * (`:name`, `:name(regex)`, `:name?`, `:name+`, `:name*`, `(regex)`, `{...}`)
 * mean the same thing in both, so they are passed through unchanged. Only two
 * tokens genuinely differ and are translated:
 *
 * - rou3 `*` is a single-segment wildcard (`[^/]*`); URLPattern `*` is a
 *   greedy catch-all (`.*`, crosses `/`), so rou3 `*` becomes `([^/]*)`.
 * - rou3 `**` (and `**:name`) is a catch-all; URLPattern treats `**`
 *   literally, so it becomes `*`.
 *
 * See rou3's "Differences from URLPattern" table:
 * https://github.com/h3js/rou3#differences-from-urlpattern
 *
 * The resulting strings are URLPattern pathname patterns, so they can be
 * dropped straight into a Speculation Rules `href_matches` rule or passed to
 * `new URLPattern({ pathname })`.
 */
interface Rou3ToURLPatternIssue {
  /**
   * `widened`: the emitted pattern matches more than the rou3 route did, e.g. a
   * single-segment token mapped to `*` (which crosses `/`) under
   * `segment: 'loose'`, or a repeating group (`{...}+` / `{...}*`), which rou3
   * scopes to a single segment but URLPattern repeats across `/`.
   */
  type: "widened";
  /** The param name involved, if the issue concerns a single param. */
  param?: string;
  message: string;
}
interface Rou3PatternToURLPatternOptions {
  /**
   * How to translate a single-segment token (rou3 `:name` and bare `*`).
   *
   * - `'strict'` (default): map to `([^/]+)` / `([^/]*)` so the pattern does
   *   not match across `/`, preserving rou3's segment-scoped semantics.
   * - `'loose'`: map to URLPattern `*`, matching Nuxt's historical inline
   *   conversion. This over-matches (a single `*` will also match nested
   *   paths) and is reported as a `widened` issue, but produces shorter
   *   patterns.
   */
  segment?: "strict" | "loose";
}
interface Rou3PatternToURLPatternResult {
  /** The converted URLPattern pathname pattern. */
  pattern: string;
  /** One entry per lossy or widening conversion step; empty when faithful. */
  issues: Rou3ToURLPatternIssue[];
}
/**
 * Convert a single rou3 route pattern into a URLPattern pathname pattern.
 *
 * URLPattern-compatible tokens (named params, constrained params, modifiers,
 * groups) are passed through unchanged; only `*` and `**` are translated (see
 * the module doc comment). Backslash-escaped characters are left as-is.
 *
 * Any widening step is recorded in `issues` (see {@link Rou3ToURLPatternIssue}),
 * so callers can surface risky conversions to their users rather than silently
 * emitting a broader matcher.
 *
 * @example
 * rou3PatternToURLPattern('/blog/**').pattern // => '/blog/*'
 * rou3PatternToURLPattern('/users/:id').pattern // => '/users/:id'
 * rou3PatternToURLPattern('/users/:id', { segment: 'loose' }).pattern // => '/users/*'
 */
declare function rou3PatternToURLPattern(pattern: string, options?: Rou3PatternToURLPatternOptions): Rou3PatternToURLPatternResult;
//#endregion
export { type BuildTreeOptions, type CompiledParsePath, type InferAttrs, type InputFile, type ParsePathOptions, type ParsedPath, type ParsedPathSegment, type ParsedPathSegmentToken, type RegExpRoute, type Rou3PatternToURLPatternOptions, type Rou3PatternToURLPatternResult, type Rou3Route, type Rou3ToURLPatternIssue, type RouteNode, type RouteNodeFile, type RouteTree, type SegmentType, type ToVueRouterSegmentOptions, type VueRoute, type VueRouterEmitOptions, type VueRouterToRou3Issue, type VueRouterToRou3Options, type VueRouterToRou3Result, addFile, buildTree, compileParsePath, isPageNode, parsePath, parseSegment, removeFile, rou3PatternToURLPattern, toRegExp, toRou3, toVueRouter4, toVueRouterPath, toVueRouterSegment, vueRouterToRou3, walkTree };