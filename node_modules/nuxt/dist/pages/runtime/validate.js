import { defineNuxtRouteMiddleware } from "#app/composables/router";
import { createError } from "#app/composables/error";
//#region src/pages/runtime/validate.ts
const middleware = defineNuxtRouteMiddleware(async (to) => {
	if (!to.meta?.validate) return;
	const result = await Promise.resolve(to.meta.validate(to));
	if (result === true) return;
	return createError({
		fatal: import.meta.client,
		status: result && (result.status || result.statusCode) || 404,
		statusText: result && (result.statusText || result.statusMessage) || `Page Not Found: ${to.fullPath}`,
		data: { path: to.fullPath }
	});
});
//#endregion
export { middleware as default };
