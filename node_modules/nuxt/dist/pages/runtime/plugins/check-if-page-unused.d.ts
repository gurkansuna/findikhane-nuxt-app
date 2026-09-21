import { ObjectPlugin, Plugin } from "#app/nuxt";
import { RouteLocationNormalizedLoaded, RouteRecordNormalized } from "vue-router";
//#region src/pages/runtime/plugins/check-if-page-unused.d.ts
declare function findUnrenderedNestedPage(route: RouteLocationNormalizedLoaded): {
  parent: RouteRecordNormalized;
  child: RouteRecordNormalized;
} | undefined;
declare const NESTED_PAGE_CONFIRMATION_DELAY = 1000;
declare const plugin: Plugin & ObjectPlugin;
//#endregion
export { NESTED_PAGE_CONFIRMATION_DELAY, plugin as default, findUnrenderedNestedPage };