import { defineNuxtPlugin } from "../nuxt.js";
import { resolveTags } from "unhead/utils";
//#region src/app/plugins/prefetch-preload-tags.server.ts
const FORWARDED_RELS = /* @__PURE__ */ new Set(["preload", "modulepreload"]);
const plugin = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:prefetch-preload-tags",
	hooks: { "app:rendered": ({ ssrContext }) => {
		if (!ssrContext) return;
		const tags = resolveTags(ssrContext.head);
		const links = [];
		for (const tag of tags) {
			if (tag.tag !== "link") continue;
			const props = tag.props;
			if (!props) continue;
			const rel = props.rel;
			const href = props.href;
			if (typeof rel !== "string" || typeof href !== "string") continue;
			if (!FORWARDED_RELS.has(rel)) continue;
			const link = {
				rel,
				href
			};
			for (const key in props) {
				if (key === "rel" || key === "href") continue;
				const value = props[key];
				if (typeof value === "string" || typeof value === "boolean") link[key] = value;
			}
			links.push(link);
		}
		if (links.length) ssrContext.payload.prefetchLinks = links;
	} }
});
//#endregion
export { plugin as default };
