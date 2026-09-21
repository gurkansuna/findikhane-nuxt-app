import { addBuildPlugin, addImports, addTemplate, addTypeTemplate, createResolver, defineNuxtModule, useNitro } from "@nuxt/kit";
import { Buffer } from "node:buffer";
import { EventEmitter } from "node:events";
import { mkdir, open, readFile, writeFile } from "node:fs/promises";
import { watch } from "chokidar";
import { dirname, isAbsolute, join, relative } from "pathe";
import { genExport, genImport, genInlineTypeImport, genObjectKey } from "knitwork";
import { ElementTypes, NodeTypes, parse } from "@vue/compiler-dom";
import MagicString from "magic-string";
import { createUnplugin } from "unplugin";
//#region package.json
var name = "@dxup/nuxt";
//#endregion
//#region src/event/client.ts
const responseRE = /^```json \{(?<key>.*)\}\n(?<value>[\s\S]*?)\n```$/;
async function createEventClient(nuxt) {
	const path = join(nuxt.options.buildDir, "dxup/events.md");
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, "");
	const fd = await open(path, "r");
	const watcher = watch(path, { ignoreInitial: true });
	nuxt.hook("close", async () => {
		await fd.close();
		await watcher.close();
	});
	const client = new EventEmitter();
	let offset = 0;
	watcher.on("change", async (path, stats) => {
		if (!stats || stats.size <= offset) return;
		const pos = offset;
		offset = stats.size;
		const buffer = Buffer.alloc(offset - pos);
		await fd.read(buffer, 0, buffer.length, pos);
		const match = buffer.toString("utf-8").trim().match(responseRE);
		if (match) {
			const { key, value } = match.groups;
			client.emit(key, JSON.parse(value));
		}
	});
	return client;
}
//#endregion
//#region src/module/events.ts
const uppercaseRE = /[A-Z]/;
async function onComponentsRename(nuxt, { fileName, references }) {
	const component = Object.values(nuxt.apps).flatMap((app) => app.components).find((c) => c.filePath === fileName);
	if (!component) return;
	const tasks = Object.entries(references).map(async ([fileName, references]) => {
		const code = await readFile(fileName, "utf-8");
		const chunks = [];
		let offset = 0;
		for (const { textSpan, lazy } of references) {
			const start = textSpan.start;
			const end = start + textSpan.length;
			const oldName = code.slice(start, end);
			const newName = uppercaseRE.test(oldName) ? lazy ? "Lazy" + component.pascalName : component.pascalName : lazy ? "lazy-" + component.kebabName : component.kebabName;
			chunks.push(code.slice(offset, start), newName);
			offset = end;
		}
		chunks.push(code.slice(offset));
		await writeFile(fileName, chunks.join(""));
	});
	await Promise.all(tasks);
}
//#endregion
//#region src/module/named-layout-slots/utils.ts
const vueRE = /[?&]vue(?:&|$)/;
const typeRE = /[?&]type=[^&]*/;
function isVue(id) {
	const index = id.indexOf("?");
	const query = index !== -1 ? id.slice(index) : void 0;
	if (query === void 0) return id.endsWith(".vue");
	if (query === "?macro=true") return true;
	if (!vueRE.test(query)) return false;
	if (typeRE.test(query)) return false;
	return true;
}
function isInDir(path, dir) {
	const rel = relative(dir, path);
	return rel !== ".." && !rel.startsWith("../") && !isAbsolute(rel);
}
function parseSFC(code) {
	const sfc = parse(code, { parseMode: "sfc" });
	let scriptSetup;
	let template;
	for (const node of sfc.children) {
		if (node.type !== NodeTypes.ELEMENT) continue;
		if (node.tag === "script" && node.props.some((prop) => prop.type === NodeTypes.ATTRIBUTE && (prop.name === "setup" || prop.name === "vapor"))) scriptSetup = node;
		else if (node.tag === "template") template = node;
	}
	return {
		scriptSetup,
		template
	};
}
function* forEachElementNode(node) {
	if (node.type === NodeTypes.ROOT || node.type === NodeTypes.FOR || node.type === NodeTypes.IF_BRANCH) for (const child of node.children) yield* forEachElementNode(child);
	else if (node.type === NodeTypes.ELEMENT) {
		yield node;
		for (const child of node.children) yield* forEachElementNode(child);
	} else if (node.type === NodeTypes.IF) for (const branch of node.branches) yield* forEachElementNode(branch);
}
//#endregion
//#region src/module/named-layout-slots/transform.ts
const TransformPlugins = (options) => createUnplugin(() => [{
	name: name + ":transform-layout",
	enforce: "pre",
	transformInclude: isVue,
	transform(code, id) {
		if (!options.layoutDirs.some((dir) => isInDir(id, dir))) return;
		const { scriptSetup, template } = parseSFC(code);
		if (!template) return;
		const slots = [];
		for (const node of forEachElementNode(template)) if (node.tagType === ElementTypes.SLOT && node.props.length && node.props.every((prop) => prop.name !== "name" || prop.type !== NodeTypes.ATTRIBUTE || prop.value && prop.value.content !== "default")) slots.push(node);
		if (!slots.length) return;
		const s = new MagicString(code);
		const imports = genImport("#build/dxup/layouts.mjs", ["LayoutSlot"]);
		if (scriptSetup) {
			const start = scriptSetup.innerLoc.start.offset;
			s.appendLeft(start, `\n${imports}\n`);
		} else s.prepend(`<script setup>\n${imports}\n<\/script>\n\n`);
		for (const slot of slots) for (const offset of /* @__PURE__ */ new Set([slot.loc.start.offset + slot.loc.source.indexOf("slot"), slot.loc.start.offset + slot.loc.source.lastIndexOf("slot")])) s.overwrite(offset, offset + 4, "LayoutSlot");
		return {
			code: s.toString(),
			map: options.sourcemap ? s.generateMap({ hires: true }) : void 0
		};
	}
}, {
	name: name + ":transform-page",
	enforce: "pre",
	transformInclude: isVue,
	transform(code, id) {
		if (!options.pageDirs.some((dir) => isInDir(id, dir))) return;
		const { scriptSetup, template } = parseSFC(code);
		if (!template) return;
		const s = new MagicString(code);
		const imports = genImport("#build/dxup/layouts.mjs", ["LayoutSlotsForward"]);
		if (scriptSetup) {
			const start = scriptSetup.innerLoc.start.offset;
			s.appendLeft(start, `\n${imports}\n`);
		} else s.prepend(`<script setup>\n${imports}\n<\/script>\n\n`);
		s.appendLeft(template.innerLoc.start.offset, `<LayoutSlotsForward>`);
		s.appendLeft(template.innerLoc.end.offset, "</LayoutSlotsForward>");
		return {
			code: s.toString(),
			map: options.sourcemap ? s.generateMap({ hires: true }) : void 0
		};
	}
}]);
//#endregion
//#region src/module/named-layout-slots/module.ts
async function setup(nuxt, pluginsVue) {
	const resolver = createResolver(import.meta.url);
	const layoutDirs = nuxt.options._layers.map((layer) => join(layer.config.srcDir, layer.config.dir?.layouts ?? "layouts"));
	const pageDirs = nuxt.options._layers.map((layer) => join(layer.config.srcDir, layer.config.dir?.pages ?? "pages"));
	pluginsVue.push({
		name: "@dxup/nuxt/languages/named-layout-slots.cjs",
		options: { dirs: pageDirs }
	});
	addImports({
		name: "useLayoutSlots",
		from: resolver.resolve("runtime/layouts.mjs")
	});
	nuxt.hook("components:extend", (components) => {
		for (const comp of components) if (comp.pascalName === "NuxtLayout") {
			comp.declarationPath = comp.filePath;
			comp.filePath = join(nuxt.options.buildDir, "dxup/layouts.mjs");
			break;
		}
	});
	const layoutPath = join(await resolver.resolvePath("nuxt", { cwd: nuxt.options.rootDir }), "../app/components/nuxt-layout.js");
	addTemplate({
		filename: "dxup/layouts.mjs",
		getContents() {
			return [
				genExport(resolver.resolve("runtime/layouts.mjs"), "*"),
				genExport(resolver.resolve("runtime/layouts.mjs"), ["default"]),
				genExport(layoutPath, [{
					name: "default",
					as: "NuxtLayout"
				}])
			].join("\n");
		}
	});
	addTypeTemplate({
		filename: "dxup/layouts.d.ts",
		getContents({ app }) {
			const currentDir = join(nuxt.options.buildDir, "dxup");
			return `
export interface Layouts {
${Object.values(app.layouts).map((layout) => `  ${genObjectKey(layout.name)}: ${genInlineTypeImport(relative(currentDir, layout.file))};`).join("\n")}
}
`.trimStart();
		}
	});
	addBuildPlugin(TransformPlugins({
		layoutDirs,
		pageDirs,
		sourcemap: !!(nuxt.options.sourcemap.client || nuxt.options.sourcemap.server)
	}));
}
//#endregion
//#region src/module/index.ts
var module_default = defineNuxtModule().with({
	meta: {
		name,
		configKey: "dxup"
	},
	defaults: { features: {
		components: true,
		importGlob: true,
		namedLayoutSlots: false,
		nitroRoutes: true,
		pageMeta: true,
		runtimeConfig: true,
		typedPages: true,
		unimport: true,
		unofficial: true
	} },
	async setup(options, nuxt) {
		const pluginsTs = [{ name: "@dxup/nuxt" }];
		const pluginsVue = [];
		if (options.features.namedLayoutSlots) await setup(nuxt, pluginsVue);
		if (options.features.unimport) pluginsTs.unshift({ name: "@dxup/unimport" });
		append(pluginsTs, nuxt.options, "typescript", "tsConfig", "compilerOptions");
		append(pluginsTs, nuxt.options.nitro, "typescript", "tsConfig", "compilerOptions");
		append(pluginsTs, nuxt.options, "typescript", "sharedTsConfig", "compilerOptions");
		append(pluginsTs, nuxt.options, "typescript", "nodeTsConfig", "compilerOptions");
		append(pluginsVue, nuxt.options, "typescript", "tsConfig", "vueCompilerOptions");
		addTemplate({
			filename: "dxup/data.json",
			write: true,
			getContents({ nuxt, app }) {
				const layouts = Object.fromEntries(Object.values(app.layouts).map((item) => [item.name, item.file]));
				const middleware = app.middleware.reduce((acc, item) => {
					if (!item.global) acc[item.name] = item.path;
					return acc;
				}, {});
				const nitroRoutes = useNitro().scannedHandlers.reduce((acc, item) => {
					if (item.route && item.method) (acc[item.route] ??= {})[item.method] = item.handler;
					return acc;
				}, {});
				const typedPages = app.pages?.reduce(function reducer(acc, page) {
					if (page.name && page.file) acc[page.name] = page.file;
					if (page.children) for (const child of page.children) reducer(acc, child);
					return acc;
				}, {});
				const data = {
					buildDir: nuxt.options.buildDir,
					publicDir: nuxt.options.dir.public,
					configFiles: [...nuxt.options._nuxtConfigFiles, ...nuxt.options._layers.map((layer) => layer._configFile).filter(Boolean)],
					layouts,
					middleware,
					nitroRoutes,
					typedPages,
					features: options.features
				};
				return JSON.stringify(data, null, 2);
			}
		});
		if (nuxt.options.dev) (await createEventClient(nuxt)).on("components:rename", (data) => onComponentsRename(nuxt, data));
	}
});
function append(plugins, target, ...keys) {
	for (const key of keys) target = target[key] ??= {};
	(target.plugins ??= []).push(...plugins);
}
//#endregion
export { module_default as default };
