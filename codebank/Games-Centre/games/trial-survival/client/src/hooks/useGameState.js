"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGameState = useGameState;
const react_1 = require("react");
const gameEngine_1 = require("@/lib/gameEngine");
const audioManager_1 = require("@/lib/audioManager");
function useGameState() {
    const [gameState, setGameState] = (0, react_1.useState)({
        currentStage: 1,
        playersAlive: 456,
        isActive: false,
        gameData: {}
    });
    const [player, setPlayer] = (0, react_1.useState)({
        id: 'player_1',
        username: 'Player456',
        tokens: 100,
        currentStage: 1,
        trialsCompleted: 0,
        isEliminated: false
    });
    const [currentScreen, setCurrentScreen] = (0, react_1.useState)('gameSelection');
    const { playSound } = (0, audioManager_1.useAudioManager)();
    const startGame = (0, react_1.useCallback)((stageNumber) => {
        gameEngine_1.gameEngine.initializeGame();
        setGameState(prev => (Object.assign(Object.assign({}, prev), { currentStage: stageNumber, isActive: true })));
        // Play stage-specific sound
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
    const completeStage = (0, react_1.useCallback)(() => {
        const eliminationRate = gameEngine_1.gameEngine.getEliminationRate(gameState.currentStage);
        gameEngine_1.gameEngine.eliminateAIPlayers(eliminationRate);
        setPlayer(prev => (Object.assign(Object.assign({}, prev), { trialsCompleted: prev.trialsCompleted + 1, tokens: prev.tokens + 50, currentStage: prev.currentStage + 1 })));
        setGameState(prev => (Object.assign(Object.assign({}, prev), { currentStage: prev.currentStage + 1, playersAlive: gameEngine_1.gameEngine.getAlivePlayersCount() })));
        playSound('victorySound');
    }, [gameState.currentStage, playSound]);
    const eliminatePlayer = (0, react_1.useCallback)(() => {
        setPlayer(prev => (Object.assign(Object.assign({}, prev), { isEliminated: true, finalRank: gameState.playersAlive })));
        playSound('eliminationSound');
    }, [gameState.playersAlive, playSound]);
    const resetGame = (0, react_1.useCallback)(() => {
        setPlayer(prev => (Object.assign(Object.assign({}, prev), { tokens: prev.tokens - 10, isEliminated: false, finalRank: undefined })));
        setGameState({
            currentStage: 1,
            playersAlive: 456,
            isActive: false,
            gameData: {}
        });
        gameEngine_1.gameEngine.reset();
    }, []);
    const updateTokens = (0, react_1.useCallback)((amount) => {
        setPlayer(prev => (Object.assign(Object.assign({}, prev), { tokens: Math.max(0, prev.tokens + amount) })));
    }, []);
    const updatePlayersAlive = (0, react_1.useCallback)((count) => {
        setGameState(prev => (Object.assign(Object.assign({}, prev), { playersAlive: count })));
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
