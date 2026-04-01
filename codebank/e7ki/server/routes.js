import { WebSocketServer, WebSocket } from "ws";
import { log } from "./index.js";
import { registerFileRoutes } from "./fileUpload.js";
        ws.on("message", (data) => {
            try { 
                const message = JSON.parse(data.toString());
                switch (message.type) {
                    case "init":
                        clientId = message.payload.userId;
                        clients.set(clientId, { ws, userId: clientId, lastSeen: Date.now(), status: "online" });
                        log(`Client ${clientId} connected`, "ws");
                        broadcast({
                            type: "presence",
                            payload: { userId: clientId, status: "online" },
                        }, clientId);
                        break;
                    case "message":
                        log(`Message from ${message.payload.senderId}`, "ws");
                        const sentMessage = {
                            ...message.payload,
                            status: "sent",
                        };
                        broadcast({
                            type: "message",
                            payload: sentMessage,
                        });
                        break;
                    case "typing":
                        broadcast({
                            type: "typing",
                            payload: message.payload,
                        }, message.payload.userId);
                        break;
                    case "read":
                        broadcast({
                            type: "read",
                            payload: message.payload,
                        }, message.payload.userId);
                        break;
                    case "reaction":
                        broadcast({
                            type: "reaction",
                            payload: message.payload,
                        });
                        break;
                    case "presence":
                        {
                            const { status } = message.payload;
                            if (clientId && clients.has(clientId)) {
                                const c = clients.get(clientId);
                                c.lastSeen = Date.now();
                                c.status = status || "online";
                                broadcast({ type: "presence", payload: { userId: clientId, status: c.status } }, clientId);
                            }
                        }
                        break;
                    case "delete":
                        broadcast({
                            type: "delete",
                            payload: message.payload,
                        });
                        break;
                }
            }
            catch (error) {
                log(`Error parsing message: ${error}`, "ws");
            }
        });
        ws.on("close", () => {
            if (clientId) {
                clients.delete(clientId);
                log(`Client ${clientId} disconnected`, "ws");
                broadcast({ type: "presence", payload: { userId: clientId, status: "offline" } }, clientId);
            }
        });
        ws.on("error", (error) => {
            log(`WebSocket error: ${error}`, "ws");
        });
    });
    setInterval(() => {
        const now = Date.now();
        clients.forEach((client, id) => {
            if (client.userId && now - (client.lastSeen || 0) > PRESENCE_TIMEOUT) {
                client.status = "offline";
                broadcast({ type: "presence", payload: { userId: id, status: "offline" } }, id);
            }
        });
    }, 10000);
    function broadcast(message, excludeUserId) {
        const messageStr = JSON.stringify(message);
        clients.forEach((client, id) => {
            if (id !== excludeUserId && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(messageStr);
            }
        });
    }
    return httpServer;
}
