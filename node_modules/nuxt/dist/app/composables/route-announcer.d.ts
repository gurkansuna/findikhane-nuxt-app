import { Ref } from "vue";
//#region src/app/composables/route-announcer.d.ts
type Politeness = 'assertive' | 'polite' | 'off';
type NuxtRouteAnnouncerOpts = {
  /** @default 'polite' */
  politeness?: Politeness;
};
type RouteAnnouncer = {
  message: Ref<string>;
  politeness: Ref<Politeness>;
  set: (message: string, politeness?: Politeness) => void;
  polite: (message: string) => void;
  assertive: (message: string) => void;
  _cleanup: () => void;
};
/**
 * composable to handle the route announcer
 * @since 3.12.0
 */
declare function useRouteAnnouncer(opts?: NuxtRouteAnnouncerOpts): Omit<RouteAnnouncer, '_cleanup'>;
//#endregion
export { NuxtRouteAnnouncerOpts, Politeness, RouteAnnouncer, useRouteAnnouncer };