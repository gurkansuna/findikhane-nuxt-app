export { b as builtinPresets, c as createUnimport, d as dedupeDtsExports, n as normalizeScanDirs, r as resolveBuiltinPresets, a as resolvePreset, s as scanDirExports, e as scanExports, f as scanFilesFromDir, v as version } from './shared/unimport.GgRQatam.mjs';
export { R as RE_EXCLUDE, b as RE_IMPORT_AS, c as RE_MATCH, d as RE_SEPARATOR, e as addImportToCode, f as dedupeImports, g as defineUnimportPreset, h as excludeRE, i as getMagicString, j as getString, k as importAsRE, m as matchRE, n as normalizeImports, r as resolveIdAbsolute, s as separatorRE, l as stringifyImports, o as stripCommentsAndStrings, p as stripFileExtension, t as toExports, q as toImports, u as toTypeDeclarationFile, w as toTypeDeclarationItems, x as toTypeReExports, a as vueTemplateAddon } from './shared/unimport.B4o9Mg_h.mjs';
import 'mlly';
import 'node:fs';
import 'node:fs/promises';
import 'node:process';
import 'node:url';
import 'pathe';
import 'picomatch';
import 'scule';
import 'tinyglobby';
import 'node:os';
import 'pkg-types';
import 'local-pkg';
import 'node:path';
import 'magic-string';
import 'strip-literal';

async function installGlobalAutoImports(imports, options = {}) {
  const {
    globalObject = globalThis,
    overrides = false
  } = options;
  imports = Array.isArray(imports) ? imports : await imports.getImports();
  await Promise.all(
    imports.map(async (i) => {
      if (i.disabled || i.type)
        return;
      const as = i.as || i.name;
      if (overrides || !(as in globalObject)) {
        const module = await import(i.from);
        globalObject[as] = module[i.name];
      }
    })
  );
  return globalObject;
}

export { installGlobalAutoImports };
