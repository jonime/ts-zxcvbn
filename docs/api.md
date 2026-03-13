# API reference

## `zxcvbn(password, options?)`

- `password: string` — password to estimate.
- `options?: ZxcvbnOptions`
  - `user_inputs?: string[]` — user-specific terms to penalize
  - `names?: string[]` — optional list used for name warnings
  - `passwords?: string[]` — optional list of common passwords: `ts-zxcvbn/frequencies/passwords` (full ~30k) or `ts-zxcvbn/frequencies/passwords-lite` (top 5k) for common-password detection

Returns a `Result` object with:

- `score: number` — integer from `0` to `4`
- `guesses: number`
- `guesses_log10: number`
- `sequence: Match[]`
- `feedback: { warning: Warning | null; suggestions: string[] }`
- `password: string`

## Example

```ts
import zxcvbn from 'ts-zxcvbn'
import passwords from 'ts-zxcvbn/frequencies/passwords'
import englishNames from 'ts-zxcvbn/names/english'

const result = zxcvbn('myCompanyName2026', {
  user_inputs: ['myCompanyName', 'name@example.com'],
  names: englishNames,
  passwords,
})

console.log(result.score)
console.log(result.feedback.warning)
```
