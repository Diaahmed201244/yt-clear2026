import express from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { query, pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { enforceFinancialSecurity } from '../../shared/security-middleware.js';
import WatchdogAI from '../../services/watchdog-ai.js';

const router = express.Router();

const transferLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => res.status(429).json({ success: false, error: 'TRANSFER_RATE_LIMIT_EXCEEDED' })
});

async function sqliteFindUserByEmail(email) {
  const normalizedEmail = String(email).toLowerCase().trim();
  const r = await query('SELECT id, email, password_hash FROM users WHERE LOWER(email)=$1', [normalizedEmail]);
  return r.rows[0] || null;
}

router.post('/', requireAuth, transferLimiter, enforceFinancialSecurity, async (req, res) => {
  const client = await pool.connect();
  const { transactionId, receiverEmail, codes, type } = req.body || {};
  const fromUserId = req.user.id;
  const assetType = type || 'codes';
  const amount = Array.isArray(codes) ? codes.length : 0;

  if (!transactionId) return res.status(400).json({ success: false, error: 'MISSING_TRANSACTION_ID' });
  if (!receiverEmail) return res.status(400).json({ success: false, error: 'MISSING_RECEIVER' });
  if (amount <= 0) return res.status(400).json({ success: false, error: 'NO_ASSETS_PROVIDED' });

  const riskAnalysis = WatchdogAI.evaluateRisk(fromUserId);
  if (riskAnalysis.decision !== 'ALLOW') {
    return res.status(403).json({ 
      success: false, 
      error: 'SECURITY_RESTRICTION', 
      decision: riskAnalysis.decision, 
      message: riskAnalysis.decision === 'FREEZE' ? 'Your account is temporarily in a cool-down period.' : 'Your request was flagged for security review.'
    });
  }

  try { 
    const receiver = await sqliteFindUserByEmail(receiverEmail);
    if (!receiver || !receiver.id) return res.status(404).json({ success: false, error: 'RECEIVER_NOT_FOUND' });
    const toUserId = receiver.id;
    if (fromUserId === toUserId) return res.status(400).json({ success: false, error: 'SELF_TRANSFER_FORBIDDEN' });

    const balanceField = assetType === 'silver' ? 'silver_count' : (assetType === 'gold' ? 'gold_count' : 'codes_count');

    await client.query('BEGIN');
    try { 
      const idempRes = await client.query("INSERT INTO processed_transactions (tx_id) VALUES ($1) ON CONFLICT DO NOTHING", [transactionId]);
      if (idempRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.json({ success: true, message: 'ALREADY_PROCESSED', txId: transactionId });
      }

      const preSnapshot = await client.query(`SELECT id, ${balanceField} FROM users WHERE id IN ($1, $2)`, [fromUserId, toUserId]);
      const senderPre = preSnapshot.rows.find(r => r.id === fromUserId)?.[balanceField] || 0;
      if (senderPre < amount) throw new Error('INSUFFICIENT_BALANCE');

      if (assetType === 'codes') {
        for (const code of codes) {
          const transferRes = await client.query("UPDATE codes SET user_id = $1, created_at = CURRENT_TIMESTAMP WHERE code = $2 AND user_id = $3 AND spent = 0", [toUserId, code, fromUserId]);
          if (transferRes.rowCount === 0) throw new Error(`OWNERSHIP_FAILED_OR_CODE_SPENT: ${code}`);
        }
      }

      await client.query(`UPDATE users SET ${balanceField} = ${balanceField} - $1 WHERE id = $2 AND ${balanceField} >= $1`, [amount, fromUserId]);
      await client.query(`UPDATE users SET ${balanceField} = COALESCE(${balanceField}, 0) + $1 WHERE id = $2`, [amount, toUserId]);

      await client.query("INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'debit', $3, $4, 'transfer_out')", [transactionId, fromUserId, assetType, amount]);
      await client.query("INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', $3, $4, 'transfer_in')", [transactionId, toUserId, assetType, amount]);

      await client.query('COMMIT');
      WatchdogAI.trackSuccess(fromUserId, 'TRANSFER');
      return res.json({ success: true, txId: transactionId, amount });
    } catch (txError) {
      await client.query('ROLLBACK');
      WatchdogAI.trackFailure(fromUserId, txError.message);
      return res.status(400).json({ success: false, error: txError.message });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
  }
});

export default router;
