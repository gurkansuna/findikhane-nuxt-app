//#region src/app/utils/hash.d.ts
/**
 * Hash an arbitrary value into a short, stable string key.
 *
 * Values are serialized to a canonical, locale-independent representation
 * (equal structures hash equally regardless of key order or runtime locale),
 * then digested with a fast non-cryptographic hash. This is what `useFetch` and
 * `useAsyncData` use internally to derive their cache keys, so it is safe to use
 * for the same purpose in your own code.
 *
 * The digest is non-cryptographic and must not be used for integrity checks.
 *
 * @since 4.5.0
 */
declare function hashKey(value: unknown): string;
declare function hashFunction(fn: (...args: any[]) => any): string;
//#endregion
export { hashFunction, hashKey };