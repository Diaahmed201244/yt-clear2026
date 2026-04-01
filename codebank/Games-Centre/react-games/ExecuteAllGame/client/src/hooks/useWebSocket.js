import { useEffect, useRef, useState } from "react";
export function useWebSocket(onMessage) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const ws = useRef(null);
    useEffect(() => {
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
                onMessage?.(message);
            }
            catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };
        return () => {
            ws.current?.close();
        };
    }, [onMessage]);
    const send = (message) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        }
    };
    return {
        isConnected,
        send,
        lastMessage,
    };
}
