import { renderDiagnostics } from "../diagnostics/render.js";
//#region src/app/components/vfor.ts
/**
* Upper bound on `v-for` iterations expanded server-side in a server component or island.
* Island props are attacker-controllable, so a large numeric `v-for` source is a
* memory-amplification vector; this caps it.
*
* @internal
*/
const MAX_VFOR_LENGTH = 1e4;
/**
* Clamp a numeric `v-for` source before iteration. Only numbers are bounded (the
* amplification vector); other sources are returned unchanged.
*
* @internal
*/
function vforBound(source) {
	if (typeof source !== "number" || source <= 1e4) return source;
	if (import.meta.dev) renderDiagnostics.NUXT_E4017({
		source,
		max: MAX_VFOR_LENGTH
	});
	return MAX_VFOR_LENGTH;
}
//#endregion
export { MAX_VFOR_LENGTH, vforBound };
