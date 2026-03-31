"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertChatMessageSchema = exports.insertMoveSchema = exports.insertGameSchema = exports.insertUserSchema = exports.chatMessages = exports.moves = exports.games = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    email: (0, pg_core_1.text)("email"),
    rating: (0, pg_core_1.integer)("rating").default(1200),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.games = (0, pg_core_1.pgTable)("games", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    whitePlayerId: (0, pg_core_1.integer)("white_player_id").references(() => exports.users.id),
    blackPlayerId: (0, pg_core_1.integer)("black_player_id").references(() => exports.users.id),
    gameType: (0, pg_core_1.text)("game_type").notNull(), // 'computer', 'multiplayer'
    difficulty: (0, pg_core_1.text)("difficulty"), // for AI games: 'beginner', 'intermediate', 'advanced', 'master'
    status: (0, pg_core_1.text)("status").notNull().default("active"), // 'active', 'completed', 'abandoned'
    result: (0, pg_core_1.text)("result"), // 'white_wins', 'black_wins', 'draw', 'stalemate'
    currentFen: (0, pg_core_1.text)("current_fen").notNull().default("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
    pgn: (0, pg_core_1.text)("pgn").default(""),
    timeControl: (0, pg_core_1.integer)("time_control").default(600), // seconds
    whiteTime: (0, pg_core_1.integer)("white_time").default(600),
    blackTime: (0, pg_core_1.integer)("black_time").default(600),
    currentTurn: (0, pg_core_1.text)("current_turn").notNull().default("white"),
    moveCount: (0, pg_core_1.integer)("move_count").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.moves = (0, pg_core_1.pgTable)("moves", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    gameId: (0, pg_core_1.integer)("game_id").notNull().references(() => exports.games.id),
    moveNumber: (0, pg_core_1.integer)("move_number").notNull(),
    color: (0, pg_core_1.text)("color").notNull(), // 'white' or 'black'
    san: (0, pg_core_1.text)("san").notNull(), // Standard Algebraic Notation
    uci: (0, pg_core_1.text)("uci").notNull(), // Universal Chess Interface
    fen: (0, pg_core_1.text)("fen").notNull(),
    capturedPiece: (0, pg_core_1.text)("captured_piece"),
    isCheck: (0, pg_core_1.boolean)("is_check").default(false),
    isCheckmate: (0, pg_core_1.boolean)("is_checkmate").default(false),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
});
exports.chatMessages = (0, pg_core_1.pgTable)("chat_messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    gameId: (0, pg_core_1.integer)("game_id").notNull().references(() => exports.games.id),
    playerId: (0, pg_core_1.integer)("player_id").notNull().references(() => exports.users.id),
    message: (0, pg_core_1.text)("message").notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    email: true,
    rating: true,
});
exports.insertGameSchema = (0, drizzle_zod_1.createInsertSchema)(exports.games).pick({
    whitePlayerId: true,
    blackPlayerId: true,
    gameType: true,
    difficulty: true,
    timeControl: true,
});
exports.insertMoveSchema = (0, drizzle_zod_1.createInsertSchema)(exports.moves).pick({
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
exports.insertChatMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.chatMessages).pick({
    gameId: true,
    playerId: true,
    message: true,
});
