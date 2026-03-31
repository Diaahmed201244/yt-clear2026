import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertGameSchema } from "@shared/schema";
import { generateDeck, shuffleDeck, evaluateHand, compareHands } from "./gameLogic";
export async function registerRoutes(app) {
    const httpServer = createServer(app);
    const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
    const gameConnections = new Map();
    function broadcastToGame(gameId, message) {
        const connections = gameConnections.get(gameId);
        if (connections) {
            const messageStr = JSON.stringify(message);
            connections.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(messageStr);
                }
            });
        }
    }
    async function dealCards(gameId) {
        const game = await storage.getGame(gameId);
        const players = await storage.getGamePlayers(gameId);
        if (!game || players.length < 2)
            return;
        const deck = shuffleDeck(generateDeck());
        let cardIndex = 0;
        for (const player of players.filter(p => p.status === 'active' || p.status === 'waiting')) {
            const hand = [deck[cardIndex++], deck[cardIndex++]];
            await storage.updateGamePlayer(gameId, player.playerId, {
                hand,
                status: 'active'
            });
        }
        const communityCards = [
            deck[cardIndex++],
            deck[cardIndex++],
            deck[cardIndex++],
            deck[cardIndex++],
            deck[cardIndex++]
        ];
        await storage.updateGame(gameId, {
            communityCards,
            currentPhase: 'dealing',
            turnStartTime: new Date(),
            currentPlayerIndex: 0
        });
        await storage.addGameHistoryEntry({
            gameId,
            round: game.currentRound,
            action: 'deal',
            playerName: 'Lady Victoria',
            data: { message: 'Cards dealt to all players' }
        });
        broadcastToGame(gameId, {
            type: 'cards-dealt',
            gameId,
            communityCards: communityCards.slice(0, 0),
            message: 'Cards have been dealt!'
        });
        setTimeout(() => progressToNextPhase(gameId), 2000);
    }
    async function progressToNextPhase(gameId) {
        const game = await storage.getGame(gameId);
        if (!game)
            return;
        let newPhase = game.currentPhase;
        let communityCardsToShow = 0;
        switch (game.currentPhase) {
            case 'dealing':
                newPhase = 'flop';
                communityCardsToShow = 3;
                break;
            case 'flop':
                newPhase = 'turn';
                communityCardsToShow = 4;
                break;
            case 'turn':
                newPhase = 'river';
                communityCardsToShow = 5;
                break;
            case 'river':
                newPhase = 'showdown';
                break;
        }
        await storage.updateGame(gameId, {
            currentPhase: newPhase,
            turnStartTime: new Date()
        });
        await storage.addGameHistoryEntry({
            gameId,
            round: game.currentRound,
            action: 'reveal',
            playerName: 'Lady Victoria',
            data: { phase: newPhase, message: `${newPhase.charAt(0).toUpperCase() + newPhase.slice(1)} revealed!` }
        });
        if (newPhase === 'showdown') {
            setTimeout(() => determineWinner(gameId), 1000);
        }
        else {
            broadcastToGame(gameId, {
                type: 'phase-change',
                gameId,
                phase: newPhase,
                communityCards: game.communityCards?.slice(0, communityCardsToShow) || [],
                message: `${newPhase.charAt(0).toUpperCase() + newPhase.slice(1)} revealed!`
            });
        }
    }
    async function determineWinner(gameId) {
        const game = await storage.getGame(gameId);
        const players = await storage.getGamePlayers(gameId);
        if (!game || !game.communityCards)
            return;
        const activePlayers = players.filter(p => p.status === 'active');
        let bestPlayer = null;
        let bestHand = null;
        let bestHandType = '';
        for (const player of activePlayers) {
            if (player.hand && player.hand.length === 2) {
                const allCards = [...player.hand, ...game.communityCards];
                const handEvaluation = evaluateHand(allCards);
                if (!bestHand || compareHands(handEvaluation, bestHand) > 0) {
                    bestHand = handEvaluation;
                    bestPlayer = player;
                    bestHandType = handEvaluation.type;
                }
            }
        }
        if (bestPlayer) {
            const newBalance = bestPlayer.balance + game.currentPot;
            await storage.updateGamePlayer(gameId, bestPlayer.playerId, { balance: newBalance });
            await storage.addGameHistoryEntry({
                gameId,
                round: game.currentRound,
                action: 'winner',
                playerId: bestPlayer.playerId,
                playerName: bestPlayer.playerName,
                data: {
                    potWon: game.currentPot,
                    handType: bestHandType,
                    hand: bestPlayer.hand
                }
            });
            broadcastToGame(gameId, {
                type: 'round-winner',
                gameId,
                winner: {
                    id: bestPlayer.playerId,
                    name: bestPlayer.playerName,
                    hand: bestPlayer.hand,
                    handType: bestHandType,
                    potWon: game.currentPot
                },
                message: `${bestPlayer.playerName} wins the round with ${bestHandType}!`
            });
            setTimeout(() => startNewRound(gameId), 5000);
        }
    }
    async function startNewRound(gameId) {
        const game = await storage.getGame(gameId);
        if (!game)
            return;
        if (game.currentRound >= game.maxRounds) {
            await storage.updateGame(gameId, { status: 'finished' });
            broadcastToGame(gameId, {
                type: 'game-finished',
                gameId,
                message: 'Game completed! Thanks for playing.'
            });
            return;
        }
        const newRound = game.currentRound + 1;
        await storage.updateGame(gameId, {
            currentRound: newRound,
            currentPot: 0,
            communityCards: [],
            currentPhase: 'waiting',
            currentPlayerIndex: 0,
            turnStartTime: null
        });
        const players = await storage.getGamePlayers(gameId);
        for (const player of players) {
            await storage.updateGamePlayer(gameId, player.playerId, {
                hand: [],
                currentStake: 0,
                status: 'waiting'
            });
        }
        await storage.addGameHistoryEntry({
            gameId,
            round: newRound,
            action: 'new-round',
            playerName: 'Lady Victoria',
            data: { message: `Round ${newRound} begins! Place your stakes.` }
        });
        broadcastToGame(gameId, {
            type: 'new-round',
            gameId,
            round: newRound,
            message: `Round ${newRound} begins! Place your stakes.`
        });
    }
    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                switch (message.type) {
                    case 'join':
                        if (message.gameId && message.playerId && message.playerName) {
                            ws.gameId = message.gameId;
                            ws.playerId = message.playerId;
                            ws.playerName = message.playerName;
                            if (!gameConnections.has(message.gameId)) {
                                gameConnections.set(message.gameId, new Set());
                            }
                            gameConnections.get(message.gameId).add(ws);
                            const game = await storage.getGame(message.gameId);
                            const existingPlayers = await storage.getGamePlayers(message.gameId);
                            if (game && existingPlayers.length < 6) {
                                const playerExists = existingPlayers.find(p => p.playerId === message.playerId);
                                if (!playerExists) {
                                    await storage.addPlayerToGame({
                                        gameId: message.gameId,
                                        playerId: message.playerId,
                                        playerName: message.playerName,
                                        position: existingPlayers.length,
                                        balance: 2450,
                                        currentStake: game.entryStake,
                                        hand: [],
                                        status: 'waiting',
                                        isDealer: false
                                    });
                                    await storage.updateGame(message.gameId, {
                                        currentPot: game.currentPot + game.entryStake
                                    });
                                    await storage.addGameHistoryEntry({
                                        gameId: message.gameId,
                                        round: game.currentRound,
                                        action: 'join',
                                        playerId: message.playerId,
                                        playerName: message.playerName,
                                        data: { stake: game.entryStake }
                                    });
                                }
                                const updatedGame = await storage.getGame(message.gameId);
                                const players = await storage.getGamePlayers(message.gameId);
                                ws.send(JSON.stringify({
                                    type: 'game-state',
                                    game: updatedGame,
                                    players,
                                    playerId: message.playerId
                                }));
                                broadcastToGame(message.gameId, {
                                    type: 'player-joined',
                                    playerId: message.playerId,
                                    playerName: message.playerName,
                                    players,
                                    currentPot: updatedGame?.currentPot || 0
                                });
                                if (players.length >= 2 && game.status === 'waiting') {
                                    await storage.updateGame(message.gameId, { status: 'active' });
                                    setTimeout(() => dealCards(message.gameId), 2000);
                                }
                            }
                        }
                        break;
                    case 'fold':
                        if (ws.gameId && ws.playerId) {
                            await storage.updateGamePlayer(ws.gameId, ws.playerId, { status: 'folded' });
                            await storage.addGameHistoryEntry({
                                gameId: ws.gameId,
                                round: (await storage.getGame(ws.gameId))?.currentRound || 1,
                                action: 'fold',
                                playerId: ws.playerId,
                                playerName: ws.playerName || 'Unknown',
                                data: {}
                            });
                            broadcastToGame(ws.gameId, {
                                type: 'player-folded',
                                playerId: ws.playerId,
                                playerName: ws.playerName,
                                message: `${ws.playerName} folded`
                            });
                            const players = await storage.getGamePlayers(ws.gameId);
                            const activePlayers = players.filter(p => p.status === 'active');
                            if (activePlayers.length === 1) {
                                setTimeout(() => determineWinner(ws.gameId), 1000);
                            }
                        }
                        break;
                    case 'play-card':
                        if (ws.gameId && ws.playerId) {
                            await storage.addGameHistoryEntry({
                                gameId: ws.gameId,
                                round: (await storage.getGame(ws.gameId))?.currentRound || 1,
                                action: 'play-card',
                                playerId: ws.playerId,
                                playerName: ws.playerName || 'Unknown',
                                data: message.data || {}
                            });
                            broadcastToGame(ws.gameId, {
                                type: 'player-action',
                                playerId: ws.playerId,
                                playerName: ws.playerName,
                                action: 'play-card',
                                message: `${ws.playerName} played a card`
                            });
                        }
                        break;
                }
            }
            catch (error) {
                console.error('WebSocket message error:', error);
            }
        });
        ws.on('close', () => {
            if (ws.gameId) {
                const connections = gameConnections.get(ws.gameId);
                if (connections) {
                    connections.delete(ws);
                    if (connections.size === 0) {
                        gameConnections.delete(ws.gameId);
                    }
                }
            }
        });
    });
    app.post('/api/games', async (req, res) => {
        try {
            const gameData = insertGameSchema.parse(req.body);
            const game = await storage.createGame(gameData);
            res.json(game);
        }
        catch (error) {
            res.status(400).json({ error: 'Invalid game data' });
        }
    });
    app.get('/api/games/:gameId', async (req, res) => {
        try {
            const game = await storage.getGame(req.params.gameId);
            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }
            const players = await storage.getGamePlayers(req.params.gameId);
            const history = await storage.getGameHistory(req.params.gameId);
            res.json({ game, players, history });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get game' });
        }
    });
    app.post('/api/users', async (req, res) => {
        try {
            const userData = req.body;
            const user = await storage.createUser(userData);
            res.json(user);
        }
        catch (error) {
            res.status(400).json({ error: 'Failed to create user' });
        }
    });
    return httpServer;
}
