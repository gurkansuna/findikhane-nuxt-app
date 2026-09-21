//#region src/app/diagnostics/manifest.d.ts
/**
 * E5xxx
 * App manifest / route-rules runtime diagnostics.
 */
declare const manifestDiagnostics: import("nostics").Diagnostics<Record<string, import("nostics").DiagnosticDefinition<any>>, readonly [import("nostics").DiagnosticReporter]> | import("nostics").Diagnostics<{
  readonly NUXT_E5001: {
    readonly why: "The app manifest is not enabled.";
    readonly fix: "Set `experimental.appManifest: true` in your `nuxt.config`.";
  };
  readonly NUXT_E5002: {
    readonly why: "Could not fetch the app manifest.";
    readonly fix: "Check that your server is running and the manifest endpoint is reachable. This may be a transient network issue.";
    readonly docs: false;
  };
  readonly NUXT_E5003: {
    readonly why: (p: {
      path: string;
    }) => string;
    readonly fix: "Check your `routeRules` in `nuxt.config` for invalid patterns.";
    readonly docs: false;
  };
  readonly NUXT_E5004: {
    readonly why: "Received a malformed app manifest.";
    readonly fix: "Ensure that `builds/meta/*.json` is served as JSON by your hosting/proxy and not rewritten to an HTML fallback.";
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>, import("nostics").DiagnosticReporter] | readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
export { manifestDiagnostics };