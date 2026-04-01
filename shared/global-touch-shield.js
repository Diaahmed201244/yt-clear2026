// global-touch-shield.js
// Manages global event shielding and fetch queuing until authentication is ready

(function() {
    'use strict';

    console.log('[AuthGate] Initializing Global Touch Shield...');

    // Listen for auth ready and process queued fetches
    window.addEventListener('auth:ready', () => {
        console.log('[AuthGate] Auth ready received, processing queue...');
        if (window.AuthGate && window.AuthGate.processQueue) {
            window.AuthGate.processQueue();
        }
    });

    // Initialize AuthGate if not exists
    if (!window.AuthGate) window.AuthGate = {};

    // Queue for pending requests
    window.AuthGate.queue = window.AuthGate.queue || [];

    /**
     * Processes any queued fetches once auth is ready
     */
    window.AuthGate.processQueue = function() {
        console.log('[AuthGate] Processing queued requests. Count:', this.queue.length);
        
        while (this.queue.length > 0) {
            const request = this.queue.shift();
            if (typeof request === 'function') {
                try { 
                    request();
                } catch (e) {
                    console.error('[AuthGate] Error processing queued request:', e);
                }
            }
        }
        console.log('[AuthGate] Queue processing complete');
    };

    /**
     * Utility to wrap a fetch or action that requires auth
     */
    window.AuthGate.shield = function(action) {
        if (window.__AUTH_READY__) {
            return action();
        } else {
            console.log('[AuthGate] Queuing action until auth ready...');
            this.queue.push(action);
        }
    };

    console.log('[AuthGate] READY');
})();
