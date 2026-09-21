import { TransformerOptions } from "./transform.mjs";
import { HookFilter, UnpluginInstance } from "unplugin";
interface UnctxPluginOptions extends TransformerOptions {
  /** Plugin Hook Filter for the transform hook
   * @see https://unplugin.unjs.io/guide/#filters
   */
  transformFilter?: HookFilter;
  /** Function to determine whether a file should be transformed. If possible, use `transformFilter` instead for better performance.  */
  transformInclude?: (id: string) => boolean;
}
declare const unctxPlugin: UnpluginInstance<UnctxPluginOptions, boolean>;
export { UnctxPluginOptions, unctxPlugin };