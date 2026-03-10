/**
 * Minimal consumer that only uses the default zxcvbn export.
 * Used to verify that bundling with tree-shaking does not include name lists.
 */
import zxcvbn from 'ts-zxcvbn';

const result = zxcvbn('password123');
if (typeof result.score !== 'number') {
  throw new Error('invalid result');
}
console.log(result.score);
