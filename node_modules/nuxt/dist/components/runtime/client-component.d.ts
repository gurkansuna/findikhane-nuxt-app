import { AsyncComponentLoader, Component } from "vue";
//#region src/components/runtime/client-component.d.ts
declare function createClientPage(loader: AsyncComponentLoader): Promise<Component>;
//#endregion
export { createClientPage };