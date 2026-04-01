/**
 * routes/watchdog.routes.js
 *
 * Watch-Dog Guardian API endpoints — feed and monitor the watchdog.
 *
 * Endpoints:
 *   POST /watchdog/feed   — Feed the watchdog (costs 10 codes)
 *   GET  /watchdog/status — Get current watchdog state
 *
 * BUG FIX: feedWatchDog properly imported from shared/watch-dog-guardian.js
 * (original had it referenced but never imported at module scope).
 */

import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import { enforceFinancialSecurity, storeIdempotencyResponse } from '../shared/security-middleware.js';
import { feedWatchDog, getWatchDogState, updateDogStateByTime } from '../shared/watch-dog-guardian.js';

const router = Router();

// ---------------------------------------------------------------------------
// POST /watchdog/feed — Feed the watchdog (costs 10 codes) — Enhanced Security
// ---------------------------------------------------------------------------

router.post('/watchdog/feed', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try {   
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' });

    // Get idempotency key from request
    const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey || null;

    // Use enhanced Watch-Dog Guardian feed function
    const result = await feedWatchDog(userId, idempotencyKey);

    // Store idempotency response if key was provided
    if (idempotencyKey && result.success) {
      storeIdempotencyResponse(userId, idempotencyKey, result);
    }

    if (result.success) {
      console.log(`[WATCHDOG] ✅ Dog fed for user ${userId}, cost: ${result.cost} codes`);
      return res.json({
        success: true,
        cost: result.cost,
        newBalance: result.newBalance,
        dogState: result.dogState,
        idempotent: result.idempotent || false,
        txId: result.txId,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.message,
        details: result,
      });
    }
  } catch (err) {
    console.error('[WATCHDOG] feed outer error:', err);
    return res.status(500).json({ success: false, error: err && err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /watchdog/status — Get current watchdog state
// ---------------------------------------------------------------------------

router.get('/watchdog/status', requireAuth, async (req, res) => {
  try {   
    const userId = req.user.id;

    // Refresh state based on time
    const info = await updateDogStateByTime(userId);
    const state = await getWatchDogState(userId);

    return res.json({
      success: true,
      dogState: state.dogState,
      lastFedAt: state.lastFedAt,
      isFrozen: state.isFrozen,
      hoursSinceLastFeed: info.hoursSinceLastFeed,
    });
  } catch (err) {
    console.error('[WATCHDOG STATUS] error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
