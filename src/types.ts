export interface Result extends MatchingResult {
  feedback: Feedback;
  score: number;
}

/** Options for zxcvbn: optional name list and/or user inputs to match against. */
export interface ZxcvbnOptions {
  /** Extra strings to match (e.g. username, email). Matches are marked as user_inputs. */
  user_inputs?: string[];
  /** Name list to match against. When provided, matches are marked as names and trigger the Name warning. */
  names?: string[];
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
  /** e.g. 'passwords', 'names', 'user_inputs', or other list names from frequency data */
  dictionary_name: string;
  rank: number;
  /** matched word (lowercase) from the dictionary */
  matched_word: string;
  l33t: boolean;
  reversed: boolean;
  /** l33t substitution map (l33t char -> original char); set when l33t_match is used */
  sub?: Record<string, string>;
  sub_display?: string;
  /** Set by scoring for display; base guess count from dictionary rank */
  base_guesses?: number;
  uppercase_variations?: number;
  l33t_variations?: number;
}

export interface SpatialMatch extends BaseMatch {
  pattern: 'spatial';
  graph: string;
  turns: number;
  shifted_count?: number;
}

export interface RepeatMatch extends BaseMatch {
  pattern: 'repeat';
  base_token: string;
  base_guesses: number;
  base_matches: Match[];
  repeat_count: number;
}

export interface SequenceMatch extends BaseMatch {
  pattern: 'sequence';
  sequence_name: string;
  sequence_space: number;
  ascending: boolean;
}

export interface RegexMatch extends BaseMatch {
  pattern: 'regex';
  regex_name: string;
  regex_match: RegExpExecArray;
}

export interface DateMatch extends BaseMatch {
  pattern: 'date';
  year: number;
  month: number;
  day: number;
  separator?: string;
}

export interface BruteforceMatch extends BaseMatch {
  pattern: 'bruteforce';
}

export type Match =
  | BruteforceMatch
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
  /** This has name */
  Name = 'Name',
}
