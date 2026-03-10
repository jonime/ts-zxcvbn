import zxcvbn from './main';
import { Warning } from './types';

describe('zxcvbn', () => {
  describe('with "password"', () => {
    let result;

    beforeEach(() => {
      result = zxcvbn('Password');
    });

    it('should have really low score', () => {
      expect(result.score).toBe(0);
    });
  });

  describe('with "TDvNM%YK7a46@47p"', () => {
    let result;

    beforeEach(() => {
      result = zxcvbn('TDvNM%YK7a46@47p');
    });

    it('should have really high score', () => {
      expect(result.score).toBe(4);
    });
  });

  it('should survive long passowrds', () => {
    const result = zxcvbn(
      'sadfpokasdfopkpasodfpkoadfskopokpasdfopkadsfpkopokfasdkopfakopkfopdsa'
    );

    expect(result).toBeDefined();
  });

  describe('with "Salasana11', () => {
    let result;

    beforeEach(() => {
      result = zxcvbn('Salasana11');
    });

    it('should have low score', () => {
      expect(result.score).toBe(2);
    });

    it('should have warning', () => {
      expect(result.feedback.warning).toBe(Warning.SimilarToCommonPassword);
    });
  });

  describe('with "Joni"', () => {
    let result;

    beforeEach(() => {
      result = zxcvbn('Joni');
    });

    it('should have warning about name', () => {
      expect(result.feedback.warning).toBe(Warning.Name);
    });
  });
});
