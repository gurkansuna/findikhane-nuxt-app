import { Manifest } from "vue-bundle-renderer";
//#region src/runtime/server/manifest.d.ts
declare const stub: Manifest | (() => Manifest | Promise<Manifest>);
//#endregion
export { stub as default };