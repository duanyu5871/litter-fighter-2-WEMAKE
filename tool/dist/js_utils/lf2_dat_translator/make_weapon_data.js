"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.make_weapon_data = void 0;
var match_all_1 = require("../match_all");
var match_block_1 = require("../match_block");
var match_colon_value_1 = require("../match_colon_value");
var set_obj_field_1 = require("../set_obj_field");
var to_num_1 = require("../to_num");
function make_weapon_data(info, full_str, frames) {
    var _a;
    var weapon_strength;
    var weapon_strength_str = (_a = (0, match_block_1.match_block_once)(full_str, '<weapon_strength_list>', '<weapon_strength_list_end>')) === null || _a === void 0 ? void 0 : _a.trim();
    if (weapon_strength_str) {
        for (var _i = 0, _b = (0, match_all_1.match_all)(weapon_strength_str, /entry:\s*(\d+)\s*(\S+)\s*\n?(.*)\n?/g); _i < _b.length; _i++) {
            var _c = _b[_i], id = _c[1], name = _c[2], remain = _c[3];
            var entry = { id: id, name: name };
            for (var _d = 0, _e = (0, match_colon_value_1.match_colon_value)(remain); _d < _e.length; _d++) {
                var _f = _e[_d], key = _f[0], value = _f[1];
                entry[key] = (0, to_num_1.to_num)(value);
            }
            weapon_strength = (0, set_obj_field_1.set_obj_field)(weapon_strength, id, entry);
        }
    }
    return {
        id: '',
        type: 'weapon',
        base: info,
        weapon_strength: weapon_strength,
        frames: frames
    };
}
exports.make_weapon_data = make_weapon_data;
