// Bankode Core - Single Source of Truth
// Holds session, ledger, persistence (IndexedDB primary, localStorage backup)
// Emits events via CodeEngine to mirrors only

(function(){
  const BankodeBus = {
    listeners: [],
    on(fn){
      if (typeof fn === 'function') this.listeners.push(fn);
    },
    emit(payload){
      for (const fn of this.listeners) {
        try { fn(payload) } catch(e) { console.error('Bankode listener error', e) }
      }
    }
  };
  const GenEventsBC = new BroadcastChannel('bankode-events');
  const CodeBankChannel = new BroadcastChannel('codebank');
  const FIVE_MIN = 5 * 60 * 1000;

  function uid() {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  // Minimal IndexedDB helper
  const DB_NAME = 'BankodeDB';
  const STORE_CODES = 'codes';
  const STORE_META = 'meta';

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 2);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_CODES)) {
          db.createObjectStore(STORE_CODES, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbPut(storeName, key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = key != null ? store.put(value, key) : store.put(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbAddCode(entry) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CODES, 'readwrite');
      const store = tx.objectStore(STORE_CODES);
      const req = store.add(entry);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbCountCodes() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CODES, 'readonly');
      const store = tx.objectStore(STORE_CODES);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  }

  // Normal code generator
  function generateNormalCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let s = '';
    for (let i = 0; i < 26; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
      if ((i + 1) % 4 === 0 && i < 25) s += '-';
    }
    const online = typeof navigator !== 'undefined' && navigator.onLine === true;
    const isAuth = !!(window.Auth && typeof window.Auth.isAuthenticated === 'function' && window.Auth.isAuthenticated());
    let idx = 0;
    try { idx = parseInt(localStorage.getItem('Bankode.pIndex') || '0', 10) || 0; } catch(_) { idx = 0 }
    let suffix = 'PP';
    if (online && isAuth) {
      suffix = 'P' + String(idx);
      idx = (idx + 1) % 10;
      try { localStorage.setItem('Bankode.pIndex', String(idx)); } catch(_){}
    }
    if (!suffix || !(suffix === 'PP' || /^P[0-9]$/.test(suffix))) { throw new Error('Invalid code suffix state'); }
    try {
      const parts = s.split('-');
      if (parts.length > 0) {
        const last = parts[parts.length - 1] || '';
        const base = last.slice(0, Math.max(0, last.length - 2));
        parts[parts.length - 1] = base + suffix;
        s = parts.join('-');
      }
    } catch(_){ }
    try { console.log('[CODEGEN] Normal code generated', { isAuth, isOnline: online, suffix, finalCode: s }); } catch(_){}
    if (s.endsWith('PP')) { try { console.log('[OFFLINE MODE] Codes generated but NOT rewarded'); } catch(_){} }
    return s;
  }

  // Silver bar generator
  function generateSilverBar() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let s = '';
    for (let i = 0; i < 26; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
      if ((i + 1) % 4 === 0 && i < 25) s += '-';
    }
    const online = typeof navigator !== 'undefined' && navigator.onLine === true;
    const isAuth = !!(window.Auth && typeof window.Auth.isAuthenticated === 'function' && window.Auth.isAuthenticated());
    let idx = 0;
    try { idx = parseInt(localStorage.getItem('Bankode.pIndex') || '0', 10) || 0; } catch(_) { idx = 0 }
    let suffix = 'PP';
    if (online && isAuth) {
      suffix = 'P' + String(idx);
      idx = (idx + 1) % 10;
      try { localStorage.setItem('Bankode.pIndex', String(idx)); } catch(_){}
    }
    if (!suffix || !(suffix === 'PP' || /^P[0-9]$/.test(suffix))) { throw new Error('Invalid code suffix state'); }
    try {
      const parts = s.split('-');
      if (parts.length > 0) {
        const last = parts[parts.length - 1] || '';
        const base = last.slice(0, Math.max(0, last.length - 2));
        parts[parts.length - 1] = base + suffix;
        s = parts.join('-');
      }
    } catch(_){ }
    const finalCode = 'SLVR-' + s;
    try { console.log('[CODEGEN] Silver bar generated', { isAuth, isOnline: online, suffix, finalCode }); } catch(_){}
    if (s.endsWith('PP')) { try { console.log('[OFFLINE MODE] Silver bars generated but NOT rewarded'); } catch(_){} }
    return finalCode;
  }

  // Gold bar generator
  function generateGoldBar() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let s = '';
    for (let i = 0; i < 26; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
      if ((i + 1) % 4 === 0 && i < 25) s += '-';
    }
    const online = typeof navigator !== 'undefined' && navigator.onLine === true;
    const isAuth = !!(window.Auth && typeof window.Auth.isAuthenticated === 'function' && window.Auth.isAuthenticated());
    let idx = 0;
    try { idx = parseInt(localStorage.getItem('Bankode.pIndex') || '0', 10) || 0; } catch(_) { idx = 0 }
    let suffix = 'PP';
    if (online && isAuth) {
      suffix = 'P' + String(idx);
      idx = (idx + 1) % 10;
      try { localStorage.setItem('Bankode.pIndex', String(idx)); } catch(_){}
    }
    if (!suffix || !(suffix === 'PP' || /^P[0-9]$/.test(suffix))) { throw new Error('Invalid code suffix state'); }
    try {
      const parts = s.split('-');
      if (parts.length > 0) {
        const last = parts[parts.length - 1] || '';
        const base = last.slice(0, Math.max(0, last.length - 2));
        parts[parts.length - 1] = base + suffix;
        s = parts.join('-');
      }
    } catch(_){ }
    const finalCode = 'GOLD-' + s;
    try { console.log('[CODEGEN] Gold bar generated', { isAuth, isOnline: online, suffix, finalCode }); } catch(_){}
    if (s.endsWith('PP')) { try { console.log('[OFFLINE MODE] Gold bars generated but NOT rewarded'); } catch(_){} }
    return finalCode;
  }

  const ls = {
    get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch(_) { return d } },
    set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)) } catch(_){} }
  };

  const Bankode = {
    sessionId: null,
    codes: [],
    count: 0,
    _timer: null,
    _nextDueAt: 0,
    isPaused: false,
    // Initialize Bankode storage and session state before any UI/bridge code uses it
    async init(){ await this._initFromStorage(); return true },
    // Set the next due time and ensure the session timer is running
    startTimer(ms){ if(typeof ms==='number'&&ms>0){ this._nextDueAt=Date.now()+ms } this.startSession() },
    
    pauseNormalGeneration() {
      this.isPaused = true;
      console.log('[Bankode] Normal code generation paused');
    },
    
    resumeNormalGeneration() {
      this.isPaused = false;
      console.log('[Bankode] Normal code generation resumed');
    },

    async _initFromStorage(){
      const sessionId = ls.get('Bankode.sessionId', null) || uid();
      this.sessionId = sessionId;
      const meta = ls.get('Bankode.meta', { count: 0, nextDueAt: 0 });
      this.count = meta.count || 0;
      this._nextDueAt = meta.nextDueAt || 0;
      await idbPut(STORE_META, 'session', { sessionId });
    },

    async _persistAfterGen(entry){
      try { await idbAddCode(entry); } catch(_) {}
      try { this.count = await idbCountCodes(); } catch(_) {}
      ls.set('Bankode.meta', { count: this.count, nextDueAt: this._nextDueAt });
      ls.set('Bankode.last', entry);
    },

    startSession(){
      if (this._timer) return;
      if (!this.sessionId) { this._initFromStorage(); }
      if (!this._nextDueAt || Date.now() >= this._nextDueAt) { this._nextDueAt = Date.now(); }
      this._timer = setInterval(() => { this.generateIfDue(); }, 1000);
    },

    stopSession(){
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
    },

     async generateIfDue(){
       if (!this.sessionId) await this._initFromStorage();
       const now = Date.now();
       if (now < (this._nextDueAt || 0)) return;
       
       // Skip normal code generation if paused or during Extra Mode or pending reward
       const extraActive = !!(window.extraModeActive || (document && document.body && document.body.classList.contains('extra-mode')));
       const hasPending = !!(window.ExtraMode && typeof window.ExtraMode.hasPendingReward==='function' && window.ExtraMode.hasPendingReward());
       if (this.isPaused || extraActive || hasPending) {
         console.log('[Bankode] Normal code generation skipped -', this.isPaused ? 'paused' : 'Extra Mode or pending reward');
         return;
       }
      
      const code = generateNormalCode();
      try { console.log('[CODE GENERATED]', code); } catch(_){}
      const payload = { code, count: this.count + 1, sessionId: this.sessionId, timestamp: now };
      const entry = { id: undefined, code, createdAt: now };
      this.codes.push(entry);
      this._nextDueAt = now + FIVE_MIN;
      await this._persistAfterGen(entry);
      try { BankodeBus.emit(payload); } catch(_){}
      try {
        const isPn = /P[0-9]$/.test(code);
        if (isPn && window.writeCodeToNeon) {
          try { await window.writeCodeToNeon({ code, ts: now }); } catch(_){}
          try {
            const sync = await (window.getNeonCodes ? window.getNeonCodes() : Promise.resolve(null));
            if (sync && sync.status==='success' && Array.isArray(sync.rows) && sync.rows.length>0) {
              const latest = (typeof sync.latest==='string' ? sync.latest : (sync.rows[0] && sync.rows[0].code) || code);
              const list = sync.rows.map(r=>r && r.code || '').filter(Boolean);
              try { if (window.NeonAdapter && typeof window.NeonAdapter.sync==='function') { await window.NeonAdapter.sync() } } catch(_){}
            }
          } catch(_){}
        }
      } catch(_){}
      return payload;
    }
  };

  window.Bankode = Bankode;
  window.BankodeBus = BankodeBus;
  Bankode.on = function(fn){ BankodeBus.on(fn); };
  Bankode.emit = function(){ throw new Error('External emit forbidden. Bankode is the sole emitter.'); };
  try { if (window.Auth && typeof window.Auth.isAuthenticated === 'function' && window.Auth.isAuthenticated()) { Bankode.startSession(); } } catch(_) {}
  try { window.addEventListener('auth:ready', function(e){ try { var ok=!!(e&&e.detail&&e.detail.authenticated); if(ok){ Bankode.startSession(); } else { Bankode.stopSession(); } } catch(_){} }); } catch(_){}
})();
