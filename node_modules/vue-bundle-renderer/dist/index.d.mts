import { C as Manifest, T as defineManifest, n as precomputeDependencies, t as PrecomputedData, w as ResourceMeta } from "./precompute-a6Yf8Tin.mjs";
import { Manifest as Manifest$1 } from "vite";
//#region src/vite.d.ts
export declare function normalizeViteManifest(manifest: Manifest$1 | Manifest): Manifest;
//#endregion
//#region src/webpack.d.ts
type Identifier = string;
type OutputPath = string;
interface WebpackClientManifest {
  publicPath: string;
  all: Array<OutputPath>;
  initial: Array<OutputPath>;
  async: Array<OutputPath>;
  modules: Record<Identifier, Array<number>>;
  hasNoCssVersion?: {
    [file: string]: boolean;
  };
}
export declare function normalizeWebpackManifest(manifest: WebpackClientManifest): Manifest;
//#endregion
export { Manifest, type PrecomputedData, ResourceMeta, defineManifest, precomputeDependencies };