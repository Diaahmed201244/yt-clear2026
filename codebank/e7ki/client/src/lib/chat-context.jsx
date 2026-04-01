"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatProvider = ChatProvider;
exports.useChat = useChat;
const react_1 = require("react");
const websocket_context_1 = require("./websocket-context");
const auth_context_1 = require("./auth-context");
const indexeddb_1 = require("./indexeddb");
const ChatContext = (0, react_1.createContext)(undefined);
function ChatProvider({ children, currentUser }) {
    const [chats, setChats] = (0, react_1.useState)([]);
    const [activeChat, setActiveChatState] = (0, react_1.useState)(null);
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const { sendMessage: wsSend, lastMessage, typingUsers, isConnected } = (0, websocket_context_1.useWebSocket)();
    const { getAuthHeaders } = (0, auth_context_1.useAuth)();
    (0, react_1.useEffect)(() => {
        const init = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('/api/e7ki/chats', {
                    headers: getAuthHeaders(),
                });
                if (response.ok) {
                    const chatsData = yield response.json();
                    setChats(chatsData.map(chat => ({
                        id: chat.id,
                        name: chat.title || 'Untitled Chat',
                        isGroup: chat.is_group,
                        participants: [], // TODO: fetch participants
                        unreadCount: 0,
                        createdAt: new Date(chat.created_at).getTime(),
                        updatedAt: new Date(chat.created_at).getTime(),
                        lastMessage: null,
                    })));
                }
            } catch (error) {
                console.error('Failed to fetch chats:', error);
            }
            setIsLoading(false);
        });
        init();
    }, [getAuthHeaders]);
    (0, react_1.useEffect)(() => {
        if (activeChat) {
            const loadMessages = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield fetch(`/api/e7ki/messages?chat_id=${activeChat.id}`, {
                        headers: getAuthHeaders(),
                    });
                    if (response.ok) {
                        const messagesData = yield response.json();
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./websocket-context";
import { useAuth } from "./auth-context";
import { saveMessage, getMessages } from "./indexeddb";

const ChatContext = createContext(undefined);

export function ChatProvider({ children, currentUser }) {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChatState] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { emit: wsSend, lastMessage, typingUsers, isConnected, joinChat, sendTyping } = useWebSocket();
    const { getAuthHeaders } = useAuth();

    const setTyping = useCallback((isTyping) => {
        if (activeChat) {
            sendTyping(activeChat.id, isTyping);
        }
    }, [activeChat, sendTyping]);

    const init = useCallback(async () => {
        try {
            const response = await fetch('/api/e7ki/chats', {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const chatsData = await response.json();
                setChats(chatsData.map(chat => ({
                    id: chat.id,
                    name: chat.title || 'Untitled Chat',
                    isGroup: !!chat.is_group,
                    participants: chat.participant_ids || [],
                    unreadCount: 0,
                    createdAt: new Date(chat.created_at).getTime(),
                    updatedAt: new Date(chat.updated_at || chat.created_at).getTime(),
                    lastMessage: null,
                })));
            }
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
        setIsLoading(false);
    }, [getAuthHeaders]);

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        if (activeChat) {
            joinChat(activeChat.id);
            const loadMessages = async () => {
                try {
                    const response = await fetch(`/api/e7ki/chats/${activeChat.id}/messages`, {
                        headers: getAuthHeaders(),
                    });
                    if (response.ok) {
                        const messagesData = await response.json();
                        setMessages(messagesData.map(msg => ({
                            id: msg.id,
                            chatId: msg.chat_id,
                            senderId: msg.sender_id,
                            senderName: msg.sender_username || 'Unknown',
                            type: msg.type,
                            content: msg.content,
                            reactions: [], // TODO: fetch reactions
                            status: 'read',
                            reactions: [],
                            status: msg.status || 'read',
                            timestamp: new Date(msg.created_at).getTime(),
                        })));
                    }
                } catch (error) {
                    console.error('Failed to fetch messages:', error);
                }
            });
            loadMessages();
            // Polling every 2 seconds
            const interval = setInterval(loadMessages, 2000);
            return () => clearInterval(interval);
        }
        else {
            setMessages([]);
        }
    }, [activeChat === null || activeChat === void 0 ? void 0 : activeChat.id, getAuthHeaders]);
    (0, react_1.useEffect)(() => {
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === "message") {
            const newMessage = lastMessage.payload;
            (0, indexeddb_1.saveMessage)(newMessage);
            if (activeChat && newMessage.chatId === activeChat.id) {
                (0, indexeddb_1.getMessages)(activeChat.id).then(setMessages);
            }
            setChats((prev) => {
                const updated = prev.map((chat) => {
                    if (chat.id === newMessage.chatId) {
                        return Object.assign(Object.assign({}, chat), { lastMessage: newMessage, updatedAt: newMessage.timestamp, unreadCount: (activeChat === null || activeChat === void 0 ? void 0 : activeChat.id) === chat.id
                                ? chat.unreadCount
                                : chat.unreadCount + 1 });
                    }
                    return chat;
                });
                return updated.sort((a, b) => b.updatedAt - a.updatedAt);
            });
        }
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === "read") {
            const { messageId, chatId } = lastMessage.payload;
            (0, indexeddb_1.updateMessageStatus)(messageId, "read");
            if ((activeChat === null || activeChat === void 0 ? void 0 : activeChat.id) === chatId) {
                (0, indexeddb_1.getMessages)(chatId).then(setMessages);
            }
        }
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === "reaction") {
            const { messageId, userId, emoji } = lastMessage.payload;
            const apply = () => __awaiter(this, void 0, void 0, function* () {
                const loaded = yield (0, indexeddb_1.getMessages)(activeChat === null || activeChat === void 0 ? void 0 : activeChat.id);
                const updated = loaded.map((m) => {
                    if (m.id === messageId) {
                        const idx = m.reactions.findIndex((r) => r.userId === userId);
                        const next = [...m.reactions];
                        if (idx >= 0) {
                            if (next[idx].emoji === emoji) {
                                next.splice(idx, 1);
                            }
                            else {
                                next[idx] = { userId, emoji };
                            }
                        }
                        else {
                            next.push({ userId, emoji });
                        }
                        (0, indexeddb_1.updateMessageReactions)(messageId, next);
                        return Object.assign(Object.assign({}, m), { reactions: next });
                    }
                    return m;
                });
                setMessages(updated);
            });
            apply();
        }
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === "delete") {
            const { messageId, chatId } = lastMessage.payload;
            (0, indexeddb_1.deleteMessage)(messageId);
            if ((activeChat === null || activeChat === void 0 ? void 0 : activeChat.id) === chatId) {
                (0, indexeddb_1.getMessages)(chatId).then(setMessages);
            }
        }
    }, [lastMessage, activeChat === null || activeChat === void 0 ? void 0 : activeChat.id]);
    const setActiveChat = (0, react_1.useCallback)((chat) => {
        setActiveChatState(chat);
        if (chat) {
            setChats((prev) => prev.map((c) => (c.id === chat.id ? Object.assign(Object.assign({}, c), { unreadCount: 0 }) : c)));
        }
    }, []);
    const sendTextMessage = (0, react_1.useCallback)((content, replyTo) => __awaiter(this, void 0, void 0, function* () {
        if (!activeChat)
            return;
        try {
            const response = yield fetch('/api/e7ki/messages', {
                method: 'POST',
                headers: Object.assign(Object.assign({}, getAuthHeaders()), { 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    chat_id: activeChat.id,
                    content,
                    type: 'text',
                }),
            });
            if (response.ok) {
                // Refetch messages
                const messagesResponse = yield fetch(`/api/e7ki/messages?chat_id=${activeChat.id}`, {
                    headers: getAuthHeaders(),
                });
                if (messagesResponse.ok) {
                    const messagesData = yield messagesResponse.json();
                    setMessages(messagesData.map(msg => ({
                        id: msg.id,
                        chatId: msg.chat_id,
                        senderId: msg.sender_id,
                        senderName: msg.sender_username || 'Unknown',
                        type: msg.type,
                        content: msg.content,
                        reactions: [],
                        status: 'read',
                        timestamp: new Date(msg.created_at).getTime(),
                    })));
                }
            };
            loadMessages();
        } else {
            setMessages([]);
        }
    }, [activeChat?.id, getAuthHeaders]);

    useEffect(() => {
        if (lastMessage) {
            console.log('[E7ki] Received WebSocket message:', lastMessage);
            if (lastMessage.type === "new-message") {
                const newMessage = {
                    id: lastMessage.payload.id,
                    chatId: lastMessage.payload.chat_id,
                    senderId: lastMessage.payload.sender_id,
                    senderName: lastMessage.payload.sender_username || 'Unknown',
                    type: lastMessage.payload.type,
                    content: lastMessage.payload.content,
                    reactions: [],
                    status: lastMessage.payload.status || 'sent',
                    timestamp: new Date(lastMessage.payload.created_at).getTime(),
                };
                
                saveMessage(newMessage);
                
                if (activeChat && newMessage.chatId === activeChat.id) {
                    setMessages(prev => [...prev, newMessage]);
                }
                
                setChats((prev) => {
                    const exists = prev.find(c => c.id === newMessage.chatId);
                    if (!exists) {
                        // New chat notification, might need to fetch chat details
                        // For now, reload chats to be safe
                        init();
                        return prev;
                    }
                    const updated = prev.map((chat) => {
                        if (chat.id === newMessage.chatId) {
                            return {
                                ...chat,
                                lastMessage: newMessage,
                                updatedAt: newMessage.timestamp,
                                unreadCount: activeChat?.id === chat.id ? chat.unreadCount : chat.unreadCount + 1
                            };
                        }
                        return chat;
                    });
                    // Sort by updatedAt
                    return [...updated].sort((a, b) => b.updatedAt - a.updatedAt);
                });
            }
        }
    }, [lastMessage, activeChat?.id]);

    const setActiveChat = (chat) => {
        setActiveChatState(chat);
        if (chat) {
            setChats(prev => prev.map(c => 
                c.id === chat.id ? { ...c, unreadCount: 0 } : c
            ));
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await fetch(`/api/e7ki/messages/${messageId}/read`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
        } catch (error) {
            console.error('Failed to mark message as read:', error);
        }
    };

    const sendMessage = async (chatId, content, type = 'text', options = {}) => {
        const messageData = {
            chatId,
            content,
            type,
            ...options,
            timestamp: Date.now(),
        };

        try {
            const response = await fetch('/api/e7ki/messages', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });

            if (response.ok) {
                const sentMessage = await response.json();
                const formattedMsg = {
                    id: sentMessage.id,
                    chatId: sentMessage.chat_id,
                    senderId: sentMessage.sender_id,
                    senderName: sentMessage.sender_username || 'Me',
                    type: sentMessage.type,
                    content: sentMessage.content,
                    reactions: [],
                    status: sentMessage.status,
                    timestamp: new Date(sentMessage.created_at).getTime(),
                };
                setMessages(prev => [...prev, formattedMsg]);
                return formattedMsg;
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }), [activeChat, getAuthHeaders]);
    const sendFileMessage = (0, react_1.useCallback)((file, type) => __awaiter(this, void 0, void 0, function* () {
        if (!activeChat)
            return;
        try {
            const form = new FormData();
            form.append('file', file);
            form.append('chat_id', activeChat.id);
            const response = yield fetch('/api/e7ki/upload', {
                method: 'POST',
                headers: Object.assign({}, getAuthHeaders()),
                body: form,
            });
            if (response.ok) {
                const data = yield response.json();
                const messagesResponse = yield fetch(`/api/e7ki/messages?chat_id=${activeChat.id}`, {
                    headers: getAuthHeaders(),
                });
                if (messagesResponse.ok) {
                    const messagesData = yield messagesResponse.json();
                    setMessages(messagesData.map(msg => ({
                        id: msg.id,
                        chatId: msg.chat_id,
                        senderId: msg.sender_id,
                        senderName: msg.sender_username || 'Unknown',
                        type: msg.type,
                        content: msg.content,
                        reactions: [],
                        status: 'read',
                        timestamp: new Date(msg.created_at).getTime(),
                    })));
                }
            }
        }
        catch (error) {
            console.error('Failed to upload file:', error);
        }
    }), [activeChat, getAuthHeaders]);
    const addReaction = (0, react_1.useCallback)((messageId, emoji) => __awaiter(this, void 0, void 0, function* () {
        if (isConnected) {
            wsSend({ type: "reaction", payload: { messageId, userId: currentUser.id, emoji } });
        } else {
            try {
                yield fetch(`/api/e7ki/messages/${messageId}/reactions`, {
                    method: 'POST',
                    headers: Object.assign(Object.assign({}, getAuthHeaders()), { 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ emoji }),
                });
            } catch (error) {
                console.error('Failed to add reaction:', error);
            }
        }
    }), [currentUser.id, wsSend, isConnected, getAuthHeaders]);
    const markAsRead = (0, react_1.useCallback)((messageId) => __awaiter(this, void 0, void 0, function* () {
        if (!activeChat)
            return;
        if (isConnected) {
            wsSend({ type: "read", payload: { chatId: activeChat.id, messageId, userId: currentUser.id } });
        } else {
            try {
                yield fetch(`/api/e7ki/messages/${messageId}/read`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                });
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }
    }), [activeChat, currentUser.id, wsSend, isConnected, getAuthHeaders]);
    const deleteMessageById = (0, react_1.useCallback)((messageId) => {
        if (!activeChat)
            return;
        wsSend({
            type: "delete",
            payload: {
                messageId,
                chatId: activeChat.id,
            },
        });
        (0, indexeddb_1.deleteMessage)(messageId);
        (0, indexeddb_1.getMessages)(activeChat.id).then(setMessages);
    }, [activeChat, wsSend]);
    const createNewChat = (0, react_1.useCallback)((participant) => {
        const existingChat = chats.find((c) => !c.isGroup &&
            c.participants.some((p) => p.id === participant.id));
        if (existingChat) {
            setActiveChat(existingChat);
            return existingChat;
        }
        const newChat = {
            id: crypto.randomUUID(),
            name: participant.name,
            isGroup: false,
            participants: [
                {
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    avatar: currentUser.avatar,
                    isOnline: true,
                },
                {
                    id: participant.id,
                    name: participant.name,
                    email: participant.email,
                    avatar: participant.avatar,
                    isOnline: participant.isOnline,
                },
            ],
            unreadCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        (0, indexeddb_1.saveChat)(newChat);
        setChats((prev) => [newChat, ...prev]);
        setActiveChat(newChat);
        return newChat;
    }, [chats, currentUser, setActiveChat]);
    const setTyping = (0, react_1.useCallback)((isTyping) => __awaiter(this, void 0, void 0, function* () {
        if (!activeChat)
            return;
        if (isConnected) {
            wsSend({ type: "typing", payload: { chatId: activeChat.id, userId: currentUser.id, userName: currentUser.name, isTyping } });
        }
        try {
            yield fetch('/api/e7ki/typing', {
                method: 'POST',
                headers: Object.assign(Object.assign({}, getAuthHeaders()), { 'Content-Type': 'application/json' }),
                body: JSON.stringify({ chat_id: activeChat.id, is_typing: Boolean(isTyping) })
            });
        } catch (error) {
            console.error('Failed to update typing:', error);
        }
    }), [activeChat, currentUser, wsSend, isConnected, getAuthHeaders]);
    const typingUsersInActiveChat = activeChat
        ? Array.from(typingUsers.values()).filter((t) => t.chatId === activeChat.id && t.userId !== currentUser.id)
        : [];
    return (<ChatContext.Provider value={{
            currentUser,
            chats,
            activeChat,
            messages,
            setActiveChat,
            sendTextMessage,
            sendFileMessage,
            addReaction,
            markAsRead,
            deleteMessageById,
            createNewChat,
            setTyping,
            typingUsersInActiveChat,
            isLoading,
        }}>
      {children}
    </ChatContext.Provider>);
}
function useChat() {
    const context = (0, react_1.useContext)(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    };

    const createNewChat = async (participant) => {
        try {
            const response = await fetch('/api/e7ki/chats', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participantIds: [participant.id],
                    title: participant.name
                }),
            });

            if (response.ok) {
                const newChat = await response.json();
                const formattedChat = {
                    id: newChat.id,
                    name: newChat.title || participant.name,
                    isGroup: false,
                    participants: [participant],
                    unreadCount: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    lastMessage: null,
                };
                setChats(prev => [formattedChat, ...prev]);
                setActiveChat(formattedChat);
                return formattedChat;
            }
        } catch (error) {
            console.error('Failed to create new chat:', error);
        }
    };

    return (
        <ChatContext.Provider value={{
            chats,
            activeChat,
            messages,
            isLoading,
            isConnected,
            typingUsers,
            setActiveChat,
            sendMessage,
            createNewChat,
            setTyping,
            markAsRead,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
