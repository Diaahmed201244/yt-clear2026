<<<<<<< HEAD
const lastUpdateTs = new Map();

function rateLimited(type, now){
  const last = lastUpdateTs.get(type) || 0;
  if (now - last < 200) return true;
  lastUpdateTs.set(type, now);
  return false;
}

function hasNegative(detail){
  const keys = ['count','likes','superlikes','games','transactions'];
  for (const k of keys){
    const v = detail[k];
    if (typeof v === 'number' && v < 0) return k;
  }
  return null;
}

export const AssetPolicy = {
  validate(detail, ctx){
    try{
      const type = String(detail && detail.type || '').trim();
      const source = String(ctx && ctx.source || '').trim();
      const now = Date.now();
      if (!type){ try{ console.log('[ASSET POLICY] REJECT', 'unknown', 'missing_type'); }catch(_){} return false; }
      if (!source){ try{ console.log('[ASSET POLICY] REJECT', type, 'missing_source'); }catch(_){} return false; }
      if (type === 'codes'){
        if (source === 'neon-fetch' || source === 'neon:snapshot' || source === 'auth-bootstrap'){
          try{ console.log('[ASSET POLICY] ACCEPT codes (neon read path)') }catch(_){}
          return true;
        }
        const negCodes = hasNegative(detail);
        if (negCodes){ try{ console.log('[ASSET POLICY] REJECT', 'codes', 'negative_'+negCodes); }catch(_){} return false; }
        if (rateLimited(type, now)){ try{ console.warn('[ASSET POLICY] REJECT codes rate_limited (write path)') }catch(_){} return false; }
        try{ console.log('[ASSET POLICY] ACCEPT codes') }catch(_){}
        return true;
      }
      if (rateLimited(type, now)){ try{ console.log('[ASSET POLICY] REJECT', type, 'rate_limited'); }catch(_){} return false; }
      const neg = hasNegative(detail);
      if (neg){ try{ console.log('[ASSET POLICY] REJECT', type, 'negative_'+neg); }catch(_){} return false; }
      try{ console.log('[ASSET POLICY] ACCEPT', type); }catch(_){}
      return true;
    }catch(_){ return false }
  }
};
=======
/**
 * asset-policy.js
 * Basic policy for asset validation
 */

export const AssetPolicy = {
    validate(state, context = {}) {
        // Basic validation logic
        if (!state) return false;
        
        // Ensure required fields exist
        if (!Array.isArray(state.codes)) return false;
        
        // Prevent obvious corruption
        if (state.codes.length > 10000) {
            console.warn('[AssetPolicy] Rejected: Too many codes');
            return false;
        }

        // Allow by default if basic structure is correct
        return true;
    }
};

export default AssetPolicy;
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
