import { defineNuxtPlugin } from "../nuxt.js";
import { h } from "vue";
import { devLogs, devRootDir } from "#build/nuxt.config.mjs";
//#region src/app/plugins/dev-server-logs.ts
const devRevivers = import.meta.server ? {} : {
	VNode: (data) => h(data.type, data.props),
	URL: (data) => new URL(data),
	Symbol: (data) => Symbol.for(data)
};
const plugin = /* @__PURE__ */ defineNuxtPlugin(async (nuxtApp) => {
	if (import.meta.test) return;
	if (import.meta.server) {
		nuxtApp.ssrContext.event.context["~payloadReducers"] = nuxtApp.ssrContext["~payloadReducers"];
		return;
	}
	if (devLogs !== "silent") {
		const { createConsola } = await import("consola");
		const logger = createConsola({ formatOptions: {
			colors: true,
			date: true
		} });
		nuxtApp.hook("dev:ssr-logs", (logs) => {
			for (const log of logs) logger.log(normalizeServerLog({ ...log }));
		});
	}
	if (typeof window !== "undefined") {
		const content = document.querySelector(`[data-nuxt-logs="${nuxtApp._id}"]`)?.textContent;
		if (content) {
			const { parse } = await import("devalue");
			const logs = parse(content, {
				...devRevivers,
				...nuxtApp._payloadRevivers
			});
			await nuxtApp.hooks.callHook("dev:ssr-logs", logs);
		}
	}
});
function normalizeFilenames(stack) {
	if (!stack) return "";
	let message = "";
	for (const item of stack) {
		const source = item.source.replace(`${devRootDir}/`, "");
		if (item.function) message += `  at ${item.function} (${source})\n`;
		else message += `  at ${source}\n`;
	}
	return message;
}
function normalizeServerLog(log) {
	log.additional = normalizeFilenames(log.stack);
	log.tag = "ssr";
	delete log.stack;
	return log;
}
//#endregion
export { plugin as default };
