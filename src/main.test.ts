import zxcvbn from './main';

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
});
