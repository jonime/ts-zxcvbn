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

function build_ranked_dict(ordered_list: readonly string[]): Record<string, number> {
  const result: Record<string, number> = {};
  let i = 1;
  for (const word of ordered_list) {
    result[word] = i;
    i += 1;
  }
  return result;
}

const zxcvbn = function (password: string, options?: ZxcvbnOptions | null): Result {
  const normalizedOptions =
    options && typeof options === 'object' ? options : undefined;

  const user_inputs: string[] =
    normalizedOptions != null
      ? sanitize_string_list(normalizedOptions.user_inputs ?? [])
      : [];

  const names: string[] =
    normalizedOptions != null ? sanitize_string_list(normalizedOptions.names ?? []) : [];

  const passwords_list: string[] =
    normalizedOptions != null && Array.isArray(normalizedOptions.passwords)
      ? sanitize_string_list(normalizedOptions.passwords)
      : [];

  const ranked_dictionaries: Record<string, Record<string, number>> = {};
  if (passwords_list.length > 0) {
    ranked_dictionaries['passwords'] = build_ranked_dict(passwords_list);
  }
  if (user_inputs.length > 0) {
    ranked_dictionaries['user_inputs'] = build_ranked_dict(user_inputs);
  }
  if (names.length > 0) {
    ranked_dictionaries['names'] = build_ranked_dict(names);
  }

  matching.set_ranked_dictionaries(ranked_dictionaries);

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
