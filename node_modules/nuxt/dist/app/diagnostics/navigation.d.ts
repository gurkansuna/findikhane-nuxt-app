//#region src/app/diagnostics/navigation.d.ts
/**
 * E2xxx
 * Navigation / routing / middleware runtime diagnostics.
 */
declare const navigationDiagnostics: import("nostics").Diagnostics<Record<string, import("nostics").DiagnosticDefinition<any>>, readonly [import("nostics").DiagnosticReporter]> | import("nostics").Diagnostics<{
  readonly NUXT_E2001: {
    readonly why: (p: {
      toPath: string;
    }) => string;
    readonly fix: (p: {
      toPath: string;
    }) => string;
  };
  readonly NUXT_E2002: {
    readonly why: (p: {
      toPath: string;
      protocol: string;
    }) => string;
    readonly fix: "Script protocols (e.g. `javascript:`) are blocked for security. Use a valid `http:` or `https:` URL.";
  };
  readonly NUXT_E2003: {
    readonly why: "`abortNavigation()` was called outside a route middleware handler.";
    readonly fix: "Move this call inside a route middleware defined with `defineNuxtRouteMiddleware()` or `addRouteMiddleware()`.";
  };
  readonly NUXT_E2004: {
    readonly why: (p: {
      entry: string;
    }) => string;
    readonly fix: (p: {
      entry: string;
      validMiddleware?: string[];
    }) => string;
  };
  readonly NUXT_E2005: {
    readonly why: (p: {
      middleware?: string;
      trace: string;
    }) => string;
    readonly fix: "Use the `to` and `from` arguments passed to the middleware function instead of `useRoute()`.";
  };
  readonly NUXT_E2006: {
    readonly why: "No route middleware passed to `addRouteMiddleware`.";
    readonly fix: "Pass a middleware function as the second argument: `addRouteMiddleware('name', (to, from) => { ... })`.";
    readonly docs: false;
  };
  readonly NUXT_E2007: {
    readonly why: "`setPageLayout` was called to change the layout on the server within a component, which will cause hydration errors.";
    readonly fix: "Call `setPageLayout` in a route middleware or plugin instead of inside a component's `setup()`.";
  };
  readonly NUXT_E2008: {
    readonly why: "`setPageLayout` was called to change the layout during hydration, which will cause hydration errors.";
    readonly fix: "Set the layout in `definePageMeta` or in a route middleware before hydration occurs.";
    readonly docs: false;
  };
  readonly NUXT_E2009: {
    readonly why: "A middleware error was thrown but no error handlers are registered to handle it.";
    readonly fix: "Register an error handler with `router.onError()` or add error handling within your middleware.";
    readonly docs: false;
  };
  readonly NUXT_E2010: {
    readonly why: (p: {
      path: string;
    }) => string;
    readonly fix: "Pass a path on the same host, or use `navigateTo(path, { external: true })` for cross-origin navigation.";
    readonly docs: false;
  };
  readonly NUXT_E2011: {
    readonly why: (p: {
      componentName: string;
    }) => string;
    readonly fix: "Script protocols (e.g. `javascript:`) are blocked for security. Use a valid `http:` or `https:` URL.";
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>, import("nostics").DiagnosticReporter] | readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
export { navigationDiagnostics };