import { TraceMap, originalPositionFor, sourceContentFor } from "@jridgewell/trace-mapping";
import { init, parse } from "es-module-lexer";
import { isAbsolute, join, relative } from "pathe";
import { createUnplugin } from "unplugin";
import { createFilter } from "unplugin-utils";
//#region src/index.ts
const PROXY_ID = "\0impound:proxy";
const PROXY_ID_RE = /^\0impound:proxy$/;
const PROXY_CODE = `
function createMock(name, overrides = {}) {
  const proxyFn = function () {};
  proxyFn.prototype.name = name;
  const props = {};
  const proxy = new Proxy(proxyFn, {
    get(_target, prop) {
      if (prop === "caller") return null;
      if (prop === "__createMock__") return createMock;
      if (prop === "__mock__") return true;
      if (prop in overrides) return overrides[prop];
      if (prop === "then") return (fn) => Promise.resolve(fn());
      if (prop === "catch") return (_fn) => Promise.resolve();
      if (prop === "finally") return (fn) => Promise.resolve(fn());
      return (props[prop] = props[prop] || createMock(\`\${name}.\${prop.toString()}\`));
    },
    apply(_target, _this, _args) { return createMock(\`\${name}()\`); },
    construct(_target, _args, _newT) { return createMock(\`[\${name}]\`); },
  });
  return proxy;
}
export default createMock("mock");
`.trim();
const RELATIVE_IMPORT_RE = /^\.\.?\//;
const BINARY_ASSET_RE = /\.(?:png|jpe?g|gif|webp|avif|bmp|ico|woff2?|[ot]tf|eot|mp[34]|webm|ogg|wav|flac|pdf|zip|gz|wasm)(?:\?.*)?$/i;
function stripQuery(id) {
	const queryIndex = id.indexOf("?");
	return queryIndex === -1 ? id : id.slice(0, queryIndex);
}
/** Map imports to 1-indexed lines and 0-indexed UTF-16 columns. */
function getImportLocations(code, imports) {
	const locations = /* @__PURE__ */ new Map();
	let line = 1;
	let lastNewline = -1;
	let offset = 0;
	for (const imp of imports) {
		if (!imp.n) continue;
		/* v8 ignore start -- es-module-lexer emits source-ordered imports; a reset only if that changes */
		if (imp.s < offset) {
			line = 1;
			lastNewline = -1;
			offset = 0;
		}
		/* v8 ignore stop */
		while (offset < imp.s && offset < code.length) {
			if (code[offset] === "\n") {
				line++;
				lastNewline = offset;
			}
			offset++;
		}
		locations.set(imp.n, {
			line,
			column: imp.s - lastNewline - 1,
			statementStart: imp.ss,
			statementEnd: imp.se
		});
	}
	return locations;
}
/** Generate a code snippet with context lines, a `>` marker, and a `^` caret. */
function generateSnippet(code, line, column, context = 2) {
	const lines = code.split("\n");
	const start = Math.max(0, line - 1 - context);
	const end = Math.min(lines.length, line + context);
	const gutterWidth = String(end).length;
	const result = [];
	for (let i = start; i < end; i++) {
		const lineNum = i + 1;
		const gutter = String(lineNum).padStart(gutterWidth);
		const marker = lineNum === line ? ">" : " ";
		result.push(`${marker} ${gutter} | ${lines[i]}`);
		if (lineNum === line) result.push(`  ${" ".repeat(gutterWidth)} | ${" ".repeat(column)}^`);
	}
	return result.join("\n");
}
/** Locate a denied specifier's import statement, by raw specifier then by resolved target. */
function findImportLocation(imports, rawId, id, importer, cwd) {
	const direct = imports.get(rawId);
	if (direct) return direct;
	const importerBase = stripQuery(importer);
	for (const [specifier, specLoc] of imports) {
		const resolved = RELATIVE_IMPORT_RE.test(specifier) ? join(importerBase, "..", specifier) : specifier;
		let normalizedResolved = resolved;
		if (cwd && isAbsolute(resolved)) normalizedResolved = relative(cwd, resolved);
		if (normalizedResolved === id || resolved === rawId || specifier === id || specifier.endsWith(`/${id}`)) return specLoc;
	}
}
/** Build an import trace from entry to the importer via BFS backwards through the graph. */
function buildTrace(graph, importer, maxDepth) {
	const cameFrom = /* @__PURE__ */ new Map([[importer, void 0]]);
	const queue = [importer];
	const depths = [1];
	let found;
	for (let cursor = 0; cursor < queue.length && found === void 0; cursor++) {
		const current = queue[cursor];
		const depth = depths[cursor];
		if (depth > maxDepth) continue;
		if (graph.isEntry(current)) {
			found = current;
			break;
		}
		for (const parent of graph.parents(current)) {
			if (cameFrom.has(parent)) continue;
			cameFrom.set(parent, current);
			if (graph.isEntry(parent)) {
				found = parent;
				break;
			}
			queue.push(parent);
			depths.push(depth + 1);
		}
	}
	if (found === void 0) return [{ file: importer }];
	const chain = [];
	for (let node = found; node !== void 0; node = cameFrom.get(node)) chain.push(node);
	return chain.map((file, i) => {
		const next = chain[i + 1];
		const edge = next === void 0 ? void 0 : graph.importOf(file, next);
		if (!edge) return { file };
		const step = {
			file,
			import: edge.specifier
		};
		if (edge.line != null) {
			step.line = edge.line;
			step.column = edge.column;
		}
		return step;
	});
}
/** Read the graph collected during transform, for `trace: true`. */
function eagerGraph(moduleImports, resolvedImports, entries, cwd) {
	const normalize = (p) => isAbsolute(p) && cwd ? relative(cwd, p) : p;
	const importersOf = /* @__PURE__ */ new Map();
	for (const [moduleId, imports] of resolvedImports) {
		if (!moduleImports.has(moduleId)) continue;
		for (const resolvedId of imports.values()) {
			const existing = importersOf.get(resolvedId);
			if (existing) existing.push(moduleId);
			else importersOf.set(resolvedId, [moduleId]);
		}
	}
	return {
		parents: (id) => importersOf.get(id) || importersOf.get(normalize(id)) || [],
		isEntry: (id) => entries.has(id) || entries.has(normalize(id)),
		importOf(file, next) {
			/* v8 ignore next -- the walk only reaches files that have resolved imports */
			for (const [specifier, resolvedId] of resolvedImports.get(file) || []) if (resolvedId === next) {
				const loc = moduleImports.get(file)?.get(specifier);
				return {
					specifier,
					line: loc?.line,
					column: loc?.column
				};
			}
		}
	};
}
function formatTrace(trace, cwd) {
	return trace.map((step, i) => {
		const file = cwd && isAbsolute(step.file) ? relative(cwd, step.file) : step.file;
		const loc = step.line != null ? `:${step.line}:${step.column}` : "";
		const entry = i === 0 ? " (entry)" : "";
		const imp = step.import ? ` (import "${step.import}")` : "";
		return `  ${i + 1}. ${file}${loc}${entry}${imp}`;
	}).join("\n");
}
function enrichAndReport(violation, moduleImports, moduleSources, graph, maxTraceDepth, cwd, warnedMessages) {
	const { id, rawId, importer, errorFn } = violation;
	const trace = buildTrace(graph, importer, maxTraceDepth);
	let snippet;
	const importerImports = moduleImports.get(importer);
	const importerSource = moduleSources.get(importer);
	/* v8 ignore start -- always defined: the importer was transformed and matched a matcher, so its source is retained */
	if (importerImports && importerSource) {
		/* v8 ignore stop */
		const loc = findImportLocation(importerImports, rawId, id, importer, cwd);
		if (loc) {
			let snippetCode = importerSource.code;
			let snippetLine = loc.line;
			let snippetColumn = loc.column;
			if (importerSource.sourceMap) try {
				const tracer = new TraceMap(importerSource.sourceMap);
				const original = originalPositionFor(tracer, {
					line: loc.line,
					column: loc.column
				});
				if (original.line != null) {
					snippetLine = original.line;
					/* v8 ignore start -- originalPositionFor always returns column and source when line is non-null */
					snippetColumn = original.column ?? 0;
					const originalSource = original.source != null ? sourceContentFor(tracer, original.source) : null;
					/* v8 ignore stop */
					if (originalSource != null) snippetCode = originalSource;
					else if (importerSource.originalCode) snippetCode = importerSource.originalCode;
				}
			} catch {}
			snippet = {
				text: generateSnippet(snippetCode, snippetLine, snippetColumn),
				line: snippetLine,
				column: snippetColumn
			};
		}
	}
	reportViolation(violation, trace, snippet, cwd, errorFn, warnedMessages);
}
/** Assemble the final message, run the `onViolation` hook, de-duplicate, and report. */
function reportViolation(violation, trace, snippet, cwd, errorFn, warnedMessages) {
	const { id, relativeImporter, options, suggestions } = violation;
	let message = violation.message;
	if (trace.length > 1) message += `\n\nTrace:\n${formatTrace(trace, cwd)}`;
	if (snippet) message += `\n\nCode:\n${snippet.text}`;
	if (suggestions?.length) message += `\n\nSuggestions:\n${suggestions.map((s) => `  - ${s}`).join("\n")}`;
	const violationInfo = {
		id,
		importer: relativeImporter,
		message,
		trace: trace.length > 1 ? trace : void 0,
		snippet
	};
	if (options.onViolation?.(violationInfo) === false) return;
	if (!warnedMessages || !warnedMessages.has(message)) {
		warnedMessages?.add(message);
		errorFn(message);
	}
}
let lexerReady = false;
/** Resolve once, then stay synchronous: a per-module `await` costs a microtask each. */
function whenLexerReady() {
	if (lexerReady) return;
	return init.then(() => {
		lexerReady = true;
	});
}
/** Lex a module's imports once per reporting pass. Only modules on a violation's chain are read. */
function lexImports(cache, id, code) {
	const cached = cache.get(id);
	if (cached) return cached;
	let locations = /* @__PURE__ */ new Map();
	try {
		const [imports] = parse(code, id);
		locations = getImportLocations(code, imports);
	} catch {}
	cache.set(id, locations);
	return locations;
}
/** Read the bundler's own graph, for `trace: 'lazy'`. Only modules on a chain are lexed. */
function lazyGraph(ctx, cwd, cache) {
	return {
		parents(id) {
			const info = ctx.getModuleInfo(id);
			return [...info?.importers || [], ...info?.dynamicImporters || []];
		},
		isEntry: (id) => ctx.getModuleInfo(id)?.isEntry === true,
		importOf(file, next) {
			const code = ctx.getModuleInfo(file)?.code;
			if (!code) return;
			const nextRelative = isAbsolute(next) && cwd ? relative(cwd, next) : next;
			for (const [specifier, loc] of lexImports(cache, file, code)) {
				const resolved = RELATIVE_IMPORT_RE.test(specifier) ? join(stripQuery(file), "..", specifier) : specifier;
				if (resolved === next || resolved === nextRelative || specifier === nextRelative || specifier.endsWith(`/${nextRelative}`)) return {
					specifier,
					line: loc.line,
					column: loc.column
				};
			}
		}
	};
}
/**
* Adapt webpack's and rspack's `moduleGraph` to the same shape rollup's `getModuleInfo`
* gives, so the lazy walk works there too. `originalSource()` is the pre-transform
* source, so these snippets point at original code rather than transformed.
*/
function nativeGraphContext(native, cwd) {
	const compilation = native?.compilation;
	const moduleGraph = compilation?.moduleGraph;
	if (!moduleGraph || !compilation?.modules) return;
	const byId = /* @__PURE__ */ new Map();
	for (const module of compilation.modules) {
		const resource = module.resource;
		if (!resource) continue;
		byId.set(resource, module);
		if (cwd && isAbsolute(resource)) byId.set(relative(cwd, resource), module);
	}
	const errors = compilation.errors;
	return {
		addError: errors && ((message) => {
			errors.push(new Error(message));
		}),
		graph: { getModuleInfo(id) {
			const module = byId.get(id) || byId.get(stripQuery(id));
			if (!module) return null;
			const importers = [];
			let isEntry = false;
			for (const connection of moduleGraph.getIncomingConnections(module)) {
				if (!connection.originModule) {
					isEntry = true;
					continue;
				}
				if (connection.originModule.resource) importers.push(connection.originModule.resource);
			}
			let code;
			try {
				code = module.originalSource?.()?.source()?.toString();
			} catch {}
			return {
				code,
				importers,
				isEntry
			};
		} }
	};
}
/** Enrich a held violation once the bundler's graph is complete. Nothing was collected earlier. */
async function enrichAndReportLazy(ctx, violation, maxTraceDepth, cwd, errorFn, cache) {
	await whenLexerReady();
	const trace = buildTrace(lazyGraph(ctx, cwd, cache), violation.importer, maxTraceDepth);
	let snippet;
	const code = ctx.getModuleInfo(violation.importer)?.code;
	if (code) {
		const loc = findImportLocation(lexImports(cache, violation.importer, code), violation.rawId, violation.id, violation.importer, cwd);
		if (loc) snippet = {
			text: generateSnippet(code, loc.line, loc.column),
			line: loc.line,
			column: loc.column
		};
	}
	reportViolation(violation, trace, snippet, cwd, errorFn, violation.warnedMessages);
}
const ImpoundPlugin = createUnplugin((globalOptions) => {
	const matchers = "matchers" in globalOptions ? globalOptions.matchers : [globalOptions];
	const traceMode = globalOptions.trace === "lazy" ? "lazy" : globalOptions.trace === true ? "eager" : "off";
	const traceEnabled = traceMode !== "off";
	const maxTraceDepth = globalOptions.maxTraceDepth ?? 20;
	const moduleImports = /* @__PURE__ */ new Map();
	const moduleSources = /* @__PURE__ */ new Map();
	const resolvedImports = /* @__PURE__ */ new Map();
	const entries = /* @__PURE__ */ new Set();
	const pendingViolations = /* @__PURE__ */ new Map();
	const heldMessages = /* @__PURE__ */ new Set();
	const cwd = globalOptions.cwd;
	function hold(importer, violation) {
		if (violation.warnedMessages) {
			const key = `${importer}\0${violation.message}`;
			if (heldMessages.has(key)) return;
			heldMessages.add(key);
		}
		let pending = pendingViolations.get(importer);
		if (!pending) {
			pending = [];
			pendingViolations.set(importer, pending);
		}
		pending.push(violation);
	}
	const matcherStates = matchers.map((options) => ({
		options,
		filter: createFilter(options.include, options.exclude, { resolve: cwd }),
		filterCache: /* @__PURE__ */ new Map(),
		excludeFilter: options.excludeFiles?.length ? createFilter(options.excludeFiles, void 0, { resolve: cwd }) : void 0,
		warnedMessages: options.warn !== "always" ? /* @__PURE__ */ new Set() : void 0
	}));
	function includes(matcher, id) {
		let included = matcher.filterCache.get(id);
		if (included === void 0) {
			included = matcher.filter(id);
			matcher.filterCache.set(id, included);
		}
		return included;
	}
	function includedByAny(id) {
		for (const matcher of matcherStates) if (includes(matcher, id)) return true;
		return false;
	}
	const relativeImporterCache = /* @__PURE__ */ new Map();
	let cachedEagerGraph;
	function getEagerGraph() {
		return cachedEagerGraph ??= eagerGraph(moduleImports, resolvedImports, entries, cwd);
	}
	const plugins = [{
		name: "impound",
		enforce: "pre",
		...traceEnabled ? { buildEnd: reportHeldViolations } : {},
		load: {
			filter: { id: PROXY_ID_RE },
			handler(id) {
				if (id === PROXY_ID) return {
					code: PROXY_CODE,
					syntheticNamedExports: "default"
				};
			}
		},
		resolveId(id, importer, resolveOptions) {
			if (id === PROXY_ID) return id;
			if (!importer) {
				if (traceMode === "eager" && resolveOptions?.isEntry) {
					entries.add(id);
					cachedEagerGraph = void 0;
				}
				return;
			}
			const rawId = id;
			let resolvedId;
			let relativeId;
			let relativeImporter;
			if (traceMode === "eager") {
				resolvedId = RELATIVE_IMPORT_RE.test(rawId) ? join(stripQuery(importer), "..", rawId) : rawId;
				relativeId = isAbsolute(resolvedId) && cwd ? relative(cwd, resolvedId) : resolvedId;
				let importerResolved = resolvedImports.get(importer);
				if (!importerResolved) {
					importerResolved = /* @__PURE__ */ new Map();
					resolvedImports.set(importer, importerResolved);
				}
				if (importerResolved.get(rawId) !== relativeId) {
					importerResolved.set(rawId, relativeId);
					cachedEagerGraph = void 0;
				}
			}
			for (const matcher of matcherStates) {
				if (!includes(matcher, importer)) continue;
				resolvedId ??= RELATIVE_IMPORT_RE.test(rawId) ? join(stripQuery(importer), "..", rawId) : rawId;
				if (matcher.excludeFilter?.(resolvedId)) continue;
				relativeId ??= isAbsolute(resolvedId) && cwd ? relative(cwd, resolvedId) : resolvedId;
				const id = relativeId;
				if (relativeImporter === void 0) {
					relativeImporter = relativeImporterCache.get(importer);
					if (relativeImporter === void 0) {
						relativeImporter = isAbsolute(importer) && cwd ? relative(cwd, importer) : importer;
						relativeImporterCache.set(importer, relativeImporter);
					}
				}
				const { options, warnedMessages } = matcher;
				let matched = false;
				let formattedImporter;
				for (const [pattern, warning, suggestions] of options.patterns) {
					const usesImport = pattern instanceof RegExp ? pattern.test(id) : typeof pattern === "string" ? pattern === id : pattern(id, relativeImporter);
					if (usesImport) {
						formattedImporter ??= stripQuery(relativeImporter);
						const baseMessage = `${typeof usesImport === "string" ? usesImport : warning || "Invalid import"} [importing \`${id}\` from \`${formattedImporter}\`]`;
						if (traceEnabled) {
							const useConsoleError = options.error === false;
							const violation = {
								id,
								rawId,
								importer,
								relativeImporter,
								message: baseMessage,
								suggestions,
								options,
								errorFn: traceMode === "lazy" ? void 0 : useConsoleError ? console.error : this.error.bind(this),
								useConsoleError,
								warnedMessages
							};
							if (traceMode === "eager" && moduleImports.has(importer)) enrichAndReport(violation, moduleImports, moduleSources, getEagerGraph(), maxTraceDepth, cwd, warnedMessages);
							else hold(importer, violation);
						} else {
							let message = baseMessage;
							if (suggestions?.length) message += `\n\nSuggestions:\n${suggestions.map((s) => `  - ${s}`).join("\n")}`;
							if (options.onViolation?.({
								id,
								importer: relativeImporter,
								message
							}) === false) continue;
							if (!warnedMessages || !warnedMessages.has(message)) {
								warnedMessages?.add(message);
								(options.error === false ? console.error : this.error.bind(this))(message);
							}
						}
						matched = true;
					}
				}
				if (matched) return PROXY_ID;
			}
		}
	}];
	if (traceMode === "eager") {
		function registerModule(code, id, getCombinedSourcemap) {
			const tracked = includedByAny(id);
			let importMap = /* @__PURE__ */ new Map();
			let originalCode;
			let sourceMap;
			try {
				const [imports] = parse(code, id);
				importMap = getImportLocations(code, imports);
				if (tracked && getCombinedSourcemap) try {
					const map = getCombinedSourcemap();
					if (map?.mappings) {
						sourceMap = map;
						const sourcesContent = map.sourcesContent;
						if (sourcesContent?.length && sourcesContent[0]) originalCode = sourcesContent[0];
					}
				} catch {}
			} catch {
				importMap = /* @__PURE__ */ new Map();
			}
			const source = tracked ? {
				code,
				originalCode,
				sourceMap
			} : void 0;
			const register = (key) => {
				moduleImports.set(key, importMap);
				if (source) moduleSources.set(key, source);
			};
			register(id);
			/* v8 ignore start -- defensive normalization for framework-specific virtual module IDs */
			const bareId = stripQuery(id);
			if (bareId !== id) register(bareId);
			if (isAbsolute(id) && cwd) {
				const relId = relative(cwd, id);
				register(relId);
				const relBareId = stripQuery(relId);
				if (relBareId !== relId) register(relBareId);
			}
			/* v8 ignore stop */
			cachedEagerGraph = void 0;
			if (pendingViolations.size === 0) return;
			const relativeId = isAbsolute(id) && cwd ? relative(cwd, id) : id;
			const candidateKeys = /* @__PURE__ */ new Set([
				id,
				relativeId,
				bareId,
				stripQuery(relativeId)
			]);
			for (const key of candidateKeys) {
				const pending = pendingViolations.get(key);
				if (pending) {
					pendingViolations.delete(key);
					for (const violation of pending) enrichAndReport(violation, moduleImports, moduleSources, getEagerGraph(), maxTraceDepth, cwd, violation.warnedMessages);
				}
			}
		}
		function traceTransform(code, id, getCombinedSourcemap) {
			if (BINARY_ASSET_RE.test(id)) return;
			const pending = whenLexerReady();
			if (pending) return pending.then(() => registerModule(code, id, getCombinedSourcemap));
			registerModule(code, id, getCombinedSourcemap);
		}
		const transformWithSourceMap = { transform(code, id) {
			return traceTransform(code, id, this.getCombinedSourcemap?.bind(this));
		} };
		const filteredTransformWithSourceMap = { transform: {
			filter: { id: { exclude: BINARY_ASSET_RE } },
			handler: transformWithSourceMap.transform
		} };
		const tracePlugin = {
			name: "impound:trace",
			transform: {
				filter: { id: { exclude: BINARY_ASSET_RE } },
				handler: traceTransform
			},
			rollup: transformWithSourceMap,
			vite: filteredTransformWithSourceMap,
			rolldown: filteredTransformWithSourceMap
		};
		plugins.push(tracePlugin);
	}
	async function reportHeldViolations(buildError) {
		if (buildError || pendingViolations.size === 0) {
			pendingViolations.clear();
			return;
		}
		const held = [];
		for (const violations of pendingViolations.values()) for (const violation of violations) held.push(violation);
		pendingViolations.clear();
		const ctx = this;
		const native = typeof ctx.getModuleInfo === "function" ? void 0 : nativeGraphContext(ctx.getNativeBuildContext?.(), cwd);
		const graph = typeof ctx.getModuleInfo === "function" ? ctx : native?.graph;
		const cache = /* @__PURE__ */ new Map();
		for (const violation of held) {
			const errorFn = violation.useConsoleError ? console.error : typeof ctx.error === "function" ? ctx.error.bind(ctx) : native?.addError || ((msg) => {
				throw new Error(msg);
			});
			if (graph) await enrichAndReportLazy(graph, violation, maxTraceDepth, cwd, errorFn, cache);
			else reportViolation(violation, [{ file: violation.relativeImporter }], void 0, cwd, errorFn, violation.warnedMessages);
		}
	}
	return plugins;
});
//#endregion
export { ImpoundPlugin };
