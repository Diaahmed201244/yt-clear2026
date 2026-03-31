<<<<<<< HEAD
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
const IS_EMBEDDED = import.meta.env.VITE_EMBEDDED === 'true';

export const WebSocketContext = createContext(undefined);

export function WebSocketProvider({ children, userId }) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [typingUsers, setTypingUsers] = useState(new Map());
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const typingTimersRef = useRef(new Map());
    const presenceLastSeenRef = useRef(new Map());
    const connect = useCallback(() => {
        if (IS_EMBEDDED) return;
        var _a;
        if (((_a = wsRef.current) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN)
            return;
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

        const wsUrl =
        import.meta.env.DEV
          ? `${protocol}//localhost:3001/ws`
          : `${protocol}//${window.location.host}/ws`;

        const socket = new WebSocket(wsUrl);

        wsRef.current = socket;
        socket.onopen = () => {
            setIsConnected(true);
            reconnectAttempts.current = 0;
            socket.send(JSON.stringify({
                type: "init",
                payload: { userId }
            }));
            socket.send(JSON.stringify({ type: "presence", payload: { status: "online", userId } }));
            const heartbeat = setInterval(() => {
                try {
                    socket.send(JSON.stringify({ type: "presence", payload: { status: "online", userId } }));
                }
                catch (_a) { }
            }, 15000);
            socket.onclose = () => {
                clearInterval(heartbeat);
                setIsConnected(false);
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                reconnectAttempts.current++;
                reconnectTimeoutRef.current = setTimeout(connect, delay);
            };
        };
        socket.onerror = () => {
            socket.close();
        };
        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                setLastMessage(message);
                if (message.type === "typing") {
                    const typing = message.payload;
                    setTypingUsers((prev) => {
                        const next = new Map(prev);
                        const key = `${typing.chatId}-${typing.userId}`;
                        if (typing.isTyping) {
                            next.set(key, typing);
                            const prevTimer = typingTimersRef.current.get(key);
                            if (prevTimer)
                                clearTimeout(prevTimer);
                            const t = setTimeout(() => {
                                setTypingUsers((p) => {
                                    const m = new Map(p);
                                    m.delete(key);
                                    return m;
                                });
                                typingTimersRef.current.delete(key);
                            }, 4000);
                            typingTimersRef.current.set(key, t);
                        }
                        else {
                            next.delete(key);
                        }
                        return next;
                    });
                }
                if (message.type === "presence") {
                    const presence = message.payload;
                    presenceLastSeenRef.current.set(presence.userId, Date.now());
                    setOnlineUsers((prev) => {
                        const next = new Set(prev);
                        if (presence.status === "online") {
                            next.add(presence.userId);
                        }
                        if (presence.status === "offline") {
                            next.delete(presence.userId);
                        }
                        return next;
                    });
                }
            }
            catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };
    }, [userId]);
    useEffect(() => {
        connect();
        const sweep = setInterval(() => {
            const now = Date.now();
            setOnlineUsers((prev) => {
                const next = new Set(prev);
                for (const user of next) {
                    const last = presenceLastSeenRef.current.get(user) || 0;
                    if (now - last > 30000) {
                        next.delete(user);
                    }
                }
                return next;
            });
        }, 10000);
        return () => {
            var _a;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            clearInterval(sweep);
            (_a = wsRef.current) === null || _a === void 0 ? void 0 : _a.close();
            wsRef.current = null;
        };
    }, [connect]);
    const sendMessage = useCallback((message) => {
        var _a;
        if (((_a = wsRef.current) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);
    return (<WebSocketContext.Provider value={{
            isConnected,
            sendMessage,
            lastMessage,
            typingUsers,
            onlineUsers,
        }}>
      {children}
    </WebSocketContext.Provider>);
}
export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
}
=======
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './auth-context';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const messageQueue = useRef([]);
  const { user } = useAuth();
  
  const connect = useCallback(() => {
    if (!user?.token) return;
    
    // Robust URL construction
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the native host since it is now mounted on CodeBank
    const wsUrl = `${protocol}//${window.location.host}`;
    
    console.log('[E7ki] Connecting to WebSocket at:', wsUrl);
    
    const newSocket = io(wsUrl, {
      path: '/ws',
      auth: { token: user.token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });
    
    newSocket.on('connect', () => {
      console.log('[E7ki] WebSocket connected');
      setConnected(true);
      setReconnecting(false);
      
      // Flush queued messages
      while (messageQueue.current.length > 0) {
        const msg = messageQueue.current.shift();
        newSocket.emit(msg.event, msg.data);
      }
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('[E7ki] WebSocket disconnected:', reason);
      setConnected(false);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('[E7ki] Connection error:', error);
      setReconnecting(true);
    });
    
    newSocket.on('error', (error) => {
      console.error('[E7ki] Socket error:', error);
    });

    newSocket.on('new-message', (message) => {
      setLastMessage({ type: 'new-message', payload: message });
    });

    newSocket.on('user-presence', (data) => {
      setLastMessage({ type: 'presence', payload: data });
    });

    newSocket.on('user-typing', (data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.userId]: data.isTyping ? data.username : null
      }));
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [user?.token]);
  
  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);
  
  const emit = useCallback((event, data) => {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      // Queue message for when connection returns
      messageQueue.current.push({ event, data });
      console.log('[E7ki] Message queued (offline)');
    }
  }, [socket]);
  
  const joinChat = useCallback((chatId) => {
    emit('join-chat', chatId);
  }, [emit]);
  
  const sendTyping = useCallback((chatId, isTyping) => {
    emit('typing', { chatId, isTyping });
  }, [emit]);
  
  const value = {
    socket,
    connected,
    reconnecting,
    lastMessage,
    typingUsers,
    joinChat,
    sendTyping,
    emit
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
      {!connected && user && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '10px 20px',
          background: reconnecting ? '#ffa500' : '#ff6b6b',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          fontFamily: 'system-ui'
        }}>
          {reconnecting ? '🔄 Reconnecting...' : '🔌 Offline - Messages queued'}
        </div>
      )}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
};
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
