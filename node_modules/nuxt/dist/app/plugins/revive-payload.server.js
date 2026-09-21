import { defineNuxtPlugin } from "../nuxt.js";
import { isNuxtError } from "../composables/error.js";
import { definePayloadReducer } from "../composables/payload.js";
import { isValidIslandKey } from "./utils.js";
import { isReactive, isRef, isShallow, toRaw } from "vue";
import { componentIslands } from "#build/nuxt.config.mjs";
//#region src/app/plugins/revive-payload.server.ts
const reducers = [
	["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
	["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
	["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
	["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
	["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
	["Ref", (data) => isRef(data) && data.value],
	["Reactive", (data) => isReactive(data) && toRaw(data)]
];
if (componentIslands) reducers.push(["Island", (data) => data && data?.__nuxt_island && isValidIslandKey(data.__nuxt_island.key) && data.__nuxt_island]);
const plugin = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:revive-payload:server",
	setup() {
		for (const [reducer, fn] of reducers) definePayloadReducer(reducer, fn);
	}
});
//#endregion
export { plugin as default };
