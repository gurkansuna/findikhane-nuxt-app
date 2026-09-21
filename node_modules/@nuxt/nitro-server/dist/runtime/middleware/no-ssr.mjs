import { defineEventHandler, getRequestHeader } from "h3";
//#region src/runtime/middleware/no-ssr.ts
const handler = defineEventHandler((event) => {
	if (getRequestHeader(event, "x-nuxt-no-ssr")) {
		event.context.nuxt ||= {};
		event.context.nuxt.noSSR = true;
	}
});
//#endregion
export { handler as default };
