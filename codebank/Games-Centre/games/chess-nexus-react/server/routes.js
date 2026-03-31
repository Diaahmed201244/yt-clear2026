import { createServer } from "http";
import { storage } from "./storage";
import { insertGameSchema, insertMoveSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
export async function registerRoutes(app) {
    // Get current user (mock authentication)
    app.get("/api/user/current", async (req, res) => {
        try {
            const user = await storage.getUser(1); // Mock current user
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to get user" });
        }
    });
    // Create a new game
    app.post("/api/games", async (req, res) => {
        try {
            const gameData = insertGameSchema.parse(req.body);
            const game = await storage.createGame(gameData);
            res.json(game);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Invalid game data", errors: error.errors });
            }
            res.status(500).json({ message: "Failed to create game" });
        }
    });
    // Get a specific game
    app.get("/api/games/:id", async (req, res) => {
        try {
            const gameId = parseInt(req.params.id);
            const game = await storage.getGame(gameId);
            if (!game) {
                return res.status(404).json({ message: "Game not found" });
            }
            res.json(game);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to get game" });
        }
    });
    // Update game state
    app.patch("/api/games/:id", async (req, res) => {
        try {
            const gameId = parseInt(req.params.id);
            const updates = req.body;
            const game = await storage.updateGameState(gameId, updates);
            res.json(game);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to update game" });
        }
    });
    // Get user's games
    app.get("/api/users/:id/games", async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const games = await storage.getUserGames(userId);
            res.json(games);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to get user games" });
        }
    });
    // Add a move to a game
    app.post("/api/games/:id/moves", async (req, res) => {
        try {
            const gameId = parseInt(req.params.id);
            const moveData = insertMoveSchema.parse({
                ...req.body,
                gameId,
            });
            const move = await storage.addMove(moveData);
            res.json(move);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Invalid move data", errors: error.errors });
            }
            res.status(500).json({ message: "Failed to add move" });
        }
    });
    // Get moves for a game
    app.get("/api/games/:id/moves", async (req, res) => {
        try {
            const gameId = parseInt(req.params.id);
            const moves = await storage.getGameMoves(gameId);
            res.json(moves);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to get game moves" });
        }
    });
    // Add chat message
    app.post("/api/games/:id/chat", async (req, res) => {
        try {
            const gameId = parseInt(req.params.id);
            const messageData = insertChatMessageSchema.parse({
                ...req.body,
                gameId,
            });
            const message = await storage.addChatMessage(messageData);
            res.json(message);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Invalid message data", errors: error.errors });
            }
            res.status(500).json({ message: "Failed to add chat message" });
        }
    });
    // Get chat messages for a game
    app.get("/api/games/:id/chat", async (req, res) => {
        try {
            const gameId = parseInt(req.params.id);
            const messages = await storage.getGameChatMessages(gameId);
            res.json(messages);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to get chat messages" });
        }
    });
    // Get active multiplayer games
    app.get("/api/games/multiplayer/active", async (req, res) => {
        try {
            const games = await storage.getActiveMultiplayerGames();
            res.json(games);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to get active games" });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}
