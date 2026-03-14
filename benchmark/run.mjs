/**
 * Benchmark: compare ts-zxcvbn, zxcvbn, zxcvbn-typescript, and @zxcvbn-ts/core
 * on the same password set. Run from repo root: npm run benchmark
 * (or from here: npm run benchmark)
 * Write JSON for the docs chart: npm run benchmark -- --out=../docs/benchmark-results.json
 */

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const require = createRequire(import.meta.url);

const outPath = process.argv
  .find((a) => a.startsWith('--out='))
  ?.slice('--out='.length);

// Varied password set: short, long, dictionary-like, numbers, symbols, etc.
const PASSWORDS = [
  'a',
  'password',
  '123456',
  'qwerty',
  'Tr0ub4dour&3',
  'correcthorsebatterystaple',
  'P@ssw0rd!',
  'aaaaaaaa',
  'abc123',
  'monkey',
  'dragon',
  'letmein',
  'trustno1',
  'sunshine',
  'master',
  'welcome',
  'shadow',
  'ashley',
  'football',
  'jesus',
  'michael',
  'ninja',
  'mustang',
  'password1',
  'password123',
  'admin',
  'root',
  'pass',
  'test',
  'guest',
  '12345678',
  'qwerty123',
  'iloveyou',
  'welcome1',
  'charlie',
  'aa123456',
  'donald',
  'qwertyuiop',
  '123qwe',
  '1q2w3e4r',
  'baseball',
  'superman',
  'hello',
  'chocolate',
  'secret',
  'freedom',
  'whatever',
  'qazwsx',
  'login',
  'starwars',
  'klaster',
  '112233',
  'passw0rd',
  'access',
  'flower',
  '555555',
  'maggie',
  'pepper',
  'andrew',
  'joshua',
  'matthew',
  'bailey',
  'zxcvbnm',
  'nintendo',
  'thunder',
  'summer',
  'cookie',
  'chelsea',
  'amanda',
  'jessica',
  'anthony',
  'daniel',
  '654321',
  'jordan',
  'michael1',
  'eclipse',
  'harley',
  'ranger',
  'ginger',
  'soccer',
  'batman',
  'tigger',
  'samsung',
  'andrea',
  'william',
  'boston',
  'yankees',
  'liverpool',
  'q1w2e3r4',
  '1234567890',
  'Password1!',
  'MyP@ssw0rd',
  'C0mpl3x!ty',
  'correct-horse-battery-staple',
  'correct horse battery staple',
];

const MAX_ITERATIONS = 200;
const TARGET_MS = 5000; // aim for ~5s per implementation so slow ones don't run too long
const WARMUP_ROUNDS = 2;

function runBenchmark(name, fn) {
  // Warmup
  for (let w = 0; w < WARMUP_ROUNDS; w++) {
    for (const pwd of PASSWORDS) {
      fn(pwd);
    }
  }
  // Probe: one full pass to estimate time per iteration
  const probeStart = performance.now();
  for (const pwd of PASSWORDS) {
    fn(pwd);
  }
  const probeElapsed = performance.now() - probeStart;
  const iterations = Math.max(
    1,
    Math.min(MAX_ITERATIONS, Math.floor(TARGET_MS / probeElapsed))
  );
  // Timed run
  const start = performance.now();
  let count = 0;
  for (let i = 0; i < iterations; i++) {
    for (const pwd of PASSWORDS) {
      fn(pwd);
      count++;
    }
  }
  const elapsed = performance.now() - start;
  const opsPerSec = Math.round((count / elapsed) * 1000);
  return { name, opsPerSec, elapsed: Math.round(elapsed), iterations };
}

const results = [];

// --- ts-zxcvbn ---
try {
  const { default: zxcvbn } = await import('ts-zxcvbn');
  results.push(runBenchmark('ts-zxcvbn', (pwd) => zxcvbn(pwd)));
} catch (err) {
  console.error('ts-zxcvbn: not installed or failed to load', err.message);
}

// --- ts-zxcvbn with optional lists (largest password list + English names) ---
try {
  const { default: zxcvbn } = await import('ts-zxcvbn');
  const { default: passwordsList } =
    await import('ts-zxcvbn/frequencies/passwords');
  const { default: namesEn } = await import('ts-zxcvbn/names/english');
  const fn = (pwd) => zxcvbn(pwd, { passwords: passwordsList, names: namesEn });
  results.push(runBenchmark('ts-zxcvbn (passwords + names)', fn));
} catch (err) {
  console.error(
    'ts-zxcvbn (passwords + names): not installed or failed to load',
    err.message
  );
}

// --- zxcvbn (Dropbox original, CJS) ---
try {
  const zxcvbnLegacy = require('zxcvbn');
  const fn = (pwd) => zxcvbnLegacy(pwd);
  results.push(runBenchmark('zxcvbn', fn));
} catch (err) {
  console.error('zxcvbn: not installed or failed to load', err.message);
}

// --- zxcvbn-typescript ---
try {
  const mod = await import('zxcvbn-typescript');
  const zxcvbnTs = mod.zxcvbn ?? mod.default;
  const fn = (pwd) => zxcvbnTs(pwd);
  results.push(runBenchmark('zxcvbn-typescript', fn));
} catch (err) {
  console.error(
    'zxcvbn-typescript: not installed or failed to load',
    err.message
  );
}

// --- @zxcvbn-ts/core ---
try {
  const { zxcvbn: zxcvbnCore, zxcvbnOptions } = await import('@zxcvbn-ts/core');
  const zxcvbnCommonPackage = await import('@zxcvbn-ts/language-common');
  const zxcvbnEnPackage = await import('@zxcvbn-ts/language-en');
  zxcvbnOptions.setOptions({
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    translations: zxcvbnEnPackage.translations,
  });
  const fn = (pwd) => zxcvbnCore(pwd);
  results.push(runBenchmark('@zxcvbn-ts/core', fn));
} catch (err) {
  console.error(
    '@zxcvbn-ts/core: not installed or failed to load',
    err.message
  );
}

// --- Report ---
if (results.length === 0) {
  console.error('No libraries could be loaded.');
  process.exit(1);
}

console.log(
  '\nPerformance (same password set, ' +
    PASSWORDS.length +
    ' passwords, ~' +
    TARGET_MS / 1000 +
    's target per implementation, iteration count varies)\n'
);
const maxOps = Math.max(...results.map((r) => r.opsPerSec));
for (const r of results.sort((a, b) => b.opsPerSec - a.opsPerSec)) {
  const bar =
    '█'.repeat(Math.round((r.opsPerSec / maxOps) * 20)) +
    '░'.repeat(20 - Math.round((r.opsPerSec / maxOps) * 20));
  console.log(
    `  ${r.name.padEnd(28)} ${String(r.opsPerSec).padStart(6)} ops/sec  ${String(r.elapsed).padStart(5)} ms  (${r.iterations} it)  ${bar}`
  );
}
console.log('');

if (outPath) {
  const absPath = path.resolve(process.cwd(), outPath);
  const payload = results
    .sort((a, b) => b.opsPerSec - a.opsPerSec)
    .map((r) => ({ name: r.name, opsPerSec: r.opsPerSec }));
  fs.writeFileSync(absPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log('Wrote example data to ' + absPath + '\n');
}
