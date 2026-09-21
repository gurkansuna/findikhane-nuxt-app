//#region src/app/island-props.ts
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
/**
* Find a request-supplied `as` prop that the island does not declare. An undeclared prop falls
* through as an attribute onto the island's root, so on a polymorphic root (e.g. `reka-ui` /
* `@nuxt/ui`) it drives dynamic component resolution unbidden. A declared `as` is the island's
* own API and is left alone, as is any island that opts out of attribute inheritance. Only the
* top level is checked; props the author forwards into `<component :is>` are their responsibility.
*
* @internal
*/
function findReservedRootIslandPropKey(value, component) {
	if (!value || typeof value !== "object" || Array.isArray(value) || !Object.hasOwn(value, "as")) return;
	const options = component;
	if (options.inheritAttrs === false || declaresProp(options.props, "as")) return;
	return "as";
}
function declaresProp(props, name) {
	if (!props) return false;
	return Array.isArray(props) ? props.includes(name) : Object.hasOwn(props, name);
}
//#endregion
export { findReservedRootIslandPropKey, findUnsafeIslandPropKey };
