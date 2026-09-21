import { pathToFileURL } from 'node:url';
import { isPackageExists, resolveModule, importModule } from 'local-pkg';
import { c as createEstreeDetector } from '../shared/unimport.DyX9I00Q.mjs';
import 'estree-walker';
import '../shared/unimport.B4o9Mg_h.mjs';
import 'node:path';
import 'node:process';
import 'pathe';
import 'scule';
import 'magic-string';
import 'mlly';
import 'strip-literal';

let detectorPromise;
async function loadDetector() {
  const paths = [import.meta.url];
  let parseSync;
  if (isPackageExists("rolldown", { paths })) {
    const resolved = resolveModule("rolldown/utils", { paths });
    const url = resolved ? pathToFileURL(resolved).href : "rolldown/utils";
    parseSync = (await importModule(url)).parseSync;
  } else if (isPackageExists("oxc-parser", { paths })) {
    const resolved = resolveModule("oxc-parser", { paths });
    const url = resolved ? pathToFileURL(resolved).href : "oxc-parser";
    parseSync = (await importModule(url)).parseSync;
  } else {
    throw new Error(
      "[unimport] the `oxc` parser requires either `rolldown` or `oxc-parser` to be installed."
    );
  }
  return createEstreeDetector((code, id) => parseSync(id ? id.replace(/\?.*$/, "") : "", code, { sourceType: "module" }).program);
}
async function detectImportsOxc(code, ctx, options, id) {
  detectorPromise ??= loadDetector();
  const detector = await detectorPromise;
  return detector(code, ctx, options, id);
}

export { detectImportsOxc };
