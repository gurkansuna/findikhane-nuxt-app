import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { relative, resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import MagicString from 'magic-string';
import { H as HEAD_COMPOSABLE_RE, S as SOURCE_FILE_RE, p as parseAndWalkSource, b as HEAD_COMPOSABLES } from '../shared/bundler.UsCZRS3d.mjs';
import { defineRpcFunction } from '@vitejs/devtools-kit';
import 'oxc-walker';
import 'unhead/minify';
import 'unplugin';
import 'unhead/utils';

const getConfigRpc = defineRpcFunction({
  name: "unhead:get-config",
  type: "static",
  setup: (ctx) => ({
    handler: () => ({
      cwd: ctx.cwd,
      mode: ctx.mode
    })
  })
});

async function tryRequire() {
  try {
    const mod = await import('@unhead/cli');
    return { runLint: mod.runLint };
  } catch {
    return null;
  }
}
const runLintRpc = defineRpcFunction({
  name: "unhead:run-lint",
  type: "static",
  setup: (ctx) => ({
    handler: async (args = {}) => {
      const lib = await tryRequire();
      if (!lib) {
        return {
          available: false,
          message: "Install @unhead/cli (and eslint as a peer) to enable in-devtools auditing."
        };
      }
      const start = Date.now();
      const mode = args.mode === "migrate" ? "migrate" : "audit";
      const cwd = ctx.cwd;
      const { results, errorCount, warningCount, fixableErrorCount, fixableWarningCount } = await lib.runLint({
        patterns: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue,svelte}"],
        mode,
        cwd,
        ignore: ["**/node_modules/**", "**/dist/**", "**/.output/**", "**/.nuxt/**"]
      });
      const files = results.map((r) => ({
        filePath: r.filePath,
        relativePath: relative(cwd, r.filePath),
        errorCount: r.errorCount,
        warningCount: r.warningCount,
        fixableErrorCount: r.fixableErrorCount,
        fixableWarningCount: r.fixableWarningCount,
        fixed: typeof r.output === "string",
        messages: (r.messages || []).map((m) => ({
          ruleId: m.ruleId ?? null,
          message: m.message,
          severity: m.severity === 2 ? "error" : "warn",
          line: m.line,
          column: m.column,
          endLine: m.endLine,
          endColumn: m.endColumn,
          // Only `fix` is auto-applied by `--fix`; suggestions are editor-only.
          fixable: Boolean(m.fix)
        }))
      })).filter((f) => f.errorCount > 0 || f.warningCount > 0 || f.fixed);
      const filesFixed = files.filter((f) => f.fixed).length;
      return {
        available: true,
        mode,
        files,
        errorCount,
        warningCount,
        fixableErrorCount,
        fixableWarningCount,
        filesFixed,
        durationMs: Date.now() - start
      };
    }
  })
});

const LEADING_SLASH_RE = /^\//;
const UNHEAD_VERSION_RE = /__UNHEAD_VERSION__ = ['"]'?["']/;
const BACKSLASH_RE = /\\/g;
function isViteDevtoolsPlugin(plugin) {
  return !!plugin.name?.startsWith("vite:devtools");
}
function isViteDevtoolsEnabled(config) {
  return config.devtools && config.devtools.enabled === true || config.plugins.some(isViteDevtoolsPlugin);
}
function findPkgRoot(fromUrl) {
  let dir = dirname(fileURLToPath(fromUrl));
  while (dir !== dirname(dir)) {
    if (existsSync(resolve(dir, "package.json")))
      return dir;
    dir = dirname(dir);
  }
  return dir;
}
function resolveRuntimeEntry(pkgDir) {
  const candidates = [
    resolve(pkgDir, "dist/index.mjs"),
    // running from source (repo tests, unbuilt workspace)
    resolve(pkgDir, "src/index.ts")
  ];
  return (candidates.find(existsSync) ?? candidates[0]).replace(BACKSLASH_RE, "/");
}
function resolveDevToolsKitClient(root, pkgDir) {
  try {
    const projectRequire = createRequire(resolve(root, "package.json"));
    const devtoolsEntry = projectRequire.resolve("@vitejs/devtools");
    return createRequire(devtoolsEntry).resolve("@vitejs/devtools-kit/client");
  } catch {
    const fallbackPath = resolve(pkgDir, "node_modules/@vitejs/devtools-kit/dist/client.js");
    if (existsSync(fallbackPath))
      return fallbackPath;
  }
}
const UNHEAD_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FBBF24'/%3E%3Cstop offset='100%25' stop-color='%23f0db4f'/%3E%3C/linearGradient%3E%3Cmask id='m'%3E%3Crect width='100%25' height='100%25' fill='white'/%3E%3Cpath d='M12 32 L1 32 L15 15 Z' fill='black'/%3E%3C/mask%3E%3C/defs%3E%3Cpath fill='none' stroke='url(%23g)' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 4v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4' mask='url(%23m)'/%3E%3C/svg%3E`;
const DEVTOOLS_UI_ROUTE = "/__unhead/";
function transformSourceLocations(code, id, root) {
  const s = new MagicString(code);
  let transformed = false;
  const relativePath = id.startsWith(root) ? id.slice(root.length).replace(LEADING_SLASH_RE, "") : id;
  parseAndWalkSource(code, id, {
    parseOptions: { lang: "ts" },
    enter(node) {
      if (node.type !== "CallExpression")
        return;
      const callee = node.callee;
      if (!callee)
        return;
      const name = callee.type === "Identifier" ? callee.name : callee.type === "MemberExpression" && callee.property?.type === "Identifier" ? callee.property.name : null;
      if (!name || !HEAD_COMPOSABLES.includes(name))
        return;
      const args = node.arguments;
      if (!args || args.length === 0)
        return;
      const lineNumber = code.slice(0, node.start).split("\n").length;
      const sourceValue = `${relativePath}:${lineNumber}`;
      if (args.length === 1) {
        const argEnd = args[0].end;
        s.appendRight(argEnd, `, { _source: ${JSON.stringify(sourceValue)} }`);
        transformed = true;
      } else if (args.length >= 2 && args[1].type === "ObjectExpression") {
        const objStart = args[1].start + 1;
        s.appendRight(objStart, ` _source: ${JSON.stringify(sourceValue)},`);
        transformed = true;
      }
    }
  });
  if (!transformed)
    return;
  return {
    code: s.toString(),
    map: s.generateMap({ includeContent: true, source: id })
  };
}
function unheadDevtools(options) {
  let root = "";
  let enabled = false;
  let bridgeCode;
  let unheadVersion = "";
  const pkgDir = findPkgRoot(import.meta.url);
  const devtoolsUiDir = resolve(pkgDir, "dist/devtools-ui");
  return {
    name: "@unhead/devtools",
    apply: "serve",
    configResolved(config) {
      root = config.root;
      enabled = isViteDevtoolsEnabled(config);
      if (!enabled)
        return;
      if (options?._ctx) {
        options._ctx.addRuntimePlugin({
          import: { name: "devtoolsPlugin", source: resolveRuntimeEntry(pkgDir), as: "__unhead_devtoolsPlugin" },
          client: "window.__unhead_devtools__=_h",
          server: "_h.use(__unhead_devtoolsPlugin())"
        });
      }
      try {
        const unheadEntry = createRequire(import.meta.url).resolve("unhead");
        const unheadPkg = resolve(findPkgRoot(pathToFileURL(unheadEntry).href), "package.json");
        unheadVersion = JSON.parse(readFileSync(unheadPkg, "utf-8")).version || "";
      } catch {
      }
      const bridgePath = resolve(pkgDir, "dist/devtools/bridge.mjs");
      if (existsSync(bridgePath))
        bridgeCode = readFileSync(bridgePath, "utf-8");
    },
    configureServer(server) {
      if (!enabled)
        return;
      server.middlewares.use("/@unhead/bridge.mjs", async (_req, res) => {
        const result = await server.transformRequest("/@unhead/bridge.mjs");
        res.setHeader("Content-Type", "application/javascript");
        res.end(result?.code || 'console.warn("[unhead devtools] bridge not built")');
      });
    },
    resolveId(id) {
      if (!enabled)
        return;
      if (id === "/@unhead/bridge.mjs")
        return id;
    },
    load(id) {
      if (!enabled || id !== "/@unhead/bridge.mjs")
        return;
      if (!bridgeCode)
        return 'console.warn("[unhead devtools] bridge not built")';
      let code = bridgeCode;
      if (unheadVersion)
        code = code.replace(UNHEAD_VERSION_RE, `__UNHEAD_VERSION__ = '${unheadVersion}'`);
      const kitClientPath = resolveDevToolsKitClient(root, pkgDir);
      if (kitClientPath)
        return code.replace(`'@vitejs/devtools-kit/client'`, JSON.stringify(kitClientPath));
      return code;
    },
    transform: {
      filter: { id: SOURCE_FILE_RE, code: HEAD_COMPOSABLE_RE },
      handler(code, id) {
        if (!enabled)
          return;
        return transformSourceLocations(code, id, root);
      }
    },
    transformIndexHtml: {
      // Run before non-pre HTML transforms so the injected module import
      // goes through the full Vite plugin pipeline.
      order: "pre",
      handler() {
        if (!enabled)
          return [];
        return [{
          tag: "script",
          attrs: { type: "module" },
          children: `import("/@unhead/bridge.mjs")`,
          injectTo: "head"
        }];
      }
    },
    devtools: {
      setup(ctx) {
        if (existsSync(devtoolsUiDir)) {
          ctx.views.hostStatic(DEVTOOLS_UI_ROUTE, devtoolsUiDir);
        }
        ctx.docks.register({
          id: "unhead",
          title: "Unhead",
          icon: UNHEAD_ICON,
          type: "iframe",
          url: DEVTOOLS_UI_ROUTE
        });
        ctx.rpc.register(getConfigRpc);
        ctx.rpc.register(runLintRpc);
      }
    }
  };
}

export { unheadDevtools as default, unheadDevtools };
