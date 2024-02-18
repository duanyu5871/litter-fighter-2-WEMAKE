"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.match_block_once = exports.match_block = void 0;
var match_all_1 = require("./match_all");
function match_block(text, start, end, func) {
    if (typeof text !== 'string')
        return func ? void 0 : [];
    var regexp = new RegExp("".concat(start.trim(), "((.|\\n)+?)").concat(end.trim()), 'g');
    if (func)
        return (0, match_all_1.match_all)(text, regexp, function (_a) {
            var c = _a[1];
            return func(c);
        });
    return (0, match_all_1.match_all)(text, regexp).map(function (v) { return v[1]; });
}
exports.match_block = match_block;
function match_block_once(text, start, end) {
    var _a, _b;
    if (typeof text !== 'string')
        return null;
    return (_b = (_a = new RegExp("".concat(start.trim(), "((.|\\n)+?)").concat(end.trim()), 'g').exec(text)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : null;
}
exports.match_block_once = match_block_once;
