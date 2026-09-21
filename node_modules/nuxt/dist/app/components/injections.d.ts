import { ComputedRef, InjectionKey } from "vue";
import { RouteLocationNormalizedLoaded } from "vue-router";
//#region src/app/components/injections.d.ts
interface LayoutMeta {
  isCurrent: (route: RouteLocationNormalizedLoaded) => boolean;
}
declare const LayoutMetaSymbol: InjectionKey<LayoutMeta>;
declare const LayoutSymbol: InjectionKey<Readonly<ComputedRef<string | false>>>;
declare const PageRouteSymbol: InjectionKey<RouteLocationNormalizedLoaded>;
//#endregion
export { LayoutMeta, LayoutMetaSymbol, LayoutSymbol, PageRouteSymbol };