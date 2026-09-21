import { NuxtPayload, NuxtSSRContext, NuxtServerRuntimeHooks, PluginMeta } from "./types.js";
import { RouteMiddleware } from "./composables/router.js";
import { AsyncDataExecuteOptions, AsyncDataRequestStatus } from "./composables/asyncData.js";
import { NuxtAppManifestMeta } from "./composables/manifest.js";
import { LoadingIndicator } from "./composables/loading-indicator.js";
import { RouteAnnouncer } from "./composables/route-announcer.js";
import { NuxtAnnouncer } from "./composables/announcer.js";
import { App, EffectScope, Ref, VNode, onErrorCaptured } from "vue";
import "./types/augments.js";
import { Hookable } from "hookable";
import { UseContext } from "unctx";
import { EventHandlerRequest, H3Event } from "@nuxt/nitro-server/h3";
import { RouteLocationNormalizedLoaded } from "vue-router";
import { LogObject } from "consola";
import { AppConfig, AppConfigInput, RuntimeConfig } from "nuxt/schema";
//#region src/app/nuxt.d.ts
declare function getNuxtAppCtx(id?: string): UseContext<NuxtApp>;
type HookResult = Promise<void> | void;
interface RuntimeNuxtHooks extends NuxtServerRuntimeHooks {
  'app:created': (app: App<Element>) => HookResult;
  'app:beforeMount': (app: App<Element>) => HookResult;
  'app:mounted': (app: App<Element>) => HookResult;
  'app:redirected': () => HookResult;
  'app:suspense:resolve': (Component?: VNode) => HookResult;
  'app:error:cleared': (options: {
    redirect?: string;
  }) => HookResult;
  'app:chunkError': (options: {
    error: any;
  }) => HookResult;
  'app:data:refresh': (keys?: string[]) => HookResult;
  'app:manifest:update': (meta?: NuxtAppManifestMeta) => HookResult;
  'dev:ssr-logs': (logs: LogObject[]) => HookResult;
  'link:prefetch': (link: string) => HookResult;
  'page:start': (Component?: VNode) => HookResult;
  'page:finish': (Component?: VNode) => HookResult;
  'page:transition:finish': (Component?: VNode) => HookResult;
  'page:view-transition:start': (transition: ViewTransition) => HookResult;
  'page:loading:start': () => HookResult;
  'page:loading:end': () => HookResult;
  'vue:setup': () => void;
  'vue:error': (...args: Parameters<Parameters<typeof onErrorCaptured>[0]>) => HookResult;
}
interface _NuxtApp {
  'vueApp': App<Element>;
  'versions': Record<string, string>;
  'hooks': Hookable<RuntimeNuxtHooks>;
  'hook': _NuxtApp['hooks']['hook'];
  'callHook': _NuxtApp['hooks']['callHook'];
  'runWithContext': <T extends () => any>(fn: T) => ReturnType<T> | Promise<Awaited<ReturnType<T>>>;
  [key: string]: unknown;
  /** @internal */
  '_cookies'?: Record<string, unknown>;
  '_cookiesChanged'?: Record<string, boolean>;
  /**
   * The id of the Nuxt application.
   * @internal */
  '_id': string;
  /** @internal */
  '_scope': EffectScope;
  /** @internal */
  '_asyncDataPromises': Record<string, Promise<any> | undefined>;
  /** @internal */
  '_asyncData': Record<string, {
    data: Ref<unknown>;
    pending: Ref<boolean>;
    error: Ref<Error | undefined>;
    status: Ref<AsyncDataRequestStatus>;
    execute: (opts?: AsyncDataExecuteOptions) => Promise<void>;
    /** @internal */
    _default: () => unknown;
    /** @internal */
    _deps: number;
    /** @internal */
    _off: () => void;
    /** @internal */
    _init: boolean;
    /** @internal */
    _execute: (opts?: AsyncDataExecuteOptions) => Promise<void>;
    /** @internal */
    _hash?: Record<string, string | undefined>;
    /** @internal */
    _abortController?: AbortController;
    /** @internal */
    _initialCachedData?: unknown;
  } | undefined>;
  /** @internal */
  '_state': Record<string, {
    /** @internal */
    _default: () => unknown;
  } | undefined>;
  /** @internal */
  '_loadingIndicator'?: LoadingIndicator;
  /** @internal */
  '_loadingIndicatorDeps'?: number;
  /** @internal */
  '_middleware': {
    global: RouteMiddleware[];
    named: Record<string, RouteMiddleware>;
  };
  /** @internal */
  '_processingMiddleware'?: string | boolean;
  /** @internal */
  '_middlewareTo'?: Pick<RouteLocationNormalizedLoaded, 'meta'>;
  /** @internal */
  '_once': {
    [key: string]: Promise<any>;
  };
  /** @internal */
  '_observer'?: {
    observe: (element: Element, callback: () => void) => () => void;
  };
  /** @internal */
  '_appConfig': AppConfig;
  /** @internal */
  '_route': RouteLocationNormalizedLoaded & {
    sync?: () => void;
  };
  /**
   * Restore the real route after a prerendered page hydrates against the query-less
   * payload route. Called by `<NuxtPage>` as its `Suspense` resolves, before mounted hooks flush.
   * @internal
   */
  '~restoreDeferredRoute'?: () => void;
  /** @internal */
  '_islandPromises'?: Record<string, Promise<any>>;
  /** @internal */
  '_payloadRevivers': Record<string, (data: any) => any>;
  /** @internal */
  '_routeAnnouncer'?: RouteAnnouncer;
  /** @internal */
  '_routeAnnouncerDeps'?: number;
  /** @internal */
  '~transitionPromise'?: Promise<void>;
  /** @internal */
  '~transitionFinish'?: () => void;
  /** @internal */
  '_announcer'?: NuxtAnnouncer;
  /** @internal */
  '_announcerDeps'?: number;
  '$config': RuntimeConfig;
  'isHydrating'?: boolean;
  'deferHydration': () => () => void | Promise<void>;
  'ssrContext'?: NuxtSSRContext;
  'payload': NuxtPayload;
  'static': {
    data: Record<string, any>;
  };
  'provide': (name: string, value: any) => void;
}
interface NuxtApp extends _NuxtApp {}
declare const NuxtPluginIndicator = "__nuxt_plugin";
interface PluginEnvContext {
  /**
   * This enable the plugin for islands components.
   * Require `experimental.componentsIslands`.
   * @default true
   */
  islands?: boolean;
}
interface ResolvedPluginMeta {
  name?: string;
  parallel?: boolean;
}
interface Plugin<Injections extends Record<string, unknown> = Record<string, unknown>> {
  (nuxt: NuxtApp): Promise<void> | Promise<{
    provide?: Injections;
  }> | void | {
    provide?: Injections;
  };
  [NuxtPluginIndicator]?: true;
  meta?: ResolvedPluginMeta;
}
interface ObjectPlugin<Injections extends Record<string, unknown> = Record<string, unknown>> extends PluginMeta {
  hooks?: Partial<RuntimeNuxtHooks>;
  setup?: Plugin<Injections>;
  env?: PluginEnvContext;
  /**
   * Execute plugin in parallel with other parallel plugins.
   * @default false
   */
  parallel?: boolean;
  /**
   * @internal
   */
  _name?: string;
}
/** @deprecated Use `ObjectPlugin` */
type ObjectPluginInput<Injections extends Record<string, unknown> = Record<string, unknown>> = ObjectPlugin<Injections>;
interface CreateOptions {
  vueApp: NuxtApp['vueApp'];
  ssrContext?: NuxtApp['ssrContext'];
  /**
   * The id of the Nuxt application, overrides the default id specified in the Nuxt config (default: `nuxt-app`).
   */
  id?: NuxtApp['_id'];
}
/** @since 3.0.0 */
declare function createNuxtApp(options: CreateOptions): NuxtApp;
/** @since 3.12.0 */
declare function registerPluginHooks(nuxtApp: NuxtApp, plugin: Plugin & ObjectPlugin<any>): void;
/** @since 3.0.0 */
declare function applyPlugin(nuxtApp: NuxtApp, plugin: Plugin & ObjectPlugin<any>): Promise<void>;
/** @since 3.0.0 */
declare function applyPlugins(nuxtApp: NuxtApp, plugins: Array<Plugin & ObjectPlugin<any>>): Promise<void>;
/** @since 3.0.0 */
declare function defineNuxtPlugin<T extends Record<string, unknown>>(plugin: Plugin<T> | ObjectPlugin<T>): Plugin<T> & ObjectPlugin<T>;
declare const definePayloadPlugin: typeof defineNuxtPlugin;
/** @since 3.0.0 */
declare function isNuxtPlugin(plugin: unknown): plugin is Plugin;
/**
 * Ensures that the setup function passed in has access to the Nuxt instance via `useNuxtApp`.
 * @param nuxt A Nuxt instance
 * @param setup The function to call
 * @since 3.0.0
 */
declare function callWithNuxt<T extends (...args: any[]) => any>(nuxt: NuxtApp | _NuxtApp, setup: T, args?: Parameters<T>): Promise<ReturnType<T>>;
/**
 * Returns the current Nuxt instance.
 *
 * Returns `null` if Nuxt instance is unavailable.
 * @since 3.10.0
 */
declare function tryUseNuxtApp(): NuxtApp | null;
/**
 * Returns the current Nuxt instance.
 *
 * Throws an error if Nuxt instance is unavailable.
 * @since 3.0.0
 */
declare function useNuxtApp(): NuxtApp;
/** @since 3.0.0 */
declare function useRuntimeConfig(_event?: H3Event<EventHandlerRequest>): RuntimeConfig;
/** @since 3.0.0 */
declare function defineAppConfig<C extends AppConfigInput>(config: C): C;
//#endregion
export { CreateOptions, NuxtApp, type NuxtPayload, NuxtPluginIndicator, type NuxtSSRContext, ObjectPlugin, ObjectPluginInput, Plugin, PluginEnvContext, type PluginMeta, ResolvedPluginMeta, RuntimeNuxtHooks, applyPlugin, applyPlugins, callWithNuxt, createNuxtApp, defineAppConfig, defineNuxtPlugin, definePayloadPlugin, getNuxtAppCtx, isNuxtPlugin, registerPluginHooks, tryUseNuxtApp, useNuxtApp, useRuntimeConfig };