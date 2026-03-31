import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});
export const players = pgTable("players", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    username: text("username").notNull(),
    tokens: integer("tokens").notNull().default(100),
    currentStage: integer("current_stage").notNull().default(1),
    trialsCompleted: integer("trials_completed").notNull().default(0),
    isEliminated: boolean("is_eliminated").notNull().default(false),
    finalRank: integer("final_rank"),
    gameSessionId: varchar("game_session_id"),
    powerUps: jsonb("power_ups").notNull().default({}),
    achievements: text("achievements").array().notNull().default([]),
    difficultyLevel: integer("difficulty_level").notNull().default(1),
    streakCount: integer("streak_count").notNull().default(0),
    totalPlayTime: integer("total_play_time").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
});
export const gameStates = pgTable("game_states", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    sessionId: varchar("session_id").notNull(),
    currentStage: integer("current_stage").notNull().default(1),
    playersAlive: integer("players_alive").notNull().default(456),
    gameData: jsonb("game_data").notNull().default({}),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const leaderboard = pgTable("leaderboard", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    playerId: varchar("player_id").notNull(),
    playerName: text("player_name").notNull(),
    trialsCompleted: integer("trials_completed").notNull(),
    tokens: integer("tokens").notNull(),
    finalRank: integer("final_rank"),
    survivalTime: integer("survival_time"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});
export const insertPlayerSchema = createInsertSchema(players).omit({
    id: true,
    createdAt: true,
});
export const insertGameStateSchema = createInsertSchema(gameStates).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({
    id: true,
    createdAt: true,
});
