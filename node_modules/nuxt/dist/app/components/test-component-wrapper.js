import { renderDiagnostics } from "../diagnostics/render.js";
import { defineComponent, h } from "vue";
import { devRootDir } from "#build/nuxt.config.mjs";
import { parseQuery } from "vue-router";
import { isAbsolute, relative, resolve } from "pathe";
//#region src/app/components/test-component-wrapper.ts
const testComponentWrapper = (url) => defineComponent({
	name: "NuxtTestComponentWrapper",
	inheritAttrs: false,
	async setup(props, { attrs }) {
		const query = parseQuery(new URL(url, "http://localhost").search);
		let urlProps = {};
		if (query.props) try {
			const parsedProps = JSON.parse(query.props);
			if (parsedProps && typeof parsedProps === "object") urlProps = parsedProps;
		} catch {}
		const path = resolve(query.path);
		const rel = relative(devRootDir, path);
		if (rel.startsWith("..") || isAbsolute(rel)) throw renderDiagnostics.NUXT_E4008({ path });
		const comp = await import(
			/* @vite-ignore */
			path
).then((r) => r.default);
		return () => [h("div", "Component Test Wrapper for " + path), h("div", { id: "nuxt-component-root" }, [h(comp, {
			...attrs,
			...props,
			...urlProps
		})])];
	}
});
//#endregion
export { testComponentWrapper as default };
