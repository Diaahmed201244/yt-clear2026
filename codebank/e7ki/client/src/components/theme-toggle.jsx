<<<<<<< HEAD
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = ThemeToggle;
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const theme_provider_1 = require("@/lib/theme-provider");
function ThemeToggle() {
    const { theme, toggleTheme } = (0, theme_provider_1.useTheme)();
    return (<button_1.Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
      {theme === "dark" ? (<lucide_react_1.Sun className="h-4 w-4"/>) : (<lucide_react_1.Moon className="h-4 w-4"/>)}
      <span className="sr-only">Toggle theme</span>
    </button_1.Button>);
=======
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
}
