;(function(){
  function awaitAuthReady(){
    return new Promise(function(resolve){
      try { 
        if (window.Auth && typeof window.Auth.isAuthenticated==='function' && window.Auth.isAuthenticated()) { resolve(); return }
        function h(e){ try {  var ok=!!(e&&e.detail&&e.detail.authenticated); if(ok){ try{ window.removeEventListener('auth:ready', h) }catch(_){}; resolve(); } } catch(_){} }
        try {  window.addEventListener('auth:ready', h) } catch(_) { resolve() }
      } catch(_) { resolve() }
    })
  }

  async function getNeonCodes(){
    try { 
      await awaitAuthReady();
      const res = await fetch('/api/neon/codes', { method:'GET', credentials:'include' });
      if (!res.ok) { try {  console.warn('[NEON] request failed', res.status) } catch(_){}; try {  return await res.json() } catch(_) { return { status:'failed', error:String(res.status) } } }
      try {  return await res.json() } catch(_) { return { status:'failed', error:'parse' } }
    } catch(e){ return { status:'failed', error:e && e.message } }
  }

  async function writeCodeToNeon({ code, ts }){
    try { 
      if (!code || typeof code !== 'string') return { ok:false, error:'bad_code' };
      try{ window.__neonInFlightCodes = window.__neonInFlightCodes || new Set(); if (window.__neonInFlightCodes.has(code)) return { ok:true, skipped:true } }catch(_){}
      const online = typeof navigator !== 'undefined' && navigator.onLine === true;
      if (!online) { console.log('[NEON BLOCKED] reason=offline'); return { ok:false, error:'offline' }; }
      if (/PP$/.test(code)) { console.log('[NEON BLOCKED] reason=PP'); return { ok:false, error:'pp_code' }; }
      await awaitAuthReady();
      const uid = (window.Auth && typeof window.Auth.userId==='function') ? window.Auth.userId() : null;
      if (!uid) { try {  console.warn('[NEON BLOCKED] reason=no_user') } catch(_){}; return { ok:false, error:'no_user' } }
      const sufMatch = code.match(/P[0-9]$/);
      if (!sufMatch) return { ok:false, error:'bad_suffix' };
      const suffix = sufMatch[0];
      const payload = { code, ts: ts||Date.now(), suffix };
      try {  console.log('Inserting code:', { userId: uid, code, meta: { suffix } }) } catch(_){}
      try{ window.__neonInFlightCodes.add(code) }catch(_){}
      const res = await fetch('/api/neon/codes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let j=null; try {  j=await res.json(); } catch(_){}
        if (res.status===409) { try{ window.__neonWrittenCodes = window.__neonWrittenCodes||new Set(); window.__neonWrittenCodes.add(code) }catch(_){}; return { ok:true, duplicate:true, body:j } }
        console.warn('[NEON BLOCKED] reason=server_error', res.status);
        return { ok:false, status:res.status, body:j }
      }
      console.log('[NEON] write success');
      let j=null; try {  j=await res.json(); } catch(_){}
      try{ window.__neonWrittenCodes = window.__neonWrittenCodes||new Set(); window.__neonWrittenCodes.add(code) }catch(_){}
      try{ window.__neonInFlightCodes && window.__neonInFlightCodes.delete && window.__neonInFlightCodes.delete(code) }catch(_){}
      return { ok:true, body:j };
    } catch(e) { console.warn('[NEON BLOCKED] reason=exception', e && e.message); return { ok:false, error:e && e.message } }
  }

  try {  window.writeCodeToNeon = writeCodeToNeon } catch(_){}
  try {  window.getNeonCodes = getNeonCodes } catch(_){}

  // Auto-write on assets:updated disabled; writes initiated by Bankode after Neon read

  const NeonAdapter={
    enabled:false,
    configured:false,
    endpoint:null,
    token:null,
    queue:[],
    configure(cfg){
      this.endpoint=cfg&&cfg.endpoint||this.endpoint;
      this.token=cfg&&cfg.token||this.token;
      this.configured=!!this.endpoint;
      this.flush();
    },
  async flush(){
    if(!this.enabled||!this.configured) return;
    const pending=[...this.queue];
    this.queue.length=0;
    for(const item of pending){
      try{await this._send(item.code,item.meta)}catch(e){console.warn('Neon flush failed, requeue',e);this.queue.push(item)}
    }
  },
  async saveAsset(code,meta){
    if(!this.enabled){return}
    const payload={code,meta:meta||{},ts:Date.now()};
    if(!this.configured){this.queue.push({code,meta:payload.meta});return}
    try{await this._send(code,payload.meta)}catch(e){console.warn('Neon save failed, queued',e);this.queue.push({code,meta:payload.meta})}
  },
  async _send(code,meta){
    const body={code,meta};
    const headers={'Content-Type':'application/json'};
    if(this.token) headers['Authorization']='Bearer '+this.token;
    const res=await fetch(this.endpoint,{method:'POST',headers,body:JSON.stringify(body),credentials:'include'});
    if(!res.ok) throw new Error('Neon endpoint error '+res.status);
    try{ console.log('Neon persisted asset', { code }); }catch(_){}
    return true;
  }
};
try{ window.NeonAdapter = NeonAdapter }catch(_){}
try{ /* auth-free in CodeBank */ }catch(_){}
})();
;(function(){
  async function sendReward(toUserId, amount = 1){
    try{
      try {  window.__lastRewardMark = Date.now() } catch(_){ }
      const res = await fetch('/api/rewards/transfer', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId, asset: 'codes', amount })
      });
      const json = await res.json().catch(()=>({}));
      if (json && json.status === 'success' && json.balances) {
        try {  window.__lastRewardMark = Date.now() } catch(_){ }
        try {  window.dispatchEvent(new CustomEvent('balances:updated', { detail: { balances: json.balances } })) } catch(_){}
        try { 
          const ss = window.safeStorage || null;
          const s = (ss && ss.get('codebank_assets')) ? JSON.parse(ss.get('codebank_assets')) : {};
          // Note: We no longer update codes count directly - codes are stored as array in AssetBus
          const next = Object.assign({}, s, { updatedAt: Date.now() });
          if (ss) ss.set('codebank_assets', JSON.stringify(next));
          const pTs = Date.now();
          const detail = { type: 'balances', likes: next.likes || 0, superlikes: next.superlikes || 0, games: next.games || 0, transactions: next.transactions || 0, ts: pTs, proof: String(pTs), expiryTs: pTs + 5000 };
          window.dispatchEvent(new CustomEvent('assets:updated', { detail }));
        } catch(_){}
        try {  if (window.NeonAdapter && typeof window.NeonAdapter.sync==='function') { await window.NeonAdapter.sync() } } catch(_){}
      }
      return json;
    } catch(e){ return { status:'failed', error: e && e.message } }
  }
  try {  window.sendReward = sendReward } catch(_){}
})();
;(function(){
  async function hasValidSession(){
    try{ const res=await fetch('/api/auth/me',{ credentials:'include' }); const data=await res.json().catch(()=>null); return !!(data&&data.user&&data.user.id) }catch(_){ return false }
  }
  async function fetchNeonCodes(){
    const ok=await hasValidSession(); if(!ok) return { ok:false, error:'no_session' };
    try{
      const res=await fetch('/api/neon/codes',{ method:'GET', credentials:'include' });
      if(!res.ok) return { ok:false, error:'http_'+res.status };
      const data=await res.json();
      const count= typeof data.count==='number' ? data.count : (Array.isArray(data.rows)? data.rows.length : 0);
      const latest= data.latest || (Array.isArray(data.rows)&&data.rows[0]? data.rows[0].code : null);
      let ts = 0; try {  const r0 = Array.isArray(data.rows) && data.rows[0] || null; if (r0 && r0.created_at) { const t = Date.parse(r0.created_at); if (Number.isFinite(t)) ts = t; } } catch(_){ }
      return { ok:true, count, latest, rows:data.rows||[], ts };
    }catch(e){ return { ok:false, error:e.message } }
  }
  async function writeNeonCode(code, ts){
    if(!code||typeof code!=='string') return { ok:false, error:'bad_code' };
    if(/PP$/.test(code)) return { ok:false, error:'pp_blocked' };
    const ok=await hasValidSession(); if(!ok) return { ok:false, error:'no_session' };
    const suffixMatch=code.match(/P[0-9]$/); if(!suffixMatch) return { ok:false, error:'bad_suffix' };
    try{
      try{ window.__neonInFlightCodes = window.__neonInFlightCodes || new Set(); if (window.__neonInFlightCodes.has(code)) return { ok:true, skipped:true } }catch(_){}
      const res=await fetch('/api/neon/codes',{ method:'POST', credentials:'include', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ code, ts: ts||Date.now(), suffix: suffixMatch[0] }) });
      if(!res.ok){ if(res.status===409){ try{ window.__neonWrittenCodes = window.__neonWrittenCodes||new Set(); window.__neonWrittenCodes.add(code) }catch(_){}; return { ok:true, duplicate:true } } return { ok:false, error:'http_'+res.status } }
      const body=await res.json().catch(()=>null);
      try{ window.dispatchEvent(new CustomEvent('neon:written',{ detail:{ code, ts: ts||Date.now() } })) }catch(_){}
      try{
        const check=await fetchNeonCodes();
        if(check && check.ok && check.latest && (!check.count || check.count===0)){
          console.error('CRITICAL DOMAIN VIOLATION: write succeeded but fetch count=0 for latest');
        }
      }catch(_){}
      return { ok:true, body };
    }catch(e){ return { ok:false, error:e.message } }
  }
  async function syncSnapshot(){
    const res=await fetchNeonCodes(); if(!res.ok) return res;
    const latest = res.latest || null;
    const count = (typeof res.count==='number' ? res.count : (Array.isArray(res.rows)? res.rows.length : 0)) || 0;
    if (!latest) return res;
    if (latest && count===0 && Array.isArray(res.rows) && res.rows.length>0){ try {  console.error('CRITICAL: latest present but computed count=0; using rows.length') } catch(_){} }
    try{ window.dispatchEvent(new CustomEvent('neon:snapshot',{ detail:{ latest, rows: res.rows||[], ts: res.ts||0, count } })) }catch(_){}
    return Object.assign({}, res, { count, latest });
  }
  try{ window.NeonAdapter = { fetchCodes: fetchNeonCodes, writeCode: writeNeonCode, sync: syncSnapshot } }catch(_){}

  // Recovery lifecycle implementation
  window.addEventListener('online', () => {
      console.warn('[NET] online again → retry neon sync');
      window.dispatchEvent(new CustomEvent('neon:retry'));
  });

  window.addEventListener('auth:ready', () => {
      if (navigator.onLine) {
          window.dispatchEvent(new CustomEvent('neon:retry'));
      }
  });

  window.addEventListener('neon:retry', () => {
      if (navigator.onLine) {
          retryPendingNeonWrites();
          retryBalancesFetch();
      }
  });

  function retryPendingNeonWrites() {
      try { 
          const safeStorage = window.safeStorage || window.localStorage;
          const pending = safeStorage.getItem('neon_pending');
          if (!pending) return;

          console.warn('[Neon] retrying pending writes');
          const pendingData = JSON.parse(pending);

          // Retry write operation
          writeNeonCode(pendingData.code, pendingData.ts).then(result => {
              if (result.ok) {
                  console.log('[Neon] Pending write succeeded');
                  safeStorage.removeItem('neon_pending');
              } else {
                  console.warn('[Neon] Pending write failed again', result.error);
              }
          });
      } catch (e) {
          console.warn('[Neon] Failed to retry pending writes', e);
      }
  }

  function retryBalancesFetch() {
      try { 
          fetch('/api/balances', { method: 'GET', credentials: 'include' })
              .then(res => res.json())
              .then(data => {
                  if (data && data.status === 'success' && data.balances) {
                      window.dispatchEvent(new CustomEvent('balances:updated', { 
                          detail: { balances: data.balances } 
                      }));
                  }
              });
      } catch (e) {
          console.warn('[Neon] Failed to retry balances fetch', e);
      }
  }

  // Modify writeNeonCode to store failed attempts
  const originalWriteNeonCode = writeNeonCode;
  window.writeNeonCode = async function(code, ts) {
      const result = await originalWriteNeonCode(code, ts);
      if (!result.ok) {
          try { 
              const safeStorage = window.safeStorage || window.localStorage;
              safeStorage.setItem('neon_pending', JSON.stringify({
                  code,
                  ts: ts || Date.now(),
                  reason: result.error || 'unknown error'
              }));
              console.warn('[Neon] Write failed, stored in pending queue', result.error);
          } catch (e) {
              console.warn('[Neon] Failed to store pending write', e);
          }
      }
      return result;
  };

  // Modify writeCodeToNeon to also store failed attempts
  const originalWriteCodeToNeon = window.writeCodeToNeon;
  window.writeCodeToNeon = async function(params) {
      const result = await originalWriteCodeToNeon(params);
      if (!result.ok) {
          try { 
              const safeStorage = window.safeStorage || window.localStorage;
              safeStorage.setItem('neon_pending', JSON.stringify({
                  code: params.code,
                  ts: params.ts || Date.now(),
                  reason: result.error || 'unknown error'
              }));
              console.warn('[Neon] Write failed, stored in pending queue', result.error);
          } catch (e) {
              console.warn('[Neon] Failed to store pending write', e);
          }
      }
      return result;
  };
})();