export * from "vue";
//#region src/app/compat/capi.d.ts
declare const install: () => void;
declare function set<T>(target: any, key: string | number | symbol, val: T): T;
declare function del(target: any, key: string | number | symbol): void;
//#endregion
export { del, install, set };