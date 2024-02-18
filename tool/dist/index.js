"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var dat_2_json_1 = __importDefault(require("./js_utils/lf2_dat_translator/dat_2_json"));
var read_indexes_1 = require("./js_utils/lf2_dat_translator/read_indexes");
var read_old_lf2_dat_file_1 = require("./read_old_lf2_dat_file");
var copy_dir_1 = require("./utils/copy_dir");
var read_text_file_1 = require("./utils/read_text_file");
function parse_indexes(src_path) {
    return __awaiter(this, void 0, void 0, function () {
        var text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, read_text_file_1.read_text_file)(src_path)];
                case 1:
                    text = _a.sent();
                    return [2 /*return*/, (0, read_indexes_1.read_indexes)(text)];
            }
        });
    });
}
function parse_under_dir(src_dir_path, dst_dir_path, indexes) {
    return __awaiter(this, void 0, void 0, function () {
        var _loop_1, _i, _a, filename;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, promises_1.default.mkdir(dst_dir_path, { recursive: true }).catch(function (_) { return void 0; })];
                case 1:
                    _b.sent();
                    _loop_1 = function (filename) {
                        var src_path, stat, dst_path, buff, index, json;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    src_path = path_1.default.join(src_dir_path, filename);
                                    return [4 /*yield*/, promises_1.default.stat(src_path)];
                                case 1:
                                    stat = _c.sent();
                                    dst_path = path_1.default.join(dst_dir_path, filename);
                                    if (!stat.isDirectory()) return [3 /*break*/, 3];
                                    return [4 /*yield*/, parse_under_dir(src_path, dst_path, indexes)];
                                case 2:
                                    _c.sent();
                                    return [2 /*return*/, "continue"];
                                case 3:
                                    if (!(stat.isFile() && filename.endsWith('.dat'))) return [3 /*break*/, 8];
                                    return [4 /*yield*/, (0, read_old_lf2_dat_file_1.read_lf2_dat_file)(src_path)];
                                case 4:
                                    buff = _c.sent();
                                    index = indexes === null || indexes === void 0 ? void 0 : indexes.objects.find(function (v) { return v.file.indexOf(filename) >= 0; });
                                    json = (0, dat_2_json_1.default)(buff.toString().replace(/\\/g, '/').replace(/\r/g, ''), index);
                                    if (!!json) return [3 /*break*/, 6];
                                    return [4 /*yield*/, promises_1.default.copyFile(src_path, dst_path)];
                                case 5:
                                    _c.sent();
                                    return [2 /*return*/, "continue"];
                                case 6: return [4 /*yield*/, promises_1.default.writeFile(dst_path.replace(/\.dat$/, '.json'), JSON.stringify(json, null, 2))];
                                case 7:
                                    _c.sent();
                                    return [3 /*break*/, 10];
                                case 8: return [4 /*yield*/, promises_1.default.copyFile(src_path, dst_path)];
                                case 9:
                                    _c.sent();
                                    _c.label = 10;
                                case 10: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0;
                    return [4 /*yield*/, promises_1.default.readdir(src_dir_path)];
                case 2:
                    _a = _b.sent();
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    filename = _a[_i];
                    return [5 /*yield**/, _loop_1(filename)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var indexes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, parse_indexes('./LittleFighter/data/data.txt')];
                case 1:
                    indexes = _a.sent();
                    return [4 /*yield*/, parse_under_dir('./LittleFighter', './json', indexes)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, copy_dir_1.copy_dir)("./json", "../src/G")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, copy_dir_1.copy_dir)("./src/types", "../src/types")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, copy_dir_1.copy_dir)("./src/js_utils", "../src/js_utils")];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
