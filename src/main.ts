/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import matching from './matching';
import scoring from './scoring';
import time_estimates from './time_estimates';
import feedback from './feedback';

const zxcvbn = function (password: string, user_inputs?: string[]) {
  // reset the user inputs matcher on a per-request basis to keep things stateless
  const sanitized_inputs = (user_inputs ?? [])
    .filter((input) => ['string', 'number', 'boolean'].includes(typeof input))
    .map((input) => input.toLowerCase());

  matching.set_user_input_dictionary(sanitized_inputs);

  const matches = matching.omnimatch(password);
  const result = scoring.most_guessable_match_sequence(password, matches);

  const { score } = time_estimates.estimate_attack_times(result.guesses);

  return {
    ...result,
    score,
    feedback: feedback.get_feedback(score, result.sequence),
  };
};

export default zxcvbn;
