export class MemStorage {
    constructor() {
        this.users = new Map();
        this.games = new Map();
        this.gamePlayers = new Map();
        this.gameHistories = new Map();
        this.currentUserId = 1;
        this.currentGameHistoryId = 1;
    }
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
    }
    async createUser(insertUser) {
        const id = this.currentUserId++;
        const user = { ...insertUser, id, balance: 5000 };
        this.users.set(id, user);
        return user;
    }
    async updateUserBalance(id, balance) {
        const user = this.users.get(id);
        if (user) {
            user.balance = balance;
            this.users.set(id, user);
        }
    }
    async createGame(insertGame) {
        const game = {
            ...insertGame,
            id: Math.floor(Math.random() * 10000),
            createdAt: new Date(),
            turnStartTime: null,
            status: 'waiting',
            currentRound: 1,
            maxRounds: 4,
            entryStake: 250,
            currentPot: 0,
            communityCards: [],
            currentPhase: 'waiting',
            currentPlayerIndex: 0,
            turnTimeLimit: 30
        };
        if (!game.gameId) {
            game.gameId = `GAME-${Date.now()}`;
        }
        this.games.set(game.gameId, game);
        this.gamePlayers.set(game.gameId, []);
        this.gameHistories.set(game.gameId, []);
        return game;
    }
    async getGame(gameId) {
        return this.games.get(gameId);
    }
    async updateGame(gameId, updates) {
        const game = this.games.get(gameId);
        if (game) {
            const updatedGame = { ...game, ...updates };
            this.games.set(gameId, updatedGame);
        }
    }
    async deleteGame(gameId) {
        this.games.delete(gameId);
        this.gamePlayers.delete(gameId);
        this.gameHistories.delete(gameId);
    }
    async addPlayerToGame(insertPlayer) {
        const player = {
            id: Math.floor(Math.random() * 10000),
            joinedAt: new Date(),
            status: 'waiting',
            currentStake: 0,
            hand: [],
            isDealer: false,
            ...insertPlayer
        };
        const players = this.gamePlayers.get(insertPlayer.gameId) || [];
        players.push(player);
        this.gamePlayers.set(insertPlayer.gameId, players);
        return player;
    }
    async getGamePlayers(gameId) {
        return this.gamePlayers.get(gameId) || [];
    }
    async updateGamePlayer(gameId, playerId, updates) {
        const players = this.gamePlayers.get(gameId) || [];
        const playerIndex = players.findIndex(p => p.playerId === playerId);
        if (playerIndex !== -1) {
            players[playerIndex] = { ...players[playerIndex], ...updates };
            this.gamePlayers.set(gameId, players);
        }
    }
    async removePlayerFromGame(gameId, playerId) {
        const players = this.gamePlayers.get(gameId) || [];
        const filteredPlayers = players.filter(p => p.playerId !== playerId);
        this.gamePlayers.set(gameId, filteredPlayers);
    }
    async addGameHistoryEntry(insertEntry) {
        const entry = {
            id: this.currentGameHistoryId++,
            timestamp: new Date(),
            data: null,
            playerId: insertEntry.playerId || null,
            playerName: insertEntry.playerName || null,
            ...insertEntry
        };
        const history = this.gameHistories.get(insertEntry.gameId) || [];
        history.push(entry);
        this.gameHistories.set(insertEntry.gameId, history);
        return entry;
    }
    async getGameHistory(gameId) {
        return this.gameHistories.get(gameId) || [];
    }
}
export const storage = new MemStorage();
