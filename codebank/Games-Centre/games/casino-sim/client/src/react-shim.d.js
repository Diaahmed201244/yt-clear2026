"use strict";
// Minimal runtime shims for TS when @types/react/@types/react-dom are not installed.
// This file prevents TS errors like "Cannot find module 'react'" or "react-dom/client".
// It provides very small, permissive typings so the project can compile until proper deps are installed.
Object.defineProperty(exports, "__esModule", { value: true });
