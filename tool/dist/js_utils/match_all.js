"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.match_all = void 0;
function match_all(text, regexp, func) {
    var result = null;
    var results = [];
    // eslint-disable-next-line no-cond-assign
    while (result = regexp.exec(text))
        func ? func(result) : results.push(result);
    if (!func)
        return results;
}
exports.match_all = match_all;
