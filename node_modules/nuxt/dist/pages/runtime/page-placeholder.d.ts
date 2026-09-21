import { DefineSetupFnComponent, SlotsType, VNode } from "vue";
//#region src/pages/runtime/page-placeholder.d.ts
type PagePlaceholderSlots = SlotsType<{
  default?: () => VNode[];
}>;
declare const PagePlaceholder: DefineSetupFnComponent<{}, {}, PagePlaceholderSlots>;
//#endregion
export { PagePlaceholder as default };