//#region src/app/composables/asyncContext.d.ts
/** @since 3.8.0 */
declare function withAsyncContext(fn: () => PromiseLike<unknown>): [unknown, () => void];
//#endregion
export { withAsyncContext };