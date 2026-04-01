import { AppRegistry } from './app-registry.js';

// State for the launcher
const State = {
    isAppOpen: false,
    currentApp: null,
    openedApps: new Map(), // 🚀 PHASE 4: PREVENT MULTIPLE IFRAMES
    stats: {
        codes: 0
    }
};

// Recursive function to try URLs until one works
async function tryOpenService(app, fallbackIndex = 0) {
    // 🚀 PHASE 4: Single Instance Policy
    if (State.openedApps.has(app.id)) {
        console.log("⚠️ App already open, focusing:", app.id);
        const modal = document.getElementById('service-modal');
        if (modal) modal.classList.add('active');
        return;
    }

    const urls = [app.url, ...(app.fallbackUrls || [])];
    
    if (fallbackIndex >= urls.length) {
        // All URLs failed
        console.error('[CodeBank] All URLs failed for', app.id, ':', urls);
        if (window.showToast) window.showToast(`Failed to open ${app.name}. Service not found.`, 'error', 5000);
        State.isAppOpen = false;
        State.currentApp = null;
        return;
    }
    
    const url = urls[fallbackIndex];
    console.log(`[CodeBank] Opening service:`, url);
    
    // Set current app state
    State.currentApp = app;
    State.isAppOpen = true;

    // Use the modal implementation from indexCB.html
    const modal = document.getElementById('service-modal');
    const modalIframe = document.getElementById('service-modal-iframe');
    const modalTitle = document.getElementById('service-modal-title');
    const modalLoading = document.getElementById('service-modal-loading');

    if (!modal || !modalIframe) {
        console.error('[CodeBank] Modal elements not found');
        // Fallback: open in new window
        window.open(url, app.name, 'width=800,height=600');
        return;
    }

    // Show modal and loading state
    modal.classList.add('active');
    if (modalTitle) modalTitle.textContent = app.name;
    modalLoading?.classList.remove('hidden');
    modalLoading.style.display = 'flex';

    // Set up error detection
    let loadTimeout;
    let hasLoaded = false;
    
    const cleanup = () => {
        clearTimeout(loadTimeout);
        modalIframe.onerror = null;
        modalIframe.onload = null;
    };
    
    // Success handler
    modalIframe.onload = () => {
        if (hasLoaded) return;
        hasLoaded = true;
        cleanup();
        
        console.log('[CodeBank] Service iframe loaded:', app.name);
        
        // Hide loading after a short delay to allow content to render
        setTimeout(() => {
            modalLoading?.classList.add('hidden');
            modalLoading.style.display = 'none';
        }, 500);
        
        // 🚀 PHASE 4: Track opened app
        State.openedApps.set(app.id, modalIframe);
        
        // Send init message to iframe
        setTimeout(() => {
            sendInitToIframe(modalIframe, app);
        }, 100);
    };
    
    // Error handler
    modalIframe.onerror = (e) => {
        cleanup();
        console.error('[CodeBank] Iframe error for:', url, e);
        
        // Try next fallback URL
        if (fallbackIndex + 1 < urls.length) {
            console.log(`[CodeBank] Trying fallback URL ${fallbackIndex + 1}:`, urls[fallbackIndex + 1]);
            tryOpenService(app, fallbackIndex + 1);
        } else {
            // Show error state
            modalLoading.innerHTML = `
                <div class="text-center">
                    <div class="text-red-500 text-4xl mb-4">⚠️</div>
                    <h3 class="text-white text-lg mb-2">Failed to Load ${app.name}</h3>
                    <p class="text-gray-400 mb-4">Service could not be reached</p>
                    <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Retry</button>
                </div>
            `;
        }
    };
    
    // Timeout handler (increased to 10 seconds for better reliability)
    loadTimeout = setTimeout(() => {
        if (hasLoaded) return;
        cleanup();
        console.warn('[CodeBank] Load timeout for:', url);
        
        // Try next fallback URL
        if (fallbackIndex + 1 < urls.length) {
            console.log(`[CodeBank] Timeout - trying fallback URL ${fallbackIndex + 1}:`, urls[fallbackIndex + 1]);
            tryOpenService(app, fallbackIndex + 1);
        } else {
            // Hide loading but don't show error - let the iframe continue loading
            modalLoading?.classList.add('hidden');
            modalLoading.style.display = 'none';
            console.log('[CodeBank] Timeout reached but allowing iframe to continue loading');
        }
    }, 10000);
    
    // Set the source to load the service
    modalIframe.src = url;

    // 🚀 YAHOOD! SPECIAL HANDLING (from actly.md)
    if (app.id === 'yahood') {
        console.log('[Launcher] Applying Yahood! Special Permissions...');
        modalIframe.allow = 'microphone; camera; geolocation; autoplay';
        modalIframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';
        
        // Setup specialized bridges
        setupYahoodBridge(modalIframe);
        setupYahoodSocketRelay(modalIframe);
    }
}

// Helper function to send init message to iframe
function sendInitToIframe(iframe, app) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Get codes from AssetBus if available
        let codes = [];
        if (window.AssetBus && typeof window.AssetBus.snapshot === 'function') {
            const snap = window.AssetBus.snapshot();
            codes = snap.codes || [];
        }
        
        // Fallback to localStorage
        if (!codes.length) {
            codes = JSON.parse(localStorage.getItem('safeCodes') || localStorage.getItem('bankode_codes') || '[]');
        }
        
        iframe.contentWindow.postMessage({
            type: 'auth:ready',
            source: 'codebank-parent',
            serviceId: app.id,
            payload: {
                user: user,
                codes: codes,
                timestamp: Date.now()
            }
        }, '*');
        
        console.log('[CodeBank] Sent auth:ready to iframe with', codes.length, 'codes');
    } catch (e) {
        console.error('[CodeBank] Failed to send init:', e);
    }
}

// Initialize the launcher UI
export function initLauncher() {
    console.log('[AppLauncher] Initializing...');
    
    // Categories and their container IDs
    const categories = {
        core: 'core-apps',
        media: 'media-apps',
        finance: 'finance-apps',
        games: 'games-apps',
        tools: 'tools-apps'
    };

    // Render each category
    Object.entries(categories).forEach(([category, containerId]) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Clear container
        container.innerHTML = '';

        // Get apps for this category
        const apps = AppRegistry[category] || [];
        
        apps.forEach(app => {
            const card = document.createElement('div');
            card.className = 'app-card';
            card.setAttribute('data-id', app.id);
            
            // Icon wrapper
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'app-icon-wrapper';
            if (app.color) iconWrapper.style.color = app.color;
            
            const icon = document.createElement('i');
            // Ensure font-awesome classes are correct
            const iconClass = app.icon.startsWith('fa-') ? `fas ${app.icon}` : app.icon;
            icon.className = iconClass;
            
            iconWrapper.appendChild(icon);
            
            // App name
            const name = document.createElement('span');
            name.className = 'text-xs font-semibold text-gray-300 text-center';
            name.textContent = app.name;
            
            // Badge (if exists)
            if (app.badge) {
                const badge = document.createElement('div');
                badge.className = 'absolute -top-1 -right-1 bg-blue-600 text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold';
                badge.textContent = app.badge;
                iconWrapper.style.position = 'relative';
                iconWrapper.appendChild(badge);
            }
            
            card.appendChild(iconWrapper);
            card.appendChild(name);
            
            // Click handler
            card.addEventListener('click', () => tryOpenService(app, 0));
            
            container.appendChild(card);
        });
    });

    // Set up modal controls if not already done
    setupModalControls();
}

function setupModalControls() {
    const modal = document.getElementById('service-modal');
    const closeBtn = document.getElementById('service-modal-close');
    const backBtn = document.getElementById('service-modal-back');
    const reloadBtn = document.getElementById('service-modal-reload');
    const iframe = document.getElementById('service-modal-iframe');

    if (closeBtn && modal) {
        closeBtn.onclick = () => {
            modal.classList.remove('active');
            
            // Phase 1: Proper Iframe Destruction
            if (iframe) {
                console.log('[AppLauncher] Destroying iframe for GC');
                
                // 🚀 PHASE 4: Remove from tracked apps
                if (State.currentApp) {
                    State.openedApps.delete(State.currentApp.id);
                }

                try {
                    // Send destroy signal
                    if (iframe.contentWindow) {
                        iframe.contentWindow.postMessage({ type: 'service:destroy' }, "*");
                    }
                    iframe.src = 'about:blank';
                    
                    // Remove from DOM and re-add fresh one
                    const container = iframe.parentNode;
                    if (container) {
                        const newIframe = document.createElement('iframe');
                        newIframe.id = 'service-modal-iframe';
                        newIframe.sandbox = iframe.sandbox;
                        container.replaceChild(newIframe, iframe);
                    }
                } catch (e) {
                    iframe.src = 'about:blank';
                }
            }
            
            State.isAppOpen = false;
            State.currentApp = null;
            
            // Trigger GC hint
            if (window.gc) try { window.gc(); } catch(_) {}
        };
    }

    if (backBtn && modal) {
        backBtn.onclick = () => {
            if (closeBtn) closeBtn.click(); // Reuse cleanup logic
        };
    }

    if (reloadBtn && iframe) {
        reloadBtn.onclick = () => {
            const currentUrl = iframe.src;
            iframe.src = 'about:blank';
            setTimeout(() => { iframe.src = currentUrl; }, 100);
        };
    }
}

// Update launcher statistics
export function updateStats(stats) {
    if (!stats) return;
    
    if (typeof stats.codes === 'number') {
        State.stats.codes = stats.codes;
        
        // Update UI elements
        const headerCount = document.getElementById('header-codes-count');
        if (headerCount) headerCount.textContent = stats.codes;
        
        const missionCurrent = document.getElementById('mission-current-count');
        if (missionCurrent) missionCurrent.textContent = stats.codes;

        // Update mission progress bar
        const missionFill = document.getElementById('mission-progress-fill');
        const missionTarget = 1000; // Default target
        if (missionFill) {
            const percentage = Math.min(100, (stats.codes / missionTarget) * 100);
            missionFill.style.width = `${percentage}%`;
            
            // Update tier colors
            missionFill.className = 'progress-fill';
            if (percentage < 30) missionFill.classList.add('tier-grey');
            else if (percentage < 70) missionFill.classList.add('tier-green');
            else missionFill.classList.add('tier-silver');
        }
    }
}

// YAHOOD! SERVICE BRIDGE (from actly.md)

function setupYahoodBridge(iframe) {
    window.addEventListener('message', (e) => {
        if (e.source !== iframe.contentWindow) return;
        
        const { type, data } = e.data;
        
        switch(type) {
            case 'yahood:acc:transaction':
                handleYahoodTransaction(data, iframe);
                break;
                
            case 'yahood:acc:getBalance':
                getYahoodBalance(e.source);
                break;
                
            case 'yahood:auth:getUser':
                sendYahoodUserInfo(e.source);
                break;
                
            case 'yahood:service:ready':
                console.log('[Launcher] Yahood! service ready');
                break;
                
            case 'yahood:socket:emit':
                if (window.yahoodSocket) {
                    window.yahoodSocket.emit(data.event, data.payload);
                }
                break;
        }
    });
}

function setupYahoodSocketRelay(iframe) {
    // io() must be available globally from socket.io client script in indexCB.html
    if (typeof io !== 'function') {
        console.warn('[Launcher] Socket.io client not found, relay disabled');
        return;
    }
    
    const socket = io();
    window.yahoodSocket = socket;
    
    const yahoodEvents = [
        'yahood:player:nearby',
        'yahood:treasure:found',
        'yahood:thief:alert',
        'yahood:theft:occurred',
        'yahood:land:dispute',
        'yahood:voice:call',
        'yahood:chat:proximity'
    ];
    
    yahoodEvents.forEach(event => {
        socket.on(event, (data) => {
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'yahood:socket:event',
                    event: event,
                    data: data
                }, '*');
            }
        });
    });
}

async function handleYahoodTransaction(data, iframe) {
    // 🛡️ INTEGRATION: Try BankodeAssetBusBridge or ACCBridge
    const bridge = window.ACCBridge || window.BankodeAssetBusBridge;
    if (bridge) {
        try {
            const result = await bridge.transaction({
                type: data.assetType,
                amount: data.amount,
                action: data.action,
                reason: `Yahood! ${data.reason}`,
                service: 'yahood'
            });
            
            iframe.contentWindow.postMessage({
                type: 'acc:transaction:response',
                success: result.success,
                data: result
            }, '*');
        } catch (e) {
            console.error('[YahoodTransaction] Error:', e);
            iframe.contentWindow.postMessage({
                type: 'acc:transaction:response',
                success: false,
                error: e.message
            }, '*');
        }
    } else {
        console.warn('[Launcher] No ACC bridge found for Yahood transaction');
    }
}

function getYahoodBalance(targetWindow) {
    if (window.BankodeAssetBusBridge && typeof window.BankodeAssetBusBridge.getSnapshot === 'function') {
        window.BankodeAssetBusBridge.getSnapshot().then(snapshot => {
            targetWindow.postMessage({
                type: 'acc:balance:response',
                balance: snapshot || { codes: 0, silver: 0, gold: 0 }
            }, '*');
        });
    } else if (window.AssetBus && typeof window.AssetBus.getState === 'function') {
        const state = window.AssetBus.getState();
        targetWindow.postMessage({
            type: 'acc:balance:response',
            balance: {
                codes: state.count || state.codes?.length || 0,
                silver: state.silver?.length || 0,
                gold: state.gold?.length || 0
            }
        }, '*');
    }
}

function sendYahoodUserInfo(targetWindow) {
    // Sniff multiple auth core locations
    const authState = window.AuthCore?.getState?.() || 
                      window.BankodeAuth?.getState?.() || 
                      { authenticated: !!localStorage.getItem('session_active') };
    
    targetWindow.postMessage({
        type: 'auth:user:response',
        user: authState.user || { id: localStorage.getItem('user_id') },
        authenticated: authState.authenticated,
        sessionId: authState.sessionId || localStorage.getItem('session_token')
    }, '*');
}

