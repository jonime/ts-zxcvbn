export interface Result extends MatchingResult {
  feedback: Feedback;
  score: number;
}

export interface MatchingResult {
  password: string;
  guesses: number;
  guesses_log10: number;
  sequence: Match[];
}

interface BaseMatch {
  pattern: string;
  token: string;
  i: number;
  j: number;
  guesses: number;
  guesses_log10: number;
}

export interface DictionaryMatch extends BaseMatch {
  pattern: 'dictionary';
  dictionary_name: 'passwords';
  rank: number;
  l33t: boolean;
  reversed: boolean;
}

export interface SpatialMatch extends BaseMatch {
  pattern: 'spatial';
  graph: string;
  turns: number;
}

export interface RepeatMatch extends BaseMatch {
  pattern: 'repeat';
  base_token: string;
}

export interface SequenceMatch extends BaseMatch {
  pattern: 'sequence';
}

export interface RegexMatch extends BaseMatch {
  pattern: 'regex';
  regex_name: string;
}

export interface DateMatch extends BaseMatch {
  pattern: 'date';
}

export type Match =
  | DictionaryMatch
  | SpatialMatch
  | RepeatMatch
  | SequenceMatch
  | RegexMatch
  | DateMatch;

export interface Feedback {
  warning: Warning | null;
  suggestions: string[];
}

export enum Warning {
  /** Straight rows of keys are easy to guess */
  SpatialStraightRow = 'SpatialStraightRow',
  /** Short keyboard patterns are easy to guess */
  SpatialShortKeyboardPattern = 'SpatialShortKeyboardPattern',
  /** Repeats like "aaa" are easy to guess */
  RepeatCharacter = 'RepeatCharacter',
  /** Repeats like "abcabcabc" are only slightly harder to guess than "abc" */
  RepeatPattern = 'RepeatPattern',
  /** Sequences like abc or 6543 are easy to guess */
  Sequence = 'Sequence',
  /** Recent years are easy to guess */
  RegexYear = 'RegexYear',
  /** Dates are often easy to guess */
  Date = 'Date',
  /** This is a common password */
  CommonPassword = 'CommonPassword',
  /** This is similar to a commonly used password */
  SimilarToCommonPassword = 'SimilarToCommonPassword',
}
