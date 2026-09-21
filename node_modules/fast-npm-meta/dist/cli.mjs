#!/usr/bin/env node
import process from "node:process";
import { cac } from "cac";
//#region package.json
var version = "2.2.0";
//#endregion
//#region ../node_modules/.pnpm/is-network-error@1.3.0/node_modules/is-network-error/index.js
const objectToString = Object.prototype.toString;
const isError = (value) => objectToString.call(value) === "[object Error]";
const errorMessages = /* @__PURE__ */ new Set([
	"network error",
	"Failed to fetch",
	"NetworkError when attempting to fetch resource.",
	"The Internet connection appears to be offline.",
	"Network request failed",
	"fetch failed",
	"terminated",
	" A network error occurred.",
	"Network connection lost"
]);
function isNetworkError(error) {
	if (!(error && isError(error) && error.name === "TypeError" && typeof error.message === "string")) return false;
	const { message, stack } = error;
	if (message === "Load failed") return stack === void 0 || "__sentry_captured__" in error;
	if (message.startsWith("error sending request for url")) return true;
	return errorMessages.has(message);
}
//#endregion
//#region ../node_modules/.pnpm/p-retry@8.0.0/node_modules/p-retry/index.js
function validateRetries(retries) {
	if (typeof retries === "number") {
		if (retries < 0) throw new TypeError("Expected `retries` to be a non-negative number.");
		if (Number.isNaN(retries)) throw new TypeError("Expected `retries` to be a valid number or Infinity, got NaN.");
	} else if (retries !== void 0) throw new TypeError("Expected `retries` to be a number or Infinity.");
}
function validateNumberOption(name, value, { min = 0, allowInfinity = false } = {}) {
	if (value === void 0) return;
	if (typeof value !== "number" || Number.isNaN(value)) throw new TypeError(`Expected \`${name}\` to be a number${allowInfinity ? " or Infinity" : ""}.`);
	if (!allowInfinity && !Number.isFinite(value)) throw new TypeError(`Expected \`${name}\` to be a finite number.`);
	if (value < min) throw new TypeError(`Expected \`${name}\` to be \u2265 ${min}.`);
}
function validateFunctionOption(name, value) {
	if (value === void 0) return;
	if (typeof value !== "function") throw new TypeError(`Expected \`${name}\` to be a function.`);
}
var AbortError = class extends Error {
	constructor(message) {
		super();
		if (message instanceof Error) {
			this.originalError = message;
			({message} = message);
		} else {
			this.originalError = new Error(message);
			this.originalError.stack = this.stack;
		}
		this.name = "AbortError";
		this.message = message;
	}
};
function calculateDelay(retriesConsumed, options) {
	const attempt = Math.max(1, retriesConsumed + 1);
	const random = options.randomize ? Math.random() + 1 : 1;
	let timeout = Math.round(random * options.minTimeout * options.factor ** (attempt - 1));
	timeout = Math.min(timeout, options.maxTimeout);
	return timeout;
}
function calculateRemainingTime(start, max) {
	if (!Number.isFinite(max)) return max;
	return max - (performance.now() - start);
}
async function delayForRetry(delay, options) {
	if (delay <= 0) return;
	await new Promise((resolve, reject) => {
		const onAbort = () => {
			clearTimeout(timeoutToken);
			options.signal?.removeEventListener("abort", onAbort);
			reject(options.signal.reason);
		};
		const timeoutToken = setTimeout(() => {
			options.signal?.removeEventListener("abort", onAbort);
			resolve();
		}, delay);
		if (options.unref) timeoutToken.unref?.();
		options.signal?.addEventListener("abort", onAbort, { once: true });
	});
}
async function onAttemptFailure({ error, attemptNumber, retriesConsumed, startTime, options }) {
	const normalizedError = error instanceof Error ? error : /* @__PURE__ */ new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`);
	if (normalizedError instanceof AbortError) throw normalizedError.originalError;
	const retriesLeft = Number.isFinite(options.retries) ? Math.max(0, options.retries - retriesConsumed) : options.retries;
	const maxRetryTime = options.maxRetryTime ?? Number.POSITIVE_INFINITY;
	const delayTime = calculateDelay(retriesConsumed, options);
	if (calculateRemainingTime(startTime, maxRetryTime) <= 0) {
		const context = Object.freeze({
			error: normalizedError,
			attemptNumber,
			retriesLeft,
			retriesConsumed,
			retryDelay: 0
		});
		await options.onFailedAttempt(context);
		throw normalizedError;
	}
	const consumeRetryContext = Object.freeze({
		error: normalizedError,
		attemptNumber,
		retriesLeft,
		retriesConsumed,
		retryDelay: retriesLeft > 0 ? delayTime : 0
	});
	const consumeRetry = await options.shouldConsumeRetry(consumeRetryContext);
	const effectiveDelay = consumeRetry && retriesLeft > 0 ? delayTime : 0;
	const context = Object.freeze({
		error: normalizedError,
		attemptNumber,
		retriesLeft,
		retriesConsumed,
		retryDelay: effectiveDelay
	});
	await options.onFailedAttempt(context);
	if (calculateRemainingTime(startTime, maxRetryTime) <= 0) throw normalizedError;
	if (calculateRemainingTime(startTime, maxRetryTime) <= 0 || retriesLeft <= 0) throw normalizedError;
	if (normalizedError instanceof TypeError && !isNetworkError(normalizedError)) throw normalizedError;
	if (!await options.shouldRetry(context)) throw normalizedError;
	const remainingTimeAfterShouldRetry = calculateRemainingTime(startTime, maxRetryTime);
	if (remainingTimeAfterShouldRetry <= 0) throw normalizedError;
	if (!consumeRetry) {
		options.signal?.throwIfAborted();
		return false;
	}
	const finalDelay = Math.min(effectiveDelay, remainingTimeAfterShouldRetry);
	options.signal?.throwIfAborted();
	await delayForRetry(finalDelay, options);
	options.signal?.throwIfAborted();
	return true;
}
async function pRetry(input, options = {}) {
	options = { ...options };
	validateRetries(options.retries);
	if (Object.hasOwn(options, "forever")) throw new Error("The `forever` option is no longer supported. For many use-cases, you can set `retries: Infinity` instead.");
	options.retries ??= 10;
	options.factor ??= 2;
	options.minTimeout ??= 1e3;
	options.maxTimeout ??= Number.POSITIVE_INFINITY;
	options.maxRetryTime ??= Number.POSITIVE_INFINITY;
	options.randomize ??= false;
	options.onFailedAttempt ??= () => {};
	options.shouldRetry ??= () => true;
	options.shouldConsumeRetry ??= () => true;
	validateFunctionOption("onFailedAttempt", options.onFailedAttempt);
	validateFunctionOption("shouldRetry", options.shouldRetry);
	validateFunctionOption("shouldConsumeRetry", options.shouldConsumeRetry);
	validateNumberOption("factor", options.factor, {
		min: 0,
		allowInfinity: false
	});
	validateNumberOption("minTimeout", options.minTimeout, {
		min: 0,
		allowInfinity: false
	});
	validateNumberOption("maxTimeout", options.maxTimeout, {
		min: 0,
		allowInfinity: true
	});
	validateNumberOption("maxRetryTime", options.maxRetryTime, {
		min: 0,
		allowInfinity: true
	});
	if (!(options.factor > 0)) options.factor = 1;
	options.signal?.throwIfAborted();
	let attemptNumber = 0;
	let retriesConsumed = 0;
	const startTime = performance.now();
	while (Number.isFinite(options.retries) ? retriesConsumed <= options.retries : true) {
		attemptNumber++;
		try {
			options.signal?.throwIfAborted();
			const result = await input(attemptNumber);
			options.signal?.throwIfAborted();
			return result;
		} catch (error) {
			if (await onAttemptFailure({
				error,
				attemptNumber,
				retriesConsumed,
				startTime,
				options
			})) retriesConsumed++;
		}
	}
	throw new Error("Retry attempts exhausted without throwing an error.");
}
//#endregion
//#region src/api.ts
const defaultRetryOptions = {
	retries: 5,
	factor: 2,
	minTimeout: 1e3,
	maxTimeout: Infinity,
	randomize: false
};
const defaultOptions = { 
/**
* API endpoint for fetching package versions
*
* @default 'https://npm.antfu.dev/'
*/
apiEndpoint: "https://npm.antfu.dev/" };
async function getLatestVersionBatch(packages, options = {}) {
	const { apiEndpoint = defaultOptions.apiEndpoint, fetch: fetchApi = fetch, throw: throwError = true, retry = defaultRetryOptions } = options;
	let query = [
		options.force ? "force=true" : "",
		options.metadata ? "metadata=true" : "",
		throwError ? "" : "throw=false"
	].filter(Boolean).join("&");
	if (query) query = `?${query}`;
	const fetchFn = () => fetchApi(new URL(packages.join("+") + query, apiEndpoint)).then((r) => r.json());
	const retryOptions = typeof retry === "number" ? {
		...defaultRetryOptions,
		retries: retry
	} : retry;
	const list = toArray(await (retryOptions === false ? fetchFn() : pRetry(fetchFn, retryOptions)));
	return throwError ? throwErrorObject(list) : list;
}
async function getVersionsBatch(packages, options = {}) {
	const { apiEndpoint = defaultOptions.apiEndpoint, fetch: fetchApi = fetch, throw: throwError = true, retry = defaultRetryOptions } = options;
	let query = [
		options.force ? "force=true" : "",
		options.loose ? "loose=true" : "",
		options.metadata ? "metadata=true" : "",
		options.after ? `after=${encodeURIComponent(options.after)}` : "",
		throwError ? "" : "throw=false"
	].filter(Boolean).join("&");
	if (query) query = `?${query}`;
	const fetchFn = () => fetchApi(new URL(`/versions/${packages.join("+")}${query}`, apiEndpoint)).then((r) => r.json());
	const list = toArray(await (retry === false ? fetchFn() : pRetry(fetchFn, typeof retry === "number" ? {
		...defaultRetryOptions,
		retries: retry
	} : retry)));
	return throwError ? throwErrorObject(list) : list;
}
function throwErrorObject(data) {
	for (const item of toArray(data)) if (item && "error" in item) throw new Error(item.message || item.error);
	return data;
}
function toArray(data) {
	if (Array.isArray(data)) return data;
	return [data];
}
//#endregion
//#region src/cli.ts
const cli = cac("fast-npm-meta");
cli.command("version <...pkgs>", "Get the latest version of one or more packages").option("--json", "Output as JSON").option("--force", "Bypass cache and get the latest data").option("--metadata", "Include version metadata (engines, deprecated, etc.)").option("--api-endpoint <url>", "API endpoint URL").action(async (pkgs, options) => {
	try {
		const results = await getLatestVersionBatch(pkgs, {
			force: options.force,
			metadata: options.metadata,
			apiEndpoint: options.apiEndpoint
		});
		if (options.json) {
			const output = results.length === 1 ? results[0] : results;
			console.log(JSON.stringify(output, null, 2));
		} else for (const result of results) console.log(result.version);
	} catch (e) {
		console.error(e.message);
		process.exit(1);
	}
});
cli.command("full <...pkgs>", "Get full package metadata (versions list, dist-tags, etc.)").option("--force", "Bypass cache and get the latest data").option("--loose", "Include all versions that are newer than the specified version").option("--metadata", "Include per-version metadata (time, engines, deprecated, etc.)").option("--after <date>", "Only return versions published after this ISO date-time").option("--api-endpoint <url>", "API endpoint URL").action(async (pkgs, options) => {
	try {
		const results = await getVersionsBatch(pkgs, {
			force: options.force,
			loose: options.loose,
			metadata: options.metadata,
			after: options.after,
			apiEndpoint: options.apiEndpoint
		});
		const output = results.length === 1 ? results[0] : results;
		console.log(JSON.stringify(output, null, 2));
	} catch (e) {
		console.error(e.message);
		process.exit(1);
	}
});
cli.help();
cli.version(version);
cli.parse();
//#endregion
export {};
