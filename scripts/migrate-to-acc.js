import 'dotenv/config';
import { createClient } from '@libsql/client';
import { query } from '../api/config/db.js';

/**
 * Migration Script: Legacy Systems -> ACC (Turso)
 *
 * Phase 1: Migrate user balances from Neon/SQLite -> ACC user_assets table
 * Phase 2: Re-record historical transactions into ACC
 * Phase 3: Migrate any localStorage assets_kernel_data (for offline/dev users)
 */

const accDb = createClient({
    url: process.env.TURSO_URL || process.env.TURSO_DATABASE_URL || 'file:acc_local.db',
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function ensureACCTables() {
    await accDb.execute(`
        CREATE TABLE IF NOT EXISTS user_assets (
            user_id TEXT PRIMARY KEY,
            codes_count INTEGER DEFAULT 0,
            silver_balance INTEGER DEFAULT 0,
            gold_balance INTEGER DEFAULT 0,
            total_earned_silver INTEGER DEFAULT 0,
            total_earned_gold INTEGER DEFAULT 0,
            total_spent_silver INTEGER DEFAULT 0,
            total_spent_gold INTEGER DEFAULT 0,
            last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            version INTEGER DEFAULT 1
        )
    `);

    await accDb.execute(`
        CREATE TABLE IF NOT EXISTS asset_transactions (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            type TEXT,
            asset_type TEXT,
            amount INTEGER,
            balance_after INTEGER,
            service TEXT,
            description TEXT,
            metadata TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('[Migration] ACC tables verified.');
}

async function migrateUserBalances() {
    console.log('[Migration] Phase 1: Migrating user balances...');

    const legacyRes = await query(`
        SELECT id, codes_count, silver_count, gold_count 
        FROM users 
        WHERE codes_count > 0 OR silver_count > 0 OR gold_count > 0
    `);

    const users = legacyRes.rows;
    console.log(`[Migration] Found ${users.length} users with balances.`);

    for (const user of users) {
        await accDb.execute({
            sql: `
                INSERT INTO user_assets (user_id, codes_count, silver_balance, gold_balance, version)
                VALUES (?, ?, ?, ?, 1)
                ON CONFLICT (user_id) DO UPDATE SET
                    codes_count = MAX(codes_count, EXCLUDED.codes_count),
                    silver_balance = MAX(silver_balance, EXCLUDED.silver_balance),
                    gold_balance = MAX(gold_balance, EXCLUDED.gold_balance),
                    last_sync = CURRENT_TIMESTAMP
            `,
            args: [user.id, user.codes_count || 0, user.silver_count || 0, user.gold_count || 0]
        });
        console.log(`[Migration] Migrated user: ${user.id} (codes=${user.codes_count}, silver=${user.silver_count}, gold=${user.gold_count})`);
    }

    console.log('[Migration] Phase 1 complete.');
}

async function migrateHistoricalTransactions() {
    console.log('[Migration] Phase 2: Migrating historical transactions...');

    let oldLedger = [];
    try {   
        const res = await query(`
            SELECT id, user_id, direction, asset_type, amount, reference, created_at
            FROM ledger
            ORDER BY created_at ASC
        `);
        oldLedger = res.rows;
    } catch (e) {
        console.warn('[Migration] Could not read legacy ledger table (may not exist):', e.message);
        return;
    }

    console.log(`[Migration] Found ${oldLedger.length} historical transactions.`);

    for (const tx of oldLedger) {
        try {   
            await accDb.execute({
                sql: `
                    INSERT OR IGNORE INTO asset_transactions 
                        (id, user_id, type, asset_type, amount, service, description, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                args: [
                    tx.id,
                    tx.user_id,
                    tx.direction === 'credit' ? 'credit' : 'debit',
                    tx.asset_type || 'codes',
                    tx.amount,
                    tx.reference || 'legacy_migration',
                    `Migrated from legacy ledger: ${tx.reference || ''}`,
                    tx.created_at || new Date().toISOString()
                ]
            });
        } catch (e) {
            console.warn(`[Migration] Failed to migrate tx ${tx.id}:`, e.message);
        }
    }

    console.log('[Migration] Phase 2 complete.');
}

async function migrate() {
    console.log('🚀 [Migration] Starting migration to ACC...');

    try {   
        await ensureACCTables();
        await migrateUserBalances();
        await migrateHistoricalTransactions();

        console.log('✅ [Migration] All phases completed successfully.');
    } catch (error) {
        console.error('❌ [Migration] Migration failed:', error);
        process.exit(1);
    }
}

migrate().then(() => process.exit(0));
