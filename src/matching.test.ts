import { describe, it, expect } from 'vitest';
import matching from './matching.js';
import type { RepeatMatch } from './types.js';

describe('repeat_match', () => {
  function repeatMatch(password: string): RepeatMatch[] {
    return matching.repeat_match(password);
  }

  it('detects repeated characters (single run)', () => {
    const matches = repeatMatch('aaaaaa');
    expect(matches).toHaveLength(1);
    expect(matches[0].pattern).toBe('repeat');
    expect(matches[0].token).toBe('aaaaaa');
    expect(matches[0].base_token).toBe('a');
    expect(matches[0].repeat_count).toBe(6);
    expect(matches[0].i).toBe(0);
    expect(matches[0].j).toBe(5);
  });

  it('detects repeated substring (multi-char base)', () => {
    const matches = repeatMatch('abcabcabc');
    expect(matches).toHaveLength(1);
    expect(matches[0].token).toBe('abcabcabc');
    expect(matches[0].base_token).toBe('abc');
    expect(matches[0].repeat_count).toBe(3);
    expect(matches[0].i).toBe(0);
    expect(matches[0].j).toBe(8);
  });

  it('detects repeated two-or-more run with shortest period', () => {
    const matches = repeatMatch('aabaab');
    expect(matches).toHaveLength(1);
    expect(matches[0].token).toBe('aabaab');
    expect(matches[0].base_token).toBe('aab');
    expect(matches[0].repeat_count).toBe(2);
  });

  it('returns empty for no repeat', () => {
    expect(repeatMatch('abcdef')).toHaveLength(0);
    expect(repeatMatch('a')).toHaveLength(0);
  });

  it('handles adversarial long repeat input without ReDoS', () => {
    const longRepeat = 'a'.repeat(2000);
    const start = performance.now();
    const matches = repeatMatch(longRepeat);
    const elapsed = performance.now() - start;
    expect(matches).toHaveLength(1);
    expect(matches[0].token).toBe(longRepeat);
    expect(matches[0].base_token).toBe('a');
    expect(matches[0].repeat_count).toBe(2000);
    expect(elapsed).toBeLessThan(1000);
  });
});
