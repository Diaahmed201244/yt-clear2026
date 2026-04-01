"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebSocket = useWebSocket;
const react_1 = require("react");
function useWebSocket(onMessage) {
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [lastMessage, setLastMessage] = (0, react_1.useState)(null);
    const ws = (0, react_1.useRef)(null);
    const reconnectAttempts = (0, react_1.useRef)(0);
    const maxReconnectAttempts = 3;
    const reconnectDelay = (0, react_1.useRef)(2000);
    const onMessageRef = (0, react_1.useRef)(onMessage);
    // Update ref when onMessage changes
    (0, react_1.useEffect)(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);
    const connect = (0, react_1.useCallback)(() => {
        var _a, _b;
        // Don't create multiple connections
        if (((_a = ws.current) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.CONNECTING || ((_b = ws.current) === null || _b === void 0 ? void 0 : _b.readyState) === WebSocket.OPEN) {
            return;
        }
        try {   
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            let wsHost = window.location.host;
            if (import.meta.env.DEV) {
                wsHost = "localhost:3001";
            }
            const wsUrl = `${protocol}//${wsHost}/ws`;
            ws.current = new WebSocket(wsUrl);
            ws.current.onopen = () => {
                console.log("WebSocket connected");
                setIsConnected(true);
                reconnectAttempts.current = 0;
                reconnectDelay.current = 2000;
            };
            ws.current.onclose = (event) => {
                console.log("WebSocket disconnected", event.code, event.reason);
                setIsConnected(false);
                // Only attempt to reconnect for unexpected closures
                if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
                    setTimeout(() => {
                        reconnectAttempts.current++;
                        reconnectDelay.current = Math.min(reconnectDelay.current * 1.5, 8000);
                        connect();
                    }, reconnectDelay.current);
                }
            };
            ws.current.onerror = (error) => {
                console.error("WebSocket error:", error);
                setIsConnected(false);
            };
            ws.current.onmessage = (event) => {
                var _a;
                try {   
                    const message = JSON.parse(event.data);
                    setLastMessage(message);
                    (_a = onMessageRef.current) === null || _a === void 0 ? void 0 : _a.call(onMessageRef, message);
                }
                catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };
        }
        catch (error) {
            console.error("Failed to create WebSocket connection:", error);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        connect();
        return () => {
            if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
                ws.current.close(1000, "Component unmounting");
            }
        };
    }, [connect]);
    const send = (0, react_1.useCallback)((message) => {
        var _a;
        if (((_a = ws.current) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
            try {   
                ws.current.send(JSON.stringify(message));
            }
            catch (error) {
                console.error("Error sending WebSocket message:", error);
            }
        }
        else {
            console.warn("WebSocket is not connected. Message not sent:", message);
        }
    }, []);
    return {
        isConnected,
        send,
        lastMessage,
    };
}
