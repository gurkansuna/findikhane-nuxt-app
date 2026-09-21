//#region ../nuxt/src/app/island-props.ts
/**
* Find a `template` key anywhere in island props. With the Vue runtime compiler bundled, a
* `template` string reaching component resolution would be compiled and executed. (`render`
* is not checked: props arrive as JSON, so it can only be an inert string, never a function.)
*
* @internal
*/
function findUnsafeIslandPropKey(value) {
	const pending = [value];
	const seen = /* @__PURE__ */ new Set();
	while (pending.length) {
		const current = pending.pop();
		if (!current || typeof current !== "object" || seen.has(current)) continue;
		seen.add(current);
		for (const key of Object.keys(current)) {
			if (key === "template") return key;
			pending.push(current[key]);
		}
	}
}
//#endregion
export { findUnsafeIslandPropKey };
