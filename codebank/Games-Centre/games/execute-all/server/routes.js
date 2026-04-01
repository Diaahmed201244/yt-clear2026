import { createServer } from "http";
import { storage } from "./storage";
import { gameService } from './services/gameService";;
import { WebSocketService } from './services/websocketService";;
import { insertUserSchema } from "@shared/schema";
export async function registerRoutes(app) {
    // Create HTTP server
    const httpServer = createServer(app);
    // Initialize WebSocket service
    new WebSocketService(httpServer);
    // Auth routes
    app.post("/api/auth/register", async (req, res) => {
        try {   
            const userData = insertUserSchema.parse(req.body);
            // Check if user already exists
            const existingUser = await storage.getUserByUsername(userData.username);
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }
            const user = await storage.createUser(userData);
            res.json({ user: { id: user.id, username: user.username, balance: user.balance } });
        }
        catch (error) {
            res.status(400).json({ message: "Invalid user data" });
        }
    });
    app.post("/api/auth/login", async (req, res) => {
        try {   
            const { username, password } = req.body;
            const user = await storage.getUserByUsername(username);
            if (!user || user.password !== password) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            res.json({ user: { id: user.id, username: user.username, balance: user.balance } });
        }
        catch (error) {
            res.status(500).json({ message: "Login failed" });
        }
    });
    // Game room routes
    app.post("/api/rooms/create", async (req, res) => {
        try {   
            const roomCode = await gameService.generateRoomCode();
            const deck = gameService.createDeck();
            const roomData = {
                roomCode,
                dealerName: req.body.dealerName || "Lady Victoria",
                maxPlayers: req.body.maxPlayers || 6,
                maxRounds: req.body.maxRounds || 5,
                deck: deck,
                gameStatus: "waiting",
                currentRound: 0,
                currentPlayerIndex: 0,
                pot: []
            };
            const room = await storage.createGameRoom(roomData);
            res.json({ room });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to create room" });
        }
    });
    app.get("/api/rooms/:code", async (req, res) => {
        try {   
            const room = await storage.getGameRoomByCode(req.params.code);
            if (!room) {
                return res.status(404).json({ message: "Room not found" });
            }
            const players = await storage.getPlayersInRoom(room.id);
            res.json({ room, players });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to get room" });
        }
    });
    // User routes
    app.get("/api/user/:id", async (req, res) => {
        try {   
            const user = await storage.getUser(parseInt(req.params.id));
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ user: { id: user.id, username: user.username, balance: user.balance, wins: user.wins, totalEarnings: user.totalEarnings } });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to get user" });
        }
    });
    // Health check
    app.get("/api/health", (req, res) => {
        res.json({ status: "OK", timestamp: new Date().toISOString() });
    });
    return httpServer;
}
