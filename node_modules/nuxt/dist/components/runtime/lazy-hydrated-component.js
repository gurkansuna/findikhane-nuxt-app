import { defineAsyncComponent, defineComponent, h, hydrateOnIdle, hydrateOnInteraction, hydrateOnMediaQuery, hydrateOnVisible, mergeProps } from "vue";
import { useNuxtApp } from "#app/nuxt";
//#region src/components/runtime/lazy-hydrated-component.ts
function defineLazyComponent(props, defineStrategy, never = false) {
	return (id, loader) => defineComponent({
		inheritAttrs: false,
		props,
		emits: ["hydrated"],
		setup(props, ctx) {
			if (import.meta.server) useNuxtApp().hook("app:rendered", ({ ssrContext }) => {
				ssrContext["~lazyHydratedModules"] ||= /* @__PURE__ */ new Set();
				ssrContext["~lazyHydratedModules"].add(id);
				if (never) {
					ssrContext["~neverHydratedModules"] ||= /* @__PURE__ */ new Set();
					ssrContext["~neverHydratedModules"].add(id);
				}
			});
			const child = defineAsyncComponent({ loader });
			const comp = defineAsyncComponent({
				hydrate: defineStrategy(props),
				loader: () => Promise.resolve(child)
			});
			const onVnodeMounted = () => {
				ctx.emit("hydrated");
			};
			return () => h(comp, mergeProps(ctx.attrs, { onVnodeMounted }), ctx.slots);
		}
	});
}
const createLazyVisibleComponent = defineLazyComponent({ hydrateOnVisible: {
	type: [Object, Boolean],
	required: false,
	default: true
} }, (props) => hydrateOnVisible(props.hydrateOnVisible === true ? void 0 : props.hydrateOnVisible));
const createLazyIdleComponent = defineLazyComponent({ hydrateOnIdle: {
	type: [Number, Boolean],
	required: false,
	default: true
} }, (props) => props.hydrateOnIdle === 0 ? void 0 : hydrateOnIdle(props.hydrateOnIdle === true ? void 0 : props.hydrateOnIdle));
const defaultInteractionEvents = [
	"pointerenter",
	"click",
	"focus"
];
const createLazyInteractionComponent = defineLazyComponent({ hydrateOnInteraction: {
	type: [String, Array],
	required: false,
	default: () => defaultInteractionEvents
} }, (props) => hydrateOnInteraction(props.hydrateOnInteraction === true ? defaultInteractionEvents : props.hydrateOnInteraction || defaultInteractionEvents));
const createLazyMediaQueryComponent = defineLazyComponent({ hydrateOnMediaQuery: {
	type: String,
	required: true
} }, (props) => hydrateOnMediaQuery(props.hydrateOnMediaQuery));
const createLazyIfComponent = defineLazyComponent({ hydrateWhen: {
	type: Boolean,
	default: true
} }, (props) => props.hydrateWhen ? void 0 : () => {});
const createLazyTimeComponent = defineLazyComponent({ hydrateAfter: {
	type: Number,
	required: true
} }, (props) => props.hydrateAfter === 0 ? void 0 : (hydrate) => {
	const id = setTimeout(hydrate, props.hydrateAfter);
	return () => clearTimeout(id);
});
const hydrateNever = /* @__NO_SIDE_EFFECTS__ */ () => {};
const createLazyNeverComponent = defineLazyComponent({ hydrateNever: {
	type: Boolean,
	required: false,
	default: true
} }, () => hydrateNever, true);
//#endregion
export { createLazyIdleComponent, createLazyIfComponent, createLazyInteractionComponent, createLazyMediaQueryComponent, createLazyNeverComponent, createLazyTimeComponent, createLazyVisibleComponent };
