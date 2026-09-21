import { createConsoleReporter } from "nostics";
import { ansiFormatter } from "nostics/formatters/ansi";
import { createDevReporter } from "nostics/reporters/dev";
//#region src/app/diagnostics/_shared.ts
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
function docsBase(code) {
	return `https://nuxt.com/docs/4.x/errors/${code.replace("NUXT_", "").toLowerCase()}`;
}
const ansi = (open, close) => (s) => `\x1B[${open}m${s}\x1B[${close}m`;
const colors = {
	red: ansi(31, 39),
	yellow: ansi(33, 39),
	cyan: ansi(36, 39),
	gray: ansi(90, 39),
	bold: ansi(1, 22),
	dim: ansi(2, 22)
};
const devReporters = import.meta.dev && !import.meta.test ? [/* @__PURE__ */ createDevReporter()] : [];
const reporters = [/* @__PURE__ */ createConsoleReporter(import.meta.client || import.meta.test ? void 0 : { formatter: ansiFormatter(colors) }), ...devReporters];
const prodReporter = (diagnostic) => {
	console.error(`[${diagnostic.name}]`);
};
const prodReporters = [prodReporter];
//#endregion
export { docsBase, prodReporters, reporters };
