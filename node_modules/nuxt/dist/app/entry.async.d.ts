import { Entry } from "./entry.js";
//#region src/app/entry.async.d.ts
declare const entry: Entry | (() => Promise<Entry>);
//#endregion
export { entry as default };