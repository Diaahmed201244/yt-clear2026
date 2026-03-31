<<<<<<< HEAD
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
exports.Label = void 0;
const React = require("react");
const LabelPrimitive = require("@radix-ui/react-label");
const class_variance_authority_1 = require("class-variance-authority");
const utils_1 = require("@/lib/utils");
const labelVariants = (0, class_variance_authority_1.cva)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<LabelPrimitive.Root ref={ref} className={(0, utils_1.cn)(labelVariants(), className)} {...props}/>);
});
exports.Label = Label;
Label.displayName = LabelPrimitive.Root.displayName;
=======
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <LabelPrimitive.Root
            ref={ref}
            className={cn(labelVariants(), className)}
            {...props}
        />
    );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
