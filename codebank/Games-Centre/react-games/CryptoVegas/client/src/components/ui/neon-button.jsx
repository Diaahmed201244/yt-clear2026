"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeonButton = void 0;
const react_1 = require("react");
const utils_1 = require("@/lib/utils");
const NeonButton = (0, react_1.forwardRef)((_a, ref) => {
    var { className, variant = 'default', size = 'default', glow = false } = _a, props = __rest(_a, ["className", "variant", "size", "glow"]);
    const variants = {
        default: 'bg-gradient-to-r from-green-400 to-green-500 text-black hover:from-green-300 hover:to-green-400',
        secondary: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400',
        danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-400 hover:to-pink-400'
    };
    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8'
    };
    return (<button className={(0, utils_1.cn)('inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', 'transform hover:scale-105 active:scale-95', 'border border-transparent shadow-lg', variants[variant], sizes[size], glow && 'shadow-lg shadow-green-500/25', className)} ref={ref} {...props}/>);
});
exports.NeonButton = NeonButton;
NeonButton.displayName = "NeonButton";
