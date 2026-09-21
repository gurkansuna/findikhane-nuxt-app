import { NuxtError } from "./error.js";
import { AsyncData, AsyncDataOptions, KeysOf, MultiWatchSources, PickFrom, _Transform } from "./asyncData.js";
import { MaybeRefOrGetter, Ref } from "vue";
import { $Fetch, AvailableRouterMethod, NitroFetchRequest, TypedInternalResponse } from "nitropack/types";
import { FetchOptions, ResponseType } from "ofetch";
//#region src/app/composables/fetch.d.ts
type AvailableRouterMethod$1<R extends NitroFetchRequest> = AvailableRouterMethod<R> | Uppercase<AvailableRouterMethod<R>>;
type FetchResult<ReqT extends NitroFetchRequest, M extends AvailableRouterMethod$1<ReqT>> = TypedInternalResponse<ReqT, unknown, Lowercase<M>>;
type ComputedOptions<T extends Record<string, any>> = { [K in keyof T]: T[K] extends Function ? T[K] : ComputedOptions<T[K]> | MaybeRefOrGetter<T[K]>; };
interface NitroFetchOptions<R extends NitroFetchRequest, M extends AvailableRouterMethod$1<R> = AvailableRouterMethod$1<R>, DataT = any> extends Omit<FetchOptions<ResponseType, DataT>, 'cache'> {
  method?: M;
  cache?: FetchOptions<ResponseType, DataT>['cache'] | false;
}
type ComputedFetchOptions<R extends NitroFetchRequest, M extends AvailableRouterMethod$1<R>, DataT = any> = ComputedOptions<NitroFetchOptions<R, M, DataT>>;
interface UseFetchOptions<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = undefined, R extends NitroFetchRequest = string & {}, M extends AvailableRouterMethod$1<R> = AvailableRouterMethod$1<R>> extends Omit<AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>, 'watch'>, Omit<ComputedFetchOptions<R, M, DataT>, 'timeout'> {
  key?: MaybeRefOrGetter<string>;
  $fetch?: $Fetch;
  watch?: MultiWatchSources | false;
}
interface UseFetchOptionsWithTransform<ResT, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = undefined, R extends NitroFetchRequest = string & {}, M extends AvailableRouterMethod$1<R> = AvailableRouterMethod$1<R>> extends Omit<UseFetchOptions<ResT, DataT, PickKeys, DefaultT, R, M>, 'transform'> {
  transform: _Transform<ResT, DataT>;
}
type FetchFactoryDataT<FDataT, _ResT> = [unknown] extends [FDataT] ? _ResT : FDataT;
type FetchFactoryDefaultT<FDefaultT, Fallback> = [undefined] extends [FDefaultT] ? Fallback : FDefaultT;
type FetchFactoryPickKeys<FPickKeys, PickKeys, DataT> = [Array<never>] extends [FPickKeys] ? PickKeys : FPickKeys & KeysOf<DataT>;
interface UseFetch<FDataT = unknown, FPickKeys extends KeysOf<FDataT> = never[], FDefaultT = undefined> {
  <ResT = void, ErrorT = NuxtError<unknown>, ReqT extends NitroFetchRequest = NitroFetchRequest, const Method extends AvailableRouterMethod$1<ReqT> = ResT extends void ? 'get' extends AvailableRouterMethod$1<ReqT> ? 'get' : AvailableRouterMethod$1<ReqT> : AvailableRouterMethod$1<ReqT>, _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT, DataT = _ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FetchFactoryDefaultT<FDefaultT, undefined>>(request: Ref<ReqT> | ReqT | (() => ReqT), opts: UseFetchOptionsWithTransform<_ResT, DataT, PickKeys, DefaultT, ReqT, Method>): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT | undefined>;
  <ResT = void, ErrorT = NuxtError<unknown>, ReqT extends NitroFetchRequest = NitroFetchRequest, const Method extends AvailableRouterMethod$1<ReqT> = ResT extends void ? 'get' extends AvailableRouterMethod$1<ReqT> ? 'get' : AvailableRouterMethod$1<ReqT> : AvailableRouterMethod$1<ReqT>, _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT, DataT = _ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FetchFactoryDefaultT<FDefaultT, DataT>>(request: Ref<ReqT> | ReqT | (() => ReqT), opts: UseFetchOptionsWithTransform<_ResT, DataT, PickKeys, DefaultT, ReqT, Method>): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT | undefined>;
  <ResT = void, ErrorT = NuxtError<unknown>, ReqT extends NitroFetchRequest = NitroFetchRequest, const Method extends AvailableRouterMethod$1<ReqT> = ResT extends void ? 'get' extends AvailableRouterMethod$1<ReqT> ? 'get' : AvailableRouterMethod$1<ReqT> : AvailableRouterMethod$1<ReqT>, _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT, DataT = FetchFactoryDataT<FDataT, _ResT>, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FetchFactoryDefaultT<FDefaultT, undefined>>(request: Ref<ReqT> | ReqT | (() => ReqT), opts?: UseFetchOptions<_ResT, DataT, PickKeys, DefaultT, ReqT, Method>): AsyncData<PickFrom<DataT, FetchFactoryPickKeys<FPickKeys, PickKeys, DataT>> | DefaultT, ErrorT | undefined>;
  <ResT = void, ErrorT = NuxtError<unknown>, ReqT extends NitroFetchRequest = NitroFetchRequest, const Method extends AvailableRouterMethod$1<ReqT> = ResT extends void ? 'get' extends AvailableRouterMethod$1<ReqT> ? 'get' : AvailableRouterMethod$1<ReqT> : AvailableRouterMethod$1<ReqT>, _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT, DataT = FetchFactoryDataT<FDataT, _ResT>, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FetchFactoryDefaultT<FDefaultT, DataT>>(request: Ref<ReqT> | ReqT | (() => ReqT), opts?: UseFetchOptions<_ResT, DataT, PickKeys, DefaultT, ReqT, Method>): AsyncData<PickFrom<DataT, FetchFactoryPickKeys<FPickKeys, PickKeys, DataT>> | DefaultT, ErrorT | undefined>;
  <ResT = void, ErrorT = NuxtError<unknown>, ReqT extends NitroFetchRequest = NitroFetchRequest, const Method extends AvailableRouterMethod$1<ReqT> = ResT extends void ? 'get' extends AvailableRouterMethod$1<ReqT> ? 'get' : AvailableRouterMethod$1<ReqT> : AvailableRouterMethod$1<ReqT>, _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT, DataT = _ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = undefined>(request: Ref<ReqT> | ReqT | (() => ReqT), arg1?: string | UseFetchOptions<_ResT, DataT, PickKeys, DefaultT, ReqT, Method>, arg2?: string): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT | undefined>;
}
interface CreateUseFetch {
  <FResT = void, FReqT extends NitroFetchRequest = NitroFetchRequest, const FMethod extends AvailableRouterMethod$1<FReqT> = FResT extends void ? 'get' extends AvailableRouterMethod$1<FReqT> ? 'get' : AvailableRouterMethod$1<FReqT> : AvailableRouterMethod$1<FReqT>, F_ResT = FResT extends void ? FetchResult<FReqT, FMethod> : FResT, FDataT = F_ResT, FPickKeys extends KeysOf<FDataT> = KeysOf<FDataT>, FDefaultT = undefined>(options?: Partial<UseFetchOptions<F_ResT, FDataT, FPickKeys, FDefaultT, FReqT, FMethod>> | ((callerOptions: UseFetchOptions<unknown>) => Partial<UseFetchOptions<F_ResT, FDataT, FPickKeys, FDefaultT, FReqT, FMethod>>)): UseFetch<FDataT, FPickKeys, FDefaultT>;
}
/**
 * A factory function to create a custom `useFetch` composable with pre-defined default options.
 * @since 4.2.0
 */
declare const createUseFetch: CreateUseFetch;
declare const useFetch: UseFetch;
declare const useLazyFetch: UseFetch;
//#endregion
export { CreateUseFetch, FetchResult, UseFetch, UseFetchOptions, UseFetchOptionsWithTransform, createUseFetch, useFetch, useLazyFetch };