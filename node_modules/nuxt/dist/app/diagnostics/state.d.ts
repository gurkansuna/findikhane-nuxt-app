//#region src/app/diagnostics/state.d.ts
/**
 * E7xxx
 * Payload / state / cookie runtime diagnostics.
 */
declare const stateDiagnostics: import("nostics").Diagnostics<Record<string, import("nostics").DiagnosticDefinition<any>>, readonly [import("nostics").DiagnosticReporter]> | import("nostics").Diagnostics<{
  readonly NUXT_E7001: {
    readonly why: (p: {
      url: string;
    }) => string;
    readonly fix: "Use a relative path (e.g. `/page`) instead of a full URL with hostname.";
  };
  readonly NUXT_E7002: {
    readonly why: (p: {
      url: string;
    }) => string;
    readonly fix: "Ensure the payload file is generated and accessible; this may stem from a prerendering issue, server misconfiguration, or a network error.";
    readonly docs: false;
  };
  readonly NUXT_E7003: {
    readonly why: (p: {
      url: string;
    }) => string;
    readonly fix: "This is usually a transient network error; the payload will be fetched on navigation instead.";
    readonly docs: false;
  };
  readonly NUXT_E7004: {
    readonly why: "`definePayloadReviver` was not called from a plugin `unshift`ed to the beginning of the Nuxt plugins array.";
    readonly fix: "Move this call into a Nuxt plugin file and ensure the plugin is registered early in the plugin order.";
    readonly docs: false;
  };
  readonly NUXT_E7005: {
    readonly why: (p: {
      name: string;
    }) => string;
    readonly fix: "Update the `expires` or `maxAge` option to a future date.";
    readonly docs: false;
  };
  readonly NUXT_E7006: {
    readonly why: (p: {
      name: string;
      previous: string;
      next: string;
    }) => string;
    readonly fix: "Avoid setting the same cookie from multiple places during SSR, or use a single `useCookie()` composable shared across components.";
    readonly docs: false;
  };
  readonly NUXT_E7007: {
    readonly why: (p: {
      type: string;
    }) => string;
    readonly fix: "Wrap the initial value in a function: `useState('key', () => value)` instead of `useState('key', value)`.";
  };
  readonly NUXT_E7008: {
    readonly why: (p: {
      type: string;
    }) => string;
    readonly fix: "Pass a function as the second argument: `callOnce('key', () => { ... })`.";
  };
  readonly NUXT_E7009: {
    readonly why: (p: {
      key: string;
    }) => string;
    readonly fix: "Pass a string key as the first argument to `useState()`, e.g. `useState('myKey', () => initialValue)`.";
  };
  readonly NUXT_E7010: {
    readonly why: (p: {
      key: string;
    }) => string;
    readonly fix: "Pass a string key as the first argument to `callOnce()`, e.g. `callOnce('myKey', () => { ... })`.";
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>, import("nostics").DiagnosticReporter] | readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
export { stateDiagnostics };