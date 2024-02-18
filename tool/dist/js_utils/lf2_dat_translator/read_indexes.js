"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read_indexes = void 0;
var match_block_1 = require("../match_block");
var match_colon_value_1 = require("../match_colon_value");
var to_num_1 = require("../to_num");
function read_indexes(text) {
    var _a, _b;
    if (!text)
        return void 0;
    var objects = (_a = (0, match_block_1.match_block_once)(text, '<object>', '<object_end>')) === null || _a === void 0 ? void 0 : _a.split(/\n|\r/).filter(function (v) { return v; }).map(function (line) {
        var item = { id: '', type: '', file: '' };
        for (var _i = 0, _a = (0, match_colon_value_1.match_colon_value)(line); _i < _a.length; _i++) {
            var _b = _a[_i], name = _b[0], value = _b[1];
            switch (name) {
                case 'id':
                case 'type':
                    item[name] = (0, to_num_1.to_num)(value);
                    break;
                case 'file':
                    item[name] = value;
                    break;
            }
        }
        return item;
    });
    var backgrounds = (_b = (0, match_block_1.match_block_once)(text, '<background>', '<background_end>')) === null || _b === void 0 ? void 0 : _b.split(/\n|\r/).filter(function (v) { return v; }).map(function (line) {
        var item = { id: '', type: 'bg', file: '' };
        for (var _i = 0, _a = (0, match_colon_value_1.match_colon_value)(line); _i < _a.length; _i++) {
            var _b = _a[_i], name = _b[0], value = _b[1];
            switch (name) {
                case 'id':
                    item[name] = (0, to_num_1.to_num)(value);
                    break;
                case 'file':
                    item[name] = value;
                    break;
            }
        }
        return item;
    });
    if (!objects || !backgrounds)
        return void 0;
    return { objects: objects, backgrounds: backgrounds };
}
exports.read_indexes = read_indexes;
