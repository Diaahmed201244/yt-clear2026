/**
 * 🛡️ WATCH-DOG GUARDIAN - AI Observer (NOT Controller)
 *
 * ROLE: Observer only.
 *   ✅ Monitor ACC events
 *   ✅ Detect anomalies
 *   ✅ Trigger alerts / freeze accounts
 *   ❌ Does NOT modify balances
 *   ❌ Does NOT write transactions
 *
 * All asset operations go through ACC (Assets Central Core).
 */

import { query as dbQuery, pool } from '../api/config/db.js';
import crypto from 'crypto';

/**
 * Get Watch-Dog state from database
 */
async function getWatchDogState(userId) {
  try {
    const result = await dbQuery(
      `SELECT last_fed_at, dog_state, is_frozen, frozen_reason 
       FROM watchdog_state 
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      await dbQuery(
        `INSERT INTO watchdog_state (user_id, last_fed_at, dog_state, is_frozen) 
         VALUES ($1, NULL, 'SLEEPING', 0)`,
        [userId]
      );
      return { lastFedAt: null, dogState: 'SLEEPING', isFrozen: false, frozenReason: null };
    }

    const row = result.rows[0];
    return {
      lastFedAt: row.last_fed_at,
      dogState: row.dog_state,
      isFrozen: !!row.is_frozen,
      frozenReason: row.frozen_reason
    };
  } catch (err) {
    console.error('[WATCHDOG] getWatchDogState error:', err);
    return { lastFedAt: null, dogState: 'SLEEPING', isFrozen: false, frozenReason: null };
  }
}

/**
 * Update Watch-Dog state
 */
async function updateWatchDogState(userId, updates) {
  try {
    const setClauses = [];
    const params = [userId];
    let paramIndex = 2;

    if (updates.lastFedAt !== undefined) {
      setClauses.push(`last_fed_at = $${paramIndex++}`);
      params.push(updates.lastFedAt);
    }
    if (updates.dogState !== undefined) {
      setClauses.push(`dog_state = $${paramIndex++}`);
      params.push(updates.dogState);
    }
    if (updates.isFrozen !== undefined) {
      setClauses.push(`is_frozen = $${paramIndex++}`);
      params.push(updates.isFrozen ? 1 : 0);
    }
    if (updates.frozenReason !== undefined) {
      setClauses.push(`frozen_reason = $${paramIndex++}`);
      params.push(updates.frozenReason);
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    await dbQuery(
      `UPDATE watchdog_state SET ${setClauses.join(', ')} WHERE user_id = $1`,
      params
    );

    return true;
  } catch (err) {
    console.error('[WATCHDOG] updateWatchDogState error:', err);
    return false;
  }
}

/**
 * 🔍 OBSERVE ACC transaction events for anomalies.
 * Detects suspicious patterns — does NOT modify balances.
 *
 * @param {string} userId
 * @param {object} accEvent - Event from ACC (type, assetType, amount, balanceAfter)
 */
async function observeACCEvent(userId, accEvent) {
  try {
    const { type, assetType, amount, balanceAfter, service } = accEvent;

    // Anomaly: balance went negative
    if (typeof balanceAfter === 'number' && balanceAfter < 0) {
      console.error('[WATCHDOG] 🚨 ANOMALY: Negative balance detected', {
        userId,
        assetType,
        balanceAfter,
        service,
        timestamp: new Date().toISOString()
      });
      await freezeAccount(userId, `NEGATIVE_BALANCE: ${assetType} = ${balanceAfter}`);
      return { anomaly: true, reason: 'NEGATIVE_BALANCE' };
    }

    // Anomaly: unusually large debit in a single transaction
    const LARGE_DEBIT_THRESHOLD = 1000;
    if ((type === 'debit' || type === 'spend') && amount > LARGE_DEBIT_THRESHOLD) {
      console.warn('[WATCHDOG] ⚠️ ALERT: Large debit detected', {
        userId,
        assetType,
        amount,
        service,
        timestamp: new Date().toISOString()
      });
      await logAudit('LARGE_DEBIT_ALERT', { userId, assetType, amount, service });
    }

    return { anomaly: false };
  } catch (err) {
    console.error('[WATCHDOG] observeACCEvent error:', err);
    return { anomaly: false, error: err.message };
  }
}

/**
 * 🔍 Observe dog state by time (called periodically, no balance changes)
 */
async function updateDogStateByTime(userId) {
  try {
    const state = await getWatchDogState(userId);

    if (!state.lastFedAt) {
      await updateWatchDogState(userId, { dogState: 'SLEEPING' });
      return { dogState: 'SLEEPING', reason: 'Never fed' };
    }

    const lastFed = new Date(state.lastFedAt);
    const now = new Date();
    const hoursSinceLastFeed = (now - lastFed) / (1000 * 60 * 60);

    let newState = state.dogState;

    if (hoursSinceLastFeed > 72) {
      newState = 'DEAD';
      await updateWatchDogState(userId, { dogState: 'DEAD' });
      console.warn(`[WATCHDOG] 💀 ${userId} is DEAD (${hoursSinceLastFeed.toFixed(1)}h)`);
    } else if (hoursSinceLastFeed > 24) {
      newState = 'SLEEPING';
      await updateWatchDogState(userId, { dogState: 'SLEEPING' });
      console.warn(`[WATCHDOG] 🐕 ${userId} is SLEEPING (${hoursSinceLastFeed.toFixed(1)}h)`);
    } else if (hoursSinceLastFeed <= 24 && (state.dogState === 'SLEEPING' || state.dogState === 'DEAD')) {
      newState = 'ACTIVE';
      await updateWatchDogState(userId, { dogState: 'ACTIVE' });
      console.log(`[WATCHDOG] 🐕 ${userId} is now ACTIVE`);
    }

    return {
      dogState: newState,
      hoursSinceLastFeed: hoursSinceLastFeed.toFixed(1)
    };
  } catch (err) {
    console.error('[WATCHDOG] updateDogStateByTime error:', err);
    return { dogState: 'SLEEPING', error: err.message };
  }
}

/**
 * ⚠️ OBSERVER: Record that the user fed the watchdog.
 * NOTE: Code deduction is handled by ACC. This only records the feed timestamp.
 *
 * @param {string} userId
 * @param {string|null} idempotencyKey
 */
async function recordWatchDogFeed(userId, idempotencyKey = null) {
  try {
    if (idempotencyKey) {
      const existing = await dbQuery(
        `SELECT id FROM audit_log 
         WHERE type = 'WATCHDOG_FED' AND payload::text LIKE $1
         ORDER BY created_at DESC LIMIT 1`,
        [`%"idempotencyKey":"${idempotencyKey}"%`]
      );
      if (existing.rows.length > 0) {
        return { success: true, idempotent: true };
      }
    }

    await dbQuery(
      `INSERT INTO watchdog_state (user_id, last_fed_at, dog_state, updated_at)
       VALUES ($1, CURRENT_TIMESTAMP, 'ACTIVE', CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET 
         last_fed_at = CURRENT_TIMESTAMP,
         dog_state = 'ACTIVE',
         updated_at = CURRENT_TIMESTAMP`,
      [userId]
    );

    await logAudit('WATCHDOG_FED', { userId, idempotencyKey, timestamp: new Date().toISOString() });

    console.log(`[WATCHDOG] ✅ Dog feed recorded for user ${userId}`);
    return { success: true, idempotent: false };
  } catch (err) {
    console.error('[WATCHDOG] recordWatchDogFeed error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Freeze account due to detected anomaly
 */
async function freezeAccount(userId, reason) {
  console.error(`[WATCHDOG] 🔒 FREEZING ACCOUNT ${userId} reason: ${reason}`);

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO watchdog_state (user_id, is_frozen, frozen_reason, updated_at)
         VALUES ($1, 1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE SET 
           is_frozen = 1, 
           frozen_reason = $2,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, reason]
      );

      await client.query(
        `INSERT INTO audit_log (type, payload) VALUES ($1, $2)`,
        ['ACCOUNT_FROZEN', JSON.stringify({ userId, reason, timestamp: new Date().toISOString() })]
      );

      await client.query('COMMIT');
      console.error(`[WATCHDOG] 🔒 Account ${userId} FROZEN`);
    } catch (err) {
      try { await client.query('ROLLBACK') } catch (_) {}
      console.error('[WATCHDOG] freezeAccount error:', err);
    } finally {
      if (typeof client.release === 'function') client.release();
    }
  } catch (err) {
    console.error('[WATCHDOG] freezeAccount outer error:', err);
  }
}

/**
 * Check if user can perform operations
 */
async function canUserOperate(userId) {
  const state = await getWatchDogState(userId);

  if (state.isFrozen) {
    return { allowed: false, reason: 'ACCOUNT_FROZEN', frozenReason: state.frozenReason };
  }

  if (state.dogState === 'SLEEPING' || state.dogState === 'DEAD') {
    return { allowed: false, reason: `WATCHDOG_${state.dogState}`, lastFedAt: state.lastFedAt };
  }

  return { allowed: true, reason: null };
}

/**
 * Write to audit log
 */
async function logAudit(type, payload) {
  try {
    await dbQuery(
      `INSERT INTO audit_log (type, payload) VALUES ($1, $2)`,
      [type, JSON.stringify(payload)]
    );
  } catch (err) {
    console.error('[WATCHDOG] logAudit error:', err);
  }
}

/**
 * Run full system observation report (admin only)
 * Does NOT modify any balances.
 */
async function runFullSystemObservation() {
  console.log('[WATCHDOG] Starting full system observation...');

  try {
    const result = await dbQuery('SELECT id FROM users');
    const users = result.rows.map(r => r.id);

    console.log(`[WATCHDOG] Observing ${users.length} users...`);

    let frozen = 0;
    const sleeping = [];

    for (const userId of users) {
      await updateDogStateByTime(userId);
      const state = await getWatchDogState(userId);
      if (state.isFrozen) frozen++;
      if (state.dogState === 'SLEEPING' || state.dogState === 'DEAD') sleeping.push(userId);
    }

    console.log(`[WATCHDOG] Observation complete. Frozen: ${frozen}, Sleeping/Dead: ${sleeping.length}`);
    return { usersChecked: users.length, frozen, sleeping };
  } catch (err) {
    console.error('[WATCHDOG] Full observation failed:', err);
    return { error: err.message };
  }
}

export const WatchDogGuardian = {
  // Observation (no balance writes)
  observeACCEvent,
  updateDogStateByTime,

  // State management
  getWatchDogState,
  updateWatchDogState,

  // Feed recording (ACC handles the deduction)
  recordWatchDogFeed,

  // Security
  freezeAccount,
  canUserOperate,

  // Admin
  runFullSystemObservation
};

export default WatchDogGuardian;
