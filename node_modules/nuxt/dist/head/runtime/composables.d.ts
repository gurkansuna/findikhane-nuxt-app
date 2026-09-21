import { NuxtApp } from "#app/nuxt";
import { ActiveHeadEntry, UseHeadInput, UseHeadOptions, UseHeadSafeInput, UseSeoMetaInput, VueHeadClient } from "@unhead/vue/types";
//#region src/head/runtime/composables.d.ts
/**
 * Injects the head client from the Nuxt context or Vue inject.
 */
declare function injectHead(nuxtApp?: NuxtApp): VueHeadClient;
interface NuxtUseHeadOptions extends UseHeadOptions {
  nuxt?: NuxtApp;
}
declare function useHead(input: UseHeadInput, options?: NuxtUseHeadOptions): ActiveHeadEntry<UseHeadInput>;
declare function useHeadSafe(input: UseHeadSafeInput, options?: NuxtUseHeadOptions): ActiveHeadEntry<UseHeadSafeInput>;
declare function useSeoMeta(input: UseSeoMetaInput, options?: NuxtUseHeadOptions): ActiveHeadEntry<UseSeoMetaInput>;
/**
 * @deprecated Use `useHead` instead and wrap with `if (import.meta.server)`
 */
declare function useServerHead(input: UseHeadInput, options?: NuxtUseHeadOptions): ActiveHeadEntry<UseHeadInput>;
/**
 * @deprecated Use `useHeadSafe` instead and wrap with `if (import.meta.server)`
 */
declare function useServerHeadSafe(input: UseHeadSafeInput, options?: NuxtUseHeadOptions): ActiveHeadEntry<UseHeadSafeInput>;
/**
 * @deprecated Use `useSeoMeta` instead and wrap with `if (import.meta.server)`
 */
declare function useServerSeoMeta(input: UseSeoMetaInput, options?: NuxtUseHeadOptions): ActiveHeadEntry<UseSeoMetaInput>;
//#endregion
export { injectHead, useHead, useHeadSafe, useSeoMeta, useServerHead, useServerHeadSafe, useServerSeoMeta };