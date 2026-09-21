//#region src/app/utils/debounce-tick.d.ts
interface DebounceTickOptions {
  /**
   * Call `fn` immediately on the leading edge, instead of waiting for the next flush.
   * @default false
   */
  readonly leading?: boolean;
}
/**
 * Debounce an async function so that repeated calls within the same tick are
 * collapsed into a single call (plus a trailing call if arguments arrived
 * while the debounced call was still pending).
 *
 * Adapted from https://github.com/unjs/perfect-debounce with the timeout
 * replaced by Vue's post-flush callback queue.
 */
declare function debounceTick<ArgumentsT extends unknown[], ReturnT>(fn: (...args: ArgumentsT) => PromiseLike<ReturnT> | ReturnT, options?: DebounceTickOptions): (...args: ArgumentsT) => Promise<ReturnT>;
//#endregion
export { DebounceTickOptions, debounceTick };