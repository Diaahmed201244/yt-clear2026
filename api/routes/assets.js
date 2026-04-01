import express from 'express';
import { getUserAssets, processAccTransaction } from '../services/acc-core.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', requireAuth, async (req, res) => {
    try {   
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'unauthorized_access' });
        }
        const assets = await getUserAssets(userId);
        res.json({ success: true, data: assets });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/transaction', requireAuth, async (req, res) => {
    try {   
        const { userId, type, assetType, amount } = req.body;
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'unauthorized_access' });
        }
        const result = await processAccTransaction({ userId, type, assetType, amount });
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;
