import { RendererNode, TransitionProps, VNode } from "vue";
import { RouteLocationNormalized } from "vue-router";
//#region src/app/components/utils.d.ts
/**
 * Internal utility
 * @private
 */
declare const _wrapInTransition: (props: any, children: any) => {
  default: () => VNode | undefined;
};
/**
 * Utility used within router guards
 * return true if the route has been changed with a page change during navigation
 */
declare function isChangingPage(to: RouteLocationNormalized, from: RouteLocationNormalized): boolean;
/** Return `tag` if it is a safe HTML tag name, otherwise `fallback`. */
declare function sanitizeTag(tag: string | undefined, fallback: string): string;
type SSRBuffer = SSRBufferItem[] & {
  hasAsync?: boolean;
};
type SSRBufferItem = string | SSRBuffer | Promise<SSRBuffer>;
/**
 * create buffer retrieved from @vue/server-renderer
 * @see https://github.com/vuejs/core/blob/9617dd4b2abc07a5dc40de6e5b759e851b4d0da1/packages/server-renderer/src/render.ts#L57
 * @private
 */
declare function createBuffer(): {
  getBuffer: () => SSRBuffer;
  push: (item: SSRBufferItem) => void;
};
/**
 * helper for NuxtIsland to generate a correct array for scoped data
 */
declare function vforToArray(source: any): any[];
/**
 * Retrieve the HTML content from an element
 * Handles `<!--[-->` Fragment elements
 * @param element the element to retrieve the HTML
 * @param withoutSlots purge all slots from the HTML string retrieved
 * @returns {string[]|undefined} An array of string which represent the content of each element. Use `.join('')` to retrieve a component vnode.el HTML
 */
declare function getFragmentHTML(element: RendererNode | null, withoutSlots?: boolean): string[] | undefined;
/**
 * Return a static vnode from an element
 * Default to a div if the element is not found and if a fallback is not provided
 * @param el renderer node retrieved from the component internal instance
 * @param staticNodeFallback fallback string to use if the element is not found. Must be a valid HTML string
 */
declare function elToStaticVNode(el: RendererNode | null, staticNodeFallback?: string): VNode;
declare function isStartFragment(element: RendererNode): boolean;
declare function isEndFragment(element: RendererNode): boolean;
declare function toArray<T>(value: T | T[]): T[];
/**
 * Internal utility
 * @private
 */
declare function _mergeTransitionProps(routeProps: TransitionProps[]): TransitionProps;
//#endregion
export { SSRBuffer, SSRBufferItem, _mergeTransitionProps, _wrapInTransition, createBuffer, elToStaticVNode, getFragmentHTML, isChangingPage, isEndFragment, isStartFragment, sanitizeTag, toArray, vforToArray };