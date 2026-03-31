"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGameState = useGameState;
const react_1 = require("react");
function useGameState() {
    const [gameState, setGameStateInternal] = (0, react_1.useState)(null);
    // Update only part of the game state
    const updateGameState = (0, react_1.useCallback)((newState) => {
        setGameStateInternal(current => current ? Object.assign(Object.assign({}, current), newState) : null);
    }, []);
    // Set the entire game state
    const setGameState = (0, react_1.useCallback)((state) => {
        setGameStateInternal(state);
    }, []);
    // Returns true if it's the given player's turn
    const isPlayerTurn = (0, react_1.useCallback)((playerId) => {
        if (!(gameState === null || gameState === void 0 ? void 0 : gameState.room) || !(gameState === null || gameState === void 0 ? void 0 : gameState.players))
            return false;
        const currentPlayer = gameState.players[gameState.room.currentPlayerIndex];
        return (currentPlayer === null || currentPlayer === void 0 ? void 0 : currentPlayer.playerId) === playerId;
    }, [gameState]);
    // Returns the current player object
    const getCurrentPlayer = (0, react_1.useCallback)(() => {
        if (!(gameState === null || gameState === void 0 ? void 0 : gameState.room) || !(gameState === null || gameState === void 0 ? void 0 : gameState.players))
            return null;
        return gameState.players[gameState.room.currentPlayerIndex];
    }, [gameState]);
    // Returns the next player's index, skipping folded players
    const getNextPlayerIndex = (0, react_1.useCallback)(() => {
        if (!(gameState === null || gameState === void 0 ? void 0 : gameState.room) || !(gameState === null || gameState === void 0 ? void 0 : gameState.players))
            return null;
        const { players } = gameState;
        let idx = gameState.room.currentPlayerIndex;
        let attempts = 0;
        do {
            idx = (idx + 1) % players.length;
            attempts++;
            if (attempts > players.length)
                return null; // Prevent infinite loop
        } while (players[idx].folded);
        return idx;
    }, [gameState]);
    return {
        gameState,
        updateGameState,
        setGameState,
        isPlayerTurn,
        getCurrentPlayer,
        getNextPlayerIndex,
    };
}
