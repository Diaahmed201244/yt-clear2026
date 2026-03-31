export class MemStorage {
    constructor() {
        this.users = new Map();
        this.rooms = new Map();
        this.players = new Map();
        this.messages = new Map();
        this.currentUserId = 1;
        this.currentRoomId = 1;
        this.currentPlayerId = 1;
        this.currentMessageId = 1;
    }
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
    }
    async createUser(insertUser) {
        const existingUser = await this.getUserByUsername(insertUser.username);
        if (existingUser) {
            return existingUser;
        }
        const id = this.currentUserId++;
        const user = {
            ...insertUser,
            id,
            balance: 2500,
            createdAt: new Date()
        };
        this.users.set(id, user);
        return user;
    }
    async updateUserBalance(id, balance) {
        const user = this.users.get(id);
        if (!user)
            return undefined;
        const updatedUser = { ...user, balance };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
    async getRoom(id) {
        return this.rooms.get(id);
    }
    async getRoomByCode(roomCode) {
        return Array.from(this.rooms.values()).find((room) => room.roomCode === roomCode);
    }
    async createRoom(insertRoom) {
        const id = this.currentRoomId++;
        const roomCode = `ROYAL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const room = {
            id,
            roomCode,
            dealerName: insertRoom.dealerName,
            maxPlayers: insertRoom.maxPlayers || 6,
            maxRounds: insertRoom.maxRounds || 5,
            currentRound: 0,
            gameStatus: "waiting",
            currentPlayerIndex: 0,
            pot: [],
            createdAt: new Date()
        };
        this.rooms.set(id, room);
        return room;
    }
    async updateRoom(id, updates) {
        const room = this.rooms.get(id);
        if (!room)
            return undefined;
        const updatedRoom = { ...room, ...updates };
        this.rooms.set(id, updatedRoom);
        return updatedRoom;
    }
    async deleteRoom(id) {
        return this.rooms.delete(id);
    }
    async getPlayer(id) {
        return this.players.get(id);
    }
    async getPlayersByRoom(roomId) {
        return Array.from(this.players.values()).filter((player) => player.roomId === roomId && player.isActive);
    }
    async createPlayer(insertPlayer) {
        const existingPlayer = Array.from(this.players.values()).find((player) => player.userId === insertPlayer.userId && player.roomId === insertPlayer.roomId && player.isActive);
        if (existingPlayer) {
            return existingPlayer;
        }
        const id = this.currentPlayerId++;
        const player = {
            id,
            userId: insertPlayer.userId || null,
            roomId: insertPlayer.roomId || null,
            playerId: insertPlayer.playerId,
            playerName: insertPlayer.playerName,
            hand: [],
            bars: [],
            isActive: true,
            audioEnabled: true,
            isMuted: false,
            joinedAt: new Date()
        };
        this.players.set(id, player);
        return player;
    }
    async updatePlayer(id, updates) {
        const player = this.players.get(id);
        if (!player)
            return undefined;
        const updatedPlayer = { ...player, ...updates };
        this.players.set(id, updatedPlayer);
        return updatedPlayer;
    }
    async removePlayer(id) {
        const player = this.players.get(id);
        if (!player)
            return false;
        const updatedPlayer = { ...player, isActive: false };
        this.players.set(id, updatedPlayer);
        return true;
    }
    async getMessagesByRoom(roomId) {
        return Array.from(this.messages.values())
            .filter((message) => message.roomId === roomId)
            .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
    }
    async createMessage(insertMessage) {
        const id = this.currentMessageId++;
        const message = {
            id,
            roomId: insertMessage.roomId || null,
            playerId: insertMessage.playerId,
            playerName: insertMessage.playerName,
            message: insertMessage.message,
            messageType: insertMessage.messageType || "chat",
            timestamp: new Date()
        };
        this.messages.set(id, message);
        return message;
    }
    async getGameState(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return undefined;
        const players = await this.getPlayersByRoom(roomId);
        const messages = await this.getMessagesByRoom(roomId);
        const currentPlayer = players[room.currentPlayerIndex];
        return {
            room,
            players,
            messages,
            currentPlayer
        };
    }
}
export const storage = new MemStorage();
