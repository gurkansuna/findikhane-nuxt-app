import { DefineSetupFnComponent, SlotsType, VNode } from "vue";
//#region src/app/components/client-fallback.server.d.ts
interface NuxtClientFallbackProps {
  fallbackTag?: string;
  fallback?: string;
  placeholder?: string;
  placeholderTag?: string;
  keepFallback?: boolean;
}
type NuxtClientFallbackEmits = {
  'ssr-error': (error: unknown) => void;
};
type NuxtClientFallbackSlots = SlotsType<{
  default?: () => VNode[];
  fallback?: () => VNode[];
  placeholder?: () => VNode[];
}>;
declare const NuxtClientFallbackServer: DefineSetupFnComponent<NuxtClientFallbackProps, NuxtClientFallbackEmits, NuxtClientFallbackSlots>;
//#endregion
export { NuxtClientFallbackServer as default };