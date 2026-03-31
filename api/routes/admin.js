import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query, pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-demo';

// Admin check middleware
const requireAdmin = (req, res, next) => {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  const isDev = String(process.env.NODE_ENV||'development') !== 'production';
  const allowDev = isDev && (process.env.DEV_ALLOW_ADMIN_DEPOSIT === '1' || adminEmails.length === 0);
  
  const isAdmin = !!(
    allowDev || 
    (req.user && (req.user.role === 'admin' || req.user.role === 'dev' || (req.user.email && adminEmails.includes(String(req.user.email).toLowerCase()))))
  );

  if (!isAdmin) return res.status(403).json({ ok: false, error: 'forbidden' });
  next();
};

router.post('/deposit', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email, code, type, amount } = req.body || {};
    if (!email || !code || !type || !amount) return res.status(400).json({ ok: false, error: 'missing_fields' });
    
    const kind = (type === 'silver' || type === 'gold') ? type : 'codes';
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const u = await client.query('SELECT id FROM users WHERE email=$1 LIMIT 1', [String(email).trim()]);
      if (!u.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(404).json({ ok: false, error: 'user_not_found' });
      }
      const userId = u.rows[0].id;

      const amt = Math.max(1, parseInt(amount, 10) || 1);
      const ins = await client.query(
        "INSERT INTO codes (id, user_id, code, type, created_at, metadata) " +
        "VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5) ON CONFLICT (code) DO NOTHING",
        [crypto.randomUUID(), userId, String(code).trim(), kind, JSON.stringify({ from_admin: true })]
      );

      await client.query('COMMIT');
      
      return res.json({ 
        ok: true, 
        inserted: ins.rowCount || 0, 
        userId, 
        type: kind
      });
    } catch (e) {
      await client.query('ROLLBACK');
      return res.status(500).json({ ok: false, error: e.message });
    } finally {
      client.release();
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
