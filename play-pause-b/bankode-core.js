// Bankode Core - Single Source of Truth
// Holds session, ledger, persistence (IndexedDB primary, localStorage backup)
// Emits events via CodeEngine to mirrors only
  const BankodeBus = {
    listeners: [],
    on(fn){
      if (typeof fn === 'function') this.listeners.push(fn);
    },
    emit(payload){
      for (const fn of this.listeners) {
        try {    fn(payload) } catch(e) { console.error('Bankode listener error', e) }
      }
    }
  };

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
      req.onerror = () => reject(req.error);
    });
  }

  }

  const ls = {
    get(k, d){ try {    const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch(_) { return d } },
    set(k, v){ try {    localStorage.setItem(k, JSON.stringify(v)) } catch(_){} }
  };

    sessionId: null,
    codes: [],
    count: 0,
    _timer: null,
    _nextDueAt: 0,
    },

    async _persistAfterGen(entry){
      try {    await idbAddCode(entry); } catch(_) {}
      try {    this.count = await idbCountCodes(); } catch(_) {}
      ls.set('Bankode.meta', { count: this.count, nextDueAt: this._nextDueAt });
      ls.set('Bankode.last', entry);
    },

    stopSession(){
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
    async generateIfDue(){
      if (!this.sessionId) await this._initFromStorage();
      const now = Date.now();
      if (now < (this._nextDueAt || 0)) return;
    }
  };

  window.Bankode = Bankode;
  window.BankodeBus = BankodeBus;
  Bankode.on = function(fn){ BankodeBus.on(fn); };
  Bankode.emit = function(){ throw new Error('External emit forbidden. Bankode is the sole emitter.'); };
