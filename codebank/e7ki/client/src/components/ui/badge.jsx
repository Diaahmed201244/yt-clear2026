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
exports.badgeVariants = void 0;
exports.Badge = Badge;
const React = require("react");
const class_variance_authority_1 = require("class-variance-authority");
const utils_1 = require("@/lib/utils");
const badgeVariants = (0, class_variance_authority_1.cva)(
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
// Whitespace-nowrap: Badges should never wrap.
"whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" +
    " hover-elevate ", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground shadow-xs",
            secondary: "border-transparent bg-secondary text-secondary-foreground",
            destructive: "border-transparent bg-destructive text-destructive-foreground shadow-xs",
            outline: " border [border-color:var(--badge-outline)] shadow-xs",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
exports.badgeVariants = badgeVariants;
function Badge(_a) {
    var { className, variant } = _a, props = __rest(_a, ["className", "variant"]);
    return (<div className={(0, utils_1.cn)(badgeVariants({ variant }), className)} {...props}/>);
}

function Badge({ className, variant, ...props }) {
    return (<div className={cn(badgeVariants({ variant }), className)} {...props}/>);
}

export { Badge, badgeVariants };
