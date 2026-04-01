import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const balloonClicks = new Map();

router.post('/pop', requireAuth, async (req, res) => {
  try {   
    const { points, timestamp } = req.body || {};
    const userId = req.user.id;
    const p = Number(points || 0);
    const ts = Number(timestamp || Date.now());

    if (!Number.isFinite(p) || p < 0 || p > 25) return res.status(400).json({ ok: false, error: 'invalid_points' });
    if (!Number.isFinite(ts) || (Date.now() - ts) > 5 * 60 * 1000) return res.status(400).json({ ok: false, error: 'invalid_timestamp' });

    const now = Date.now();
    const list = balloonClicks.get(userId) || [];
    const recent = list.filter(t => now - t < 60 * 1000);
    if (recent.length >= 20) return res.status(429).json({ ok: false, error: 'rate_limit' });
    recent.push(now);
    balloonClicks.set(userId, recent);

    console.log('[BALLOON POP]', { userId, points: p });
    return res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

export default router;
