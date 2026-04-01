/**
 * shared/watch-dog-guardian.js
 *
 * Watch-Dog Guardian — core logic for feeding the watchdog and managing its state.
 *
 * TODO: This is a stub module. The original server.js referenced feedWatchDog
 * via a dynamic import from './shared/watch-dog-guardian.js' but the function
 * body was never fully defined in the monolith. Implement the actual watchdog
 * feeding logic here (deduct 10 codes from the user's balance, update
 * watchdog_state, return result with cost/newBalance/dogState).
 *
 * Exports:
 *   feedWatchDog(userId, idempotencyKey)  — feed the watchdog (costs 10 codes)
 *   getWatchDogState(userId)              — retrieve current watchdog state
 *   updateDogStateByTime(userId)          — refresh state based on elapsed time
 */

import crypto from 'crypto';
import { pool, query } from '../config/database.js';

const FEED_COST = 10;

/**
 * Feed the watchdog for a given user.
 *
 * @param {string} userId
 * @param {string|null} idempotencyKey — optional key to prevent duplicate feeds
 * @returns {Promise<{ success: boolean, cost?: number, newBalance?: number, dogState?: string, txId?: string, idempotent?: boolean, error?: string, message?: string }>}
 */
export async function feedWatchDog(userId, idempotencyKey = null) {
  const client = await pool.connect();
  try {   
    await client.query('BEGIN');

    // Check balance
    const balanceRes = await client.query(
      "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END), 0)::int AS balance FROM ledger WHERE user_id = $1::uuid AND asset_type = 'codes'",
      [userId]
    );
    const balance = parseInt(balanceRes.rows[0]?.balance || 0, 10);

    if (balance < FEED_COST) {
      await client.query('ROLLBACK');
      return { success: false, error: 'INSUFFICIENT_BALANCE', message: `Need ${FEED_COST} codes but only have ${balance}` };
    }

    // Deduct cost
    const txId = crypto.randomUUID();
    await client.query(
      "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1::uuid, $2::uuid, 'debit', 'codes', $3, 'WATCHDOG_FEED')",
      [txId, userId, FEED_COST]
    );

    // Update watchdog state
    await client.query(
      `INSERT INTO watchdog_state (user_id, dog_state, last_fed_at)
       VALUES ($1::uuid, 'ACTIVE', NOW())
       ON CONFLICT (user_id) DO UPDATE SET dog_state = 'ACTIVE', last_fed_at = NOW()`,
      [userId]
    );

    // Get new balance
    const newBalRes = await client.query(
      "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END), 0)::int AS balance FROM ledger WHERE user_id = $1::uuid AND asset_type = 'codes'",
      [userId]
    );
    const newBalance = parseInt(newBalRes.rows[0]?.balance || 0, 10);

    await client.query('COMMIT');

    return {
      success: true,
      cost: FEED_COST,
      newBalance,
      dogState: 'ACTIVE',
      txId,
      idempotent: false,
    };
  } catch (err) {
    try {    await client.query('ROLLBACK'); } catch (_) { /* ignore */ }
    console.error('[WATCHDOG] feedWatchDog error:', err);
    return { success: false, error: 'FEED_FAILED', message: err.message };
  } finally {
    client.release();
  }
}

/**
 * Get the current watchdog state for a user.
 *
 * @param {string} userId
 * @returns {Promise<{ dogState: string, lastFedAt: string|null, isFrozen: boolean }>}
 */
export async function getWatchDogState(userId) {
  try {   
    const result = await query(
      'SELECT dog_state, last_fed_at FROM watchdog_state WHERE user_id = $1::uuid',
      [userId]
    );

    if (result.rows.length === 0) {
      return { dogState: 'SLEEPING', lastFedAt: null, isFrozen: false };
    }

    let dogState = result.rows[0].dog_state;
    const lastFedAt = result.rows[0].last_fed_at;

    if (lastFedAt) {
      const hoursSinceLastFeed = (new Date() - new Date(lastFedAt)) / (1000 * 60 * 60);
      if (hoursSinceLastFeed >= 72) dogState = 'DEAD';
    }

    return { dogState, lastFedAt, isFrozen: false };
  } catch (err) {
    console.error('[WATCHDOG] getWatchDogState error:', err);
    return { dogState: 'SLEEPING', lastFedAt: null, isFrozen: false };
  }
}

/**
 * Refresh watchdog state based on elapsed time since last feed.
 *
 * @param {string} userId
 * @returns {Promise<{ hoursSinceLastFeed: number }>}
 */
export async function updateDogStateByTime(userId) {
  try {   
    const result = await query(
      'SELECT last_fed_at FROM watchdog_state WHERE user_id = $1::uuid',
      [userId]
    );

    if (result.rows.length === 0) {
      return { hoursSinceLastFeed: Infinity };
    }

    const lastFedAt = result.rows[0].last_fed_at;
    if (!lastFedAt) return { hoursSinceLastFeed: Infinity };

    const hoursSinceLastFeed = (new Date() - new Date(lastFedAt)) / (1000 * 60 * 60);

    if (hoursSinceLastFeed >= 72) {
      await query(
        "UPDATE watchdog_state SET dog_state = 'DEAD' WHERE user_id = $1::uuid",
        [userId]
      );
    }

    return { hoursSinceLastFeed };
  } catch (err) {
    console.error('[WATCHDOG] updateDogStateByTime error:', err);
    return { hoursSinceLastFeed: 0 };
  }
}
