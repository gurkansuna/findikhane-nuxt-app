import { useNuxtApp, useRuntimeConfig } from "../nuxt.js";
import { createError as createError$1 } from "../composables/error.js";
import { injectHead } from "../../head/runtime/composables.js";
import "../composables/head.js";
import { renderDiagnostics } from "../diagnostics/render.js";
import { getFragmentHTML, isEndFragment, isStartFragment } from "./utils.js";
import { prerenderRoutes, useRequestEvent } from "../composables/ssr.js";
import { getIslandHash, serializeIslandProps } from "../island-hash.js";
import { Fragment, Teleport, computed, createStaticVNode, createVNode, defineComponent, getCurrentInstance, h, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, toRaw, watch, withMemo } from "vue";
import { appBaseURL, remoteComponentIslands, selectiveClient } from "#build/nuxt.config.mjs";
import { appendResponseHeader } from "@nuxt/nitro-server/h3";
import { joinURL, withQuery } from "ufo";
import { debounce } from "perfect-debounce";
import { randomUUID } from "uncrypto";
//#region src/app/components/nuxt-island.ts
const pKey = "_islandPromises";
const SSR_UID_RE = /data-island-uid="([^"]*)"/;
const DATA_ISLAND_UID_RE = /data-island-uid(="")?(?!="[^"])/g;
const SLOTNAME_RE = /data-island-slot="([^"]*)"/g;
const SLOT_FALLBACK_RE = / data-island-slot="([^"]*)"[^>]*>/g;
const ISLAND_SCOPE_ID_RE = /^<[^> ]*/;
let id = 1;
const getId = import.meta.client ? () => (id++).toString() : randomUUID;
const components = import.meta.client ? /* @__PURE__ */ new Map() : void 0;
async function loadComponents(source = appBaseURL, paths) {
	if (!paths) return;
	const promises = [];
	for (const [component, item] of Object.entries(paths)) if (!components.has(component)) promises.push((async () => {
		const c = await import(
			/* @vite-ignore */
			joinURL(source, item.chunk)
).then((m) => m.default || m);
		components.set(component, c);
	})());
	await Promise.all(promises);
}
const NuxtIsland = defineComponent({
	name: "NuxtIsland",
	inheritAttrs: false,
	props: {
		name: {
			type: String,
			required: true
		},
		lazy: Boolean,
		props: {
			type: Object,
			default: () => void 0
		},
		context: {
			type: Object,
			default: () => ({})
		},
		scopeId: {
			type: String,
			default: () => void 0
		},
		source: {
			type: String,
			default: () => void 0
		},
		dangerouslyLoadClientComponents: {
			type: Boolean,
			default: false
		}
	},
	emits: ["error"],
	async setup(props, { slots, expose, emit }) {
		let canTeleport = import.meta.server;
		const teleportKey = shallowRef(0);
		const key = shallowRef(0);
		const canLoadClientComponent = computed(() => selectiveClient && (props.dangerouslyLoadClientComponents || !props.source));
		const error = ref(null);
		const config = /* @__PURE__ */ useRuntimeConfig();
		const nuxtApp = useNuxtApp();
		const serializedProps = computed(() => serializeIslandProps(props.props));
		const hashId = computed(() => getIslandHash({
			name: props.name,
			props: serializedProps.value,
			context: props.context,
			source: props.source
		}));
		const instance = getCurrentInstance();
		const event = useRequestEvent();
		let activeHead;
		const eventFetch = import.meta.server ? event.fetch : globalThis.fetch;
		const mounted = shallowRef(false);
		onMounted(() => {
			mounted.value = true;
			teleportKey.value++;
		});
		onBeforeUnmount(() => {
			if (activeHead) activeHead.dispose();
		});
		function setPayload(key, result) {
			const toRevive = {};
			if (result.props) toRevive.props = result.props;
			if (result.slots) toRevive.slots = result.slots;
			if (result.components) toRevive.components = result.components;
			if (result.head) toRevive.head = result.head;
			nuxtApp.payload.data[key] = {
				__nuxt_island: {
					key,
					...import.meta.server && import.meta.prerender ? {} : { params: {
						...props.context,
						props: props.props ? serializedProps.value : void 0
					} },
					result: toRevive
				},
				...result
			};
		}
		const payloads = {};
		if (instance.vnode.el) {
			const slots = toRaw(nuxtApp.payload.data[`${props.name}_${hashId.value}`])?.slots;
			if (slots) payloads.slots = slots;
			if (selectiveClient) {
				const components = toRaw(nuxtApp.payload.data[`${props.name}_${hashId.value}`])?.components;
				if (components) payloads.components = components;
			}
		}
		const ssrHTML = ref("");
		if (import.meta.client && instance.vnode?.el) {
			if (import.meta.dev) {
				let currentEl = instance.vnode.el;
				let startEl = null;
				let isFirstElement = true;
				while (currentEl) {
					if (isEndFragment(currentEl)) {
						if (startEl !== currentEl.previousSibling) renderDiagnostics.NUXT_E4005({ name: props.name });
						break;
					} else if (!isStartFragment(currentEl) && isFirstElement) {
						isFirstElement = false;
						if (currentEl.nodeType === 1) startEl = currentEl;
					}
					currentEl = currentEl.nextSibling;
				}
			}
			ssrHTML.value = getFragmentHTML(instance.vnode.el, true)?.join("") || "";
			const key = `${props.name}_${hashId.value}`;
			nuxtApp.payload.data[key] ||= {};
			nuxtApp.payload.data[key].html = ssrHTML.value.replaceAll(new RegExp(`data-island-uid="${ssrHTML.value.match(SSR_UID_RE)?.[1] || ""}"`, "g"), `data-island-uid=""`);
		}
		const uid = ref(ssrHTML.value.match(SSR_UID_RE)?.[1] || getId());
		const currentSlots = new Set(Object.keys(slots));
		const availableSlots = computed(() => new Set([...ssrHTML.value.matchAll(SLOTNAME_RE)].map((m) => m[1])));
		const html = computed(() => {
			let html = ssrHTML.value;
			if (props.scopeId) html = html.replace(ISLAND_SCOPE_ID_RE, (full) => full + " " + props.scopeId);
			if (import.meta.client && !canLoadClientComponent.value) for (const [key, value] of Object.entries(payloads.components || {})) html = html.replace(new RegExp(` data-island-uid="${uid.value}" data-island-component="${key}"[^>]*>`), (full) => {
				return full + value.html;
			});
			if (payloads.slots) return html.replaceAll(SLOT_FALLBACK_RE, (full, slotName) => {
				if (!currentSlots.has(slotName)) return full + (payloads.slots?.[slotName]?.fallback || "");
				return full;
			});
			return html;
		});
		const head = injectHead();
		async function _fetchComponent(force = false) {
			const key = `${props.name}_${hashId.value}`;
			if (!force && nuxtApp.payload.data[key]?.html) return nuxtApp.payload.data[key];
			const url = remoteComponentIslands && props.source ? joinURL(props.source, `/__nuxt_island/${key}.json`) : `/__nuxt_island/${key}.json`;
			if (import.meta.server && import.meta.prerender) nuxtApp.runWithContext(() => prerenderRoutes(url));
			const r = await eventFetch(withQuery(import.meta.dev && import.meta.client || props.source ? url : joinURL(config.app.baseURL ?? "", url), {
				...props.context,
				props: props.props ? serializedProps.value : void 0
			}));
			if (!r.ok) throw createError$1({
				status: r.status,
				statusText: r.statusText
			});
			try {
				const result = await r.json();
				if (import.meta.server && import.meta.prerender) {
					const hints = r.headers.get("x-nitro-prerender");
					if (hints) appendResponseHeader(event, "x-nitro-prerender", hints);
				}
				setPayload(key, result);
				return result;
			} catch (e) {
				if (r.status !== 200) throw renderDiagnostics.NUXT_E4012({
					name: props.name,
					status: r.status,
					detail: e.message,
					cause: e
				});
				throw e;
			}
		}
		async function fetchComponent(force = false) {
			nuxtApp[pKey] ||= {};
			nuxtApp[pKey][uid.value] ||= _fetchComponent(force).finally(() => {
				delete nuxtApp[pKey][uid.value];
			});
			try {
				const res = await nuxtApp[pKey][uid.value];
				ssrHTML.value = res.html.replaceAll(DATA_ISLAND_UID_RE, `data-island-uid="${uid.value}"`);
				key.value++;
				error.value = null;
				payloads.slots = res.slots || {};
				payloads.components = res.components || {};
				if (import.meta.server && res.components && Object.keys(res.components).length) {
					const parentIslandContext = nuxtApp.ssrContext?.islandContext;
					if (parentIslandContext) for (const [id, { html: _, ...component }] of Object.entries(res.components)) parentIslandContext.components[id] = {
						...component,
						uid: uid.value
					};
				}
				if (selectiveClient && import.meta.client) {
					if (canLoadClientComponent.value && res.components) await loadComponents(props.source, res.components);
				}
				if (res?.head) if (activeHead) activeHead.patch(res.head);
				else activeHead = head.push(res.head);
				if (import.meta.client) nextTick(() => {
					canTeleport = true;
					teleportKey.value++;
				});
			} catch (e) {
				error.value = e;
				emit("error", e);
			}
		}
		expose({ refresh: () => fetchComponent(true) });
		if (import.meta.hot) import.meta.hot.on(`nuxt-server-component:${props.name}`, () => {
			fetchComponent(true);
		});
		if (import.meta.client) watch(props, debounce(() => fetchComponent(), 100), { deep: true });
		if (import.meta.client && instance.vnode.el) {
			const headData = toRaw(nuxtApp.payload.data[`${props.name}_${hashId.value}`])?.head;
			if (headData) activeHead = head.push(headData);
		}
		if (import.meta.client && !instance.vnode.el && props.lazy) fetchComponent();
		else if (import.meta.server || !instance.vnode.el || !nuxtApp.payload.serverRendered) await fetchComponent();
		else if (selectiveClient && canLoadClientComponent.value) await loadComponents(props.source, payloads.components);
		return (_ctx, _cache) => {
			if (!html.value || error.value) return [slots.fallback?.({ error: error.value }) ?? createVNode("div")];
			return [withMemo([key.value], () => {
				return createVNode(Fragment, { key: key.value }, [h(createStaticVNode(html.value || "<div></div>", 1))]);
			}, _cache, 0), withMemo([teleportKey.value], () => {
				const teleports = [];
				const isKeyOdd = teleportKey.value === 0 || !!(teleportKey.value && !(teleportKey.value % 2));
				if (uid.value && html.value && (import.meta.server || props.lazy ? canTeleport : mounted.value || instance.vnode?.el)) {
					for (const slot in slots) if (availableSlots.value.has(slot)) teleports.push(createVNode(Teleport, { to: import.meta.client ? `${isKeyOdd ? "div" : ""}[data-island-uid="${uid.value}"][data-island-slot="${slot}"]` : `uid=${uid.value};slot=${slot}` }, { default: () => (payloads.slots?.[slot]?.props?.length ? payloads.slots[slot].props : [{}]).map((data) => slots[slot]?.(data)) }));
					if (selectiveClient) {
						if (import.meta.server) {
							if (payloads.components) for (const [id, info] of Object.entries(payloads.components)) {
								const { html, slots, uid: targetUID = uid.value } = info;
								let replaced = html.replaceAll("data-island-uid", `data-island-uid="${uid.value}"`);
								for (const slot in slots) replaced = replaced.replaceAll(`data-island-slot="${slot}">`, (full) => full + slots[slot]);
								teleports.push(createVNode(Teleport, { to: `uid=${targetUID};client=${id}` }, { default: () => [createStaticVNode(replaced, 1)] }));
							}
						} else if (canLoadClientComponent.value && payloads.components) for (const [id, info] of Object.entries(payloads.components)) {
							const { props, slots, uid: targetUID = uid.value } = info;
							const component = components.get(id);
							const vnode = createVNode(Teleport, { to: `${isKeyOdd ? "div" : ""}[data-island-uid='${targetUID}'][data-island-component="${id}"]` }, { default: () => {
								return [h(component, props, Object.fromEntries(Object.entries(slots || {}).map(([k, v]) => [k, () => createStaticVNode(`<div style="display: contents" data-island-uid data-island-slot="${k}">${v}</div>`, 1)])))];
							} });
							teleports.push(vnode);
						}
					}
				}
				return h(Fragment, teleports);
			}, _cache, 1)];
		};
	}
});
//#endregion
export { NuxtIsland as default };
