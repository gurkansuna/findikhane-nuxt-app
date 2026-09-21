import crypto from "node:crypto";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { defineDriver } from "unstorage";
import fsDriver from "unstorage/drivers/fs-lite";
import lruCache from "unstorage/drivers/lru-cache";
//#region src/runtime/utils/cache-driver.mjs
/**
* @param {string} item
*/
function normalizeFsKey(item) {
	return `${item.replace(/[^\w.-]/g, "_").slice(0, 20)}-${crypto.createHash("sha256").update(item).digest("hex")}`;
}
/**
* Write `value` to `path` atomically so a concurrent reader never observes a
* truncated file: the payload is written to a unique sibling and renamed over
* the destination, which is a single filesystem operation.
* @param {string} path
* @param {string} value
*/
async function atomicWrite(path, value) {
	await mkdir(dirname(path), { recursive: true });
	const tmp = `${path}.${crypto.randomBytes(8).toString("hex")}.tmp`;
	try {
		await writeFile(tmp, value, "utf8");
		await rename(tmp, path);
	} catch (error) {
		await unlink(tmp).catch(() => {});
		throw error;
	}
}
var cache_driver_default = defineDriver(
	/**
	* @param {{ base?: string }} opts
	*/
	(opts) => {
		const fs = fsDriver({ base: opts.base });
		const lru = lruCache({ max: 1e3 });
		const base = resolve(opts.base || ".");
		return {
			...fs,
			async setItem(key, value, opts) {
				await atomicWrite(join(base, normalizeFsKey(key)), value);
				await lru.setItem?.(key, value, opts);
			},
			async hasItem(key, opts) {
				return await lru.hasItem(key, opts) || await fs.hasItem(normalizeFsKey(key), opts);
			},
			async getItem(key, opts) {
				return await lru.getItem(key, opts) || await fs.getItem(normalizeFsKey(key), opts);
			}
		};
	}
);
//#endregion
export { cache_driver_default as default };
