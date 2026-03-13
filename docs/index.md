# ts-zxcvbn

TypeScript port of Dropbox's [zxcvbn](https://github.com/dropbox/zxcvbn): a realistic password strength estimator that analyzes patterns instead of only character classes.

## Installation

```bash
npm install ts-zxcvbn
```

## Quick start

The default import does not include built-in password frequency data. Use it as-is for pattern-based scoring, or add optional lists via options.

```ts
import zxcvbn from 'ts-zxcvbn'

const result = zxcvbn('Tr0ub4dour&3')

console.log(result.score)
console.log(result.guesses)
console.log(result.feedback)
```

## Optional frequency list

To detect common passwords (e.g. “password”, “123456”) and show the “Common password” warning, import a passwords list and pass it in. Use **full** (~30k) or **lite** (top 5k, smaller bundle):

```ts
import zxcvbn from 'ts-zxcvbn'
import passwords from 'ts-zxcvbn/frequencies/passwords'        // full
// or
import passwords from 'ts-zxcvbn/frequencies/passwords-lite'   // lite (~5k)

zxcvbn('password', { passwords })
```

## Optional name lists

Name lists are in separate entry points. Import only the list you need:

```ts
import zxcvbn from 'ts-zxcvbn'
import finnishNames from 'ts-zxcvbn/names/finnish'

zxcvbn('antti123', { names: finnishNames })
```

English: `import englishNames from 'ts-zxcvbn/names/english'`

## Why this package

- Dual ESM + CommonJS support
- Bundled TypeScript types
- Compatible API with modern packaging

See [API reference](/api) for detailed return values and options, or open the [live demo](/demo) to test passwords in-browser.
