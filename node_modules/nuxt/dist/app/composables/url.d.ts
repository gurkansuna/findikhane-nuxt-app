import { getRequestURL } from "@nuxt/nitro-server/h3";
//#region src/app/composables/url.d.ts
/** @since 3.5.0 */
declare function useRequestURL(opts?: Parameters<typeof getRequestURL>[1]): URL;
//#endregion
export { useRequestURL };