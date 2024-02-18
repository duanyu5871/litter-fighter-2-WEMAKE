"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ColonValueReader = /** @class */ (function () {
    function ColonValueReader() {
        this._cells = [];
    }
    ColonValueReader.prototype.str = function (name) { this._cells.push([name, 'str']); return this; };
    ColonValueReader.prototype.num = function (name) { this._cells.push([name, 'num']); return this; };
    ColonValueReader.prototype.num_2 = function (name) { this._cells.push([name, 'num_2']); return this; };
    ColonValueReader.prototype.reg_exp = function (flags) {
        var str = '';
        for (var _i = 0, _a = this._cells; _i < _a.length; _i++) {
            var _b = _a[_i], n = _b[0], t = _b[1];
            switch (t) {
                case 'str':
                    str += "".concat(n, "\\s*:\\s*(\\S+)[\\s|\\n]*");
                    break;
                case 'num':
                    str += "".concat(n, "\\s*:\\s*(\\d+)[\\s|\\n]*");
                    break;
                case 'num_2':
                    str += "".concat(n, "\\s*:\\s*(\\d+)\\s*(\\d+)[\\s|\\n]*");
                    break;
            }
        }
        return new RegExp(str, flags);
    };
    ColonValueReader.prototype.read = function (text) {
        var result = this.reg_exp().exec(text);
        if (!result)
            return null;
        var ret = {};
        var pos = 1;
        for (var _i = 0, _a = this._cells; _i < _a.length; _i++) {
            var _b = _a[_i], n = _b[0], t = _b[1];
            switch (t) {
                case 'str':
                    ret[n] = result[pos];
                    pos += 1;
                    break;
                case 'num':
                    ret[n] = Number(result[pos]);
                    pos += 1;
                    break;
                case 'num_2':
                    ret[n] = [Number(result[pos]), Number(result[pos + 1])];
                    pos += 2;
                    break;
            }
        }
        return ret;
    };
    return ColonValueReader;
}());
exports.default = ColonValueReader;
