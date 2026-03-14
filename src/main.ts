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

/** Cache sanitized list + ranked dict per list reference so repeated calls with same options reuse work. */
const listCache = new WeakMap<
  object,
  { sanitized: string[]; ranked: Record<string, number> }
>();

function get_sanitized_and_ranked(
  list: unknown[] | undefined | null
): { sanitized: string[]; ranked: Record<string, number> } {
  if (list == null || !Array.isArray(list)) {
    return { sanitized: [], ranked: {} };
  }
  let entry = listCache.get(list);
  if (!entry) {
    const sanitized = sanitize_string_list(list);
    const ranked = build_ranked_dict(sanitized);
    entry = { sanitized, ranked };
    listCache.set(list, entry);
  }
  return entry;
}

const zxcvbn = function (password: string, options?: ZxcvbnOptions | null): Result {
  const normalizedOptions =
    options && typeof options === 'object' ? options : undefined;

  const { sanitized: user_inputs, ranked: user_inputs_ranked } = get_sanitized_and_ranked(
    normalizedOptions?.user_inputs ?? null
  );
  const { sanitized: names, ranked: names_ranked } = get_sanitized_and_ranked(
    normalizedOptions?.names ?? null
  );
  const { sanitized: passwords_list, ranked: passwords_ranked } =
    normalizedOptions != null && Array.isArray(normalizedOptions.passwords)
      ? get_sanitized_and_ranked(normalizedOptions.passwords)
      : { sanitized: [] as string[], ranked: {} as Record<string, number> };

  const ranked_dictionaries: Record<string, Record<string, number>> = {};
  if (passwords_list.length > 0) {
    ranked_dictionaries['passwords'] = passwords_ranked;
  }
  if (user_inputs.length > 0) {
    ranked_dictionaries['user_inputs'] = user_inputs_ranked;
  }
  if (names.length > 0) {
    ranked_dictionaries['names'] = names_ranked;
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
