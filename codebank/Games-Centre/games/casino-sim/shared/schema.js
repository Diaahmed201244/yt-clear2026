"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertGameHistorySchema = exports.insertGamePlayerSchema = exports.insertGameSchema = exports.insertUserSchema = exports.gameHistory = exports.gamePlayers = exports.games = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    balance: (0, pg_core_1.integer)("balance").notNull().default(5000),
});
exports.games = (0, pg_core_1.pgTable)("games", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    gameId: (0, pg_core_1.text)("game_id").notNull().unique(),
    status: (0, pg_core_1.text)("status").notNull().default("waiting"), // waiting, active, finished
    currentRound: (0, pg_core_1.integer)("current_round").notNull().default(1),
    maxRounds: (0, pg_core_1.integer)("max_rounds").notNull().default(4),
    entryStake: (0, pg_core_1.integer)("entry_stake").notNull().default(250),
    currentPot: (0, pg_core_1.integer)("current_pot").notNull().default(0),
    communityCards: (0, pg_core_1.jsonb)("community_cards").$type().default([]),
    currentPhase: (0, pg_core_1.text)("current_phase").notNull().default("waiting"), // waiting, dealing, flop, turn, river, showdown
    currentPlayerIndex: (0, pg_core_1.integer)("current_player_index").notNull().default(0),
    turnStartTime: (0, pg_core_1.timestamp)("turn_start_time"),
    turnTimeLimit: (0, pg_core_1.integer)("turn_time_limit").notNull().default(30),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
});
exports.gamePlayers = (0, pg_core_1.pgTable)("game_players", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    gameId: (0, pg_core_1.text)("game_id").notNull(),
    playerId: (0, pg_core_1.integer)("player_id").notNull(),
    playerName: (0, pg_core_1.text)("player_name").notNull(),
    position: (0, pg_core_1.integer)("position").notNull(),
    balance: (0, pg_core_1.integer)("balance").notNull(),
    currentStake: (0, pg_core_1.integer)("current_stake").notNull().default(0),
    hand: (0, pg_core_1.jsonb)("hand").$type().default([]),
    status: (0, pg_core_1.text)("status").notNull().default("waiting"), // waiting, active, folded, all-in
    isDealer: (0, pg_core_1.boolean)("is_dealer").notNull().default(false),
    joinedAt: (0, pg_core_1.timestamp)("joined_at").notNull().defaultNow(),
});
exports.gameHistory = (0, pg_core_1.pgTable)("game_history", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    gameId: (0, pg_core_1.text)("game_id").notNull(),
    round: (0, pg_core_1.integer)("round").notNull(),
    action: (0, pg_core_1.text)("action").notNull(),
    playerId: (0, pg_core_1.integer)("player_id"),
    playerName: (0, pg_core_1.text)("player_name"),
    data: (0, pg_core_1.jsonb)("data"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull().defaultNow(),
});
// Insert Schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    balance: true,
});
exports.insertGameSchema = (0, drizzle_zod_1.createInsertSchema)(exports.games).omit({
    id: true,
    createdAt: true,
});
exports.insertGamePlayerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.gamePlayers).omit({
    id: true,
    joinedAt: true,
});
exports.insertGameHistorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.gameHistory).omit({
    id: true,
    timestamp: true,
});
