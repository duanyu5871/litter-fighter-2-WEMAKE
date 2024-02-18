"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var match_block_1 = require("../match_block");
var match_colon_value_1 = require("../match_colon_value");
var set_obj_field_1 = require("../set_obj_field");
var take_blocks_1 = require("../take_blocks");
var to_num_1 = require("../to_num");
var ColonValueReader_1 = __importDefault(require("./ColonValueReader"));
var make_character_data_1 = require("./make_character_data");
var make_entity_data_1 = require("./make_entity_data");
var make_frames_1 = require("./make_frames");
var make_projecttile_data_1 = require("./make_projecttile_data");
var make_weapon_data_1 = require("./make_weapon_data");
var take_1 = require("./take");
function read_bg(full_str, datIndex) {
    var fields = new ColonValueReader_1.default()
        .str('name')
        .num('width')
        .num_2('zboundary')
        .str('shadow')
        .num_2('shadowsize')
        .read(full_str);
    var ret = {
        type: 'background',
        id: '',
        base: fields,
        layers: []
    };
    for (var _i = 0, _a = (0, take_blocks_1.take_blocks)(full_str, 'layer:', 'layer_end', function (v) { return full_str = v; }); _i < _a.length; _i++) {
        var block_str = _a[_i];
        var _b = block_str.trim().split(/\n|\r/g).filter(function (v) { return v; }).map(function (v) { return v.trim(); }), file = _b[0], remains = _b[1];
        var fields_1 = {};
        for (var _c = 0, _d = (0, match_colon_value_1.match_colon_value)(remains); _c < _d.length; _c++) {
            var _e = _d[_c], key = _e[0], value = _e[1];
            fields_1[key] = (0, to_num_1.to_num)(value);
        }
        var color = (0, take_1.take)(fields_1, 'rect');
        var layer = __assign({ file: file }, fields_1);
        if (color !== void 0)
            layer.color = color;
        ret.layers.push(layer);
    }
    if (datIndex === null || datIndex === void 0 ? void 0 : datIndex.id)
        ret.id = datIndex === null || datIndex === void 0 ? void 0 : datIndex.id;
    return ret;
}
function dat_to_json(full_str, datIndex) {
    var infos_str = (0, match_block_1.match_block_once)(full_str, '<bmp_begin>', '<bmp_end>');
    if (!infos_str) {
        return read_bg(full_str, datIndex);
    }
    var base = {};
    for (var _i = 0, _a = infos_str.trim().split('\n'); _i < _a.length; _i++) {
        var info_str = _a[_i];
        var reg_result = void 0;
        reg_result = info_str.match(/name:\s*(\S*)/);
        if (reg_result) {
            base.name = reg_result[1];
            continue;
        }
        reg_result = info_str.match(/head:\s*(\S*)/);
        if (reg_result) {
            base.head = reg_result[1];
            continue;
        }
        reg_result = info_str.match(/small:\s*(\S*)/);
        if (reg_result) {
            base.small = reg_result[1];
            continue;
        }
        if (info_str.startsWith('file(')) {
            var file_id = base.files ? Object.keys(base.files).length : 0;
            var file = { id: file_id };
            for (var _b = 0, _c = (0, match_colon_value_1.match_colon_value)(info_str); _b < _c.length; _b++) {
                var _d = _c[_b], key = _d[0], value = _d[1];
                if (key.startsWith('file')) {
                    var _e = key.match(/file\((\d+)-(\d+)\)/), begin = _e[1], end = _e[2];
                    file.path = value;
                    file.begin = Number(begin);
                    file.end = Number(end);
                }
                else {
                    file[key] = Number(value);
                }
            }
            base.files = (0, set_obj_field_1.set_obj_field)(base.files, '' + file_id, file);
            continue;
        }
        reg_result = info_str.match(/(\S*)\s*:\s*([+-]?([0-9]*[.])?[0-9]+)/);
        if (reg_result) {
            base[reg_result[1]] = Number(reg_result[2]);
            continue;
        }
        // reading field like: `name: value`;
        reg_result = info_str.match(/(\S*)\s*:\s*(\S*)/);
        if (reg_result) {
            base[reg_result[1]] = reg_result[2];
            continue;
        }
        // reading field like: `name 10086.00`;
        reg_result = info_str.match(/(\S*)\s*([+-]?([0-9]*[.])?[0-9]+)/);
        if (reg_result) {
            base[reg_result[1]] = Number(reg_result[2]);
            continue;
        }
        // reading field like: `name value`;
        reg_result = info_str.match(/(\S*)\s*(\S*)/);
        if (reg_result) {
            base[reg_result[1]] = reg_result[2];
            continue;
        }
    }
    var frames = (0, make_frames_1.make_frames)(full_str);
    if (datIndex) {
        var ret = void 0;
        switch (datIndex.type) {
            case 1:
            case 2:
            case 4:
            case 6:
                ret = (0, make_weapon_data_1.make_weapon_data)(base, full_str, frames);
                break;
            case 0:
                ret = (0, make_character_data_1.make_character_data)(base, frames);
                break;
            case 3:
                ret = (0, make_projecttile_data_1.make_projecttile_data)(base, frames);
                break;
            case 5:
                ret = (0, make_entity_data_1.make_entity_data)(base, frames);
                break;
            default:
                console.log('[dat_to_json] unknow dat type:', datIndex.type);
                ret = (0, make_entity_data_1.make_entity_data)(base, frames);
                break;
        }
        if (ret)
            ret.id = datIndex.id;
        return ret;
    }
    else {
        if ('small' in base && 'name' in base && 'head' in base)
            return (0, make_character_data_1.make_character_data)(base, frames);
        if ('weapon_hp' in base)
            return (0, make_weapon_data_1.make_weapon_data)(base, full_str, frames);
        if ('weapon_hit_sound' in base)
            return (0, make_projecttile_data_1.make_projecttile_data)(base, frames);
        return (0, make_entity_data_1.make_entity_data)(base, frames);
    }
}
exports.default = dat_to_json;
