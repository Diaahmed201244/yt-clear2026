/**
 * Bankode AssetBus Bridge - GLOBAL PROVIDER
 */
(function(window) {
    'use strict';

    // This is the "Public Tap" that the iframe looks for
    let _lastPullLog = 0;
    window.GET_AUTHORITATIVE_ASSETS = function() {
        // Attempt to get data from AssetBus or Bankode Core
        const data = (window.AssetBus && typeof window.AssetBus.snapshot === 'function') 
            ? window.AssetBus.snapshot() 
            : (window.__BANKODE_INSTANCE__ && window.__BANKODE_INSTANCE__.snapshot 
                ? window.__BANKODE_INSTANCE__.snapshot() 
                : null);

        if (data) {
            const now = Date.now();
            if (now - _lastPullLog > 1000) { // Debounce logging to 1s
                console.log(`[Bridge] Direct Pull: Serving ${data.codes?.length || 0} codes.`);
                _lastPullLog = now;
            }
        }
        return data;
    };

    /**
     * writeCodeToSQLite - BRIDGING AGENT
     * Syncs a single generated code to the server's SQLite database.
     */
    window.writeCodeToSQLite = async function(data) {
        const { code } = data;
        console.log(`[Bridge] Syncing code to server: ${code}`);
        
        try { 
            const res = await fetch('/api/codes/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
                credentials: 'include'
            });
            
            const result = await res.json();
            
            if (res.ok && result.success) {
                console.log(`✅ [Bridge] Sync SUCCESS: ${code}`);
                // Notify AssetBus to refresh
                if (window.AssetBus && typeof window.AssetBus.sync === 'function') {
                    window.AssetBus.sync();
                }
                return { ok: true };
            } else {
                console.error(`❌ [Bridge] Sync FAILED: ${result.error || 'Unknown error'}`);
                return { ok: false, error: result.error };
            }
        } catch (err) {
            console.error('[Bridge] Sync EXCEPTION:', err);
            return { ok: false, error: err.message };
        }
    };

    // 🛡️ REMOVED: Prevent "Do you want to leave the site?" popup (from actly.md)
    // window.addEventListener('beforeunload', (e) => {
    //     const assets = window.AssetBus ? window.AssetBus.snapshot() : null;
    //     if (assets && assets.pending && assets.pending.length > 0) {
    //         e.preventDefault();
    //         e.returnValue = '';
    //     }
    // });

    console.log("✅ AssetBridge Agent: Global Provider is ACTIVE.");
})(window);