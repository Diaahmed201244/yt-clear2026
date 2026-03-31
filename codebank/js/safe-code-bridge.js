// UV: SAFE-UI-UNIFY-2026-02-15
/* ===================================================
   SafeCode Bridge - Connects SafeCode UI to AssetBus
   =================================================== */

<<<<<<< HEAD
(function() {
  'use strict';

  // Define renderSafeByTab function
  window.renderSafeByTab = function(tab) {
    if (window.SafeAssetList && typeof window.SafeAssetList.render === 'function') {
      window.SafeAssetList.render(tab);
    } else {
      console.warn('[SafeCode] SafeAssetList not available');
    }
  };

  window.fixAssetsAndSafeCode = function() {
    try {
      var inCodeBank = /\/codebank\//.test(location.pathname);
      if (!inCodeBank) {
        document.querySelectorAll('#safe-list, .safe-list').forEach(function(el){ try { el.remove(); } catch(_){} });
        document.querySelectorAll('.safe-panel').forEach(function(el){ try { el.remove(); } catch(_){} });
        // No auto-open or section switching outside CodeBank overlay
      }
    } catch(_){}
  };

  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', window.fixAssetsAndSafeCode);
    } else {
      window.fixAssetsAndSafeCode();
    }
  } catch(_){}

  console.log('[SafeCode Bridge] Loaded - renderSafeByTab function defined');
=======
(function attachSafeCodeBridge() {
  if (window.__safeCodeBridgeAttached) return;
  window.__safeCodeBridgeAttached = true;

  'use strict';

  // Define renderSafeByTab function
  window.renderSafeByTab = function(codeObject) {
    const code = codeObject?.code || '[NO CODE]';
    const tabElement = document.getElementById('safe-code-display'); // Assuming this is the target element
    if (tabElement) {
      tabElement.textContent = code;
    }
  };

  function initBridge() {
    console.log('[SafeCode Bridge] Initializing...');
    // The rest of your bridge initialization logic can go here
  }

  // Wait for SafeAssetList to be ready
  window.addEventListener('safeAssetList:ready', initBridge);
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
})();
