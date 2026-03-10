# API reference

## `zxcvbn(password, options?)`

- `password: string` — password to estimate.
- `options?: string[] | ZxcvbnOptions`
  - `string[]` (legacy): same as `{ user_inputs: [...] }`
  - `ZxcvbnOptions`:
    - `user_inputs?: string[]` — user-specific terms to penalize
    - `names?: string[]` — optional list used for name warnings

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
import englishNames from 'ts-zxcvbn/names/english'

const result = zxcvbn('myCompanyName2026', {
  user_inputs: ['myCompanyName', 'name@example.com'],
  names: englishNames
})

console.log(result.score)
console.log(result.feedback.warning)
```
