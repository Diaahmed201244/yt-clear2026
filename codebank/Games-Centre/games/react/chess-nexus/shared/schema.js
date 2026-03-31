import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    email: text("email"),
    rating: integer("rating").default(1200),
    createdAt: timestamp("created_at").defaultNow(),
});
export const games = pgTable("games", {
    id: serial("id").primaryKey(),
    whitePlayerId: integer("white_player_id").references(() => users.id),
    blackPlayerId: integer("black_player_id").references(() => users.id),
    gameType: text("game_type").notNull(),
    difficulty: text("difficulty"),
    status: text("status").notNull().default("active"),
    result: text("result"),
    currentFen: text("current_fen").notNull().default("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
    pgn: text("pgn").default(""),
    timeControl: integer("time_control").default(600),
    whiteTime: integer("white_time").default(600),
    blackTime: integer("black_time").default(600),
    currentTurn: text("current_turn").notNull().default("white"),
    moveCount: integer("move_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const moves = pgTable("moves", {
    id: serial("id").primaryKey(),
    gameId: integer("game_id").notNull().references(() => games.id),
    moveNumber: integer("move_number").notNull(),
    color: text("color").notNull(),
    san: text("san").notNull(),
    uci: text("uci").notNull(),
    fen: text("fen").notNull(),
    capturedPiece: text("captured_piece"),
    isCheck: boolean("is_check").default(false),
    isCheckmate: boolean("is_checkmate").default(false),
    timestamp: timestamp("timestamp").defaultNow(),
});
export const chatMessages = pgTable("chat_messages", {
    id: serial("id").primaryKey(),
    gameId: integer("game_id").notNull().references(() => games.id),
    playerId: integer("player_id").notNull().references(() => users.id),
    message: text("message").notNull(),
    timestamp: timestamp("timestamp").defaultNow(),
});
export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    email: true,
    rating: true,
});
export const insertGameSchema = createInsertSchema(games).pick({
    whitePlayerId: true,
    blackPlayerId: true,
    gameType: true,
    difficulty: true,
    timeControl: true,
});
export const insertMoveSchema = createInsertSchema(moves).pick({
    gameId: true,
    moveNumber: true,
    color: true,
    san: true,
    uci: true,
    fen: true,
    capturedPiece: true,
    isCheck: true,
    isCheckmate: true,
});
export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
    gameId: true,
    playerId: true,
    message: true,
});
