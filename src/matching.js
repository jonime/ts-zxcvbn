"use strict";
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
exports.__esModule = true;
var name;
var frequency_lists_1 = require("./frequency_lists");
var adjacency_graphs_1 = require("./adjacency_graphs");
var scoring_1 = require("./scoring");
var build_ranked_dict = function (ordered_list) {
    var result = {};
    var i = 1; // rank starts at 1, not 0
    for (var _i = 0, ordered_list_1 = ordered_list; _i < ordered_list_1.length; _i++) {
        var word = ordered_list_1[_i];
        result[word] = i;
        i += 1;
    }
    return result;
};
var RANKED_DICTIONARIES = {};
for (name in frequency_lists_1["default"]) {
    var lst = frequency_lists_1["default"][name];
    RANKED_DICTIONARIES[name] = build_ranked_dict(lst);
}
var GRAPHS = {
    qwerty: adjacency_graphs_1["default"].qwerty,
    dvorak: adjacency_graphs_1["default"].dvorak,
    keypad: adjacency_graphs_1["default"].keypad,
    mac_keypad: adjacency_graphs_1["default"].mac_keypad
};
var L33T_TABLE = {
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
    z: ['2']
};
var REGEXEN = { recent_year: /19\d\d|200\d|201\d/g };
var DATE_MAX_YEAR = 2050;
var DATE_MIN_YEAR = 1000;
var DATE_SPLITS = {
    4: [
        // for length-4 strings, eg 1191 or 9111, two ways to split:
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
    ]
};
var matching = {
    empty: function (obj) {
        return ((function () {
            var result = [];
            for (var k in obj) {
                result.push(k);
            }
            return result;
        })().length === 0);
    },
    extend: function (lst, lst2) {
        return lst.push.apply(lst, lst2);
    },
    translate: function (string, chr_map) {
        return string
            .split('')
            .map(function (chr) { return chr_map[chr] || chr; })
            .join('');
    },
    mod: function (n, m) {
        return ((n % m) + m) % m;
    },
    sorted: function (matches) {
        // sort on i primary, j secondary
        return matches.sort(function (m1, m2) { return m1.i - m2.i || m1.j - m2.j; });
    },
    // ------------------------------------------------------------------------------
    // omnimatch -- combine everything ----------------------------------------------
    // ------------------------------------------------------------------------------
    omnimatch: function (password) {
        var matches = [];
        var matchers = [
            this.dictionary_match,
            this.reverse_dictionary_match,
            this.l33t_match,
            this.spatial_match,
            this.repeat_match,
            this.sequence_match,
            this.regex_match,
            this.date_match,
        ];
        for (var _i = 0, _a = Array.from(matchers); _i < _a.length; _i++) {
            var matcher = _a[_i];
            this.extend(matches, matcher.call(this, password));
        }
        return this.sorted(matches);
    },
    //-------------------------------------------------------------------------------
    // dictionary match (common passwords, english, last names, etc) ----------------
    //-------------------------------------------------------------------------------
    dictionary_match: function (password, _ranked_dictionaries) {
        // _ranked_dictionaries variable is for unit testing purposes
        if (_ranked_dictionaries == null) {
            _ranked_dictionaries = RANKED_DICTIONARIES;
        }
        var matches = [];
        var len = password.length;
        var password_lower = password.toLowerCase();
        for (var dictionary_name in _ranked_dictionaries) {
            var ranked_dict = _ranked_dictionaries[dictionary_name];
            for (var i = 0, end = len, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                for (var j = i, end1 = len, asc1 = i <= end1; asc1 ? j < end1 : j > end1; asc1 ? j++ : j--) {
                    if (password_lower.slice(i, +j + 1 || undefined) in ranked_dict) {
                        var word = password_lower.slice(i, +j + 1 || undefined);
                        var rank = ranked_dict[word];
                        matches.push({
                            pattern: 'dictionary',
                            i: i,
                            j: j,
                            token: password.slice(i, +j + 1 || undefined),
                            matched_word: word,
                            rank: rank,
                            dictionary_name: dictionary_name,
                            reversed: false,
                            l33t: false
                        });
                    }
                }
            }
        }
        return this.sorted(matches);
    },
    reverse_dictionary_match: function (password, _ranked_dictionaries) {
        var _a;
        if (_ranked_dictionaries == null) {
            _ranked_dictionaries = RANKED_DICTIONARIES;
        }
        var reversed_password = password.split('').reverse().join('');
        var matches = this.dictionary_match(reversed_password, _ranked_dictionaries);
        for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
            var match = matches_1[_i];
            match.token = match.token.split('').reverse().join(''); // reverse back
            match.reversed = true;
            // map coordinates back to original string
            _a = Array.from([
                password.length - 1 - match.j,
                password.length - 1 - match.i,
            ]), match.i = _a[0], match.j = _a[1];
        }
        return this.sorted(matches);
    },
    set_user_input_dictionary: function (ordered_list) {
        return (RANKED_DICTIONARIES['user_inputs'] = build_ranked_dict(ordered_list.slice()));
    },
    //-------------------------------------------------------------------------------
    // dictionary match with common l33t substitutions ------------------------------
    //-------------------------------------------------------------------------------
    // makes a pruned copy of l33t_table that only includes password's possible substitutions
    relevant_l33t_subtable: function (password, table) {
        var password_chars = {};
        for (var _i = 0, _a = password.split(''); _i < _a.length; _i++) {
            var chr = _a[_i];
            password_chars[chr] = true;
        }
        var subtable = {};
        for (var letter in table) {
            var subs = table[letter];
            var relevant_subs = subs.filter(function (sub) { return sub in password_chars; });
            if (relevant_subs.length > 0) {
                subtable[letter] = relevant_subs;
            }
        }
        return subtable;
    },
    // returns the list of possible 1337 replacement dictionaries for a given password
    enumerate_l33t_subs: function (table) {
        var k;
        var keys = (function () {
            var result = [];
            for (k in table) {
                result.push(k);
            }
            return result;
        })();
        var subs = [[]];
        var dedup = function (subs) {
            var v, k;
            var deduped = [];
            var members = {};
            for (var _i = 0, subs_1 = subs; _i < subs_1.length; _i++) {
                var sub = subs_1[_i];
                var assoc = (function () {
                    var result1 = [];
                    for (v = 0; v < sub.length; v++) {
                        k = sub[v];
                        result1.push([k, v]);
                    }
                    return result1;
                })();
                assoc.sort();
                var label = (function () {
                    var result2 = [];
                    for (v = 0; v < assoc.length; v++) {
                        k = assoc[v];
                        result2.push(k + ',' + v);
                    }
                    return result2;
                })().join('-');
                if (!(label in members)) {
                    members[label] = true;
                    deduped.push(sub);
                }
            }
            return deduped;
        };
        var helper = function (keys) {
            if (!keys.length) {
                return;
            }
            var first_key = keys[0];
            var rest_keys = keys.slice(1);
            var next_subs = [];
            for (var _i = 0, _a = Array.from(table[first_key]); _i < _a.length; _i++) {
                var l33t_chr = _a[_i];
                for (var _b = 0, _c = Array.from(subs); _b < _c.length; _b++) {
                    var sub = _c[_b];
                    var dup_l33t_index = -1;
                    for (var i = 0, end = sub.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                        if (sub[i][0] === l33t_chr) {
                            dup_l33t_index = i;
                            break;
                        }
                    }
                    if (dup_l33t_index === -1) {
                        var sub_extension = sub.concat([[l33t_chr, first_key]]);
                        next_subs.push(sub_extension);
                    }
                    else {
                        var sub_alternative = sub.slice(0);
                        sub_alternative.splice(dup_l33t_index, 1);
                        sub_alternative.push([l33t_chr, first_key]);
                        next_subs.push(sub);
                        next_subs.push(sub_alternative);
                    }
                }
            }
            subs = dedup(next_subs);
            return helper(rest_keys);
        };
        helper(keys);
        var sub_dicts = []; // convert from assoc lists to dicts
        for (var _i = 0, _a = Array.from(subs); _i < _a.length; _i++) {
            var sub = _a[_i];
            var sub_dict = {};
            for (var _b = 0, _c = Array.from(sub); _b < _c.length; _b++) {
                var _d = _c[_b], l33t_chr = _d[0], chr = _d[1];
                sub_dict[l33t_chr] = chr;
            }
            sub_dicts.push(sub_dict);
        }
        return sub_dicts;
    },
    l33t_match: function (password, _ranked_dictionaries, _l33t_table) {
        var token;
        if (_ranked_dictionaries == null) {
            _ranked_dictionaries = RANKED_DICTIONARIES;
        }
        if (_l33t_table == null) {
            _l33t_table = L33T_TABLE;
        }
        var matches = [];
        for (var _i = 0, _a = this.enumerate_l33t_subs(this.relevant_l33t_subtable(password, _l33t_table)); _i < _a.length; _i++) {
            var sub = _a[_i];
            if (this.empty(sub)) {
                break;
            } // corner case: password has no relevant subs.
            var subbed_password = this.translate(password, sub);
            for (var _b = 0, _c = this.dictionary_match(subbed_password, _ranked_dictionaries); _b < _c.length; _b++) {
                var match = _c[_b];
                token = password.slice(match.i, +match.j + 1 || undefined);
                if (token.toLowerCase() === match.matched_word) {
                    continue; // only return the matches that contain an actual substitution
                }
                var match_sub = {}; // subset of mappings in sub that are in use for this match
                for (var subbed_chr in sub) {
                    var chr = sub[subbed_chr];
                    if (token.indexOf(subbed_chr) !== -1) {
                        match_sub[subbed_chr] = chr;
                    }
                }
                match.l33t = true;
                match.token = token;
                match.sub = match_sub;
                match.sub_display = (function () {
                    var result = [];
                    for (var k in match_sub) {
                        var v = match_sub[k];
                        result.push(k + " -> " + v);
                    }
                    return result;
                })().join(', ');
                matches.push(match);
            }
        }
        return this.sorted(matches.filter(function (match // filter single-character l33t matches to reduce noise.
        ) {
            // otherwise '1' matches 'i', '4' matches 'a', both very common English words
            // with low dictionary rank.
            return match.token.length > 1;
        }));
    },
    // ------------------------------------------------------------------------------
    // spatial match (qwerty/dvorak/keypad) -----------------------------------------
    // ------------------------------------------------------------------------------
    spatial_match: function (password, _graphs) {
        if (_graphs == null) {
            _graphs = GRAPHS;
        }
        var matches = [];
        for (var graph_name in _graphs) {
            var graph = _graphs[graph_name];
            this.extend(matches, this.spatial_match_helper(password, graph, graph_name));
        }
        return this.sorted(matches);
    },
    SHIFTED_RX: /[~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?]/,
    spatial_match_helper: function (password, graph, graph_name) {
        var matches = [];
        var i = 0;
        while (i < password.length - 1) {
            var shifted_count;
            var j = i + 1;
            var last_direction = null;
            var turns = 0;
            if (['qwerty', 'dvorak'].includes(graph_name) &&
                this.SHIFTED_RX.exec(password.charAt(i))) {
                // initial character is shifted
                shifted_count = 1;
            }
            else {
                shifted_count = 0;
            }
            while (true) {
                var prev_char = password.charAt(j - 1);
                var found = false;
                var found_direction = -1;
                var cur_direction = -1;
                var adjacents = graph[prev_char] || [];
                // consider growing pattern by one character if j hasn't gone over the edge.
                if (j < password.length) {
                    var cur_char = password.charAt(j);
                    for (var _i = 0, adjacents_1 = adjacents; _i < adjacents_1.length; _i++) {
                        var adj = adjacents_1[_i];
                        cur_direction += 1;
                        if (adj && adj.indexOf(cur_char) !== -1) {
                            found = true;
                            found_direction = cur_direction;
                            if (adj.indexOf(cur_char) === 1) {
                                // index 1 in the adjacency means the key is shifted,
                                // 0 means unshifted: A vs a, % vs 5, etc.
                                // for example, 'q' is adjacent to the entry '2@'.
                                // @ is shifted w/ index 1, 2 is unshifted.
                                shifted_count += 1;
                            }
                            if (last_direction !== found_direction) {
                                // adding a turn is correct even in the initial case when last_direction is null:
                                // every spatial pattern starts with a turn.
                                turns += 1;
                                last_direction = found_direction;
                            }
                            break;
                        }
                    }
                }
                // if the current pattern continued, extend j and try to grow again
                if (found) {
                    j += 1;
                    // otherwise push the pattern discovered so far, if any...
                }
                else {
                    if (j - i > 2) {
                        // don't consider length 1 or 2 chains.
                        matches.push({
                            pattern: 'spatial',
                            i: i,
                            j: j - 1,
                            token: password.slice(i, j),
                            graph: graph_name,
                            turns: turns,
                            shifted_count: shifted_count
                        });
                    }
                    // ...and then start a new search for the rest of the password.
                    i = j;
                    break;
                }
            }
        }
        return matches;
    },
    //-------------------------------------------------------------------------------
    // repeats (aaa, abcabcabc) and sequences (abcdef) ------------------------------
    //-------------------------------------------------------------------------------
    repeat_match: function (password) {
        var matches = [];
        var greedy = /(.+)\1+/g;
        var lazy = /(.+?)\1+/g;
        var lazy_anchored = /^(.+?)\1+$/;
        var lastIndex = 0;
        while (lastIndex < password.length) {
            var base_token, match;
            greedy.lastIndex = lazy.lastIndex = lastIndex;
            var greedy_match = greedy.exec(password);
            var lazy_match = lazy.exec(password);
            if (greedy_match == null) {
                break;
            }
            if (greedy_match[0].length > lazy_match[0].length) {
                // greedy beats lazy for 'aabaab'
                //   greedy: [aabaab, aab]
                //   lazy:   [aa,     a]
                match = greedy_match;
                // greedy's repeated string might itself be repeated, eg.
                // aabaab in aabaabaabaab.
                // run an anchored lazy match on greedy's repeated string
                // to find the shortest repeated string
                base_token = lazy_anchored.exec(match[0])[1];
            }
            else {
                // lazy beats greedy for 'aaaaa'
                //   greedy: [aaaa,  aa]
                //   lazy:   [aaaaa, a]
                match = lazy_match;
                base_token = match[1];
            }
            var _a = Array.from([
                match.index,
                match.index + match[0].length - 1,
            ]), i = _a[0], j = _a[1];
            // recursively match and score the base string
            var base_analysis = scoring_1["default"].most_guessable_match_sequence(base_token, this.omnimatch(base_token));
            var base_matches = base_analysis.sequence;
            var base_guesses = base_analysis.guesses;
            matches.push({
                pattern: 'repeat',
                i: i,
                j: j,
                token: match[0],
                base_token: base_token,
                base_guesses: base_guesses,
                base_matches: base_matches,
                repeat_count: match[0].length / base_token.length
            });
            lastIndex = j + 1;
        }
        return matches;
    },
    MAX_DELTA: 5,
    sequence_match: function (password) {
        // Identifies sequences by looking for repeated differences in unicode codepoint.
        // this allows skipping, such as 9753, and also matches some extended unicode sequences
        // such as Greek and Cyrillic alphabets.
        //
        // for example, consider the input 'abcdb975zy'
        //
        // password: a   b   c   d   b    9   7   5   z   y
        // index:    0   1   2   3   4    5   6   7   8   9
        // delta:      1   1   1  -2  -41  -2  -2  69   1
        //
        // expected result:
        // [(i, j, delta), ...] = [(0, 3, 1), (5, 7, -2), (8, 9, 1)]
        var _this = this;
        if (password.length === 1) {
            return [];
        }
        var update = function (i, j, delta) {
            if (j - i > 1 || Math.abs(delta) === 1) {
                var middle = void 0;
                if (0 < (middle = Math.abs(delta)) && middle <= _this.MAX_DELTA) {
                    var sequence_name = void 0, sequence_space = void 0;
                    var token = password.slice(i, +j + 1 || undefined);
                    if (/^[a-z]+$/.test(token)) {
                        sequence_name = 'lower';
                        sequence_space = 26;
                    }
                    else if (/^[A-Z]+$/.test(token)) {
                        sequence_name = 'upper';
                        sequence_space = 26;
                    }
                    else if (/^\d+$/.test(token)) {
                        sequence_name = 'digits';
                        sequence_space = 10;
                    }
                    else {
                        // conservatively stick with roman alphabet size.
                        // (this could be improved)
                        sequence_name = 'unicode';
                        sequence_space = 26;
                    }
                    return result.push({
                        pattern: 'sequence',
                        i: i,
                        j: j,
                        token: password.slice(i, +j + 1 || undefined),
                        sequence_name: sequence_name,
                        sequence_space: sequence_space,
                        ascending: delta > 0
                    });
                }
            }
        };
        var result = [];
        var i = 0;
        var last_delta = null;
        for (var k = 1, end = password.length, asc = 1 <= end; asc ? k < end : k > end; asc ? k++ : k--) {
            var delta = password.charCodeAt(k) - password.charCodeAt(k - 1);
            if (last_delta == null) {
                last_delta = delta;
            }
            if (delta === last_delta) {
                continue;
            }
            var j = k - 1;
            update(i, j, last_delta);
            i = j;
            last_delta = delta;
        }
        update(i, password.length - 1, last_delta);
        return result;
    },
    //-------------------------------------------------------------------------------
    // regex matching ---------------------------------------------------------------
    //-------------------------------------------------------------------------------
    regex_match: function (password, _regexen) {
        if (_regexen == null) {
            _regexen = REGEXEN;
        }
        var matches = [];
        for (name in _regexen) {
            var rx_match;
            var regex = _regexen[name];
            regex.lastIndex = 0; // keeps regex_match stateless
            while ((rx_match = regex.exec(password))) {
                var token = rx_match[0];
                matches.push({
                    pattern: 'regex',
                    token: token,
                    i: rx_match.index,
                    j: rx_match.index + rx_match[0].length - 1,
                    regex_name: name,
                    regex_match: rx_match
                });
            }
        }
        return this.sorted(matches);
    },
    //-------------------------------------------------------------------------------
    // date matching ----------------------------------------------------------------
    //-------------------------------------------------------------------------------
    date_match: function (password) {
        var _a;
        // a "date" is recognized as:
        //   any 3-tuple that starts or ends with a 2- or 4-digit year,
        //   with 2 or 0 separator chars (1.1.91 or 1191),
        //   maybe zero-padded (01-01-91 vs 1-1-91),
        //   a month between 1 and 12,
        //   a day between 1 and 31.
        //
        // note: this isn't true date parsing in that "feb 31st" is allowed,
        // this doesn't check for leap years, etc.
        //
        // recipe:
        // start with regex to find maybe-dates, then attempt to map the integers
        // onto month-day-year to filter the maybe-dates into dates.
        // finally, remove matches that are substrings of other matches to reduce noise.
        //
        // note: instead of using a lazy or greedy regex to find many dates over the full string,
        // this uses a ^...$ regex against every substring of the password -- less performant but leads
        // to every possible date match.
        var dmy, i, j, token;
        var asc, end;
        var asc2, end2;
        var matches = [];
        var maybe_date_no_separator = /^\d{4,8}$/;
        var maybe_date_with_separator = new RegExp("^(\\d{1,4})([\\s/\\\\_.-])(\\d{1,2})\\2(\\d{1,4})$");
        // dates without separators are between length 4 '1191' and 8 '11111991'
        for (i = 0, end = password.length - 4, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
            var asc1, end1, start;
            for (start = i + 3, j = start, end1 = i + 7, asc1 = start <= end1; asc1 ? j <= end1 : j >= end1; asc1 ? j++ : j--) {
                if (j >= password.length) {
                    break;
                }
                token = password.slice(i, +j + 1 || undefined);
                if (!maybe_date_no_separator.exec(token)) {
                    continue;
                }
                var candidates = [];
                for (var _i = 0, _b = DATE_SPLITS[token.length]; _i < _b.length; _i++) {
                    var _c = _b[_i], k = _c[0], l = _c[1];
                    dmy = this.map_ints_to_dmy([
                        parseInt(token.slice(0, k)),
                        parseInt(token.slice(k, l)),
                        parseInt(token.slice(l)),
                    ]);
                    if (dmy != null) {
                        candidates.push(dmy);
                    }
                }
                if (!(candidates.length > 0)) {
                    continue;
                }
                // at this point: different possible dmy mappings for the same i,j substring.
                // match the candidate date that likely takes the fewest guesses: a year closest to 2000.
                // (scoring.REFERENCE_YEAR).
                //
                // ie, considering '111504', prefer 11-15-04 to 1-1-1504
                // (interpreting '04' as 2004)
                var best_candidate = candidates[0];
                var metric = function (candidate) {
                    return Math.abs(candidate.year - scoring_1["default"].REFERENCE_YEAR);
                };
                var min_distance = metric(candidates[0]);
                for (var _d = 0, _e = Array.from(candidates.slice(1)); _d < _e.length; _d++) {
                    var candidate = _e[_d];
                    var distance = metric(candidate);
                    if (distance < min_distance) {
                        _a = Array.from([candidate, distance]), best_candidate = _a[0], min_distance = _a[1];
                    }
                }
                matches.push({
                    pattern: 'date',
                    token: token,
                    i: i,
                    j: j,
                    separator: '',
                    year: best_candidate.year,
                    month: best_candidate.month,
                    day: best_candidate.day
                });
            }
        }
        // dates with separators are between length 6 '1/1/91' and 10 '11/11/1991'
        for (i = 0, end2 = password.length - 6, asc2 = 0 <= end2; asc2 ? i <= end2 : i >= end2; asc2 ? i++ : i--) {
            var asc3, end3, start1;
            for (start1 = i + 5, j = start1, end3 = i + 9, asc3 = start1 <= end3; asc3 ? j <= end3 : j >= end3; asc3 ? j++ : j--) {
                if (j >= password.length) {
                    break;
                }
                token = password.slice(i, +j + 1 || undefined);
                var rx_match = maybe_date_with_separator.exec(token);
                if (rx_match == null) {
                    continue;
                }
                dmy = this.map_ints_to_dmy([
                    parseInt(rx_match[1]),
                    parseInt(rx_match[3]),
                    parseInt(rx_match[4]),
                ]);
                if (dmy == null) {
                    continue;
                }
                matches.push({
                    pattern: 'date',
                    token: token,
                    i: i,
                    j: j,
                    separator: rx_match[2],
                    year: dmy.year,
                    month: dmy.month,
                    day: dmy.day
                });
            }
        }
        // matches now contains all valid date strings in a way that is tricky to capture
        // with regexes only. while thorough, it will contain some unintuitive noise:
        //
        // '2015_06_04', in addition to matching 2015_06_04, will also contain
        // 5(!) other date matches: 15_06_04, 5_06_04, ..., even 2015 (matched as 5/1/2020)
        //
        // to reduce noise, remove date matches that are strict substrings of others
        return this.sorted(matches.filter(function (match) {
            var is_submatch = false;
            for (var _i = 0, _a = Array.from(matches); _i < _a.length; _i++) {
                var other_match = _a[_i];
                if (match === other_match) {
                    continue;
                }
                if (other_match.i <= match.i && other_match.j >= match.j) {
                    is_submatch = true;
                    break;
                }
            }
            return !is_submatch;
        }));
    },
    map_ints_to_dmy: function (ints) {
        var _a, _b;
        // given a 3-tuple, discard if:
        //   middle int is over 31 (for all dmy formats, years are never allowed in the middle)
        //   middle int is zero
        //   any int is over the max allowable year
        //   any int is over two digits but under the min allowable year
        //   2 ints are over 31, the max allowable day
        //   2 ints are zero
        //   all ints are over 12, the max allowable month
        var dm, rest, y;
        if (ints[1] > 31 || ints[1] <= 0) {
            return;
        }
        var over_12 = 0;
        var over_31 = 0;
        var under_1 = 0;
        for (var _i = 0, _c = Array.from(ints); _i < _c.length; _i++) {
            var int = _c[_i];
            if ((99 < int && int < DATE_MIN_YEAR) || int > DATE_MAX_YEAR) {
                return;
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
            return;
        }
        // first look for a four digit year: yyyy + daymonth or daymonth + yyyy
        var possible_year_splits = [
            [ints[2], ints.slice(0, 2)],
            [ints[0], ints.slice(1, 3)],
        ];
        for (var _d = 0, _e = Array.from(possible_year_splits); _d < _e.length; _d++) {
            _a = _e[_d], y = _a[0], rest = _a[1];
            if (DATE_MIN_YEAR <= y && y <= DATE_MAX_YEAR) {
                dm = this.map_ints_to_dm(rest);
                if (dm != null) {
                    return {
                        year: y,
                        month: dm.month,
                        day: dm.day
                    };
                }
                else {
                    // for a candidate that includes a four-digit year,
                    // when the remaining ints don't match to a day and month,
                    // it is not a date.
                    return;
                }
            }
        }
        // given no four-digit year, two digit years are the most flexible int to match, so
        // try to parse a day-month out of ints[0..1] or ints[1..0]
        for (var _f = 0, _g = Array.from(possible_year_splits); _f < _g.length; _f++) {
            _b = _g[_f], y = _b[0], rest = _b[1];
            dm = this.map_ints_to_dm(rest);
            if (dm != null) {
                y = this.two_to_four_digit_year(y);
                return {
                    year: y,
                    month: dm.month,
                    day: dm.day
                };
            }
        }
    },
    map_ints_to_dm: function (ints) {
        for (var _i = 0, _a = [ints, ints.slice().reverse()]; _i < _a.length; _i++) {
            var _b = _a[_i], d = _b[0], m = _b[1];
            if (1 <= d && d <= 31 && 1 <= m && m <= 12) {
                return {
                    day: d,
                    month: m
                };
            }
        }
    },
    two_to_four_digit_year: function (year) {
        if (year > 99) {
            return year;
        }
        else if (year > 50) {
            // 87 -> 1987
            return year + 1900;
        }
        else {
            // 15 -> 2015
            return year + 2000;
        }
    }
};
exports["default"] = matching;
