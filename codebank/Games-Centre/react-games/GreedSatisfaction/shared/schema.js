import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});
export const players = pgTable('players', {
    id: varchar('id').primaryKey().default(sql `gen_random_uuid()`),
    playerId: text('player_id').notNull().unique(),
    lastPlayDate: timestamp('last_play_date', { withTimezone: true }),
    totalCodes: integer('total_codes').notNull().default(1000),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});
export const insertPlayerSchema = createInsertSchema(players).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
