import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    balance: integer("balance").notNull().default(0),
    wins: integer("wins").notNull().default(0),
    totalEarnings: integer("total_earnings").notNull().default(0),
});
export const gameRooms = pgTable("game_rooms", {
    id: serial("id").primaryKey(),
    roomCode: text("room_code").notNull().unique(),
    dealerName: text("dealer_name").notNull().default("Lady Victoria"),
    maxPlayers: integer("max_players").notNull().default(6),
    currentPlayers: integer("current_players").notNull().default(0),
    gameStatus: text("game_status").notNull().default("waiting"),
    currentRound: integer("current_round").notNull().default(0),
    maxRounds: integer("max_rounds").notNull().default(5),
    currentPlayerIndex: integer("current_player_index").notNull().default(0),
    pot: jsonb("pot").notNull().default([]),
    deck: jsonb("deck").notNull().default([]),
    createdAt: timestamp("created_at").defaultNow(),
});
export const gamePlayers = pgTable("game_players", {
    id: serial("id").primaryKey(),
    roomId: integer("room_id").notNull(),
    playerId: integer("player_id").notNull(),
    playerName: text("player_name").notNull(),
    position: integer("position").notNull(),
    bars: jsonb("bars").notNull().default([]),
    cards: jsonb("cards").notNull().default([]),
    currentCard: text("current_card"),
    isActive: boolean("is_active").notNull().default(true),
    isReady: boolean("is_ready").notNull().default(false),
    joinedAt: timestamp("joined_at").defaultNow(),
});
export const chatMessages = pgTable("chat_messages", {
    id: serial("id").primaryKey(),
    roomId: integer("room_id").notNull(),
    playerId: integer("player_id"),
    playerName: text("player_name").notNull(),
    message: text("message").notNull(),
    messageType: text("message_type").notNull().default("chat"),
    timestamp: timestamp("timestamp").defaultNow(),
});
export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});
export const insertGameRoomSchema = createInsertSchema(gameRooms).pick({
    roomCode: true,
    dealerName: true,
    maxPlayers: true,
    maxRounds: true,
});
export const insertGamePlayerSchema = createInsertSchema(gamePlayers).pick({
    roomId: true,
    playerId: true,
    playerName: true,
    position: true,
});
export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
    roomId: true,
    playerId: true,
    playerName: true,
    message: true,
    messageType: true,
});
