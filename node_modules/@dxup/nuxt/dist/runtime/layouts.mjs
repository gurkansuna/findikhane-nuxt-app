import { injectionKey } from "./registry.mjs";
import { Fragment, computed, defineComponent, getCurrentInstance, h, inject, onActivated, onDeactivated, onScopeDispose, onUpdated, provide, shallowRef } from "vue";
import { NuxtLayout } from "#build/dxup/layouts.mjs";
//#region src/module/named-layout-slots/runtime/layouts.ts
var layouts_default = defineComponent((props, ctx) => {
	const layers = [];
	const slots = shallowRef(null);
	let layerUid = 0;
	let resolveReady;
	function update() {
		slots.value = layers.length > 1 ? mergeLayers([...layers]) : layers[0]?.slots ?? null;
	}
	provide(injectionKey, {
		slots,
		ready: new Promise((resolve) => {
			resolveReady = resolve;
		}),
		use(value) {
			const layer = {
				slots: value,
				uid: layerUid++
			};
			function add() {
				if (layers.every((entry) => entry.slots !== value)) {
					layers.push(layer);
					update();
				}
			}
			function remove() {
				const index = layers.findIndex((entry) => entry.slots === value);
				if (index !== -1) {
					layers.splice(index, 1);
					update();
				}
			}
			add();
			onScopeDispose(remove);
			onDeactivated(remove);
			onActivated(add);
			resolveReady?.();
		},
		invalidate() {
			slots.value = layers.length ? mergeLayers([...layers]) : null;
		},
		getOwner(name) {
			for (let i = layers.length - 1; i >= 0; i--) if (layers[i].slots[name]) return layers[i].uid;
		}
	});
	return () => h(NuxtLayout, props, ctx.slots);
});
/**
* Merges the slots of all mounted pages. The most recently mounted pages have
* a higher priority.
* @param layers
*/
function mergeLayers(layers) {
	const merged = Object.create(null);
	for (let i = layers.length - 1; i >= 0; i--) for (const key in layers[i].slots) if (!(key in merged)) Object.defineProperty(merged, key, {
		enumerable: true,
		configurable: true,
		get: () => {
			for (let j = layers.length - 1; j >= 0; j--) {
				const slot = layers[j].slots[key];
				if (slot) return slot;
			}
		}
	});
	return merged;
}
/**
* Returns the slots forwarded by the active page via named layout slots.
*/
function useLayoutSlots() {
	const registry = inject(injectionKey, null);
	return computed(() => registry?.slots.value ?? {});
}
const LayoutSlot = defineComponent({
	props: { name: {
		type: String,
		required: true
	} },
	setup(props, ctx) {
		const registry = inject(injectionKey);
		const currentInstance = getCurrentInstance();
		const render = () => {
			const children = (registry?.slots.value?.[props.name] ?? currentInstance?.parent?.slots[props.name])?.(ctx.attrs) ?? ctx.slots.default?.() ?? [];
			return h(Fragment, { key: registry?.getOwner(props.name) ?? -1 }, children);
		};
		if (import.meta.server && registry && !registry.slots.value?.[props.name]) return registry.ready.then(() => render);
		return render;
	}
});
const LayoutSlotsForward = defineComponent((props, ctx) => {
	const registry = inject(injectionKey);
	registry?.use(ctx.slots);
	if (import.meta.client && registry) {
		let keys = Object.keys(ctx.slots).join("\0");
		onUpdated(() => {
			const next = Object.keys(ctx.slots).join("\0");
			if (next !== keys) {
				keys = next;
				registry.invalidate();
			}
		});
	}
	return () => {
		const vnodes = ctx.slots.default?.();
		return vnodes?.length === 1 ? vnodes[0] : vnodes;
	};
});
//#endregion
export { LayoutSlot, LayoutSlotsForward, layouts_default as default, useLayoutSlots };
