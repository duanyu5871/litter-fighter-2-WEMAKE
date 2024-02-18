"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.read_text_file = void 0;
var promises_1 = __importDefault(require("fs/promises"));
var read_text_file = function (path) { return promises_1.default.readFile(path)
    .then(function (v) { return v.toString(); })
    .then(function (v) { return v === null || v === void 0 ? void 0 : v.replace(/\r/g, '').replace(/\\/g, '/'); })
    .catch(function (e) { console.log(e); return null; }); };
exports.read_text_file = read_text_file;
