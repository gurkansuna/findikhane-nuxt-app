import { DiagnosticReporter } from "nostics";
//#region src/app/diagnostics/_shared.d.ts
/**
 * Shared configuration for the runtime (E<N>xxx) diagnostics catalogs.
 *
 * Catalogs are split by domain and imported directly where used (no barrel),
 * so the browser bundle only pulls in the codes a module references. Pair the
 * pure-call annotations on each `defineDiagnostics()` with dev-guarded,
 * statement-level report calls so report-only diagnostics strip from production.
 *
 * Codes are stable, fully-qualified `NUXT_E<NNNN>` identifiers. Codes with a
 * dedicated docs page resolve a `see:` URL via {@link docsBase}; the rest opt
 * out with `docs: false`.
 */
declare function docsBase(code: string): string;
declare const reporters: readonly [DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>, DiagnosticReporter] | readonly [DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>];
declare const prodReporters: readonly [DiagnosticReporter];
//#endregion
export { docsBase, prodReporters, reporters };