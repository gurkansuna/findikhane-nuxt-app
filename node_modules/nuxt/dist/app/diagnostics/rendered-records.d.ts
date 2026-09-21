import { RouteRecordNormalized } from "vue-router";
//#region src/app/diagnostics/rendered-records.d.ts
declare function trackRenderedRecord(record: RouteRecordNormalized): () => void;
declare function isRecordRendered(record: RouteRecordNormalized): boolean;
//#endregion
export { isRecordRendered, trackRenderedRecord };