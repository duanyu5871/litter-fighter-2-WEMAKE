"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.take_blocks = void 0;
var match_all_1 = require("./match_all");
function take_blocks(text, start, end, f) {
    var regexp = new RegExp("".concat(start.trim(), "((.|\\n)+?)").concat(end.trim()), 'g');
    if (!f)
        return (0, match_all_1.match_all)(text, regexp).map(function (v) { return v[1]; });
    var positions = [];
    var ret = (0, match_all_1.match_all)(text, regexp).map(function (v) {
        positions.push([v.index, v.index + v[0].length]);
        return v[1];
    });
    if (positions.length) {
        var remains = '';
        var start_1 = 0;
        for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
            var _a = positions_1[_i], from = _a[0], to = _a[1];
            remains += text.substring(start_1, from);
            start_1 = to;
        }
        remains += text.substring(start_1);
        f(remains);
    }
    else {
        f(text);
    }
    return ret;
}
exports.take_blocks = take_blocks;
