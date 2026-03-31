import { useState, useCallback } from "react";
import { gameEngine } from "@/lib/gameEngine";
import { useAudioManager } from "@/lib/audioManager";
export function useGameState() {
    const [gameState, setGameState] = useState({
        currentStage: 1,
        playersAlive: 456,
        isActive: false,
        gameData: {}
    });
    const [player, setPlayer] = useState({
        id: 'player_1',
        username: 'Player456',
        tokens: 100,
        currentStage: 1,
        trialsCompleted: 0,
        isEliminated: false
    });
    const [currentScreen, setCurrentScreen] = useState('gameSelection');
    const { playSound } = useAudioManager();
    const startGame = useCallback((stageNumber) => {
        gameEngine.initializeGame();
        setGameState(prev => ({
            ...prev,
            currentStage: stageNumber,
            isActive: true
        }));
        const stageAudio = [
            'redLightGreenLight',
            'honeycombCarve',
            'tugOfWar',
            'marbles',
            'glassBridge'
        ];
        if (stageAudio[stageNumber - 1]) {
            playSound(stageAudio[stageNumber - 1]);
        }
    }, [playSound]);
    const completeStage = useCallback(() => {
        const eliminationRate = gameEngine.getEliminationRate(gameState.currentStage);
        gameEngine.eliminateAIPlayers(eliminationRate);
        setPlayer(prev => ({
            ...prev,
            trialsCompleted: prev.trialsCompleted + 1,
            tokens: prev.tokens + 50,
            currentStage: prev.currentStage + 1
        }));
        setGameState(prev => ({
            ...prev,
            currentStage: prev.currentStage + 1,
            playersAlive: gameEngine.getAlivePlayersCount()
        }));
        playSound('victorySound');
    }, [gameState.currentStage, playSound]);
    const eliminatePlayer = useCallback(() => {
        setPlayer(prev => ({
            ...prev,
            isEliminated: true,
            finalRank: gameState.playersAlive
        }));
        playSound('eliminationSound');
    }, [gameState.playersAlive, playSound]);
    const resetGame = useCallback(() => {
        setPlayer(prev => ({
            ...prev,
            tokens: prev.tokens - 10,
            isEliminated: false,
            finalRank: undefined
        }));
        setGameState({
            currentStage: 1,
            playersAlive: 456,
            isActive: false,
            gameData: {}
        });
        gameEngine.reset();
    }, []);
    const updateTokens = useCallback((amount) => {
        setPlayer(prev => ({
            ...prev,
            tokens: Math.max(0, prev.tokens + amount)
        }));
    }, []);
    const updatePlayersAlive = useCallback((count) => {
        setGameState(prev => ({
            ...prev,
            playersAlive: count
        }));
    }, []);
    return {
        gameState,
        player,
        currentScreen,
        setCurrentScreen,
        startGame,
        completeStage,
        eliminatePlayer,
        resetGame,
        updateTokens,
        updatePlayersAlive
    };
}
