"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.match_colon_value = exports.val_colon_exp = void 0;
var match_all_1 = require("./match_all");
exports.val_colon_exp = /\s*(\S*)\s*:\s*(\S*)/g;
function match_colon_value(text, func) {
    if (typeof text !== 'string')
        return func ? void 0 : [];
    if (func)
        return (0, match_all_1.match_all)(text.trim(), exports.val_colon_exp, function (_a) {
            var k = _a[1], v = _a[2];
            return func(k, v);
        });
    return (0, match_all_1.match_all)(text.trim(), exports.val_colon_exp).map(function (_a) {
        var k = _a[1], v = _a[2];
        return [k, v];
    });
}
exports.match_colon_value = match_colon_value;
