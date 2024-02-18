"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete_val_equal_keys = void 0;
function delete_val_equal_keys(target, keys, values) {
    if (!target)
        return;
    var _loop_1 = function (key) {
        if (values.find(function (v) { return v === target[key]; }))
            delete target[key];
    };
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        _loop_1(key);
    }
}
exports.delete_val_equal_keys = delete_val_equal_keys;
;
