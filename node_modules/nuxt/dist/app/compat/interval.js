import { appDiagnostics } from "../diagnostics/core.js";
import { createError } from "../composables/error.js";
//#region src/app/compat/interval.ts
const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `import.meta.client`.";
const setInterval = import.meta.client ? globalThis.setInterval : (() => {
	if (import.meta.dev) throw createError({
		status: 500,
		message: intervalError
	});
	appDiagnostics.NUXT_E1004();
});
//#endregion
export { setInterval };
