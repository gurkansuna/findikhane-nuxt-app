import * as unplugin from 'unplugin';
import { FilterPattern } from 'unplugin-utils';
import { UnimportOptions } from './index.mjs';
import 'magic-string';
import 'mlly';

interface UnimportPluginOptions extends UnimportOptions {
    include: FilterPattern;
    exclude: FilterPattern;
    dts: boolean | string;
    /**
     * Enable implicit auto import.
     * Generate global TypeScript definitions.
     *
     * @default true
     */
    autoImport?: boolean;
}
declare const defaultIncludes: RegExp[];
declare const defaultExcludes: RegExp[];
declare const _default: unplugin.UnpluginInstance<Partial<UnimportPluginOptions>, false>;

export { _default as default, defaultExcludes, defaultIncludes };
export type { UnimportPluginOptions };
