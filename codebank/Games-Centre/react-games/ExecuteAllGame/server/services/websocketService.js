import { WebSocketServer, WebSocket } from "ws";
import { storage } from "../storage";
import { gameService } from "./gameService";
export class WebSocketService {
    constructor(server) {
        this.clients = new Map();
        this.roomClients = new Map();
        this.wss = new WebSocketServer({ server, path: '/ws' });
        this.setupWebSocketServer();
    }
    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            console.log('New WebSocket connection');
            const clientConnection = { ws };
            this.clients.set(ws, clientConnection);
            ws.on('message', async (data) => {
                try { 
                    const message = JSON.parse(data.toString());
                    await this.handleMessage(ws, message);
                }
                catch (error) {
                    console.error('Error handling WebSocket message:', error);
                    this.sendError(ws, 'Invalid message format');
                }
            });
            ws.on('close', () => {
                this.handleDisconnection(ws);
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.handleDisconnection(ws);
            });
        });
    }
    async handleMessage(ws, message) {
        const client = this.clients.get(ws);
        if (!client)
            return;
        switch (message.type) {
            case 'join_room':
                await this.handleJoinRoom(ws, message.data);
                break;
            case 'play_card':
                await this.handlePlayCard(ws, message.data);
                break;
            case 'exchange_money':
                await this.handleExchangeMoney(ws, message.data);
                break;
            case 'chat_message':
                await this.handleChatMessage(ws, message.data);
                break;
            case 'start_game':
                await this.handleStartGame(ws);
                break;
            case 'ready_up':
                await this.handleReadyUp(ws);
                break;
            default:
                this.sendError(ws, 'Unknown message type');
        }
    }
    async handleJoinRoom(ws, data) {
        try { 
            const room = await storage.getGameRoomByCode(data.roomCode);
            if (!room) {
                this.sendError(ws, 'Room not found');
                return;
            }
            if (room.currentPlayers >= room.maxPlayers) {
                this.sendError(ws, 'Room is full');
                return;
            }
            const players = await storage.getPlayersInRoom(room.id);
            const position = players.length;
            await storage.addPlayerToRoom({
                roomId: room.id,
                playerId: data.playerId,
                playerName: data.playerName,
                position
            });
            const client = this.clients.get(ws);
            client.userId = data.playerId;
            client.roomId = room.id;
            client.playerName = data.playerName;
            if (!this.roomClients.has(room.id)) {
                this.roomClients.set(room.id, new Set());
            }
            this.roomClients.get(room.id).add(ws);
            await this.sendGameState(room.id);
            await storage.addChatMessage({
                roomId: room.id,
                playerId: null,
                playerName: "System",
                message: `${data.playerName} joined the table`,
                messageType: "system"
            });
            this.broadcastToRoom(room.id, {
                type: 'player_joined',
                data: { playerName: data.playerName }
            });
        }
        catch (error) {
            console.error('Error joining room:', error);
            this.sendError(ws, 'Failed to join room');
        }
    }
    async handlePlayCard(ws, data) {
        const client = this.clients.get(ws);
        if (!client?.userId || !client?.roomId) {
            this.sendError(ws, 'Not in a room');
            return;
        }
        try { 
            const success = await gameService.playCard(client.roomId, client.userId, data.card);
            if (success) {
                await this.sendGameState(client.roomId);
                this.broadcastToRoom(client.roomId, {
                    type: 'card_played',
                    data: {
                        playerName: client.playerName,
                        card: data.card
                    }
                });
            }
            else {
                this.sendError(ws, 'Cannot play card');
            }
        }
        catch (error) {
            console.error('Error playing card:', error);
            this.sendError(ws, 'Failed to play card');
        }
    }
    async handleExchangeMoney(ws, data) {
        const client = this.clients.get(ws);
        if (!client?.userId || !client?.roomId) {
            this.sendError(ws, 'Not in a room');
            return;
        }
        try { 
            const bars = await gameService.exchangeMoney(client.userId, client.roomId, data.amount);
            if (bars.length > 0) {
                await this.sendGameState(client.roomId);
                this.send(ws, {
                    type: 'exchange_success',
                    data: { bars, amount: data.amount }
                });
            }
            else {
                this.sendError(ws, 'Insufficient balance');
            }
        }
        catch (error) {
            console.error('Error exchanging money:', error);
            this.sendError(ws, 'Failed to exchange money');
        }
    }
    async handleChatMessage(ws, data) {
        const client = this.clients.get(ws);
        if (!client?.userId || !client?.roomId || !client?.playerName) {
            this.sendError(ws, 'Not in a room');
            return;
        }
        try { 
            const chatMessage = await storage.addChatMessage({
                roomId: client.roomId,
                playerId: client.userId,
                playerName: client.playerName,
                message: data.message,
                messageType: data.messageType || 'chat'
            });
            this.broadcastToRoom(client.roomId, {
                type: 'chat_message',
                data: chatMessage
            });
        }
        catch (error) {
            console.error('Error sending chat message:', error);
            this.sendError(ws, 'Failed to send message');
        }
    }
    async handleStartGame(ws) {
        const client = this.clients.get(ws);
        if (!client?.roomId) {
            this.sendError(ws, 'Not in a room');
            return;
        }
        try { 
            const success = await gameService.startGame(client.roomId);
            if (success) {
                await this.sendGameState(client.roomId);
                this.broadcastToRoom(client.roomId, {
                    type: 'game_started',
                    data: {}
                });
            }
            else {
                this.sendError(ws, 'Cannot start game');
            }
        }
        catch (error) {
            console.error('Error starting game:', error);
            this.sendError(ws, 'Failed to start game');
        }
    }
    async handleReadyUp(ws) {
        const client = this.clients.get(ws);
        if (!client?.userId || !client?.roomId) {
            this.sendError(ws, 'Not in a room');
            return;
        }
        try { 
            const player = await storage.getPlayer(client.roomId, client.userId);
            if (player) {
                await storage.updatePlayer(player.id, { isReady: true });
                await this.sendGameState(client.roomId);
                this.broadcastToRoom(client.roomId, {
                    type: 'player_ready',
                    data: { playerName: client.playerName }
                });
            }
        }
        catch (error) {
            console.error('Error updating ready status:', error);
            this.sendError(ws, 'Failed to update ready status');
        }
    }
    async sendGameState(roomId) {
        try { 
            const room = await storage.getGameRoom(roomId);
            const players = await storage.getPlayersInRoom(roomId);
            const messages = await storage.getChatMessages(roomId, 20);
            if (!room)
                return;
            const gameState = {
                room,
                players: players.map(p => ({
                    ...p,
                    cards: p.cards
                })),
                messages
            };
            this.broadcastToRoom(roomId, {
                type: 'game_state',
                data: gameState
            });
        }
        catch (error) {
            console.error('Error sending game state:', error);
        }
    }
    handleDisconnection(ws) {
        const client = this.clients.get(ws);
        if (client?.roomId) {
            const roomClients = this.roomClients.get(client.roomId);
            if (roomClients) {
                roomClients.delete(ws);
                if (roomClients.size === 0) {
                    this.roomClients.delete(client.roomId);
                }
            }
            if (client.userId) {
                storage.removePlayerFromRoom(client.roomId, client.userId);
                this.broadcastToRoom(client.roomId, {
                    type: 'player_left',
                    data: { playerName: client.playerName }
                });
            }
        }
        this.clients.delete(ws);
        console.log('Client disconnected');
    }
    broadcastToRoom(roomId, message) {
        const roomClients = this.roomClients.get(roomId);
        if (roomClients) {
            const messageStr = JSON.stringify(message);
            roomClients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(messageStr);
                }
            });
        }
    }
    send(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
    sendError(ws, error) {
        this.send(ws, {
            type: 'error',
            data: { message: error }
        });
    }
}
