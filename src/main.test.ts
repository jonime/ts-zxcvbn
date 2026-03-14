import zxcvbn from './main';
import { Warning, type DictionaryMatch } from './types';

describe('zxcvbn', () => {
  it('should handle empty password without crashing', () => {
    const result = zxcvbn('');
    expect(result.password).toBe('');
    expect(result.guesses).toBe(1);
    expect(result.score).toBe(0);
    expect(result.sequence).toEqual([]);
    expect(result.feedback).toBeDefined();
  });

  it('should not treat "password" as weak when no frequency list is provided', () => {
    const result = zxcvbn('password');
    expect(result.score).toBeGreaterThanOrEqual(1);
  });

  it('should have really low score for "password" when frequency list is provided', () => {
    const result = zxcvbn('password', {
      passwords: ['password', '123456'],
    });
    expect(result.score).toBe(0);
    const match = result.sequence.find(
      (m) => m.pattern === 'dictionary' && m.dictionary_name === 'passwords'
    );
    expect(match).toBeDefined();
  });

  it('should have really high score for "TDvNM%YK7a46@47p"', () => {
    const result = zxcvbn('TDvNM%YK7a46@47p');
    expect(result.score).toBe(4);
  });

  it('should work for long passwords', () => {
    const result = zxcvbn(
      'sadfpokasdfopkpasodfpkoadfskopokpasdfopkadsfpkopokfasdkopfakopkfopdsa'
    );
    expect(result).toBeDefined();
  });

  it('should have low score for "Salasana11" with warning when frequency list contains similar', () => {
    const result = zxcvbn('Salasana11', {
      passwords: ['salasana', 'password'],
    });
    expect(result.score).toBeLessThanOrEqual(2);
    expect(result.feedback.warning).toBe(Warning.SimilarToCommonPassword);
  });

  it('should have warning about name when names option is provided', () => {
    const result = zxcvbn('Joni', { names: ['joni'] });
    expect(result.feedback.warning).toBe(Warning.Name);
    const nameMatch = result.sequence.find(
      (m) => m.pattern === 'dictionary' && m.dictionary_name === 'names'
    );
    expect(nameMatch).toBeDefined();
    expect(nameMatch?.token.toLowerCase()).toBe('joni');
  });

  it('should not match names when no names option is provided', () => {
    const result = zxcvbn('antti');
    expect(result.feedback.warning).not.toBe(Warning.Name);
    const nameMatch = result.sequence.find(
      (m) => m.pattern === 'dictionary' && m.dictionary_name === 'names'
    );
    expect(nameMatch).toBeUndefined();
  });

  it('should penalize passwords containing user_inputs from options', () => {
    const result = zxcvbn('custominput', { user_inputs: ['custominput'] });
    expect(result.score).toBe(0);
    const match = result.sequence.find(
      (m) => m.pattern === 'dictionary' && m.dictionary_name === 'user_inputs'
    );
    expect(match).toBeDefined();
  });

  it('should have warning about spatial straight row', () => {
    const result = zxcvbn('fghjkl11');
    expect(result.score).toBe(1);
    expect(result.feedback.warning).toBe(Warning.SpatialStraightRow);
  });

  it('should have warning about repeat pattern', () => {
    const result = zxcvbn('jkljkljkljkljkljkl');
    expect(result.score).toBe(0);
    expect(result.feedback.warning).toBe(Warning.RepeatPattern);
  });

  it('should have warning about a year', () => {
    const result = zxcvbn('1991');
    expect(result.score).toBe(0);
    expect(result.feedback.warning).toBe(Warning.RegexYear);
  });

  it('should have warning about a date', () => {
    const result = zxcvbn('11-11-1991');
    expect(result.score).toBe(1);
    expect(result.feedback.warning).toBe(Warning.Date);
  });

  it('should have warning about repeated characters', () => {
    const result = zxcvbn('aaaaaa');
    expect(result.score).toBe(0);
    expect(result.feedback.warning).toBe(Warning.RepeatCharacter);
  });

  it('should have warning about a sequence', () => {
    const result = zxcvbn('abcdef');
    expect(result.score).toBe(0);
    expect(result.feedback.warning).toBe(Warning.Sequence);
  });

  describe('repeated calls with shared list references (memoization)', () => {
    it('produces identical results when same options object is reused', () => {
      const sharedPasswords = ['password', '123456', 'qwerty'];
      const sharedNames = ['joni', 'antti'];
      const options = { passwords: sharedPasswords, names: sharedNames };

      const r1 = zxcvbn('password', options);
      const r2 = zxcvbn('password', options);

      expect(r1.score).toBe(r2.score);
      expect(r1.guesses).toBe(r2.guesses);
      expect(r1.feedback.warning).toBe(r2.feedback.warning);
      expect(r1.sequence.length).toBe(r2.sequence.length);
    });

    it('produces correct scores and warnings across many repeated calls with shared lists', () => {
      const passwords = ['weak', 'common', 'secret'];
      const names = ['alice', 'bob'];
      const options = { passwords, names };

      for (let i = 0; i < 20; i++) {
        const result = zxcvbn('weak', options);
        expect(result.score).toBe(0);
        const match = result.sequence.find(
          (m): m is DictionaryMatch =>
            m.pattern === 'dictionary' && m.dictionary_name === 'passwords'
        );
        expect(match).toBeDefined();
        expect(match?.matched_word).toBe('weak');
      }

      for (let i = 0; i < 20; i++) {
        const result = zxcvbn('alice', options);
        expect(result.feedback.warning).toBe(Warning.Name);
        const match = result.sequence.find(
          (m): m is DictionaryMatch =>
            m.pattern === 'dictionary' && m.dictionary_name === 'names'
        );
        expect(match).toBeDefined();
        expect(match?.matched_word).toBe('alice');
      }
    });

    it('treats different list references independently (no cross-call pollution)', () => {
      const result1 = zxcvbn('onlyinfirst', {
        user_inputs: ['onlyinfirst'],
      });
      expect(result1.score).toBe(0);
      expect(
        result1.sequence.some(
          (m) =>
            m.pattern === 'dictionary' && m.dictionary_name === 'user_inputs'
        )
      ).toBe(true);

      const result2 = zxcvbn('onlyinfirst', {
        user_inputs: ['otherinput'],
      });
      expect(result2.score).toBeGreaterThan(0);
      expect(
        result2.sequence.some(
          (m) =>
            m.pattern === 'dictionary' && m.dictionary_name === 'user_inputs'
        )
      ).toBe(false);
    });
  });
});
