/**
 * Ensures the main bundle size does not increase (default import stays small).
 * Run from repo root: node tests/packaging/check-bundle-size.mjs
 * Only checks dist/main.js and dist/main.mjs; optional frequency/name lists are excluded.
 * Tree-shaking (names and frequency lists not in default-only consumer bundle) is verified by check-tree-shake.mjs in this folder.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const distMainJs = path.join(repoRoot, 'dist/main.js');
const distMainMjs = path.join(repoRoot, 'dist/main.mjs');

const MAX_MAIN_JS_BYTES = 65_000;
const MAX_MAIN_MJS_BYTES = 65_000;

function getSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (err) {
    return null;
  }
}

const mainJsSize = getSize(distMainJs);
const mainMjsSize = getSize(distMainMjs);

if (mainJsSize == null || mainMjsSize == null) {
  console.error('Bundle size check failed: dist/main.js or dist/main.mjs not found. Run npm run build first.');
  process.exit(1);
}

let failed = false;
if (mainJsSize > MAX_MAIN_JS_BYTES) {
  console.error(`dist/main.js size ${mainJsSize} exceeds limit ${MAX_MAIN_JS_BYTES}`);
  failed = true;
}
if (mainMjsSize > MAX_MAIN_MJS_BYTES) {
  console.error(`dist/main.mjs size ${mainMjsSize} exceeds limit ${MAX_MAIN_MJS_BYTES}`);
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log('Bundle size check passed');
console.log(`  main.js:  ${mainJsSize} bytes`);
console.log(`  main.mjs: ${mainMjsSize} bytes`);
