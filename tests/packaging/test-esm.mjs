// Test that ts-zxcvbn resolves to ESM build (exports.import)
import zxcvbn from 'ts-zxcvbn';
import finnishNames from 'ts-zxcvbn/names/finnish';
import passwords from 'ts-zxcvbn/frequencies/passwords';
import passwordsLite from 'ts-zxcvbn/frequencies/passwords-lite';

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

// Test optional frequency list: import and pass via passwords option
if (!Array.isArray(passwords) || passwords.length === 0) {
  console.error('ESM test failed: passwords should be a non-empty array');
  process.exit(1);
}
const resultWithPasswords = zxcvbn('password', {
  passwords,
});
if (resultWithPasswords.score !== 0) {
  console.error('ESM test failed: expected score 0 for "password" with passwords list', resultWithPasswords);
  process.exit(1);
}
console.log('ESM: frequencies/passwords import and passwords option work');

// Test lite frequency list
if (!Array.isArray(passwordsLite) || passwordsLite.length === 0) {
  console.error('ESM test failed: passwords-lite should be a non-empty array');
  process.exit(1);
}
if (passwordsLite.length >= passwords.length) {
  console.error('ESM test failed: passwords-lite should be smaller than full passwords list');
  process.exit(1);
}
const resultLite = zxcvbn('password', {
  passwords: passwordsLite,
});
if (resultLite.score !== 0) {
  console.error('ESM test failed: expected score 0 for "password" with passwords-lite', resultLite);
  process.exit(1);
}
console.log('ESM: frequencies/passwords-lite import works');
