import { hash } from "ohash";
//#region src/app/island-hash.ts
/**
* Strip Vue scoped-style attributes (`data-v-*`) from island props before hashing
* or rendering. Scoped-id markers leak in from parent components and are not part
* of the logical island input.
*
* Used before island props are serialized and sent to the island handler.
*
* @internal
*/
function filterIslandProps(props) {
	if (!props) return {};
	const out = {};
	for (const key in props) if (!key.startsWith("data-v-")) out[key] = props[key];
	return out;
}
/**
* Serialize island props exactly as they will be sent to the island handler, so
* the client hashes the same string the server receives. Values that JSON
* drops or rewrites (`undefined`, functions, `NaN`, ...) are removed.
*
* @since 4.5.0
*/
function serializeIslandProps(props) {
	return JSON.stringify(filterIslandProps(props));
}
/**
* Compute the `hashId` segment embedded in an island URL (`/__nuxt_island/<Name>_<hashId>.json`).
*
* The hash binds the response to the requested `(name, props, context, source)` tuple, so the
* server can reject requests whose URL hash does not match the supplied query/body. Use this
* from island clients if you need to ensure a hash stays in step with Nuxt's implementation.
*
* `props` may be passed either as the raw props object or as the JSON string that will be sent
* over the wire; the two produce the same hash when the round-trip is identity.
*
* @since 4.5.0
*/
function getIslandHash(input) {
	const props = typeof input.props === "string" ? parseSerializedProps(input.props) : input.props ?? {};
	return hash([
		input.name,
		props,
		input.context ?? {},
		input.source
	]).replace(/[-_]/g, "");
}
/**
* @internal
* @deprecated use `getIslandHash` instead
*/
function computeIslandHash(name, serializedProps, context, source) {
	return getIslandHash({
		name,
		props: serializedProps,
		context,
		source
	});
}
function parseSerializedProps(serializedProps) {
	try {
		return JSON.parse(serializedProps);
	} catch {
		return serializedProps;
	}
}
//#endregion
export { computeIslandHash, filterIslandProps, getIslandHash, serializeIslandProps };
