"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebSocket = useWebSocket;
const react_1 = require("react");
function useWebSocket(onMessage) {
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [lastMessage, setLastMessage] = (0, react_1.useState)(null);
    const ws = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        ws.current = new WebSocket(wsUrl);
        ws.current.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
        };
        ws.current.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
        };
        ws.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            setIsConnected(false);
        };
        ws.current.onmessage = (event) => {
            try { 
                const message = JSON.parse(event.data);
                setLastMessage(message);
                onMessage === null || onMessage === void 0 ? void 0 : onMessage(message);
            }
            catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };
        return () => {
            var _a;
            (_a = ws.current) === null || _a === void 0 ? void 0 : _a.close();
        };
    }, [onMessage]);
    const send = (message) => {
        var _a;
        if (((_a = ws.current) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
    };
    return {
        isConnected,
        send,
        lastMessage,
    };
}
