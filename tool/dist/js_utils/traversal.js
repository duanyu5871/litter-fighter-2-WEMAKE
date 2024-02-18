"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traversal = void 0;
function traversal(r, func) {
    var items = Object.keys(r).map(function (k) {
        var _k = k;
        func === null || func === void 0 ? void 0 : func(_k, r[_k], r);
        return [_k, r[_k], r];
    });
    if (!func)
        return items;
}
exports.traversal = traversal;
