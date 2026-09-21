import MagicString from "magic-string";
interface TransformerOptions {
  /**
   * The function names to be transformed.
   *
   * @default ['withAsyncContext']
   */
  asyncFunctions?: string[];
  /**
   * @default 'unctx'
   */
  helperModule?: string;
  /**
   * @default 'executeAsync'
   */
  helperName?: string;
  /**
   * Whether to transform properties of an object defined with a helper function. For example,
   * to transform key `middleware` within the object defined with function `defineMeta`, you would pass:
   * `{ defineMeta: ['middleware'] }`.
   * @default {}
   */
  objectDefinitions?: Record<string, string[]>;
}
interface Transformer {
  transform: (code: string, options?: {
    force?: boolean;
  }) => {
    code: string;
    magicString: MagicString;
  } | undefined;
  filter: {
    code: RegExp;
  };
  shouldTransform: (code: string) => boolean;
}
/**
 * Compute the (synchronous) code filter used to cheaply skip files that cannot
 * contain a transformable call. This is exposed separately so the plugin can
 * provide a filter without awaiting the (lazily loaded) transformer.
 */
declare function getTransformFilter(options?: TransformerOptions): {
  code: RegExp;
};
declare function createTransformer(options?: TransformerOptions): Promise<Transformer>;
export { Transformer, TransformerOptions, createTransformer, getTransformFilter };