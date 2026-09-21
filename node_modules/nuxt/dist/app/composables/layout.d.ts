import { NuxtLayouts } from "../../pages/runtime/composables.js";
import { ComputedRef } from "vue";
import { RouteLocationNormalizedLoaded } from "vue-router";
//#region src/app/composables/layout.d.ts
type LayoutName = keyof NuxtLayouts | 'default' | false;
declare function resolveLayoutName(route: Pick<RouteLocationNormalizedLoaded, 'meta' | 'path'> | undefined, name?: unknown): LayoutName;
/**
 * Returns the layout rendered for the current route, resolved through the same chain as
 * `<NuxtLayout>` (page `layout` meta, then the route rules `appLayout`, then `default`).
 *
 * Within a rendered `<NuxtLayout>` it reflects the enclosing layout; outside of one it
 * returns the layout that would be resolved for the current route.
 * @since 4.5.0
 */
declare function useLayout(): Readonly<ComputedRef<LayoutName>>;
//#endregion
export { LayoutName, resolveLayoutName, useLayout };