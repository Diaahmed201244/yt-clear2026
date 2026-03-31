// import { setupAuth, isAuthenticated } from "./replitAuth";
// Dummy auth for local development
const isAuthenticated = (req, res, next) => next();
import * as sharedSchema from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ BULLETPROOF UPLOAD CONFIG (FIX 1)
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
// ✅ ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname);
            const name = Date.now() + "-" + Math.random().toString(36).slice(2);
            cb(null, name + ext);
        },
    }),
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("video/")) {
            cb(new Error("Invalid video type"));
        }
        else {
            cb(null, true);
        }
    },
    limits: {
        fileSize: MAX_VIDEO_SIZE
    }
});
export async function registerRoutes(httpServer, app) {
    // await setupAuth(app); // Disabled for local development
    // Serve uploaded files statically
    app.use("/uploads", (await import("express")).default.static(UPLOAD_DIR));
    app.get("/api/auth/user", async (req, res) => {
        // Guest mode - return null
        res.json(null);
    });
    app.post("/api/logout", async (req, res) => {
        // Guest mode - logout is no-op
        res.json({ message: "Logged out successfully" });
    });
    app.get("/api/videos", async (req, res) => {
        try {
            const { category, search, status } = req.query;
            const videos = await storage.getVideos({
                category: category,
                search: search,
                status: status || "approved",
            });
            res.json(videos);
        }
        catch (error) {
            console.error("Error fetching videos:", error);
            res.status(500).json({ message: "Failed to fetch videos" });
        }
    });

    // Recommendation API endpoints
    app.get("/api/recommendations/trending", async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const trending = await recommendationService.getTrendingVideos(limit);
            res.json(trending);
        } catch (error) {
            console.error("Error getting trending videos:", error);
            res.status(500).json({ message: "Failed to get trending videos" });
        }
    });

    app.get("/api/recommendations/for-you", isAuthenticated, async (req, res) => {
        try {
            const userId = req.user?.claims?.sub || "guest_user";
            const limit = parseInt(req.query.limit) || 20;
            const forYou = await recommendationService.getForYouFeed(userId, limit);
            res.json(forYou);
        } catch (error) {
            console.error("Error getting for you feed:", error);
            res.status(500).json({ message: "Failed to get for you feed" });
        }
    });

    app.get("/api/recommendations/related/:videoId", async (req, res) => {
        try {
            const videoId = parseInt(req.params.videoId);
            const limit = parseInt(req.query.limit) || 10;
            const related = await recommendationService.getRelatedVideos(videoId, limit);
            res.json(related);
        } catch (error) {
            console.error("Error getting related videos:", error);
            res.status(500).json({ message: "Failed to get related videos" });
        }
    });

    app.get("/api/recommendations/recommended", isAuthenticated, async (req, res) => {
        try {
            const userId = req.user?.claims?.sub || "guest_user";
            const limit = parseInt(req.query.limit) || 20;
            const recommended = await recommendationService.getRecommendedVideos(userId, limit);
            res.json(recommended);
        } catch (error) {
            console.error("Error getting recommended videos:", error);
            res.status(500).json({ message: "Failed to get recommended videos" });
        }
    });
    // Test route to verify API is working
    app.get("/api/test", async (req, res) => {
        console.log("🔥 TEST ROUTE HIT");
        res.json({ message: "API is working", timestamp: new Date().toISOString() });
    });
    // ✅ STEP 2 — Old Farragna Video Fetch (guest) - AVOID /:id conflict
    app.get("/api/videos/list", (req, res) => {
        const dir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(dir)) {
            return res.json([]);
        }
        const files = fs.readdirSync(dir)
            .filter(f => /\.(mp4|webm|ogg)$/i.test(f))
            .map(f => ({
            owner: "guest_user",
            file: f,
            url: `/uploads/${f}`,
            created_at: fs.statSync(path.join(dir, f)).mtime,
        }))
            .sort((a, b) => Number(b.created_at) - Number(a.created_at));
        res.json(files);
    });
    app.get("/api/videos/pending", isAuthenticated, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const videos = await storage.getVideos({ status: "review_required" });
            res.json(videos);
        }
        catch (error) {
            console.error("Error fetching pending videos:", error);
            res.status(500).json({ message: "Failed to fetch pending videos" });
        }
    });
    app.get("/api/videos/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const video = await storage.getVideoById(id);
            if (!video) {
                return res.status(404).json({ message: "Video not found" });
            }
            res.json(video);
        }
        catch (error) {
            console.error("Error fetching video:", error);
            res.status(500).json({ message: "Failed to fetch video" });
        }
    });
    app.post("/api/videos", async (req, res) => {
        try {
        }
    });
    // ✅ CLOUDFLARE STREAM UPLOAD - Modern video platform integration
    app.post("/api/videos/cloudflare-upload", isAuthenticated, async (req, res) => {
        try {
            // Get authenticated user or use guest
            const userId = req.user?.claims?.sub || "guest_user";

            // Create Cloudflare direct upload URL
            const { uploadUrl, videoId, playbackUrl } = await cloudflareStream.createDirectUploadUrl();

            // Store initial video record with processing status
            const videoData = {
                userId: userId,
                videoUrl: playbackUrl,
                cloudflareId: videoId,
                status: VIDEO_STATUSES.UPLOADING,
                moderationStatus: MOD_STATUSES.PENDING,
                caption: req.body.caption || "Untitled video",
                category: req.body.category || "entertainment",
                thumbnailUrl: req.body.thumbnailUrl,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const video = await storage.createVideo(videoData);

            res.status(200).json({
                success: true,
                uploadUrl: uploadUrl,
                videoId: video.id,
                cloudflareId: videoId,
                playbackUrl: playbackUrl,
                message: "Cloudflare upload URL generated successfully"
            });
        } catch (error) {
            console.error("Cloudflare upload error:", error);
            res.status(500).json({
                error: error.message,
                message: "Failed to create Cloudflare upload"
            });
        }
    });

    // Cloudflare webhook for video status updates
    app.post("/api/videos/cloudflare-webhook", async (req, res) => {
        try {
            // Verify webhook signature
            const signature = req.headers['cf-stream-signature'];
            const body = req.rawBody.toString();

            // TODO: Implement proper signature verification
            // For now, we'll proceed without verification for development

            const event = req.body;

            if (event.type === 'video.ready') {
                // Video is ready for playback
                const video = await storage.getVideoByCloudflareId(event.uid);
                if (video) {
                    await storage.updateVideo(video.id, {
                        status: VIDEO_STATUSES.READY,
                        moderationStatus: MOD_STATUSES.PENDING,
                        updatedAt: new Date()
                    });
                }
            } else if (event.type === 'video.failed') {
                // Video processing failed
                const video = await storage.getVideoByCloudflareId(event.uid);
                if (video) {
                    await storage.updateVideo(video.id, {
                        status: VIDEO_STATUSES.FAILED,
                        updatedAt: new Date()
                    });
                }
            }

            res.status(200).json({ success: true });
        } catch (error) {
            console.error("Cloudflare webhook error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // ✅ FIX 3 — Pure filesystem listing alias
    app.get("/api/videos/list", (_req, res) => {
        const dir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(dir)) {
            return res.json([]);
        }
        const files = fs
            .readdirSync(dir)
            .filter((f) => /\.(mp4|webm|mov|avi)$/i.test(f))
            .map((f) => ({
            owner: "guest_user",
            file: f,
            url: `/uploads/${f}`,
            createdAt: fs.statSync(path.join(dir, f)).mtime,
        }))
            .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
        res.json(files);
    });
    app.patch("/api/videos/:id/moderate", isAuthenticated, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const id = parseInt(req.params.id);
            const { status } = req.body;
            if (!Object.values(MOD_STATUSES).includes(status)) {
                return res.status(400).json({ message: "Invalid moderation status" });
            }
            const video = await storage.updateVideo(id, { moderationStatus: status });
            if (!video) {
                return res.status(404).json({ message: "Video not found" });
            }
            res.json(video);
        }
        catch (error) {
            console.error("Error moderating video:", error);
            res.status(500).json({ message: "Failed to moderate video" });
        }
    });
    app.delete("/api/videos/:id", isAuthenticated, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const id = parseInt(req.params.id);
            const userId = req.user.claims.sub;
            const video = await storage.getVideoById(id);
            if (!video) {
                return res.status(404).json({ message: "Video not found" });
            }
            if (video.userId !== userId) {
                return res.status(403).json({ message: "Not authorized to delete this video" });
            }
            await storage.deleteVideo(id);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting video:", error);
            res.status(500).json({ message: "Failed to delete video" });
        }
    });
    app.post("/api/videos/:id/view", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await storage.incrementVideoViews(id);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error incrementing views:", error);
            res.status(500).json({ message: "Failed to increment views" });
        }
    });
    app.get("/api/videos/:id/engagement", isAuthenticated, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const videoId = parseInt(req.params.id);
            const userId = req.user.claims.sub;
            const engagement = await storage.getEngagement(userId, videoId);
            res.json(engagement || null);
        }
        catch (error) {
            console.error("Error fetching engagement:", error);
            res.status(500).json({ message: "Failed to fetch engagement" });
        }
    });
    app.post("/api/videos/:id/engagement", isAuthenticated, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const videoId = parseInt(req.params.id);
            const userId = req.user.claims.sub;
            const { type } = req.body;
            if (!["like", "superLike", "megaLike"].includes(type)) {
                return res.status(400).json({ message: "Invalid engagement type" });
            }
            const existingEngagement = await storage.getEngagement(userId, videoId);
            if (existingEngagement) {
                await storage.updateEngagementCounts(videoId, existingEngagement.type, -1);
                await storage.deleteEngagement(userId, videoId);
            }
            const engagement = await storage.createEngagement({ userId, videoId, type });
            await storage.updateEngagementCounts(videoId, type, 1);
            res.status(201).json(engagement);
        }
        catch (error) {
            console.error("Error creating engagement:", error);
            res.status(500).json({ message: "Failed to create engagement" });
        }
    });
    app.delete("/api/videos/:id/engagement", isAuthenticated, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const videoId = parseInt(req.params.id);
            const userId = req.user.claims.sub;
            const existingEngagement = await storage.getEngagement(userId, videoId);
            if (existingEngagement) {
                await storage.updateEngagementCounts(videoId, existingEngagement.type, -1);
                await storage.deleteEngagement(userId, videoId);
            }
            res.status(204).send();
        }
        catch (error) {
            console.error("Error removing engagement:", error);
            res.status(500).json({ message: "Failed to remove engagement" });
        }
    });
    app.get("/api/favorites", async (req, res) => {
        // Guest mode - return empty favorites
        res.json([]);
    });
    app.get("/api/videos/:id/favorite", isAuthenticated, async (req, res) => {
        try {
            if (!req.user) {
                return res.json({ isFavorite: false });
            }
            const videoId = parseInt(req.params.id);
            const userId = req.user.claims.sub;
            const favorite = await storage.getFavorite(userId, videoId);
            res.json({ isFavorite: !!favorite });
        }
        catch (error) {
            console.error("Error checking favorite:", error);
            res.status(500).json({ message: "Failed to check favorite" });
        }
    });
    app.post("/api/videos/:id/favorite", isAuthenticated, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const videoId = parseInt(req.params.id);
            const userId = req.user.claims.sub;
            const existingFavorite = await storage.getFavorite(userId, videoId);
            if (existingFavorite) {
                return res.status(409).json({ message: "Already favorited" });
            }
            const favorite = await storage.createFavorite({ userId, videoId });
            res.status(201).json(favorite);
        }
        catch (error) {
            console.error("Error adding favorite:", error);
            res.status(500).json({ message: "Failed to add favorite" });
        }
    });
    app.delete("/api/videos/:id/favorite", isAuthenticated, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const videoId = parseInt(req.params.id);
            const userId = req.user.claims.sub;
            await storage.deleteFavorite(userId, videoId);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error removing favorite:", error);
            res.status(500).json({ message: "Failed to remove favorite" });
        }
    });
    return httpServer;
}