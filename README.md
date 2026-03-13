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
npm test
npm run test:packaging   # build, bundle size check, tree-shake check, and CJS/ESM consumer tests
```

The packaging test ensures the main bundle stays small (optional frequency and name lists are separate entry points).

**AI agents:** See [AGENTS.md](AGENTS.md) for conventions on updating README/docs, adding tests, and committing.

## Automated npm releases

This repository is configured for automated semantic versioning and npm publishing via
[`semantic-release`](https://semantic-release.gitbook.io/semantic-release/).

### How version bumps are decided

Release type is inferred from Conventional Commit messages:

- `fix:` → patch release (e.g. `1.2.3` → `1.2.4`)
- `feat:` → minor release (e.g. `1.2.3` → `1.3.0`)
- `feat!:` or commits with `BREAKING CHANGE:` footer → major release (e.g. `1.2.3` → `2.0.0`)

### CI release workflow

On every push to `main` or `master`, GitHub Actions will:

1. install dependencies
2. run tests
3. build the package
4. run `semantic-release`

If releasable commits are present, it will publish to npm and create a GitHub release.

### npm Trusted Publishing (no npm tokens)

Publishing uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) with OIDC. You do **not** need to create or store any npm tokens.

Setup:

1. In npm: package → **Settings** → **Trusted publishers** → Add **GitHub Actions**, and register this repo and workflow file (`.github/workflows/publish.yml`).
2. In this repo: keep the `id-token: write` permission in `publish.yml` (already set).

`GITHUB_TOKEN` is provided automatically by Actions. No `NPM_TOKEN` or other npm secrets are used.
