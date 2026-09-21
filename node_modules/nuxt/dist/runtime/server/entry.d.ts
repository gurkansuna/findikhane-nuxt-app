import { App } from "vue";
import { SSRContext } from "vue-bundle-renderer/runtime";
//#region src/runtime/server/entry.d.ts
/**
 * Signature matches `vue-bundle-renderer`'s `CreateApp<App<Element>>` so it can
 * be passed to `createRenderer()` without a cast.
 */
declare const stub: (ssrContext: SSRContext) => Promise<App>;
//#endregion
export { stub as default };