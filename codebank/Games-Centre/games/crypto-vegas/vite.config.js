"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = require("@vitejs/plugin-react");
const path_1 = require("path");
const vite_plugin_runtime_error_modal_1 = require("@replit/vite-plugin-runtime-error-modal");
const url_1 = require("url");
const vite_plugin_glsl_1 = require("vite-plugin-glsl");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_1.dirname)(__filename);
exports.default = (0, vite_1.defineConfig)({
    plugins: [
        (0, plugin_react_1.default)(),
        (0, vite_plugin_runtime_error_modal_1.default)(),
        (0, vite_plugin_glsl_1.default)(), // Add GLSL shader support
    ],
    resolve: {
        alias: {
            "@": path_1.default.resolve(__dirname, "client", "src"),
            "@shared": path_1.default.resolve(__dirname, "shared"),
        },
    },
    root: path_1.default.resolve(__dirname, "client"),
    build: {
        outDir: path_1.default.resolve(__dirname, "dist/public"),
        emptyOutDir: true,
    },
    // Add support for large models and audio files
    assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.mp3", "**/*.ogg", "**/*.wav"],
});
