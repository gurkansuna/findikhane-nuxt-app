import { MagicString } from "magic-string";
import { RolldownMagicString } from "rolldown";
//#region src/index.d.ts
type ObjectIntersection<A, B> = { [K in keyof A & keyof B]: A[K]; };
type RolldownString = ObjectIntersection<MagicString, RolldownMagicString>;
declare function rolldownString(code: string, id: string, meta?: any): RolldownString;
type Awaitable<T> = T | Promise<T>;
type HandlerReturn = string | MagicString | RolldownMagicString | RolldownString | void | undefined;
type Handler<Args extends any[], This> = (this: This, s: RolldownString, id: string, ...args: Args) => Awaitable<HandlerReturn>;
declare function withMagicString<Args extends any[], This>(handler: Handler<Args, This>): (this: This, code: string, id: string, ...args: Args) => Awaitable<CodeTransform | undefined>;
/**
 * The result of code transformation.
 */
interface CodeTransform {
  code: any;
  map?: any;
}
/**
 * Generate an object of code and source map from MagicString.
 */
declare function generateTransform(s: MagicString | RolldownMagicString | RolldownString | undefined, id: string, force?: boolean): CodeTransform | undefined;
//#endregion
export { CodeTransform, Handler, HandlerReturn, RolldownString, generateTransform, rolldownString, withMagicString };