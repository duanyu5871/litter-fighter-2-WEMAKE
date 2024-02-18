"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.to_num = void 0;
function to_num(v, or) {
    var t = Number(v);
    return Number.isNaN(t) ? v : (or === void 0) ? t : or;
}
exports.to_num = to_num;
