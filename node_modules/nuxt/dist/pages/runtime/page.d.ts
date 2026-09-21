import { RouterViewSlotProps } from "./utils.js";
import { AllowedComponentProps, ComponentCustomProps, ComponentPublicInstance, KeepAliveProps, TransitionProps, VNode, VNodeProps } from "vue";
import { RouteLocationNormalizedLoaded, RouterViewProps } from "vue-router";
//#region src/pages/runtime/page.d.ts
interface NuxtPageProps extends RouterViewProps {
  /**
   * Define global transitions for all pages rendered with the `NuxtPage` component.
   */
  transition?: boolean | TransitionProps;
  /**
   * Control state preservation of pages rendered with the `NuxtPage` component.
   */
  keepalive?: boolean | KeepAliveProps;
  /**
   * Control when the `NuxtPage` component is re-rendered.
   */
  pageKey?: string | ((route: RouteLocationNormalizedLoaded) => string);
}
declare const _default: {
  new (): {
    $props: AllowedComponentProps & ComponentCustomProps & VNodeProps & NuxtPageProps;
    $slots: {
      default?: (routeProps: RouterViewSlotProps) => VNode[];
    };
    /**
     * Reference to the page component instance
     */
    pageRef: Element | ComponentPublicInstance | null;
  };
};
//#endregion
export { NuxtPageProps, _default as default };