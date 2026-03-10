import frequency_lists from './frequency_lists.js';
import adjacency_graphs from './adjacency_graphs.js';
import scoring from './scoring.js';
import type {
  Match,
  DictionaryMatch,
  SpatialMatch,
  RepeatMatch,
  SequenceMatch,
  RegexMatch,
  DateMatch,
} from './types.js';

/** Adjacency graph: key -> array of adjacent key strings (or null for no neighbor). */
type AdjacencyGraph = Record<string, (string | null)[]>;

type RankedDictionaries = Record<string, Record<string, number>>;

function build_ranked_dict(ordered_list: readonly string[]): Record<string, number> {
  const result: Record<string, number> = {};
  let i = 1; // rank starts at 1, not 0
  for (const word of Array.from(ordered_list)) {
    result[word] = i;
    i += 1;
  }
  return result;
}

const RANKED_DICTIONARIES: RankedDictionaries = {};
for (const name of Object.keys(frequency_lists as Record<string, string[]>)) {
  const lst = (frequency_lists as Record<string, string[]>)[name];
  RANKED_DICTIONARIES[name] = build_ranked_dict(lst);
}

const GRAPHS: Record<string, AdjacencyGraph> = {
  qwerty: adjacency_graphs.qwerty as AdjacencyGraph,
  dvorak: adjacency_graphs.dvorak as AdjacencyGraph,
  keypad: adjacency_graphs.keypad as AdjacencyGraph,
  mac_keypad: adjacency_graphs.mac_keypad as AdjacencyGraph,
};

const L33T_TABLE: Record<string, string[]> = {
  a: ['4', '@'],
  b: ['8'],
  c: ['(', '{', '[', '<'],
  e: ['3'],
  g: ['6', '9'],
  i: ['1', '!', '|'],
  l: ['1', '|', '7'],
  o: ['0'],
  s: ['$', '5'],
  t: ['+', '7'],
  x: ['%'],
  z: ['2'],
};

const REGEXEN: Record<string, RegExp> = { recent_year: /19\d\d|200\d|201\d/g };

const DATE_MAX_YEAR = 2050;
const DATE_MIN_YEAR = 1000;
const DATE_SPLITS: Record<number, [number, number][]> = {
  4: [
    [1, 2],
    [2, 3],
  ],
  5: [
    [1, 3],
    [2, 3],
  ],
  6: [
    [1, 2],
    [2, 4],
    [4, 5],
  ],
  7: [
    [1, 3],
    [2, 3],
    [4, 5],
    [4, 6],
  ],
  8: [
    [2, 4],
    [4, 6],
  ],
};

interface Dmy {
  year: number;
  month: number;
  day: number;
}

interface Dm {
  day: number;
  month: number;
}

const matching = {
  empty(obj: Record<string, unknown>): boolean {
    return Object.keys(obj).length === 0;
  },
  extend(lst: Match[], lst2: Match[]): number {
    return lst.push.apply(lst, lst2);
  },
  translate(string: string, chr_map: Record<string, string>): string {
    return Array.from(string.split(''))
      .map((chr) => chr_map[chr] || chr)
      .join('');
  },
  mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  },
  sorted(matches: Match[]): Match[] {
    return matches.sort((m1, m2) => m1.i - m2.i || m1.j - m2.j);
  },

  omnimatch(password: string): Match[] {
    const matches: Match[] = [];
    const matchers = [
      this.dictionary_match.bind(this),
      this.reverse_dictionary_match.bind(this),
      this.l33t_match.bind(this),
      this.spatial_match.bind(this),
      this.repeat_match.bind(this),
      this.sequence_match.bind(this),
      this.regex_match.bind(this),
      this.date_match.bind(this),
    ];
    for (const matcher of matchers) {
      this.extend(matches, matcher(password));
    }
    return this.sorted(matches);
  },

  dictionary_match(
    password: string,
    _ranked_dictionaries?: RankedDictionaries | null
  ): Match[] {
    if (_ranked_dictionaries == null) {
      _ranked_dictionaries = RANKED_DICTIONARIES;
    }
    const matches: DictionaryMatch[] = [];
    const len = password.length;
    const password_lower = password.toLowerCase();
    for (const dictionary_name of Object.keys(_ranked_dictionaries)) {
      const ranked_dict = _ranked_dictionaries[dictionary_name];
      for (let i = 0; i < len; i++) {
        for (let j = i; j < len; j++) {
          const sliceEnd = j + 1;
          if (password_lower.slice(i, sliceEnd) in ranked_dict) {
            const word = password_lower.slice(i, sliceEnd);
            const rank = ranked_dict[word];
            matches.push({
              pattern: 'dictionary',
              i,
              j,
              token: password.slice(i, sliceEnd),
              matched_word: word,
              rank,
              dictionary_name,
              reversed: false,
              l33t: false,
              guesses: 0,
              guesses_log10: 0,
            });
          }
        }
      }
    }
    return this.sorted(matches);
  },

  reverse_dictionary_match(
    password: string,
    _ranked_dictionaries?: RankedDictionaries | null
  ): Match[] {
    if (_ranked_dictionaries == null) {
      _ranked_dictionaries = RANKED_DICTIONARIES;
    }
    const reversed_password = password.split('').reverse().join('');
    const matches = this.dictionary_match(
      reversed_password,
      _ranked_dictionaries
    );
    for (const match of matches) {
      const d = match as DictionaryMatch;
      d.token = d.token.split('').reverse().join('');
      d.reversed = true;
      [d.i, d.j] = [
        password.length - 1 - d.j,
        password.length - 1 - d.i,
      ];
    }
    return this.sorted(matches);
  },

  set_user_input_dictionary(ordered_list: string[]): Record<string, number> {
    return (RANKED_DICTIONARIES['user_inputs'] = build_ranked_dict(
      ordered_list.slice()
    ));
  },

  set_names_dictionary(ordered_list: string[] | null | undefined): Record<string, number> {
    const list =
      ordered_list && ordered_list.length ? ordered_list.slice() : [];
    return (RANKED_DICTIONARIES['names'] = build_ranked_dict(list));
  },

  relevant_l33t_subtable(
    password: string,
    table: Record<string, string[]>
  ): Record<string, string[]> {
    const password_chars: Record<string, boolean> = {};
    for (const chr of Array.from(password.split(''))) {
      password_chars[chr] = true;
    }
    const subtable: Record<string, string[]> = {};
    for (const letter of Object.keys(table)) {
      const subs = table[letter];
      const relevant_subs = Array.from(subs).filter(
        (sub) => sub in password_chars
      );
      if (relevant_subs.length > 0) {
        subtable[letter] = relevant_subs;
      }
    }
    return subtable;
  },

  enumerate_l33t_subs(table: Record<string, string[]>): Record<string, string>[] {
    const keys = Object.keys(table);
    let subs: [string, string][][] = [[]];

    const dedup = (subList: [string, string][][]): [string, string][][] => {
      const deduped: [string, string][][] = [];
      const members: Record<string, boolean> = {};
      for (const sub of subList) {
        const assoc = sub.map((pair, idx) => [pair, idx] as [[string, string], number]);
        assoc.sort();
        const label = assoc.map(([k, v]) => `${String(k)},${v}`).join('-');
        if (!(label in members)) {
          members[label] = true;
          deduped.push(sub);
        }
      }
      return deduped;
    };

    const helper = (keysLeft: string[]): void => {
      if (!keysLeft.length) {
        return;
      }
      const first_key = keysLeft[0];
      const rest_keys = keysLeft.slice(1);
      const next_subs: [string, string][][] = [];
      for (const l33t_chr of table[first_key]) {
        for (const sub of subs) {
          let dup_l33t_index = -1;
          for (let i = 0; i < sub.length; i++) {
            if (sub[i][0] === l33t_chr) {
              dup_l33t_index = i;
              break;
            }
          }
          if (dup_l33t_index === -1) {
            const sub_extension = sub.concat([[l33t_chr, first_key]]);
            next_subs.push(sub_extension);
          } else {
            const sub_alternative = sub.slice(0);
            sub_alternative.splice(dup_l33t_index, 1);
            sub_alternative.push([l33t_chr, first_key]);
            next_subs.push(sub);
            next_subs.push(sub_alternative);
          }
        }
      }
      subs = dedup(next_subs);
      helper(rest_keys);
    };

    helper(keys);
    const sub_dicts: Record<string, string>[] = [];
    for (const sub of Array.from(subs)) {
      const sub_dict: Record<string, string> = {};
      for (const [l33t_chr, chr] of Array.from(sub)) {
        sub_dict[l33t_chr] = chr;
      }
      sub_dicts.push(sub_dict);
    }
    return sub_dicts;
  },

  l33t_match(
    password: string,
    _ranked_dictionaries?: RankedDictionaries | null,
    _l33t_table?: Record<string, string[]> | null
  ): Match[] {
    if (_ranked_dictionaries == null) {
      _ranked_dictionaries = RANKED_DICTIONARIES;
    }
    if (_l33t_table == null) {
      _l33t_table = L33T_TABLE;
    }
    const matches: DictionaryMatch[] = [];
    for (const sub of this.enumerate_l33t_subs(
      this.relevant_l33t_subtable(password, _l33t_table)
    )) {
      if (this.empty(sub)) {
        break;
      }
      const subbed_password = this.translate(password, sub);
      for (const match of this.dictionary_match(
        subbed_password,
        _ranked_dictionaries
      )) {
        const d = match as DictionaryMatch;
        const token = password.slice(d.i, d.j + 1);
        if (token.toLowerCase() === d.matched_word) {
          continue;
        }
        const match_sub: Record<string, string> = {};
        for (const subbed_chr of Object.keys(sub)) {
          const chr = sub[subbed_chr];
          if (token.indexOf(subbed_chr) !== -1) {
            match_sub[subbed_chr] = chr;
          }
        }
        d.l33t = true;
        d.token = token;
        d.sub = match_sub;
        d.sub_display = Object.entries(match_sub)
          .map(([k, v]) => `${k} -> ${v}`)
          .join(', ');
        matches.push(d);
      }
    }
    return this.sorted(
      matches.filter((match) => match.token.length > 1)
    );
  },

  spatial_match(
    password: string,
    _graphs?: Record<string, AdjacencyGraph> | null
  ): Match[] {
    if (_graphs == null) {
      _graphs = GRAPHS;
    }
    const matches: Match[] = [];
    for (const graph_name of Object.keys(_graphs)) {
      const graph = _graphs[graph_name];
      this.extend(
        matches,
        this.spatial_match_helper(password, graph, graph_name)
      );
    }
    return this.sorted(matches);
  },

  SHIFTED_RX: /[~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?]/,
  spatial_match_helper(
    password: string,
    graph: AdjacencyGraph,
    graph_name: string
  ): SpatialMatch[] {
    const matches: SpatialMatch[] = [];
    let i = 0;
    while (i < password.length - 1) {
      let shifted_count: number;
      let j = i + 1;
      let last_direction: number | null = null;
      let turns = 0;
      if (
        ['qwerty', 'dvorak'].includes(graph_name) &&
        this.SHIFTED_RX.exec(password.charAt(i))
      ) {
        shifted_count = 1;
      } else {
        shifted_count = 0;
      }
      while (true) {
        const prev_char = password.charAt(j - 1);
        let found = false;
        let found_direction = -1;
        let cur_direction = -1;
        const adjacents = graph[prev_char] || [];
        if (j < password.length) {
          const cur_char = password.charAt(j);
          for (const adj of Array.from(adjacents)) {
            cur_direction += 1;
            if (adj && adj.indexOf(cur_char) !== -1) {
              found = true;
              found_direction = cur_direction;
              if (adj.indexOf(cur_char) === 1) {
                shifted_count += 1;
              }
              if (last_direction !== found_direction) {
                turns += 1;
                last_direction = found_direction;
              }
              break;
            }
          }
        }
        if (found) {
          j += 1;
        } else {
          if (j - i > 2) {
            matches.push({
              pattern: 'spatial',
              i,
              j: j - 1,
              token: password.slice(i, j),
              graph: graph_name,
              turns,
              shifted_count,
              guesses: 0,
              guesses_log10: 0,
            });
          }
          i = j;
          break;
        }
      }
    }
    return matches;
  },

  repeat_match(password: string): RepeatMatch[] {
    const matches: RepeatMatch[] = [];
    const greedy = /(.+)\1+/g;
    const lazy = /(.+?)\1+/g;
    const lazy_anchored = /^(.+?)\1+$/;
    let lastIndex = 0;
    while (lastIndex < password.length) {
      let base_token: string;
      let match: RegExpExecArray;
      greedy.lastIndex = lazy.lastIndex = lastIndex;
      const greedy_match = greedy.exec(password);
      const lazy_match = lazy.exec(password);
      if (greedy_match == null || lazy_match == null) {
        break;
      }
      if (greedy_match[0].length > lazy_match[0].length) {
        match = greedy_match;
        const anchored = lazy_anchored.exec(match[0]);
        base_token = anchored ? anchored[1] : match[1];
      } else {
        match = lazy_match;
        base_token = match[1];
      }
      const [i, j] = [match.index, match.index + match[0].length - 1];
      const base_analysis = scoring.most_guessable_match_sequence(
        base_token,
        this.omnimatch(base_token)
      );
      const base_matches = base_analysis.sequence;
      const base_guesses = base_analysis.guesses;
      matches.push({
        pattern: 'repeat',
        i,
        j,
        token: match[0],
        base_token,
        base_guesses,
        base_matches,
        repeat_count: match[0].length / base_token.length,
        guesses: 0,
        guesses_log10: 0,
      });
      lastIndex = j + 1;
    }
    return matches;
  },

  MAX_DELTA: 5,
  sequence_match(password: string): SequenceMatch[] {
    if (password.length === 1) {
      return [];
    }

    const result: SequenceMatch[] = [];
    const update = (i: number, j: number, delta: number): number | undefined => {
      if (j - i > 1 || Math.abs(delta) === 1) {
        const middle = Math.abs(delta);
        if (0 < middle && middle <= this.MAX_DELTA) {
          let sequence_name: string;
          let sequence_space: number;
          const token = password.slice(i, j + 1);
          if (/^[a-z]+$/.test(token)) {
            sequence_name = 'lower';
            sequence_space = 26;
          } else if (/^[A-Z]+$/.test(token)) {
            sequence_name = 'upper';
            sequence_space = 26;
          } else if (/^\d+$/.test(token)) {
            sequence_name = 'digits';
            sequence_space = 10;
          } else {
            sequence_name = 'unicode';
            sequence_space = 26;
          }
          return result.push({
            pattern: 'sequence',
            i,
            j,
            token,
            sequence_name,
            sequence_space,
            ascending: delta > 0,
            guesses: 0,
            guesses_log10: 0,
          });
        }
      }
    };

    let i = 0;
    let last_delta: number | null = null;

    for (let k = 1; k < password.length; k++) {
      const delta = password.charCodeAt(k) - password.charCodeAt(k - 1);
      if (last_delta == null) {
        last_delta = delta;
      }
      if (delta === last_delta) {
        continue;
      }
      const j = k - 1;
      update(i, j, last_delta);
      i = j;
      last_delta = delta;
    }
    update(i, password.length - 1, last_delta!);
    return result;
  },

  regex_match(
    password: string,
    _regexen?: Record<string, RegExp> | null
  ): RegexMatch[] {
    if (_regexen == null) {
      _regexen = REGEXEN;
    }
    const matches: RegexMatch[] = [];
    for (const name of Object.keys(_regexen)) {
      const regex = _regexen[name];
      regex.lastIndex = 0;
      let rx_match: RegExpExecArray | null;
      while ((rx_match = regex.exec(password)) !== null) {
        const token = rx_match[0];
        matches.push({
          pattern: 'regex',
          token,
          i: rx_match.index,
          j: rx_match.index + rx_match[0].length - 1,
          regex_name: name,
          regex_match: rx_match,
          guesses: 0,
          guesses_log10: 0,
        });
      }
    }
    return this.sorted(matches);
  },

  date_match(password: string): DateMatch[] {
    const matches: DateMatch[] = [];
    const maybe_date_no_separator = /^\d{4,8}$/;
    const maybe_date_with_separator = new RegExp(
      '^(\\d{1,4})([\\s/\\\\_.-])(\\d{1,2})\\2(\\d{1,4})$'
    );

    for (let i = 0; i <= password.length - 4; i++) {
      for (let j = i + 3; j <= i + 7; j++) {
        if (j >= password.length) {
          break;
        }
        const token = password.slice(i, j + 1);
        if (!maybe_date_no_separator.exec(token)) {
          continue;
        }
        const tokenLen = token.length as 4 | 5 | 6 | 7 | 8;
        const splits = DATE_SPLITS[tokenLen];
        if (!splits) continue;
        const candidates: Dmy[] = [];
        for (const [k, l] of splits) {
          const dmy = this.map_ints_to_dmy([
            parseInt(token.slice(0, k), 10),
            parseInt(token.slice(k, l), 10),
            parseInt(token.slice(l), 10),
          ]);
          if (dmy != null) {
            candidates.push(dmy);
          }
        }
        if (candidates.length === 0) {
          continue;
        }
        let best_candidate = candidates[0];
        const metric = (candidate: Dmy) =>
          Math.abs(candidate.year - scoring.REFERENCE_YEAR);
        let min_distance = metric(candidates[0]);
        for (const candidate of candidates.slice(1)) {
          const distance = metric(candidate);
          if (distance < min_distance) {
            best_candidate = candidate;
            min_distance = distance;
          }
        }
        matches.push({
          pattern: 'date',
          token,
          i,
          j,
          separator: '',
          year: best_candidate.year,
          month: best_candidate.month,
          day: best_candidate.day,
          guesses: 0,
          guesses_log10: 0,
        });
      }
    }

    for (let i = 0; i <= password.length - 6; i++) {
      for (let j = i + 5; j <= i + 9; j++) {
        if (j >= password.length) {
          break;
        }
        const token = password.slice(i, j + 1);
        const rx_match = maybe_date_with_separator.exec(token);
        if (rx_match == null) {
          continue;
        }
        const dmy = this.map_ints_to_dmy([
          parseInt(rx_match[1], 10),
          parseInt(rx_match[3], 10),
          parseInt(rx_match[4], 10),
        ]);
        if (dmy == null) {
          continue;
        }
        matches.push({
          pattern: 'date',
          token,
          i,
          j,
          separator: rx_match[2],
          year: dmy.year,
          month: dmy.month,
          day: dmy.day,
          guesses: 0,
          guesses_log10: 0,
        });
      }
    }

    return this.sorted(
      matches.filter((match) => {
        let is_submatch = false;
        for (const other_match of matches) {
          if (match === other_match) {
            continue;
          }
          if (other_match.i <= match.i && other_match.j >= match.j) {
            is_submatch = true;
            break;
          }
        }
        return !is_submatch;
      })
    );
  },

  map_ints_to_dmy(ints: number[]): Dmy | undefined {
    let dm: Dm | undefined;
    let rest: number[];
    let y: number;
    if (ints[1] > 31 || ints[1] <= 0) {
      return undefined;
    }
    let over_12 = 0;
    let over_31 = 0;
    let under_1 = 0;
    for (const int of ints) {
      if ((99 < int && int < DATE_MIN_YEAR) || int > DATE_MAX_YEAR) {
        return undefined;
      }
      if (int > 31) {
        over_31 += 1;
      }
      if (int > 12) {
        over_12 += 1;
      }
      if (int <= 0) {
        under_1 += 1;
      }
    }
    if (over_31 >= 2 || over_12 === 3 || under_1 >= 2) {
      return undefined;
    }

    const possible_year_splits: [number, number[]][] = [
      [ints[2], ints.slice(0, 2)],
      [ints[0], ints.slice(1, 3)],
    ];
    for ([y, rest] of possible_year_splits) {
      if (DATE_MIN_YEAR <= y && y <= DATE_MAX_YEAR) {
        dm = this.map_ints_to_dm(rest);
        if (dm != null) {
          return {
            year: y,
            month: dm.month,
            day: dm.day,
          };
        } else {
          return undefined;
        }
      }
    }

    for ([y, rest] of possible_year_splits) {
      dm = this.map_ints_to_dm(rest);
      if (dm != null) {
        y = this.two_to_four_digit_year(y);
        return {
          year: y,
          month: dm.month,
          day: dm.day,
        };
      }
    }
    return undefined;
  },

  map_ints_to_dm(ints: number[]): Dm | undefined {
    const a = ints;
    const b = ints.slice().reverse();
    for (const [d, m] of [a, b]) {
      if (1 <= d && d <= 31 && 1 <= m && m <= 12) {
        return {
          day: d,
          month: m,
        };
      }
    }
    return undefined;
  },

  two_to_four_digit_year(year: number): number {
    if (year > 99) {
      return year;
    } else if (year > 50) {
      return year + 1900;
    } else {
      return year + 2000;
    }
  },
};

export default matching;
