"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertChatMessageSchema = exports.insertGamePlayerSchema = exports.insertGameRoomSchema = exports.insertUserSchema = exports.chatMessages = exports.gamePlayers = exports.gameRooms = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    balance: (0, pg_core_1.integer)("balance").notNull().default(0),
    wins: (0, pg_core_1.integer)("wins").notNull().default(0),
    totalEarnings: (0, pg_core_1.integer)("total_earnings").notNull().default(0),
});
exports.gameRooms = (0, pg_core_1.pgTable)("game_rooms", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    roomCode: (0, pg_core_1.text)("room_code").notNull().unique(),
    dealerName: (0, pg_core_1.text)("dealer_name").notNull().default("Lady Victoria"),
    maxPlayers: (0, pg_core_1.integer)("max_players").notNull().default(6),
    currentPlayers: (0, pg_core_1.integer)("current_players").notNull().default(0),
    gameStatus: (0, pg_core_1.text)("game_status").notNull().default("waiting"), // waiting, playing, finished
    currentRound: (0, pg_core_1.integer)("current_round").notNull().default(0),
    maxRounds: (0, pg_core_1.integer)("max_rounds").notNull().default(5),
    currentPlayerIndex: (0, pg_core_1.integer)("current_player_index").notNull().default(0),
    pot: (0, pg_core_1.jsonb)("pot").notNull().default([]), // array of bars
    deck: (0, pg_core_1.jsonb)("deck").notNull().default([]), // remaining cards
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.gamePlayers = (0, pg_core_1.pgTable)("game_players", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    roomId: (0, pg_core_1.integer)("room_id").notNull(),
    playerId: (0, pg_core_1.integer)("player_id").notNull(),
    playerName: (0, pg_core_1.text)("player_name").notNull(),
    position: (0, pg_core_1.integer)("position").notNull(), // 0-5 around table
    bars: (0, pg_core_1.jsonb)("bars").notNull().default([]), // array of gold/silver bars
    cards: (0, pg_core_1.jsonb)("cards").notNull().default([]), // player's cards
    currentCard: (0, pg_core_1.text)("current_card"), // card played this round
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    isReady: (0, pg_core_1.boolean)("is_ready").notNull().default(false),
    joinedAt: (0, pg_core_1.timestamp)("joined_at").defaultNow(),
});
exports.chatMessages = (0, pg_core_1.pgTable)("chat_messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    roomId: (0, pg_core_1.integer)("room_id").notNull(),
    playerId: (0, pg_core_1.integer)("player_id"),
    playerName: (0, pg_core_1.text)("player_name").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    messageType: (0, pg_core_1.text)("message_type").notNull().default("chat"), // chat, emote, system
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
});
// Zod schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    password: true,
});
exports.insertGameRoomSchema = (0, drizzle_zod_1.createInsertSchema)(exports.gameRooms).pick({
    roomCode: true,
    dealerName: true,
    maxPlayers: true,
    maxRounds: true,
});
exports.insertGamePlayerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.gamePlayers).pick({
    roomId: true,
    playerId: true,
    playerName: true,
    position: true,
});
exports.insertChatMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.chatMessages).pick({
    roomId: true,
    playerId: true,
    playerName: true,
    message: true,
    messageType: true,
});
