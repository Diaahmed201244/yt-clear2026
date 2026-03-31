<<<<<<< HEAD

import { NeonAdapter } from '../../neon/neon-server-adapter.js';

export const LedgerWriter = {
    /**
     * Record an event to the immutable ledger.
     * @param {object} event
     * @param {string} event.userId
     * @param {string} event.eventType - One of LEDGER_EVENTS
     * @param {string} event.assetType
     * @param {number} event.amount
     * @param {object} event.metadata - Additional context (reason, lockId, etc.)
     * @param {object} [client] - Optional DB client for transaction context
     */
    async record({ userId, eventType, assetType, amount, metadata = {} }, client = null) {
        const sql = `
            INSERT INTO ledger_events (id, user_id, event_type, asset_type, amount, metadata)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
        `;
        const params = [userId, eventType, assetType, amount, metadata];
=======
import { query } from '../../api/config/db.js';
import crypto from 'crypto';

export const LedgerWriter = {
    /**
     * Record an event to the ledger.
     * Primary: ACC via requestTransaction.
     * Fallback: direct DB write.
     *
     * @param {object} event
     * @param {string} event.userId
     * @param {string} event.eventType
     * @param {string} event.assetType
     * @param {number} event.amount
     * @param {object} event.metadata
     * @param {object} [client] - Optional DB client for transaction context
     */
    async record({ userId, eventType, assetType, amount, metadata = {} }, client = null) {
        // ACC path - use when global ACCClient is available and connected
        if (typeof globalThis.ACCClient !== 'undefined' && globalThis.ACCClient?.connected) {
            try {
                await globalThis.ACCClient.requestTransaction(
                    eventType,
                    amount,
                    assetType,
                    { service: metadata.service || 'ledger', description: eventType, metadata }
                );
                return;
            } catch (accErr) {
                console.warn('[LedgerWriter] ACC write failed, falling back to DB:', accErr.message);
            }
        }

        // Fallback: direct DB write
        const sql = `
            INSERT INTO ledger_events (id, user_id, event_type, asset_type, amount, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const params = [crypto.randomUUID(), userId, eventType, assetType, amount, JSON.stringify(metadata)];
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)

        if (client) {
            await client.query(sql, params);
        } else {
<<<<<<< HEAD
            await NeonAdapter.query(sql, params);
=======
            await query(sql, params);
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
        }
    }
};
