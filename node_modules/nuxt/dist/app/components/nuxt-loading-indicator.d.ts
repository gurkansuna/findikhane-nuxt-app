import { DefineSetupFnComponent } from "vue";
//#region src/app/components/nuxt-loading-indicator.d.ts
interface NuxtLoadingIndicatorProps {
  throttle?: number;
  duration?: number;
  hideDelay?: number;
  resetDelay?: number;
  height?: number;
  color?: string | boolean;
  errorColor?: string;
  estimatedProgress?: (duration: number, elapsed: number) => number;
}
declare const NuxtLoadingIndicator: DefineSetupFnComponent<NuxtLoadingIndicatorProps>;
//#endregion
export { NuxtLoadingIndicator as default };