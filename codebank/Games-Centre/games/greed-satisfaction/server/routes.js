import { createServer } from "http";
import { playerService } from "./playerService";
export async function registerRoutes(app) {
    // Player endpoints for daily play limit
    // Check if player can play today
    app.get("/api/player/:playerId/can-play", async (req, res) => {
        try {
            const { playerId } = req.params;
            const canPlay = await playerService.canPlayToday(playerId);
            const timeUntilNext = await playerService.getTimeUntilNextPlay(playerId);
            res.json({
                canPlay,
                timeUntilNext,
                message: canPlay ? "Ready to play!" : "Daily limit reached"
            });
        }
        catch (error) {
            console.error("Error checking player status:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
    // Record that player has played today
    app.post("/api/player/:playerId/record-play", async (req, res) => {
        try {
            const { playerId } = req.params;
            const canPlay = await playerService.canPlayToday(playerId);
            if (!canPlay) {
                return res.status(403).json({
                    error: "Daily limit reached",
                    message: "You can only play once per day"
                });
            }
            await playerService.recordPlay(playerId);
            res.json({ success: true, message: "Play recorded successfully" });
        }
        catch (error) {
            console.error("Error recording play:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
    // Update player's total codes
    app.put("/api/player/:playerId/codes", async (req, res) => {
        try {
            const { playerId } = req.params;
            const { totalCodes } = req.body;
            if (typeof totalCodes !== 'number') {
                return res.status(400).json({ error: "Invalid totalCodes value" });
            }
            await playerService.updatePlayerCodes(playerId, totalCodes);
            res.json({ success: true, totalCodes });
        }
        catch (error) {
            console.error("Error updating player codes:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}
