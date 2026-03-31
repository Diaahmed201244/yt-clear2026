// studio-menu-patch.js - Load this INSIDE the studio iframe
(function() {
  'use strict';

  console.log('[StudioPatch] Menu patch loaded');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchMenus);
  } else {
    patchMenus();
  }

  function patchMenus() {
    // Find all menu buttons
    const menuButtons = document.querySelectorAll(
      'button, [role="button"], .menu-item, [data-menu], nav > *, header > *'
    );

    menuButtons.forEach(button => {
      // Skip already patched buttons
      if (button.dataset.patched) return;
      
      const text = button.textContent?.toLowerCase() || '';
      const isMenu = ['file', 'edit', 'add', 'patterns', 'view', 'options', 'help']
        .some(menu => text.includes(menu));

      if (isMenu) {
        button.dataset.patched = 'true';
        
        // Add click handler that notifies parent
        button.addEventListener('click', function(e) {
          console.log('[StudioPatch] Menu clicked:', text);
          
          // Notify parent window
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'STUDIO_MENU_CLICK',
              menu: text.trim(),
              element: button.className || button.id || 'unknown',
              timestamp: Date.now()
            }, '*');
          }
        });

        // Ensure button is clickable
        button.style.pointerEvents = 'auto';
        button.style.cursor = 'pointer';
      }
    });

    console.log('[StudioPatch] Patched', menuButtons.length, 'menu buttons');
  }

  // Also patch dynamically added menus
  const observer = new MutationObserver(function(mutations) {
    let shouldRepatch = false;
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        shouldRepatch = true;
      }
    });
    if (shouldRepatch) {
      setTimeout(patchMenus, 100);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Listen for parent messages
  window.addEventListener('message', function(event) {
    if (event.data?.type === 'PARENT_READY') {
      console.log('[StudioPatch] Parent is ready');
      window.parent.postMessage({ type: 'STUDIO_READY' }, '*');
    }
  });

})();
