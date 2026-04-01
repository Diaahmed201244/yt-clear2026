import { query } from '../config/db.js';
import crypto from 'crypto';

export async function applyNeonCompressionDDL() {
  // 🛡️ Ensure columns exist (Fix for "duplicate column name" warnings)
  const addColumnIfNotExists = async (table, column, type) => {
    try { 
      await query(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
      console.log(`[DB] Added missing column: ${column}`);
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        // Silently skip if column already exists
      } else {
        console.warn(`[DB] Warning checking column ${column}:`, e.message);
      }
    }
  };

  try { 
    await addColumnIfNotExists('users', 'religion', 'TEXT');
    await addColumnIfNotExists('users', 'country', 'TEXT');
    await addColumnIfNotExists('users', 'phone', 'TEXT');
  } catch (e) {
    console.error('[DB] Schema migration helper failed:', e.message);
  }

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, 
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
    `CREATE TABLE IF NOT EXISTS qarsan_virtual_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      dog_state TEXT,
      qarsan_mode TEXT DEFAULT 'OFF',
      balance INT DEFAULT 0,
      qarsan_wallet INT DEFAULT 0,
      last_fed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS ledger (
      id TEXT PRIMARY KEY,
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
    `CREATE UNIQUE INDEX IF NOT EXISTS ledger_tx_unique ON ledger (tx_id, user_id, direction)`,
    `CREATE TABLE IF NOT EXISTS user_assets (
      user_id TEXT NOT NULL, 
      asset_id TEXT NOT NULL, 
      PRIMARY KEY(user_id, asset_id)
    )`,
    `CREATE TABLE IF NOT EXISTS used_codes (
      code_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      used_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS sync_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      delta_codes INT DEFAULT 0,
      delta_silver INT DEFAULT 0,
      delta_gold INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS balances (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      codes_count INT DEFAULT 0,
      silver_count INT DEFAULT 0,
      gold_count INT DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS codes (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      code TEXT NOT NULL UNIQUE,
      type TEXT DEFAULT 'normal',
      spent BOOLEAN DEFAULT 0,
      is_compressed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_codes_user ON codes(user_id)`,
    `CREATE TABLE IF NOT EXISTS processed_transactions (
      tx_id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS applied_events (
      event_id INT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS event_store (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      payload TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS balance_projection (
      user_id TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      amount INT DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, asset_type)
    )`,
    `CREATE TABLE IF NOT EXISTS auth_sessions (
      token TEXT PRIMARY KEY,
      token_hash TEXT,
      user_id TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS event_offsets (
      key TEXT PRIMARY KEY,
      last_id INT DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS yahood_homes (
      user_id TEXT PRIMARY KEY,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      defense_level INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS yahood_pending_treasures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      asset_type TEXT CHECK(asset_type IN ('codes', 'silver', 'gold')),
      amount INTEGER NOT NULL,
      found_lat REAL NOT NULL,
      found_lng REAL NOT NULL,
      found_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'claimed', 'stolen')),
      stolen_by TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (stolen_by) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS yahood_player_locations (
      user_id TEXT PRIMARY KEY,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS yahood_lands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      radius_meters INTEGER DEFAULT 100,
      price_paid_codes INTEGER NOT NULL,
      purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_yahood_pending_user ON yahood_pending_treasures(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yahood_pending_status ON yahood_pending_treasures(status)`,
    `CREATE INDEX IF NOT EXISTS idx_yahood_lands_owner ON yahood_lands(owner_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yahood_lands_location ON yahood_lands(lat, lng)`,
    "INSERT INTO event_offsets (key, last_id) VALUES ('default', 0) ON CONFLICT (key) DO NOTHING"
  ];
  
  try { 
    for (const sql of statements) {
      try {  await query(sql) } catch (e) { console.warn('[DB DDL] stmt failed:', e.message) }
    }
    console.log('✅ [DB] Schema Verified on startup');
  } catch(e) { console.warn('[DB DDL] apply failed:', e.message) }
}

export async function ensureQarsanVirtualUsers() {
  try { 
    const r = await query('SELECT COUNT(*) AS c FROM qarsan_virtual_users')
    const c = parseInt(r.rows[0]?.c || 0, 10)
    if (c === 0) {
      await generateVirtualUsers()
    }
  } catch (_) {}
}

async function generateVirtualUsers() {
  try { 
    const bots = [
      { email: 'bot1@qarsan.ai', name: 'Qarsan Bot 1', dog_state: 'SLEEPING', qarsan_mode: 'RANGED', balance: 150, qarsan_wallet: 50 },
      { email: 'bot2@qarsan.ai', name: 'Qarsan Bot 2', dog_state: 'ACTIVE', qarsan_mode: 'OFF', balance: 200, qarsan_wallet: 0 },
      { email: 'trap.user@qarsan.ai', name: 'Trap User', dog_state: 'ACTIVE', qarsan_mode: 'EXPOSURE', balance: 300, qarsan_wallet: 100 },
      { email: 'decoy@qarsan.ai', name: 'Decoy Account', dog_state: 'SLEEPING', qarsan_mode: 'EXPOSURE', balance: 120, qarsan_wallet: 20 },
      { email: 'honeypot@qarsan.ai', name: 'Honey Pot', dog_state: 'SLEEPING', qarsan_mode: 'RANGED', balance: 80, qarsan_wallet: 40 }
    ]
    for (const b of bots) {
      await query(
        `INSERT INTO qarsan_virtual_users (id, email, name, dog_state, qarsan_mode, balance, qarsan_wallet, last_fed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, datetime('now', '-26 hours'))
         ON CONFLICT (email) DO NOTHING`,
        [crypto.randomUUID(), b.email, b.name, b.dog_state, b.qarsan_mode, b.balance, b.qarsan_wallet]
      )
    }
  } catch (_) {}
}
