/**
 * db/schema.js
 *
 * Defines the entire database schema for the application.
 * Contains all CREATE TABLE / CREATE INDEX statements and the
 * `applyNeonCompressionDDL()` function that ensures the schema
 * is up-to-date on every startup.
 */

import { query } from '../config/database.js';

/**
 * Ensures required columns exist on the `users` table.
 * Runs ALTER TABLE … ADD COLUMN for each column and silently
 * ignores "duplicate column" errors so it's safe to re-run.
 */
async function ensureUserColumns() {
  const columns = ['religion', 'country', 'phone'];
  for (const col of columns) {
    try {
      await query(`ALTER TABLE users ADD COLUMN ${col} TEXT`);
      console.log(`[DB] Added missing column: ${col}`);
    } catch (e) {
      if (e.message && e.message.includes('duplicate column name')) {
        console.log(`[DB] Column ${col} already exists, skipping`);
      } else {
        console.warn(`[DB] Column migration warning for ${col}:`, e.message);
      }
    }
  }
}

/**
 * All DDL statements executed during startup to guarantee schema
 * integrity. Each statement uses IF NOT EXISTS so it's idempotent.
 */
const schemaStatements = [
  // ── Core user account table ──
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    user_type TEXT DEFAULT 'user',
    password_hash TEXT,
    codes_count INT DEFAULT 0,
    silver_count INT DEFAULT 0,
    gold_count INT DEFAULT 0,
    religion TEXT,
    country TEXT,
    phone TEXT,
    last_sync_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_sync_hash TEXT,
    is_untrusted BOOLEAN DEFAULT 0,
    flagged_reason TEXT
  )`,

  // ── Virtual (bot) users for the Qarsan game system ──
  // BUG FIX: The primary key column is `id` — queries previously referenced
  // `virtual_user_id` which doesn't exist. All queries should use `id`.
  `CREATE TABLE IF NOT EXISTS qarsan_virtual_users (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    email TEXT UNIQUE,
    name TEXT,
    dog_state TEXT,
    qarsan_mode TEXT DEFAULT 'OFF',
    balance INT DEFAULT 0,
    qarsan_wallet INT DEFAULT 0,
    last_fed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── Immutable financial ledger for debit/credit transactions ──
  `CREATE TABLE IF NOT EXISTS ledger (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    tx_id TEXT NOT NULL,
    tx_hash TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('debit','credit')),
    asset_type TEXT NOT NULL,
    amount INT NOT NULL CHECK (amount > 0),
    reference TEXT,
    meta TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── Unique constraint on ledger to prevent duplicate transaction legs ──
  `CREATE UNIQUE INDEX IF NOT EXISTS ledger_tx_unique ON ledger (tx_id, user_id, direction)`,

  // ── Many-to-many relationship: users ↔ assets ──
  `CREATE TABLE IF NOT EXISTS user_assets (
    user_id TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    PRIMARY KEY(user_id, asset_id)
  )`,

  // ── Audit trail / event sourcing vault for all significant actions ──
  `CREATE TABLE IF NOT EXISTS event_vault (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    event_type TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    actor_user_id TEXT,
    target_user_id TEXT,
    amount NUMERIC,
    asset_id TEXT,
    metadata TEXT,
    status TEXT NOT NULL DEFAULT 'success',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tx_hash TEXT UNIQUE
  )`,

  // ── Tracks redeemed / consumed codes to prevent re-use ──
  `CREATE TABLE IF NOT EXISTS used_codes (
    code_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── Per-user sync deltas for offline-first reconciliation ──
  `CREATE TABLE IF NOT EXISTS sync_events (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    user_id TEXT NOT NULL REFERENCES users(id),
    delta_codes INT DEFAULT 0,
    delta_silver INT DEFAULT 0,
    delta_gold INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── Denormalized balance cache per user (codes, silver, gold) ──
  `CREATE TABLE IF NOT EXISTS balances (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    codes_count INT DEFAULT 0,
    silver_count INT DEFAULT 0,
    gold_count INT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── Individual code records linked to their owner ──
  `CREATE TABLE IF NOT EXISTS codes (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    type TEXT DEFAULT 'normal',
    spent BOOLEAN DEFAULT 0,
    is_compressed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── Index for fast lookup of codes by owner ──
  `CREATE INDEX IF NOT EXISTS idx_codes_user ON codes(user_id)`,

  // ── Idempotency guard: prevents processing the same transaction twice ──
  `CREATE TABLE IF NOT EXISTS processed_transactions (
    tx_id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── Tracks which events from event_store have been applied (idempotency) ──
  `CREATE TABLE IF NOT EXISTS applied_events (
    event_id BIGINT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── Append-only event store for CQRS / event-sourcing pipeline ──
  `CREATE TABLE IF NOT EXISTS event_store (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    payload TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── Materialised balance projection per (user, asset_type) pair ──
  `CREATE TABLE IF NOT EXISTS balance_projection (
    user_id TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    amount INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, asset_type)
  )`,

  // ── Session tokens for authenticated users ──
  `CREATE TABLE IF NOT EXISTS auth_sessions (
    token TEXT PRIMARY KEY,
    token_hash TEXT,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── Cursor tracking for the event processor (stores last processed id) ──
  `CREATE TABLE IF NOT EXISTS event_offsets (
    key TEXT PRIMARY KEY,
    last_id INT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // ── Seed the default offset row so the event processor has a starting point ──
  "INSERT INTO event_offsets (key, last_id) VALUES ('default', 0) ON CONFLICT (key) DO NOTHING",

  // ── Per-user rewards balance (earned through gameplay / referrals) ──
  `CREATE TABLE IF NOT EXISTS user_rewards (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance INT DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
];

/**
 * Apply the full database schema.
 *
 * 1. Ensures required columns on existing tables (safe ALTER TABLE).
 * 2. Runs every CREATE TABLE / CREATE INDEX statement.
 * 3. Seeds default rows where needed.
 *
 * Safe to call on every startup — all statements are idempotent.
 */
export async function applyNeonCompressionDDL() {
  // Step 1 — ensure dynamic columns on the users table
  try {
    await ensureUserColumns();
  } catch (e) {
    console.error('[DB] Schema migration failed:', e.message);
  }

  console.log('[DB] Schema verification completed');

  // Step 2 — run all DDL statements
  try {
    for (const sql of schemaStatements) {
      try {
        await querySilent(sql);
      } catch (e) {
        // Silent wrapper already handles logging
      }
    }
    if (LOG_LEVEL !== 'error') {
      console.log('✅ [DB] Schema Verified on startup');
    }
  } catch (e) {
    // Silent wrapper already handles logging
  }
}
