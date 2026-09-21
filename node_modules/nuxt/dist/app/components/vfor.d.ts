//#region src/app/components/vfor.d.ts
/**
 * Upper bound on `v-for` iterations expanded server-side in a server component or island.
 * Island props are attacker-controllable, so a large numeric `v-for` source is a
 * memory-amplification vector; this caps it.
 *
 * @internal
 */
declare const MAX_VFOR_LENGTH = 10000;
/**
 * Clamp a numeric `v-for` source before iteration. Only numbers are bounded (the
 * amplification vector); other sources are returned unchanged.
 *
 * @internal
 */
declare function vforBound<T>(source: T): T | number;
//#endregion
export { MAX_VFOR_LENGTH, vforBound };