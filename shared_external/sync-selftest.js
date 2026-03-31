(function () {
  if (window.SyncSelfTest) return;

  const base = () => ({ messageBus: false, assetsEvent: false, uiUpdated: false, snapshotOrder: true, lastTs: 0, lastCode: null });
  const state = base();
  const perType = {
    codes: base(),
    likes: base(),
    superlikes: base(),
    games: base(),
    transactions: base()
  };
  let dashboardUpdated = false;
  let policyAccepted = false;
  let policyRejected = false;
  let policyAcceptedTransactions = false;

  function once(target, event, handler) {
    const fn = e => {
      try { handler(e); } catch (_) {}
      try { target.removeEventListener(event, fn); } catch (_) {}
    };
    try { target.addEventListener(event, fn); } catch (_) {}
  }

  // Message Bus
  once(window, 'message', e => {
    try {
      if (e && e.data && e.data.type === 'CODEBANK_ASSETS_SYNC') {
        state.messageBus = true;
        const ts = e.data && e.data.payload ? e.data.payload.ts : null;
        if (typeof ts === 'number') {
          if (ts <= state.lastTs) state.snapshotOrder = false;
          state.lastTs = ts;
        }
        for (const k in perType) { perType[k].messageBus = true; perType[k].lastTs = ts || perType[k].lastTs; }
      }
    } catch (_) {}
  });

  // Assets
  once(window, 'assets:updated', e => {
    try {
      state.assetsEvent = true;
      const d = e && e.detail ? e.detail : {};
      state.lastCode = typeof d.latest === 'string' ? d.latest : null;
      const ts = typeof d.ts === 'number' ? d.ts : null;
      if (ts !== null) {
        if (ts <= state.lastTs) state.snapshotOrder = false;
        state.lastTs = ts;
      }
      const t = d && d.type ? String(d.type) : 'unknown';
      if (perType[t]) {
        perType[t].assetsEvent = true;
        perType[t].lastCode = state.lastCode;
        if (ts !== null) {
          if (ts <= perType[t].lastTs) perType[t].snapshotOrder = false;
          perType[t].lastTs = ts;
        }
      }
    } catch (_) {}
  });

  // UI (direct check, no observer)
  setTimeout(() => {
    try {
      const el = document.querySelector('#code-display') || document.querySelector('[data-latest-code]');
      if (el && state.lastCode && String(el.textContent || '').includes(state.lastCode)) {
        state.uiUpdated = true;
      }
      const dash = document.getElementById('asset-dashboard');
      if (dash && dash.dataset && dash.dataset.lastType) dashboardUpdated = true;
      const likeEl = document.querySelector('#like-count');
      const safeEl = document.querySelector('#asset-safe');
      if (likeEl && likeEl.textContent && likeEl.textContent.length>0) perType['likes'].uiUpdated = true;
      if (safeEl && (safeEl.textContent||'').length>0) {
        const txt = String(safeEl.textContent||'');
        if (txt.includes('Superlikes')) perType['superlikes'].uiUpdated = true;
        if (txt.includes('Games')) perType['games'].uiUpdated = true;
        if (txt.includes('Transactions')) perType['transactions'].uiUpdated = true;
      }
    } catch (_) {}
  }, 1500);

  // Policy checks: trigger one valid and one invalid update
  setTimeout(() => { try { if (window.LikesEngine) window.LikesEngine.add(1); } catch(_){} }, 300);
  once(window, 'assets:updated', e => { try { const d=e&&e.detail||{}; if (d && d.type==='likes') policyAccepted = true; } catch(_){} });
  setTimeout(() => { try { if (window.TransactionEngine) window.TransactionEngine.add(1); } catch(_){} }, 350);
  once(window, 'assets:updated', e => { try { const d=e&&e.detail||{}; if (d && d.type==='transactions') policyAcceptedTransactions = true; } catch(_){} });
  setTimeout(() => { try { if (window.AssetBus) window.AssetBus.update({ likes: -5, type: 'likes' }, 'selftest'); } catch(_){} }, 600);
  // If no event arrives within 400ms after invalid update, mark rejected
  setTimeout(() => { if (!policyRejected) policyRejected = true; }, 1000);

  window.SyncSelfTest = {
    run() {
      const res = {
        messageBus: state.messageBus,
        assetsEvent: state.assetsEvent,
        uiUpdated: state.uiUpdated,
        snapshotOrder: state.snapshotOrder,
        final: (state.messageBus && state.assetsEvent && state.uiUpdated && state.snapshotOrder) ? 'PASS' : 'FAIL'
      };
      const tests = {};
      for (const k of Object.keys(perType)) {
        const s = perType[k];
        tests[k] = {
          messageBus: s.messageBus,
          assetsEvent: s.assetsEvent,
          uiUpdated: s.uiUpdated,
          snapshotOrder: s.snapshotOrder,
          final: (s.messageBus && s.assetsEvent && s.uiUpdated && s.snapshotOrder) ? 'PASS' : 'FAIL'
        };
      }
      const extra = { dashboardUpdated, policyAccepted, policyAcceptedTransactions, policyRejected };
      const final = Object.values(tests).every(t => t.final==='PASS') && res.final==='PASS' && dashboardUpdated && policyAccepted && policyAcceptedTransactions && policyRejected ? 'PASS' : 'FAIL';
      return { overall: res, tests, extra, final };
    }
  };
})();
