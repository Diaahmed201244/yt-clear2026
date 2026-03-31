import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    balance: integer("balance").notNull().default(5000),
});
export const games = pgTable("games", {
    id: serial("id").primaryKey(),
    gameId: text("game_id").notNull().unique(),
    status: text("status").notNull().default("waiting"),
    currentRound: integer("current_round").notNull().default(1),
    maxRounds: integer("max_rounds").notNull().default(4),
    entryStake: integer("entry_stake").notNull().default(250),
    currentPot: integer("current_pot").notNull().default(0),
    communityCards: jsonb("community_cards").$type().default([]),
    currentPhase: text("current_phase").notNull().default("waiting"),
    currentPlayerIndex: integer("current_player_index").notNull().default(0),
    turnStartTime: timestamp("turn_start_time"),
    turnTimeLimit: integer("turn_time_limit").notNull().default(30),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const gamePlayers = pgTable("game_players", {
    id: serial("id").primaryKey(),
    gameId: text("game_id").notNull(),
    playerId: integer("player_id").notNull(),
    playerName: text("player_name").notNull(),
    position: integer("position").notNull(),
    balance: integer("balance").notNull(),
    currentStake: integer("current_stake").notNull().default(0),
    hand: jsonb("hand").$type().default([]),
    status: text("status").notNull().default("waiting"),
    isDealer: boolean("is_dealer").notNull().default(false),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
});
export const gameHistory = pgTable("game_history", {
    id: serial("id").primaryKey(),
    gameId: text("game_id").notNull(),
    round: integer("round").notNull(),
    action: text("action").notNull(),
    playerId: integer("player_id"),
    playerName: text("player_name"),
    data: jsonb("data"),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
});
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    balance: true,
});
export const insertGameSchema = createInsertSchema(games).omit({
    id: true,
    createdAt: true,
});
export const insertGamePlayerSchema = createInsertSchema(gamePlayers).omit({
    id: true,
    joinedAt: true,
});
export const insertGameHistorySchema = createInsertSchema(gameHistory).omit({
    id: true,
    timestamp: true,
});
