import { useRoute } from "../composables/router.js";
import { createError } from "../composables/error.js";
import { renderDiagnostics } from "../diagnostics/render.js";
import { findReservedRootIslandPropKey } from "../island-props.js";
import { createVNode, defineComponent, onErrorCaptured } from "vue";
import { islandComponents, pageIslandRoutes, providePageIslandDepth } from "#build/components.islands.mjs";
//#region src/app/components/island-renderer.ts
const PAGE_ISLAND_PREFIX = "page_";
const IslandRenderer = defineComponent({
	name: "IslandRenderer",
	props: { context: {
		type: Object,
		required: true
	} },
	async setup(props) {
		const name = props.context.name;
		const component = Object.hasOwn(islandComponents, name) ? islandComponents[name] : void 0;
		if (!component) throw createError({
			status: 404,
			statusText: `Island component not found: ${props.context.name}`
		});
		if (props.context.name.startsWith(PAGE_ISLAND_PREFIX)) providePageIslandDepth(useRoute(), pageIslandRoutes[props.context.name]);
		onErrorCaptured((e) => {
			renderDiagnostics.NUXT_E4015({
				name,
				cause: e
			});
		});
		const loader = component.__asyncLoader;
		const reservedKey = findReservedRootIslandPropKey(props.context.props, loader ? await loader() : component);
		if (reservedKey) {
			if (import.meta.dev) renderDiagnostics.NUXT_E4018({
				name,
				key: reservedKey
			});
			throw createError({
				status: 400,
				statusText: "Invalid island request props"
			});
		}
		return () => createVNode(component || "span", {
			...props.context.props,
			"data-island-uid": ""
		});
	}
});
//#endregion
export { IslandRenderer as default };
