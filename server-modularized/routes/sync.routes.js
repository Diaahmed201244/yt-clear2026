/**
 * routes/sync.routes.js
 *
 * Server-authoritative delta sync endpoint. Accepts client-side deltas
 * (codes earned, silver/gold gained) and atomically applies them to the
 * user's balance inside a database transaction.
 *
 * Endpoints:
 *   POST /sync — Apply delta sync and return updated balances
 *
 * BUG FIXES (CRITICAL):
 *   - Added `const client = await pool.connect()` — original NEVER created
 *     the client but attempted to use it, causing a ReferenceError at runtime.
 *   - Added `client.release()` in a `finally` block to prevent connection leaks.
 *   - Removed unreachable `return res.json(...)` after the inner try-catch
 *     (the successful return already happens inside the try block).
 */

import { Router } from 'express';
import crypto from 'crypto';

import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ---------------------------------------------------------------------------
// POST /sync — Server-authoritative delta sync
// ---------------------------------------------------------------------------

router.post('/sync', requireAuth, async (req, res) => {
  // BUG FIX (CRITICAL): acquire a client from the pool — original forgot this
  const client = await pool.connect();
  try {
    const { delta_codes, delta_silver, delta_gold, sync_id } = req.body || {};
    const userId = req.user.id;

    console.log(
      `[SYNC REQUEST] User: ${userId}, SyncID: ${sync_id}, Deltas: C:${delta_codes} S:${delta_silver} G:${delta_gold}`
    );

    if (!sync_id) {
      return res.status(400).json({ status: 'failed', error: 'Missing sync_id' });
    }

    // 1. Idempotency check
    const existingEvent = await client.query(
      'SELECT id FROM sync_events WHERE id = $1',
      [sync_id]
    );

    if (existingEvent.rows.length > 0) {
      console.log(`[SYNC DUPLICATE] SyncID ${sync_id} already applied. Returning current balance.`);
      const balanceRes = await client.query(
        'SELECT codes_count, silver_count, gold_count FROM users WHERE id = $1',
        [userId]
      );
      const row = balanceRes.rows[0] || { codes_count: 0, silver_count: 0, gold_count: 0 };
      return res.json({
        status: 'success',
        synced_at: Date.now(),
        codes: Number(row.codes_count),
        silver: Number(row.silver_count),
        gold: Number(row.gold_count),
      });
    }

    // 2. Validate delta limits
    const dCodes = Number(delta_codes || 0);
    const dSilver = Number(delta_silver || 0);
    const dGold = Number(delta_gold || 0);

    if (dCodes > 100 || dSilver > 20 || dGold > 10) {
      console.warn(`[SYNC REJECTED] Delta limits exceeded for user ${userId}`);
      return res.status(400).json({ status: 'failed', error: 'Delta limits exceeded' });
    }

    if (dCodes < 0 || dSilver < 0 || dGold < 0) {
      return res.status(400).json({ status: 'failed', error: 'Negative deltas not allowed' });
    }

    console.log(`[SYNC VALIDATED] User: ${userId}, Deltas approved.`);

    // 3. Atomic transaction: record event + update balances
    await client.query('BEGIN');
    try {
      // Store sync event for idempotency
      await client.query(
        'INSERT INTO sync_events (id, user_id, delta_codes, delta_silver, delta_gold) VALUES ($1, $2, $3, $4, $5)',
        [sync_id, userId, dCodes, dSilver, dGold]
      );

      // Update user balances (server-authoritative)
      const updateRes = await client.query(
        'UPDATE users SET codes_count = COALESCE(codes_count, 0) + $1, silver_count = COALESCE(silver_count, 0) + $2, gold_count = COALESCE(gold_count, 0) + $3, last_sync_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING codes_count, silver_count, gold_count',
        [dCodes, dSilver, dGold, userId]
      );

      // Also update the balances table to stay in sync
      await client.query(
        'INSERT INTO balances (user_id, codes_count, silver_count, gold_count, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO UPDATE SET codes_count = balances.codes_count + $2, silver_count = balances.silver_count + $3, gold_count = balances.gold_count + $4, updated_at = CURRENT_TIMESTAMP',
        [userId, dCodes, dSilver, dGold]
      );

      // Record ledger entries
      if (dCodes > 0) {
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'codes', $3, 'sync')",
          [crypto.randomUUID(), userId, dCodes]
        );
      }
      if (dSilver > 0) {
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'silver', $3, 'sync')",
          [crypto.randomUUID(), userId, dSilver]
        );
      }
      if (dGold > 0) {
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'gold', $3, 'sync')",
          [crypto.randomUUID(), userId, dGold]
        );
      }

      await client.query('COMMIT');

      const row = updateRes.rows[0] || { codes_count: 0, silver_count: 0, gold_count: 0 };
      console.log(
        `[SYNC APPLIED] User ${userId} new counts: codes=${row.codes_count}, silver=${row.silver_count}, gold=${row.gold_count}`
      );

      return res.json({
        status: 'success',
        synced_at: Date.now(),
        codes: Number(row.codes_count),
        silver: Number(row.silver_count),
        gold: Number(row.gold_count),
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
    // BUG FIX: Removed unreachable `return res.json(...)` that was after this try-catch
  } catch (err) {
    console.error('[SYNC ERROR]:', err);
    return res.status(500).json({ status: 'failed', error: err.message });
  } finally {
    // BUG FIX: Always release the client back to the pool
    client.release();
  }
});

export default router;
