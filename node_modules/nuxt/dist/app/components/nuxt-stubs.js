import { createError } from "../composables/error.js";
//#region src/app/components/nuxt-stubs.ts
function renderStubMessage(name) {
	throw createError({
		fatal: true,
		status: 500,
		statusText: `${name} is provided by @nuxt/image. Check your console to install it or run 'npx nuxt module add @nuxt/image'`
	});
}
const NuxtImg = { setup: () => renderStubMessage("<NuxtImg>") };
const NuxtPicture = { setup: () => renderStubMessage("<NuxtPicture>") };
//#endregion
export { NuxtImg, NuxtPicture };
