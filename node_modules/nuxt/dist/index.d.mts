import { LoadNuxtOptions } from "@nuxt/kit";
import { Nuxt, NuxtOptions } from "nuxt/schema";
//#region src/core/nuxt.d.ts
declare function createNuxt(options: NuxtOptions): Nuxt;
declare function loadNuxt(opts: LoadNuxtOptions): Promise<Nuxt>;
//#endregion
//#region src/core/builder.d.ts
declare function build(nuxt: Nuxt): Promise<void>;
//#endregion
export { build, createNuxt, loadNuxt };