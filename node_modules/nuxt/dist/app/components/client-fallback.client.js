import { sanitizeTag } from "./utils.js";
import { useState } from "../composables/state.js";
import { Fragment, createElementBlock, defineComponent, h, onMounted, shallowRef, useId } from "vue";
//#region src/app/components/client-fallback.client.ts
const NuxtClientFallbackClient = defineComponent({
	name: "NuxtClientFallback",
	inheritAttrs: false,
	props: {
		fallbackTag: {
			type: String,
			default: () => "div"
		},
		fallback: {
			type: String,
			default: () => ""
		},
		placeholder: { type: String },
		placeholderTag: { type: String },
		keepFallback: {
			type: Boolean,
			default: () => false
		}
	},
	emits: ["ssr-error"],
	setup(props, ctx) {
		const mounted = shallowRef(false);
		const ssrFailed = useState(useId());
		if (ssrFailed.value) onMounted(() => {
			mounted.value = true;
		});
		return () => {
			if (ssrFailed.value) {
				if (!mounted.value || props.keepFallback) {
					const slot = ctx.slots.placeholder || ctx.slots.fallback;
					if (slot) return h(Fragment, null, slot());
					const fallbackStr = props.placeholder || props.fallback;
					const fallbackTag = sanitizeTag(props.placeholderTag || props.fallbackTag, "div");
					return createElementBlock(fallbackTag, null, fallbackStr);
				}
			}
			return h(Fragment, null, ctx.slots.default?.());
		};
	}
});
//#endregion
export { NuxtClientFallbackClient as default };
