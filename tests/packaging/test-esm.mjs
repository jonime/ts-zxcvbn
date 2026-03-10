// Test that ts-zxcvbn resolves to ESM build (exports.import)
import zxcvbn, { finnishNames } from 'ts-zxcvbn';

const result = zxcvbn('password123');
if (typeof result.score !== 'number' || result.score < 0 || result.score > 4) {
  console.error('ESM test failed: invalid result', result);
  process.exit(1);
}
console.log('ESM: ts-zxcvbn loaded and ran successfully');
console.log('  score:', result.score, 'guesses:', result.guesses);

// Test optional names: with finnishNames, "antti" should trigger Name warning
if (!Array.isArray(finnishNames) || finnishNames.length === 0) {
  console.error('ESM test failed: finnishNames should be a non-empty array');
  process.exit(1);
}
const resultWithNames = zxcvbn('antti', { names: finnishNames });
const hasNameWarning = resultWithNames.feedback.warning === 'Name';
if (!hasNameWarning) {
  console.error('ESM test failed: expected Name warning for "antti" with finnishNames', resultWithNames.feedback);
  process.exit(1);
}
console.log('ESM: finnishNames import and names option work');
