import { useState, useEffect, useCallback, useRef } from 'react';
export function useWebSocket() {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef();
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;
    const connect = useCallback(() => {
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
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const timeout = Math.pow(2, reconnectAttemptsRef.current) * 1000;
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
    useEffect(() => {
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
    const sendMessage = useCallback((message) => {
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
