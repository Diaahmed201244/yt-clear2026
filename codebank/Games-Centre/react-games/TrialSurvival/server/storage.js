import { randomUUID } from "crypto";
export class MemStorage {
    constructor() {
        this.users = new Map();
        this.players = new Map();
        this.gameStates = new Map();
        this.leaderboardEntries = new Map();
    }
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
    }
    async createUser(insertUser) {
        const id = randomUUID();
        const user = { ...insertUser, id };
        this.users.set(id, user);
        return user;
    }
    async getPlayer(id) {
        return this.players.get(id);
    }
    async getPlayerByUsername(username) {
        return Array.from(this.players.values()).find((player) => player.username === username);
    }
    async createPlayer(insertPlayer) {
        const id = randomUUID();
        const player = {
            ...insertPlayer,
            id,
            createdAt: new Date()
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
    async getGameState(sessionId) {
        return Array.from(this.gameStates.values()).find((state) => state.sessionId === sessionId);
    }
    async createGameState(insertGameState) {
        const id = randomUUID();
        const gameState = {
            ...insertGameState,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.gameStates.set(id, gameState);
        return gameState;
    }
    async updateGameState(sessionId, updates) {
        const gameState = Array.from(this.gameStates.values()).find((state) => state.sessionId === sessionId);
        if (!gameState)
            return undefined;
        const updatedGameState = {
            ...gameState,
            ...updates,
            updatedAt: new Date()
        };
        this.gameStates.set(gameState.id, updatedGameState);
        return updatedGameState;
    }
    async getLeaderboard(limit = 10) {
        const entries = Array.from(this.leaderboardEntries.values())
            .sort((a, b) => {
            if (a.trialsCompleted !== b.trialsCompleted) {
                return b.trialsCompleted - a.trialsCompleted;
            }
            if (a.tokens !== b.tokens) {
                return b.tokens - a.tokens;
            }
            return (b.survivalTime || 0) - (a.survivalTime || 0);
        });
        return entries.slice(0, limit);
    }
    async addToLeaderboard(insertEntry) {
        const id = randomUUID();
        const entry = {
            ...insertEntry,
            id,
            createdAt: new Date()
        };
        this.leaderboardEntries.set(id, entry);
        return entry;
    }
}
export const storage = new MemStorage();
