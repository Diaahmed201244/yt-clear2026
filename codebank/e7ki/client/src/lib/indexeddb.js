<<<<<<< HEAD
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
exports.initDB = initDB;
exports.saveMessage = saveMessage;
exports.getMessages = getMessages;
exports.deleteMessage = deleteMessage;
exports.saveChat = saveChat;
exports.getChats = getChats;
exports.getChat = getChat;
exports.deleteChat = deleteChat;
exports.saveFileBlob = saveFileBlob;
exports.getFileBlob = getFileBlob;
exports.cleanupExpiredMessages = cleanupExpiredMessages;
exports.startCleanupInterval = startCleanupInterval;
exports.updateMessageStatus = updateMessageStatus;
exports.updateMessageReactions = updateMessageReactions;
=======
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
const DB_NAME = "e7ki_db";
const DB_VERSION = 1;
const MESSAGES_STORE = "messages";
const CHATS_STORE = "chats";
const FILES_STORE = "files";
<<<<<<< HEAD
let db = null;
function initDB() {
    return __awaiter(this, void 0, void 0, function* () {
        if (db)
            return db;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };
            request.onupgradeneeded = (event) => {
                const database = event.target.result;
                if (!database.objectStoreNames.contains(MESSAGES_STORE)) {
                    const messagesStore = database.createObjectStore(MESSAGES_STORE, { keyPath: "id" });
                    messagesStore.createIndex("chatId", "chatId", { unique: false });
                    messagesStore.createIndex("timestamp", "timestamp", { unique: false });
                    messagesStore.createIndex("expiresAt", "expiresAt", { unique: false });
                }
                if (!database.objectStoreNames.contains(CHATS_STORE)) {
                    const chatsStore = database.createObjectStore(CHATS_STORE, { keyPath: "id" });
                    chatsStore.createIndex("updatedAt", "updatedAt", { unique: false });
                }
                if (!database.objectStoreNames.contains(FILES_STORE)) {
                    const filesStore = database.createObjectStore(FILES_STORE, { keyPath: "messageId" });
                    filesStore.createIndex("expiresAt", "expiresAt", { unique: false });
                }
            };
        });
    });
}
function saveMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([MESSAGES_STORE], "readwrite");
            const store = transaction.objectStore(MESSAGES_STORE);
            const request = store.put(message);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    });
}
function getMessages(chatId_1) {
    return __awaiter(this, arguments, void 0, function* (chatId, limit = 50) {
        const database = yield initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([MESSAGES_STORE], "readonly");
            const store = transaction.objectStore(MESSAGES_STORE);
            const index = store.index("chatId");
            const request = index.getAll(IDBKeyRange.only(chatId));
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const messages = request.result;
                messages.sort((a, b) => a.timestamp - b.timestamp);
                resolve(messages.slice(-limit));
            };
        });
    });
}
function deleteMessage(messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([MESSAGES_STORE], "readwrite");
            const store = transaction.objectStore(MESSAGES_STORE);
            const request = store.delete(messageId);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    });
}
function saveChat(chat) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([CHATS_STORE], "readwrite");
            const store = transaction.objectStore(CHATS_STORE);
            const request = store.put(chat);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    });
}
function getChats() {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([CHATS_STORE], "readonly");
            const store = transaction.objectStore(CHATS_STORE);
            const request = store.getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const chats = request.result;
                chats.sort((a, b) => b.updatedAt - a.updatedAt);
                resolve(chats);
            };
        });
    });
}
function getChat(chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([CHATS_STORE], "readonly");
            const store = transaction.objectStore(CHATS_STORE);
            const request = store.get(chatId);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    });
}
function deleteChat(chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([CHATS_STORE, MESSAGES_STORE], "readwrite");
            const chatsStore = transaction.objectStore(CHATS_STORE);
            chatsStore.delete(chatId);
            const messagesStore = transaction.objectStore(MESSAGES_STORE);
            const index = messagesStore.index("chatId");
            const request = index.openCursor(IDBKeyRange.only(chatId));
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    });
}
function saveFileBlob(messageId, blob, expiresAt) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([FILES_STORE], "readwrite");
            const store = transaction.objectStore(FILES_STORE);
            const request = store.put({ messageId, blob, expiresAt });
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    });
}
function getFileBlob(messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([FILES_STORE], "readonly");
            const store = transaction.objectStore(FILES_STORE);
            const request = store.get(messageId);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => { var _a; return resolve((_a = request.result) === null || _a === void 0 ? void 0 : _a.blob); };
        });
    });
}
function cleanupExpiredMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield initDB();
        const now = Date.now();
        const messagesTx = database.transaction([MESSAGES_STORE], "readwrite");
        const messagesStore = messagesTx.objectStore(MESSAGES_STORE);
        const messagesIndex = messagesStore.index("expiresAt");
        const messagesRequest = messagesIndex.openCursor(IDBKeyRange.upperBound(now));
        messagesRequest.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.expiresAt && cursor.value.expiresAt <= now) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };
        const filesTx = database.transaction([FILES_STORE], "readwrite");
        const filesStore = filesTx.objectStore(FILES_STORE);
        const filesIndex = filesStore.index("expiresAt");
        const filesRequest = filesIndex.openCursor(IDBKeyRange.upperBound(now));
        filesRequest.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.expiresAt && cursor.value.expiresAt <= now) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };
    });
}
function startCleanupInterval(intervalMs = 30000) {
    const interval = setInterval(cleanupExpiredMessages, intervalMs);
    return () => clearInterval(interval);
}
function updateMessageStatus(messageId, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([MESSAGES_STORE], "readwrite");
            const store = transaction.objectStore(MESSAGES_STORE);
            const getRequest = store.get(messageId);
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    const message = getRequest.result;
                    message.status = status;
                    if (status === "read") {
                        message.expiresAt = Date.now() + 60000;
                    }
                    const putRequest = store.put(message);
                    putRequest.onerror = () => reject(putRequest.error);
                    putRequest.onsuccess = () => resolve();
                }
                else {
                    resolve();
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    });
}
function updateMessageReactions(messageId, reactions) {
    return __awaiter(this, void 0, void 0, function* () {
        const database = yield initDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([MESSAGES_STORE], "readwrite");
            const store = transaction.objectStore(MESSAGES_STORE);
            const getRequest = store.get(messageId);
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    const message = getRequest.result;
                    message.reactions = reactions;
                    const putRequest = store.put(message);
                    putRequest.onerror = () => reject(putRequest.error);
                    putRequest.onsuccess = () => resolve();
                }
                else {
                    resolve();
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
=======

let db = null;

export async function initDB() {
    if (db) return db;
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(MESSAGES_STORE)) {
                const messagesStore = database.createObjectStore(MESSAGES_STORE, { keyPath: "id" });
                messagesStore.createIndex("chatId", "chatId", { unique: false });
                messagesStore.createIndex("timestamp", "timestamp", { unique: false });
                messagesStore.createIndex("expiresAt", "expiresAt", { unique: false });
            }
            if (!database.objectStoreNames.contains(CHATS_STORE)) {
                const chatsStore = database.createObjectStore(CHATS_STORE, { keyPath: "id" });
                chatsStore.createIndex("updatedAt", "updatedAt", { unique: false });
            }
            if (!database.objectStoreNames.contains(FILES_STORE)) {
                const filesStore = database.createObjectStore(FILES_STORE, { keyPath: "messageId" });
                filesStore.createIndex("expiresAt", "expiresAt", { unique: false });
            }
        };
    });
}

export async function saveMessage(message) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([MESSAGES_STORE], "readwrite");
        const store = transaction.objectStore(MESSAGES_STORE);
        const request = store.put(message);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function getMessages(chatId, limit = 50) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([MESSAGES_STORE], "readonly");
        const store = transaction.objectStore(MESSAGES_STORE);
        const index = store.index("chatId");
        const request = index.getAll(IDBKeyRange.only(chatId));
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const messages = request.result;
            messages.sort((a, b) => a.timestamp - b.timestamp);
            resolve(messages.slice(-limit));
        };
    });
}

export async function deleteMessage(messageId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([MESSAGES_STORE], "readwrite");
        const store = transaction.objectStore(MESSAGES_STORE);
        const request = store.delete(messageId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function saveChat(chat) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([CHATS_STORE], "readwrite");
        const store = transaction.objectStore(CHATS_STORE);
        const request = store.put(chat);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function getChats() {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([CHATS_STORE], "readonly");
        const store = transaction.objectStore(CHATS_STORE);
        const index = store.index("updatedAt");
        const request = index.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const chats = request.result;
            chats.sort((a, b) => b.updatedAt - a.updatedAt);
            resolve(chats);
        };
    });
}

export async function getChat(chatId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([CHATS_STORE], "readonly");
        const store = transaction.objectStore(CHATS_STORE);
        const request = store.get(chatId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export async function deleteChat(chatId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([CHATS_STORE, MESSAGES_STORE], "readwrite");
        const chatsStore = transaction.objectStore(CHATS_STORE);
        const messagesStore = transaction.objectStore(MESSAGES_STORE);
        
        chatsStore.delete(chatId);
        const index = messagesStore.index("chatId");
        const request = index.openKeyCursor(IDBKeyRange.only(chatId));
        
        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                messagesStore.delete(cursor.primaryKey);
                cursor.continue();
            } else {
                resolve();
            }
        };
        request.onerror = () => reject(request.error);
    });
}

export async function saveFileBlob(messageId, blob, expiresAt) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([FILES_STORE], "readwrite");
        const store = transaction.objectStore(FILES_STORE);
        const request = store.put({ messageId, blob, expiresAt });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export async function getFileBlob(messageId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([FILES_STORE], "readonly");
        const store = transaction.objectStore(FILES_STORE);
        const request = store.get(messageId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const result = request.result;
            if (result && result.expiresAt > Date.now()) {
                resolve(result.blob);
            } else {
                if (result) store.delete(messageId);
                resolve(null);
            }
        };
    });
}

export async function cleanupExpiredMessages() {
    const database = await initDB();
    const now = Date.now();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([MESSAGES_STORE, FILES_STORE], "readwrite");
        
        const messagesStore = transaction.objectStore(MESSAGES_STORE);
        const messagesIndex = messagesStore.index("expiresAt");
        const messagesRequest = messagesIndex.openCursor(IDBKeyRange.upperBound(now));
        
        messagesRequest.onsuccess = () => {
            const cursor = messagesRequest.result;
            if (cursor) {
                messagesStore.delete(cursor.primaryKey);
                cursor.continue();
            }
        };

        const filesStore = transaction.objectStore(FILES_STORE);
        const filesIndex = filesStore.index("expiresAt");
        const filesRequest = filesIndex.openCursor(IDBKeyRange.upperBound(now));
        
        filesRequest.onsuccess = () => {
            const cursor = filesRequest.result;
            if (cursor) {
                filesStore.delete(cursor.primaryKey);
                cursor.continue();
            }
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export function startCleanupInterval(intervalMs = 60000) {
    setInterval(cleanupExpiredMessages, intervalMs);
}

export async function updateMessageStatus(messageId, status) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([MESSAGES_STORE], "readwrite");
        const store = transaction.objectStore(MESSAGES_STORE);
        const request = store.get(messageId);
        
        request.onsuccess = () => {
            const message = request.result;
            if (message) {
                message.status = status;
                store.put(message);
            }
            resolve();
        };
        request.onerror = () => reject(request.error);
    });
}

export async function updateMessageReactions(messageId, reactions) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([MESSAGES_STORE], "readwrite");
        const store = transaction.objectStore(MESSAGES_STORE);
        const request = store.get(messageId);
        
        request.onsuccess = () => {
            const message = request.result;
            if (message) {
                message.reactions = reactions;
                store.put(message);
            }
            resolve();
        };
        request.onerror = () => reject(request.error);
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    });
}
