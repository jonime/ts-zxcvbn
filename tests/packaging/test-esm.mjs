// Test that ts-zxcvbn resolves to ESM build (exports.import)
import zxcvbn from 'ts-zxcvbn';

const result = zxcvbn('password123');
if (typeof result.score !== 'number' || result.score < 0 || result.score > 4) {
  console.error('ESM test failed: invalid result', result);
  process.exit(1);
}
console.log('ESM: ts-zxcvbn loaded and ran successfully');
console.log('  score:', result.score, 'guesses:', result.guesses);
