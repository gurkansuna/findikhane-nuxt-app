import { VueHeadClient } from "@unhead/vue/types";
//#region src/head/runtime/island-head.d.ts
/**
 * No-op `head.push` until the returned `unfreeze` runs. Plugin/transformer
 * augmentations on the same head are unaffected.
 */
declare function freezeHead(head: VueHeadClient): () => void;
//#endregion
export { freezeHead };