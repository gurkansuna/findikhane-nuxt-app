import { captureStackTrace } from "errx";
//#region src/app/utils.ts
/** @since 3.9.0 */
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}
const BOT_RE = /bot\b|chrome-lighthouse|facebookexternalhit|google\b/i;
function isBotUserAgent(userAgent) {
	return BOT_RE.test(userAgent);
}
const distURL = import.meta.url.replace(/\/app\/.*$/, "/");
function getUserTrace() {
	if (!import.meta.dev) return [];
	const trace = captureStackTrace();
	const start = trace.findIndex((entry) => !entry.source.startsWith(distURL));
	const end = trace.toReversed().findIndex((entry) => !entry.source.includes("node_modules") && !entry.source.startsWith(distURL));
	if (start === -1 || end === -1) return [];
	return trace.slice(start, end > 0 ? -end : void 0).map((i) => ({
		...i,
		source: i.source.replace(/^file:\/\//, "")
	}));
}
function getUserCaller() {
	if (!import.meta.dev) return null;
	const { source, line, column } = captureStackTrace().find((entry) => !entry.source.startsWith(distURL)) ?? {};
	if (!source) return null;
	return {
		source: source.replace(/^file:\/\//, ""),
		line,
		column
	};
}
//#endregion
export { getUserCaller, getUserTrace, isBotUserAgent, toArray };
