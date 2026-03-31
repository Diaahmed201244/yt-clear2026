(function() {
    // 🛡️ RELOAD PROTECTION
    const reloadKey = 'last_reload_time';
    const minReloadInterval = 5000; 
    const lastReload = parseInt(localStorage.getItem(reloadKey) || '0');
    const now = Date.now();
    if (now - lastReload < minReloadInterval) {
        console.error('🚨 RELOAD LOOP DETECTED - Breaking cycle');
        localStorage.setItem('reload_loop_detected', 'true');
        localStorage.removeItem('auth_session');
        sessionStorage.clear();
        document.addEventListener('DOMContentLoaded', () => {
            document.body.innerHTML = `
                <div style="padding: 40px; text-align: center; font-family: sans-serif; background: #0d1117; color: white; height: 100vh;">
                    <h1 style="color: #ff6b6b;">⚠️ Reload Loop Detected</h1>
                    <p>The application was reloading too quickly.</p>
                    <button onclick="localStorage.clear(); location.href='/login.html'" 
                            style="padding: 12px 24px; margin-top: 20px; cursor: pointer; background: #00d4ff; border: none; border-radius: 8px; color: black; font-weight: bold;">
                        Clear All Data & Restart
                    </button>
                </div>
            `;
        });
        return;
    }
    localStorage.setItem(reloadKey, now.toString());

    // Browser Mode Setup
    console.warn("🟢 YT-Clear TRUE Browser Local Mode");
    const realLocalStorage = window.__proto__.localStorage || window.localStorage;
    Object.defineProperty(window, "localStorage", {
        value: realLocalStorage,
        writable: false,
        configurable: false,
        enumerable: true
    });
    delete window.StorageLord;
    delete window.__storageLord;
    window.__BROWSER_MODE__ = true;
    window.__DISABLE_STORAGE_LORD__ = true;
    window.__YTNEW_RUNTIME__ = "browser";

    // CSP Violation Logger
    window.addEventListener('securitypolicyviolation', function(e) {
        console.error('CSP VIOLATION:', {
            blockedURI: e.blockedURI,
            violatedDirective: e.violatedDirective,
            originalPolicy: e.originalPolicy
        });
    });

    // Toast Notification System
    let toastContainer = null;
    let lastBalances = { codes: null };
    let lastToastAt = 0;
    function ensureToastContainer() {
        let el = document.getElementById('toast-container');
        if (!el) {
            el = document.createElement('div');
            el.id = 'toast-container';
            document.body.appendChild(el);
        }
        toastContainer = el;
    }
    function toast(text) {
        ensureToastContainer();
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = String(text || '');
        toastContainer.appendChild(t);
        setTimeout(() => { try { t.remove(); } catch (_) { } }, 2000);
    }
    window.addEventListener('balances:updated', function(e) {
        const d = (e && e.detail && e.detail.balances) || {};
        const now = Date.now();
        const prev = lastBalances.codes;
        const curr = (typeof d.codes === 'number') ? d.codes : prev;
        if (curr == null) { lastBalances.codes = curr; return; }
        const delta = (prev == null) ? 0 : (curr - prev);
        lastBalances.codes = curr;
        if (delta === 0 || now - lastToastAt < 800) return;
        lastToastAt = now;
        toast((delta > 0 ? '+' : '') + String(delta) + ' codes');
    });

    // Asset Sync & Storage
    async function fetchSqliteCodesFirst() {
        try {
            const res = await fetch('/api/sync/list', { credentials: 'include' });
            if (!res.ok) return false;
            const data = await res.json();
            if (data && data.success && Array.isArray(data.codes) && data.codes.length > 0) {
                const latest = data.latest || (data.codes[0] && data.codes[0].code) || '';
                window.dispatchEvent(new CustomEvent('sqlite:snapshot', { detail: { latest, rows: data.codes } }));
                return true;
            }
            return false;
        } catch (e) { return false; }
    }

    window.addEventListener('auth:ready', async function(e) {
        if (e.detail && e.detail.authenticated) {
            console.log('[Main] Auth Ready detected, fetching codes...');
            await fetchSqliteCodesFirst();
        }
    });

    // 🚀 BOOTSTRAP: If auth-core already initialized before this script loaded
    if (window.AuthCore && window.AuthCore._state && window.AuthCore._state.authenticated) {
        console.log('[Main] Auth already authenticated, fetching codes immediately');
        fetchSqliteCodesFirst();
    }

    // Stopwatch Logic
    document.addEventListener('DOMContentLoaded', function() {
        const sw = document.getElementById('stopwatch');
        if (!sw) return;
        let running = false, startTs = 0, elapsedMs = 0, intervalId = null;
        const modal = document.getElementById('stopwatch-modal-overlay');
        const modalDisplay = document.getElementById('stopwatch-modal-display');
        
        function updateFmt() {
            const total = elapsedMs + (running ? (Date.now() - startTs) : 0);
            const deci = Math.floor(total / 100) % 10;
            const secs = Math.floor(total / 1000) % 60;
            const mins = Math.floor(total / 60000) % 60;
            const text = String(deci).padStart(2, '0') + ':' + String(secs).padStart(2, '0') + ':' + String(mins).padStart(2, '0');
            sw.textContent = text;
            if (modalDisplay) modalDisplay.textContent = text;
        }

        sw.addEventListener('click', () => {
            if (running) {
                running = false;
                elapsedMs += (Date.now() - startTs);
                clearInterval(intervalId);
            } else {
                running = true;
                startTs = Date.now();
                intervalId = setInterval(updateFmt, 100);
            }
            sw.classList.toggle('running', running);
        });
    });

    // Auth Redirect & Initial States
    function checkAuth() {
        if (window.location.pathname.includes('login.html')) return;
        const hasSession = document.cookie.includes('session_token');
        if (!hasSession) {
            setTimeout(() => {
                if (!document.cookie.includes('session_token')) {
                    window.location.href = '/login.html';
                }
            }, 2000);
        }
    }
    checkAuth();

    window.initAfterLogin = function(sessionId, user) {
        console.log('[initAfterLogin] Starting initialization...', { sessionId, user });
        
        // 1. Hide all loader elements by ID
        const loaderIds = [ 
            'loading-text', 
            'loading-overlay', 
            'loading-percentage', 
            'loading-screen', 
            'loader' 
        ]; 
        
        loaderIds.forEach(id => { 
            const el = document.getElementById(id); 
            if (el) { 
                el.style.transition = 'opacity 0.5s ease'; 
                el.style.opacity = '0'; 
                setTimeout(() => { 
                    el.style.display = 'none'; 
                    el.style.visibility = 'hidden'; 
                }, 500); 
                console.log('[initAfterLogin] Hidden loader:', id); 
            } 
        }); 
        
        // 2. Also hide by class 
        const loaderClasses = ['loading-screen', 'loader', 'initializing']; 
        loaderClasses.forEach(cls => { 
            document.querySelectorAll('.' + cls).forEach(el => { 
                el.style.display = 'none'; 
            }); 
        }); 

        // 3. Ensure body classes are cleaned up
        document.body.classList.remove('popup-active');
        
        // 4. Handle overlays
        const ov = document.getElementById('popup-overlay');
        if (ov) ov.style.display = 'none';

        // 5. Show main content (app container)
        const mainContent = document.getElementById('app') || 
                           document.getElementById('main') || 
                           document.querySelector('.main-content') ||
                           document.querySelector('.container.text-center.py-5'); 
        if (mainContent) { 
            console.log('[initAfterLogin] Showing main content');
            mainContent.style.display = 'block'; 
            mainContent.style.opacity = '1'; 
            mainContent.style.visibility = 'visible';
        } else {
            console.warn('[initAfterLogin] Main content container not found!');
        }

        console.log('[initAfterLogin] Initialization complete, dispatching yt-clear:ready');
        window.dispatchEvent(new CustomEvent('yt-clear:ready', { detail: { sessionId, user } }));
    };

    window.addEventListener('auth:ready', (e) => {
        if (e.detail && e.detail.authenticated) window.initAfterLogin();
    });

    // Code Display Sync
    (function() {
        const codeDisplay = document.getElementById('code-display');
        if (!codeDisplay) return;
        let lastCode = null;
        function updateUI(code) {
            if (code === lastCode) return;
            if (!code) {
                codeDisplay.textContent = 'Ready'; // Replace "Waiting for code..."
                return;
            }
            codeDisplay.textContent = code;
            lastCode = code;
            codeDisplay.classList.add('pulse');
            setTimeout(() => codeDisplay.classList.remove('pulse'), 800);
        }
        
        // Initial state from AssetBus if available
        const tryInitialUpdate = () => {
            if (window.AssetBus && typeof window.AssetBus.getState === 'function') {
                const s = window.AssetBus.getState();
                const code = s.latest || (s.codes && s.codes.length > 0 ? s.codes[s.codes.length-1] : null);
                if (code) updateUI(typeof code === 'string' ? code : code.code);
                else updateUI(null);
                return true;
            }
            return false;
        };
        
        if (!tryInitialUpdate()) {
            const int = setInterval(() => { if (tryInitialUpdate()) clearInterval(int); }, 500);
            setTimeout(() => clearInterval(int), 10000);
        }

        ['assets:updated', 'codes:updated', 'sqlite:snapshot', 'assetbus:ready'].forEach(evt => {
            window.addEventListener(evt, (e) => {
                const d = e.detail || {};
                const code = d.code || d.latest || d.latestCode || (Array.isArray(d.codes) && d.codes[0]);
                if (code) updateUI(typeof code === 'string' ? code : code.code);
                else if (evt === 'assetbus:ready' && !code) updateUI(null);
            });
        });
    })();
})();
