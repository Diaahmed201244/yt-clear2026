/**
 * ACC Adapter - Unified access to Assets Central Core
 * The ONLY way any UI or service talks to ACC.
 *
 * Usage:
 *   window.ACC.init(userId, token)
 *   window.ACC.spend(amount, 'silver', { service: 'pebalaash' })
 *   window.ACC.earn(amount, 'codes', { source: 'screenshot' })
 *   window.ACC.getBalance('silver')
 */

class ACCAdapter {
    static instance = null;

    static getInstance() {
        if (!ACCAdapter.instance) {
            ACCAdapter.instance = new ACCAdapter();
        }
        return ACCAdapter.instance;
    }

    constructor() {
        this.acc = null;
        this.initialized = false;
        this.userId = null;
    }

    /**
     * Initialize ACC for a specific user.
     * Called automatically by auth-core.js after login.
     *
     * @param {string} userId
     * @param {string} [sessionToken] - Session token; an ACC-scoped token is fetched from /api/auth/acc-token
     */
    async init(userId, sessionToken) {
        if (this.initialized && this.userId === userId) return this.acc;

        this.userId = userId;

        const config = window.ACC_CONFIG || {
            serverUrl: 'ws://localhost:3001/acc-ws',
            httpUrl: 'http://localhost:3001/acc'
        };

        if (window.ACCClient) {
            let accToken = sessionToken;

            // Fetch a scoped ACC token from the server
            try { 
                const res = await fetch('/api/auth/acc-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    accToken = data.token || sessionToken;
                }
            } catch (e) {
                console.warn('[ACC-Adapter] Could not fetch ACC token, using session token:', e.message);
            }

            this.acc = window.ACCClient.init
                ? window.ACCClient.init({ userId, token: accToken, serverUrl: config.serverUrl, httpUrl: config.httpUrl })
                : new window.ACCClient({ userId, token: accToken, serverUrl: config.serverUrl, httpUrl: config.httpUrl });

            this.initialized = true;
            console.log(`[ACC-Adapter] Initialized for user: ${userId}`);

            window.dispatchEvent(new CustomEvent('acc:ready', { detail: { userId } }));
        } else {
            console.error('[ACC-Adapter] ACCClient not found in global scope');
        }

        return this.acc;
    }

    _isACCEnabled() {
        return !!(window.FEATURES?.USE_ACC !== false);
    }

    // --- Unified Interfaces ---

    async spend(amount, assetType = 'silver', metadata = {}) {
        if (!this._isACCEnabled()) {
            console.warn('[ACC-Adapter] USE_ACC disabled. Skipping spend.');
            return { success: true, legacy: true };
        }
        if (!this.acc) throw new Error('[ACC-Adapter] Not initialized');
        return await this.acc.spend(amount, assetType, metadata);
    }

    async earn(amount, assetType = 'silver', metadata = {}) {
        if (!this._isACCEnabled()) {
            console.warn('[ACC-Adapter] USE_ACC disabled. Skipping earn.');
            return { success: true, legacy: true };
        }
        if (!this.acc) throw new Error('[ACC-Adapter] Not initialized');
        return await this.acc.earn(amount, assetType, metadata);
    }

    async barter(amount, assetType = 'silver', metadata = {}) {
        if (!this._isACCEnabled()) {
            console.warn('[ACC-Adapter] USE_ACC disabled. Skipping barter.');
            return { success: true, legacy: true };
        }
        if (!this.acc) throw new Error('[ACC-Adapter] Not initialized');
        return await this.acc.barter(amount, assetType, metadata);
    }

    async requestTransaction(type, amount, assetType, metadata = {}) {
        if (!this._isACCEnabled()) return { success: true, legacy: true };
        if (!this.acc) throw new Error('[ACC-Adapter] Not initialized');
        if (typeof this.acc.requestTransaction === 'function') {
            return await this.acc.requestTransaction(type, amount, assetType, metadata);
        }
        const action = (type === 'debit' || type === 'spend') ? 'spend' : 'earn';
        return await this.acc[action](amount, assetType, metadata);
    }

    getBalance(assetType) {
        if (!this.acc) return 0;
        return this.acc.getBalance(assetType) || 0;
    }

    getAssets() {
        return this.acc ? this.acc.getAssets() : null;
    }

    onAssetsUpdated(callback) {
        if (this.acc && typeof this.acc.on === 'function') {
            this.acc.on('assetsUpdated', callback);
        }
    }

    registerBridge(name, bridge) {
        if (this.acc && typeof this.acc.registerBridge === 'function') {
            this.acc.registerBridge(name, bridge);
        }
    }
}

window.ACC = ACCAdapter.getInstance();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ACCAdapter;
}
