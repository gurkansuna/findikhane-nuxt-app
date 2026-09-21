import { AsyncComponentLoader, DefineSetupFnComponent } from "vue";
//#region src/components/runtime/lazy-hydrated-component.d.ts
type LazyHydrationEmits = {
  hydrated: () => void;
};
type LazyComponentFactory<Props extends Record<string, any>> = (id: string, loader: AsyncComponentLoader) => DefineSetupFnComponent<Props, LazyHydrationEmits>;
interface LazyVisibleProps {
  hydrateOnVisible?: true | IntersectionObserverInit;
}
declare const createLazyVisibleComponent: LazyComponentFactory<LazyVisibleProps>;
interface LazyIdleProps {
  hydrateOnIdle?: true | number;
}
declare const createLazyIdleComponent: LazyComponentFactory<LazyIdleProps>;
interface LazyInteractionProps {
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true;
}
declare const createLazyInteractionComponent: LazyComponentFactory<LazyInteractionProps>;
interface LazyMediaQueryProps {
  hydrateOnMediaQuery: string;
}
declare const createLazyMediaQueryComponent: LazyComponentFactory<LazyMediaQueryProps>;
interface LazyIfProps {
  hydrateWhen?: boolean;
}
declare const createLazyIfComponent: LazyComponentFactory<LazyIfProps>;
interface LazyTimeProps {
  hydrateAfter: number;
}
declare const createLazyTimeComponent: LazyComponentFactory<LazyTimeProps>;
interface LazyNeverProps {
  hydrateNever?: true;
}
declare const createLazyNeverComponent: LazyComponentFactory<LazyNeverProps>;
//#endregion
export { createLazyIdleComponent, createLazyIfComponent, createLazyInteractionComponent, createLazyMediaQueryComponent, createLazyNeverComponent, createLazyTimeComponent, createLazyVisibleComponent };