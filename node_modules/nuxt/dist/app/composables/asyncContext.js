import { getCurrentInstance, withAsyncContext as withAsyncContext$1 } from "vue";
//#region src/app/composables/asyncContext.ts
/** @since 3.8.0 */
function withAsyncContext(fn) {
	return withAsyncContext$1(() => {
		const nuxtApp = getCurrentInstance()?.appContext.app.$nuxt;
		return nuxtApp ? nuxtApp.runWithContext(fn) : fn();
	});
}
//#endregion
export { withAsyncContext };
