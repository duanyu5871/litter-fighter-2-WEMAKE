"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.set_obj_field = void 0;
function set_obj_field(target, key, value) {
    if (!target)
        target = {};
    target[key] = value;
    return target;
}
exports.set_obj_field = set_obj_field;
