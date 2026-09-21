import { MagicString } from "magic-string";
//#region src/index.ts
function rolldownString(code, id, meta) {
	return meta?.magicString || new MagicString(code, { filename: id });
}
function withMagicString(handler) {
	return function(code, id, ...args) {
		const s = rolldownString(code, id, args.at(-1));
		const res = handler.call(this, s, id, ...args);
		const callback = (res) => {
			if (typeof res === "string") return { code: res };
			return generateTransform(res || s, id, !!res);
		};
		if (res instanceof Promise) return res.then(callback);
		return callback(res);
	};
}
/**
* Generate an object of code and source map from MagicString.
*/
function generateTransform(s, id, force) {
	if (s && (s.constructor.name === "BindingMagicString" || "isRolldownMagicString" in s && s.isRolldownMagicString)) return { code: s };
	if (s && (force || s.hasChanged())) return {
		code: s.toString(),
		get map() {
			return s.generateMap({
				source: id,
				includeContent: true,
				hires: "boundary"
			});
		}
	};
}
//#endregion
export { generateTransform, rolldownString, withMagicString };
