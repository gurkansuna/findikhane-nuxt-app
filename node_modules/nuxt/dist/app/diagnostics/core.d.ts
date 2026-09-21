//#region src/app/diagnostics/core.d.ts
/**
 * E1xxx
 * Core / Nuxt-instance / lifecycle runtime diagnostics.
 */
declare const appDiagnostics: import("nostics").Diagnostics<Record<string, import("nostics").DiagnosticDefinition<any>>, readonly [import("nostics").DiagnosticReporter]> | import("nostics").Diagnostics<{
  readonly NUXT_E1001: {
    readonly why: "A composable that requires access to the Nuxt instance was called outside of a plugin, Nuxt hook, Nuxt middleware, or Vue setup function. This is probably not a Nuxt bug.";
    readonly fix: "Move this call inside a Vue `setup()` function, a Nuxt plugin, or a Nuxt middleware.";
  };
  readonly NUXT_E1003: {
    readonly why: (p: {
      key: string;
      keys: string;
      lastKey: string;
    }) => string;
    readonly fix: (p: {
      key: string;
    }) => string;
    readonly docs: false;
  };
  readonly NUXT_E1004: {
    readonly why: "`setInterval` should not be used on the server.";
    readonly fix: "Wrap it in an `onNuxtReady`, `onBeforeMount`, or `onMounted` lifecycle hook, or guard it with `import.meta.client` so it only runs in the browser.";
    readonly docs: false;
  };
  readonly NUXT_E1005: {
    readonly why: "Error caught during app initialization.";
    readonly fix: "Check your plugins, `app:created`, and `app:beforeMount` hooks for unhandled errors.";
    readonly docs: false;
  };
  readonly NUXT_E1006: {
    readonly why: "To transform a callback into a string, `onPrehydrate` must be processed by the Nuxt build pipeline.";
    readonly fix: "If it is called in a third-party library, add the library to `build.transpile`.";
  };
  readonly NUXT_E1007: {
    readonly why: (p: {
      name: string;
    }) => string;
    readonly fix: "Call it statically from inside the directories scanned by the Nuxt compiler. For a page hint, call it from the `<script setup>` block of a page component in `pages/`.";
  };
  readonly NUXT_E1009: {
    readonly why: "Error while mounting app.";
    readonly fix: "Check your plugins and app initialization code for unhandled errors.";
    readonly docs: false;
  };
  readonly NUXT_E1010: {
    readonly why: "Response headers cannot be set in the browser.";
    readonly fix: "Guard this code with `import.meta.server` or move it to a server-only context.";
    readonly docs: false;
  };
  readonly NUXT_E1011: {
    readonly why: "Error in `vue:setup`. Callbacks must be synchronous.";
    readonly fix: "Remove `async` from your `vue:setup` hook callbacks, or move asynchronous work to another hook such as `app:created`.";
    readonly docs: false;
  };
  readonly NUXT_E1012: {
    readonly why: (p: {
      userAgent: string;
    }) => string;
    readonly fix: "Crawlers receive the server-rendered HTML instead of the error page so they index the content. No action is needed unless you did not expect this request to be treated as a bot.";
    readonly docs: false;
  };
}, readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>, import("nostics").DiagnosticReporter] | readonly [import("nostics").DiagnosticReporter<{
  method?: import("nostics").ConsoleMethod;
}>]>;
//#endregion
export { appDiagnostics };