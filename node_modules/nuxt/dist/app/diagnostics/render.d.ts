//#region src/app/diagnostics/render.d.ts
/**
 * E4xxx
 * Layout / component / island rendering runtime diagnostics.
 */
declare const renderDiagnostics: import("nostics").Diagnostics<Record<string, import("nostics").DiagnosticDefinition<any>>, readonly [import("nostics").DiagnosticReporter]> | import("nostics").Diagnostics<{
  readonly NUXT_E4001: {
    readonly why: (p: {
      layout: string;
      available: string;
    }) => string;
    readonly fix: (p: {
      layout: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_E4002: {
    readonly why: (p: {
      name: string;
    }) => string;
    readonly fix: "Wrap the layout's template in a single root element (e.g. a `<div>`).";
    readonly docs: false;
  };
  readonly NUXT_E4003: {
    readonly why: "`<NuxtLayout>` needs to be passed a single root node in its default slot.";
    readonly fix: "Wrap the content inside `<NuxtLayout>` in a single root element.";
    readonly docs: false;
  };
  readonly NUXT_E4004: {
    readonly why: (p: {
      filename: string;
    }) => string;
    readonly fix: "Wrap the page component's template in a single root element (e.g. a `<div>`).";
    readonly docs: false;
  };
  readonly NUXT_E4005: {
    readonly why: (p: {
      name: string;
    }) => string;
    readonly fix: "Wrap the server component's template in a single root element (e.g. a `<div>`).";
    readonly docs: false;
  };
  readonly NUXT_E4006: {
    readonly why: "SSR rendering failed inside `<NuxtClientFallback>`, falling back to client-side rendering.";
    readonly fix: "Fix the SSR error in the wrapped component. The client-side fallback will be used until then.";
    readonly docs: false;
  };
  readonly NUXT_E4007: {
    readonly why: "Your project has layouts but the `<NuxtLayout />` component has not been used. If `<NuxtLayout>` is rendered conditionally, this warning can be triggered before it is mounted.";
    readonly fix: "Add `<NuxtLayout>` to your `app.vue`, or remove the `layouts/` directory if you don't use layouts.";
    readonly docs: false;
  };
  readonly NUXT_E4008: {
    readonly why: (p: {
      path: string;
    }) => string;
    readonly fix: "Use a path within the project root directory for the test component wrapper.";
    readonly docs: false;
  };
  readonly NUXT_E4009: {
    readonly why: "You can't nest one `<a>` inside another `<a>`. This will cause a hydration error on client-side.";
    readonly fix: "Pass the `custom` prop to take full control of the markup.";
    readonly docs: false;
  };
  readonly NUXT_E4010: {
    readonly why: (p: {
      componentName: string;
      main: string;
      sub: string;
    }) => string;
    readonly fix: (p: {
      main: string;
      sub: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_E4011: {
    readonly why: "Your project has pages but the `<NuxtPage />` component has not been used. You might be using the `<RouterView />` component instead, which will not work correctly in Nuxt. If `<NuxtPage>` is rendered conditionally, this warning can be triggered before it is mounted.";
    readonly fix: "You can set `pages: false` in `nuxt.config` if you do not wish to use the Nuxt `vue-router` integration.";
    readonly docs: false;
  };
  readonly NUXT_E4012: {
    readonly why: (p: {
      name: string;
      status: number;
      detail: string;
    }) => string;
    readonly fix: "Check that the server component endpoint is returning valid HTML. The server may have returned an error page.";
  };
  readonly NUXT_E4013: {
    readonly why: (p: {
      source: number;
    }) => string;
    readonly fix: "Use `Math.floor()` or `Math.round()` to convert the value to an integer.";
    readonly docs: false;
  };
  readonly NUXT_E4014: {
    readonly why: (p: {
      dir: string;
    }) => string;
    readonly fix: (p: {
      dir: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_E4015: {
    readonly why: (p: {
      name: string;
    }) => string;
    readonly fix: "Check the server component implementation for runtime errors.";
    readonly docs: false;
  };
  readonly NUXT_E4016: {
    readonly why: (p: {
      fullPath: string;
      childPath: string;
      parentPath: string;
    }) => string;
    readonly fix: (p: {
      parentPath: string;
    }) => string;
  };
  readonly NUXT_E4017: {
    readonly why: (p: {
      source: number;
      max: number;
    }) => string;
    readonly fix: (p: {
      max: number;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_E4018: {
    readonly why: (p: {
      name: string;
      key: string;
    }) => string;
    readonly fix: (p: {
      key: string;
    }) => string;
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>, import("nostics").DiagnosticReporter] | readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
export { renderDiagnostics };