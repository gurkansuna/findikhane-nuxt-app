import { DefineSetupFnComponent } from "vue";
//#region src/app/components/test-component-wrapper.d.ts
declare const testComponentWrapper: (url: string) => DefineSetupFnComponent<{}>;
//#endregion
export { testComponentWrapper as default };