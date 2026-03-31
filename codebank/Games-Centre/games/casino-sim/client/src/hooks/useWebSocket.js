"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebSocket = useWebSocket;
const react_1 = require("react");
function useWebSocket() {
    const [socket, setSocket] = (0, react_1.useState)(null);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const reconnectTimeoutRef = (0, react_1.useRef)();
    const reconnectAttemptsRef = (0, react_1.useRef)(0);
    const maxReconnectAttempts = 5;
    const connect = (0, react_1.useCallback)(() => {
        try {
            const wsUrl = 'ws://localhost:3000/ws';
            const ws = new WebSocket(wsUrl);
            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
            };
            ws.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                setSocket(null);
                // Attempt to reconnect
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const timeout = Math.pow(2, reconnectAttemptsRef.current) * 1000; // Exponential backoff
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }, timeout);
                }
            };
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            setSocket(ws);
        }
        catch (error) {
            console.error('Failed to connect to WebSocket:', error);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        connect();
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socket) {
                socket.close();
            }
        };
    }, [connect]);
    const sendMessage = (0, react_1.useCallback)((message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
        else {
            console.warn('WebSocket not connected, cannot send message:', message);
        }
    }, [socket]);
    return {
        socket,
        isConnected,
        sendMessage,
    };
}
