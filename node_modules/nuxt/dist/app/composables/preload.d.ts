import { Component } from "vue";
import { RouteLocationRaw, Router } from "vue-router";
//#region src/app/composables/preload.d.ts
/**
 * Preload a component or components that have been globally registered.
 * @param components Pascal-cased name or names of components to prefetch
 * @since 3.0.0
 */
declare const preloadComponents: (components: string | string[]) => Promise<void>;
/**
 * Prefetch a component or components that have been globally registered.
 * @param components Pascal-cased name or names of components to prefetch
 * @since 3.0.0
 */
declare const prefetchComponents: (components: string | string[]) => Promise<void> | undefined;
declare function _loadAsyncComponent(component: Component): unknown;
/** @since 3.0.0 */
declare function preloadRouteComponents(to: RouteLocationRaw, router?: Router & {
  _routePreloaded?: Set<string>;
  _preloadPromises?: Array<Promise<unknown>>;
}): Promise<void>;
//#endregion
export { _loadAsyncComponent, prefetchComponents, preloadComponents, preloadRouteComponents };