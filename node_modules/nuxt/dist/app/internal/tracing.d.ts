//#region src/app/internal/tracing.d.ts
/**
 * Server-side diagnostics-channel tracing helper for Nuxt-owned subsystems.
 *
 * Channels published via this helper:
 * - `nuxt.render` (page-level Vue render, both buffered `renderToString` and
 *   streamed responses; payload includes `streaming: boolean`)
 * - `nuxt.island` (per-island `renderToString`)
 * - `nuxt.data` (`useAsyncData` / `useFetch` handler executions)
 * - `nuxt.plugin` (Nuxt app plugin invocations)
 *
 * Channel names follow the [untracing](https://github.com/unjs/untracing)
 * `{namespace}.{operation}` convention.
 *
 * Callers are responsible for gating on `tracingChannelNuxt` and
 * `import.meta.server`; this module only probes for `node:diagnostics_channel`
 * at runtime.
 *
 * @experimental Channel names, payload shapes, and option keys may change.
 */
/**
 * Wrap a (possibly sync) function with a tracing channel. When the channel is
 * unavailable or has no subscribers, the helper returns `fn()` directly so
 * sync callers don't pay an extra microtask hop; when there is a subscriber it
 * delegates to `tracingChannel.tracePromise`, which emits `start`, `end`,
 * `asyncStart`, `asyncEnd`, and `error` sub-channels per Node's
 * `TracingChannel` API.
 *
 * The return type is overloaded: an always-async `fn` produces an always-async
 * result (so call sites can `.then` / `.catch` directly), while a possibly-sync
 * `fn` produces `Promise<T> | T` and the call site is expected to `await` it.
 */
declare function traceAsync<T, C>(name: string, context: C, fn: () => Promise<T>): Promise<T>;
declare function traceAsync<T, C>(name: string, context: C, fn: () => Promise<T> | T): Promise<T> | T;
//#endregion
export { traceAsync };