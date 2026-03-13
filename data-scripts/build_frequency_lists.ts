import * as fs from 'fs';
import * as path from 'path';

function usage(): string {
  return `
usage:
${process.argv[1]} data-dir output-dir

generates one TypeScript file per frequency list under output-dir (e.g. src/frequencies).
data-dir should contain frequency count files (e.g. passwords.txt).
Each emitted file exports a default string[] for that list.

DICTIONARIES controls which frequency data will be included and at maximum how many tokens
per dictionary.

If a token appears in multiple frequency lists, it will only appear once in emitted file,
in the dictionary where it has lowest rank.

Short tokens, if rare, are also filtered out. If a token has higher rank than 10**(token.length),
it will be excluded because a bruteforce match would have given it a lower guess score.

A warning will be printed if DICTIONARIES contains a dictionary name that doesn't appear in
passed data dir, or vice-versa.
`;
}

// maps dict name to num words. null means "include all words"
// names are built separately via build_name_lists.ts and shipped as optional entry points
const DICTIONARIES: Record<string, number | null> = {
  passwords: 30000,
};

// Optional "lite" variants: same list as the key, truncated to this many entries (e.g. top 5k)
const LITE_VARIANTS: Record<string, number> = {
  passwords: 5000,
};

type FreqLists = Record<string, Record<string, number>>;

function parseFrequencyLists(dataDir: string): FreqLists {
  const freqLists: FreqLists = {};
  const entries = fs.readdirSync(dataDir, { withFileTypes: true });

  for (const ent of entries) {
    if (!ent.isFile()) continue;
    const filename = ent.name;
    const freqListName = path.basename(filename, path.extname(filename));
    if (!(freqListName in DICTIONARIES)) {
      console.warn(
        `Warning: ${freqListName} appears in ${dataDir} directory but not in DICTIONARY settings. Excluding.`
      );
      continue;
    }
    const tokenToRank: Record<string, number> = {};
    const content = fs.readFileSync(path.join(dataDir, filename), 'utf8');
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length === 0 || !parts[0]) continue;
      const token = parts[0];
      const rank = i + 1;
      tokenToRank[token] = rank;
    }
    freqLists[freqListName] = tokenToRank;
  }

  for (const freqListName of Object.keys(DICTIONARIES)) {
    if (!(freqListName in freqLists)) {
      console.warn(
        `Warning: ${freqListName} appears in DICTIONARY settings but not in ${dataDir} directory. Excluding.`
      );
    }
  }

  return freqLists;
}

function isRareAndShort(token: string, rank: number): boolean {
  return rank >= Math.pow(10, token.length);
}

function hasCommaOrDoubleQuote(token: string): boolean {
  return token.includes(',') || token.includes('"');
}

function filterFrequencyLists(freqLists: FreqLists): Record<string, string[]> {
  const filteredTokenAndRank: Record<string, [string, number][]> = {};
  const minimumRank: Record<string, number> = {};
  const minimumName: Record<string, string> = {};

  for (const name of Object.keys(freqLists)) {
    filteredTokenAndRank[name] = [];
  }

  for (const [name, tokenToRank] of Object.entries(freqLists)) {
    for (const [token, rank] of Object.entries(tokenToRank)) {
      if (!(token in minimumRank)) {
        minimumRank[token] = rank;
        minimumName[token] = name;
      } else {
        const minRank = minimumRank[token];
        if (rank < minRank) {
          minimumRank[token] = rank;
          minimumName[token] = name;
        }
      }
    }
  }

  for (const [name, tokenToRank] of Object.entries(freqLists)) {
    for (const [token, rank] of Object.entries(tokenToRank)) {
      if (minimumName[token] !== name) continue;
      if (isRareAndShort(token, rank) || hasCommaOrDoubleQuote(token)) continue;
      filteredTokenAndRank[name].push([token, rank]);
    }
  }

  const result: Record<string, string[]> = {};
  for (const [name, tokenRankPairs] of Object.entries(filteredTokenAndRank)) {
    tokenRankPairs.sort((a, b) => a[1] - b[1]);
    let list = tokenRankPairs.map((p) => p[0]);
    const cutoffLimit = DICTIONARIES[name];
    if (cutoffLimit != null && list.length > cutoffLimit) {
      list = list.slice(0, cutoffLimit);
    }
    result[name] = list;
  }
  return result;
}

function toSafeIdentifier(filename: string): string {
  return filename.replace(/-/g, '_');
}

/** Escape a word for use inside a double-quoted string literal (\\, "). Comma is not escaped; tokens with comma are excluded by the build. */
function escapeForDoubleQuote(word: string): string {
  return word.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** Emit list as a single comma-separated string, split at runtime (compact source; commas in tokens are already excluded). */
function emitListFile(
  outputDir: string,
  filename: string,
  exportName: string,
  lst: string[],
  scriptName: string,
  commentName: string
): void {
  const escaped = lst.map(escapeForDoubleQuote).join(',');
  const content = [
    `// generated by ${scriptName}`,
    `/** Optional password list for zxcvbn (e.g. zxcvbn(password, { passwords: ${exportName} })). */`,
    `const ${exportName}: string[] = "${escaped}".split(",");`,
    `export default ${exportName};`,
    '',
  ].join('\n');
  const outPath = path.join(outputDir, `${filename}.ts`);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outPath, content, 'utf8');
}

function main(): void {
  if (process.argv.length !== 4) {
    console.log(usage());
    process.exit(1);
  }
  const dataDir = process.argv[2];
  const outputDir = process.argv[3];
  const unfilteredFreqLists = parseFrequencyLists(dataDir);
  const freqLists = filterFrequencyLists(unfilteredFreqLists);
  const scriptName = path.basename(process.argv[1]);
  for (const [name, lst] of Object.entries(freqLists)) {
    const safeName = toSafeIdentifier(name);
    emitListFile(outputDir, name, safeName, lst, scriptName, name);
    const liteSize = LITE_VARIANTS[name];
    if (liteSize != null && lst.length > liteSize) {
      const liteList = lst.slice(0, liteSize);
      const liteFilename = `${name}-lite`;
      const liteExportName = `${safeName}_lite`;
      emitListFile(outputDir, liteFilename, liteExportName, liteList, scriptName, name);
    }
  }
}

main();
