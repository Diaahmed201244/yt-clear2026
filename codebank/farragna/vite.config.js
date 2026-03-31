<<<<<<< HEAD
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = require("@vitejs/plugin-react");
const path_1 = require("path");
const vite_plugin_runtime_error_modal_1 = require("@replit/vite-plugin-runtime-error-modal");
exports.default = (0, vite_1.defineConfig)({
    plugins: [
        (0, plugin_react_1.default)(),
        (0, vite_plugin_runtime_error_modal_1.default)(),
        ...(process.env.NODE_ENV !== "production" &&
            process.env.REPL_ID !== undefined
            ? [
                await Promise.resolve().then(() => require("@replit/vite-plugin-cartographer")).then((m) => m.cartographer()),
                await Promise.resolve().then(() => require("@replit/vite-plugin-dev-banner")).then((m) => m.devBanner()),
=======
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { runtimeErrorModal } from '@replit/vite-plugin-runtime-error-modal';

export default defineConfig({
    plugins: [
        react(),
        runtimeErrorModal(),
        ...(process.env.NODE_ENV !== "production" &&
            process.env.REPL_ID !== undefined
            ? [
                (await import("@replit/vite-plugin-cartographer")).cartographer(),
                (await import("@replit/vite-plugin-dev-banner")).devBanner(),
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
            ]
            : []),
    ],
    resolve: {
        alias: {
<<<<<<< HEAD
            "@": path_1.default.resolve(import.meta.dirname, "client", "src"),
            "@shared": path_1.default.resolve(import.meta.dirname, "shared"),
            "@assets": path_1.default.resolve(import.meta.dirname, "attached_assets"),
        },
    },
    root: path_1.default.resolve(import.meta.dirname, "client"),
    build: {
        outDir: path_1.default.resolve(import.meta.dirname, "dist/public"),
=======
            "@": path.resolve(__dirname, "client", "src"),
            "@shared": path.resolve(__dirname, "shared"),
            "@assets": path.resolve(__dirname, "attached_assets"),
        },
    },
    root: path.resolve(__dirname, "client"),
    build: {
        outDir: path.resolve(__dirname, "dist/public"),
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
        emptyOutDir: true,
    },
    server: {
        fs: {
            strict: true,
            deny: ["**/.*"],
        },
    },
});
