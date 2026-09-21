//#region src/app/plugins/utils.ts
const VALID_ISLAND_KEY_RE = /^[a-z][\w-]*_[a-z\d]+$/i;
function isValidIslandKey(key) {
	return typeof key === "string" && VALID_ISLAND_KEY_RE.test(key) && key.length <= 100;
}
//#endregion
export { isValidIslandKey };
