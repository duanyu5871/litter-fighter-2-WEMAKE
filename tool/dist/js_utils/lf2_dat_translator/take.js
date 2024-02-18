"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.take = void 0;
var take = function (fields, key) {
    if (!fields)
        return;
    var ret = fields[key];
    delete fields[key];
    return ret;
};
exports.take = take;
