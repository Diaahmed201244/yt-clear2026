<<<<<<< HEAD
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsMobile = useIsMobile;
const React = require("react");
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
=======
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    const [isMobile, setIsMobile] = React.useState(undefined);
    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        mql.addEventListener("change", onChange);
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        return () => mql.removeEventListener("change", onChange);
    }, []);
    return !!isMobile;
}
