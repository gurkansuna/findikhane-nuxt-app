//#region src/index.d.ts
interface ImpoundTraceStep {
  /** The file path in this step of the import chain. */
  file: string;
  /** The import specifier used (if not entry). */
  import?: string;
  /** Line number of the import statement (1-indexed, if available). */
  line?: number;
  /** Column number of the import statement (0-indexed, if available). */
  column?: number;
}
interface ImpoundSnippet {
  /** Formatted code snippet with line numbers, `>` marker, and `^` caret. */
  text: string;
  /** The line number of the offending import (1-indexed). */
  line: number;
  /** The column number of the offending import (0-indexed). */
  column: number;
}
interface ImpoundViolationInfo {
  /** The resolved import specifier that was denied. */
  id: string;
  /** The file that contains the denied import. */
  importer: string;
  /** The formatted error message. */
  message: string;
  /** Import chain from entry to violation (when trace is enabled). */
  trace?: ImpoundTraceStep[];
  /** Source code snippet around the offending import (when trace is enabled). */
  snippet?: ImpoundSnippet;
}
interface ImpoundMatcherOptions {
  /** An array of patterns of importers to apply the import protection rules to. */
  include?: Array<string | RegExp>;
  /** An array of patterns of importers where the import protection rules explicitly do not apply. */
  exclude?: Array<string | RegExp>;
  /** Whether to throw an error or not. if set to `false`, an error will be logged to console instead. */
  error?: boolean;
  /**
   * Controls whether duplicate warnings are logged when `error` is `false`.
   * - `'once'` (default): each unique violation is logged only once.
   * - `'always'`: every violation is logged, even if repeated.
   *
   * This has no effect when `error` is `true` (the default), since the build fails on the first violation.
   */
  warn?: 'once' | 'always';
  /**
   * Callback invoked on every violation. Receives the violation details.
   *
   * Return `false` to allow the import and suppress the default error/warning. When
   * `trace` is enabled the hook runs after the import has already been replaced by the
   * proxy, so `false` only suppresses the report.
   */
  onViolation?: (info: ImpoundViolationInfo) => boolean | void;
  /**
   * An array of patterns matching resolved import targets that should be excluded from pattern checks.
   * Useful for skipping false positives from third-party packages, e.g. node_modules.
   */
  excludeFiles?: Array<string | RegExp>;
  /** An array of patterns to prevent being imported, along with an optional warning and suggestions to display.  */
  patterns: [importPattern: string | RegExp | ((id: string, importer: string) => boolean | string), warning?: string, suggestions?: string[]][];
}
interface ImpoundSharedOptions {
  cwd?: string;
  /**
   * Enable import tracing and code snippets in violation reports.
   *
   * `true` parses every module and materialises its sourcemap, so snippets point at
   * original source. `'lazy'` collects nothing and reads the bundler's own graph at
   * `buildEnd` instead.
   *
   * Use `'lazy'` for builds and keep `true` for a dev server: a dev server calls
   * `buildEnd` when it shuts down, so violations would go unreported for the session.
   *
   * With `error: true`, lazy reports the first violation and fails the build there, so
   * later ones stay unreported until it is fixed.
   *
   * Lazy needs a module graph, which every bundler but esbuild exposes; there it
   * reports the plain message.
   */
  trace?: boolean | 'lazy';
  /**
   * Maximum depth for import traces. Only used when `trace` is enabled.
   * @default 20
   */
  maxTraceDepth?: number;
}
type ImpoundOptions = (ImpoundSharedOptions & ImpoundMatcherOptions) | (ImpoundSharedOptions & {
  matchers: ImpoundMatcherOptions[];
});
declare const ImpoundPlugin: import("unplugin").UnpluginInstance<ImpoundOptions, boolean>;
//#endregion
export { ImpoundMatcherOptions, ImpoundOptions, ImpoundPlugin, ImpoundSharedOptions, ImpoundSnippet, ImpoundTraceStep, ImpoundViolationInfo };