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
exports.make_frames = void 0;
var delete_val_equal_keys_1 = require("../delete_val_equal_keys");
var match_all_1 = require("../match_all");
var match_colon_value_1 = require("../match_colon_value");
var to_num_1 = require("../to_num");
var get_the_next_1 = require("./get_the_next");
var take_sections_1 = __importDefault(require("./take_sections"));
function make_frames(text) {
    var frames = {};
    var frame_regexp = /<frame>\s+(.*?)\s+(.*)((.|\n)+?)<frame_end>/g;
    var _loop_1 = function (frame_id, frame_name, content) {
        var _content = content;
        var bdy = (0, take_sections_1.default)(_content, 'bdy:', 'bdy_end:', function (r) { return _content = r; });
        var itr = (0, take_sections_1.default)(_content, 'itr:', 'itr_end:', function (r) { return _content = r; });
        itr === null || itr === void 0 ? void 0 : itr.forEach(function (v) {
            if (typeof v.dvx === 'number')
                v.dvx /= 2;
            if (typeof v.dvz === 'number')
                v.dvz /= 2;
            if (typeof v.dvy === 'number')
                v.dvy *= -1.1;
        });
        var wpoint = (0, take_sections_1.default)(_content, 'wpoint:', 'wpoint_end:', function (r) { return _content = r; })[0];
        var bpoint = (0, take_sections_1.default)(_content, 'bpoint:', 'bpoint_end:', function (r) { return _content = r; })[0];
        var opoint = (0, take_sections_1.default)(_content, 'opoint:', 'opoint_end:', function (r) { return _content = r; })[0];
        var cpoint = (0, take_sections_1.default)(_content, 'cpoint:', 'cpoint_end:', function (r) { return _content = r; })[0];
        var fields = {};
        for (var _c = 0, _d = (0, match_colon_value_1.match_colon_value)(_content); _c < _d.length; _c++) {
            var _e = _d[_c], name = _e[0], value = _e[1];
            fields[name] = (0, to_num_1.to_num)(value);
        }
        var frame = __assign(__assign({}, fields), { id: frame_id, name: frame_name, wait: fields.wait * 2 + 2, next: (0, get_the_next_1.get_next_frame_by_id)(fields.next), bdy: bdy, itr: itr, wpoint: wpoint, bpoint: bpoint, opoint: opoint, cpoint: cpoint });
        if (!(bdy === null || bdy === void 0 ? void 0 : bdy.length))
            delete frame.bdy;
        if (!(itr === null || itr === void 0 ? void 0 : itr.length))
            delete frame.itr;
        (0, delete_val_equal_keys_1.delete_val_equal_keys)(frame, ['dvx', 'dvy', 'dvz'], [0, void 0]);
        (0, delete_val_equal_keys_1.delete_val_equal_keys)(frame, ['mp', 'hp'], [0, void 0]);
        (0, delete_val_equal_keys_1.delete_val_equal_keys)(frame, ['sound'], ['', void 0]);
        (0, delete_val_equal_keys_1.delete_val_equal_keys)(frame, ['sound'], ['', void 0]);
        (0, delete_val_equal_keys_1.delete_val_equal_keys)(frame, ['wpoint', 'bpoint', 'opoint', 'cpoint', 'bdy', 'itr'], [null, void 0]);
        (0, delete_val_equal_keys_1.delete_val_equal_keys)(frame.wpoint, ['dvx', 'dvy', 'dvz'], [0, void 0]);
        (0, delete_val_equal_keys_1.delete_val_equal_keys)(frame.opoint, ['dvx', 'dvy', 'dvz'], [0, void 0]);
        (0, delete_val_equal_keys_1.delete_val_equal_keys)(frame.cpoint, ['throwvx', 'throwvy', 'throwvz', 'throwinjury'], [0, void 0, -842150451]);
        if (frame.mp && frame.mp > 1000) {
            var raw = frame.mp;
            frame.mp = raw % 1000;
            frame.hp = (raw - frame.mp) / 100;
        }
        frames[frame_id] = frame;
    };
    for (var _i = 0, _a = (0, match_all_1.match_all)(text, frame_regexp); _i < _a.length; _i++) {
        var _b = _a[_i], frame_id = _b[1], frame_name = _b[2], content = _b[3];
        _loop_1(frame_id, frame_name, content);
    }
    return frames;
}
exports.make_frames = make_frames;
