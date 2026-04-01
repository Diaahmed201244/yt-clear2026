/**
 * routes/diagnostic.routes.js
 *
 * Diagnostic / introspection endpoints.
 * These routes expose internal DB and system state for debugging purposes.
 *
 * ⚠️  PRODUCTION GUARD: All routes return 404 in production.
 *     Set NODE_ENV=production to disable all diagnostics automatically.
 *
 * Mount this router at /api:
 *   GET /api/diag/ledger-schema — column list for the ledger table
 *   GET /api/diag/neon-sync     — session-based DB connectivity check
 *   GET /api/diag/sqlite-codes  — per-user codes from DB (more complete version)
 *   GET /api/sqlite/diag        — column introspection across all tables
 *
 * BUG FIX: The original had two definitions of /api/diag/sqlite-codes — one
 * at line ~3305 (session-based, 20 rows, no counts) and one at line ~4791
 * (requireAuth, all rows, with silver/gold counts). Keeping only the more
 * complete requireAuth version here.
 */

import { Router } from 'express';
import { query } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { readSessionFromCookie } from '../middleware/auth.js';

const router = Router();

// ---------------------------------------------------------------------------
// Production guard middleware
// All diagnostic routes return 404 in production
// ---------------------------------------------------------------------------

router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  next();
});

// ---------------------------------------------------------------------------
// GET /api/diag/ledger-schema — column list for the ledger table
// ---------------------------------------------------------------------------

router.get('/diag/ledger-schema', async (req, res) => {
  try { 
    const { rows } = await query('PRAGMA table_info(ledger)');
    return res.json({ columns: rows.map(r => r.name) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/diag/neon-sync — session-based DB connectivity check
// ---------------------------------------------------------------------------

router.get('/diag/neon-sync', async (req, res) => {
  try { 
    const s = readSessionFromCookie(req, res);
    if (!s || !s.userId) {
      return res.json({ ok: false, reason: 'no_session' });
    }
    return res.json({
      ok: true,
      userId: s.userId,
      message: 'balances view deprecated - use watchdog',
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/diag/sqlite-codes — per-user codes (more complete version)
//
// BUG FIX: Consolidated from two duplicate definitions. Using the requireAuth
// version (originally at line ~4791) which returns full code list with
// silver/gold counts — supersedes the session-cookie-only version at ~3305.
//
// Also responds at /api/sqlite/codes, /api/codes/list, /api/sync/list for
// backwards compatibility with YT-Clear & Bankode clients.
// ---------------------------------------------------------------------------

router.get(
  ['/diag/sqlite-codes', '/sqlite/codes', '/codes/list', '/sync/list'],
  requireAuth,
  async (req, res) => {
    try { 
      const userId = req.user.id || req.user.userId;

      const codesResult = await query(
        'SELECT code, type, created_at FROM codes WHERE user_id=$1 ORDER BY created_at DESC',
        [userId]
      );

      const countsResult = await query(
        'SELECT codes_count, silver_count, gold_count FROM users WHERE id=$1',
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
      console.error('❌ [diag/sqlite-codes] Error:', e.message);
      return res.status(500).json({ error: 'Database access failed' });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/sqlite/diag — column introspection across all core tables
// ---------------------------------------------------------------------------

router.get('/sqlite/diag', async (req, res) => {
  try { 
    const tables = ['users', 'codes', 'ledger', 'rewards', 'events', 'transactions', 'vault'];
    const columns = [];

    for (const t of tables) {
      try { 
        const { rows } = await query(`PRAGMA table_info(${t})`);
        rows.forEach(r => columns.push({ column_name: r.name, table_name: t }));
      } catch (_) {
        // Table may not exist — skip silently
      }
    }

    return res.json({ status: 'success', columns, foreign_keys: [] });
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: e && e.message });
  }
});

export default router;
