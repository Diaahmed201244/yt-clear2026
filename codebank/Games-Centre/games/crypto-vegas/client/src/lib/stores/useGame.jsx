"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGame = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useGame = (0, zustand_1.create)()((0, middleware_1.subscribeWithSelector)((set) => ({
    phase: "ready",
    start: () => {
        set((state) => {
            // Only transition from ready to playing
            if (state.phase === "ready") {
                return { phase: "playing" };
            }
            return {};
        });
    },
    restart: () => {
        set(() => ({ phase: "ready" }));
    },
    end: () => {
        set((state) => {
            // Only transition from playing to ended
            if (state.phase === "playing") {
                return { phase: "ended" };
            }
            return {};
        });
    }
})));
