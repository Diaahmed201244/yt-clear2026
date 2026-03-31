/**
 * routes/codes.routes.js
 *
 * Code management endpoints — listing, claiming, adding, and deleting codes.
 *
 * Endpoints:
 *   GET    /sqlite/codes        — List user's codes with counts
 *   POST   /sqlite/codes        — Claim a code (hash-based double-spend prevention)
 *   POST   /sqlite/codes-legacy — Legacy CodeBank code acknowledgment
 *   DELETE /sqlite/codes/:id    — Delete a specific code by id
 *   GET    /diag/sqlite-codes   — Diagnostic: list recent codes for session user
 */

import { Router } from 'express';
import crypto from 'crypto';

import { query } from '../config/database.js';
import {
  requireAuth,
  readSessionFromCookie,
  devSessions,
} from '../middleware/auth.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /sqlite/codes — Authoritative codes retrieval
// Also serves: /codes/list, /sync/list, /diag/sqlite-codes
// (The canonical multi-path version from end of original file)
// ---------------------------------------------------------------------------

router.get(
  ['/sqlite/codes', '/codes/list', '/sync/list', '/diag/sqlite-codes'],
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const codesResult = await query(
        'SELECT code, type, created_at FROM codes WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      const countsResult = await query(
        'SELECT codes_count, silver_count, gold_count FROM users WHERE id = $1',
        [userId]
      );
      const counts = countsResult.rows[0] || {
        codes_count: 0,
        silver_count: 0,
        gold_count: 0,
      };

      return res.json({
        success: true,
        status: 'success',
        count: counts.codes_count,
        silver_count: counts.silver_count,
        gold_count: counts.gold_count,
        codes: codesResult.rows,
        rows: codesResult.rows,
        latest: codesResult.rows[0] ? codesResult.rows[0].code : null,
      });
    } catch (e) {
      console.error('[CODES LIST ERROR]', e.message);
      return res.status(500).json({ success: false, error: 'Database access failed' });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /sqlite/codes — Claim a code with double-spend prevention
// ---------------------------------------------------------------------------

router.post('/sqlite/codes', async (req, res) => {
  try {
    const { code } = req.body || {};
    const session = readSessionFromCookie(req, res);

    if (!session || !session.userId) {
      return res.status(401).json({ success: false, error: 'unauthorized' });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'code_required' });
    }

    // Validate code format: xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-Pn
    const codePattern = /^([A-Z0-9]{4}-){6}P\d$/;
    if (!codePattern.test(code)) {
      console.warn(`[CLAIM REJECTED] Invalid code format: ${code}`);
      return res.status(400).json({ success: false, error: 'invalid_code_format' });
    }

    // Prevent double spend using SHA256 hash
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const userId = session.userId;

    await query('BEGIN');
    try {
      const used = await query(
        'INSERT INTO used_codes (code_hash, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [hash, userId]
      );

      if (used.rowCount === 0) {
        console.warn(`[CLAIM REJECTED] Code already claimed (hash): ${hash.slice(0, 8)}...`);
        await query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'code_already_claimed' });
      }

      // Update balance
      await query(
        'UPDATE users SET codes_count = COALESCE(codes_count, 0) + 1, last_sync_at = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );

      // Persist the code string
      await query(
        "INSERT INTO codes (id, user_id, code, type, created_at) VALUES ($1, $2, $3, 'codes', CURRENT_TIMESTAMP)",
        [crypto.randomUUID(), userId, code]
      );

      // Record in ledger
      await query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'codes', 1, 'claim')",
        [crypto.randomUUID(), userId]
      );

      await query('COMMIT');
      return res.json({ success: true });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('[CLAIM ERROR]', err);
    return res.status(500).json({ success: false, error: 'internal_error' });
  }
});

// ---------------------------------------------------------------------------
// POST /sqlite/codes-legacy — Legacy CodeBank code acknowledgment
// ---------------------------------------------------------------------------

router.post('/sqlite/codes-legacy', async (req, res) => {
  try {
    const body = req.body || {};
    const code = body.code || '';
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ status: 'failed', error: 'Invalid code' });
    }

    // Reject guest PP payloads
    if (/_PP$/.test(code)) {
      console.warn('[PP-FILTER] codes-legacy rejected PP payload');
      return res.json({ status: 'success', ignored: true, reason: 'guest PP' });
    }

    let userId = null;
    try {
      const token = req.cookies && req.cookies.session_token;
      const s = token && devSessions.get(token);
      if (s && s.userId) userId = s.userId;
    } catch (_) {}

    if (!userId) {
      return res.status(401).json({ status: 'failed', error: 'Unauthorized' });
    }

    return res.json({ status: 'success', code, userId });
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: e.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /sqlite/codes/:id — Delete a specific code by id
// ---------------------------------------------------------------------------

router.delete('/sqlite/codes/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const codeId = req.params.id;

    if (!codeId) {
      return res.status(400).json({ success: false, error: 'Code ID required' });
    }

    const result = await query(
      'DELETE FROM codes WHERE id = $1 AND user_id = $2',
      [codeId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Code not found or not owned by user' });
    }

    return res.json({ success: true, deleted: codeId });
  } catch (err) {
    console.error('[DELETE CODE ERROR]', err);
    return res.status(500).json({ success: false, error: 'delete_failed' });
  }
});

export default router;
