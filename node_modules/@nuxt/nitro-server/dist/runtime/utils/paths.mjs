import { joinRelativeURL } from "ufo";
import { useRuntimeConfig } from "nitropack/runtime";
//#region src/runtime/utils/paths.ts
function baseURL() {
	return useRuntimeConfig().app.baseURL;
}
function buildAssetsDir() {
	return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
	return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
	const app = useRuntimeConfig().app;
	const publicBase = app.cdnURL || app.baseURL;
	return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}
//#endregion
export { baseURL, buildAssetsDir, buildAssetsURL, publicAssetsURL };
