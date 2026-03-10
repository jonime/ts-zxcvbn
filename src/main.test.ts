import zxcvbn from './main';
import { Warning } from './types';

describe('zxcvbn', () => {
  it('should have really low score for "password"', () => {
    const result = zxcvbn('password');
    expect(result.score).toBe(0);
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

  it('should have low score for "Salasana11" with warning', () => {
    const result = zxcvbn('Salasana11');
    expect(result.score).toBe(2);
    expect(result.feedback.warning).toBe(Warning.SimilarToCommonPassword);
  });

  it('should have warning about name', () => {
    const result = zxcvbn('Joni');
    expect(result.feedback.warning).toBe(Warning.Name);
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
});
