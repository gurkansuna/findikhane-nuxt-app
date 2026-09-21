import { AsyncComponentLoader, Component, ComponentPublicInstance, DefineComponent } from "vue";
//#region src/app/composables/lazy-hydration.d.ts
type LazyHydrationComponent<T extends Component, Props> = T & DefineComponent<Props, {}, {}, {}, {}, {}, {}, {
  hydrated: () => void;
}>;
declare function defineLazyHydrationComponent<T extends Component = {
  new (): ComponentPublicInstance;
}>(strategy: 'visible', source: AsyncComponentLoader<T>): LazyHydrationComponent<T, {
  hydrateOnVisible?: IntersectionObserverInit | true;
}>;
declare function defineLazyHydrationComponent<T extends Component = {
  new (): ComponentPublicInstance;
}>(strategy: 'idle', source: AsyncComponentLoader<T>): LazyHydrationComponent<T, {
  hydrateOnIdle?: number | true;
}>;
declare function defineLazyHydrationComponent<T extends Component = {
  new (): ComponentPublicInstance;
}>(strategy: 'interaction', source: AsyncComponentLoader<T>): LazyHydrationComponent<T, {
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap>;
}>;
declare function defineLazyHydrationComponent<T extends Component = {
  new (): ComponentPublicInstance;
}>(strategy: 'mediaQuery', source: AsyncComponentLoader<T>): LazyHydrationComponent<T, {
  hydrateOnMediaQuery: string;
}>;
declare function defineLazyHydrationComponent<T extends Component = {
  new (): ComponentPublicInstance;
}>(strategy: 'if', source: AsyncComponentLoader<T>): LazyHydrationComponent<T, {
  hydrateWhen: boolean;
}>;
declare function defineLazyHydrationComponent<T extends Component = {
  new (): ComponentPublicInstance;
}>(strategy: 'time', source: AsyncComponentLoader<T>): LazyHydrationComponent<T, {
  hydrateAfter: number | true;
}>;
declare function defineLazyHydrationComponent<T extends Component = {
  new (): ComponentPublicInstance;
}>(strategy: 'never', source: AsyncComponentLoader<T>): LazyHydrationComponent<T, {
  hydrateNever?: true;
}>;
//#endregion
export { defineLazyHydrationComponent };