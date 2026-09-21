//#region src/app/compat/idle-callback.d.ts
declare const requestIdleCallback: Window['requestIdleCallback'];
declare const cancelIdleCallback: Window['cancelIdleCallback'];
//#endregion
export { cancelIdleCallback, requestIdleCallback };