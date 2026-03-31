"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPlayerSchema = exports.insertUserSchema = exports.players = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
});
exports.players = (0, pg_core_1.pgTable)('players', {
    id: (0, pg_core_1.varchar)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    playerId: (0, pg_core_1.text)('player_id').notNull().unique(), // Browser-based unique ID
    lastPlayDate: (0, pg_core_1.timestamp)('last_play_date', { withTimezone: true }),
    totalCodes: (0, pg_core_1.integer)('total_codes').notNull().default(1000),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    password: true,
});
exports.insertPlayerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.players).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
