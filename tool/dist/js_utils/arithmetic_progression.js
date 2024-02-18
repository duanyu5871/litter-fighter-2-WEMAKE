"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arithmetic_progression = void 0;
var arithmetic_progression = function (from, to, gap) {
    if (gap === void 0) { gap = 1; }
    var ret = [];
    for (var i = from; i <= to; i += gap) {
        ret.push(i);
    }
    return ret;
};
exports.arithmetic_progression = arithmetic_progression;
