import matching from './matching.js';
import scoring from './scoring.js';
import time_estimates from './time_estimates.js';
import feedback from './feedback.js';
import { MatchingResult, Result, ZxcvbnOptions } from './types.js';

function sanitize_string_list(list: unknown[]): string[] {
  return list
    .filter((x) => ['string', 'number', 'boolean'].includes(typeof x))
    .map((x) => String(x).toLowerCase());
}

const zxcvbn = function (
  password: string,
  options?: string[] | ZxcvbnOptions | null
): Result {
  const user_inputs: string[] = Array.isArray(options)
    ? sanitize_string_list(options)
    : options && typeof options === 'object'
      ? sanitize_string_list(options.user_inputs ?? [])
      : [];

  const names: string[] =
    options && typeof options === 'object' && !Array.isArray(options)
      ? sanitize_string_list(options.names ?? [])
      : [];

  matching.set_user_input_dictionary(user_inputs);
  matching.set_names_dictionary(names);

  const matches = matching.omnimatch(password);
  const result: MatchingResult = scoring.most_guessable_match_sequence(
    password,
    matches
  );

  const { score } = time_estimates.estimate_attack_times(result.guesses);

  return {
    ...result,
    score,
    feedback: feedback.get_feedback(score, result.sequence),
  };
};

export default zxcvbn;
