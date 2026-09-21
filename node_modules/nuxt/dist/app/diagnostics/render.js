import { docsBase, prodReporters, reporters } from "./_shared.js";
import { defineDiagnostics, defineProdDiagnostics } from "nostics";
//#region src/app/diagnostics/render.ts
/**
* E4xxx
* Layout / component / island rendering runtime diagnostics.
*/
const renderDiagnostics = !import.meta.dev ? /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
}) : /* #__PURE__ */ defineDiagnostics({
	docsBase,
	reporters,
	codes: {
		NUXT_E4001: {
			why: (p) => `Invalid layout \`${p.layout}\` selected. Available layouts: ${p.available}.`,
			fix: (p) => `Create a \`layouts/${p.layout}.vue\` file, or use one of the available layouts.`,
			docs: false
		},
		NUXT_E4002: {
			why: (p) => `\`${p.name}\` layout does not have a single root node and will cause errors when navigating between routes.`,
			fix: "Wrap the layout's template in a single root element (e.g. a `<div>`).",
			docs: false
		},
		NUXT_E4003: {
			why: "`<NuxtLayout>` needs to be passed a single root node in its default slot.",
			fix: "Wrap the content inside `<NuxtLayout>` in a single root element.",
			docs: false
		},
		NUXT_E4004: {
			why: (p) => `\`${p.filename}\` does not have a single root node and will cause errors when navigating between routes.`,
			fix: "Wrap the page component's template in a single root element (e.g. a `<div>`).",
			docs: false
		},
		NUXT_E4005: {
			why: (p) => `Server component "${p.name}" must have a single root element. (HTML comments are considered elements as well.)`,
			fix: "Wrap the server component's template in a single root element (e.g. a `<div>`).",
			docs: false
		},
		NUXT_E4006: {
			why: "SSR rendering failed inside `<NuxtClientFallback>`, falling back to client-side rendering.",
			fix: "Fix the SSR error in the wrapped component. The client-side fallback will be used until then.",
			docs: false
		},
		NUXT_E4007: {
			why: "Your project has layouts but the `<NuxtLayout />` component has not been used. If `<NuxtLayout>` is rendered conditionally, this warning can be triggered before it is mounted.",
			fix: "Add `<NuxtLayout>` to your `app.vue`, or remove the `layouts/` directory if you don't use layouts.",
			docs: false
		},
		NUXT_E4008: {
			why: (p) => `Cannot access path outside of project root directory: \`${p.path}\`.`,
			fix: "Use a path within the project root directory for the test component wrapper.",
			docs: false
		},
		NUXT_E4009: {
			why: "You can't nest one `<a>` inside another `<a>`. This will cause a hydration error on client-side.",
			fix: "Pass the `custom` prop to take full control of the markup.",
			docs: false
		},
		NUXT_E4010: {
			why: (p) => `[${p.componentName}] \`${p.main}\` and \`${p.sub}\` cannot be used together. \`${p.sub}\` will be ignored.`,
			fix: (p) => `Remove the \`${p.sub}\` prop and use only \`${p.main}\`.`,
			docs: false
		},
		NUXT_E4011: {
			why: "Your project has pages but the `<NuxtPage />` component has not been used. You might be using the `<RouterView />` component instead, which will not work correctly in Nuxt. If `<NuxtPage>` is rendered conditionally, this warning can be triggered before it is mounted.",
			fix: "You can set `pages: false` in `nuxt.config` if you do not wish to use the Nuxt `vue-router` integration.",
			docs: false
		},
		NUXT_E4012: {
			why: (p) => `Failed to parse island response for \`${p.name}\` (HTTP ${p.status}): ${p.detail}`,
			fix: "Check that the server component endpoint is returning valid HTML. The server may have returned an error page."
		},
		NUXT_E4013: {
			why: (p) => `The v-for range expects an integer value but got ${p.source}.`,
			fix: "Use `Math.floor()` or `Math.round()` to convert the value to an integer.",
			docs: false
		},
		NUXT_E4014: {
			why: (p) => `No pages found. \`<NuxtPage>\` requires at least one page component in the \`${p.dir}/\` directory.`,
			fix: (p) => `Create an \`index.vue\` file inside the \`${p.dir}/\` directory.`,
			docs: false
		},
		NUXT_E4015: {
			why: (p) => `Error captured while rendering server component \`${p.name}\`.`,
			fix: "Check the server component implementation for runtime errors.",
			docs: false
		},
		NUXT_E4016: {
			why: (p) => `The route \`${p.fullPath}\` matches a nested page (\`${p.childPath}\`), but the parent page (\`${p.parentPath}\`) does not render \`<NuxtPage />\`, so the nested page cannot be displayed. If \`<NuxtPage />\` is rendered conditionally, this warning can be triggered before it is mounted.`,
			fix: (p) => `Add \`<NuxtPage />\` to the page component for \`${p.parentPath}\`, or restructure your \`pages/\` directory if you did not intend nesting.`
		},
		NUXT_E4017: {
			why: (p) => `A \`v-for\` in a server component asked for ${p.source} iterations; only the first ${p.max} were rendered. Island props come from the request, so the count is capped to bound server-side expansion.`,
			fix: (p) => `Paginate the data, or clamp the value to at most ${p.max} before passing it to the island.`,
			docs: false
		},
		NUXT_E4018: {
			why: (p) => `Island \`${p.name}\` was sent a top-level \`${p.key}\` prop it does not declare. An undeclared prop falls through as an attribute onto the island's root, where a polymorphic component would use it to resolve which component to render, so the request was rejected.`,
			fix: (p) => `Declare \`${p.key}\` as a prop on the island, or set \`inheritAttrs: false\` so request input cannot reach the root element.`,
			docs: false
		}
	}
});
//#endregion
export { renderDiagnostics };
