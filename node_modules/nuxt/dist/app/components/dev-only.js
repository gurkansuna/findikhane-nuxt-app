import { defineComponent } from "vue";
//#region src/app/components/dev-only.ts
const DevOnly = defineComponent({
	name: "DevOnly",
	inheritAttrs: false,
	...import.meta.dev && { slots: Object },
	setup(_, props) {
		if (import.meta.dev) return () => props.slots.default?.();
		return () => props.slots.fallback?.();
	}
});
//#endregion
export { DevOnly as default };
