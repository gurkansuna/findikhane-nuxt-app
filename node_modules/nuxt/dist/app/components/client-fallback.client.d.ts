import { DefineSetupFnComponent, SlotsType, VNode } from "vue";
//#region src/app/components/client-fallback.client.d.ts
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
declare const NuxtClientFallbackClient: DefineSetupFnComponent<NuxtClientFallbackProps, NuxtClientFallbackEmits, NuxtClientFallbackSlots>;
//#endregion
export { NuxtClientFallbackClient as default };