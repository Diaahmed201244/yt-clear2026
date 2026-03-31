"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLocalStorage = exports.getLocalStorage = void 0;
exports.cn = cn;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key) || "null");
exports.getLocalStorage = getLocalStorage;
const setLocalStorage = (key, value) => window.localStorage.setItem(key, JSON.stringify(value));
exports.setLocalStorage = setLocalStorage;
