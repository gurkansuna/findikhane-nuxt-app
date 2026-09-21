import { defineNuxtPlugin, useNuxtApp } from "../nuxt.js";
import { createError } from "../composables/error.js";
import { definePayloadReviver, getNuxtClientPayload } from "../composables/payload.js";
import { reactive, ref, shallowReactive, shallowRef } from "vue";
import { componentIslands } from "#build/nuxt.config.mjs";
import { $fetch } from "#build/fetch";
//#region src/app/plugins/revive-payload.client.ts
const $fetch$1 = $fetch;
function parseRevivedData(data) {
	try {
		return JSON.parse(data);
	} catch {
		return data;
	}
}
const revivers = [
	["NuxtError", (data) => createError(data)],
	["EmptyShallowRef", (data) => shallowRef(data === "_" ? void 0 : data === "0n" ? BigInt(0) : parseRevivedData(data))],
	["EmptyRef", (data) => ref(data === "_" ? void 0 : data === "0n" ? BigInt(0) : parseRevivedData(data))],
	["ShallowRef", (data) => shallowRef(data)],
	["ShallowReactive", (data) => shallowReactive(data)],
	["Ref", (data) => ref(data)],
	["Reactive", (data) => reactive(data)]
];
if (componentIslands) revivers.push(["Island", ({ key, params, result }) => {
	const nuxtApp = useNuxtApp();
	if (!nuxtApp.isHydrating) nuxtApp.payload.data[key] ||= $fetch$1(`/__nuxt_island/${key}.json`, {
		responseType: "json",
		...params ? { params } : {}
	}).then((r) => {
		nuxtApp.payload.data[key] = r;
		return r;
	});
	return {
		html: "",
		...result
	};
}]);
const plugin = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:revive-payload:client",
	order: -30,
	async setup(nuxtApp) {
		for (const [reviver, fn] of revivers) definePayloadReviver(reviver, fn);
		Object.assign(nuxtApp.payload, await nuxtApp.runWithContext(getNuxtClientPayload));
		delete window.__NUXT__;
	}
});
//#endregion
export { plugin as default };
