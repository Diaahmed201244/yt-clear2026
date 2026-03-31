/**
 * services/virtual-users.service.js
 *
 * Qarsan virtual (bot) user management.
 *
 * Virtual users serve as attack targets in the Qarsan game mode.  They are
 * seeded once into `qarsan_virtual_users` and never regenerated unless the
 * table is empty.
 *
 * Exports:
 *   generateVirtualUsers()       — insert the predefined bot roster
 *   ensureQarsanVirtualUsers()   — idempotent boot-time check + seed
 */

import crypto from 'crypto';
import { query } from '../config/database.js';

// ---------------------------------------------------------------------------
// Predefined bot roster
// ---------------------------------------------------------------------------

const BOTS = [
  { email: 'bot1@qarsan.ai', name: 'Qarsan Bot 1', dogState: 'SLEEPING', qarsanMode: 'RANGED', balance: 150, qarsanWallet: 50 },
  { email: 'bot2@qarsan.ai', name: 'Qarsan Bot 2', dogState: 'ACTIVE', qarsanMode: 'OFF', balance: 200, qarsanWallet: 0 },
  { email: 'trap.user@qarsan.ai', name: 'Trap User', dogState: 'ACTIVE', qarsanMode: 'EXPOSURE', balance: 300, qarsanWallet: 100 },
  { email: 'decoy@qarsan.ai', name: 'Decoy Account', dogState: 'SLEEPING', qarsanMode: 'EXPOSURE', balance: 120, qarsanWallet: 20 },
  { email: 'honeypot@qarsan.ai', name: 'Honey Pot', dogState: 'SLEEPING', qarsanMode: 'RANGED', balance: 80, qarsanWallet: 40 },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Insert the predefined virtual users into `qarsan_virtual_users`.
 *
 * Uses ON CONFLICT (email) DO NOTHING so the function is safe to call
 * multiple times.
 */
export async function generateVirtualUsers() {
  try {
    for (const b of BOTS) {
      await query(
        `INSERT INTO qarsan_virtual_users (id, email, name, dog_state, qarsan_mode, balance, qarsan_wallet, last_fed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, datetime('now', '-26 hours'))
         ON CONFLICT (email) DO NOTHING`,
        [crypto.randomUUID(), b.email, b.name, b.dogState, b.qarsanMode, b.balance, b.qarsanWallet]
      );
    }
  } catch (_) {
    // Silently ignore — table may not exist yet during first boot
  }
}

/**
 * Ensure at least one set of virtual users exists.
 *
 * Call this during server startup (after DDL has been applied).
 */
export async function ensureQarsanVirtualUsers() {
  try {
    const r = await query('SELECT COUNT(*) AS c FROM qarsan_virtual_users');
    const c = parseInt(r.rows[0]?.c || 0, 10);
    if (c === 0) {
      await generateVirtualUsers();
    }
  } catch (_) {
    // Table may not exist yet — will be created by DDL migration
  }
}
