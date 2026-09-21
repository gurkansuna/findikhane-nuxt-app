import { NuxtTracingChannelOptions } from "./augments.mjs";
import { Nitro } from "nitropack/types";
import { Nuxt } from "@nuxt/schema";
//#region src/index.d.ts
declare function bundle(nuxt: Nuxt & {
  _nitro?: Nitro;
}): Promise<void>;
//#endregion
export { type NuxtTracingChannelOptions, bundle };