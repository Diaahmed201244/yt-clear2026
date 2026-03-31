/**
 * Watchdog <-> ACC Connector
 *
 * Role:
 *   - Listens to ACC events (via window events or ACC client callbacks)
 *   - Feeds anomaly data to WatchDogGuardian (observer)
 *   - Feeds data to AI brain if available
 *
 * This runs on the CLIENT side (browser).
 * It does NOT modify balances — it only observes and reports.
 */

const WatchdogACCBridge = (function () {
    let initialized = false;

    function init() {
        if (initialized) return;
        initialized = true;

        // Listen for ACC asset updates
        window.addEventListener('acc:assetsUpdated', onAssetsUpdated);

        // Listen for ACC transaction events
        window.addEventListener('acc:transaction', onTransaction);

        // If ACC is already initialized, hook into it directly
        _hookIntoACC();

        // Re-hook when ACC becomes ready
        window.addEventListener('acc:ready', () => _hookIntoACC());

        console.log('[WatchdogACCBridge] Initialized');
    }

    function _hookIntoACC() {
        if (!window.ACC?.acc) return;

        if (typeof window.ACC.acc.on === 'function') {
            window.ACC.acc.on('assetsUpdated', (assets) => {
                window.dispatchEvent(new CustomEvent('acc:assetsUpdated', { detail: assets }));
            });

            window.ACC.acc.on('transaction', (tx) => {
                window.dispatchEvent(new CustomEvent('acc:transaction', { detail: tx }));
            });
        }
    }

    function onAssetsUpdated(event) {
        const assets = event.detail;
        if (!assets) return;

        // Feed AI brain if available
        if (window.AIBrain && typeof window.AIBrain.onAssetsSnapshot === 'function') {
            window.AIBrain.onAssetsSnapshot(assets);
        }

        // Check for negative balances (client-side early warning)
        const fields = ['codes_count', 'silver_balance', 'gold_balance'];
        for (const field of fields) {
            if (typeof assets[field] === 'number' && assets[field] < 0) {
                console.error('[WatchdogACCBridge] ANOMALY: Negative balance detected', { field, value: assets[field] });
                window.dispatchEvent(new CustomEvent('watchdog:anomaly', {
                    detail: { type: 'NEGATIVE_BALANCE', field, value: assets[field], assets }
                }));
            }
        }
    }

    function onTransaction(event) {
        const tx = event.detail;
        if (!tx) return;

        // Feed AI brain
        if (window.AIBrain && typeof window.AIBrain.onTransaction === 'function') {
            window.AIBrain.onTransaction(tx);
        }

        // Large debit alert
        if ((tx.type === 'debit' || tx.type === 'spend') && tx.amount > 1000) {
            console.warn('[WatchdogACCBridge] ALERT: Large debit', tx);
            window.dispatchEvent(new CustomEvent('watchdog:alert', {
                detail: { type: 'LARGE_DEBIT', tx }
            }));
        }
    }

    return { init };
})();

// Auto-init when loaded
WatchdogACCBridge.init();

window.WatchdogACCBridge = WatchdogACCBridge;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WatchdogACCBridge;
}
