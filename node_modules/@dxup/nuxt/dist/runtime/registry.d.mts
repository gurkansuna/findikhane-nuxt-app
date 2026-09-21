import { InjectionKey, ShallowRef, Slots } from "vue";
//#region src/module/named-layout-slots/runtime/registry.d.ts
interface LayoutSlotsRegistry {
  slots: ShallowRef<Slots | null>;
  ready: Promise<void>;
  use: (slots: Slots) => void;
  invalidate: () => void;
  getOwner: (name: string) => number | undefined;
}
declare const injectionKey: InjectionKey<LayoutSlotsRegistry>;
//#endregion
export { LayoutSlotsRegistry, injectionKey };