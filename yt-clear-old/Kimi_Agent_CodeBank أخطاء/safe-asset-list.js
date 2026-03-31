// safe-asset-list.js
// UV: SAFE-UI-UNIFY-2026-02-18-FIXED
/* ===================================================
   Unified Safe Asset List Renderer - Fixed version
   - Prevents hanging when DOM elements are missing
   - Supports Codes, Silver, Gold
   - Works with Bankode → AssetBus events and Auth
   =================================================== */
(function() {
  'use strict';

  // ========================
  // Configuration & State
  // ========================
  window.ACTIVE_ASSET_TAB = window.ACTIVE_ASSET_TAB || 'codes';
  window.SAFE_PAGE = window.SAFE_PAGE || 1;
  window.__SAFE_RENDER_PENDING__ = false;
  window.__SAFE_INIT_ATTEMPTS__ = 0;
  const MAX_INIT_ATTEMPTS = 50;

  const TAB_MAP = { codes: 'codes', silver: 'silver', gold: 'gold' };
  const TITLE_MAP = { codes: 'Safe Codes', silver: 'Silver Bars', gold: 'Gold Bars' };

  const CODEBANK_CONTAINER_SELECTOR = '#codebank-assets-tab .safe-container';

  // ========================
  // Main Renderer
  // ========================
  function renderSafeAssets(tab, container) {
    const snapshot = (window.__INDEXCB_ASSETS__) || (window.AssetBus && window.AssetBus.snapshot()) || getFallbackSnapshot();
    if (!snapshot) {
      if(window.CODEBANK_DEBUG) console.warn('[SafeAssetList] AssetBus snapshot not available');
      return;
    }
    if (!container || !container.appendChild) {
      if(window.CODEBANK_DEBUG) console.warn('[SafeAssetList] Container not available');
      return;
    }

    const seriesKey = TAB_MAP[tab] || 'codes';
    const list = Array.isArray(snapshot[seriesKey]) ? snapshot[seriesKey] : [];
    const count = list.length;
    const last = count > 0 ? list[count - 1] : '—';

    renderHeader(tab, count, last, container);
    renderList(tab, list, container);

    if(window.CODEBANK_DEBUG) console.log(`[SafeAssetList] render tab=${tab} count=${count}`);
  }

  // Fallback snapshot when AssetBus is not available
  function getFallbackSnapshot() {
    return {
      codes: [],
      silver: [],
      gold: [],
      likes: 0,
      superlikes: 0,
      games: 0,
      transactions: 0,
      updatedAt: Date.now()
    };
  }

  // ========================
  // Header Renderer
  // ========================
  function renderHeader(tab, count, last, container) {
    let titleEl = container.querySelector('#safe-title');
    let countEl = container.querySelector('#safe-count');
    let lastEl = container.querySelector('#safe-last');

    if (!titleEl || !countEl || !lastEl) {
      const header = document.createElement('div'); header.className='safe-header';
      const titleGroup = document.createElement('div'); titleGroup.className='safe-title-group';
      titleGroup.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;';

      titleEl = document.createElement('h2'); titleEl.id='safe-title'; titleEl.style.cssText='margin:0;font-size:1.5em;color:#eaeaea;';

      const infoDiv = document.createElement('div'); infoDiv.className='safe-info';
      infoDiv.style.cssText='display:flex;gap:20px;color:#94a3b8;';

      countEl = document.createElement('strong'); countEl.id='safe-count';
      const countSpan = document.createElement('span'); countSpan.textContent='Count: '; countSpan.appendChild(countEl);

      lastEl = document.createElement('strong'); lastEl.id='safe-last';
      const lastSpan = document.createElement('span'); lastSpan.textContent='Last: '; lastSpan.appendChild(lastEl);

      infoDiv.appendChild(countSpan); infoDiv.appendChild(lastSpan);
      titleGroup.appendChild(titleEl); titleGroup.appendChild(infoDiv);
      header.appendChild(titleGroup);

      // Tabs
      const tabsDiv = document.createElement('div'); tabsDiv.className='safe-tabs';
      tabsDiv.style.cssText='display:flex;gap:10px;margin-bottom:15px;';
      ['codes','silver','gold'].forEach(tabName=>{
        const btn = document.createElement('button');
        btn.className='safe-tab-button' + (tabName===tab?' active':'');
        btn.dataset.tab=tabName; btn.textContent=TITLE_MAP[tabName].split(' ')[0];
        btn.addEventListener('click',()=>{ switchAssetTab(tabName); });
        tabsDiv.appendChild(btn);
      });

      header.appendChild(tabsDiv);
      container.appendChild(header);
    }

    titleEl.textContent = TITLE_MAP[tab] || 'Safe Assets';
    countEl.textContent = count;
    lastEl.textContent = last;

    if(window.CODEBANK_DEBUG) console.log(`[SafeAssetList] renderHeader tab=${tab} count=${count} last=${last}`);
  }

  // ========================
  // List Renderer
  // ========================
  function renderList(tab, list, container) {
    let listContainer = container.querySelector('#safe-list');
    if(!listContainer){ listContainer = document.createElement('div'); listContainer.id='safe-list'; container.appendChild(listContainer); }
    listContainer.innerHTML='';

    if(!list || list.length===0){
      const emptyMsg = document.createElement('div'); emptyMsg.className='safe-empty';
      emptyMsg.innerHTML = `
        <div style="text-align:center;padding:40px;color:#8b949e;">
          <i class="fas fa-inbox" style="font-size:48px;margin-bottom:16px;display:block;"></i>
          <p>No ${TITLE_MAP[tab].toLowerCase()} yet.</p>
          <p style="font-size:12px;margin-top:8px;">Generate codes to see them here</p>
        </div>
      `;
      listContainer.appendChild(emptyMsg);
      return;
    }

    const PAGE_SIZE=50;
    const maxPage = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if(window.SAFE_PAGE>maxPage) window.SAFE_PAGE=maxPage;
    const start = (window.SAFE_PAGE-1)*PAGE_SIZE;
    const end = Math.min(start+PAGE_SIZE,list.length);
    const pageItems = list.slice(start,end);

    const listWrapper = document.createElement('div');
    listWrapper.style.cssText = 'max-height:400px;overflow-y:auto;';
    
    pageItems.forEach(item=>{
      const row = document.createElement('div'); row.className=`safe-item safe-${tab}`;
      row.style.cssText = 'padding:12px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;margin-bottom:8px;font-family:"Courier New",monospace;font-size:14px;color:#e0e0e0;';
      row.textContent=item;
      listWrapper.appendChild(row);
    });
    
    listContainer.appendChild(listWrapper);

    // Pagination controls
    if (list.length > PAGE_SIZE) {
      const controls = document.createElement('div');
      controls.style.cssText='display:flex;justify-content:center;gap:10px;margin-top:12px;color:#94a3b8;align-items:center;';
      const prev = document.createElement('button'); prev.textContent='← Prev'; prev.className='safe-tab-button';
      prev.style.cssText = 'padding:6px 12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;cursor:pointer;color:#e0e0e0;';
      prev.disabled = window.SAFE_PAGE<=1; 
      prev.onclick=()=>{ window.SAFE_PAGE=Math.max(1,window.SAFE_PAGE-1); renderSafeAssets(tab, container); };
      
      const next = document.createElement('button'); next.textContent='Next →'; next.className='safe-tab-button';
      next.style.cssText = 'padding:6px 12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;cursor:pointer;color:#e0e0e0;';
      next.disabled = window.SAFE_PAGE>=maxPage; 
      next.onclick=()=>{ window.SAFE_PAGE=Math.min(maxPage,window.SAFE_PAGE+1); renderSafeAssets(tab, container); };
      
      const info = document.createElement('span'); 
      info.textContent=`Page ${window.SAFE_PAGE} / ${maxPage} (${list.length} items)`;
      info.style.cssText = 'margin:0 12px;';
      
      controls.appendChild(prev); controls.appendChild(info); controls.appendChild(next);
      listContainer.appendChild(controls);
    }

    if(window.CODEBANK_DEBUG) console.log(`[SafeAssetList] renderList tab=${tab} items=${list.length}`);
  }

  // ========================
  // Tab Switching
  // ========================
  function switchAssetTab(tab){
    if(!TAB_MAP[tab]){ console.warn('[SafeAssetList] Invalid tab:',tab); return; }
    window.ACTIVE_ASSET_TAB=tab;
    window.SAFE_PAGE=1; // Reset to first page on tab switch
    const container = document.querySelector(CODEBANK_CONTAINER_SELECTOR);
    if(container) renderSafeAssets(tab, container);
    updateTabButtons(tab);
  }

  function updateTabButtons(activeTab){
    const buttons = document.querySelectorAll('.safe-tab-button');
    buttons.forEach(btn=>{ btn.classList.toggle('active',btn.dataset.tab===activeTab); });
  }
  window.switchAssetTab = switchAssetTab;

  // ========================
  // Event Handling
  // ========================
  function setupEventListeners(){
    function handleAssetUpdate(e){
      const tab=window.ACTIVE_ASSET_TAB||'codes';
      const container=document.querySelector(CODEBANK_CONTAINER_SELECTOR);
      if(container){ 
        renderSafeAssets(tab,container); 
        window.__SAFE_RENDER_PENDING__=false; 
      }
      else {
        window.__SAFE_RENDER_PENDING__=true;
        if(window.CODEBANK_DEBUG) console.warn('[SafeAssetList] Container not found for update');
      }
    }
    
    ['assets:changed','assets:updated','assets:hydrated'].forEach(evt=>{
      window.addEventListener(evt, handleAssetUpdate);
    });
    
    window.addEventListener('message',ev=>{
      try{
        const d=(ev&&ev.data)||{};
        if(d.type==='CODEBANK_ASSETS_SYNC' && d.payload){
          window.__INDEXCB_ASSETS__=d.payload;
          handleAssetUpdate();
        }
      }catch(_){}
    });
    
    window.addEventListener('section:changed', e=>{
      if(e.detail && e.detail.section==='assets') handleAssetUpdate();
    });
  }

  // ========================
  // Safe Initialization - Prevents Hanging
  // ========================
  function initSafeAssetList(){
    window.__SAFE_INIT_ATTEMPTS__++;
    
    if (window.__SAFE_INIT_ATTEMPTS__ > MAX_INIT_ATTEMPTS) {
      console.warn('[SafeAssetList] Max init attempts reached, stopping initialization');
      return;
    }

    setupEventListeners();
    
    const container = document.querySelector(CODEBANK_CONTAINER_SELECTOR);
    
    if (container) {
      // Container found, render immediately
      if(window.CODEBANK_DEBUG) console.log('[SafeAssetList] Container found, rendering...');
      renderSafeAssets(window.ACTIVE_ASSET_TAB||'codes', container);
      
      // Setup mutation observer for future changes
      setupMutationObserver();
    } else {
      // Container not found, retry with backoff
      if(window.CODEBANK_DEBUG) console.log(`[SafeAssetList] Container not found, retrying... (attempt ${window.__SAFE_INIT_ATTEMPTS__})`);
      
      if (window.__SAFE_INIT_ATTEMPTS__ < MAX_INIT_ATTEMPTS) {
        const delay = Math.min(100 * window.__SAFE_INIT_ATTEMPTS__, 2000);
        setTimeout(initSafeAssetList, delay);
      }
    }
  }

  function setupMutationObserver() {
    const container = document.querySelector(CODEBANK_CONTAINER_SELECTOR);
    if (!container) return;

    // Use a simple interval-based check instead of MutationObserver to avoid hanging
    let lastCheck = Date.now();
    const checkInterval = setInterval(() => {
      const c = document.querySelector(CODEBANK_CONTAINER_SELECTOR);
      if (!c) {
        clearInterval(checkInterval);
        return;
      }
      
      // Check if we need to re-render (e.g., after tab switch)
      if (window.__SAFE_RENDER_PENDING__) {
        renderSafeAssets(window.ACTIVE_ASSET_TAB||'codes', c);
        window.__SAFE_RENDER_PENDING__ = false;
      }
    }, 500);

    // Stop checking after 30 seconds to prevent memory leaks
    setTimeout(() => clearInterval(checkInterval), 30000);
  }

  // Wait for DOMContentLoaded before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initSafeAssetList, 100);
    });
  } else {
    setTimeout(initSafeAssetList, 100);
  }

  // ========================
  // Bankode → AssetBus Bridge
  // ========================
  function setupBankodeBridge() {
    if(!window.Bankode || !window.AssetBus) {
      if(window.CODEBANK_DEBUG) console.log('[SafeAssetList] Bankode or AssetBus not available yet, retrying...');
      setTimeout(setupBankodeBridge, 500);
      return;
    }
    
    if(Bankode._uiBridgeAttached) return;
    
    Bankode._uiBridgeAttached=true;

    function broadcastSnapshot(source='bankode-bridge'){
      try{
        if(!AssetBus.snapshot) return;
        const snap=AssetBus.snapshot();
        window.dispatchEvent(new CustomEvent('assets:updated',{detail:{snapshot:snap,source}}));
        if(window.CODEBANK_DEBUG) console.log('[UI SNAPSHOT BROADCASTED]',snap);
      }catch(_){console.error('Failed to broadcast snapshot',_);}
    }

    Bankode.on(function(payload){
      if(typeof AssetBus.addAsset==='function'){
        AssetBus.addAsset(payload.assetType||'codes',payload.code||payload.value);
        broadcastSnapshot('bankode-bridge');
      }
    });

    // Re-broadcast existing snapshot on init
    setTimeout(()=>{ broadcastSnapshot('bankode-bridge-init'); },100);

    console.log('✅ جسر Bankode → AssetBus جاهز ومتزامن مع SafeAssetList');
  }

  // Start bridge setup
  setTimeout(setupBankodeBridge, 200);

  // ========================
  // Public API
  // ========================
  window.SafeAssetList = { 
    render: renderSafeAssets, 
    switchTab: switchAssetTab, 
    getCurrentTab: () => window.ACTIVE_ASSET_TAB,
    refresh: () => {
      const container = document.querySelector(CODEBANK_CONTAINER_SELECTOR);
      if (container) renderSafeAssets(window.ACTIVE_ASSET_TAB||'codes', container);
    }
  };

  console.log('[SafeAssetList] Unified Safe Asset List renderer loaded (Fixed version)');
})();
