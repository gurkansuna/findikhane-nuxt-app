import { createTransformer, getTransformFilter } from "./transform.mjs";
import { createUnplugin } from "unplugin";
const unctxPlugin = createUnplugin((options = {}) => {
	let transformer;
	const transformerPromise = createTransformer(options).then((t) => {
		transformer = t;
		return t;
	});
	transformerPromise.catch(() => {});
	const run = (transformer, code, id) => {
		const result = transformer.transform(code);
		if (result) return {
			code: result.code,
			map: result.magicString.generateMap({
				source: id,
				includeContent: true
			})
		};
	};
	return {
		name: "unctx:transform",
		enforce: "post",
		transformInclude: options.transformInclude,
		transform: {
			filter: options.transformFilter ?? getTransformFilter(options),
			handler(code, id) {
				return transformer ? run(transformer, code, id) : transformerPromise.then((t) => run(t, code, id));
			}
		}
	};
});
export { unctxPlugin };
