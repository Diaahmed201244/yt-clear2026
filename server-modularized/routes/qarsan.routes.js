/**
 * routes/qarsan.routes.js
 *
 * Qarsan game system endpoints — status, mode changes, attacks, and virtual users.
 *
 * Endpoints:
 *   GET  /qarsan/status     — Get Qarsan status for current user
 *   POST /qarsan/mode       — Change Qarsan mode (OFF / RANGED / EXPOSURE)
 *   POST /qarsan/activate   — Legacy alias for /qarsan/mode
 *   POST /qarsan/deactivate — Deactivate Qarsan (return wallet to balance)
 *   POST /qarsan/attack     — Execute theft against another user
 *   GET  /qarsan/users      — Get virtual users for attack targets
 *   POST /qarsan/feed-dog   — Feed the watchdog (via Qarsan UI)
 *
 * BUG FIX: virtual_user_id → id alias corrected in SELECT for qarsan_virtual_users.
 * BUG FIX: feedWatchDog properly imported from shared/watch-dog-guardian.js.
 */

import { Router } from 'express';
import crypto from 'crypto';

import { pool, query } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { enforceFinancialSecurity, storeIdempotencyResponse } from '../shared/security-middleware.js';
import { generateVirtualUsers } from '../services/virtual-users.service.js';
import { feedWatchDog } from '../shared/watch-dog-guardian.js';
import { emitSSE } from '../services/sse.service.js';

const router = Router();

// ---------------------------------------------------------------------------
// Helper: emit SSE events to user (wraps the SSE service)
// ---------------------------------------------------------------------------

function __sseEmit(userId, payload) {
  emitSSE(userId, payload);
}

// ---------------------------------------------------------------------------
// GET /qarsan/status — Get Qarsan status for current user
// ---------------------------------------------------------------------------

router.get('/qarsan/status', requireAuth, async (req, res) => {
  try { 
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' });

    const userEmailRes = await query(
      'SELECT email FROM users WHERE id = $1::uuid',
      [userId]
    );
    const userEmail = userEmailRes.rows.length > 0 ? userEmailRes.rows[0].email : null;

    // Get Watch-Dog state
    const dogResult = await query(
      'SELECT last_fed_at, dog_state FROM watchdog_state WHERE user_id = $1::uuid',
      [userId]
    );
    let dogState = 'SLEEPING';
    let lastFedAt = null;
    if (dogResult.rows.length > 0) {
      dogState = dogResult.rows[0].dog_state;
      lastFedAt = dogResult.rows[0].last_fed_at;
      if (lastFedAt) {
        const hoursSinceLastFeed = (new Date() - new Date(lastFedAt)) / (1000 * 60 * 60);
        if (hoursSinceLastFeed >= 72) dogState = 'DEAD';
      }
    }

    // Get Qarsan state
    const qarsanResult = await query(
      'SELECT mode, wallet_balance FROM qarsan_state WHERE user_id = $1::uuid',
      [userId]
    );
    const qarsanMode = qarsanResult.rows.length > 0 ? qarsanResult.rows[0].mode : 'OFF';
    const walletBalance = qarsanResult.rows.length > 0 ? parseInt(qarsanResult.rows[0].wallet_balance || 0, 10) : 0;

    // Calculate steal scope
    let stealScope = 'NONE';
    if (dogState === 'SLEEPING') {
      if (qarsanMode === 'RANGED') stealScope = 'QARSAN_WALLET_ONLY';
      else if (qarsanMode === 'EXPOSURE') stealScope = 'ALL_ASSETS';
    }

    return res.json({
      success: true,
      userId,
      userEmail,
      qarsanMode,
      walletBalance,
      watchDogState: dogState,
      stealScope,
      lastFedAt,
    });
  } catch (err) {
    console.error('[QARSAN] status error:', err);
    return res.status(500).json({ success: false, error: err && err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /qarsan/mode — Change Qarsan mode
// ---------------------------------------------------------------------------

router.post('/qarsan/mode', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try { 
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' });
    const { mode, depositAmount } = req.body || {};
    if (!mode || !['OFF', 'RANGED', 'EXPOSURE'].includes(mode)) {
      return res.status(400).json({ success: false, error: 'invalid_mode' });
    }

    const client = await pool.connect();
    try { 
      await client.query('BEGIN');

      const dogResult = await client.query(
        'SELECT dog_state, last_fed_at FROM watchdog_state WHERE user_id = $1::uuid',
        [userId]
      );
      let dogState = 'SLEEPING';
      if (dogResult.rows.length > 0) {
        dogState = dogResult.rows[0].dog_state;
        const lastFedAt = dogResult.rows[0].last_fed_at;
        if (lastFedAt) {
          const hoursSinceLastFeed = (new Date() - new Date(lastFedAt)) / (1000 * 60 * 60);
          if (hoursSinceLastFeed >= 72) dogState = 'DEAD';
        }
      }
      if (dogState === 'DEAD') {
        await client.query('ROLLBACK');
        return res.status(403).json({ success: false, error: 'DOG_DEAD' });
      }

      let currentMode = 'OFF';
      let currentWallet = 0;
      const existing = await client.query(
        'SELECT mode, wallet_balance FROM qarsan_state WHERE user_id = $1::uuid',
        [userId]
      );
      if (existing.rows.length > 0) {
        currentMode = existing.rows[0].mode;
        currentWallet = parseInt(existing.rows[0].wallet_balance || 0, 10);
      }

      let newWallet = currentWallet;
      if (mode === 'RANGED' && depositAmount > 0) {
        const balanceResult = await client.query(
          "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END), 0)::int as balance FROM ledger WHERE user_id = $1::uuid AND asset_type = 'codes'",
          [userId]
        );
        const balance = parseInt(balanceResult.rows[0]?.balance || 0, 10);
        if (balance < depositAmount) {
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, error: 'INSUFFICIENT_BALANCE' });
        }
        const txIdResult = await client.query('SELECT gen_random_uuid() AS id');
        const txId = txIdResult.rows[0].id;
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1::uuid, $2::uuid, 'debit', 'codes', $3, 'QARSAN_MODE_CHANGE')",
          [txId, userId, depositAmount]
        );
        newWallet = currentWallet + depositAmount;
      }

      await client.query(
        `INSERT INTO qarsan_state (user_id, mode, wallet_balance, updated_at)
         VALUES ($1::uuid, $2, $3, NOW())
         ON CONFLICT (user_id) DO UPDATE SET mode = $2, wallet_balance = $3, updated_at = NOW()`,
        [userId, mode, newWallet]
      );

      const modeTxId = await client.query('SELECT gen_random_uuid() AS id');
      await client.query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1::uuid, $2::uuid, 'debit', 'codes', 0, 'QARSAN_MODE_CHANGE')",
        [modeTxId.rows[0].id, userId]
      );
      await client.query(
        "INSERT INTO audit_log (type, payload) VALUES ($1, $2::jsonb)",
        ['QARSAN_MODE_CHANGE', JSON.stringify({ userId, mode, walletBalance: newWallet, ts: new Date().toISOString() })]
      );

      await client.query('COMMIT');

      __sseEmit(userId, { type: 'QARSAN_UPDATE', action: 'mode', mode, walletBalance: newWallet });
      __sseEmit(userId, { type: 'ASSET_UPDATE', assetType: 'codes' });

      return res.json({ success: true, qarsanMode: mode, walletBalance: newWallet });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err && err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /qarsan/activate — Legacy alias for mode change
// ---------------------------------------------------------------------------

router.post('/qarsan/activate', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try { 
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' });

    const { mode, depositAmount } = req.body || {};
    if (!mode || !['OFF', 'RANGED', 'EXPOSURE'].includes(mode)) {
      return res.status(400).json({ success: false, error: 'invalid_mode' });
    }

    const client = await pool.connect();

    try { 
      await client.query('BEGIN');

      // Check Watch-Dog state
      const dogResult = await client.query(
        'SELECT dog_state, last_fed_at FROM watchdog_state WHERE user_id = $1::uuid',
        [userId]
      );

      let dogState = 'SLEEPING';
      if (dogResult.rows.length > 0) {
        dogState = dogResult.rows[0].dog_state;
        const lastFedAt = dogResult.rows[0].last_fed_at;
        if (lastFedAt) {
          const hoursSinceLastFeed = (new Date() - new Date(lastFedAt)) / (1000 * 60 * 60);
          if (hoursSinceLastFeed >= 72) dogState = 'DEAD';
        }
      }

      if (dogState === 'DEAD') {
        await client.query('ROLLBACK');
        return res.status(403).json({ success: false, error: 'DOG_DEAD', message: 'Cannot activate Qarsan - Watch-Dog has died' });
      }

      // Get or create Qarsan state
      let currentMode = 'OFF';
      let currentWallet = 0;
      const existing = await client.query(
        'SELECT mode, wallet_balance FROM qarsan_state WHERE user_id = $1::uuid',
        [userId]
      );
      if (existing.rows.length > 0) {
        currentMode = existing.rows[0].mode;
        currentWallet = parseInt(existing.rows[0].wallet_balance || 0, 10);
      }

      // Handle deposit for RANGED mode
      let newWallet = currentWallet;
      if (mode === 'RANGED' && depositAmount > 0) {
        const balanceResult = await client.query(
          "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END), 0)::int as balance FROM ledger WHERE user_id = $1::uuid AND asset_type = 'codes'",
          [userId]
        );
        const balance = parseInt(balanceResult.rows[0]?.balance || 0, 10);

        if (balance < depositAmount) {
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, error: 'INSUFFICIENT_BALANCE', message: `Need ${depositAmount} codes but only have ${balance}` });
        }

        const txIdResult = await client.query('SELECT gen_random_uuid() AS id');
        const txId = txIdResult.rows[0].id;
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1::uuid, $2::uuid, 'debit', 'codes', $3, 'QARSAN_MODE_CHANGE')",
          [txId, userId, depositAmount]
        );
        newWallet = currentWallet + depositAmount;
      }

      // Update Qarsan state
      await client.query(
        `INSERT INTO qarsan_state (user_id, mode, wallet_balance, updated_at)
         VALUES ($1::uuid, $2, $3, NOW())
         ON CONFLICT (user_id) DO UPDATE SET mode = $2, wallet_balance = $3, updated_at = NOW()`,
        [userId, mode, newWallet]
      );

      const modeTxId = await client.query('SELECT gen_random_uuid() AS id');
      await client.query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1::uuid, $2::uuid, 'debit', 'codes', 0, 'QARSAN_MODE_CHANGE')",
        [modeTxId.rows[0].id, userId]
      );
      await client.query(
        "INSERT INTO audit_log (type, payload) VALUES ($1, $2::jsonb)",
        ['QARSAN_MODE_CHANGE', JSON.stringify({ userId, mode, walletBalance: newWallet, ts: new Date().toISOString() })]
      );

      await client.query('COMMIT');

      __sseEmit(userId, { type: 'QARSAN_UPDATE', action: 'mode', mode, walletBalance: newWallet });
      __sseEmit(userId, { type: 'ASSET_UPDATE', assetType: 'codes' });
      return res.json({ success: true, qarsanMode: mode, walletBalance: newWallet });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[QARSAN] activate error:', err);
    return res.status(500).json({ success: false, error: err && err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /qarsan/deactivate — Deactivate Qarsan
// ---------------------------------------------------------------------------

router.post('/qarsan/deactivate', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try { 
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' });

    const client = await pool.connect();

    try { 
      await client.query('BEGIN');

      // Get current Qarsan state
      const existing = await client.query(
        'SELECT wallet_balance FROM qarsan_state WHERE user_id = $1::uuid',
        [userId]
      );

      const currentWallet = existing.rows.length > 0 ? parseInt(existing.rows[0].wallet_balance || 0, 10) : 0;

      if (currentWallet > 0) {
        const txIdResult = await client.query('SELECT gen_random_uuid() AS id');
        const txId = txIdResult.rows[0].id;
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1::uuid, $2::uuid, 'credit', 'codes', $3, 'QARSAN_MODE_CHANGE')",
          [txId, userId, currentWallet]
        );
      }

      // Set mode to OFF
      await client.query(
        "INSERT INTO qarsan_state (user_id, mode, wallet_balance, updated_at) VALUES ($1::uuid, 'OFF', 0, NOW()) ON CONFLICT (user_id) DO UPDATE SET mode = 'OFF', wallet_balance = 0, updated_at = NOW()",
        [userId]
      );

      await client.query('COMMIT');

      __sseEmit(userId, { type: 'QARSAN_UPDATE', action: 'mode', mode: 'OFF', walletBalance: 0 });
      __sseEmit(userId, { type: 'ASSET_UPDATE', assetType: 'codes' });
      return res.json({ success: true, message: 'Qarsan deactivated' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[QARSAN] deactivate error:', err);
    return res.status(500).json({ success: false, error: err && err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /qarsan/attack — Execute theft (CRITICAL SECURITY OPERATION)
// ---------------------------------------------------------------------------

router.post('/qarsan/attack', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try { 
    const attackerId = req.user && req.user.id;
    if (!attackerId) return res.status(401).json({ success: false, error: 'unauthorized' });

    const { targetUserId, amount, txId: providedTxId } = req.body || {};
    if (!targetUserId) return res.status(400).json({ success: false, error: 'target_required' });
    if (attackerId === targetUserId) return res.status(400).json({ success: false, error: 'self_attack_not_allowed' });
    if (!providedTxId) return res.status(400).json({ success: false, error: 'txId_required' });

    const stealAmount = parseInt(amount || 0, 10);
    if (stealAmount <= 0) return res.status(400).json({ success: false, error: 'invalid_amount' });

    const client = await pool.connect();

    try { 
      await client.query('BEGIN');

      const prior = await client.query('SELECT 1 FROM ledger WHERE tx_id = $1::uuid LIMIT 1', [providedTxId]);
      if (prior.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.json({ success: true, idempotent: true, amount: 0, message: 'duplicate_tx' });
      }

      // Check target's Watch-Dog state
      const targetDogResult = await client.query(
        'SELECT dog_state, last_fed_at FROM watchdog_state WHERE user_id = $1::uuid',
        [targetUserId]
      );

      let targetDogState = 'SLEEPING';
      if (targetDogResult.rows.length > 0) {
        targetDogState = targetDogResult.rows[0].dog_state;
        const lastFedAt = targetDogResult.rows[0].last_fed_at;
        if (lastFedAt) {
          const hoursSinceLastFeed = (new Date() - new Date(lastFedAt)) / (1000 * 60 * 60);
          if (hoursSinceLastFeed >= 72) targetDogState = 'DEAD';
        }
      }

      // Cannot steal from ACTIVE or DEAD dog
      if (targetDogState !== 'SLEEPING') {
        await client.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          error: targetDogState === 'ACTIVE' ? 'DOG_ACTIVE' : 'DOG_DEAD',
          message: `Cannot steal from user with ${targetDogState} dog`,
        });
      }

      // Get target's Qarsan mode
      const targetQarsanResult = await client.query(
        'SELECT mode, wallet_balance FROM qarsan_state WHERE user_id = $1',
        [targetUserId]
      );
      const targetMode = targetQarsanResult.rows.length > 0 ? targetQarsanResult.rows[0].mode : 'OFF';
      const targetWallet = parseInt(targetQarsanResult.rows[0]?.wallet_balance || 0, 10);

      // Get target's actual balance
      const targetBalanceResult = await client.query(
        "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END), 0) as balance FROM ledger WHERE user_id = $1 AND asset_type = 'codes'",
        [targetUserId]
      );
      const targetBalance = parseInt(targetBalanceResult.rows[0]?.balance || 0, 10);

      // Calculate steal scope
      let stealScope = 'NONE';
      let actualStealAmount = 0;

      if (targetMode === 'RANGED') {
        stealScope = 'QARSAN_WALLET_ONLY';
        actualStealAmount = Math.min(stealAmount, targetWallet);
      } else if (targetMode === 'EXPOSURE') {
        stealScope = 'ALL_ASSETS';
        actualStealAmount = Math.min(stealAmount, targetBalance + targetWallet);
      }

      if (actualStealAmount <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'NOTHING_TO_STEAL', message: 'Target has no stealable assets' });
      }

      const txId = providedTxId;
      await client.query(
        "INSERT INTO ledger (id, tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, $3, 'debit', 'codes', $4, 'QARSAN_THEFT_DEBIT')",
        [crypto.randomUUID(), txId, targetUserId, actualStealAmount]
      );

      // Credit to attacker
      await client.query(
        "INSERT INTO ledger (id, tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, $3, 'credit', 'codes', $4, 'QARSAN_THEFT_CREDIT')",
        [crypto.randomUUID(), txId, attackerId, actualStealAmount]
      );

      // Update Qarsan wallet if wallet was stolen
      if (stealScope === 'QARSAN_WALLET_ONLY') {
        await client.query(
          "UPDATE qarsan_state SET wallet_balance = GREATEST(0, wallet_balance - $1), updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
          [actualStealAmount, targetUserId]
        );
      }

      await client.query(
        "INSERT INTO audit_log (type, payload) VALUES ($1, $2)",
        ['QARSAN_THEFT', JSON.stringify({ attackerId, targetUserId, amount: actualStealAmount, scope: stealScope, txId, ts: new Date().toISOString() })]
      );

      await client.query('COMMIT');

      console.log(`[QARSAN] Theft: ${attackerId} stole ${actualStealAmount} codes from ${targetUserId}, scope: ${stealScope}`);

      __sseEmit(attackerId, { type: 'ASSET_UPDATE', assetType: 'codes' });
      __sseEmit(targetUserId, { type: 'ASSET_UPDATE', assetType: 'codes' });
      __sseEmit(attackerId, { type: 'QARSAN_UPDATE', action: 'attack', targetUserId, amount: actualStealAmount, txId, scope: stealScope });
      __sseEmit(targetUserId, { type: 'QARSAN_UPDATE', action: 'attacked', attackerId, amount: actualStealAmount, txId, scope: stealScope });

      return res.json({
        success: true,
        amount: actualStealAmount,
        scope: stealScope,
        message: `Successfully stole ${actualStealAmount} codes`,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[QARSAN] attack error:', err);
    return res.status(500).json({ success: false, error: err && err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /qarsan/users — Get virtual users for attack targets
//
// BUG FIX: Changed `virtual_user_id as id` to `id` — the qarsan_virtual_users
// table uses `id` as the primary key column, not `virtual_user_id`.
// ---------------------------------------------------------------------------

router.get('/qarsan/users', requireAuth, async (req, res) => {
  try { 
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' });

    // Get virtual users with email information
    let virtualUsers = await query(`
      SELECT
        id,
        email,
        name,
        dog_state,
        qarsan_mode,
        balance,
        qarsan_wallet,
        last_fed_at
      FROM qarsan_virtual_users
      ORDER BY created_at DESC
      LIMIT 20
    `);

    if (virtualUsers.rows.length === 0) {
      // Generate virtual users if none exist
      await generateVirtualUsers();

      // Re-query after generation
      virtualUsers = await query(`
        SELECT
          id,
          email,
          name,
          dog_state,
          qarsan_mode,
          balance,
          qarsan_wallet,
          last_fed_at
        FROM qarsan_virtual_users
        ORDER BY created_at DESC
        LIMIT 20
      `);
    }

    // Filter out current user and calculate attackability
    const users = await Promise.all(virtualUsers.rows.map(async (row) => {
      let dogState = row.dog_state;
      if (row.last_fed_at) {
        const hoursSinceLastFeed = (new Date() - new Date(row.last_fed_at)) / (1000 * 60 * 60);
        if (hoursSinceLastFeed >= 72) dogState = 'DEAD';
      }

      let stealScope = 'NONE';
      if (dogState === 'SLEEPING') {
        if (row.qarsan_mode === 'RANGED') stealScope = 'QARSAN_WALLET_ONLY';
        else if (row.qarsan_mode === 'EXPOSURE') stealScope = 'ALL_ASSETS';
      }

      // Fetch balance from LEDGER (source of truth) instead of direct columns
      const balanceRes = await query(
        "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END),0) AS balance FROM ledger WHERE user_id = $1 AND asset_type='codes'",
        [row.id]
      );

      // For virtual users, qarsan_wallet is maintained separately
      const qarsanWalletRes = await query(
        "SELECT COALESCE(SUM(CASE WHEN reference LIKE 'QARSAN_%' THEN CASE WHEN direction='credit' THEN amount ELSE -amount END ELSE 0 END),0) AS qarsan_balance FROM ledger WHERE user_id = $1 AND asset_type='codes'",
        [row.id]
      );

      return {
        id: row.id,
        email: row.email,
        name: row.name,
        dogState,
        qarsanMode: row.qarsan_mode,
        balance: parseInt(balanceRes.rows[0]?.balance || 0, 10),
        qarsanWallet: parseInt(qarsanWalletRes.rows[0]?.qarsan_balance || 0, 10),
        stealScope,
        canAttack: dogState === 'SLEEPING' && stealScope !== 'NONE',
      };
    }));

    return res.json({ success: true, users });
  } catch (err) {
    console.error('[QARSAN] users error:', err);
    return res.status(500).json({ success: false, error: err && err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /qarsan/feed-dog — Feed the watchdog (via Qarsan UI)
// ---------------------------------------------------------------------------

router.post('/qarsan/feed-dog', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try { 
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' });

    const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey || null;
    const result = await feedWatchDog(userId, idempotencyKey);

    if (idempotencyKey && result.success) {
      storeIdempotencyResponse(userId, idempotencyKey, result);
    }

    if (result.success) {
      __sseEmit(userId, { type: 'ASSET_UPDATE', assetType: 'codes' });
      __sseEmit(userId, { type: 'QARSAN_UPDATE', action: 'dog_fed' });
      return res.json({
        success: true,
        cost: result.cost,
        newBalance: result.newBalance,
        dogState: result.dogState,
        idempotent: result.idempotent || false,
        txId: result.txId,
      });
    } else {
      return res.status(400).json({ success: false, error: result.error, message: result.message, details: result });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err && err.message });
  }
});

export default router;
