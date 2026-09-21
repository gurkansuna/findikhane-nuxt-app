import { NuxtApp } from "#app/nuxt";
import { createHead } from "@unhead/vue/client";
//#region src/head/runtime/install-client-head.d.ts
type ClientHead = ReturnType<typeof createHead>;
declare function installClientHead(nuxtApp: NuxtApp, head: ClientHead): void;
//#endregion
export { installClientHead };