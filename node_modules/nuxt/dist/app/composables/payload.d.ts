import { NuxtPayload } from "../types.js";
import "../nuxt.js";
//#region src/app/composables/payload.d.ts
interface LoadPayloadOptions {
  fresh?: boolean;
  hash?: string;
}
/** @since 3.0.0 */
declare function loadPayload(url: string, opts?: LoadPayloadOptions): Promise<Record<string, any> | null>;
/** @since 3.0.0 */
declare function preloadPayload(url: string, opts?: LoadPayloadOptions): Promise<void>;
/** @internal */
declare function isCachedPayloadRoute(url: string): boolean;
/**
 * @internal
 */
declare function shouldLoadPayload(url?: string): Promise<boolean>;
/** @since 3.0.0 */
declare function isPrerendered(url?: string): Promise<boolean>;
/** @since 3.4.0 */
declare function getNuxtClientPayload(): Promise<NuxtPayload | Partial<NuxtPayload> | null>;
declare function parsePayload(payload: string): Promise<any>;
/**
 * This is an experimental function for configuring passing rich data from server -> client.
 * @since 3.4.0
 */
declare function definePayloadReducer(name: string, reduce: (data: any) => any): void;
/**
 * This is an experimental function for configuring passing rich data from server -> client.
 *
 * This function _must_ be called in a Nuxt plugin that is `unshift`ed to the beginning of the Nuxt plugins array.
 * @since 3.4.0
 */
declare function definePayloadReviver(name: string, revive: (data: any) => any | undefined): void;
//#endregion
export { definePayloadReducer, definePayloadReviver, getNuxtClientPayload, isCachedPayloadRoute, isPrerendered, loadPayload, parsePayload, preloadPayload, shouldLoadPayload };