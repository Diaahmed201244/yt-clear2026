export class MemStorage {
    constructor() {
        this.users = new Map();
        this.gameRooms = new Map();
        this.gamePlayers = new Map();
        this.chatMessages = new Map();
        this.currentUserId = 1;
        this.currentRoomId = 1;
        this.currentPlayerId = 1;
        this.currentMessageId = 1;
    }
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find(user => user.username === username);
    }
    async createUser(insertUser) {
        const id = this.currentUserId++;
        const user = {
            ...insertUser,
            id,
            balance: 2500,
            wins: 0,
            totalEarnings: 0
        };
        this.users.set(id, user);
        return user;
    }
    async updateUserBalance(id, balance) {
        const user = this.users.get(id);
        if (user) {
            const updatedUser = { ...user, balance };
            this.users.set(id, updatedUser);
            return updatedUser;
        }
        return undefined;
    }
    async updateUserStats(id, wins, earnings) {
        const user = this.users.get(id);
        if (user) {
            const updatedUser = { ...user, wins, totalEarnings: earnings };
            this.users.set(id, updatedUser);
            return updatedUser;
        }
        return undefined;
    }
    async createGameRoom(insertRoom) {
        const id = this.currentRoomId++;
        const room = {
            roomCode: insertRoom.roomCode,
            dealerName: insertRoom.dealerName || "Lady Victoria",
            maxPlayers: insertRoom.maxPlayers || 6,
            maxRounds: insertRoom.maxRounds || 5,
            id,
            currentPlayers: 0,
            gameStatus: "waiting",
            currentRound: 0,
            currentPlayerIndex: 0,
            pot: [],
            deck: this.createShuffledDeck(),
            createdAt: new Date(),
        };
        this.gameRooms.set(id, room);
        return room;
    }
    async getGameRoom(id) {
        return this.gameRooms.get(id);
    }
    async getGameRoomByCode(roomCode) {
        return Array.from(this.gameRooms.values()).find(room => room.roomCode === roomCode);
    }
    async updateGameRoom(id, updates) {
        const room = this.gameRooms.get(id);
        if (room) {
            const updatedRoom = { ...room, ...updates };
            this.gameRooms.set(id, updatedRoom);
            return updatedRoom;
        }
        return undefined;
    }
    async deleteGameRoom(id) {
        return this.gameRooms.delete(id);
    }
    async addPlayerToRoom(insertPlayer) {
        const id = this.currentPlayerId++;
        const player = {
            ...insertPlayer,
            id,
            bars: [],
            cards: [],
            currentCard: null,
            isActive: true,
            isReady: false,
            joinedAt: new Date(),
        };
        this.gamePlayers.set(id, player);
        const room = await this.getGameRoom(insertPlayer.roomId);
        if (room) {
            await this.updateGameRoom(room.id, { currentPlayers: room.currentPlayers + 1 });
        }
        return player;
    }
    async getPlayersInRoom(roomId) {
        return Array.from(this.gamePlayers.values()).filter(player => player.roomId === roomId);
    }
    async getPlayer(roomId, playerId) {
        return Array.from(this.gamePlayers.values()).find(player => player.roomId === roomId && player.playerId === playerId);
    }
    async updatePlayer(id, updates) {
        const player = this.gamePlayers.get(id);
        if (player) {
            const updatedPlayer = { ...player, ...updates };
            this.gamePlayers.set(id, updatedPlayer);
            return updatedPlayer;
        }
        return undefined;
    }
    async removePlayerFromRoom(roomId, playerId) {
        const player = await this.getPlayer(roomId, playerId);
        if (player) {
            this.gamePlayers.delete(player.id);
            const room = await this.getGameRoom(roomId);
            if (room) {
                await this.updateGameRoom(room.id, { currentPlayers: Math.max(0, room.currentPlayers - 1) });
            }
            return true;
        }
        return false;
    }
    async addChatMessage(insertMessage) {
        const id = this.currentMessageId++;
        const message = {
            id,
            message: insertMessage.message,
            roomId: insertMessage.roomId,
            playerId: insertMessage.playerId || null,
            playerName: insertMessage.playerName,
            messageType: insertMessage.messageType || "player",
            timestamp: new Date(),
        };
        this.chatMessages.set(id, message);
        return message;
    }
    async getChatMessages(roomId, limit = 50) {
        return Array.from(this.chatMessages.values())
            .filter(message => message.roomId === roomId)
            .sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0))
            .slice(0, limit)
            .reverse();
    }
    createShuffledDeck() {
        const suits = ["hearts", "diamonds", "clubs", "spades"];
        const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        const deck = [];
        for (const suit of suits) {
            for (const rank of ranks) {
                let value = parseInt(rank);
                if (rank === "A")
                    value = 14;
                if (rank === "J")
                    value = 11;
                if (rank === "Q")
                    value = 12;
                if (rank === "K")
                    value = 13;
                deck.push({ suit, rank, value });
            }
        }
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
}
export const storage = new MemStorage();
