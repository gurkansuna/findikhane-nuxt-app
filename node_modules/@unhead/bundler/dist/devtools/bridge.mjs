const __UNHEAD_VERSION__ = "";
function extractSeoOverview(tags, title) {
  const seo = {
    title,
    description: "",
    canonical: "",
    robots: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: ""
  };
  for (const t of tags) {
    if (t.tag === "meta") {
      const name = t.props.name;
      const property = t.props.property;
      const content = t.props.content || "";
      if (name === "description")
        seo.description = content;
      else if (name === "robots")
        seo.robots = content;
      else if (property === "og:title")
        seo.ogTitle = content;
      else if (property === "og:description")
        seo.ogDescription = content;
      else if (property === "og:image")
        seo.ogImage = content;
    } else if (t.tag === "link" && t.props.rel === "canonical") {
      seo.canonical = t.props.href || "";
    }
  }
  return seo;
}
function safeSerialize(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (value === null)
    return null;
  if (value === void 0)
    return "\u2298 undefined";
  if (typeof value === "function")
    return `\u0192 ${value.name || "anonymous"}()`;
  if (typeof value === "symbol")
    return `Symbol(${value.description || ""})`;
  if (typeof value !== "object")
    return value;
  if (seen.has(value))
    return "\u2298 circular";
  seen.add(value);
  if (Array.isArray(value))
    return value.map((v) => safeSerialize(v, seen));
  const result = {};
  for (const key in value) {
    if (key === "__proto__" || key === "constructor" || key === "prototype")
      continue;
    result[key] = safeSerialize(value[key], seen);
  }
  return result;
}
function resolveEntryMode(entry, wasSSR, ssrSources, wasStreamed) {
  if (entry._devtoolsMode)
    return entry._devtoolsMode;
  if (entry._streamed)
    return "stream";
  if (wasStreamed && entry.options?._source)
    return "hydrated";
  if (!wasSSR)
    return "client";
  const source = entry.options?._source;
  if (source && ssrSources.has(source))
    return "hydrated";
  return "client";
}
function readSSRDevtoolsPayload() {
  const el = document.head.querySelector('script[id="unhead:devtools"]');
  if (!el?.innerHTML)
    return null;
  try {
    return JSON.parse(el.innerHTML);
  } catch {
    return null;
  }
}
function serializeHeadState(head, wasSSR = false, ssrPayload = null) {
  const entries = [];
  const allTags = [];
  const tagTypeCounts = {};
  const weightFn = head.resolvedOptions?._tagWeight || ((tag) => typeof tag.tagPriority === "number" ? tag.tagPriority : 100);
  const ssrSources = /* @__PURE__ */ new Set();
  if (ssrPayload?.entries) {
    for (const e of ssrPayload.entries) {
      if (e.source)
        ssrSources.add(e.source);
    }
  }
  let wasStreamed = false;
  if (head.entries) {
    for (const [, entry] of head.entries) {
      if (entry._streamed) {
        wasStreamed = true;
        break;
      }
    }
  }
  const clientEntryIds = /* @__PURE__ */ new Set();
  if (head.entries) {
    for (const [id, entry] of head.entries) {
      clientEntryIds.add(id);
      const tags = entry._tags || [];
      const mode = resolveEntryMode(entry, wasSSR, ssrSources, wasStreamed);
      entries.push({
        id,
        source: entry.options?._source,
        input: safeSerialize(entry.input || {}),
        tagCount: tags.length,
        mode
      });
      for (const tag of tags) {
        const tagName = tag.tag;
        tagTypeCounts[tagName] = (tagTypeCounts[tagName] || 0) + 1;
        const weight = tag._w ?? weightFn(tag);
        allTags.push({
          tag: tagName,
          props: { ...tag.props },
          innerHTML: tag.innerHTML,
          textContent: tag.textContent,
          position: tag.tagPosition,
          priority: weight,
          order: tag._p,
          dedupeKey: tag._d,
          source: tag._source || entry.options?._source,
          mode
        });
      }
    }
  }
  for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
    if (el.id === "unhead:devtools" || el.id === "unhead:payload")
      continue;
    const innerHTML = el.innerHTML;
    if (!innerHTML)
      continue;
    const dedupeKey = el.getAttribute("data-hid") || "";
    const matched = allTags.find(
      (t) => t.tag === "script" && t.props.type === "application/ld+json" && !t.innerHTML && (dedupeKey ? t.dedupeKey?.includes(dedupeKey) || t.props["data-hid"] === dedupeKey : true)
    );
    if (matched) {
      matched.innerHTML = innerHTML;
    } else {
      allTags.push({
        tag: "script",
        props: { type: "application/ld+json", ...dedupeKey ? { "data-hid": dedupeKey } : {} },
        innerHTML,
        mode: "client"
      });
      tagTypeCounts.script = (tagTypeCounts.script || 0) + 1;
    }
  }
  if (ssrPayload) {
    if (ssrPayload.entries) {
      for (const ssrEntry of ssrPayload.entries) {
        if (!clientEntryIds.has(ssrEntry.id)) {
          entries.push({
            id: ssrEntry.id,
            source: ssrEntry.source,
            input: ssrEntry.input || {},
            tagCount: ssrEntry.tagCount,
            mode: "server"
          });
        }
      }
    }
    if (ssrPayload.tags) {
      const tagFingerprint = (t) => t.dedupeKey || `${t.tag}:${JSON.stringify(t.props || {})}`;
      const clientTagKeys = new Set(allTags.map((t) => tagFingerprint(t)));
      for (const ssrTag of ssrPayload.tags) {
        if (clientTagKeys.has(tagFingerprint(ssrTag)))
          continue;
        const tagName = ssrTag.tag;
        tagTypeCounts[tagName] = (tagTypeCounts[tagName] || 0) + 1;
        allTags.push({
          tag: tagName,
          props: ssrTag.props || {},
          innerHTML: ssrTag.innerHTML,
          textContent: ssrTag.textContent,
          position: ssrTag.position,
          priority: ssrTag.priority,
          dedupeKey: ssrTag.dedupeKey,
          source: ssrTag.source,
          mode: "server"
        });
      }
    }
  }
  const plugins = [];
  if (head.plugins) {
    for (const [key] of head.plugins) {
      plugins.push(key);
    }
  }
  const scripts = [];
  if (head._scripts) {
    for (const [id, script] of Object.entries(head._scripts)) {
      const s = script;
      scripts.push({
        id,
        src: s.src || s.input?.src || "",
        status: s.status || "unknown",
        warmupStrategy: s._warmupEl ? s._warmupStrategy || "preload" : void 0,
        events: s._events || [],
        fetchpriority: s.input?.fetchpriority,
        crossorigin: s.input?.crossorigin,
        defer: s.input?.defer,
        async: s.input?.async
      });
    }
  }
  let templateParams = null;
  if (head._templateParams) {
    try {
      templateParams = JSON.parse(JSON.stringify(head._templateParams));
    } catch {
    }
  }
  const title = head._title || document.title || "";
  const validationRules = (head._validationRules || []).map((r) => ({
    id: r.id,
    message: r.message,
    severity: r.severity,
    source: r.source,
    tagDedupeKey: r.tag?._d || r.tag?._h || void 0
  }));
  return {
    version: __UNHEAD_VERSION__,
    entries,
    tags: allTags.sort((a, b) => (a.priority ?? 100) === (b.priority ?? 100) ? (a.order ?? 0) - (b.order ?? 0) : (a.priority ?? 100) - (b.priority ?? 100)),
    plugins,
    title,
    scripts,
    seo: extractSeoOverview(allTags, title),
    titleTemplate: head._titleTemplate ? typeof head._titleTemplate === "function" ? String(head._titleTemplate) : head._titleTemplate : null,
    templateParams,
    separator: head._separator || "|",
    ssr: !!head.ssr,
    dirty: !!head.dirty,
    domElementCount: head._dom?._e?.size || 0,
    tagTypeCounts,
    validationRules
  };
}
function detectSSR() {
  const headEl = document.head;
  return !!(headEl.querySelector('meta[name="description"]') || headEl.querySelector("meta[property]") || headEl.querySelector('link[rel="canonical"]') || headEl.querySelector('script[id="unhead:payload"]'));
}
function connectBridge(head) {
  let sharedState;
  const wasSSR = detectSSR();
  const ssrPayload = readSSRDevtoolsPayload();
  function syncToSharedState() {
    if (!sharedState)
      return;
    const newState = serializeHeadState(head, wasSSR, ssrPayload);
    sharedState.mutate((draft) => {
      Object.assign(draft, newState);
    });
  }
  async function init() {
    const { getDevToolsRpcClient } = await import('@vitejs/devtools-kit/client');
    const rpc = await getDevToolsRpcClient({ baseURL: "/__devtools/" });
    sharedState = await rpc.sharedState.get("unhead:state", {
      initialValue: serializeHeadState(head, wasSSR, ssrPayload)
    });
    if (head.hooks)
      head.hooks.hook("dom:rendered", syncToSharedState);
    setTimeout(syncToSharedState, 500);
  }
  init().catch((err) => {
    console.error("[unhead bridge] init failed:", err);
  });
}
function findHead() {
  if (window.__unhead__?._head)
    return window.__unhead__._head;
  if (window.__unhead_devtools__)
    return window.__unhead_devtools__;
  return null;
}
function pollForHead() {
  let attempts = 0;
  const handle = globalThis.setInterval(() => {
    const h = findHead();
    if (h) {
      globalThis.clearInterval(handle);
      connectBridge(h);
    }
    if (++attempts > 50) {
      globalThis.clearInterval(handle);
      console.warn("[unhead bridge] gave up polling for head after 50 attempts");
    }
  }, 100);
}
if (typeof window !== "undefined") {
  const head = findHead();
  if (head) {
    connectBridge(head);
  } else {
    pollForHead();
  }
}
