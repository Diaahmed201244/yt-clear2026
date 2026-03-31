<<<<<<< HEAD
"use client";
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
exports.AvatarFallback = exports.AvatarImage = exports.Avatar = void 0;
const React = require("react");
const AvatarPrimitive = require("@radix-ui/react-avatar");
const utils_1 = require("@/lib/utils");
const Avatar = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Root ref={ref} className={(0, utils_1.cn)(`
      after:content-[''] after:block after:absolute after:inset-0 after:rounded-full after:pointer-events-none after:border after:border-black/10 dark:after:border-white/10
      relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full`, className)} {...props}/>);
});
exports.Avatar = Avatar;
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Image ref={ref} className={(0, utils_1.cn)("aspect-square h-full w-full", className)} {...props}/>);
});
exports.AvatarImage = AvatarImage;
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Fallback ref={ref} className={(0, utils_1.cn)("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props}/>);
});
exports.AvatarFallback = AvatarFallback;
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
=======
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <AvatarPrimitive.Root
            ref={ref}
            className={cn(
                "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full after:content-[''] after:block after:absolute after:inset-0 after:rounded-full after:pointer-events-none after:border after:border-black/10 dark:after:border-white/10",
                className
            )}
            {...props}
        />
    );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <AvatarPrimitive.Image
            ref={ref}
            className={cn("aspect-square h-full w-full", className)}
            {...props}
        />
    );
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <AvatarPrimitive.Fallback
            ref={ref}
            className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
            {...props}
        />
    );
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
