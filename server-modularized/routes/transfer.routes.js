/**
 * routes/transfer.routes.js
 *
 * Transfer-related endpoints — unified asset transfer and rewards transfer.
 *
 * Endpoints:
 *   POST /transfer          — Production-grade unified transfer (codes/silver/gold)
 *   POST /rewards/transfer  — Rewards transfer (codes only, with retry logic)
 *
 * BUG FIX: In /rewards/transfer, the database client is ALWAYS released in the
 * finally block. The original code only released when attempt >= MAX_RETRIES,
 * causing connection pool leaks on successful transfers.
 */

import { Router } from 'express';
import crypto from 'crypto';

import { pool, query } from '../config/database.js';
import {
  requireAuth,
  readSessionFromCookie,
  sqliteFindUserByEmail,
} from '../middleware/auth.js';
import { transferLimiter } from '../middleware/rate-limit.js';
import { enforceFinancialSecurity } from '../shared/security-middleware.js';
import WatchdogAI from '../services/watchdog-ai.js';

const router = Router();

// ---------------------------------------------------------------------------
// POST /transfer — Production-grade unified transfer
// ---------------------------------------------------------------------------

router.post('/transfer', requireAuth, transferLimiter, enforceFinancialSecurity, async (req, res) => {
  const client = await pool.connect();
  const { transactionId, receiverEmail, codes, type } = req.body || {};
  const fromUserId = req.user.id;
  const assetType = type || 'codes';
  const amount = Array.isArray(codes) ? codes.length : 0;

  // 1. HARD VALIDATION: AUTH STATUS
  if (!req.user || !req.user.id) {
    console.error(`[AUDIT] [FAIL] [UNAUTHENTICATED] attempt from IP: ${req.ip}`);
    return res.status(401).json({ success: false, error: 'UNAUTHENTICATED', status: 'unauthenticated' });
  }

  if (!transactionId) return res.status(400).json({ success: false, error: 'MISSING_TRANSACTION_ID' });
  if (!receiverEmail) return res.status(400).json({ success: false, error: 'MISSING_RECEIVER' });
  if (amount <= 0) return res.status(400).json({ success: false, error: 'NO_ASSETS_PROVIDED' });

  // WATCHDOG AI RISK ANALYSIS
  const riskAnalysis = WatchdogAI.evaluateRisk(fromUserId);
  if (riskAnalysis.decision !== 'ALLOW') {
    console.warn(`[AUDIT] [WATCHDOG_BLOCK] user=${fromUserId} | decision=${riskAnalysis.decision} | reason=${riskAnalysis.reasons}`);
    return res.status(403).json({
      success: false,
      error: 'SECURITY_RESTRICTION',
      decision: riskAnalysis.decision,
      message: riskAnalysis.decision === 'FREEZE'
        ? 'Your account is temporarily in a cool-down period. Please wait a few minutes.'
        : 'Your request was flagged for security review.',
    });
  }

  try {   
    const receiver = await sqliteFindUserByEmail(receiverEmail);
    if (!receiver || !receiver.id) {
      console.warn(`[AUDIT] [FAIL] [RECEIVER_NOT_FOUND] sender=${fromUserId} receiverEmail=${receiverEmail}`);
      return res.status(404).json({ success: false, error: 'RECEIVER_NOT_FOUND' });
    }
    const toUserId = receiver.id;

    if (fromUserId === toUserId) {
      console.warn(`[AUDIT] [FRAUD_FLAG] [SELF_TRANSFER] user=${fromUserId}`);
      return res.status(400).json({ success: false, error: 'SELF_TRANSFER_FORBIDDEN' });
    }

    const balanceField = assetType === 'silver' ? 'silver_count' : (assetType === 'gold' ? 'gold_count' : 'codes_count');

    // 2. ATOMIC LOCKING & TRANSACTION
    await client.query('BEGIN');
    try {   
      // STEP 1: IDEMPOTENCY BINDING (inside transaction)
      const idempRes = await client.query(
        "INSERT INTO processed_transactions (tx_id) VALUES ($1) ON CONFLICT DO NOTHING",
        [transactionId]
      );

      if (idempRes.rowCount === 0) {
        await client.query('ROLLBACK');
        console.log(`[AUDIT] [IDEMPOTENCY] Transaction ${transactionId} already processed.`);
        return res.json({ success: true, message: 'ALREADY_PROCESSED', txId: transactionId });
      }

      // STEP 2: PRE-TRANSACTION BALANCE SNAPSHOT
      const preSnapshot = await client.query(
        `SELECT id, ${balanceField} FROM users WHERE id IN ($1, $2)`,
        [fromUserId, toUserId]
      );
      const senderPre = preSnapshot.rows.find(r => r.id === fromUserId)?.[balanceField] || 0;
      const receiverPre = preSnapshot.rows.find(r => r.id === toUserId)?.[balanceField] || 0;

      if (senderPre < amount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // STEP 3: OWNERSHIP TRANSFER
      if (assetType === 'codes') {
        let transferredCount = 0;
        for (const code of codes) {
          const transferRes = await client.query(
            "UPDATE codes SET user_id = $1, created_at = CURRENT_TIMESTAMP WHERE code = $2 AND user_id = $3 AND spent = 0",
            [toUserId, code, fromUserId]
          );

          if (transferRes.rowCount === 0) {
            throw new Error(`OWNERSHIP_FAILED_OR_CODE_SPENT: ${code}`);
          }
          transferredCount++;
        }

        if (transferredCount !== amount) {
          throw new Error(`TRANSFER_COUNT_MISMATCH: Expected ${amount}, got ${transferredCount}`);
        }
      }

      // STEP 4: BALANCE UPDATES
      const senderBalanceRes = await client.query(
        `UPDATE users SET ${balanceField} = ${balanceField} - $1 WHERE id = $2 AND ${balanceField} >= $1 RETURNING ${balanceField}`,
        [amount, fromUserId]
      );

      if (senderBalanceRes.rows.length === 0) {
        throw new Error('INSUFFICIENT_BALANCE_DURING_UPDATE');
      }

      const receiverUpdateRes = await client.query(
        `UPDATE users SET ${balanceField} = COALESCE(${balanceField}, 0) + $1 WHERE id = $2`,
        [amount, toUserId]
      );

      if (receiverUpdateRes.rowCount === 0) {
        throw new Error('RECEIVER_BALANCE_UPDATE_FAILED');
      }

      // STEP 5: POST-TRANSACTION SNAPSHOT VERIFICATION
      const postSnapshot = await client.query(
        `SELECT id, ${balanceField} FROM users WHERE id IN ($1, $2)`,
        [fromUserId, toUserId]
      );
      const senderPost = postSnapshot.rows.find(r => r.id === fromUserId)?.[balanceField] || 0;
      const receiverPost = postSnapshot.rows.find(r => r.id === toUserId)?.[balanceField] || 0;

      if (senderPost !== (senderPre - amount) || receiverPost !== (receiverPre + amount)) {
        console.error(`[AUDIT] [FRAUD_FLAG] [BALANCE_MISMATCH] txId=${transactionId} senderPre=${senderPre} senderPost=${senderPost} receiverPre=${receiverPre} receiverPost=${receiverPost} amount=${amount}`);
        throw new Error('BALANCE_INTEGRITY_VIOLATION');
      }

      // STEP 6: RECORD LEDGER
      await client.query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'debit', $3, $4, 'transfer_out')",
        [transactionId, fromUserId, assetType, amount]
      );
      await client.query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', $3, $4, 'transfer_in')",
        [transactionId, toUserId, assetType, amount]
      );

      await client.query('COMMIT');

      // WATCHDOG AI SUCCESS TRACKING
      WatchdogAI.trackSuccess(fromUserId, 'TRANSFER');

      console.log(`[AUDIT] [SUCCESS] txId=${transactionId} | sender=${fromUserId} | receiver=${toUserId} | amount=${amount} | asset=${assetType}`);

      return res.json({
        success: true,
        txId: transactionId,
        amount,
        newBalance: Number(senderPost),
      });

    } catch (txError) {
      await client.query('ROLLBACK');

      // WATCHDOG AI FAILURE TRACKING
      WatchdogAI.trackFailure(fromUserId, txError.message);

      console.error(`[AUDIT] [FAIL] txId=${transactionId} | error=${txError.message}`);
      return res.status(400).json({ success: false, error: txError.message });
    }

  } catch (err) {
    console.error(`[AUDIT] [FAIL] [SYSTEM_ERROR] txId=${transactionId} | error=${err.message}`);
    return res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// POST /rewards/transfer — Rewards transfer (codes only, with retry)
//
// BUG FIX: Client is ALWAYS released in finally block. Original code only
// released when attempt >= MAX_RETRIES, leaking connections on success.
// ---------------------------------------------------------------------------

router.post('/rewards/transfer', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try {   
    const session = readSessionFromCookie(req, res);
    if (!session || !session.userId) {
      return res.status(401).json({ success: false, error: 'unauthorized' });
    }

    const fromUserId = session.userId;
    const { toUserId, asset, amount } = req.body || {};

    if (!toUserId || !asset || typeof amount !== 'number') {
      return res.status(400).json({ success: false, error: 'bad_request' });
    }
    if (toUserId === fromUserId) {
      return res.status(400).json({ success: false, error: 'self_transfer_not_allowed' });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'invalid_amount' });
    }
    if (asset !== 'codes') {
      return res.status(400).json({ success: false, error: 'unsupported_asset' });
    }

    const client = await pool.connect();

    const MAX_RETRIES = 3;
    let attempt = 0;

    try {   
      while (true) {
        attempt++;
        try {   
          await client.query('BEGIN');

          const lockRes = await client.query(
            "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END),0) AS amount FROM ledger WHERE user_id=$1 AND asset_type='codes'",
            [fromUserId]
          );
          console.log('[TRANSFER] lock sender amount =', (lockRes.rows[0] && Number(lockRes.rows[0].amount)) || 0);
          const fromAmount = (lockRes.rows[0] && Number(lockRes.rows[0].amount)) || 0;
          if (fromAmount < amount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: 'insufficient_balance' });
          }

          const txId2 = crypto.randomUUID();
          await client.query(
            "INSERT INTO ledger (id, tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, $3, 'debit', 'codes', $4, 'reward_transfer')",
            [crypto.randomUUID(), txId2, fromUserId, amount]
          );
          console.log('[TRANSFER] deducted', amount, 'from', fromUserId);

          await client.query(
            "INSERT INTO ledger (id, tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, $3, 'credit', 'codes', $4, 'reward_transfer')",
            [crypto.randomUUID(), txId2, toUserId, amount]
          );
          console.log('[TRANSFER] credited', amount, 'to', toUserId);

          const finalBal = await client.query(
            "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END),0) AS amount FROM ledger WHERE user_id=$1 AND asset_type='codes'",
            [fromUserId]
          );
          console.log('[TRANSFER] final sender amount =', (finalBal.rows[0] && Number(finalBal.rows[0].amount)) || 0);

          const finalBalB = await client.query(
            "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END),0) AS amount FROM ledger WHERE user_id=$1 AND asset_type='codes'",
            [toUserId]
          );
          console.log('[TRANSFER] commit sender->receiver', {
            from: fromUserId,
            to: toUserId,
            amount,
            sender_final: (finalBal.rows[0] && Number(finalBal.rows[0].amount)) || 0,
            receiver_final: (finalBalB.rows[0] && Number(finalBalB.rows[0].amount)) || 0,
            attempt,
          });

          await client.query('COMMIT');

          return res.json({
            success: true,
            status: 'success',
            balances: {
              codes: (finalBal.rows[0] && Number(finalBal.rows[0].amount)) || 0,
            },
          });
        } catch (e) {
          try {    await client.query('ROLLBACK'); } catch (_) { /* ignore */ }
          const code = (e && e.code) || '';
          const retriable = code === '40001' || code === '40P01';
          console.warn('[REWARD TX RETRY]', { attempt, code, message: e && e.message });
          if (retriable && attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 80 * attempt));
            continue;
          }
          console.error('[REWARD TX ERROR]', e);
          return res.status(500).json({ success: false, error: 'tx_failed' });
        }
      }
    } finally {
      // BUG FIX: ALWAYS release the client — original only released when attempt >= MAX_RETRIES
      try {    client.release(); } catch (_) { /* ignore */ }
    }
  } catch (e) {
    console.error('[REWARD API ERROR]', e);
    res.status(500).json({ success: false, error: 'server_error' });
  }
});

export default router;
