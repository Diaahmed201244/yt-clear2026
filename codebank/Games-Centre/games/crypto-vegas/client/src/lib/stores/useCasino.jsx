"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCasino = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useCasino = (0, zustand_1.create)()((0, middleware_1.persist)((set, get) => ({
    currentGame: "slots",
    gameHistory: [],
    setCurrentGame: (game) => {
        set({ currentGame: game });
        console.log('Switched to game:', game);
    },
    addGameResult: (result) => {
        const newResult = Object.assign(Object.assign({}, result), { id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, timestamp: new Date().toISOString() });
        set(state => ({
            gameHistory: [newResult, ...state.gameHistory].slice(0, 100) // Keep last 100 games
        }));
        console.log('Game result added:', newResult);
    },
    clearHistory: () => {
        set({ gameHistory: [] });
        console.log('Game history cleared');
    }
}), {
    name: "casino-state",
}));
