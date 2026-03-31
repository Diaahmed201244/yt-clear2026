/**
 * routes/admin.routes.js
 *
 * Admin-only endpoints — deposit codes to users and user management.
 *
 * Endpoints:
 *   POST /admin/deposit — Admin manual deposit of codes/silver/gold to a user
 *   GET  /admin/users   — List all users (admin only)
 *
 * BUG FIX: After COMMIT in admin/deposit, the balance query now uses the
 * pool-level `query()` helper instead of the released transaction `client`.
 * The original code queried via `client` after COMMIT which could fail since
 * the transaction is closed.
 */

import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { pool, query } from '../config/database.js';
import { JWT_SECRET } from '../config/index.js';
import { readSessionFromCookie } from '../middleware/auth.js';

const router = Router();

// ---------------------------------------------------------------------------
// Helper: check if the request is from an admin
// ---------------------------------------------------------------------------

/**
 * Determine admin status from session cookie or JWT Bearer token.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {{ isAdmin: boolean, session: object|null }}
 */
function checkAdminAuth(req, res) {
  const session = readSessionFromCookie(req, res);
  let authEmail = null;

  try {
    const h = (req.headers && req.headers.authorization) || '';
    const parts = h.split(' ');
    if (parts[0] === 'Bearer' && parts[1]) {
      const decoded = jwt.verify(parts[1], JWT_SECRET);
      authEmail = (decoded && decoded.email) || null;
    }
  } catch (err) {
    console.error('[AUTH] JWT decode error:', err);
    authEmail = null;
  }

  if (!session && !authEmail) {
    return { isAdmin: false, session: null };
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const isDev = String(process.env.NODE_ENV || 'development') !== 'production';
  const allowDev = isDev && (process.env.DEV_ALLOW_ADMIN_DEPOSIT === '1' || adminEmails.length === 0);

  const isAdmin = !!(
    allowDev ||
    (session && (
      session.isAdmin ||
      session.role === 'dev' ||
      (session.email && adminEmails.includes(String(session.email).toLowerCase()))
    )) ||
    (authEmail && adminEmails.includes(String(authEmail).toLowerCase()))
  );

  return { isAdmin, session };
}

// ---------------------------------------------------------------------------
// POST /admin/deposit — Admin manual deposit
// ---------------------------------------------------------------------------

router.post('/admin/deposit', async (req, res) => {
  try {
    const { isAdmin, session } = checkAdminAuth(req, res);
    if (!session && !req.headers.authorization) {
      return res.status(401).json({ success: false, error: 'unauthorized' });
    }
    if (!isAdmin) {
      return res.status(403).json({ success: false, error: 'forbidden' });
    }

    const { email, code, type, amount } = req.body || {};
    if (!email || !code || !type || !amount) {
      return res.status(400).json({ success: false, error: 'missing_fields' });
    }

    const t = String(type);
    const kind = (t === 'silver' || t === 'gold') ? t : 'codes';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const u = await client.query(
        'SELECT id FROM users WHERE email=$1 LIMIT 1',
        [String(email).trim()]
      );
      if (!u.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: 'user_not_found' });
      }
      const userId = u.rows[0].id;

      // Ensure type column exists
      try {
        await client.query("ALTER TABLE codes ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'codes'");
      } catch (e) {
        if (!e.message.includes('duplicate column name')) throw e;
      }

      // Attempt insert; unique(code) prevents duplicates
      const amt = Math.max(1, parseInt(amount, 10) || 1);
      const ins = await client.query(
        "INSERT INTO codes (id, user_id, code, type, created_at, generated_at, next_at, meta) " +
        "VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $5) ON CONFLICT (code) DO NOTHING",
        [crypto.randomUUID(), userId, String(code).trim(), kind, JSON.stringify({ from_admin: true })]
      );

      await client.query('COMMIT');

      // Notify via WebSocket (best-effort)
      try {
        const wss = globalThis.__wss;
        if (wss) {
          const count = Math.max(1, parseInt(amt, 10) || 1);
          const codesPayload = Array(count).fill(String(code).trim());
          const payload = { type: 'CODES_RECEIVED', codes: codesPayload, assetType: kind, from_admin: true, to: userId, timestamp: Date.now() };
          if (typeof wss.__emitToUser === 'function') {
            wss.__emitToUser(userId, payload);
          } else if (wss.clients) {
            const s = JSON.stringify(payload);
            wss.clients.forEach(ws => {
              try { if (ws && ws.readyState === 1 && ws.userId === String(userId)) ws.send(s); } catch (_) { /* ignore */ }
            });
          }
        }
      } catch (_) { /* ignore */ }

      // BUG FIX: Use pool-level query() instead of the transaction client after COMMIT
      // The original used `client.query(...)` here, which is unreliable after COMMIT.
      const balancesRes = await query(
        "SELECT asset_type, SUM(amount) AS total FROM balance_projection WHERE user_id=$1 GROUP BY asset_type ORDER BY asset_type ASC",
        [userId]
      );
      const balances = {};
      for (const row of balancesRes.rows) {
        const key = row.asset_type === 'codebank' ? 'codes' : row.asset_type;
        balances[key] = typeof row.total === 'number' ? row.total : 0;
      }

      return res.json({
        success: true,
        inserted: ins.rowCount || 0,
        userId,
        type: kind,
        balances,
      });
    } catch (e) {
      try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ }
      console.error('[Admin Deposit]', e);
      return res.status(500).json({ success: false, error: (e && e.message) || 'deposit_failed' });
    } finally {
      try { client.release(); } catch (_) { /* ignore */ }
    }
  } catch (e) {
    return res.status(500).json({ success: false, error: (e && e.message) || 'internal_error' });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/users — List all users (admin only)
// ---------------------------------------------------------------------------

router.get('/admin/users', async (req, res) => {
  try {
    const { isAdmin } = checkAdminAuth(req, res);
    if (!isAdmin) {
      return res.status(403).json({ success: false, error: 'forbidden' });
    }

    const result = await query(
      'SELECT id, email, username, codes_count, silver_count, gold_count, user_type, created_at FROM users ORDER BY created_at DESC LIMIT 100'
    );

    return res.json({
      success: true,
      users: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('[ADMIN] users list error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
