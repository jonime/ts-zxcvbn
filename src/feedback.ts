/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import scoring from './scoring';
import { Match, Feedback, DictionaryMatch, Warning } from './types';

const feedback = {
  default_feedback: {
    warning: null,
    suggestions: [
      'Use a few words, avoid common phrases',
      'No need for symbols, digits, or uppercase letters',
    ],
  },

  get_feedback(score: number, sequence: Match[]): Feedback {
    // starting feedback
    if (sequence.length === 0) {
      return feedback.default_feedback;
    }

    // no feedback if score is good or great.
    if (score > 2) {
      return {
        warning: null,
        suggestions: [],
      };
    }

    // tie feedback to the longest match for longer sequences
    let longest_match = sequence[0];
    for (let match of sequence.slice(1)) {
      if (match.token.length > longest_match.token.length) {
        longest_match = match;
      }
    }
    let f = feedback.get_match_feedback(longest_match, sequence.length === 1);

    const extra_feedback =
      'Add another word or two. Uncommon words are better.';

    if (f != null) {
      f.suggestions.unshift(extra_feedback);
      if (f.warning == null) {
        f.warning = null;
      }
    } else {
      f = {
        warning: null,
        suggestions: [extra_feedback],
      };
    }
    return f;
  },

  get_match_feedback(
    match: Match,
    is_sole_match: boolean
  ): { warning: Warning; suggestions: string[] } {
    switch (match.pattern) {
      case 'dictionary':
        return feedback.get_dictionary_match_feedback(match, is_sole_match);

      case 'spatial':
        var warning =
          match.turns === 1
            ? Warning.SpatialStraightRow
            : Warning.SpatialShortKeyboardPattern;
        return {
          warning,
          suggestions: ['Use a longer keyboard pattern with more turns'],
        };

      case 'repeat':
        warning =
          match.base_token.length === 1
            ? Warning.RepeatCharacter
            : Warning.RepeatPattern;
        return {
          warning,
          suggestions: ['Avoid repeated words and characters'],
        };

      case 'sequence':
        return {
          warning: Warning.Sequence,
          suggestions: ['Avoid sequences'],
        };

      case 'regex':
        if (match.regex_name === 'recent_year') {
          return {
            warning: Warning.RegexYear,
            suggestions: [
              'Avoid recent years',
              'Avoid years that are associated with you',
            ],
          };
        }
        break;

      case 'date':
        return {
          warning: Warning.Date,
          suggestions: ['Avoid dates and years that are associated with you'],
        };
    }
  },

  get_dictionary_match_feedback(
    match: DictionaryMatch,
    is_sole_match: boolean
  ): { warning: Warning; suggestions: string[] } {
    const warning = ((): Warning | null => {
      if (match.dictionary_name === 'passwords') {
        if (is_sole_match && !match.l33t && !match.reversed) {
          return Warning.CommonPassword;
        } else if (match.guesses_log10 <= 4) {
          return Warning.SimilarToCommonPassword;
        }
      } else {
        return null;
      }
    })();

    const suggestions = [];
    const word = match.token;
    if (word.match(scoring.START_UPPER)) {
      suggestions.push("Capitalization doesn't help very much");
    } else if (word.match(scoring.ALL_UPPER) && word.toLowerCase() !== word) {
      suggestions.push(
        'All-uppercase is almost as easy to guess as all-lowercase'
      );
    }

    if (match.reversed && match.token.length >= 4) {
      suggestions.push("Reversed words aren't much harder to guess");
    }
    if (match.l33t) {
      suggestions.push(
        "Predictable substitutions like '@' instead of 'a' don't help very much"
      );
    }

    const result = {
      warning,
      suggestions,
    };

    return result;
  },
};

export default feedback;
