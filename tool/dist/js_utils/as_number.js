"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.take_number = exports.as_number = void 0;
function as_number(v, or) {
    return (typeof v === 'number') ? v : or;
}
exports.as_number = as_number;
function take_number(v, k, or) {
    var ret = (typeof v[k] === 'number') ? v[k] : or;
    delete v[k];
    return ret;
}
exports.take_number = take_number;
