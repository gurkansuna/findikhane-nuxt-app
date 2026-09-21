export { v as vueTemplateAddon } from './shared/unimport.DosIKnCA.mjs';
import { U as UnimportOptions, b as Unimport, I as Import, c as InstallGlobalOptions, S as ScanDir, d as ScanDirExportsOptions, B as BuiltinPresetName, P as Preset, M as MagicStringResult, e as InlinePreset, T as ToExportsOptions, f as TypeDeclarationOptions } from './shared/unimport.L1_nuc0h.mjs';
export { a as Addon, A as AddonVueDirectivesOptions, g as AddonsOptions, D as DetectImportResult, h as ImportCommon, i as ImportInjectionResult, j as ImportName, k as InjectImportsOptions, l as InjectionUsageRecord, m as ModuleId, n as PackagePreset, o as PathFromResolver, p as PresetImport, q as Thenable, r as UnimportContext, s as UnimportMeta, t as builtinPresets } from './shared/unimport.L1_nuc0h.mjs';
import { StripLiteralOptions } from 'strip-literal';
import MagicString from 'magic-string';
import 'mlly';

declare let version: string;

declare function createUnimport(opts: Partial<UnimportOptions>): Unimport;

declare function installGlobalAutoImports(imports: Import[] | Unimport, options?: InstallGlobalOptions): Promise<any>;

declare function normalizeScanDirs(dirs: (string | ScanDir)[], options?: ScanDirExportsOptions): Required<ScanDir>[];
declare function scanFilesFromDir(dir: ScanDir | ScanDir[], options?: ScanDirExportsOptions): Promise<string[]>;
declare function scanDirExports(dirs: (string | ScanDir)[], options?: ScanDirExportsOptions): Promise<Import[]>;
declare function dedupeDtsExports(exports: Import[]): Import[];
declare function scanExports(filepath: string, includeTypes: boolean, seen?: Set<string>): Promise<Import[]>;

declare function resolvePreset(preset: Preset): Promise<Import[]>;
declare function resolveBuiltinPresets(presets: (BuiltinPresetName | Preset)[]): Promise<Import[]>;

declare const RE_EXCLUDE: RegExp[];
declare const RE_IMPORT_AS: RegExp;
declare const RE_SEPARATOR: RegExp;
/**
 *                                                                             |       |
 *                    destructing   case&ternary    non-call     inheritance   |  id   |
 *                         ↓             ↓             ↓             ↓         |       |
 */
declare const RE_MATCH: RegExp;
declare function stripCommentsAndStrings(code: string, options?: StripLiteralOptions): string;
/**
 * @deprecated renamed to `RE_EXCLUDE`
 */
declare const excludeRE: RegExp[];
/**
 * @deprecated renamed to `RE_IMPORT_AS`
 */
declare const importAsRE: RegExp;
/**
 * @deprecated renamed to `RE_SEPARATOR`
 */
declare const separatorRE: RegExp;
/**
 * @deprecated renamed to `RE_MATCH`
 */
declare const matchRE: RegExp;

declare function defineUnimportPreset(preset: InlinePreset): InlinePreset;
declare function stringifyImports(imports: Import[], isCJS?: boolean): string;
declare function dedupeImports(imports: Import[], warn: (msg: string) => void): any[];
declare function toExports(imports: Import[], fileDir?: string, includeType?: boolean, options?: ToExportsOptions): string;
declare function stripFileExtension(path: string): string;
declare function toTypeDeclarationItems(imports: Import[], options?: TypeDeclarationOptions): string[];
declare function toTypeDeclarationFile(imports: Import[], options?: TypeDeclarationOptions): string;
declare function toTypeReExports(imports: Import[], options?: TypeDeclarationOptions): string;
declare function getString(code: string | MagicString): string;
declare function getMagicString(code: string | MagicString): MagicString;
declare function addImportToCode(code: string | MagicString, imports: Import[], isCJS?: boolean, mergeExisting?: boolean, injectAtLast?: boolean, firstOccurrence?: number, onResolved?: (imports: Import[]) => void | Import[], onStringified?: (str: string, imports: Import[]) => void | string): MagicStringResult;
declare function normalizeImports(imports: Import[]): Import[];
declare function resolveIdAbsolute(id: string, parentId?: string): string;
/**
 * @deprecated renamed to `stringifyImports`
 */
declare const toImports: typeof stringifyImports;

export { BuiltinPresetName, Import, InlinePreset, InstallGlobalOptions, MagicStringResult, Preset, RE_EXCLUDE, RE_IMPORT_AS, RE_MATCH, RE_SEPARATOR, ScanDir, ScanDirExportsOptions, ToExportsOptions, TypeDeclarationOptions, Unimport, UnimportOptions, addImportToCode, createUnimport, dedupeDtsExports, dedupeImports, defineUnimportPreset, excludeRE, getMagicString, getString, importAsRE, installGlobalAutoImports, matchRE, normalizeImports, normalizeScanDirs, resolveBuiltinPresets, resolveIdAbsolute, resolvePreset, scanDirExports, scanExports, scanFilesFromDir, separatorRE, stringifyImports, stripCommentsAndStrings, stripFileExtension, toExports, toImports, toTypeDeclarationFile, toTypeDeclarationItems, toTypeReExports, version };
