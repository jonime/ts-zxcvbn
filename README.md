# ts-zxcvbn

TypeScript port of Dropbox's [zxcvbn](https://github.com/dropbox/zxcvbn): a realistic password strength estimator that analyzes patterns instead of just character classes.

## Installation

```bash
npm install ts-zxcvbn
```

## Quick start

```ts
import zxcvbn from 'ts-zxcvbn'

const result = zxcvbn('Tr0ub4dour&3')

console.log(result.score)         // 0..4
console.log(result.guesses)       // estimated guesses required
console.log(result.feedback)      // warning + suggestions for weak passwords
```

CommonJS is also supported:

```js
const zxcvbn = require('ts-zxcvbn')
```

## API

### `zxcvbn(password, userInputs?)`

- `password: string` — password to estimate.
- `userInputs?: string[]` — optional user-specific words (name, email, company, etc.) that should be penalized if they appear in the password.

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
```

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
