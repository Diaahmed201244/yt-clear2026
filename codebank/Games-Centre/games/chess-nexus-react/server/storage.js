export class MemStorage {
    users;
    games;
    moves;
    chatMessages;
    currentUserId;
    currentGameId;
    currentMoveId;
    currentChatId;
    constructor() {
        this.users = new Map();
        this.games = new Map();
        this.moves = new Map();
        this.chatMessages = new Map();
        this.currentUserId = 1;
        this.currentGameId = 1;
        this.currentMoveId = 1;
        this.currentChatId = 1;
        // Create a default user
        this.users.set(1, {
            id: 1,
            username: "Player1",
            email: "player1@example.com",
            rating: 1432,
            createdAt: new Date(),
        });
        this.currentUserId = 2;
    }
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
    }
    async createUser(insertUser) {
        const id = this.currentUserId++;
        const user = {
            ...insertUser,
            id,
            createdAt: new Date(),
        };
        this.users.set(id, user);
        return user;
    }
    async updateUserRating(id, rating) {
        const user = this.users.get(id);
        if (!user)
            throw new Error("User not found");
        const updatedUser = { ...user, rating };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
    async createGame(insertGame) {
        const id = this.currentGameId++;
        const game = {
            ...insertGame,
            id,
            status: "active",
            result: null,
            currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            pgn: "",
            whiteTime: insertGame.timeControl || 600,
            blackTime: insertGame.timeControl || 600,
            currentTurn: "white",
            moveCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.games.set(id, game);
        return game;
    }
    async getGame(id) {
        return this.games.get(id);
    }
    async updateGameState(id, updates) {
        const game = this.games.get(id);
        if (!game)
            throw new Error("Game not found");
        const updatedGame = {
            ...game,
            ...updates,
            updatedAt: new Date()
        };
        this.games.set(id, updatedGame);
        return updatedGame;
    }
    async getUserGames(userId) {
        return Array.from(this.games.values()).filter((game) => game.whitePlayerId === userId || game.blackPlayerId === userId);
    }
    async getActiveMultiplayerGames() {
        return Array.from(this.games.values()).filter((game) => game.gameType === "multiplayer" && game.status === "active");
    }
    async addMove(insertMove) {
        const id = this.currentMoveId++;
        const move = {
            ...insertMove,
            id,
            timestamp: new Date(),
        };
        this.moves.set(id, move);
        return move;
    }
    async getGameMoves(gameId) {
        return Array.from(this.moves.values())
            .filter((move) => move.gameId === gameId)
            .sort((a, b) => a.moveNumber - b.moveNumber);
    }
    async addChatMessage(insertMessage) {
        const id = this.currentChatId++;
        const message = {
            ...insertMessage,
            id,
            timestamp: new Date(),
        };
        this.chatMessages.set(id, message);
        return message;
    }
    async getGameChatMessages(gameId) {
        return Array.from(this.chatMessages.values())
            .filter((message) => message.gameId === gameId)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
}
export const storage = new MemStorage();
