//#region src/app/utils.d.ts
/** @since 3.9.0 */
declare function toArray<T>(value: T | T[]): T[];
declare function isBotUserAgent(userAgent: string): boolean;
type Trace = {
  source: string;
  line?: number;
  column?: number;
};
declare function getUserTrace(): Trace[];
declare function getUserCaller(): Trace | null;
//#endregion
export { getUserCaller, getUserTrace, isBotUserAgent, toArray };