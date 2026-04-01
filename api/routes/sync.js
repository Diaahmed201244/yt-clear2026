import express from 'express';
import crypto from 'crypto';
import { query, pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try { 
    const { delta_codes, delta_silver, delta_gold, sync_id } = req.body || {};
    const userId = req.user.id;

    if (!sync_id) return res.status(400).json({ status: 'failed', error: 'Missing sync_id' });

    const existingEvent = await query('SELECT id FROM sync_events WHERE id = $1', [sync_id]);
    if (existingEvent.rows.length > 0) {
      const balanceRes = await query('SELECT codes_count, silver_count, gold_count FROM users WHERE id = $1', [userId]);
      const row = balanceRes.rows[0] || { codes_count: 0, silver_count: 0, gold_count: 0 };
      return res.json({ 
        status: 'success', 
        synced_at: Date.now(),
        codes: Number(row.codes_count),
        silver: Number(row.silver_count),
        gold: Number(row.gold_count)
      });
    }

    const d_codes = Number(delta_codes || 0);
    const d_silver = Number(delta_silver || 0);
    const d_gold = Number(delta_gold || 0);

    if (d_codes > 100 || d_silver > 20 || d_gold > 10) {
      return res.status(400).json({ status: 'failed', error: 'Delta limits exceeded' });
    }
    
    if (d_codes < 0 || d_silver < 0 || d_gold < 0) {
      return res.status(400).json({ status: 'failed', error: 'Negative deltas not allowed' });
    }

    const client = await pool.connect();
    await client.query('BEGIN');
    try { 
      await client.query(
        "INSERT INTO sync_events (id, user_id, delta_codes, delta_silver, delta_gold) VALUES ($1, $2, $3, $4, $5)",
        [sync_id, userId, d_codes, d_silver, d_gold]
      );

      const updateRes = await client.query(
        "UPDATE users SET codes_count = COALESCE(codes_count, 0) + $1, silver_count = COALESCE(silver_count, 0) + $2, gold_count = COALESCE(gold_count, 0) + $3, last_sync_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING codes_count, silver_count, gold_count",
        [d_codes, d_silver, d_gold, userId]
      );

      await client.query(
        "INSERT INTO balances (user_id, codes_count, silver_count, gold_count, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO UPDATE SET codes_count = balances.codes_count + $2, silver_count = balances.silver_count + $3, gold_count = balances.gold_count + $4, updated_at = CURRENT_TIMESTAMP",
        [userId, d_codes, d_silver, d_gold]
      );

      if (d_codes > 0) await client.query("INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'codes', $3, 'sync')", [crypto.randomUUID(), userId, d_codes]);
      if (d_silver > 0) await client.query("INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'silver', $3, 'sync')", [crypto.randomUUID(), userId, d_silver]);
      if (d_gold > 0) await client.query("INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'gold', $3, 'sync')", [crypto.randomUUID(), userId, d_gold]);
      
      await client.query('COMMIT');
      
      const row = updateRes.rows[0] || { codes_count: 0, silver_count: 0, gold_count: 0 };
      return res.json({ 
        status: 'success', 
        synced_at: Date.now(),
        codes: Number(row.codes_count),
        silver: Number(row.silver_count),
        gold: Number(row.gold_count)
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ status: 'failed', error: err.message });
  }
});

router.post('/claim', requireAuth, async (req, res) => {
  try { 
    const { code } = req.body || {};
    const userId = req.user.id;

    if (!code || typeof code !== 'string') return res.status(400).json({ success: false, error: 'code_required' });

    const codePattern = /^([A-Z0-9]{4}-){6}P\d$/;
    if (!codePattern.test(code)) return res.status(400).json({ success: false, error: 'invalid_code_format' });

    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const client = await pool.connect();
    await client.query('BEGIN');
    try { 
      const used = await client.query("INSERT INTO used_codes (code_hash, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [hash, userId]);
      if (used.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'code_already_claimed' });
      }

      await client.query("UPDATE users SET codes_count = COALESCE(codes_count, 0) + 1, last_sync_at = CURRENT_TIMESTAMP WHERE id = $1", [userId]);
      await client.query("INSERT INTO codes (id, user_id, code, type, created_at) VALUES ($1, $2, $3, 'codes', CURRENT_TIMESTAMP)", [crypto.randomUUID(), userId, code]);
      await client.query("INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'codes', 1, 'claim')", [crypto.randomUUID(), userId]);

      await client.query('COMMIT');
      return res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

router.get('/list', requireAuth, async (req, res) => { 
  try {  
    const userId = req.user.id;
    const userRes = await query("SELECT COALESCE(codes_count, 0) as count, COALESCE(silver_count, 0) as silver, COALESCE(gold_count, 0) as gold FROM users WHERE id = $1", [userId]);
    const userRow = userRes.rows[0] || { count: 0, silver: 0, gold: 0 };
    const codesRes = await query("SELECT code, type, created_at FROM codes WHERE user_id = $1 AND spent = 0 ORDER BY created_at DESC", [userId]);
    
    return res.json({
      success: true,
      count: Number(userRow.count),
      silver_count: Number(userRow.silver),
      gold_count: Number(userRow.gold),
      codes: codesRes.rows,
      rows: codesRes.rows,
      latest: codesRes.rows.length > 0 ? codesRes.rows[0].code : null
    });
  } catch (e) { 
    res.status(500).json({ success: false, status: 'failed', error: 'internal_error' }); 
  } 
});

export default router;
