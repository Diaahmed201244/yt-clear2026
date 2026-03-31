import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    balance: integer("balance").notNull().default(2500),
    createdAt: timestamp("created_at").defaultNow(),
});
export const rooms = pgTable("rooms", {
    id: serial("id").primaryKey(),
    roomCode: text("room_code").notNull().unique(),
    dealerName: text("dealer_name").notNull(),
    maxPlayers: integer("max_players").notNull().default(6),
    maxRounds: integer("max_rounds").notNull().default(5),
    currentRound: integer("current_round").notNull().default(0),
    gameStatus: text("game_status").notNull().default("waiting"),
    currentPlayerIndex: integer("current_player_index").notNull().default(0),
    pot: jsonb("pot").default([]),
    createdAt: timestamp("created_at").defaultNow(),
});
export const players = pgTable("players", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    roomId: integer("room_id").references(() => rooms.id),
    playerId: integer("player_id").notNull(),
    playerName: text("player_name").notNull(),
    hand: jsonb("hand").default([]),
    bars: jsonb("bars").default([]),
    isActive: boolean("is_active").notNull().default(true),
    audioEnabled: boolean("audio_enabled").notNull().default(true),
    isMuted: boolean("is_muted").notNull().default(false),
    joinedAt: timestamp("joined_at").defaultNow(),
});
export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    roomId: integer("room_id").references(() => rooms.id),
    playerId: integer("player_id").notNull(),
    playerName: text("player_name").notNull(),
    message: text("message").notNull(),
    messageType: text("message_type").notNull().default("chat"),
    timestamp: timestamp("timestamp").defaultNow(),
});
export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});
export const insertRoomSchema = createInsertSchema(rooms).pick({
    dealerName: true,
    maxPlayers: true,
    maxRounds: true,
});
export const insertPlayerSchema = createInsertSchema(players).pick({
    userId: true,
    roomId: true,
    playerId: true,
    playerName: true,
});
export const insertMessageSchema = createInsertSchema(messages).pick({
    roomId: true,
    playerId: true,
    playerName: true,
    message: true,
    messageType: true,
});
