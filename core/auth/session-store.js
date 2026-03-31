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
        if (res.rows.length === 0) return null;

        return {
            userId: res.rows[0].user_id,
            expiresAt: res.rows[0].expires_at
        };
    },

    /**
     * Revoke a session
     * @param {string} sessionId 
     */
    async revokeSession(sessionId) {
            [sessionId]
        );
    },

    /**
     * Revoke all sessions for a user
     * @param {string} userId 
     */
    async revokeAllForUser(userId) {
            [userId]
        );
    }
};
