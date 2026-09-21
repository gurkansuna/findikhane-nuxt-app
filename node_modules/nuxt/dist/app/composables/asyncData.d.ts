import { NuxtError } from "./error.js";
import { NuxtApp } from "../nuxt.js";
import { MaybeRefOrGetter, MultiWatchSources, Ref } from "vue";
//#region src/app/composables/asyncData.d.ts
type AsyncDataRequestStatus = 'idle' | 'pending' | 'success' | 'error';
type _Transform<Input = any, Output = any> = (input: Input) => Output | Promise<Output>;
type AsyncDataHandler<ResT> = (nuxtApp: NuxtApp, options: {
  signal: AbortSignal;
}) => Promise<ResT>;
type PickFrom<T, K extends Array<string>> = T extends Array<any> ? T : T extends Record<string, any> ? keyof T extends K[number] ? T : K[number] extends never ? T : Pick<T, K[number]> : T;
type KeysOf<T> = Array<T extends T ? keyof T extends string ? keyof T : never : never>;
type KeyOfRes<Transform extends _Transform> = KeysOf<ReturnType<Transform>>;
type NoInfer<T> = [T][T extends any ? 0 : never];
type AsyncDataRefreshCause = 'initial' | 'refresh:hook' | 'refresh:manual' | 'watch';
interface BaseAsyncDataOptions<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = undefined> {
  /**
   * Whether to fetch on the server side.
   * @default true
   */
  server?: boolean;
  /**
   * Whether to resolve the async function after loading the route, instead of blocking client-side navigation
   * @default false
   */
  lazy?: boolean;
  /**
   * a factory function to set the default value of the data, before the async function resolves - useful with the `lazy: true` or `immediate: false` options
   */
  default?: () => DefaultT | Ref<DefaultT>;
  /**
   * Only pick specified keys in this array from the handler function result.
   * Do not use it along with the `transform` option.
   */
  pick?: PickKeys;
  /**
   * Watch reactive sources to auto-refresh when changed
   */
  watch?: MultiWatchSources;
  /**
   * When set to false, will prevent the request from firing immediately
   * @default true
   */
  immediate?: boolean;
  /**
   * Return data in a deep ref object (it is false by default). It can be set to false to return data in a shallow ref object, which can improve performance if your data does not need to be deeply reactive.
   */
  deep?: boolean;
  /**
   * Avoid fetching the same key more than once at a time
   * @default 'cancel'
   */
  dedupe?: 'cancel' | 'defer';
  /**
   * A timeout in milliseconds after which the request will be aborted if it has not resolved yet.
   */
  timeout?: number;
  /**
   * Controls whether to run the async function
   * @default true
   */
  enabled?: MaybeRefOrGetter<boolean>;
}
interface AsyncDataOptions<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = undefined> extends BaseAsyncDataOptions<ResT, DataT, PickKeys, DefaultT> {
  /**
   * Provide a function which returns cached data.
   * An `undefined` return value will trigger a fetch.
   * Default is `key => nuxt.isHydrating ? nuxt.payload.data[key] : nuxt.static.data[key]` which only caches data when payloadExtraction is enabled.
   */
  getCachedData?: (key: string, nuxtApp: NuxtApp, context: {
    cause: AsyncDataRefreshCause;
  }) => NoInfer<DataT> | undefined;
  /**
   * A function that can be used to alter handler function result after resolving.
   * Do not use it along with the `pick` option.
   */
  transform?: _Transform<ResT, DataT>;
}
interface AsyncDataOptionsWithTransform<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = undefined> extends BaseAsyncDataOptions<ResT, DataT, PickKeys, DefaultT> {
  /**
   * Provide a function which returns cached data.
   * An `undefined` return value will trigger a fetch.
   * Default is `key => nuxt.isHydrating ? nuxt.payload.data[key] : nuxt.static.data[key]` which only caches data when payloadExtraction is enabled.
   */
  getCachedData?: (key: string, nuxtApp: NuxtApp, context: {
    cause: AsyncDataRefreshCause;
  }) => NoInfer<DataT | undefined>;
  /**
   * A function that can be used to alter handler function result after resolving.
   * Do not use it along with the `pick` option.
   */
  transform: _Transform<ResT, DataT>;
}
interface AsyncDataExecuteOptions {
  /**
   * Force a refresh, even if there is already a pending request. Previous requests will
   * not be cancelled, but their result will not affect the data/pending state - and any
   * previously awaited promises will not resolve until this new request resolves.
   */
  dedupe?: 'cancel' | 'defer';
  cause?: AsyncDataRefreshCause;
  /** @internal */
  cachedData?: any;
  signal?: AbortSignal;
  timeout?: number;
}
interface _AsyncData<DataT, ErrorT> {
  data: Ref<DataT>;
  pending: Ref<boolean>;
  refresh: (opts?: AsyncDataExecuteOptions) => Promise<void>;
  execute: (opts?: AsyncDataExecuteOptions) => Promise<void>;
  clear: () => void;
  error: Ref<ErrorT | undefined>;
  status: Ref<AsyncDataRequestStatus>;
}
type AsyncData<Data, Error> = _AsyncData<Data, Error> & Promise<_AsyncData<Data, Error>>;
type NuxtErrorFor<NuxtErrorDataT> = NuxtErrorDataT extends Error | NuxtError ? NuxtErrorDataT : NuxtError<NuxtErrorDataT>;
type FactoryDataT<FDataT, ResT> = [unknown] extends [FDataT] ? ResT : FDataT;
type FactoryDefaultT<FDefaultT, Fallback> = [undefined] extends [FDefaultT] ? Fallback : FDefaultT;
type FactoryPickKeys<FPickKeys, PickKeys, DataT> = [Array<never>] extends [FPickKeys] ? PickKeys : FPickKeys & KeysOf<DataT>;
interface UseAsyncData<FResT = unknown, FDataT = unknown, FPickKeys extends KeysOf<FDataT> = never[], FDefaultT = undefined> {
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, undefined>>(handler: AsyncDataHandler<ResT>, opts: AsyncDataOptionsWithTransform<ResT, DataT, PickKeys, DefaultT>): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>;
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, DataT>>(handler: AsyncDataHandler<ResT>, opts: AsyncDataOptionsWithTransform<ResT, DataT, PickKeys, DefaultT>): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>;
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = FactoryDataT<FDataT, ResT>, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, undefined>>(handler: AsyncDataHandler<ResT>, opts?: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>): AsyncData<PickFrom<DataT, FactoryPickKeys<FPickKeys, PickKeys, DataT>> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>;
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = FactoryDataT<FDataT, ResT>, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, DataT>>(handler: AsyncDataHandler<ResT>, opts?: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>): AsyncData<PickFrom<DataT, FactoryPickKeys<FPickKeys, PickKeys, DataT>> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>;
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, undefined>>(key: MaybeRefOrGetter<string>, handler: AsyncDataHandler<ResT>, opts: AsyncDataOptionsWithTransform<ResT, DataT, PickKeys, DefaultT>): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>;
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, DataT>>(key: MaybeRefOrGetter<string>, handler: AsyncDataHandler<ResT>, opts: AsyncDataOptionsWithTransform<ResT, DataT, PickKeys, DefaultT>): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>;
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = FactoryDataT<FDataT, ResT>, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, undefined>>(key: MaybeRefOrGetter<string>, handler: AsyncDataHandler<ResT>, opts?: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>): AsyncData<PickFrom<DataT, FactoryPickKeys<FPickKeys, PickKeys, DataT>> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>;
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = FactoryDataT<FDataT, ResT>, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, DataT>>(key: MaybeRefOrGetter<string>, handler: AsyncDataHandler<ResT>, opts?: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>): AsyncData<PickFrom<DataT, FactoryPickKeys<FPickKeys, PickKeys, DataT>> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>;
}
interface CreateUseAsyncData {
  <FResT, FDataT = FResT, FPickKeys extends KeysOf<FDataT> = KeysOf<FDataT>, FDefaultT = undefined>(options?: Partial<AsyncDataOptions<FResT, FDataT, FPickKeys, FDefaultT>> | ((callerOptions: AsyncDataOptions<unknown>) => Partial<AsyncDataOptions<FResT, FDataT, FPickKeys, FDefaultT>>)): UseAsyncData<FResT, FDataT, FPickKeys, FDefaultT>;
}
declare const createUseAsyncData: CreateUseAsyncData;
declare const useAsyncData: UseAsyncData;
declare const useLazyAsyncData: UseAsyncData;
/** @since 3.1.0 */
declare function useNuxtData<DataT = any>(key: string): {
  data: Ref<DataT | undefined>;
};
/** @since 3.0.0 */
declare function refreshNuxtData(keys?: string | string[]): Promise<void>;
/** @since 3.0.0 */
declare function clearNuxtData(keys?: string | string[] | ((key: string) => boolean)): void;
type CreatedAsyncData<ResT, NuxtErrorDataT = unknown, DataT = ResT, DefaultT = undefined> = Omit<_AsyncData<DataT | DefaultT, (NuxtErrorDataT extends Error | NuxtError ? NuxtErrorDataT : NuxtError<NuxtErrorDataT>)>, 'clear' | 'refresh'> & {
  _off: () => void;
  _hash?: Record<string, string | undefined>;
  _default: () => unknown;
  _init: boolean;
  _deps: number;
  _execute: (opts?: AsyncDataExecuteOptions) => Promise<void>;
  _abortController?: AbortController;
};
//#endregion
export { AsyncData, AsyncDataExecuteOptions, AsyncDataHandler, AsyncDataOptions, AsyncDataOptionsWithTransform, AsyncDataRefreshCause, AsyncDataRequestStatus, CreateUseAsyncData, CreatedAsyncData, KeyOfRes, KeysOf, type MultiWatchSources, NoInfer, PickFrom, UseAsyncData, _AsyncData, _Transform, clearNuxtData, createUseAsyncData, refreshNuxtData, useAsyncData, useLazyAsyncData, useNuxtData };