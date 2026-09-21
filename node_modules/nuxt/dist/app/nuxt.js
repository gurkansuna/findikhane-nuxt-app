import { traceAsync } from "./internal/tracing.js";
import { appDiagnostics } from "./diagnostics/core.js";
import { effectScope, getCurrentInstance, getCurrentScope, hasInjectionContext, reactive, shallowReactive } from "vue";
import "./types/augments.js";
import { createHooks } from "hookable";
import { getContext } from "unctx";
import { appId, asyncCallHook, chunkErrorEvent, componentIslands, hasIslandOptOutPlugins, hasParallelPlugins, hasPluginDependencies, hasPluginHooks, multiApp, tracingChannelNuxt } from "#build/nuxt.config.mjs";
//#region src/app/nuxt.ts
function getNuxtAppCtx(id = appId || "nuxt-app") {
	return getContext(id, { asyncContext: !!__NUXT_ASYNC_CONTEXT__ && import.meta.server });
}
const NuxtPluginIndicator = "__nuxt_plugin";
/** @since 3.0.0 */
function createNuxtApp(options) {
	let hydratingCount = 0;
	const nuxtApp = {
		_id: options.id || appId || "nuxt-app",
		_scope: effectScope(),
		provide: void 0,
		versions: {
			get nuxt() {
				return __NUXT_VERSION__;
			},
			get vue() {
				return nuxtApp.vueApp.version;
			}
		},
		payload: shallowReactive({
			...options.ssrContext?.payload || {},
			data: shallowReactive({}),
			state: reactive({}),
			once: /* @__PURE__ */ new Set(),
			_errors: shallowReactive({})
		}),
		static: { data: {} },
		runWithContext(fn) {
			if (nuxtApp._scope.active && !getCurrentScope()) return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
			return callWithNuxt(nuxtApp, fn);
		},
		isHydrating: import.meta.client,
		deferHydration() {
			if (!nuxtApp.isHydrating) return () => {};
			hydratingCount++;
			let called = false;
			return () => {
				if (called) return;
				called = true;
				hydratingCount--;
				if (hydratingCount === 0) {
					nuxtApp.isHydrating = false;
					return nuxtApp.callHook("app:suspense:resolve");
				}
			};
		},
		_asyncDataPromises: {},
		_asyncData: shallowReactive({}),
		_state: shallowReactive({}),
		_payloadRevivers: {},
		...options
	};
	if (import.meta.server) nuxtApp.payload.serverRendered = true;
	if (import.meta.server && nuxtApp.ssrContext) {
		nuxtApp.payload.path = nuxtApp.ssrContext.url;
		nuxtApp.ssrContext.nuxt = nuxtApp;
		nuxtApp.ssrContext.payload = nuxtApp.payload;
		nuxtApp.ssrContext.config = {
			public: nuxtApp.ssrContext.runtimeConfig.public,
			app: nuxtApp.ssrContext.runtimeConfig.app
		};
	}
	if (import.meta.client) {
		const __NUXT__ = multiApp ? window.__NUXT__?.[nuxtApp._id] : window.__NUXT__;
		if (__NUXT__) for (const key in __NUXT__) switch (key) {
			case "data":
			case "state":
			case "_errors":
				Object.assign(nuxtApp.payload[key], __NUXT__[key]);
				break;
			default: nuxtApp.payload[key] = __NUXT__[key];
		}
	}
	nuxtApp.hooks = createHooks();
	nuxtApp.hook = nuxtApp.hooks.hook;
	if (import.meta.server) {
		const contextCaller = async function(hooks, args) {
			for (const hook of hooks) await nuxtApp.runWithContext(() => hook(...args));
		};
		nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, args);
	} else if (asyncCallHook) {
		const _callHook = nuxtApp.hooks.callHook;
		nuxtApp.hooks.callHook = (name, ...args) => Promise.resolve().then(() => _callHook(name, ...args));
	}
	nuxtApp.callHook = nuxtApp.hooks.callHook;
	nuxtApp.provide = (name, value) => {
		const $name = "$" + name;
		defineGetter(nuxtApp, $name, value);
		defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
	};
	defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
	defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
	if (import.meta.client) {
		if (chunkErrorEvent) window.addEventListener(chunkErrorEvent, (event) => {
			nuxtApp.callHook("app:chunkError", { error: event.payload });
			if (event.payload?.message?.includes("Unable to preload CSS")) event.preventDefault();
		});
		window.useNuxtApp ||= useNuxtApp;
		const unreg = nuxtApp.hook("app:error", (...args) => {
			appDiagnostics.NUXT_E1005({ cause: args.length > 1 ? args : args[0] });
		});
		nuxtApp.hook("app:mounted", unreg);
	}
	const runtimeConfig = import.meta.server ? options.ssrContext.runtimeConfig : nuxtApp.payload.config;
	nuxtApp.provide("config", import.meta.client && import.meta.dev ? wrappedConfig(runtimeConfig) : runtimeConfig);
	return nuxtApp;
}
/** @since 3.12.0 */
function registerPluginHooks(nuxtApp, plugin) {
	if (plugin.hooks) nuxtApp.hooks.addHooks(plugin.hooks);
}
/** @since 3.0.0 */
async function applyPlugin(nuxtApp, plugin) {
	if (typeof plugin === "function") {
		const run = () => nuxtApp.runWithContext(() => plugin(nuxtApp));
		const { provide } = await (import.meta.server && tracingChannelNuxt ? traceAsync("nuxt.plugin", { plugin: {
			name: plugin._name,
			parallel: plugin.parallel,
			dependsOn: plugin.dependsOn
		} }, run) : run()) || {};
		if (provide && typeof provide === "object") for (const key in provide) nuxtApp.provide(key, provide[key]);
	}
}
/** @since 3.0.0 */
async function applyPlugins(nuxtApp, plugins) {
	if (hasPluginDependencies || hasParallelPlugins) return applyPluginsWithDependencies(nuxtApp, plugins);
	let error;
	const checkIslandEnv = import.meta.server && componentIslands && hasIslandOptOutPlugins;
	if (hasPluginHooks) for (const plugin of plugins) {
		if (checkIslandEnv && nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) continue;
		registerPluginHooks(nuxtApp, plugin);
	}
	for (const plugin of plugins) {
		if (checkIslandEnv && nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) continue;
		try {
			await applyPlugin(nuxtApp, plugin);
		} catch (e) {
			if (!nuxtApp.payload.error) throw e;
			error ||= e;
		}
	}
	if (error) throw nuxtApp.payload.error || error;
}
async function applyPluginsWithDependencies(nuxtApp, plugins) {
	const resolvedPlugins = /* @__PURE__ */ new Set();
	const unresolvedPlugins = [];
	const parallels = [];
	let error;
	let promiseDepth = 0;
	async function executePlugin(plugin) {
		const unresolvedPluginsForThisPlugin = plugin.dependsOn?.filter((name) => plugins.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
		if (unresolvedPluginsForThisPlugin.length > 0) unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin]);
		else {
			const promise = applyPlugin(nuxtApp, plugin).then(async () => {
				if (plugin._name) {
					resolvedPlugins.add(plugin._name);
					await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
						if (dependsOn.has(plugin._name)) {
							dependsOn.delete(plugin._name);
							if (dependsOn.size === 0) {
								promiseDepth++;
								await executePlugin(unexecutedPlugin);
							}
						}
					}));
				}
			}).catch((e) => {
				if (!plugin.parallel && !nuxtApp.payload.error) throw e;
				error ||= e;
			});
			if (plugin.parallel) parallels.push(promise);
			else await promise;
		}
	}
	const checkIslandEnv = import.meta.server && componentIslands && hasIslandOptOutPlugins;
	if (hasPluginHooks) for (const plugin of plugins) {
		if (checkIslandEnv && nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) continue;
		registerPluginHooks(nuxtApp, plugin);
	}
	for (const plugin of plugins) {
		if (checkIslandEnv && nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) continue;
		await executePlugin(plugin);
	}
	await Promise.all(parallels);
	if (promiseDepth) for (let i = 0; i < promiseDepth; i++) await Promise.all(parallels);
	if (error) throw nuxtApp.payload.error || error;
}
/** @since 3.0.0 */
/* @__NO_SIDE_EFFECTS__ */
function defineNuxtPlugin(plugin) {
	if (typeof plugin === "function") return plugin;
	const _name = plugin._name || plugin.name;
	delete plugin.name;
	return Object.assign(plugin.setup || (() => {}), plugin, {
		[NuxtPluginIndicator]: true,
		_name
	});
}
const definePayloadPlugin = defineNuxtPlugin;
/** @since 3.0.0 */
function isNuxtPlugin(plugin) {
	return typeof plugin === "function" && "__nuxt_plugin" in plugin;
}
/**
* Ensures that the setup function passed in has access to the Nuxt instance via `useNuxtApp`.
* @param nuxt A Nuxt instance
* @param setup The function to call
* @since 3.0.0
*/
function callWithNuxt(nuxt, setup, args) {
	const fn = () => args ? setup(...args) : setup();
	const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
	if (import.meta.server) return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
	else {
		nuxtAppCtx.set(nuxt);
		return nuxt.vueApp.runWithContext(fn);
	}
}
function tryUseNuxtApp(id) {
	let nuxtAppInstance;
	if (hasInjectionContext()) nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
	nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
	return nuxtAppInstance || null;
}
function useNuxtApp(id) {
	const nuxtAppInstance = tryUseNuxtApp(id);
	if (!nuxtAppInstance) throw appDiagnostics.NUXT_E1001();
	return nuxtAppInstance;
}
/** @since 3.0.0 */
/* @__NO_SIDE_EFFECTS__ */
function useRuntimeConfig(_event) {
	return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
	Object.defineProperty(obj, key, { get: () => val });
}
/** @since 3.0.0 */
function defineAppConfig(config) {
	return config;
}
/**
* Configure error getter on runtime secret property access that doesn't exist on the client side
*/
const loggedKeys = /* @__PURE__ */ new Set();
function wrappedConfig(runtimeConfig) {
	if (!import.meta.dev || import.meta.server) return runtimeConfig;
	const keys = [];
	for (const key in runtimeConfig) keys.push(`\`${key}\``);
	const lastKey = keys.pop();
	return new Proxy(runtimeConfig, { get(target, p, receiver) {
		if (typeof p === "string" && p !== "public" && !(p in target) && !p.startsWith("__v")) {
			if (!loggedKeys.has(p)) {
				loggedKeys.add(p);
				appDiagnostics.NUXT_E1003({
					key: p,
					keys: keys.join(", "),
					lastKey
				});
			}
		}
		return Reflect.get(target, p, receiver);
	} });
}
//#endregion
export { NuxtPluginIndicator, applyPlugin, applyPlugins, callWithNuxt, createNuxtApp, defineAppConfig, defineNuxtPlugin, definePayloadPlugin, getNuxtAppCtx, isNuxtPlugin, registerPluginHooks, tryUseNuxtApp, useNuxtApp, useRuntimeConfig };
