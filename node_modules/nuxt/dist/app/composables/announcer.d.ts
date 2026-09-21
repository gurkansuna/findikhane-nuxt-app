import { Ref } from "vue";
//#region src/app/composables/announcer.d.ts
type AnnouncerPoliteness = 'assertive' | 'polite' | 'off';
type NuxtAnnouncerOpts = {
  /** @default 'polite' */
  politeness?: AnnouncerPoliteness;
};
type NuxtAnnouncer = {
  message: Ref<string>;
  politeness: Ref<AnnouncerPoliteness>;
  set: (message: string, politeness?: AnnouncerPoliteness) => void;
  polite: (message: string) => void;
  assertive: (message: string) => void;
  _cleanup: () => void;
};
/**
 * Composable for announcing messages to screen readers
 * @since 4.4.2
 * @example
 * const { polite, assertive } = useAnnouncer()
 * polite('Item saved successfully')
 * assertive('Error: Form is invalid')
 */
declare function useAnnouncer(opts?: NuxtAnnouncerOpts): Omit<NuxtAnnouncer, '_cleanup'>;
//#endregion
export { AnnouncerPoliteness, NuxtAnnouncer, NuxtAnnouncerOpts, useAnnouncer };