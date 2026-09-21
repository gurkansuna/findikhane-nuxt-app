import { MakeSerializableObject } from "../../pages/runtime/utils.js";
import { NuxtLayouts } from "../../pages/runtime/composables.js";
import { NuxtError } from "./error.js";
import { NavigationFailure, NavigationGuard, RouteLocationNormalized, RouteLocationRaw, useRoute as useRoute$1, useRouter as useRouter$1 } from "vue-router";
//#region src/app/composables/router.d.ts
/** @since 3.0.0 */
declare const useRouter: typeof useRouter$1;
/** @since 3.0.0 */
declare const useRoute: typeof useRoute$1;
/** @since 3.0.0 */
declare const onBeforeRouteLeave: (guard: NavigationGuard) => void;
/** @since 3.0.0 */
declare const onBeforeRouteUpdate: (guard: NavigationGuard) => void;
interface RouteMiddleware {
  (to: RouteLocationNormalized, from: RouteLocationNormalized): ReturnType<NavigationGuard>;
}
/** @since 3.0.0 */
declare function defineNuxtRouteMiddleware(middleware: RouteMiddleware): RouteMiddleware;
interface AddRouteMiddlewareOptions {
  global?: boolean;
}
interface AddRouteMiddleware {
  (name: string, middleware: RouteMiddleware, options?: AddRouteMiddlewareOptions): void;
  (middleware: RouteMiddleware): void;
}
/** @since 3.0.0 */
declare const addRouteMiddleware: AddRouteMiddleware;
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never; };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type OpenWindowFeatures = {
  popup?: boolean;
  noopener?: boolean;
  noreferrer?: boolean;
} & XOR<{
  width?: number;
}, {
  innerWidth?: number;
}> & XOR<{
  height?: number;
}, {
  innerHeight?: number;
}> & XOR<{
  left?: number;
}, {
  screenX?: number;
}> & XOR<{
  top?: number;
}, {
  screenY?: number;
}>;
type OpenOptions = {
  target: '_blank' | '_parent' | '_self' | '_top' | (string & {});
  windowFeatures?: OpenWindowFeatures;
};
interface NavigateToOptions {
  /**
   * Whether or not the given route should replace the current route in the navigation history, rather than push it.
   */
  replace?: boolean;
  /**
   * The status code to emit with the navigation. Defaults to `302 Found` when used on server side redirects.
   */
  redirectCode?: number;
  /**
   * Whether or not the given route is a website/resource from a different origin. By default, navigating to external resources without setting `external: true` would result in an error.
   */
  external?: boolean;
  open?: OpenOptions;
}
/**
 * A helper that aids in programmatic navigation within your Nuxt application.
 *
 * Can be called on the server and on the client, within pages, route middleware, plugins, and more.
 * @param {RouteLocationRaw | undefined | null} [to] - The route to navigate to. Accepts a route object, string path, `undefined`, or `null`. Defaults to '/'.
 * @param {NavigateToOptions} [options] - Optional customization for controlling the behavior of the navigation.
 * @returns {Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw} The navigation result, which varies depending on context and options.
 * @see https://nuxt.com/docs/4.x/api/utils/navigate-to
 * @since 3.0.0
 */
declare const navigateTo: (to: RouteLocationRaw | undefined | null, options?: NavigateToOptions) => Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw;
/**
 * This will abort navigation within a Nuxt route middleware handler.
 * @since 3.0.0
 */
declare const abortNavigation: (err?: string | Partial<NuxtError>) => boolean;
/**
 * Sets the layout for the current page.
 * @since 3.0.0
 */
declare const setPageLayout: <Layout extends keyof NuxtLayouts>(layout: unknown extends Layout ? string : Layout, props?: typeof layout extends Layout ? MakeSerializableObject<NuxtLayouts[Layout]> : never) => void;
/**
 * @internal
 */
declare function resolveRouteObject(to: Exclude<RouteLocationRaw, string>): string;
/**
 * @internal
 */
declare function encodeURL(location: string, isExternalHost?: boolean): string;
/**
 * Encode the pathname of a route location string. Ensures decoded paths like
 * `/café` are percent-encoded to match vue-router's encoded route records.
 * Already-encoded paths are not double-encoded.
 * @internal
 */
declare function encodeRoutePath(url: string): string;
//#endregion
export { AddRouteMiddlewareOptions, NavigateToOptions, OpenOptions, OpenWindowFeatures, RouteMiddleware, abortNavigation, addRouteMiddleware, defineNuxtRouteMiddleware, encodeRoutePath, encodeURL, navigateTo, onBeforeRouteLeave, onBeforeRouteUpdate, resolveRouteObject, setPageLayout, useRoute, useRouter };