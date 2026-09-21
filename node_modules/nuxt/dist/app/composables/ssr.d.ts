import { NuxtApp } from "../nuxt.js";
import { H3Event } from "@nuxt/nitro-server/h3";
import { $Fetch, H3Event$Fetch } from "nitropack/types";
//#region src/app/composables/ssr.d.ts
/** @since 3.0.0 */
declare function useRequestEvent(nuxtApp?: NuxtApp): H3Event | undefined;
/** @since 3.0.0 */
declare function useRequestHeaders<K extends string = string>(include: K[]): { [key in Lowercase<K>]?: string; };
declare function useRequestHeaders(): Readonly<Record<string, string>>;
/** @since 3.9.0 */
declare function useRequestHeader(header: string): string | null | undefined;
/** @since 3.2.0 */
declare function useRequestFetch(): H3Event$Fetch | $Fetch;
/** @since 3.0.0 */
declare function setResponseStatus(event: H3Event, code?: number, message?: string): void;
/** @deprecated Pass `event` as first option. */
declare function setResponseStatus(code: number, message?: string): void;
/** @since 3.14.0 */
declare function useResponseHeader(header: string): import('vue').WritableComputedRef<string | number | string[] | undefined> | import('vue').Ref<string | number | string[] | undefined>;
/** @since 3.8.0 */
declare function prerenderRoutes(path: string | string[]): void;
/**
 * `onPrehydrate` is a composable lifecycle hook that allows you to run a callback on the client immediately before
 * Nuxt hydrates the page. This is an advanced feature.
 *
 * The callback will be stringified and inlined in the HTML so it should not have any external
 * dependencies (such as auto-imports) or refer to variables defined outside the callback.
 *
 * The callback will run before Nuxt runtime initializes so it should not rely on the Nuxt or Vue context.
 * @since 3.12.0
 */
declare function onPrehydrate(callback: (el: HTMLElement) => void): void;
//#endregion
export { onPrehydrate, prerenderRoutes, setResponseStatus, useRequestEvent, useRequestFetch, useRequestHeader, useRequestHeaders, useResponseHeader };