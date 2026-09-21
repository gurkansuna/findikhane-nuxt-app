import { NuxtPayload } from "../types.js";
import "../nuxt.js";
//#region src/app/composables/hydrate.d.ts
/**
 * Allows full control of the hydration cycle to set and receive data from the server.
 * @param key a unique key to identify the data in the Nuxt payload
 * @param get a function that returns the value to set the initial data
 * @param set a function that will receive the data on the client-side
 * @since 3.0.0
 */
declare const useHydration: <K extends keyof NuxtPayload, T = NuxtPayload[K]>(key: K, get: () => T, set: (value: T) => void) => void;
//#endregion
export { useHydration };