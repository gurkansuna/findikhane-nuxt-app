import { Politeness } from "../composables/route-announcer.js";
import { DefineSetupFnComponent, SlotsType, VNode } from "vue";
//#region src/app/components/nuxt-route-announcer.d.ts
interface NuxtRouteAnnouncerProps {
  atomic?: boolean;
  politeness?: Politeness;
}
type NuxtRouteAnnouncerSlots = SlotsType<{
  default?: (props: {
    message: string;
  }) => VNode[];
}>;
declare const NuxtRouteAnnouncer: DefineSetupFnComponent<NuxtRouteAnnouncerProps, {}, NuxtRouteAnnouncerSlots>;
//#endregion
export { NuxtRouteAnnouncer as default };