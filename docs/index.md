# ts-zxcvbn

TypeScript port of Dropbox's [zxcvbn](https://github.com/dropbox/zxcvbn): a realistic password strength estimator that analyzes patterns instead of only character classes.

## Installation

```bash
npm install ts-zxcvbn
```

## Quick start

```ts
import zxcvbn from 'ts-zxcvbn'

const result = zxcvbn('Tr0ub4dour&3')

console.log(result.score)
console.log(result.guesses)
console.log(result.feedback)
```

## Optional name lists

Name lists are split into separate entrypoints so the main bundle stays small.

```ts
import zxcvbn, { finnishNames, englishNames } from 'ts-zxcvbn'

zxcvbn('antti123', { names: finnishNames })
```

You can also import just one list:

```ts
import finnishNames from 'ts-zxcvbn/names/finnish'
```

## Why this package

- Dual ESM + CommonJS support
- Bundled TypeScript types
- Compatible API with modern packaging

See [API reference](/api) for detailed return values and options, or open the [live demo](/demo) to test passwords in-browser.
