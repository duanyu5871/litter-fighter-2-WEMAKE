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
Object.defineProperty(exports, "__esModule", { value: true });
exports.make_character_data = void 0;
var arithmetic_progression_1 = require("../arithmetic_progression");
var as_number_1 = require("../as_number");
var set_obj_field_1 = require("../set_obj_field");
var traversal_1 = require("../traversal");
var get_the_next_1 = require("./get_the_next");
var take_1 = require("./take");
var k_9 = [
    'Fa', 'Fj',
    'Da', 'Dj',
    'Ua', 'Uj', 'ja'
];
var set_hit_turn_back = function (frame, back_frame_id) {
    if (back_frame_id === void 0) { back_frame_id = ''; }
    frame.hit = frame.hit || {};
    frame.hit.B = { id: back_frame_id, flags: { wait: 'i', turn: 1 } };
};
var set_hold_turn_back = function (frame, back_frame_id) {
    if (back_frame_id === void 0) { back_frame_id = ''; }
    frame.hold = frame.hold || {};
    frame.hold.B = { id: back_frame_id, flags: { wait: 'i', turn: 1 } };
};
function make_character_data(info, frames) {
    var _a, _b, _c, _d;
    var walking_frame_rate = (0, as_number_1.take_number)(info, 'walking_frame_rate', 3);
    var running_frame_rate = (0, as_number_1.take_number)(info, 'running_frame_rate', 3);
    var walking_speed = (0, as_number_1.take_number)(info, 'walking_speed', 0);
    var walking_speedz = (0, as_number_1.take_number)(info, 'walking_speedz', 0);
    var running_speed = (0, as_number_1.take_number)(info, 'running_speed', 0);
    var running_speedz = (0, as_number_1.take_number)(info, 'running_speedz', 0);
    info.jump_height = info.jump_height * info.jump_height / 2;
    info.dash_height = info.dash_height * info.dash_height / 1.8;
    info.dash_distance /= 2;
    info.jump_distance /= 2;
    var round_trip_frames_map = {};
    var _loop_1 = function (frame_id, frame) {
        if (frame.dvx)
            frame.dvx /= 2;
        if (frame.dvy)
            frame.dvy /= 2;
        if (frame.dvz)
            frame.dvz /= 2;
        var hit_a = (0, take_1.take)(frame, 'hit_a');
        if (hit_a)
            frame.hit = (0, set_obj_field_1.set_obj_field)(frame.hit, 'a', { id: hit_a });
        var hit_j = (0, take_1.take)(frame, 'hit_j');
        if (hit_j)
            frame.hit = (0, set_obj_field_1.set_obj_field)(frame.hit, 'j', { id: hit_j });
        var hit_d = (0, take_1.take)(frame, 'hit_d');
        if (hit_d)
            frame.hit = (0, set_obj_field_1.set_obj_field)(frame.hit, 'd', { id: hit_d });
        k_9.forEach(function (k) {
            var _a, _b;
            var h_k = "hit_".concat(k);
            var next = frame[h_k];
            if (!next || next === '0')
                return;
            if (!frame.hit)
                frame.hit = {};
            if (!frame.hit.sequences)
                frame.hit.sequences = {};
            var nf = (0, get_the_next_1.get_next_frame_by_id)(next);
            if (k === 'Fa' || k === 'Fj') {
                var f0 = frame.hit.sequences['L' + k[1]] = __assign({}, nf);
                f0.flags = __assign(__assign({}, nf.flags), { turn: ((_a = nf.flags) === null || _a === void 0 ? void 0 : _a.turn) === 1 ? 4 : 3 });
                var f1 = frame.hit.sequences['R' + k[1]] = __assign({}, nf);
                f1.flags = __assign(__assign({}, nf.flags), { turn: ((_b = nf.flags) === null || _b === void 0 ? void 0 : _b.turn) === 1 ? 3 : 4 });
            }
            else {
                frame.hit.sequences[k] = nf;
            }
        });
        switch (Number(frame.id)) {
            /** standing */
            case 0:
            case 1:
            case 2:
            case 3:
            case 4: {
                frame.hit = frame.hit || {};
                frame.hold = frame.hold || {};
                frame.hit.a = { id: [60, 65] }; // punch
                frame.hit.j = { id: 210 }; // jump
                frame.hit.d = { id: 110 }; // defend
                frame.hit.B = frame.hold.B = { id: 'walking_0', flags: { turn: 1 } }; // walking
                frame.hit.F = frame.hit.U = frame.hit.D =
                    frame.hold.F = frame.hold.U = frame.hold.D = { id: 'walking_0' }; // walking
                frame.hit.FF = frame.hit.FF = { id: 'running_0' };
                break;
            }
            /** walking */
            case 5:
            case 6:
            case 7:
            case 8: {
                set_hit_turn_back(frame);
                set_hold_turn_back(frame);
                frame.hit = frame.hit || {};
                frame.hit.a = { id: [60, 65] }; // punch
                frame.hit.j = { id: 210 }; // jump
                frame.hit.d = { id: 110 }; // defend
                frame.hit.FF = { id: 'running_0' };
                frame.dvx = walking_speed / 2;
                frame.dvz = walking_speedz / 2;
                break;
            }
            /** running */
            case 9:
            case 10:
            case 11: {
                frame.hit = frame.hit || {};
                frame.hit.a = { id: 85 }; // run_atk
                frame.hit.j = { id: 213 }; // dash
                frame.hit.d = { id: 102 }; // rowing
                frame.hold = frame.hold || {};
                frame.hit.B = frame.hold.B = { id: 218 }; // running_stop
                frame.dvx = running_speed / 2;
                frame.dvz = running_speedz / 2;
                break;
            }
            /** heavy_obj_walk */
            case 12:
            case 13:
            case 14:
            case 15: {
                frame.hit = frame.hit || {};
                frame.hit.FF = { id: 'heavy_obj_run_0' };
                // TODO
                break;
            }
            /** heavy_obj_run */
            case 16:
            case 17:
            case 18: {
                frame.hit = frame.hit || {};
                frame.hold = frame.hold || {};
                frame.hit.B = frame.hold.B = { id: 19 }; // running_stop
                break;
            }
            /** defend */
            case 110:
            // eslint-disable-next-line no-fallthrough
            case 111: {
                set_hit_turn_back(frame);
                set_hold_turn_back(frame);
                break;
            }
            /** jump */
            case 210:
            case 211:
            case 212: {
                set_hit_turn_back(frame);
                set_hold_turn_back(frame);
                frame.hit = frame.hit || {};
                frame.hold = frame.hold || {};
                if (frame_id === '212') {
                    frame.hit.a = { id: 80, flags: { turn: 2 } }; // jump_atk
                    frame.hold.a = { id: 80, flags: { turn: 2 } }; // jump_atk
                }
                frame.hit.B = { id: '', flags: { turn: 2 } };
                frame.hold.B = { id: '', flags: { turn: 2 } };
                break;
            }
            /** dash */
            case 213:
            case 214:
            case 216:
            case 217: {
                frame.state = 5;
                if (frame_id === '213' && frames[214])
                    set_hit_turn_back(frame, '214'); // turn back;
                if (frame_id === '216' && frames[217])
                    set_hit_turn_back(frame, '217'); // turn back;
                if (frame_id === '214' && frames[213])
                    set_hit_turn_back(frame, '213'); // turn back;
                if (frame_id === '217' && frames[216])
                    set_hit_turn_back(frame, '216'); // turn back;
                if (frame_id === '213' || frame_id === '216') {
                    frame.hit = frame.hit || {};
                    frame.hit.a = { id: 90 }; // dash_atk
                    frame.hold = frame.hold || {};
                    frame.hold.a = { id: 90 }; // dash_atk
                }
                break;
            }
            /** crouch */
            case 215:
                var to_dash_frame = [
                    { id: 213, condition: 'presss_F_B == 1', flags: { turn: 2 } },
                    { id: 213, condition: 'presss_F_B == -1', flags: { turn: 2 } },
                    { id: 213, condition: 'trend_x == 1', flags: { turn: 2 } },
                    { id: 214, condition: 'trend_x == -1' }
                ]; // dash
                frame.hit = frame.hit || {};
                frame.hit.d = { id: 102, flags: { turn: 2 } };
                frame.hit.j = to_dash_frame;
                frame.hold = frame.hold || {};
                frame.hold.d = { id: 102, flags: { turn: 2 } };
                frame.hold.j = to_dash_frame;
                break;
        }
        switch (frame.state) {
            case 1:
            case 2: {
                if (frame.state === 1)
                    frame.wait = walking_frame_rate * 2;
                if (frame.state === 2)
                    frame.wait = running_frame_rate * 2;
                round_trip_frames_map[frame.name] = round_trip_frames_map[frame.name] || [];
                round_trip_frames_map[frame.name].push(frame);
                delete frames[frame_id];
                break;
            }
            case 100: {
                frame.next = { id: Number(frame.id) + 1 };
                break;
            }
        }
    };
    for (var _i = 0, _e = (0, traversal_1.traversal)(frames); _i < _e.length; _i++) {
        var _f = _e[_i], frame_id = _f[0], frame = _f[1];
        _loop_1(frame_id, frame);
    }
    var make_round_trip_frames = function (prefix, src_frames) {
        for (var i = 0; i < 2 * src_frames.length - 2; ++i) {
            var frame = i < src_frames.length ? src_frames[i] : __assign({}, src_frames[2 * (src_frames.length - 1) - i]);
            frame.id = "".concat(prefix, "_").concat(i);
            frame.next = { id: "".concat(prefix, "_").concat((i === 2 * src_frames.length - 3) ? 0 : (i + 1)) };
            frames[frame.id] = frame;
        }
    };
    for (var key in round_trip_frames_map)
        make_round_trip_frames(key, round_trip_frames_map[key]);
    info.indexes = {};
    info.indexes.standing = 0;
    info.indexes.running = "running_0";
    info.indexes.heavy_obj_run = "heavy_obj_run_0";
    info.indexes.super_punch = 70;
    info.indexes.defend_hit = 111;
    info.indexes.broken_defend = 112;
    info.indexes.picking_light = 115;
    info.indexes.picking_heavy = 117;
    info.indexes.weapen_atk = [20, 25];
    info.indexes.jump_weapen_atk = 30;
    info.indexes.run_weapen_atk = 35;
    info.indexes.dash_weapen_atk = 40;
    info.indexes.l_weapen_thw = 45;
    info.indexes.h_weapen_thw = 50;
    info.indexes.air_weapon_thw = 52;
    info.indexes.drink = 55;
    info.indexes.air_quick_rise = [100, 108];
    info.indexes.injured = (_a = {},
        _a[-1] = 220,
        _a[1] = 222,
        _a);
    info.indexes.dizzy = 226;
    info.indexes.lying = (_b = {},
        _b[-1] = 230,
        _b[1] = 231,
        _b);
    info.indexes.grand_injured = (_c = {},
        _c[-1] = [220],
        _c[1] = [222],
        _c);
    info.indexes.in_the_air = [212];
    info.indexes.throw_enemy = 232;
    info.indexes.catch = [120];
    info.indexes.catch_atk = 121;
    info.indexes.caughts = (0, arithmetic_progression_1.arithmetic_progression)(130, 144);
    info.indexes.falling = (_d = {},
        _d[-1] = (0, arithmetic_progression_1.arithmetic_progression)(180, 185),
        _d[1] = (0, arithmetic_progression_1.arithmetic_progression)(186, 191),
        _d);
    info.indexes.landing_1 = 215;
    info.indexes.landing_2 = 219;
    return {
        id: '',
        type: 'character',
        base: info,
        frames: frames
    };
}
exports.make_character_data = make_character_data;
