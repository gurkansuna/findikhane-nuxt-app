import { H3Event } from "@nuxt/nitro-server/h3";
import { NitroRouteRules } from "nitropack/types";
//#region src/app/composables/manifest.d.ts
interface NuxtAppManifestMeta {
  id: string;
  timestamp: number;
}
interface NuxtAppManifest extends NuxtAppManifestMeta {
  prerendered: string[];
}
/** @since 3.7.4 */
declare function getAppManifest(): Promise<NuxtAppManifest>;
/** @since 3.7.4 */
declare function getRouteRules(event: H3Event): NitroRouteRules;
declare function getRouteRules(options: {
  path: string;
}): Record<string, any>;
/** @deprecated use `getRouteRules({ path })` instead */
declare function getRouteRules(url: string): Record<string, any>;
//#endregion
export { NuxtAppManifest, NuxtAppManifestMeta, getAppManifest, getRouteRules };