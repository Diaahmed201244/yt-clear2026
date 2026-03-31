import { useState, useCallback } from "react";
export function useGameState() {
    const [gameState, setGameStateInternal] = useState(null);
    const updateGameState = useCallback((newState) => {
        setGameStateInternal(current => current ? { ...current, ...newState } : null);
    }, []);
    const setGameState = useCallback((state) => {
        setGameStateInternal(state);
    }, []);
    const isPlayerTurn = useCallback((playerId) => {
        if (!gameState?.room || !gameState?.players)
            return false;
        const currentPlayer = gameState.players[gameState.room.currentPlayerIndex];
        return currentPlayer?.playerId === playerId;
    }, [gameState]);
    const getCurrentPlayer = useCallback(() => {
        if (!gameState?.room || !gameState?.players)
            return null;
        return gameState.players[gameState.room.currentPlayerIndex];
    }, [gameState]);
    const getNextPlayerIndex = useCallback(() => {
        if (!gameState?.room || !gameState?.players)
            return null;
        const { players } = gameState;
        let idx = gameState.room.currentPlayerIndex;
        let attempts = 0;
        do {
            idx = (idx + 1) % players.length;
            attempts++;
            if (attempts > players.length)
                return null;
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
