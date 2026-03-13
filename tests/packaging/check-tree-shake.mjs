/**
 * Verifies that a bundle that only uses the default zxcvbn export does not
 * include the optional name list data (tree-shaking works).
 * Run from tests/packaging: node check-tree-shake.mjs
 * Requires: npm install (so ts-zxcvbn and esbuild are available).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, 'tree-shake-bundle.mjs');

// Distinctive strings that only appear in the optional name lists (Finnish/English).
const NAME_LIST_MARKERS = [
  'aapeli',  // Finnish name list
  'aappo',   // Finnish name list
  'kyösti',  // Finnish name list (with diacritic)
];
// Words that only appear in the optional frequency list (passwords); not in main entry.
const FREQUENCY_LIST_MARKERS = ['qwertyuiop', 'zxcvbnm'];

async function run() {
  await build({
    entryPoints: [path.join(__dirname, 'tree-shake-consumer.mjs')],
    bundle: true,
    format: 'esm',
    outfile: outFile,
    minify: false, // keep readable for assertion
    treeShaking: true,
    platform: 'neutral',
  });

  const bundleContent = fs.readFileSync(outFile, 'utf8');

  const foundNames = NAME_LIST_MARKERS.filter((m) => bundleContent.includes(m));
  if (foundNames.length > 0) {
    console.error(
      'Tree-shake check failed: bundle that only uses default zxcvbn should not include name list data.'
    );
    console.error('Found name-list markers in bundle:', foundNames.join(', '));
    process.exit(1);
  }

  const foundFreq = FREQUENCY_LIST_MARKERS.filter((m) => bundleContent.includes(m));
  if (foundFreq.length > 0) {
    console.error(
      'Tree-shake check failed: bundle that only uses default zxcvbn should not include frequency list data.'
    );
    console.error('Found frequency-list markers in bundle:', foundFreq.join(', '));
    process.exit(1);
  }

  console.log('Tree-shake check passed: name and frequency lists are not included in default-only consumer bundle');
  try {
    fs.unlinkSync(outFile);
  } catch {
    // ignore cleanup errors
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
