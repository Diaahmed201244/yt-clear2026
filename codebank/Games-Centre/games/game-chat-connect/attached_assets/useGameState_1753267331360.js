"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGameState = useGameState;
const react_1 = require("react");
function useGameState() {
    const [gameState, setGameStateInternal] = (0, react_1.useState)(null);
    const updateGameState = (0, react_1.useCallback)((newState) => {
        setGameStateInternal(current => current ? Object.assign(Object.assign({}, current), newState) : null);
    }, []);
    const setGameState = (0, react_1.useCallback)((state) => {
        setGameStateInternal(state);
    }, []);
    const isPlayerTurn = (0, react_1.useCallback)((playerId) => {
        if (!(gameState === null || gameState === void 0 ? void 0 : gameState.room) || !(gameState === null || gameState === void 0 ? void 0 : gameState.players))
            return false;
        const currentPlayer = gameState.players[gameState.room.currentPlayerIndex];
        return (currentPlayer === null || currentPlayer === void 0 ? void 0 : currentPlayer.playerId) === playerId;
    }, [gameState]);
    const getCurrentPlayer = (0, react_1.useCallback)(() => {
        if (!(gameState === null || gameState === void 0 ? void 0 : gameState.room) || !(gameState === null || gameState === void 0 ? void 0 : gameState.players))
            return null;
        return gameState.players[gameState.room.currentPlayerIndex];
    }, [gameState]);
    return {
        gameState,
        updateGameState,
        setGameState,
        isPlayerTurn,
        getCurrentPlayer,
    };
}
