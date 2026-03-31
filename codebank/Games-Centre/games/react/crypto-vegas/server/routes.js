import { createServer } from "http";
export async function registerRoutes(app) {
    const httpServer = createServer(app);
    return httpServer;
}
