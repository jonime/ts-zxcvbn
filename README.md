# ts-zxcvbn

[![CI](https://github.com/jonime/ts-zxcvbn/actions/workflows/ci.yml/badge.svg)](https://github.com/jonime/ts-zxcvbn/actions/workflows/ci.yml) [![npm version](https://img.shields.io/npm/v/ts-zxcvbn)](https://www.npmjs.com/package/ts-zxcvbn)

TypeScript port of Dropbox's [zxcvbn](https://github.com/dropbox/zxcvbn): a realistic password strength estimator that analyzes patterns instead of just character classes.

**Documentation:** [https://jonime.github.io/ts-zxcvbn/](https://jonime.github.io/ts-zxcvbn/)

## Installation

```bash
npm install ts-zxcvbn
```

## Quick start

The default import is small and does **not** include built-in password frequency lists. Pass an optional list via `options.passwords` when you want dictionary-based scoring.

```ts
import zxcvbn from 'ts-zxcvbn'

const result = zxcvbn('Tr0ub4dour&3')

console.log(result.score)         // 0..4
console.log(result.guesses)       // estimated guesses required
console.log(result.feedback)      // warning + suggestions for weak passwords
```

To match against common passwords (e.g. “password”, “123456”), import an optional frequency list and pass it in. Choose **lite** (~5k top passwords, smaller bundle) or **full** (~30k):

```ts
import zxcvbn from 'ts-zxcvbn'
import passwords from 'ts-zxcvbn/frequencies/passwords'        // full list (~30k)
// or
import passwords from 'ts-zxcvbn/frequencies/passwords-lite'   // lite (~5k, smaller)

const result = zxcvbn('password', {
  passwords,
})
// result.score is 0, result.feedback.warning mentions common password
```

CommonJS is also supported:

```js
const zxcvbn = require('ts-zxcvbn').default
const passwords = require('ts-zxcvbn/frequencies/passwords').default
```

## API

### `zxcvbn(password, options?)`

- `password: string` — password to estimate.
- `options?: ZxcvbnOptions` — optional. `{ user_inputs?: string[]; names?: string[]; passwords?: string[] }` — `user_inputs` are custom strings to match; `names` is an optional name list for the “Name” warning; `passwords` is an optional list of common passwords (e.g. from `ts-zxcvbn/frequencies/passwords` or `ts-zxcvbn/frequencies/passwords-lite`). By default no frequency or name list is included (keeps the main bundle small).

**Optional passwords list** (for common-password and similar warnings). Use `frequencies/passwords` (full, ~30k entries) or `frequencies/passwords-lite` (top 5k, smaller bundle):

```ts
import zxcvbn from 'ts-zxcvbn'
import passwords from 'ts-zxcvbn/frequencies/passwords'        // or passwords-lite

zxcvbn('password', { passwords })
```

**Optional name lists** (for “Name” warning):

```ts
import zxcvbn from 'ts-zxcvbn'
import finnishNames from 'ts-zxcvbn/names/finnish'

zxcvbn('antti123', { names: finnishNames })
```

English names: `import englishNames from 'ts-zxcvbn/names/english'`

Returns a `Result` object:

- `score: number` — integer from `0` (weakest) to `4` (strongest).
- `guesses: number` — estimated guesses needed to crack.
- `guesses_log10: number` — `log10(guesses)`.
- `sequence: Match[]` — matched patterns used for scoring.
- `feedback: { warning: Warning | null; suggestions: string[] }` — guidance for improvement.
- `password: string` — the analyzed password.

Type definitions are bundled, so TypeScript users get autocomplete and static types out of the box.

## Notes for npm/package consumers

- ✅ **Dual module support**: works with both ESM and CommonJS.
- ✅ **Types included**: `dist/main.d.ts` is published with the package.
- ✅ **Exports map**: package uses explicit `exports` for predictable resolution.

## Differences vs original Dropbox zxcvbn

This package is a TypeScript-maintained fork of the original algorithm and data.
It keeps the same core approach while offering modern npm packaging (ESM + CJS + types).

## Practical integration advice

- Run estimation in the browser at password-entry time for immediate feedback.
- If performance is sensitive, call only when the user pauses typing (debounce).
- Pass user-specific inputs (`userInputs`) to avoid overestimating passwords containing personal/company data.

## Development

```bash
npm install
npm run build
npm run typecheck   # TypeScript check (no emit)
npm test
npm run test:packaging   # build, bundle size check, tree-shake check, and CJS/ESM consumer tests
npm run benchmark       # compare performance to zxcvbn, zxcvbn-typescript, @zxcvbn-ts/core
npm run benchmark:update-docs   # run benchmark and update the chart data in the docs
```

The packaging test ensures the main bundle stays small (optional frequency and name lists are separate entry points). For a performance comparison with other zxcvbn implementations, see the [Performance](https://jonime.github.io/ts-zxcvbn/performance) docs page.

**Contributors:** Release process, versioning, and npm Trusted Publishing setup are in [CONTRIBUTING.md](CONTRIBUTING.md). **AI agents:** See [AGENTS.md](AGENTS.md) for conventions on updating README/docs, adding tests, and committing.
