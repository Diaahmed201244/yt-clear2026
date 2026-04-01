import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import watchdogRoutes from '../../routes/watchdog.js';

const router = express.Router();

// Register existing watchdog routes from legacy location
router.use('/', watchdogRoutes);

// Status route
router.get('/status', requireAuth, async (req, res) => {
  try { 
    const userId = req.user.id;
    const { getWatchDogState, updateDogStateByTime } = await import('../../shared/watch-dog-guardian.js');
    const info = await updateDogStateByTime(userId);
    const state = await getWatchDogState(userId);
    return res.json({
      success: true,
      dogState: state.dogState,
      lastFedAt: state.lastFedAt,
      isFrozen: state.isFrozen,
      hoursSinceLastFeed: info.hoursSinceLastFeed
    });
  } catch (err) {
    console.error('[WATCHDOG STATUS] error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
