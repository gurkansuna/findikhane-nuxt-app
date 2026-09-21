import { parse } from 'acorn';
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

const detectImportsAcorn = createEstreeDetector(
  (code) => parse(code, {
    sourceType: "module",
    ecmaVersion: "latest",
    locations: true
  })
);

export { detectImportsAcorn };
