"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var match_colon_value_1 = require("../match_colon_value");
var take_blocks_1 = require("../take_blocks");
var to_num_1 = require("../to_num");
function take_sections(text, start, end, f) {
    return (0, take_blocks_1.take_blocks)(text, start, end, f).map(function (content_str) {
        var item = {};
        for (var _i = 0, _a = (0, match_colon_value_1.match_colon_value)(content_str); _i < _a.length; _i++) {
            var _b = _a[_i], name = _b[0], value = _b[1];
            item[name] = (0, to_num_1.to_num)(value);
        }
        return item;
    });
}
exports.default = take_sections;
