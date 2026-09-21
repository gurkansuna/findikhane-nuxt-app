import { DefineSetupFnComponent, SlotsType, VNode } from "vue";
//#region src/app/components/dev-only.d.ts
type DevOnlySlots = SlotsType<{
  default?: () => VNode[];
  /**
   * If you ever require to have a replacement during production.
   */
  fallback?: () => VNode[];
}>;
declare const DevOnly: DefineSetupFnComponent<{}, {}, DevOnlySlots>;
//#endregion
export { DevOnly as default };