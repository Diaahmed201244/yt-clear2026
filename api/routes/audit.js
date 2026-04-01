import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/ledger', requireAuth, async (req, res) => {
  try { 
    const uid = (req.query.userId || '').trim();
    if (!uid) return res.status(400).json({ status: 'failed', error: 'userId required' });
    if (req.user.id !== uid && req.user.role !== 'admin') return res.status(403).json({ status: 'failed', error: 'unauthorized_access' });
    const r = await query(`SELECT * FROM ledger WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`, [uid]);
    return res.json({ status: 'success', rows: r.rows });
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: e.message });
  }
});

router.get('/vault', requireAuth, async (req, res) => {
  try { 
    const uid = (req.query.userId || '').trim();
    if (!uid) return res.status(400).json({ status: 'failed', error: 'userId required' });
    if (req.user.id !== uid && req.user.role !== 'admin') return res.status(403).json({ status: 'failed', error: 'unauthorized_access' });
    const r = await query(`SELECT * FROM audit_logs WHERE actor_user_id=$1 ORDER BY created_at DESC`, [uid]);
    return res.json({ status: 'success', rows: r.rows });
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: e.message });
  }
});

router.get('/balances', (req, res) => {
  return res.json({ status: 'success', rows: [], message: 'balances view deprecated' });
});

export default router;
