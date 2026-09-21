import { HookableCore } from 'hookable';
import { U as Unhead, S as SSRHeadPayload, g as ServerHeadHooks, a as CreateServerHeadOptions } from './unhead.DOLtbwf7.mjs';
import { R as ResolvableHead } from './unhead.DC0v7nqS.mjs';

interface ServerUnhead<T = ResolvableHead> extends Unhead<T, SSRHeadPayload> {
    hooks: HookableCore<ServerHeadHooks>;
}
declare function createHead<T = ResolvableHead>(options?: CreateServerHeadOptions): ServerUnhead<T>;

export { createHead as c };
export type { ServerUnhead as S };
