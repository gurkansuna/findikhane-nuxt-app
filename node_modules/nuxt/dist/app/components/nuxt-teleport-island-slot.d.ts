import { DefineSetupFnComponent, SlotsType, VNode } from "vue";
//#region src/app/components/nuxt-teleport-island-slot.d.ts
/**
 * component only used within islands for slot teleport
 */
interface NuxtTeleportIslandSlotProps {
  name: string;
  /**
   * must be an array to handle v-for
   */
  props?: Array<any>;
}
type NuxtTeleportIslandSlotSlots = SlotsType<{
  default?: () => VNode[];
  fallback?: () => VNode[];
}>;
declare const NuxtTeleportIslandSlot: DefineSetupFnComponent<NuxtTeleportIslandSlotProps, {}, NuxtTeleportIslandSlotSlots>;
//#endregion
export { NuxtTeleportIslandSlot as default };