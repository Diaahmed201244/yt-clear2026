<<<<<<< HEAD
function __measureInset(){
  const el=document.createElement('div');
  el.style.cssText='position:fixed;left:-9999px;top:-9999px;padding-bottom:env(safe-area-inset-bottom);';
  document.body.appendChild(el);
  const v=parseFloat(getComputedStyle(el).paddingBottom)||0;
  document.body.removeChild(el);
  return v;
}
function __applyVars(){
  // choose the real visual video box
  let videoBoxEl = null;
  try {
    const iframe = document.querySelector('#video-container iframe');
    if (iframe) {
      videoBoxEl = iframe;
    } else {
      const container = document.getElementById('video-container');
      if (container) {
        videoBoxEl = container;
      } else {
        videoBoxEl = document.querySelector('.video-wrapper');
      }
    }
  } catch(_) {}
  if(!videoBoxEl) return;

  const r = videoBoxEl.getBoundingClientRect();
  const inset = __measureInset();
  // write css vars on a shared ancestor so counter can read them
  const scopeEl = document.querySelector('.video-wrapper') || document.documentElement;
  scopeEl.style.setProperty('--video-w', r.width+'px');
  scopeEl.style.setProperty('--video-h', r.height+'px');
  scopeEl.style.setProperty('--video-x', r.left+'px');
  scopeEl.style.setProperty('--video-y', r.top+'px');
  scopeEl.style.setProperty('--video-aspect', (r.width&&r.height?(r.width/r.height):0)+'');
  scopeEl.style.setProperty('--safe-bottom', inset+'px');
  try{ console.log('[LAYOUT] using video box from '+(videoBoxEl.id?('#'+videoBoxEl.id):(videoBoxEl.tagName.toLowerCase()))); }catch(_){ }
}
function __init(){
  __applyVars();
  window.addEventListener('resize', __applyVars);
  try{
    const wrapper=document.querySelector('.video-wrapper');
    if(wrapper&&typeof ResizeObserver!=='undefined'){
      const ro=new ResizeObserver(()=>__applyVars());
      ro.observe(wrapper);
    }
  }catch(_){ }
}
window.__layoutBootstrapApply=__applyVars;
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', __init);
}else{
  __init();
}
try{ window.addEventListener('load', ()=>__applyVars()); }catch(_){ }
=======
/**
 * Layout Bootstrap - Fix double frame issue
 */

(function() {
    'use strict';
    
    function initLayout() {
        console.log('[LAYOUT] Initializing...');
        
        // Find or create main container
        let mainContainer = document.getElementById('main-content');
        if (!mainContainer) {
            mainContainer = document.createElement('div');
            mainContainer.id = 'main-content';
            document.body.appendChild(mainContainer);
        }
        
        // Clear any duplicate video containers
        const existingContainers = document.querySelectorAll('#video-container');
        if (existingContainers.length > 1) {
            console.log(`[LAYOUT] Found ${existingContainers.length} video containers, removing duplicates`);
            for (let i = 1; i < existingContainers.length; i++) {
                existingContainers[i].remove();
            }
        }
        
        // Ensure single video container with proper structure
        let videoContainer = document.getElementById('video-container');
        if (!videoContainer) {
            videoContainer = document.createElement('div');
            videoContainer.id = 'video-container';
            videoContainer.style.cssText = `
                width: 100%;
                height: 60vh;
                position: relative;
                background: #000;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 20px;
            `;
            
            // Insert at top of main content
            mainContainer.insertBefore(videoContainer, mainContainer.firstChild);
        }
        
        // Ensure player div exists INSIDE container
        let playerDiv = document.getElementById('yt-player');
        if (!playerDiv || playerDiv.parentElement !== videoContainer) {
            // Remove misplaced player
            if (playerDiv) playerDiv.remove();
            
            // Create new player div inside container
            playerDiv = document.createElement('div');
            playerDiv.id = 'yt-player';
            playerDiv.style.cssText = 'width:100%;height:100%;';
            videoContainer.appendChild(playerDiv);
        }
        
        console.log('[LAYOUT] ✅ Video container ready');
    }
    
    // Run immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLayout);
    } else {
        initLayout();
    }
    
})();
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
