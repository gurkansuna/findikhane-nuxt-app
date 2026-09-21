import { useNuxtApp } from "../nuxt.js";
import { NuxtTeleportIslandSymbol } from "./nuxt-teleport-island-component.js";
import { Teleport, createVNode, defineComponent, h, inject } from "vue";
//#region src/app/components/nuxt-teleport-island-slot.ts
const NuxtTeleportIslandSlot = /* @__PURE__ */ defineComponent({
	name: "NuxtTeleportIslandSlot",
	inheritAttrs: false,
	props: {
		name: {
			type: String,
			required: true
		},
		/**
		* must be an array to handle v-for
		*/
		props: { type: Object }
	},
	setup(props, { slots }) {
		const nuxtApp = useNuxtApp();
		const islandContext = nuxtApp.ssrContext?.islandContext;
		if (!islandContext) return () => slots.default?.()[0];
		const componentName = inject(NuxtTeleportIslandSymbol, false);
		islandContext.slots[props.name] = { props: props.props || [] };
		return () => {
			const vnodes = [];
			if (nuxtApp.ssrContext?.islandContext && slots.default) vnodes.push(h("div", {
				"style": "display: contents;",
				"data-island-uid": "",
				"data-island-slot": props.name
			}, { default: () => [createVNode(Teleport, { to: `island-slot=${componentName};${props.name}` }, slots.default?.())] }));
			else vnodes.push(h("div", {
				"style": "display: contents;",
				"data-island-uid": "",
				"data-island-slot": props.name
			}));
			if (slots.fallback) vnodes.push(h(Teleport, { to: `island-fallback=${props.name}` }, slots.fallback()));
			return vnodes;
		};
	}
});
//#endregion
export { NuxtTeleportIslandSlot as default };
