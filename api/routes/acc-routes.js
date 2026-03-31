import express from 'express';
import { createClient } from '@libsql/client/http';

const router = express.Router();

const accDb = createClient({
    url: (() => {
        const u = process.env.TURSO_URL || process.env.TURSO_DATABASE_URL || 'file:acc_local.db';
        return u.replace('libsql://', 'https://');
    })(),
    authToken: process.env.TURSO_AUTH_TOKEN
});

/**
 * GET /acc/stats/:userId
 * Returns user asset snapshot + transaction summary
 */
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const assetsRes = await accDb.execute({
            sql: 'SELECT * FROM user_assets WHERE user_id = ?',
            args: [userId]
        });

        const historyRes = await accDb.execute({
            sql: 'SELECT type, asset_type, amount FROM asset_transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 200',
            args: [userId]
        });

        const history = historyRes.rows;
        const totalSpent = history
            .filter(t => t.type === 'debit' || t.type === 'spend')
            .reduce((s, t) => s + (t.amount || 0), 0);
        const totalEarned = history
            .filter(t => t.type === 'credit' || t.type === 'earn')
            .reduce((s, t) => s + (t.amount || 0), 0);

        res.json({
            success: true,
            assets: assetsRes.rows[0] || null,
            stats: {
                totalTransactions: history.length,
                totalSpent,
                totalEarned
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /acc/check-balance
 * Check if a user has sufficient balance for an operation
 *
 * Body: { userId, assetType, required }
 */
router.post('/check-balance', async (req, res) => {
    try {
        const { userId, assetType, required } = req.body;

        if (!userId || !assetType || required == null) {
            return res.status(400).json({ success: false, error: 'userId, assetType, and required are required' });
        }

        const column = assetType === 'codes' ? 'codes_count'
            : assetType === 'silver' ? 'silver_balance'
            : assetType === 'gold' ? 'gold_balance'
            : null;

        if (!column) {
            return res.status(400).json({ success: false, error: `Unknown assetType: ${assetType}` });
        }

        const assetsRes = await accDb.execute({
            sql: `SELECT ${column} as balance FROM user_assets WHERE user_id = ?`,
            args: [userId]
        });

        const balance = assetsRes.rows[0]?.balance || 0;

        res.json({
            success: true,
            sufficient: balance >= required,
            balance,
            required,
            assetType
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
