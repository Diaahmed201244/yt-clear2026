// UV: SAFE-UI-UNIFY-2026-02-15
/* ===================================================
   SafeCode Bridge - Connects SafeCode UI to AssetBus
   =================================================== */

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
})();
