"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMessageSchema = exports.insertPlayerSchema = exports.insertRoomSchema = exports.insertUserSchema = exports.messages = exports.players = exports.rooms = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    balance: (0, pg_core_1.integer)("balance").notNull().default(2500),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.rooms = (0, pg_core_1.pgTable)("rooms", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    roomCode: (0, pg_core_1.text)("room_code").notNull().unique(),
    dealerName: (0, pg_core_1.text)("dealer_name").notNull(),
    maxPlayers: (0, pg_core_1.integer)("max_players").notNull().default(6),
    maxRounds: (0, pg_core_1.integer)("max_rounds").notNull().default(5),
    currentRound: (0, pg_core_1.integer)("current_round").notNull().default(0),
    gameStatus: (0, pg_core_1.text)("game_status").notNull().default("waiting"), // waiting, playing, finished
    currentPlayerIndex: (0, pg_core_1.integer)("current_player_index").notNull().default(0),
    pot: (0, pg_core_1.jsonb)("pot").default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.players = (0, pg_core_1.pgTable)("players", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id),
    roomId: (0, pg_core_1.integer)("room_id").references(() => exports.rooms.id),
    playerId: (0, pg_core_1.integer)("player_id").notNull(),
    playerName: (0, pg_core_1.text)("player_name").notNull(),
    hand: (0, pg_core_1.jsonb)("hand").default([]),
    bars: (0, pg_core_1.jsonb)("bars").default([]),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    audioEnabled: (0, pg_core_1.boolean)("audio_enabled").notNull().default(true),
    isMuted: (0, pg_core_1.boolean)("is_muted").notNull().default(false),
    joinedAt: (0, pg_core_1.timestamp)("joined_at").defaultNow(),
});
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    roomId: (0, pg_core_1.integer)("room_id").references(() => exports.rooms.id),
    playerId: (0, pg_core_1.integer)("player_id").notNull(),
    playerName: (0, pg_core_1.text)("player_name").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    messageType: (0, pg_core_1.text)("message_type").notNull().default("chat"), // chat, system, emote
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    password: true,
});
exports.insertRoomSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rooms).pick({
    dealerName: true,
    maxPlayers: true,
    maxRounds: true,
});
exports.insertPlayerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.players).pick({
    userId: true,
    roomId: true,
    playerId: true,
    playerName: true,
});
exports.insertMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.messages).pick({
    roomId: true,
    playerId: true,
    playerName: true,
    message: true,
    messageType: true,
});
