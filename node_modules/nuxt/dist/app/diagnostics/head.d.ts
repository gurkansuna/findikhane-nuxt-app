//#region src/app/diagnostics/head.d.ts
/**
 * E6xxx
 * Head / unhead runtime diagnostics.
 */
declare const unheadDiagnostics: import("nostics").Diagnostics<Record<string, import("nostics").DiagnosticDefinition<any>>, readonly [import("nostics").DiagnosticReporter]> | import("nostics").Diagnostics<{
  readonly NUXT_E6001: {
    readonly why: "The Unhead instance is missing.";
    readonly fix: "Ensure `useHead()` is called inside a component `setup()` function, a Nuxt plugin, or Nuxt middleware.";
  };
  readonly NUXT_E6002: {
    readonly why: "`<Title>` received more than one child in its default slot.";
    readonly fix: "Pass a single string to the `<Title>` default slot.";
    readonly docs: false;
  };
  readonly NUXT_E6003: {
    readonly why: "`<Style>` received a non-string child in its default slot.";
    readonly fix: "Pass a single string to the `<Style>` default slot.";
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>, import("nostics").DiagnosticReporter] | readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
export { unheadDiagnostics };