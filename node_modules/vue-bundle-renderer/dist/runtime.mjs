import { withLeadingSlash } from "ufo";
//#region src/runtime.ts
const MAX_INITIAL_SLOTS = 8192;
function createMergeSlots(capacity = 16) {
	return {
		slotOf: Object.create(null),
		count: 0,
		idOf: [],
		metaOf: [],
		scripts: new Uint8Array(capacity),
		styles: new Uint8Array(capacity),
		preload: new Uint8Array(capacity),
		prefetch: new Uint8Array(capacity),
		epoch: 0
	};
}
function slotFor(slots, id, meta) {
	let slot = slots.slotOf[id];
	if (slot === void 0) {
		slot = slots.count++;
		slots.slotOf[id] = slot;
		slots.idOf.push(id);
		slots.metaOf.push(meta);
		if (slot >= slots.scripts.length) {
			const capacity = slots.scripts.length * 2;
			for (const kind of [
				"scripts",
				"styles",
				"preload",
				"prefetch"
			]) {
				const grown = new Uint8Array(capacity);
				grown.set(slots[kind]);
				slots[kind] = grown;
			}
		}
	}
	return slot;
}
function createFragmentCaches() {
	return {
		style: [],
		script: [],
		preloadHint: [],
		prefetchHint: [],
		preloadHeader: [],
		prefetchHeader: [],
		href: []
	};
}
function createRendererContext({ manifest, precomputed, buildAssetsURL, dependencySetsCacheSize }) {
	if (!manifest && !precomputed) throw new Error("Either manifest or precomputed data must be provided");
	const cacheSize = typeof dependencySetsCacheSize === "number" && Number.isFinite(dependencySetsCacheSize) && dependencySetsCacheSize > 0 ? Math.floor(dependencySetsCacheSize) : dependencySetsCacheSize === void 0 ? 1e3 : 0;
	const entrypoints = [];
	let slotCapacity = 16;
	if (precomputed) slotCapacity = precomputed.resourceCount ?? 16;
	else if (manifest) for (const id in manifest) {
		slotCapacity++;
		if (manifest[id].isEntry) entrypoints.push(id);
	}
	const ctx = {
		buildAssetsURL: buildAssetsURL || withLeadingSlash,
		manifest,
		precomputed,
		updateManifest,
		_dependencies: {},
		_dependencySets: /* @__PURE__ */ new Map(),
		_dependencySetAliases: /* @__PURE__ */ new Map(),
		_aliasIdHashes: Object.create(null),
		_aliasIdHashCount: 0,
		_dependencySetsCacheSize: cacheSize,
		_entrypoints: [],
		_renderedCache: /* @__PURE__ */ new WeakMap(),
		_fragments: createFragmentCaches(),
		_flatDependencies: Object.create(null),
		_mergeSlots: createMergeSlots(Math.min(slotCapacity, MAX_INITIAL_SLOTS)),
		_idScratch: []
	};
	function updateManifest(manifest) {
		ctx.manifest = manifest;
		ctx._dependencies = {};
		ctx._dependencySets.clear();
		ctx._dependencySetAliases.clear();
		ctx._aliasIdHashes = Object.create(null);
		ctx._aliasIdHashCount = 0;
		ctx._renderedCache = /* @__PURE__ */ new WeakMap();
		ctx._fragments = createFragmentCaches();
		ctx._flatDependencies = Object.create(null);
		let capacity = 16;
		const entrypoints = [];
		for (const id in manifest) {
			capacity++;
			if (manifest[id].isEntry) entrypoints.push(id);
		}
		ctx._mergeSlots = createMergeSlots(Math.min(capacity, MAX_INITIAL_SLOTS));
		ctx._entrypoints = entrypoints;
	}
	if (precomputed) {
		ctx._dependencies = precomputed.dependencies;
		ctx._entrypoints = precomputed.entrypoints;
	} else if (manifest) ctx._entrypoints = entrypoints;
	return ctx;
}
function getModuleDependencies(id, rendererContext) {
	if (rendererContext._dependencies[id]) return rendererContext._dependencies[id];
	const dependencies = rendererContext._dependencies[id] = {
		scripts: {},
		styles: {},
		preload: {},
		prefetch: {}
	};
	if (!rendererContext.manifest) return dependencies;
	const meta = rendererContext.manifest[id];
	if (!meta) return dependencies;
	if (meta.file) {
		if (meta.preload) dependencies.preload[id] = meta;
		if (meta.isEntry || meta.sideEffects) dependencies.scripts[id] = meta;
	}
	for (const css of meta.css || []) {
		const cssResource = rendererContext.manifest[css];
		dependencies.styles[css] = dependencies.prefetch[css] = cssResource;
		if (cssResource.preload) dependencies.preload[css] = cssResource;
	}
	for (const asset of meta.assets || []) {
		const assetResource = rendererContext.manifest[asset];
		dependencies.prefetch[asset] = assetResource;
		if (assetResource.preload) dependencies.preload[asset] = assetResource;
	}
	if (meta.imports) for (const depId of meta.imports) {
		const depDeps = getModuleDependencies(depId, rendererContext);
		Object.assign(dependencies.styles, depDeps.styles);
		Object.assign(dependencies.preload, depDeps.preload);
		Object.assign(dependencies.prefetch, depDeps.prefetch);
	}
	return dependencies;
}
/** Past this, the table is dropped wholesale; stale alias keys stop matching. */
const MAX_ALIAS_ID_HASHES = 65536;
function aliasHash(rendererContext, entrypoints, requestIds) {
	let hashes = rendererContext._aliasIdHashes;
	if (rendererContext._aliasIdHashCount > MAX_ALIAS_ID_HASHES) {
		hashes = rendererContext._aliasIdHashes = Object.create(null);
		rendererContext._aliasIdHashCount = 0;
		rendererContext._dependencySetAliases.clear();
	}
	let sum = 0;
	let mixed = 1;
	let count = 0;
	for (const id of entrypoints) {
		let hash = hashes[id];
		if (hash === void 0) {
			hash = rendererContext._aliasIdHashCount++ * 2654435761 | 0;
			hashes[id] = hash;
		}
		sum = sum + hash | 0;
		mixed = mixed ^ hash + count | 0;
		count++;
	}
	if (requestIds) for (const id of requestIds) {
		let hash = hashes[id];
		if (hash === void 0) {
			hash = rendererContext._aliasIdHashCount++ * 2654435761 | 0;
			hashes[id] = hash;
		}
		sum = sum + hash | 0;
		mixed = mixed ^ hash + count | 0;
		count++;
	}
	return Math.imul(sum, 2654435761) ^ Math.imul(mixed, 40503) ^ count | 0;
}
function readAlias(rendererContext, aliasKey, moduleIds, entrypoints, requestIds) {
	const entry = rendererContext._dependencySetAliases.get(aliasKey);
	if (entry === void 0) return;
	const { ids } = entry;
	let i = 0;
	if (moduleIds) {
		if (moduleIds.length !== ids.length) return;
		for (; i < moduleIds.length; i++) if (ids[i] !== moduleIds[i]) return;
		return entry.deps;
	}
	for (const id of entrypoints) if (ids[i++] !== id) return;
	if (requestIds) {
		for (const id of requestIds) if (ids[i++] !== id) return;
	}
	return i === ids.length ? entry.deps : void 0;
}
function setAlias(rendererContext, aliasKey, ids, deps, cacheSize) {
	const aliases = rendererContext._dependencySetAliases;
	aliases.set(aliasKey, {
		ids: [...ids],
		deps
	});
	if (aliases.size > cacheSize) {
		const oldest = aliases.keys().next().value;
		if (oldest !== void 0) aliases.delete(oldest);
	}
}
function collectInto(source, slots, mergeSlots) {
	for (const id in source) slots.push(slotFor(mergeSlots, id, source[id]));
}
/** A module's own styles are never preloaded; cross-module overlap is filtered per request. */
function collectPreload(deps, slots, mergeSlots) {
	const { styles, preload } = deps;
	for (const id in preload) {
		if (id in styles) continue;
		slots.push(slotFor(mergeSlots, id, preload[id]));
	}
}
/** Opt-out and a module's own preload and styles are fixed; cross-module overlap is not. */
function collectPrefetch(deps, source, slots, seen, mergeSlots) {
	const { styles, preload } = deps;
	for (const id in source) {
		const meta = source[id];
		if (!meta.prefetch || id in preload || id in styles) continue;
		const slot = slotFor(mergeSlots, id, meta);
		if (seen.has(slot)) continue;
		seen.add(slot);
		slots.push(slot);
	}
}
function getFlatDependencies(id, rendererContext) {
	const cached = rendererContext._flatDependencies[id];
	if (cached !== void 0) return cached;
	const deps = getModuleDependencies(id, rendererContext);
	const mergeSlots = rendererContext._mergeSlots;
	const flat = {
		scriptSlots: [],
		styleSlots: [],
		preloadSlots: [],
		prefetchSlots: []
	};
	collectInto(deps.scripts, flat.scriptSlots, mergeSlots);
	collectInto(deps.styles, flat.styleSlots, mergeSlots);
	collectPreload(deps, flat.preloadSlots, mergeSlots);
	const prefetchSeen = /* @__PURE__ */ new Set();
	collectPrefetch(deps, deps.prefetch, flat.prefetchSlots, prefetchSeen, mergeSlots);
	const dynamicImports = rendererContext.manifest?.[id]?.dynamicImports || rendererContext.precomputed?.modules[id]?.dynamicImports;
	if (dynamicImports) for (const dynamicDepId of dynamicImports) {
		const dynamicDeps = getModuleDependencies(dynamicDepId, rendererContext);
		collectPrefetch(deps, dynamicDeps.scripts, flat.prefetchSlots, prefetchSeen, mergeSlots);
		collectPrefetch(deps, dynamicDeps.styles, flat.prefetchSlots, prefetchSeen, mergeSlots);
		collectPrefetch(deps, dynamicDeps.preload, flat.prefetchSlots, prefetchSeen, mergeSlots);
	}
	rendererContext._flatDependencies[id] = flat;
	return flat;
}
function getAllDependencies(ids, rendererContext) {
	const cacheSize = rendererContext._dependencySetsCacheSize;
	const moduleIds = rendererContext._idScratch;
	moduleIds.length = 0;
	for (const id of ids) moduleIds.push(id);
	let aliasKey = 0;
	let hasAlias = false;
	if (cacheSize > 0 && ids.size > 1) {
		aliasKey = aliasHash(rendererContext, moduleIds, void 0);
		hasAlias = true;
		const aliased = readAlias(rendererContext, aliasKey, moduleIds, moduleIds, void 0);
		if (aliased !== void 0) return aliased;
	}
	return resolveDependencies(moduleIds, rendererContext, aliasKey, hasAlias);
}
/** The id list may contain duplicates: merging deduplicates at resource level. */
function resolveDependencies(moduleIds, rendererContext, aliasKey, hasAlias) {
	const cacheSize = rendererContext._dependencySetsCacheSize;
	const useCache = cacheSize > 0;
	let cacheKey = "";
	if (useCache) {
		if (moduleIds.length <= 1) cacheKey = moduleIds[0] || "";
		else cacheKey = [...new Set(moduleIds)].sort().join(",");
		const cached = rendererContext._dependencySets.get(cacheKey);
		if (cached !== void 0) {
			if (rendererContext._dependencySets.size >= cacheSize) {
				rendererContext._dependencySets.delete(cacheKey);
				rendererContext._dependencySets.set(cacheKey, cached);
			}
			if (hasAlias) setAlias(rendererContext, aliasKey, moduleIds, cached, cacheSize);
			return cached;
		}
	}
	const styleSlots = [];
	const scriptSlots = [];
	const preloadSlots = [];
	const prefetchSlots = [];
	const mergeSlots = rendererContext._mergeSlots;
	let epoch = mergeSlots.epoch + 1;
	if (epoch > 255) {
		epoch = 1;
		mergeSlots.scripts.fill(0);
		mergeSlots.styles.fill(0);
		mergeSlots.preload.fill(0);
		mergeSlots.prefetch.fill(0);
	}
	mergeSlots.epoch = epoch;
	let scriptSeen = mergeSlots.scripts;
	let styleSeen = mergeSlots.styles;
	let preloadSeen = mergeSlots.preload;
	let prefetchSeen = mergeSlots.prefetch;
	for (let m = 0; m < moduleIds.length; m++) {
		const flat = getFlatDependencies(moduleIds[m], rendererContext);
		if (mergeSlots.scripts !== scriptSeen) {
			scriptSeen = mergeSlots.scripts;
			styleSeen = mergeSlots.styles;
			preloadSeen = mergeSlots.preload;
			prefetchSeen = mergeSlots.prefetch;
		}
		for (let i = 0; i < flat.scriptSlots.length; i++) {
			const slot = flat.scriptSlots[i];
			if (scriptSeen[slot] === epoch) continue;
			scriptSeen[slot] = epoch;
			scriptSlots.push(slot);
		}
		for (let i = 0; i < flat.styleSlots.length; i++) {
			const slot = flat.styleSlots[i];
			if (styleSeen[slot] === epoch) continue;
			styleSeen[slot] = epoch;
			styleSlots.push(slot);
		}
		for (let i = 0; i < flat.preloadSlots.length; i++) {
			const slot = flat.preloadSlots[i];
			if (preloadSeen[slot] === epoch) continue;
			preloadSeen[slot] = epoch;
			preloadSlots.push(slot);
		}
		for (let i = 0; i < flat.prefetchSlots.length; i++) {
			const slot = flat.prefetchSlots[i];
			if (prefetchSeen[slot] === epoch) continue;
			prefetchSeen[slot] = epoch;
			prefetchSlots.push(slot);
		}
	}
	let kept = 0;
	for (let i = 0; i < preloadSlots.length; i++) {
		const slot = preloadSlots[i];
		if (styleSeen[slot] !== epoch) {
			preloadSlots[kept] = slot;
			kept++;
		}
	}
	preloadSlots.length = kept;
	kept = 0;
	const metaOf = mergeSlots.metaOf;
	for (let i = 0; i < prefetchSlots.length; i++) {
		const slot = prefetchSlots[i];
		if (metaOf[slot].prefetch && preloadSeen[slot] !== epoch && styleSeen[slot] !== epoch) {
			prefetchSlots[kept] = slot;
			kept++;
		}
	}
	prefetchSlots.length = kept;
	const order = {
		styleSlots,
		scriptSlots,
		preloadSlots,
		prefetchSlots,
		mergeSlots
	};
	const allDeps = new Proxy({ [SLOT_SOURCE]: order }, LAZY_DEPENDENCIES);
	rendererContext._renderedCache.set(allDeps, { order });
	if (useCache) {
		rendererContext._dependencySets.set(cacheKey, allDeps);
		if (rendererContext._dependencySets.size > cacheSize) {
			const oldest = rendererContext._dependencySets.keys().next().value;
			if (oldest !== void 0) rendererContext._dependencySets.delete(oldest);
		}
		if (hasAlias) setAlias(rendererContext, aliasKey, moduleIds, allDeps, cacheSize);
	}
	return allDeps;
}
function getRequestDependencies(ssrContext, rendererContext, options) {
	const excluded = options?.exclude ? new Set(options.exclude) : void 0;
	const hasExcluded = excluded && excluded.size > 0;
	if (!hasExcluded && ssrContext._requestDependencies) return ssrContext._requestDependencies;
	const requestIds = ssrContext.modules || ssrContext._registeredComponents;
	let aliasKey = 0;
	let hasAlias = false;
	if (!hasExcluded && rendererContext._dependencySetsCacheSize > 0) {
		aliasKey = aliasHash(rendererContext, rendererContext._entrypoints, requestIds);
		hasAlias = true;
		const aliased = readAlias(rendererContext, aliasKey, void 0, rendererContext._entrypoints, requestIds);
		if (aliased !== void 0) {
			ssrContext._requestDependencies = aliased;
			return aliased;
		}
	}
	const moduleIds = rendererContext._idScratch;
	moduleIds.length = 0;
	if (hasExcluded) {
		for (const id of rendererContext._entrypoints) if (!excluded.has(id)) moduleIds.push(id);
		if (requestIds) {
			for (const id of requestIds) if (!excluded.has(id)) moduleIds.push(id);
		}
	} else {
		for (const id of rendererContext._entrypoints) moduleIds.push(id);
		if (requestIds) for (const id of requestIds) moduleIds.push(id);
	}
	const deps = resolveDependencies(moduleIds, rendererContext, aliasKey, hasAlias);
	if (!hasExcluded) ssrContext._requestDependencies = deps;
	return deps;
}
function getRenderedOutputs(rendererContext, deps) {
	let entry = rendererContext._renderedCache.get(deps);
	if (!entry) {
		entry = {};
		rendererContext._renderedCache.set(deps, entry);
	}
	return entry;
}
const SLOT_SOURCE = Symbol("slots");
const SLOTS_FOR = {
	scripts: "scriptSlots",
	styles: "styleSlots",
	preload: "preloadSlots",
	prefetch: "prefetchSlots"
};
/** Records are built on first access; rendering reads the slot arrays directly. */
const LAZY_DEPENDENCIES = {
	get(target, key) {
		const value = target[key];
		if (value !== void 0 || !isRecordKey(key)) return value;
		return materialiseRecord(target, key);
	},
	has(target, key) {
		return isRecordKey(key) || key in target;
	},
	ownKeys(target) {
		const extra = Reflect.ownKeys(target).filter((key) => key !== SLOT_SOURCE && !isRecordKey(key));
		return extra.length > 0 ? [...RECORD_KEYS, ...extra] : RECORD_KEYS.slice();
	},
	getOwnPropertyDescriptor(target, key) {
		if (!isRecordKey(key)) return key === SLOT_SOURCE ? void 0 : Reflect.getOwnPropertyDescriptor(target, key);
		return {
			value: target[key] ?? materialiseRecord(target, key),
			writable: true,
			enumerable: true,
			configurable: true
		};
	},
	set(target, key, value) {
		target[key] = value;
		return true;
	},
	deleteProperty(target, key) {
		return Reflect.deleteProperty(target, key);
	}
};
const RECORD_KEYS = [
	"scripts",
	"styles",
	"preload",
	"prefetch"
];
function isRecordKey(key) {
	return key === "scripts" || key === "styles" || key === "preload" || key === "prefetch";
}
function materialiseRecord(target, key) {
	const order = target[SLOT_SOURCE];
	const record = buildRecord(order.mergeSlots, order[SLOTS_FOR[key]]);
	target[key] = record;
	return record;
}
function buildRecord(mergeSlots, slots) {
	const { idOf, metaOf } = mergeSlots;
	const record = {};
	for (let i = 0; i < slots.length; i++) {
		const slot = slots[i];
		record[idOf[slot]] = metaOf[slot];
	}
	return record;
}
function collectOrder(source, slots, mergeSlots) {
	for (const id in source) slots.push(slotFor(mergeSlots, id, source[id]));
}
/** Records supplied by a caller carry no order, so derive and memoize one. */
function getOrder(rendererContext, deps, rendered) {
	if (rendered.order) return rendered.order;
	const mergeSlots = rendererContext._mergeSlots;
	const order = {
		styleSlots: [],
		scriptSlots: [],
		preloadSlots: [],
		prefetchSlots: [],
		mergeSlots
	};
	collectOrder(deps.styles, order.styleSlots, mergeSlots);
	collectOrder(deps.scripts, order.scriptSlots, mergeSlots);
	collectOrder(deps.preload, order.preloadSlots, mergeSlots);
	collectOrder(deps.prefetch, order.prefetchSlots, mergeSlots);
	rendered.order = order;
	return order;
}
function renderStyles(ssrContext, rendererContext) {
	const deps = getRequestDependencies(ssrContext, rendererContext);
	const rendered = getRenderedOutputs(rendererContext, deps);
	if (rendered.styles !== void 0) return rendered.styles;
	const order = getOrder(rendererContext, deps, rendered);
	const metaOf = rendererContext._mergeSlots.metaOf;
	let result = "";
	const cache = rendererContext._fragments.style;
	for (let i = 0; i < order.styleSlots.length; i++) {
		const slot = order.styleSlots[i];
		let fragment = cache[slot];
		if (fragment === void 0) fragment = cache[slot] = `<link rel="stylesheet" href="${rendererContext.buildAssetsURL(metaOf[slot].file)}" crossorigin>`;
		result += fragment;
	}
	rendered.styles = result;
	return result;
}
function getResources(ssrContext, rendererContext) {
	return [...getPreloadLinks(ssrContext, rendererContext), ...getPrefetchLinks(ssrContext, rendererContext)];
}
function isScriptResource(resource) {
	return !!resource.module || resource.resourceType === "script";
}
function renderResourceHints(ssrContext, rendererContext, options) {
	const deps = getRequestDependencies(ssrContext, rendererContext, options);
	const rendered = getRenderedOutputs(rendererContext, deps);
	const withScripts = options?.scripts !== false;
	const cached = withScripts ? rendered.hints : rendered.hintsWithoutScripts;
	if (cached !== void 0) return cached;
	const order = getOrder(rendererContext, deps, rendered);
	const metaOf = rendererContext._mergeSlots.metaOf;
	let result = "";
	const preloadCache = rendererContext._fragments.preloadHint;
	for (let i = 0; i < order.preloadSlots.length; i++) {
		const slot = order.preloadSlots[i];
		if (!withScripts && isScriptResource(metaOf[slot])) continue;
		let fragment = preloadCache[slot];
		if (fragment === void 0) {
			const resource = metaOf[slot];
			const href = rendererContext.buildAssetsURL(resource.file);
			const rel = resource.module ? "modulepreload" : "preload";
			const crossorigin = resource.resourceType === "style" || resource.resourceType === "font" || resource.resourceType === "script" || resource.module ? " crossorigin" : "";
			fragment = resource.resourceType && resource.mimeType ? `<link rel="${rel}" as="${resource.resourceType}" type="${resource.mimeType}"${crossorigin} href="${href}">` : resource.resourceType ? `<link rel="${rel}" as="${resource.resourceType}"${crossorigin} href="${href}">` : `<link rel="${rel}"${crossorigin} href="${href}">`;
			preloadCache[slot] = fragment;
		}
		result += fragment;
	}
	const prefetchCache = rendererContext._fragments.prefetchHint;
	for (let i = 0; i < order.prefetchSlots.length; i++) {
		const slot = order.prefetchSlots[i];
		if (!withScripts && isScriptResource(metaOf[slot])) continue;
		let fragment = prefetchCache[slot];
		if (fragment === void 0) {
			const resource = metaOf[slot];
			const href = rendererContext.buildAssetsURL(resource.file);
			const crossorigin = resource.resourceType === "style" || resource.resourceType === "font" || resource.resourceType === "script" || resource.module ? " crossorigin" : "";
			fragment = resource.resourceType && resource.mimeType ? `<link rel="prefetch" as="${resource.resourceType}" type="${resource.mimeType}"${crossorigin} href="${href}">` : resource.resourceType ? `<link rel="prefetch" as="${resource.resourceType}"${crossorigin} href="${href}">` : `<link rel="prefetch"${crossorigin} href="${href}">`;
			prefetchCache[slot] = fragment;
		}
		result += fragment;
	}
	if (withScripts) rendered.hints = result;
	else rendered.hintsWithoutScripts = result;
	return result;
}
const NON_ASCII_RE = /[^\0-\u007F]+/g;
function renderResourceHeaders(ssrContext, rendererContext, options) {
	const deps = getRequestDependencies(ssrContext, rendererContext, options);
	const rendered = getRenderedOutputs(rendererContext, deps);
	const withScripts = options?.scripts !== false;
	const cached = withScripts ? rendered.headerLink : rendered.headerLinkWithoutScripts;
	if (cached !== void 0) return { link: cached };
	const order = getOrder(rendererContext, deps, rendered);
	const metaOf = rendererContext._mergeSlots.metaOf;
	let link = "";
	const preloadCache = rendererContext._fragments.preloadHeader;
	for (let i = 0; i < order.preloadSlots.length; i++) {
		const slot = order.preloadSlots[i];
		if (!withScripts && isScriptResource(metaOf[slot])) continue;
		let header = preloadCache[slot];
		if (header === void 0) {
			const resource = metaOf[slot];
			header = `<${rendererContext.buildAssetsURL(resource.file).replace(NON_ASCII_RE, encodeURIComponent)}>; rel="${resource.module ? "modulepreload" : "preload"}"`;
			if (resource.resourceType) header += `; as="${resource.resourceType}"`;
			if (resource.mimeType) header += `; type="${resource.mimeType}"`;
			if (resource.resourceType === "style" || resource.resourceType === "font" || resource.resourceType === "script" || resource.module) header += "; crossorigin";
			preloadCache[slot] = header;
		}
		link = link ? `${link}, ${header}` : header;
	}
	const prefetchCache = rendererContext._fragments.prefetchHeader;
	for (let i = 0; i < order.prefetchSlots.length; i++) {
		const slot = order.prefetchSlots[i];
		if (!withScripts && isScriptResource(metaOf[slot])) continue;
		let header = prefetchCache[slot];
		if (header === void 0) {
			const resource = metaOf[slot];
			header = `<${rendererContext.buildAssetsURL(resource.file).replace(NON_ASCII_RE, encodeURIComponent)}>; rel="prefetch"`;
			if (resource.resourceType) header += `; as="${resource.resourceType}"`;
			if (resource.mimeType) header += `; type="${resource.mimeType}"`;
			if (resource.resourceType === "style" || resource.resourceType === "font" || resource.resourceType === "script" || resource.module) header += "; crossorigin";
			prefetchCache[slot] = header;
		}
		link = link ? `${link}, ${header}` : header;
	}
	if (withScripts) rendered.headerLink = link;
	else rendered.headerLinkWithoutScripts = link;
	return { link };
}
/** `buildAssetsURL` is a pure function of the id, so each result is built once. */
function hrefFor(rendererContext, slot, resource) {
	const cache = rendererContext._fragments.href;
	let href = cache[slot];
	if (href === void 0) href = cache[slot] = rendererContext.buildAssetsURL(resource.file);
	return href;
}
function getPreloadLinks(ssrContext, rendererContext, options) {
	const deps = getRequestDependencies(ssrContext, rendererContext, options);
	const order = getOrder(rendererContext, deps, getRenderedOutputs(rendererContext, deps));
	const metaOf = rendererContext._mergeSlots.metaOf;
	const withScripts = options?.scripts !== false;
	const result = [];
	for (let i = 0; i < order.preloadSlots.length; i++) {
		const slot = order.preloadSlots[i];
		const resource = metaOf[slot];
		if (!withScripts && isScriptResource(resource)) continue;
		result.push({
			rel: resource.module ? "modulepreload" : "preload",
			as: resource.resourceType,
			type: resource.mimeType ?? null,
			crossorigin: resource.resourceType === "style" || resource.resourceType === "font" || resource.resourceType === "script" || resource.module ? "" : null,
			href: hrefFor(rendererContext, slot, resource)
		});
	}
	return result;
}
function getPrefetchLinks(ssrContext, rendererContext, options) {
	const deps = getRequestDependencies(ssrContext, rendererContext, options);
	const order = getOrder(rendererContext, deps, getRenderedOutputs(rendererContext, deps));
	const metaOf = rendererContext._mergeSlots.metaOf;
	const withScripts = options?.scripts !== false;
	const result = [];
	for (let i = 0; i < order.prefetchSlots.length; i++) {
		const slot = order.prefetchSlots[i];
		const resource = metaOf[slot];
		if (!withScripts && isScriptResource(resource)) continue;
		result.push({
			rel: "prefetch",
			as: resource.resourceType,
			type: resource.mimeType ?? null,
			crossorigin: resource.resourceType === "style" || resource.resourceType === "font" || resource.resourceType === "script" || resource.module ? "" : null,
			href: hrefFor(rendererContext, slot, resource)
		});
	}
	return result;
}
function renderScripts(ssrContext, rendererContext) {
	const deps = getRequestDependencies(ssrContext, rendererContext);
	const rendered = getRenderedOutputs(rendererContext, deps);
	if (rendered.scripts !== void 0) return rendered.scripts;
	const order = getOrder(rendererContext, deps, rendered);
	const metaOf = rendererContext._mergeSlots.metaOf;
	let result = "";
	const cache = rendererContext._fragments.script;
	for (let i = 0; i < order.scriptSlots.length; i++) {
		const slot = order.scriptSlots[i];
		let fragment = cache[slot];
		if (fragment === void 0) {
			const resource = metaOf[order.scriptSlots[i]];
			fragment = cache[slot] = resource.module ? `<script type="module" src="${rendererContext.buildAssetsURL(resource.file)}" crossorigin><\/script>` : `<script src="${rendererContext.buildAssetsURL(resource.file)}" defer crossorigin><\/script>`;
		}
		result += fragment;
	}
	rendered.scripts = result;
	return result;
}
function createRenderer(createApp, renderOptions) {
	const rendererContext = createRendererContext(renderOptions);
	return {
		rendererContext,
		async renderToString(ssrContext) {
			ssrContext._registeredComponents = ssrContext._registeredComponents || /* @__PURE__ */ new Set();
			const app = await (await Promise.resolve(createApp).then((r) => "default" in r ? r.default : r))(ssrContext);
			const html = await renderOptions.renderToString(app, ssrContext);
			const wrap = (fn) => () => fn(ssrContext, rendererContext);
			return {
				html,
				renderResourceHeaders: wrap(renderResourceHeaders),
				renderResourceHints: wrap(renderResourceHints),
				renderStyles: wrap(renderStyles),
				renderScripts: wrap(renderScripts)
			};
		}
	};
}
//#endregion
export { createRenderer, createRendererContext, getAllDependencies, getModuleDependencies, getPrefetchLinks, getPreloadLinks, getRequestDependencies, getResources, renderResourceHeaders, renderResourceHints, renderScripts, renderStyles };
