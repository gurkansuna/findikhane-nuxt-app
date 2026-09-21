import { traceAsync } from "../internal/tracing.js";
import { useNuxtApp } from "../nuxt.js";
import { getUserCaller, toArray } from "../utils.js";
import { createError } from "./error.js";
import { hashFunction, hashKey } from "../utils/hash.js";
import { debounceTick } from "../utils/debounce-tick.js";
import { clientOnlySymbol } from "../components/client-only.js";
import { onNuxtReady } from "./ready.js";
import { defineKeyedFunctionFactory } from "../../compiler/runtime/index.js";
import { dataDiagnostics } from "../diagnostics/data.js";
import { computed, getCurrentInstance, getCurrentScope, inject, isRef, isShallow, nextTick, onBeforeMount, onScopeDispose, onServerPrefetch, onUnmounted, queuePostFlushCb, ref, shallowRef, toRef, toValue, unref, watch } from "vue";
import { asyncDataDefaults, granularCachedData, pendingWhenIdle, purgeCachedData, tracingChannelNuxt } from "#build/nuxt.config.mjs";
//#region src/app/composables/asyncData.ts
const createUseAsyncData = defineKeyedFunctionFactory({
	name: "createUseAsyncData",
	factory(options = {}) {
		function useAsyncData(...args) {
			const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
			if (_isAutoKeyNeeded(args[0], args[1])) args.unshift(autoKey);
			let [_key, _handler, opts = {}] = args;
			let keyChanging = false;
			/** True if key is a Ref or getter; false for static string. When false, key watcher is skipped. */
			const isKeyReactive = isRef(_key) || typeof _key === "function";
			const key = isKeyReactive ? computed(() => toValue(_key)) : { value: _key };
			if (!key.value || typeof key.value !== "string") throw dataDiagnostics.NUXT_E3008();
			if (typeof _handler !== "function") throw dataDiagnostics.NUXT_E3009();
			const shouldFactoryOptionsOverride = typeof options === "function";
			const nuxtApp = useNuxtApp();
			const factoryOptions = shouldFactoryOptionsOverride ? options(opts) : options;
			if (!shouldFactoryOptionsOverride) for (const key in factoryOptions) {
				if (factoryOptions[key] === void 0) continue;
				if (opts[key] !== void 0) continue;
				opts[key] = factoryOptions[key];
			}
			opts.server ??= true;
			opts.default ??= getDefault;
			opts.getCachedData ??= getDefaultCachedData;
			opts.lazy ??= false;
			opts.immediate ??= true;
			opts.deep ??= asyncDataDefaults.deep;
			opts.dedupe ??= "cancel";
			opts.enabled ??= true;
			if (shouldFactoryOptionsOverride) for (const key in factoryOptions) {
				if (factoryOptions[key] === void 0) continue;
				opts[key] = factoryOptions[key];
			}
			const currentData = nuxtApp._asyncData[key.value];
			if (import.meta.dev && currentData) {
				const warnings = [];
				const values = createHash(_handler, opts);
				if (values.handler !== currentData._hash?.handler) warnings.push(`different handler`);
				for (const opt of [
					"transform",
					"pick",
					"getCachedData"
				]) if (values[opt] !== currentData._hash[opt]) warnings.push(`different \`${opt}\` option`);
				if (currentData._default.toString() !== opts.default.toString()) warnings.push(`different \`default\` value`);
				if (opts.deep && isShallow(currentData.data)) warnings.push(`mismatching \`deep\` option`);
				if (warnings.length) {
					const caller = getUserCaller();
					dataDiagnostics.NUXT_E3004({
						key: key.value,
						warnings: warnings.map((w) => `- ${w}`).join("\n"),
						sources: caller ? [`${caller.source}:${caller.line}:${caller.column}`] : void 0
					});
				}
			}
			function createInitialFetch() {
				const initialFetchOptions = {
					cause: "initial",
					dedupe: opts.dedupe
				};
				const existing = nuxtApp._asyncData[key.value];
				if (!existing?._init) {
					initialFetchOptions.cachedData = opts.getCachedData(key.value, nuxtApp, { cause: "initial" });
					nuxtApp._asyncData[key.value] = buildAsyncData(nuxtApp, key.value, _handler, opts, initialFetchOptions.cachedData);
					nuxtApp._asyncData[key.value]._initialCachedData = initialFetchOptions.cachedData;
				} else if (nuxtApp._asyncDataPromises[key.value]) initialFetchOptions.cachedData = existing._initialCachedData;
				return () => nuxtApp._asyncData[key.value].execute(initialFetchOptions);
			}
			const initialFetch = createInitialFetch();
			const asyncData = nuxtApp._asyncData[key.value];
			asyncData._deps++;
			const fetchOnServer = opts.server !== false && nuxtApp.payload.serverRendered;
			if (import.meta.server && fetchOnServer && opts.immediate) {
				const promise = initialFetch();
				if (getCurrentInstance()) onServerPrefetch(() => promise);
				else nuxtApp.hook("app:created", async () => {
					await promise;
				});
			}
			if (import.meta.client) {
				const instance = getCurrentInstance();
				if (instance && fetchOnServer && opts.immediate && !instance.sp) instance.sp = [];
				if (import.meta.dev && !nuxtApp.isHydrating && !nuxtApp._processingMiddleware && (!instance || instance?.isMounted)) dataDiagnostics.NUXT_E3003();
				if (instance && !instance._nuxtOnBeforeMountCbs) {
					instance._nuxtOnBeforeMountCbs = [];
					const cbs = instance._nuxtOnBeforeMountCbs;
					onBeforeMount(() => {
						cbs.forEach((cb) => {
							cb();
						});
						cbs.splice(0, cbs.length);
					});
					onUnmounted(() => cbs.splice(0, cbs.length));
				}
				const isWithinClientOnly = instance && (instance._nuxtClientOnly || inject(clientOnlySymbol, false));
				if (fetchOnServer && nuxtApp.isHydrating && (asyncData.error.value || asyncData.data.value !== void 0)) {
					if (pendingWhenIdle) asyncData.pending.value = false;
					asyncData.status.value = asyncData.error.value ? "error" : "success";
				} else if (instance && (!isWithinClientOnly && nuxtApp.payload.serverRendered && nuxtApp.isHydrating || opts.lazy) && opts.immediate) instance._nuxtOnBeforeMountCbs.push(initialFetch);
				else if (opts.immediate && asyncData.status.value !== "success") initialFetch();
				function unregister(key) {
					const data = nuxtApp._asyncData[key];
					if (data?._deps) {
						data._deps--;
						if (data._deps === 0) data?._off();
					}
				}
				const hasScope = getCurrentScope();
				const noop = () => {};
				const unsubKeyWatcher = isKeyReactive ? watch(key, (newKey, oldKey) => {
					if ((newKey || oldKey) && newKey !== oldKey) {
						keyChanging = true;
						const hadData = nuxtApp._asyncData[oldKey]?.data.value !== void 0;
						const wasRunning = nuxtApp._asyncDataPromises[oldKey] !== void 0;
						const initialFetchOptions = {
							cause: "initial",
							dedupe: opts.dedupe
						};
						if (!nuxtApp._asyncData[newKey]?._init) {
							const cachedData = opts.getCachedData(newKey, nuxtApp, { cause: "initial" });
							initialFetchOptions.cachedData = cachedData;
							const initialValue = oldKey && hadData && cachedData === void 0 ? nuxtApp._asyncData[oldKey].data.value : cachedData;
							nuxtApp._asyncData[newKey] = buildAsyncData(nuxtApp, newKey, _handler, opts, initialValue);
							nuxtApp._asyncData[newKey]._initialCachedData = cachedData;
						}
						nuxtApp._asyncData[newKey]._deps++;
						if (oldKey) unregister(oldKey);
						if (opts._keyTriggersExecute !== false && (opts.immediate || hadData || wasRunning)) nuxtApp._asyncData[newKey].execute(initialFetchOptions);
						queuePostFlushCb(() => {
							keyChanging = false;
						});
					}
				}, { flush: "sync" }) : noop;
				const unsubParamsWatcher = opts.watch ? watch(opts.watch, () => {
					if (keyChanging) return;
					nuxtApp._asyncData[key.value]?._execute({
						cause: "watch",
						dedupe: opts.dedupe
					});
				}) : noop;
				const unsubEnabledWatcher = isRef(opts.enabled) || typeof opts.enabled === "function" ? watch(() => toValue(opts.enabled), (isEnabled) => {
					const entry = nuxtApp._asyncData[key.value];
					if (isEnabled || !entry || !nuxtApp._asyncDataPromises[key.value]) return;
					entry._abortController?.abort(new DOMException("AsyncData request cancelled by `enabled: false`", "AbortError"));
					entry._abortController = void 0;
					delete nuxtApp._asyncDataPromises[key.value];
					if (pendingWhenIdle) entry.pending.value = false;
					entry.status.value = "idle";
				}) : noop;
				if (hasScope) onScopeDispose(() => {
					unsubKeyWatcher();
					unsubParamsWatcher();
					unsubEnabledWatcher();
					unregister(key.value);
				});
			}
			const asyncReturn = {
				data: writableComputedRef(() => nuxtApp._asyncData[key.value]?.data),
				pending: writableComputedRef(() => nuxtApp._asyncData[key.value]?.pending),
				status: writableComputedRef(() => nuxtApp._asyncData[key.value]?.status),
				error: writableComputedRef(() => nuxtApp._asyncData[key.value]?.error),
				refresh: (...args) => {
					if (!nuxtApp._asyncData[key.value]?._init) return createInitialFetch()();
					return nuxtApp._asyncData[key.value].execute(...args);
				},
				execute: (...args) => asyncReturn.refresh(...args),
				clear: () => {
					const entry = nuxtApp._asyncData[key.value];
					if (entry?._abortController) try {
						entry._abortController.abort(new DOMException("AsyncData aborted by user.", "AbortError"));
					} finally {
						entry._abortController = void 0;
					}
					clearNuxtDataByKey(nuxtApp, key.value);
				}
			};
			const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key.value]).then(() => asyncReturn);
			Object.assign(asyncDataPromise, asyncReturn);
			Object.defineProperties(asyncDataPromise, {
				then: {
					enumerable: true,
					value: asyncDataPromise.then.bind(asyncDataPromise)
				},
				catch: {
					enumerable: true,
					value: asyncDataPromise.catch.bind(asyncDataPromise)
				},
				finally: {
					enumerable: true,
					value: asyncDataPromise.finally.bind(asyncDataPromise)
				}
			});
			return asyncDataPromise;
		}
		return useAsyncData;
	}
});
const useAsyncData = createUseAsyncData.__nuxt_factory();
const useLazyAsyncData = createUseAsyncData.__nuxt_factory({
	lazy: true,
	_functionName: "useLazyAsyncData"
});
function writableComputedRef(getter) {
	return computed({
		get() {
			return getter()?.value;
		},
		set(value) {
			const ref = getter();
			if (ref) ref.value = value;
		}
	});
}
function _isAutoKeyNeeded(keyOrFetcher, fetcher) {
	if (typeof keyOrFetcher === "string") return false;
	if (typeof keyOrFetcher === "object" && keyOrFetcher !== null) return false;
	if (typeof keyOrFetcher === "function" && typeof fetcher === "function") return false;
	return true;
}
/** @since 3.1.0 */
function useNuxtData(key) {
	const nuxtApp = useNuxtApp();
	if (!(key in nuxtApp.payload.data)) nuxtApp.payload.data[key] = void 0;
	if (nuxtApp._asyncData[key]) {
		const data = nuxtApp._asyncData[key];
		data._deps++;
		if (getCurrentScope()) onScopeDispose(() => {
			data._deps--;
			if (data._deps === 0) data?._off();
		});
	}
	return { data: computed({
		get() {
			return nuxtApp._asyncData[key]?.data.value ?? nuxtApp.payload.data[key];
		},
		set(value) {
			if (nuxtApp._asyncData[key]) nuxtApp._asyncData[key].data.value = value;
			else nuxtApp.payload.data[key] = value;
		}
	}) };
}
/** @since 3.0.0 */
async function refreshNuxtData(keys) {
	if (import.meta.server) return Promise.resolve();
	const nuxtApp = useNuxtApp();
	if (nuxtApp.isHydrating) await new Promise((resolve) => onNuxtReady(resolve));
	const _keys = keys ? toArray(keys) : void 0;
	await nuxtApp.hooks.callHookParallel("app:data:refresh", _keys);
}
/** @since 3.0.0 */
function clearNuxtData(keys) {
	const nuxtApp = useNuxtApp();
	const _allKeys = Object.keys(nuxtApp.payload.data);
	const _keys = !keys ? _allKeys : typeof keys === "function" ? _allKeys.filter(keys) : toArray(keys);
	for (const key of _keys) clearNuxtDataByKey(nuxtApp, key);
}
function clearNuxtDataByKey(nuxtApp, key) {
	delete nuxtApp.payload.data[key];
	delete nuxtApp.payload._errors[key];
	if (nuxtApp._asyncData[key]) {
		nuxtApp._asyncData[key].data.value = unref(nuxtApp._asyncData[key]._default());
		nuxtApp._asyncData[key].error.value = void 0;
		if (pendingWhenIdle) nuxtApp._asyncData[key].pending.value = false;
		nuxtApp._asyncData[key].status.value = "idle";
		nuxtApp._asyncData[key]._initialCachedData = void 0;
	}
	delete nuxtApp._asyncDataPromises[key];
}
function pick(obj, keys) {
	const newObj = {};
	for (const key of keys) newObj[key] = obj[key];
	return newObj;
}
function buildAsyncData(nuxtApp, key, _handler, options, initialCachedData) {
	nuxtApp.payload._errors[key] ??= void 0;
	const hasCustomGetCachedData = options.getCachedData !== getDefaultCachedData;
	const baseHandler = import.meta.client || !import.meta.prerender || !nuxtApp.ssrContext?.["~sharedPrerenderCache"] ? _handler : (nuxtApp, options) => {
		const value = nuxtApp.ssrContext["~sharedPrerenderCache"].get(key);
		if (value) return value;
		const promise = Promise.resolve().then(() => nuxtApp.runWithContext(() => _handler(nuxtApp, options)));
		nuxtApp.ssrContext["~sharedPrerenderCache"].set(key, promise);
		return promise;
	};
	const handler = import.meta.server && tracingChannelNuxt ? (nuxtApp, opts) => traceAsync("nuxt.data", {
		key,
		functionName: options._functionName
	}, () => Promise.resolve(baseHandler(nuxtApp, opts))) : baseHandler;
	const _ref = options.deep ? ref : shallowRef;
	const hasCachedData = initialCachedData !== void 0;
	const unsubRefreshAsyncData = nuxtApp.hook("app:data:refresh", async (keys) => {
		if (!keys || keys.includes(key)) await asyncData.execute({ cause: "refresh:hook" });
	});
	const asyncData = {
		data: _ref(hasCachedData ? initialCachedData : options.default()),
		pending: pendingWhenIdle ? shallowRef(!hasCachedData) : computed(() => asyncData.status.value === "pending"),
		error: toRef(nuxtApp.payload._errors, key),
		status: shallowRef("idle"),
		execute: (...args) => {
			const [_opts, newValue = void 0] = args;
			const opts = _opts && newValue === void 0 && typeof _opts === "object" ? _opts : {};
			if (import.meta.dev && newValue !== void 0 && (!_opts || typeof _opts !== "object")) dataDiagnostics.NUXT_E3005();
			if (nuxtApp._asyncDataPromises[key]) {
				if ((opts.dedupe ?? options.dedupe) === "defer") return nuxtApp._asyncDataPromises[key];
			}
			if (granularCachedData || opts.cause === "initial" || nuxtApp.isHydrating) {
				const cachedData = "cachedData" in opts ? opts.cachedData : options.getCachedData(key, nuxtApp, { cause: opts.cause ?? "refresh:manual" });
				if (cachedData !== void 0) {
					nuxtApp.payload.data[key] = asyncData.data.value = cachedData;
					asyncData.error.value = void 0;
					asyncData.status.value = "success";
					return Promise.resolve(cachedData);
				}
			}
			if (toValue(options.enabled) === false) return Promise.resolve(asyncData.data.value);
			if (pendingWhenIdle) asyncData.pending.value = true;
			if (asyncData._abortController) asyncData._abortController.abort(new DOMException("AsyncData request cancelled by deduplication", "AbortError"));
			asyncData._abortController = new AbortController();
			asyncData.status.value = "pending";
			const cleanupController = new AbortController();
			const promise = new Promise((resolve, reject) => {
				try {
					const timeout = opts.timeout ?? options.timeout;
					const mergedSignal = mergeAbortSignals([asyncData._abortController?.signal, opts?.signal], cleanupController.signal, timeout);
					if (mergedSignal.aborted) {
						const reason = mergedSignal.reason;
						reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
						return;
					}
					mergedSignal.addEventListener("abort", () => {
						const reason = mergedSignal.reason;
						reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
					}, {
						once: true,
						signal: cleanupController.signal
					});
					return Promise.resolve(handler(nuxtApp, { signal: mergedSignal })).then(resolve, reject);
				} catch (err) {
					reject(err);
				}
			}).then(async (_result) => {
				if (nuxtApp._asyncDataPromises[key] !== promise) return;
				let result = _result;
				if (options.transform) result = await options.transform(_result);
				if (options.pick) result = pick(result, options.pick);
				if (import.meta.dev && import.meta.server && typeof result === "undefined") {
					const caller = getUserCaller();
					dataDiagnostics.NUXT_E3006({
						fn: options._functionName || "useAsyncData",
						sources: caller ? [`${caller.source}:${caller.line}:${caller.column}`] : void 0
					});
				}
				nuxtApp.payload.data[key] = result;
				asyncData.data.value = result;
				asyncData.error.value = void 0;
				asyncData.status.value = "success";
			}).catch((error) => {
				if (nuxtApp._asyncDataPromises[key] !== promise) return nuxtApp._asyncDataPromises[key];
				if (asyncData._abortController?.signal.aborted) return nuxtApp._asyncDataPromises[key];
				if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") {
					asyncData.status.value = "idle";
					return nuxtApp._asyncDataPromises[key];
				}
				asyncData.error.value = createError(error);
				asyncData.data.value = unref(options.default());
				asyncData.status.value = "error";
			}).finally(() => {
				cleanupController.abort();
				if (nuxtApp._asyncDataPromises[key] === promise) {
					if (pendingWhenIdle) asyncData.pending.value = false;
					delete nuxtApp._asyncDataPromises[key];
				}
			});
			nuxtApp._asyncDataPromises[key] = promise;
			return nuxtApp._asyncDataPromises[key];
		},
		_execute: debounceTick((...args) => asyncData.execute(...args)),
		_default: options.default,
		_deps: 0,
		_init: true,
		_hash: import.meta.dev ? createHash(_handler, options) : void 0,
		_off: () => {
			unsubRefreshAsyncData();
			if (nuxtApp._asyncData[key]?._init) nuxtApp._asyncData[key]._init = false;
			if (nuxtApp._asyncDataPromises[key]) {
				asyncData._abortController?.abort(new DOMException("AsyncData request cancelled by unmount", "AbortError"));
				delete nuxtApp._asyncDataPromises[key];
				if (asyncData.status.value === "pending") asyncData.status.value = "idle";
				if (pendingWhenIdle) asyncData.pending.value = false;
			}
			if (purgeCachedData && !hasCustomGetCachedData) nextTick(() => {
				if (!nuxtApp._asyncData[key]?._init) {
					clearNuxtDataByKey(nuxtApp, key);
					asyncData.execute = () => Promise.resolve();
				}
			});
		}
	};
	return asyncData;
}
const getDefault = () => void 0;
const getDefaultCachedData = (key, nuxtApp, ctx) => {
	if (nuxtApp.isHydrating) return nuxtApp.payload.data[key];
	if (ctx.cause !== "refresh:manual" && ctx.cause !== "refresh:hook") return nuxtApp.static.data[key];
};
function createHash(_handler, options) {
	return {
		handler: hashFunction(_handler),
		transform: options.transform ? hashFunction(options.transform) : void 0,
		pick: options.pick ? hashKey(options.pick) : void 0,
		getCachedData: options.getCachedData ? hashFunction(options.getCachedData) : void 0
	};
}
function mergeAbortSignals(signals, cleanupSignal, timeout) {
	const list = signals.filter((s) => !!s);
	if (typeof timeout === "number" && timeout >= 0) {
		const timeoutSignal = AbortSignal.timeout?.(timeout);
		if (timeoutSignal) list.push(timeoutSignal);
	}
	if (AbortSignal.any) return AbortSignal.any(list);
	const controller = new AbortController();
	for (const sig of list) if (sig.aborted) {
		const reason = sig.reason ?? new DOMException("Aborted", "AbortError");
		try {
			controller.abort(reason);
		} catch {
			controller.abort();
		}
		return controller.signal;
	}
	const onAbort = () => {
		const reason = list.find((s) => s.aborted)?.reason ?? new DOMException("Aborted", "AbortError");
		try {
			controller.abort(reason);
		} catch {
			controller.abort();
		}
	};
	for (const sig of list) sig.addEventListener?.("abort", onAbort, {
		once: true,
		signal: cleanupSignal
	});
	return controller.signal;
}
//#endregion
export { clearNuxtData, createUseAsyncData, refreshNuxtData, useAsyncData, useLazyAsyncData, useNuxtData };
