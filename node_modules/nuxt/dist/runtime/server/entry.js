//#region src/runtime/server/entry.ts
/**
* Signature matches `vue-bundle-renderer`'s `CreateApp<App<Element>>` so it can
* be passed to `createRenderer()` without a cast.
*/
const stub = () => {
	throw new Error("[nuxt] nuxt/entry was not replaced by a builder. Ensure a Nuxt builder (Vite, Webpack, or Rspack) is configured.");
};
//#endregion
export { stub as default };
