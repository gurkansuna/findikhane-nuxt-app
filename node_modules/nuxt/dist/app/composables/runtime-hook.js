import { useNuxtApp } from "../nuxt.js";
import { onScopeDispose } from "vue";
//#region src/app/composables/runtime-hook.ts
/**
* Registers a runtime hook in a Nuxt application and ensures it is properly disposed of when the scope is destroyed.
* @param name - The name of the hook to register.
* @param fn - The callback function to be executed when the hook is triggered.
* @since 3.14.0
*/
function useRuntimeHook(name, fn) {
	const unregister = useNuxtApp().hook(name, fn);
	onScopeDispose(unregister);
}
//#endregion
export { useRuntimeHook };
