import { PrecomputedData } from "vue-bundle-renderer";
//#region src/runtime/server/precomputed.d.ts
declare const stub: PrecomputedData | (() => PrecomputedData | Promise<PrecomputedData>) | undefined;
//#endregion
export { stub as default };