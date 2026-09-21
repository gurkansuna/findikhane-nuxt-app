//#region src/app/diagnostics/data.d.ts
/**
 * E3xxx
 * Data fetching (useFetch / useAsyncData) runtime diagnostics.
 */
declare const dataDiagnostics: import("nostics").Diagnostics<Record<string, import("nostics").DiagnosticDefinition<any>>, readonly [import("nostics").DiagnosticReporter]> | import("nostics").Diagnostics<{
  readonly NUXT_E3001: {
    readonly why: (p: {
      url: string;
    }) => string;
    readonly fix: "Use an absolute URL with a protocol or a relative path instead.";
  };
  readonly NUXT_E3002: {
    readonly why: "`useFetch` failed to hash the request body for the cache key.";
    readonly fix: "Pass a serializable value (plain object, string, FormData) as the request body, or provide an explicit `key` to `useFetch`.";
    readonly docs: false;
  };
  readonly NUXT_E3003: {
    readonly why: "`useAsyncData`/`useFetch` was called after the component had already mounted, so the data fetch cannot be awaited during setup.";
    readonly fix: "Use `$fetch()` for requests triggered after mount (e.g. in event handlers), or call `useAsyncData`/`useFetch` in the `setup()` function.";
    readonly docs: false;
  };
  readonly NUXT_E3004: {
    readonly why: (p: {
      key: string;
      warnings: string;
    }) => string;
    readonly fix: "You can use a different key or move the call to a composable to ensure the options are shared across calls.";
    readonly docs: false;
  };
  readonly NUXT_E3005: {
    readonly why: "`execute` was passed directly to `watch`, which causes unintended behavior.";
    readonly fix: "Wrap the call: `watch(source, () => execute())` instead of `watch(source, execute)`.";
    readonly docs: false;
  };
  readonly NUXT_E3006: {
    readonly why: (p: {
      fn: string;
    }) => string;
    readonly fix: "Return a value from the handler function (e.g. `return null` instead of returning nothing).";
    readonly docs: false;
  };
  readonly NUXT_E3007: {
    readonly why: "`asyncData` returned a non-object value.";
    readonly fix: "Return a plain object from the `asyncData()` function, e.g. `asyncData() { return { key: value } }`.";
    readonly docs: false;
  };
  readonly NUXT_E3008: {
    readonly why: "`useAsyncData` key must be a non-empty string.";
    readonly fix: "Pass a non-empty string as the first argument to `useAsyncData()`.";
  };
  readonly NUXT_E3009: {
    readonly why: "`useAsyncData` handler must be a function.";
    readonly fix: "Pass a function as the handler argument, e.g. `useAsyncData('key', () => $fetch('/api/data'))`.";
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>, import("nostics").DiagnosticReporter] | readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
export { dataDiagnostics };