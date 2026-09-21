//#region src/module/named-layout-slots/runtime/layouts.d.ts
declare const _default: import("vue").DefineSetupFnComponent<Record<string, any>, {}, {}, Record<string, any> & {}, import("vue").PublicProps>;
/**
 * Returns the slots forwarded by the active page via named layout slots.
 */
declare function useLayoutSlots(): import("vue").ComputedRef<Readonly<{
  [name: string]: import("vue").Slot<any> | undefined;
}>>;
declare const LayoutSlot: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
  name: {
    type: StringConstructor;
    required: true;
  };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
  [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
  name: {
    type: StringConstructor;
    required: true;
  };
}>> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
declare const LayoutSlotsForward: import("vue").DefineSetupFnComponent<Record<string, any>, {}, {}, Record<string, any> & {}, import("vue").PublicProps>;
//#endregion
export { LayoutSlot, LayoutSlotsForward, _default as default, useLayoutSlots };