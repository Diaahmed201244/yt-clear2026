import { useEffect, useRef, useState, useCallback } from "react";
export function useWebSocket(onMessage) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const ws = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 3;
    const reconnectDelay = useRef(2000);
    const onMessageRef = useRef(onMessage);
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);
    const connect = useCallback(() => {
        if (ws.current?.readyState === WebSocket.CONNECTING || ws.current?.readyState === WebSocket.OPEN) {
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
                try {   
                    const message = JSON.parse(event.data);
                    setLastMessage(message);
                    onMessageRef.current?.(message);
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
    useEffect(() => {
        connect();
        return () => {
            if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
                ws.current.close(1000, "Component unmounting");
            }
        };
    }, [connect]);
    const send = useCallback((message) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
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
