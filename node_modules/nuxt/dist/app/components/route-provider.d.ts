import { DefineSetupFnComponent, Ref, VNode } from "vue";
import { RouteLocationNormalizedLoaded, RouteRecordNormalized } from "vue-router";
//#region src/app/components/route-provider.d.ts
interface RouteProviderProps {
  route: RouteLocationNormalizedLoaded;
  vnode?: VNode;
  vnodeRef?: Ref<any>;
  renderKey?: string;
  trackRootNodes?: boolean;
  /** the matched route record this provider renders, used by dev-only render diagnostics */
  routeRecord?: RouteRecordNormalized;
}
type RouteProviderComponent = DefineSetupFnComponent<RouteProviderProps>;
declare const defineRouteProvider: (name?: string) => RouteProviderComponent;
declare const RouteProvider: RouteProviderComponent;
//#endregion
export { RouteProvider, RouteProviderComponent, defineRouteProvider };