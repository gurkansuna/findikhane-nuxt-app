import { NuxtPayload } from "../types.js";
import { NuxtApp } from "../nuxt.js";
import { Ref } from "vue";
import { H3Error } from "@nuxt/nitro-server/h3";
//#region src/app/composables/error.d.ts
declare const NUXT_ERROR_SIGNATURE: "__nuxt_error";
/** @since 3.0.0 */
declare const useError: () => Ref<NuxtPayload["error"]>;
interface NuxtError<DataT = unknown> extends Omit<H3Error<DataT>, 'statusCode' | 'statusMessage'>, Error {
  readonly __nuxt_error?: true;
  error?: true;
  status?: number;
  statusText?: string;
  /** @deprecated Use `status` */
  statusCode?: H3Error<DataT>['statusCode'];
  /** @deprecated Use `statusText` */
  statusMessage?: H3Error<DataT>['statusMessage'];
}
/** @since 3.0.0 */
declare const showError: <DataT = unknown>(error: string | Error | (Partial<NuxtError<DataT>> & {
  status?: number;
  statusText?: string;
})) => NuxtError<DataT>;
/**
 * Notify the app of an error caught for a crawler without rendering the error
 * page, so the bot indexes the server-rendered HTML instead (#32137, #35338).
 *
 * @internal
 */
declare const _notifyCrawlerError: (nuxtApp: NuxtApp, error: Error) => Promise<void> | void;
/**
 * Show the error page unless the current client is a crawler, in which case the
 * bot receives the already server-rendered HTML instead (#32137, #35338).
 *
 * @internal
 */
declare const _showErrorUnlessCrawler: (nuxtApp: NuxtApp, error: Error) => Promise<void>;
/** @since 3.0.0 */
declare const clearError: (options?: {
  redirect?: string;
}) => Promise<void>;
/** @since 3.0.0 */
declare const isNuxtError: <DataT = unknown>(error: unknown) => error is NuxtError<DataT>;
/** @since 3.0.0 */
declare const createError: <DataT = unknown>(error: string | Error | Partial<NuxtError<DataT>>) => NuxtError<DataT>;
//#endregion
export { NUXT_ERROR_SIGNATURE, NuxtError, _notifyCrawlerError, _showErrorUnlessCrawler, clearError, createError, isNuxtError, showError, useError };