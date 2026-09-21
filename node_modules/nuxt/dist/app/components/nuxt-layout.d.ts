import { PageMeta } from "../../pages/runtime/composables.js";
import { DefineComponent, ExtractPublicPropTypes, MaybeRef, PropType } from "vue";
//#region src/app/components/nuxt-layout.d.ts
declare const nuxtLayoutProps: {
  name: {
    type: PropType<unknown extends PageMeta["layout"] ? MaybeRef<string | false> : PageMeta["layout"]>;
    default: null;
  };
  fallback: {
    type: PropType<unknown extends PageMeta["layout"] ? MaybeRef<string> : PageMeta["layout"]>;
    default: null;
  };
};
declare const _default: DefineComponent<ExtractPublicPropTypes<typeof nuxtLayoutProps>>;
//#endregion
export { _default as default };