/**
 * routes/balances.routes.js
 *
 * Balance and minting endpoints. Consolidates the multiple duplicate
 * definitions that existed in the original server.js into single
 * canonical versions.
 *
 * Endpoints:
 *   GET  /balances        — Get user's code / silver / gold counts
 *   GET  /rewards/balance  — Get rewards balance with extended fields
 *   GET  /ledger/verify    — Verify ledger totals for the current user
 *   GET  /assets/balance   — Get all asset balances (direct DB query)
 *   POST /mint             — Mint new codes for the current user
 *   POST /rewards/claim    — Claim a silver or gold reward bar
 *
 * BUG FIXES:
 *   - `dbQuery` → `query` (original line ~2102 used an undefined identifier)
 *   - `AssetReadonly.getAllBalances` replaced with direct DB query (was never defined)
 *   - Duplicate /balances routes consolidated into one canonical version
 *   - Duplicate /rewards/balance routes (3 definitions!) consolidated into one
 */

import { Router } from 'express';

import { query } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /balances — canonical version (was defined 3× in the original)
// ---------------------------------------------------------------------------

router.get('/balances', requireAuth, async (req, res) => {
  try { 
    const userId = req.user.id;
    const r = await query(
      'SELECT codes_count, silver_count, gold_count FROM balances WHERE user_id=$1',
      [userId]
    );

    if (r.rows.length === 0) {
      return res.json({
        status: 'success',
        balances: { codes: 0, silver: 0, gold: 0 },
      });
    }

    const row = r.rows[0];
    return res.json({
      status: 'success',
      balances: {
        codes: row.codes_count || 0,
        silver: row.silver_count || 0,
        gold: row.gold_count || 0,
      },
    });
  } catch (err) {
    console.error('[BALANCES ERROR]', err);
    return res.status(500).json({ status: 'failed', error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /rewards/balance — canonical version (was defined 3× in the original)
// BUG FIX: `dbQuery` → `query` (original used undefined `dbQuery`)
// ---------------------------------------------------------------------------

router.get('/rewards/balance', requireAuth, async (req, res) => {
  try { 
    const userId = req.user.id;

    if (process.env.DATABASE_URL) {
      // BUG FIX: was `dbQuery(...)` — now correctly uses `query(...)`
      const result = await query(
        'SELECT COALESCE(codes_count, 0) AS codes, COALESCE(silver_count, 0) AS silver, COALESCE(gold_count, 0) AS gold FROM users WHERE id = $1',
        [userId]
      );

      const row = result.rows[0] || { codes: 0, silver: 0, gold: 0 };

      return res.json({
        codes: Number(row.codes),
        silver: Number(row.silver),
        gold: Number(row.gold),
        likes: 0,
        superlikes: 0,
        games: 0,
        transactions: 0,
        updatedAt: Date.now(),
        last_updated: Date.now(),
      });
    }

    // No DATABASE_URL — return zeroed response
    return res.json({
      codes: 0,
      silver: 0,
      gold: 0,
      likes: 0,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('[REWARDS BALANCE ERROR]', err);
    return res.status(500).json({ success: false, error: 'internal_error' });
  }
});

// ---------------------------------------------------------------------------
// GET /ledger/verify — verify ledger-based balance for current user
// ---------------------------------------------------------------------------

router.get('/ledger/verify', requireAuth, async (req, res) => {
  try { 
    const userId = req.user.id;
    const result = await query(
      'SELECT COALESCE(codes_count, 0) AS codes, COALESCE(silver_count, 0) AS silver, COALESCE(gold_count, 0) AS gold FROM users WHERE id = $1',
      [userId]
    );

    const row = result.rows[0] || { codes: 0, silver: 0, gold: 0 };
    return res.json({
      codes: Number(row.codes),
      silver: Number(row.silver),
      gold: Number(row.gold),
    });
  } catch (err) {
    console.error('[LEDGER VERIFY ERROR]', err);
    return res.status(500).json({ success: false, error: 'internal_error' });
  }
});

// ---------------------------------------------------------------------------
// GET /assets/balance — asset balances (direct DB query)
// BUG FIX: replaced `AssetReadonly.getAllBalances` (never defined) with a
//          direct database query.
// ---------------------------------------------------------------------------

router.get('/assets/balance', requireAuth, async (req, res) => {
  try { 
    const userId = req.user.id;

    const result = await query(
      'SELECT COALESCE(codes_count, 0) AS codes, COALESCE(silver_count, 0) AS silver, COALESCE(gold_count, 0) AS gold FROM users WHERE id = $1',
      [userId]
    );

    const row = result.rows[0] || { codes: 0, silver: 0, gold: 0 };
    return res.json({
      codes: Number(row.codes),
      silver: Number(row.silver),
      gold: Number(row.gold),
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// ---------------------------------------------------------------------------
// POST /mint — generate new codes for the current user
// ---------------------------------------------------------------------------

router.post('/mint', requireAuth, async (req, res) => {
  try { 
    const userId = req.user.id;
    const amount = 5;
    const codes = [];

    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 26; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    for (let i = 0; i < amount; i++) {
      codes.push(generateCode());
    }

    for (const code of codes) {
      await query(
        'INSERT INTO codes (user_id, code, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [userId, code, 'normal']
      );
    }

    await query(
      `INSERT INTO balances (user_id, codes_count)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET codes_count = balances.codes_count + $2, updated_at = CURRENT_TIMESTAMP`,
      [userId, codes.length]
    );

    return res.json({ minted: codes.length });
  } catch (err) {
    console.error('[MINT ERROR]', err);
    return res.status(500).json({ success: false, error: 'mint_failed', message: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /rewards/claim — claim a silver or gold reward bar
// ---------------------------------------------------------------------------

router.post('/rewards/claim', requireAuth, async (req, res) => {
  try { 
    const userId = req.user.id;
    const { type } = req.body;

    if (!type || (type !== 'silver' && type !== 'gold')) {
      return res.status(400).json({ success: false, error: 'Invalid reward type' });
    }

    const column = `${type}_count`;
    await query(
      `INSERT INTO balances (user_id, ${column}) VALUES ($1, 1)
       ON CONFLICT (user_id) DO UPDATE SET ${column} = balances.${column} + 1, updated_at = CURRENT_TIMESTAMP`,
      [userId]
    );

    console.log(`[REWARD CLAIM] 1 ${type} bar added to user ${userId}`);
    return res.json({ success: true, claimed: type });
  } catch (err) {
    console.error('[REWARD CLAIM ERROR]', err);
    return res.status(500).json({ success: false, error: 'claim_failed', message: err.message });
  }
});

export default router;
