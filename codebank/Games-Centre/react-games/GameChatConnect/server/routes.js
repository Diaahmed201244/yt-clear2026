import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertRoomSchema } from "@shared/schema";
import { createDeck, shuffleDeck, dealHands } from '../client/src/lib/GameLogic';
export async function registerRoutes(app) {
    const httpServer = createServer(app);
    const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
    const clients = new Set();
    function broadcastToRoom(roomId, message, excludeClient) {
        clients.forEach(client => {
            if (client.roomId === roomId &&
                client.readyState === WebSocket.OPEN &&
                client !== excludeClient) {
                client.send(JSON.stringify(message));
            }
        });
    }
    wss.on('connection', (ws) => {
        clients.add(ws);
        console.log('Client connected');
        ws.on('message', async (data) => {
            try {   
                const message = JSON.parse(data.toString());
                switch (message.type) {
                    case 'join_room':
                        try {   
                            const { roomCode, playerId, playerName } = message.data;
                            const room = await storage.getRoomByCode(roomCode);
                            if (!room) {
                                ws.send(JSON.stringify({
                                    type: 'error',
                                    data: { message: 'Room not found' }
                                }));
                                return;
                            }
                            const player = await storage.createPlayer({
                                userId: playerId,
                                roomId: room.id,
                                playerId: playerId,
                                playerName: playerName
                            });
                            ws.playerId = playerId;
                            ws.roomId = room.id;
                            ws.playerName = playerName;
                            const gameState = await storage.getGameState(room.id);
                            ws.send(JSON.stringify({
                                type: 'game_state',
                                data: gameState
                            }));
                            broadcastToRoom(room.id, {
                                type: 'player_joined',
                                data: { playerName, playerId }
                            }, ws);
                        }
                        catch (error) {
                            console.error('Error joining room:', error);
                            ws.send(JSON.stringify({
                                type: 'error',
                                data: { message: 'Failed to join room' }
                            }));
                        }
                        break;
                    case 'start_game':
                        try {   
                            if (!ws.roomId)
                                return;
                            const room = await storage.getRoom(ws.roomId);
                            if (!room)
                                return;
                            await storage.updateRoom(room.id, {
                                gameStatus: "playing",
                                currentRound: 1
                            });
                            const gameState = await storage.getGameState(room.id);
                            broadcastToRoom(room.id, {
                                type: 'game_started',
                                data: gameState
                            });
                            broadcastToRoom(room.id, {
                                type: 'game_state',
                                data: gameState
                            });
                        }
                        catch (error) {
                            console.error('Error starting game:', error);
                        }
                        break;
                    case 'reset_game':
                        try {   
                            if (!ws.roomId)
                                return;
                            const room = await storage.getRoom(ws.roomId);
                            if (!room)
                                return;
                            await storage.updateRoom(room.id, {
                                gameStatus: "waiting",
                                currentRound: 0,
                                currentPlayerIndex: 0
                            });
                            const gameState = await storage.getGameState(room.id);
                            broadcastToRoom(room.id, {
                                type: 'game_reset',
                                data: gameState
                            });
                            broadcastToRoom(room.id, {
                                type: 'game_state',
                                data: gameState
                            });
                        }
                        catch (error) {
                            console.error('Error resetting game:', error);
                        }
                        break;
                    case 'chat_message':
                        try {   
                            if (!ws.roomId || !ws.playerId || !ws.playerName)
                                return;
                            const { message: chatMessage, messageType } = message.data;
                            const newMessage = await storage.createMessage({
                                roomId: ws.roomId,
                                playerId: ws.playerId,
                                playerName: ws.playerName,
                                message: chatMessage,
                                messageType: messageType || "chat"
                            });
                            broadcastToRoom(ws.roomId, {
                                type: 'new_message',
                                data: newMessage
                            });
                        }
                        catch (error) {
                            console.error('Error sending message:', error);
                        }
                        break;
                    case 'exchange_money':
                        try {   
                            if (!ws.playerId)
                                return;
                            const { amount } = message.data;
                            const user = await storage.getUser(ws.playerId);
                            if (!user || user.balance < amount) {
                                ws.send(JSON.stringify({
                                    type: 'error',
                                    data: { message: 'Insufficient balance' }
                                }));
                                return;
                            }
                            await storage.updateUserBalance(user.id, user.balance - amount);
                            ws.send(JSON.stringify({
                                type: 'money_exchanged',
                                data: { amount }
                            }));
                        }
                        catch (error) {
                            console.error('Error exchanging money:', error);
                        }
                        break;
                    case 'webrtc_offer':
                    case 'webrtc_answer':
                    case 'webrtc_ice_candidate':
                        if (ws.roomId) {
                            broadcastToRoom(ws.roomId, message, ws);
                        }
                        break;
                }
            }
            catch (error) {
                console.error('WebSocket message error:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    data: { message: 'Invalid message format' }
                }));
            }
        });
        ws.on('close', () => {
            clients.delete(ws);
            if (ws.roomId && ws.playerName) {
                broadcastToRoom(ws.roomId, {
                    type: 'player_left',
                    data: { playerName: ws.playerName, playerId: ws.playerId }
                });
            }
            console.log('Client disconnected');
        });
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            clients.delete(ws);
        });
    });
    app.post("/api/auth/register", async (req, res) => {
        try {   
            const userData = insertUserSchema.parse(req.body);
            const user = await storage.createUser(userData);
            res.json({ user });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(400).json({ message: "Registration failed" });
        }
    });
    app.post("/api/rooms/create", async (req, res) => {
        try {   
            const roomData = insertRoomSchema.parse(req.body);
            const room = await storage.createRoom(roomData);
            res.json({ room });
        }
        catch (error) {
            console.error('Room creation error:', error);
            res.status(400).json({ message: "Room creation failed" });
        }
    });
    app.post("/api/rooms/start", async (req, res) => {
        try {   
            const { roomCode } = req.body;
            if (!roomCode) {
                return res.status(400).json({ error: "Room code is required" });
            }
            const room = await storage.getRoomByCode(roomCode);
            if (!room) {
                return res.status(404).json({ error: "Room not found" });
            }
            const players = await storage.getPlayersByRoom(room.id);
            if (!players || players.length === 0) {
                return res.status(400).json({ error: "No players in room" });
            }
            let deck = shuffleDeck(createDeck());
            const handSize = 5;
            const hands = dealHands(deck, players.length, handSize);
            deck = deck.slice(players.length * handSize);
            for (let i = 0; i < players.length; i++) {
                await storage.updatePlayer(players[i].id, { hand: hands[i], currentBet: 0, folded: false });
            }
            await storage.updateRoom(room.id, {
                gameStatus: "playing",
                currentRound: 1,
                currentPlayerIndex: 0,
                phase: "betting",
                deck,
                pot: 0
            });
            const gameState = await storage.getGameState(room.id);
            res.json({ success: true, gameState });
        }
        catch (error) {
            console.error("Error starting game:", error);
            res.status(500).json({ error: "Failed to start game" });
        }
    });
    app.get("/api/rooms/:roomCode", async (req, res) => {
        try {   
            const { roomCode } = req.params;
            const room = await storage.getRoomByCode(roomCode);
            if (!room) {
                res.status(404).json({ message: "Room not found" });
                return;
            }
            res.json({ room });
        }
        catch (error) {
            console.error('Room fetch error:', error);
            res.status(500).json({ message: "Failed to fetch room" });
        }
    });
    return httpServer;
}
