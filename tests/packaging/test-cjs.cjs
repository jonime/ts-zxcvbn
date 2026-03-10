'use strict';

// Test that ts-zxcvbn resolves to CJS build (exports.require)
const zxcvbn = require('ts-zxcvbn').default;

const result = zxcvbn('password123');
if (typeof result.score !== 'number' || result.score < 0 || result.score > 4) {
  console.error('CJS test failed: invalid result', result);
  process.exit(1);
}
console.log('CJS: ts-zxcvbn loaded and ran successfully');
console.log('  score:', result.score, 'guesses:', result.guesses);
