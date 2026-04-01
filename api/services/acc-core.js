import { createClient } from '@libsql/client/http';
import dotenv from 'dotenv';

dotenv.config();

const tursoUrlStr = process.env.TURSO_URL || process.env.TURSO_DATABASE_URL || 'file:acc_local.db';
const httpUrlStr = tursoUrlStr.replace('libsql://', 'https://');

export const accDb = createClient({
    url: httpUrlStr,
    authToken: process.env.TURSO_AUTH_TOKEN
});

export async function initAccTables() {
    try { 
        await accDb.execute(`
            CREATE TABLE IF NOT EXISTS user_assets (
                user_id TEXT PRIMARY KEY,
                codes_count INTEGER DEFAULT 0,
                silver_balance INTEGER DEFAULT 0,
                gold_balance INTEGER DEFAULT 0,
                version INTEGER DEFAULT 1,
                last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Safe migrations — add columns if they don't exist yet
        const migrations = [
            `ALTER TABLE user_assets ADD COLUMN codes_count INTEGER DEFAULT 0`,
            `ALTER TABLE user_assets ADD COLUMN silver_balance INTEGER DEFAULT 0`,
            `ALTER TABLE user_assets ADD COLUMN gold_balance INTEGER DEFAULT 0`,
            `ALTER TABLE user_assets ADD COLUMN version INTEGER DEFAULT 1`,
            `ALTER TABLE user_assets ADD COLUMN last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
        ];
        for (const sql of migrations) {
            try {  await accDb.execute(sql); } catch (_) { /* column already exists */ }
        }

        console.log('🏛️ [ACC] Database tables initialized');
    } catch (e) {
        console.error('❌ [ACC] Failed to initialize tables:', e.message);
    }
}

export async function getUserAssets(userId) {
    // Query aggregated totals — handles both legacy (asset_id composite PK) and new schema
    const result = await accDb.execute({
        sql: `SELECT user_id,
                     SUM(codes_count) as codes_count,
                     SUM(silver_balance) as silver_balance,
                     SUM(gold_balance) as gold_balance,
                     MAX(version) as version
              FROM user_assets WHERE user_id = ? GROUP BY user_id`,
        args: [userId]
    });

    if (!result.rows[0]) {
        // Insert initial row — use asset_id='init' to satisfy any NOT NULL constraint
        await accDb.execute({
            sql: `INSERT INTO user_assets (user_id, asset_id, codes_count, silver_balance, gold_balance, version)
                  VALUES (?, 'init', 0, 0, 0, 1)
                  ON CONFLICT DO NOTHING`,
            args: [userId]
        }).catch(() =>
            // Fallback if asset_id column doesn't exist in new schema
            accDb.execute({
                sql: `INSERT INTO user_assets (user_id, codes_count, silver_balance, gold_balance, version)
                      VALUES (?, 0, 0, 0, 1) ON CONFLICT DO NOTHING`,
                args: [userId]
            })
        );
        return { user_id: userId, codes_count: 0, silver_balance: 0, gold_balance: 0, version: 1 };
    }
    return result.rows[0];
}

export async function processAccTransaction({ userId, type, assetType, amount }) {
    const column = assetType === 'codes' ? 'codes_count' : 
                   assetType === 'silver' ? 'silver_balance' : 'gold_balance';
    
    const multiplier = (type === 'spend' || type === 'debit') ? -1 : 1;
    
    await accDb.execute({
        sql: `UPDATE user_assets SET ${column} = ${column} + ?, version = version + 1 WHERE user_id = ?`,
        args: [amount * multiplier, userId]
    });
    
    return { success: true, userId, type, assetType, amount };
}
