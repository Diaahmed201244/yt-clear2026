// local-asset-bus.js
// UV: ASSETBUS-CLEAN-2026-02-18
// Deterministic, Proof-safe, Auth-agnostic

import { AssetPolicy } from './asset-policy.js';

let __MEM_STATE__ = null;
let __LAST_PROOF__ = null;
const __USED_PROOFS__ = new Set();
const PROOF_WINDOW_MS = 5000;

// ========================
// Utilities
// ========================
function now() {
  return Date.now();
}

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
      likes: 0,
      superlikes: 0,
      games: 0,
      transactions: 0,
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
