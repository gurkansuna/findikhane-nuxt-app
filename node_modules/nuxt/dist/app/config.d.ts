import { AppConfig } from "nuxt/schema";
//#region src/app/config.d.ts
type DeepPartial<T> = T extends Function ? T : T extends Record<string, any> ? { [P in keyof T]?: DeepPartial<T[P]>; } : T;
declare const _getAppConfig: () => AppConfig;
declare function useAppConfig(): AppConfig;
declare function _replaceAppConfig(newConfig: AppConfig): void;
/**
 * Deep assign the current appConfig with the new one.
 *
 * Will preserve existing properties.
 */
declare function updateAppConfig(appConfig: DeepPartial<AppConfig>): void;
//#endregion
export { DeepPartial, _getAppConfig, _replaceAppConfig, updateAppConfig, useAppConfig };