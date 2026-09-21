import { Component } from "vue";
//#region src/app/island-props.d.ts
type UnsafeIslandPropKey = 'template';
type ReservedRootIslandPropKey = 'as';
/**
 * Find a `template` key anywhere in island props. With the Vue runtime compiler bundled, a
 * `template` string reaching component resolution would be compiled and executed. (`render`
 * is not checked: props arrive as JSON, so it can only be an inert string, never a function.)
 *
 * @internal
 */
declare function findUnsafeIslandPropKey(value: unknown): UnsafeIslandPropKey | undefined;
/**
 * Find a request-supplied `as` prop that the island does not declare. An undeclared prop falls
 * through as an attribute onto the island's root, so on a polymorphic root (e.g. `reka-ui` /
 * `@nuxt/ui`) it drives dynamic component resolution unbidden. A declared `as` is the island's
 * own API and is left alone, as is any island that opts out of attribute inheritance. Only the
 * top level is checked; props the author forwards into `<component :is>` are their responsibility.
 *
 * @internal
 */
declare function findReservedRootIslandPropKey(value: unknown, component: Component): ReservedRootIslandPropKey | undefined;
//#endregion
export { ReservedRootIslandPropKey, UnsafeIslandPropKey, findReservedRootIslandPropKey, findUnsafeIslandPropKey };