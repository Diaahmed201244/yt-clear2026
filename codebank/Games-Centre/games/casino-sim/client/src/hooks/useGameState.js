"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGameState = useGameState;
const react_1 = require("react");
function useGameState() {
    const [gameState, setGameState] = (0, react_1.useState)(null);
    const [players, setPlayers] = (0, react_1.useState)([]);
    const [history, setHistory] = (0, react_1.useState)([]);
    const updateGameState = (0, react_1.useCallback)((message) => {
        switch (message.type) {
            case 'game-state':
                setGameState(message.game);
                setPlayers(message.players || []);
                break;
            case 'player-joined':
                setPlayers(message.players || []);
                if (message.currentPot !== undefined) {
                    setGameState(prev => prev ? Object.assign(Object.assign({}, prev), { currentPot: message.currentPot }) : null);
                }
                addHistoryEntry({
                    action: 'join',
                    playerName: message.playerName,
                    data: { message: `${message.playerName} joined the game` }
                });
                break;
            case 'cards-dealt':
                setGameState(prev => prev ? Object.assign(Object.assign({}, prev), { currentPhase: 'dealing', communityCards: message.communityCards || [] }) : null);
                addHistoryEntry({
                    action: 'deal',
                    playerName: 'Lady Victoria',
                    data: { message: message.message || 'Cards dealt' }
                });
                break;
            case 'phase-change':
                setGameState(prev => prev ? Object.assign(Object.assign({}, prev), { currentPhase: message.phase, communityCards: message.communityCards || prev.communityCards }) : null);
                addHistoryEntry({
                    action: 'reveal',
                    playerName: 'Lady Victoria',
                    data: { message: message.message || `${message.phase} phase` }
                });
                break;
            case 'player-folded':
                setPlayers(prev => prev.map(player => player.playerId === message.playerId
                    ? Object.assign(Object.assign({}, player), { status: 'folded' }) : player));
                addHistoryEntry({
                    action: 'fold',
                    playerName: message.playerName,
                    data: { message: message.message }
                });
                break;
            case 'player-action':
                addHistoryEntry({
                    action: message.action,
                    playerName: message.playerName,
                    data: { message: message.message }
                });
                break;
            case 'round-winner':
                addHistoryEntry({
                    action: 'winner',
                    playerName: message.winner.name,
                    data: {
                        potWon: message.winner.potWon,
                        handType: message.winner.handType,
                        message: message.message
                    }
                });
                break;
            case 'new-round':
                setGameState(prev => prev ? Object.assign(Object.assign({}, prev), { currentRound: message.round, currentPot: 0, communityCards: [], currentPhase: 'waiting' }) : null);
                setPlayers(prev => prev.map(player => (Object.assign(Object.assign({}, player), { hand: [], currentStake: 0, status: 'waiting' }))));
                addHistoryEntry({
                    action: 'new-round',
                    playerName: 'Lady Victoria',
                    data: { message: message.message }
                });
                break;
            case 'game-finished':
                setGameState(prev => prev ? Object.assign(Object.assign({}, prev), { status: 'finished' }) : null);
                addHistoryEntry({
                    action: 'game-finished',
                    playerName: 'Lady Victoria',
                    data: { message: message.message }
                });
                break;
        }
    }, []);
    const addHistoryEntry = (0, react_1.useCallback)((entry) => {
        const newEntry = {
            id: Date.now(),
            gameId: (gameState === null || gameState === void 0 ? void 0 : gameState.gameId) || '',
            round: (gameState === null || gameState === void 0 ? void 0 : gameState.currentRound) || 1,
            action: entry.action || 'unknown',
            playerId: entry.playerId || null,
            playerName: entry.playerName || null,
            data: entry.data || null,
            timestamp: new Date(),
        };
        setHistory(prev => [...prev, newEntry]);
    }, [gameState]);
    return {
        gameState,
        players,
        history,
        updateGameState,
    };
}
