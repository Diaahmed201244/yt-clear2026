import express from 'express';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/balance', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      "SELECT COALESCE(codes_count, 0) as codes, COALESCE(silver_count, 0) as silver, COALESCE(gold_count, 0) as gold FROM users WHERE id = $1",
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
      updatedAt: Date.now()
    });
  } catch (err) {
    res.status(500).json({ error: 'internal_error' });
  }
});

export default router;
