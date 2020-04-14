"use strict";
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
exports.__esModule = true;
var matching_1 = require("./matching");
var scoring_1 = require("./scoring");
var time_estimates_1 = require("./time_estimates");
var feedback_1 = require("./feedback");
var time = function () { return new Date().getTime(); };
var zxcvbn = function (password, user_inputs) {
    if (user_inputs == null) {
        user_inputs = [];
    }
    var start = time();
    // reset the user inputs matcher on a per-request basis to keep things stateless
    var sanitized_inputs = [];
    for (var _i = 0, _a = Array.from(user_inputs); _i < _a.length; _i++) {
        var arg = _a[_i];
        if (['string', 'number', 'boolean'].includes(typeof arg)) {
            sanitized_inputs.push(arg.toString().toLowerCase());
        }
    }
    matching_1["default"].set_user_input_dictionary(sanitized_inputs);
    var matches = matching_1["default"].omnimatch(password);
    var result = scoring_1["default"].most_guessable_match_sequence(password, matches);
    result.calc_time = time() - start;
    var attack_times = time_estimates_1["default"].estimate_attack_times(result.guesses);
    for (var prop in attack_times) {
        var val = attack_times[prop];
        result[prop] = val;
    }
    result.feedback = feedback_1["default"].get_feedback(result.score, result.sequence);
    return result;
};
exports["default"] = zxcvbn;
