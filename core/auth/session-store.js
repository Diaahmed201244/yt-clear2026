<<<<<<< HEAD

import { NeonAdapter } from '../../neon/neon-server-adapter.js';
=======
import { query } from '../../api/config/db.js';
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
import crypto from 'crypto';

// Hash token before storage to prevent leakage if DB is compromised
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export const SessionStore = {
    /**
     * Create a new session for a user
     * @param {string} userId - The user's UUID
     * @param {number} ttlSeconds - Time to live in seconds (default 7 days)
     * @returns {Promise<{sessionId: string, token: string, expiresAt: Date}>}
     */
    async createSession(userId, ttlSeconds = 604800) {
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashToken(token);
<<<<<<< HEAD
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

        const sql = `
            INSERT INTO auth_sessions (user_id, token_hash, expires_at)
            VALUES ($1, $2, $3)
            RETURNING session_id;
        `;

        const res = await NeonAdapter.query(sql, [userId, tokenHash, expiresAt]);
        const sessionId = res.rows[0].session_id;

        return {
            sessionId,
=======
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
        const sessionId = crypto.randomUUID();

        const sql = `
            INSERT INTO auth_sessions (id, user_id, token, token_hash, expires_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;

        const res = await query(sql, [sessionId, userId, token, tokenHash, expiresAt]);
        const id = res.rows[0].id;

        return {
            sessionId: id,
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
            token, // Return raw token ONLY here
            expiresAt
        };
    },

    /**
     * Find a valid session by raw token
     * @param {string} token 
     * @returns {Promise<{userId: string, sessionId: string} | null>}
     */
    async getSession(token) {
        const tokenHash = hashToken(token);
        const sql = `
<<<<<<< HEAD
            SELECT session_id, user_id, expires_at, revoked
            FROM auth_sessions
            WHERE token_hash = $1
            AND revoked = FALSE
            AND expires_at > NOW();
        `;

        const res = await NeonAdapter.query(sql, [tokenHash]);
=======
            SELECT id, user_id, expires_at, revoked
            FROM auth_sessions
            WHERE (token = $1 OR token_hash = $2)
            AND revoked = 0
            AND expires_at > CURRENT_TIMESTAMP;
        `;

        const res = await query(sql, [token, tokenHash]);
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
        if (res.rows.length === 0) return null;

        return {
            userId: res.rows[0].user_id,
<<<<<<< HEAD
            sessionId: res.rows[0].session_id,
=======
            sessionId: res.rows[0].id,
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
            expiresAt: res.rows[0].expires_at
        };
    },

    /**
     * Revoke a session
     * @param {string} sessionId 
     */
    async revokeSession(sessionId) {
<<<<<<< HEAD
        await NeonAdapter.query(
            'UPDATE auth_sessions SET revoked = TRUE WHERE session_id = $1',
=======
        await query(
            'UPDATE auth_sessions SET revoked = 1 WHERE id = $1',
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
            [sessionId]
        );
    },

    /**
     * Revoke all sessions for a user
     * @param {string} userId 
     */
    async revokeAllForUser(userId) {
<<<<<<< HEAD
        await NeonAdapter.query(
            'UPDATE auth_sessions SET revoked = TRUE WHERE user_id = $1',
=======
        await query(
            'UPDATE auth_sessions SET revoked = 1 WHERE user_id = $1',
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
            [userId]
        );
    }
};
