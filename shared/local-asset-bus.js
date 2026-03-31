// local-asset-bus.js
<<<<<<< HEAD
// UV: ASSETBUS-CLEAN-2026-02-18
// Deterministic, Proof-safe, Auth-agnostic

import { AssetPolicy } from './asset-policy.js';

let __MEM_STATE__ = null;
let __LAST_PROOF__ = null;
const __USED_PROOFS__ = new Set();
const PROOF_WINDOW_MS = 5000;
=======
// UV: ASSETBUS-ULTRA-HARDENED-2026-02-18
// Ledger Absolutism - Zero Trust Frontend Architecture

import { AssetPolicy } from './asset-policy.js';

let __VERIFIED_STATE__ = null;
let __IS_SYNCING__ = false;
let __LEDGER_LOCKED__ = true; // Default to locked
let __DRIFT_COUNT__ = 0; // 🛡️ DRIFT LOOP PREVENTION
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)

// ========================
// Utilities
// ========================
function now() {
  return Date.now();
}

<<<<<<< HEAD
function issueProof() {
  const ts = now();
  const proof =
    (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : ts + '-' + Math.random().toString(16).slice(2);

  __LAST_PROOF__ = {
    proof,
    ts,
    expiryTs: ts + PROOF_WINDOW_MS
  };
  return __LAST_PROOF__;
}

// ========================
// AssetProof API
// ========================
export const AssetProof = {
  verify(proof) {
    const p = __LAST_PROOF__;
    if (!p || p.proof !== proof) return false;
    if (__USED_PROOFS__.has(proof)) return false;
    if (now() > p.expiryTs) return false;
    __USED_PROOFS__.add(proof);
    return true;
  },
  current() {
    return __LAST_PROOF__;
  }
};

// ========================
// AssetBus
// ========================
export const AssetBus = {

  // -------- State --------
  getState() {
    if (__MEM_STATE__) return structuredClone(__MEM_STATE__);

    try {
      const ss = window.safeStorage;
      if (ss) {
        const raw = ss.get('codebank_assets');
        if (raw) {
          __MEM_STATE__ = JSON.parse(raw);
          return structuredClone(__MEM_STATE__);
        }
      }
    } catch (_) {}

    __MEM_STATE__ = {
      codes: [],
      silver: [],
      gold: [],
=======
/**
 * Fetch authoritative state from ledger (backend)
 * 🛡️ OFFLINE-FIRST: Fetches both counts AND actual codes from server.
 */
async function fetchLedgerState() {
  if (__IS_SYNCING__) return null;
  __IS_SYNCING__ = true;
  
  try {
    // FIXED: Fetch actual codes from /api/sync/list (the correct endpoint)
    const response = await fetch('/api/sync/list', {
      headers: { 'Cache-Control': 'no-cache' },
      credentials: 'include' // 🛡️ ADDED: Ensure session cookie is sent (from actly.md)
    });
    
    if (!response.ok) {
      console.warn('[AssetBus] Ledger fetch failed with status:', response.status);
      throw new Error('Ledger unreachable');
    }
    
    const data = await response.json();
    
    // FIXED: Map the actual server response structure to AssetBus state
    const newState = {
      codes: Array.isArray(data.codes) ? data.codes.map(c => c.code || c) : [],
      silver: Array.isArray(data.silver) ? data.silver : [],
      gold: Array.isArray(data.gold) ? data.gold : [],
      codes_count: Number(data.count) || 0,
      silver_count: Number(data.silver_count) || 0,
      gold_count: Number(data.gold_count) || 0,
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
      likes: 0,
      superlikes: 0,
      games: 0,
      transactions: 0,
<<<<<<< HEAD
      updatedAt: now()
    };

    return structuredClone(__MEM_STATE__);
  },

  snapshot() {
    return this.getState();
  },

  // -------- Core Update --------
  update(patch = {}, source = 'unknown') {
    const prev = this.getState();

    const next = {
      ...prev,
      ...patch,
      updatedAt: now()
    };

    const proof = issueProof();

    const detail = {
      ...next,
      type: source,
      ts: proof.ts,
      proof: proof.proof,
      expiryTs: proof.expiryTs
    };

    if (!AssetPolicy.validate(detail, { source })) {
      console.warn('[AssetBus] policy rejected update', source);
      return false;
    }

    __MEM_STATE__ = structuredClone(next);

    try {
      const ss = window.safeStorage;
      if (ss) ss.set('codebank_assets', JSON.stringify(__MEM_STATE__));
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('assets:updated', { detail }));
    window.dispatchEvent(new CustomEvent('assets:changed', { detail }));

    return true;
  },

  // -------- Add Asset --------
  addAsset(type, value) {
    const s = this.getState();
    const next = structuredClone(s);

    if (type === 'silver') {
      next.silver = [...new Set([...(next.silver || []), value])];
    } else if (type === 'gold') {
      next.gold = [...new Set([...(next.gold || []), value])];
    } else {
      next.codes = [...new Set([...(next.codes || []), value])];
    }

    return this.update(next, 'addAsset');
  }
};

// ========================
// Storage Sync (Passive)
// ========================
try {
  window.addEventListener('storage', (e) => {
    if (e.key !== 'codebank_assets' || !e.newValue) return;
    try {
      const incoming = JSON.parse(e.newValue);
      __MEM_STATE__ = incoming;
      window.dispatchEvent(new CustomEvent('assets:updated', {
        detail: { ...incoming, type: 'storage-sync' }
      }));
    } catch (_) {}
  });
} catch (_) {}

// ========================
// Init Dispatch (Once)
// ========================
try {
  if (!window.__ASSETBUS_INIT__) {
    window.__ASSETBUS_INIT__ = true;
    const state = AssetBus.getState();
    window.dispatchEvent(new CustomEvent('assets:hydrated', {
      detail: state
    }));
    window.dispatchEvent(new CustomEvent('assets:updated', {
      detail: { ...state, type: 'init' }
    }));
    console.log('[AssetBus] initialized', {
      codes: state.codes.length,
      silver: state.silver.length,
      gold: state.gold.length
    });
  }
} catch (_) {}

window.AssetBus = AssetBus;
window.AssetProof = AssetProof;
=======
      updatedAt: now(),
      latest: data.latest || null,
      authoritative: true // Mark as authoritative server data
    };

    return newState;
  } catch (e) {
    console.error('[AssetBus] Ledger Sync Failed:', e.message);
    return null;
  } finally {
    __IS_SYNCING__ = false;
  }
}

// ========================
// AssetBus Singleton Pattern
// ========================
const createAssetBus = () => {
  if (window.__assetBusInstance) return window.__assetBusInstance;

  const bus = {
    // -------- Subscriptions --------
    _subscribers: new Map(), // Phase 1: Event-based Map for memory management
    ledgerLocked: false, 
    pendingUpdates: [], 
    processingQueue: false, 
    
    subscribe(event, callback) {
      // Support legacy subscribe(callback) -> subscribe('assets:updated', callback)
      let actualEvent = event;
      let actualCallback = callback;
      if (typeof event === 'function') {
        actualCallback = event;
        actualEvent = 'assets:updated';
      }

      if (typeof actualCallback !== 'function') return () => {};

      if (!this._subscribers.has(actualEvent)) {
        this._subscribers.set(actualEvent, new Set());
      }
      
      const callbacks = this._subscribers.get(actualEvent);
      
      // Phase 1: Limit max listeners to prevent memory leaks
      if (callbacks.size >= 100) {
        console.warn(`[AssetBus] Max listeners (100) reached for ${actualEvent}. Memory leak suspected.`);
        return () => {};
      }

      callbacks.add(actualCallback);
      
      // 🚀 PHASE 1: Sync AssetBus snapshot to __APP__
      if (window.top === window.self && window.__APP__) {
        window.__APP__.assets.snapshot = this.snapshot();
        window.__APP__.assets.lastUpdate = Date.now();
      }
      
      // If we have data already and it's assets:updated, fire immediately
      if (actualEvent === 'assets:updated' && __VERIFIED_STATE__) {
        const snap = this.getState();
        setTimeout(() => {
          try { actualCallback(snap); } catch(e) {}
        }, 0);
      }

      return () => {
        const cbs = this._subscribers.get(actualEvent);
        if (cbs) cbs.delete(actualCallback);
      };
    },

    _notifySubscribers(snapshot, event = 'assets:updated') {
      const callbacks = this._subscribers.get(event);
      if (!callbacks) return;

      for (const callback of callbacks) {
        try {
          callback(snapshot);
        } catch (error) {
          console.error(`[AssetBus] Subscription callback failed for ${event}:`, error);
        }
      }

      // 🚀 PHASE 1: Sync AssetBus snapshot to __APP__ on any update
      if (window.top === window.self && window.__APP__) {
        window.__APP__.assets.snapshot = this.snapshot();
        window.__APP__.assets.lastUpdate = Date.now();
      }
    },

    // -------- Authoritative State --------
    getState() {
      // 🧠 READ-ONLY: This method should not mutate state. It reflects the last known state.
      const state = __VERIFIED_STATE__ || {
        codes: [], silver: [], gold: [],
        likes: 0, superlikes: 0, games: 0, transactions: 0,
        updatedAt: now()
      };
      
      return structuredClone(state);
    },
    
    snapshot() {
      return this.getState();
    },
    
    getSnapshot() {
      return new Promise((resolve) => {
        const snapshot = this.getState();
        resolve(snapshot);
      });
    },

    /**
     * Force a synchronization with the shadow ledger (backend)
     * 🛡️ OFFLINE-FIRST: Client pushes its state to the server shadow.
     */
    async sync() {
      if (this._aligning) return false;
      this._aligning = true;

      try {
        // 1. Get current local authoritative state
        const current = this.getState();
        
        // 🛡️ ALIGNMENT LAYER: Synchronize with persistent StorageAdapter
        try {
          if (window.StorageAdapter && typeof window.StorageAdapter.getCodes === 'function') {
            if (window.DEBUG_MODE) console.log('[AssetBus] Aligning with StorageAdapter (IndexedDB)...');
            let persistentCodes = await window.StorageAdapter.getCodes();
            
            // 🛡️ FALLBACK 1: If IndexedDB is empty, try the server's diagnostic endpoint
            if (persistentCodes.length === 0) {
              if (window.DEBUG_MODE) console.log('[AssetBus] Local storage empty, attempting server diagnostic fetch...');
              try {
                const resp = await fetch('/api/diag/sqlite-codes', {
                  credentials: 'include' // 🛡️ ADDED: Ensure session cookie is sent (from actly.md)
                });
                const data = await resp.json();
                if (data.ok && data.codes) {
                  persistentCodes = data.codes;
                  if (window.DEBUG_MODE) console.log('[AssetBus] Server diagnostic sync found', persistentCodes.length, 'codes');
                }
              } catch (e) {
                if (window.DEBUG_MODE) console.warn('[AssetBus] Server diagnostic fetch failed:', e);
              }
            }
            
            // 🛡️ FALLBACK 2: If still empty, check legacy localStorage keys
            if (persistentCodes.length === 0) {
              if (window.DEBUG_MODE) console.log('[AssetBus] Still empty, checking legacy localStorage keys...');
              try {
                const legacy = JSON.parse(localStorage.getItem('safeCodes') || localStorage.getItem('bankode_codes') || '[]');
                if (legacy.length > 0) {
                  persistentCodes = legacy;
                  if (window.DEBUG_MODE) console.log('[AssetBus] Found', legacy.length, 'codes in legacy localStorage');
                }
              } catch(e) {}
            }

            if (Array.isArray(persistentCodes)) {
              const mappedCodes = persistentCodes.map(c => typeof c === 'object' ? c.code : c);
              
              // Determine if update is needed (deep check)
              const currentSet = new Set(current.codes);
              const persistentSet = new Set(mappedCodes);
              
              const hasNew = mappedCodes.some(c => !currentSet.has(c));
              const hasRemoved = current.codes.some(c => !persistentSet.has(c) && c !== 'BOOTSTRAPPED_CODE');

              if (hasNew || hasRemoved) {
                if (__DRIFT_COUNT__ > 3) {
                  console.warn('[AssetBus] Drift loop detected — stopping realignment');
                  return false;
                }
                
                if (window.DEBUG_MODE) console.log('[AssetBus] State drift detected, re-aligning codes:', { hasNew, hasRemoved });
                __DRIFT_COUNT__++;
                
                // Merge: keep persistent codes + any bootstrapped placeholders
                const mergedCodes = [
                  ...mappedCodes,
                  ...current.codes.filter(c => c === 'BOOTSTRAPPED_CODE')
                ];
                
                this.update({ codes: mergedCodes }, 'internal-verified');
              } else {
                if (window.DEBUG_MODE) console.log('[AssetBus] State already aligned with StorageAdapter');
                __DRIFT_COUNT__ = 0; // Reset count on successful alignment
              }
            }
          }
        } catch (e) {
          if (window.DEBUG_MODE) console.warn('[AssetBus] StorageAdapter alignment failed:', e);
        }

        // 2. Prepare sync payload for Bankode (which handles the POST /sync)
        if (window.Bankode && typeof window.Bankode.syncWithServer === 'function') {
          await window.Bankode.syncWithServer();
        }

        // 3. Fetch server shadow state just to see if we're aligned
        const shadow = await fetchLedgerState();
        if (shadow) {
          if (window.DEBUG_MODE) console.log('[AssetBus] Server shadow state received:', shadow);
          
          // FIXED: If server has authoritative data, use it directly
          if (shadow.authoritative && shadow.codes && shadow.codes.length > 0) {
            console.log('[AssetBus] Using authoritative server data with', shadow.codes.length, 'codes');
            __VERIFIED_STATE__ = {
              ...shadow,
              updatedAt: now()
            };
            this._notifySubscribers(__VERIFIED_STATE__);
            return true;
          }
          
          // 🧠 INITIAL LOAD FIX: If local state is empty but server has counts, populate local state
          const hasLocalData = current.codes.length > 0 || current.likes > 0 || current.transactions > 0;
          const hasServerData = shadow.codes_count > 0 || shadow.likes > 0 || shadow.transactions > 0;

          if (!hasLocalData && hasServerData) {
            console.warn('[AssetBus] Local state empty, bootstrapping from server counters');
            const bootstrapped = {
              ...current,
              likes: shadow.likes,
              superlikes: shadow.superlikes,
              games: shadow.games,
              transactions: shadow.transactions,
              updatedAt: now(),
              _bootstrapped: true
            };
            
            // FIXED: Use actual codes from server if available
            if (shadow.codes && shadow.codes.length > 0) {
              bootstrapped.codes = shadow.codes;
            } else if (shadow.codes_count > 0 && current.codes.length === 0) {
              // Fallback: create placeholder codes
              bootstrapped.codes = new Array(shadow.codes_count).fill('BOOTSTRAPPED_CODE');
            }

            __VERIFIED_STATE__ = bootstrapped;
            this._notifySubscribers(__VERIFIED_STATE__);
            return true;
          }
          
          this._notifySubscribers(current);
          return true;
        }
        return false;
      } finally {
        setTimeout(() => {
          this._aligning = false;
        }, 2000);
      }
    },

     // -------- Protected Update (Only for internal/server events) --------
    async update(data, source = 'unknown') { 
     // 🧠 UNIVERSAL NORMALIZATION LAYER (as per actly.md)
     // Extract latest code if it's explicitly provided or at the end of the array
     const codes = Array.isArray(data.codes) ? data.codes : (Array.isArray(data) ? data : (this.state?.codes || []));
     const latest = data.latest || data.latestCode || data.code || (codes.length > 0 ? codes[codes.length - 1] : null);

     const snapshot = {
       codes: codes,
       silver: data.silver || this.state?.silver || [],
       gold: data.gold || this.state?.gold || [],
       latest: latest,
       latestCode: latest,
       code: latest,
       likes: data.likes !== undefined ? data.likes : (this.state?.likes || 0),
       superlikes: data.superlikes !== undefined ? data.superlikes : (this.state?.superlikes || 0),
       games: data.games !== undefined ? data.games : (this.state?.games || 0),
       transactions: data.transactions !== undefined ? data.transactions : (this.state?.transactions || 0),
       updatedAt: now(),
       source: source
     };

     // If locked, queue instead of reject 
     if (this.ledgerLocked) { 
       console.log(`[AssetBus] Queuing update from ${source} (ledger locked)`); 
       this.pendingUpdates.push({ data: snapshot, source, timestamp: Date.now() }); 
       this._processQueue(); // Try to process when unlocked 
       return false; 
     } 
 
     // Process immediately if not locked 
     return this._applyUpdate(snapshot, source); 
    }, 

    lockLedger(duration = 5000) { 
     this.ledgerLocked = true; 
     console.log(`[AssetBus] Ledger locked for ${duration}ms`); 
     
     // Auto-release after duration 
     clearTimeout(this._unlockTimer); 
     this._unlockTimer = setTimeout(() => { 
       this.unlockLedger(); 
     }, duration); 
    }, 

    unlockLedger() { 
     if (!this.ledgerLocked) return; 
     this.ledgerLocked = false; 
     console.log('[AssetBus] Ledger unlocked'); 
     this._processQueue(); // Process pending updates 
    }, 

    async _processQueue() { 
     if (this.processingQueue || this.ledgerLocked || this.pendingUpdates.length === 0) return; 
     
     this.processingQueue = true; 
     
     while (this.pendingUpdates.length > 0 && !this.ledgerLocked) { 
       const { data, source } = this.pendingUpdates.shift(); 
       console.log(`[AssetBus] Processing queued update from ${source}`); 
       await this._applyUpdate(data, source); 
     } 
     
     this.processingQueue = false; 
    }, 

    _applyUpdate(data, source) { 
        const prev = this.getState();
        
        // Prevent snapshot regression
        if (data.codes && prev.codes && data.codes.length < prev.codes.length) {
          // If we are getting a smaller list, it might be a partial sync or regression
          // But if source is 'internal-verified', we might want to allow it (e.g. compression)
          if (source !== 'internal-verified') {
            console.warn('[AssetBus] Ignoring snapshot regression:', data.codes.length, '<', prev.codes.length);
            return false;
          }
        }

        const next = { ...prev, ...data, updatedAt: now() };

        if (!AssetPolicy.validate(next, { source })) {
          console.warn('[AssetBus] policy rejected update', source);
          return false;
        }

        __VERIFIED_STATE__ = structuredClone(next);
        this.state = __VERIFIED_STATE__; // 🛡️ Keep local reference for normalization
        
        // 🛡️ PERSIST TO LOCAL STORAGE: Ensure durability across sessions/reloads
        try {
          const ss = window.safeStorage || {
            set: (k, v) => { try { localStorage.setItem(k, v) } catch(_) {} }
          };
          ss.set('codebank_assets', JSON.stringify(__VERIFIED_STATE__));
        } catch (_) {}

        // 🛡️ CRITICAL: Always notify subscribers
        this._notifySubscribers(__VERIFIED_STATE__);
        
        // 🛡️ Dispatch to window for broader compatibility
        window.dispatchEvent(new CustomEvent('assets:updated', { 
          detail: { 
            ...next, 
            source,
            type: data.codes || data.latest ? 'codes' : 
                  data.silver ? 'silver' : 
                  data.gold ? 'gold' : 
                  'unknown'
          } 
        }));
        
        // Also dispatch specific event for codes
        if (data.codes || data.latest) {
          window.dispatchEvent(new CustomEvent('codes:updated', {
            detail: data.codes || next.codes || []
          }));
        }
        
        // 🛡️ NEW: Dispatch assetbus:ready event for late subscribers
        window.dispatchEvent(new CustomEvent('assetbus:ready', {
          detail: { snapshot: __VERIFIED_STATE__ }
        }));
        
        return true;
     }, 

    // -------- Ledger-bound Helpers --------
    async increment(type, amount, source = 'engine') {
      // console.log(`[AssetBus] Requested increment ${type} by ${amount} from ${source}`);
      // In a hardened system, this should call a server endpoint
      // For now, we sync after a short delay to reflect server-side changes
      setTimeout(() => this.sync(), 500);
      return false; // Returns false because local state wasn't modified directly
    },

     async addAsset(type, value) {
       // console.log(`[AssetBus] Requested addAsset ${type} from manual-add`);
       if (typeof this.update === 'function') {
         const current = this.getState();
         const list = Array.isArray(current[type]) ? [...current[type]] : [];
         if (!list.includes(value)) {
           list.push(value);
           this.update({ [type]: list, latest: value }, 'internal-verified');
           return true;
         }
       }
       return false;
     },
     
     async addCode(value, type = 'codes') {
       // Backward compatibility: addCode(value, type) is same as addAsset(type, value)
       return this.addAsset(type, value);
     },

    async removeAsset(type, value) {
      if (typeof this.update === 'function') {
        const current = this.getState();
        const list = Array.isArray(current[type]) ? [...current[type]] : [];
        const idx = list.indexOf(value);
        if (idx !== -1) {
          list.splice(idx, 1);
          this.update({ [type]: list }, 'internal-verified');
          return true;
        }
      }
      return false;
    }
  };

  // Start periodic sync - Rule: 30-60s
  let _syncInterval = setInterval(() => bus.sync(), 60000); 
  
  window.__assetBusInstance = bus;

  // 🛡️ SYNC ACROSS TABS/WINDOWS: Listen for localStorage changes
  window.addEventListener('storage', (event) => {
    if (event.key === 'codebank_assets' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        // Only update if it's actually newer to avoid loops
        if (!__VERIFIED_STATE__ || (parsed.updatedAt > __VERIFIED_STATE__.updatedAt)) {
          console.log('[AssetBus] Syncing state from storage event');
          __VERIFIED_STATE__ = parsed;
          
          // 🔧 FIX: Notify subscribers directly instead of triggering a potentially infinite sync() loop
          bus._notifySubscribers(__VERIFIED_STATE__);
          
          // Dispatch events for local listeners
          window.dispatchEvent(new CustomEvent('assets:updated', { 
            detail: { ...parsed, source: 'storage-sync' } 
          }));
        }
      } catch (e) {
        console.error('[AssetBus] Failed to parse storage sync data:', e);
      }
    }
  });

  return bus;
};

// Ensure global singleton
if (!window.AssetBus || typeof window.AssetBus.subscribe !== 'function') {
  const instance = createAssetBus();
  
  // 🛡️ TAMPER-PROOF: Protect the global object
  try {
    Object.defineProperty(window, 'AssetBus', {
      value: instance,
      writable: false,
      configurable: false
    });
  } catch (e) {
    window.AssetBus = instance;
  }

  // Initial sync
  setTimeout(() => instance.sync(), 100);
}

export const AssetBus = window.AssetBus;
export default AssetBus;
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
