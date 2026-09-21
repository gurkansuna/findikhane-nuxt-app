//#region src/app/entry.async.ts
const entry = import.meta.server ? (ctx) => import("#app/entry").then((m) => m.default(ctx)) : () => import("#app/entry").then((m) => m.default);
if (import.meta.client) entry();
//#endregion
export { entry as default };
