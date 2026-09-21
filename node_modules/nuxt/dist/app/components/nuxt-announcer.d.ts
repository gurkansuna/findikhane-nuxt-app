import { AnnouncerPoliteness } from "../composables/announcer.js";
import { DefineSetupFnComponent, SlotsType, VNode } from "vue";
//#region src/app/components/nuxt-announcer.d.ts
interface NuxtAnnouncerProps {
  atomic?: boolean;
  politeness?: AnnouncerPoliteness;
}
type NuxtAnnouncerSlots = SlotsType<{
  default?: (props: {
    message: string;
  }) => VNode[];
}>;
declare const NuxtAnnouncer: DefineSetupFnComponent<NuxtAnnouncerProps, {}, NuxtAnnouncerSlots>;
//#endregion
export { NuxtAnnouncer as default };