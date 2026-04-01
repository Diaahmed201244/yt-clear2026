import { createServer } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertGameStateSchema, insertLeaderboardSchema } from "@shared/schema";
export async function registerRoutes(app) {
    app.post("/api/players", async (req, res) => {
        try {   
            const playerData = insertPlayerSchema.parse(req.body);
            const player = await storage.createPlayer(playerData);
            res.json(player);
        }
        catch (error) {
            res.status(400).json({ error: "Invalid player data" });
        }
    });
    app.get("/api/players/:id", async (req, res) => {
        try {   
            const player = await storage.getPlayer(req.params.id);
            if (!player) {
                res.status(404).json({ error: "Player not found" });
                return;
            }
            res.json(player);
        }
        catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    });
    app.put("/api/players/:id", async (req, res) => {
        try {   
            const updates = req.body;
            const player = await storage.updatePlayer(req.params.id, updates);
            if (!player) {
                res.status(404).json({ error: "Player not found" });
                return;
            }
            res.json(player);
        }
        catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    });
    app.post("/api/game-states", async (req, res) => {
        try {   
            const gameStateData = insertGameStateSchema.parse(req.body);
            const gameState = await storage.createGameState(gameStateData);
            res.json(gameState);
        }
        catch (error) {
            res.status(400).json({ error: "Invalid game state data" });
        }
    });
    app.get("/api/game-states/:sessionId", async (req, res) => {
        try {   
            const gameState = await storage.getGameState(req.params.sessionId);
            if (!gameState) {
                res.status(404).json({ error: "Game state not found" });
                return;
            }
            res.json(gameState);
        }
        catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    });
    app.put("/api/game-states/:sessionId", async (req, res) => {
        try {   
            const updates = req.body;
            const gameState = await storage.updateGameState(req.params.sessionId, updates);
            if (!gameState) {
                res.status(404).json({ error: "Game state not found" });
                return;
            }
            res.json(gameState);
        }
        catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    });
    app.get("/api/leaderboard", async (req, res) => {
        try {   
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const leaderboard = await storage.getLeaderboard(limit);
            res.json(leaderboard);
        }
        catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    });
    app.post("/api/leaderboard", async (req, res) => {
        try {   
            const entryData = insertLeaderboardSchema.parse(req.body);
            const entry = await storage.addToLeaderboard(entryData);
            res.json(entry);
        }
        catch (error) {
            res.status(400).json({ error: "Invalid leaderboard entry data" });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}
