"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertLeaderboardSchema = exports.insertGameStateSchema = exports.insertPlayerSchema = exports.insertUserSchema = exports.leaderboard = exports.gameStates = exports.players = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
});
exports.players = (0, pg_core_1.pgTable)("players", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    username: (0, pg_core_1.text)("username").notNull(),
    tokens: (0, pg_core_1.integer)("tokens").notNull().default(100),
    currentStage: (0, pg_core_1.integer)("current_stage").notNull().default(1),
    trialsCompleted: (0, pg_core_1.integer)("trials_completed").notNull().default(0),
    isEliminated: (0, pg_core_1.boolean)("is_eliminated").notNull().default(false),
    finalRank: (0, pg_core_1.integer)("final_rank"),
    gameSessionId: (0, pg_core_1.varchar)("game_session_id"),
    powerUps: (0, pg_core_1.jsonb)("power_ups").notNull().default({}),
    achievements: (0, pg_core_1.text)("achievements").array().notNull().default([]),
    difficultyLevel: (0, pg_core_1.integer)("difficulty_level").notNull().default(1),
    streakCount: (0, pg_core_1.integer)("streak_count").notNull().default(0),
    totalPlayTime: (0, pg_core_1.integer)("total_play_time").notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.gameStates = (0, pg_core_1.pgTable)("game_states", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    sessionId: (0, pg_core_1.varchar)("session_id").notNull(),
    currentStage: (0, pg_core_1.integer)("current_stage").notNull().default(1),
    playersAlive: (0, pg_core_1.integer)("players_alive").notNull().default(456),
    gameData: (0, pg_core_1.jsonb)("game_data").notNull().default({}),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.leaderboard = (0, pg_core_1.pgTable)("leaderboard", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    playerId: (0, pg_core_1.varchar)("player_id").notNull(),
    playerName: (0, pg_core_1.text)("player_name").notNull(),
    trialsCompleted: (0, pg_core_1.integer)("trials_completed").notNull(),
    tokens: (0, pg_core_1.integer)("tokens").notNull(),
    finalRank: (0, pg_core_1.integer)("final_rank"),
    survivalTime: (0, pg_core_1.integer)("survival_time"), // in seconds
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    password: true,
});
exports.insertPlayerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.players).omit({
    id: true,
    createdAt: true,
});
exports.insertGameStateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.gameStates).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertLeaderboardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.leaderboard).omit({
    id: true,
    createdAt: true,
});
