<<<<<<< HEAD
window.player = null;
function onYouTubeIframeAPIReady(){
  if(typeof YT==='undefined'||!YT.Player)return;
  var initialId='PLD60YBjiIjQPryp_T2IdNm9fukceO8AtN';
  createPlayer(initialId);
}
window.onYouTubeIframeAPIReady=onYouTubeIframeAPIReady;
function createPlayer(id){
  if(!createPlayer._p)createPlayer._p=null;
  if(createPlayer._p)return createPlayer._p;
  createPlayer._p=(async function(){
    var container=document.getElementById('video-container');
    if(!container){createPlayer._p=null;return;}
    var start=Date.now();
    while(typeof YT==='undefined'||!YT.Player){
      if(Date.now()-start>10000){createPlayer._p=null;return;}
      await new Promise(function(r){setTimeout(r,100);});
    }
    if(window.player&&typeof window.player.destroy==='function'){
      try{window.player.destroy();}catch(_){}}
    var isPlaylist=id&&id.startsWith('PL');
    var cfg={height:'100%',width:'100%',playerVars:{controls:0,disablekb:1,autoplay:1,modestbranding:1,rel:0,fs:0,iv_load_policy:3,loop:1,playsinline:1,origin:window.location.origin,enablejsapi:1},events:{onReady:onPlayerReady,onStateChange:onPlayerStateChange,onError:onPlayerError}};
    if(isPlaylist){cfg.playerVars.listType='playlist';cfg.playerVars.list=id;}else{cfg.videoId=id;cfg.playerVars.playlist=id;}
    window.player=new YT.Player('video-container',cfg);
    createPlayer._p=null;
    return window.player;
  })();
  return createPlayer._p;
}
function onPlayerReady(e){
  window.player=e.target;
  var c=document.getElementById('video-container');
  if(c){c.style.display='block';c.style.visibility='visible';c.style.opacity='1';}
  try{enableTheatreMode(e.target);}catch(_){}
  try{e.target.playVideo();}catch(_){}
  try{ console.log('[LAYOUT] video ready'); }catch(_){}
  try{ window.__layoutBootstrapApply && window.__layoutBootstrapApply(); }catch(_){}
  try{ window.dispatchEvent(new Event('yt:ready')); }catch(_){}
}
function onPlayerStateChange(e){
}
function onPlayerError(e){
}
function enableTheatreMode(p){
  if(p&&typeof p.getIframe==='function'){
    var iframe=p.getIframe();
    var container=document.getElementById('video-container');
    if(iframe&&container){
      iframe.classList.add('theatre-mode');
      container.classList.add('theatre-mode');
      document.body.classList.add('theatre-mode-active');
      var shield=document.getElementById('global-touch-shield');
      if(shield){shield.style.display='block';}
      try{ window.__layoutBootstrapApply && window.__layoutBootstrapApply(); }catch(_){}
    }
  }
}
function disableTheatreMode(p){
  var iframe=(p&&typeof p.getIframe==='function')?p.getIframe():null;
  var container=document.getElementById('video-container');
  if(iframe)iframe.classList.remove('theatre-mode');
  if(container)container.classList.remove('theatre-mode');
  document.body.classList.remove('theatre-mode-active');
  var shield=document.getElementById('global-touch-shield');
  if(shield){shield.style.display='block';}
}
function hideRecommendedVideos(){
  try{
    if(player&&typeof player.getIframe==='function'){
      var iframe=player.getIframe();
      if(iframe&&iframe.contentWindow&&iframe.contentWindow.document){
        var v=iframe.contentWindow.document.querySelector('video');
        if(v)v.style.display='none';
      }
    }
  }catch(_){}
}

// Initialize code display click-based dim toggle
(function initCodeDisplayDim(){
  function ready(fn){ if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', fn) } else { fn() } }
  ready(function(){
    var codeDisplay=document.getElementById('code-display');
    var videoContainer=document.getElementById('video-container');
    if(!codeDisplay||!videoContainer) return;
    function apply(state){
      videoContainer.classList.remove('dim-50','dim-100');
      if(state===1){ videoContainer.classList.add('dim-50') }
      else if(state===2){ videoContainer.classList.add('dim-100') }
    }
    var cycle=[1,2,1,0];
    var idx=-1;
    codeDisplay.addEventListener('click', function(){
      idx=(idx+1)%cycle.length;
      apply(cycle[idx]);
    });
  });
=======
/**
 * yt-player.init.js - REFACTORED VERSION
 * Robust initialization, dependency management, and duplication guards.
 */

(function() {
    'use strict';

    // 1. DUPLICATION GUARD
    if (window.YTPlayerController) {
        console.log('[YT-INIT] Controller already exists, skipping re-init');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const defaultVideoId = 'PLD60YBjiIjQPryp_T2IdNm9fukceO8AtN';
    const videoId = urlParams.get('v') || urlParams.get('list') || defaultVideoId;

    const YTPlayerController = {
        initialized: false,
        player: null,
        initAttempts: 0,
        maxAttempts: 50,
        checkInterval: 200,

        async start() {
            if (this.initialized) return;

            console.log('[YT-INIT] Starting initialization sequence...');

            // Wait for DOM container
            const container = document.getElementById('video-container');
            if (!container) {
                console.warn('[YT-INIT] Waiting for video-container element...');
                if (this.initAttempts < this.maxAttempts) {
                    this.initAttempts++;
                    setTimeout(() => this.start(), this.checkInterval);
                }
                return;
            }

            // Check dependencies (YT API and AssetBus)
            try {
                await this.waitForDeps();
                this.initialize();
            } catch (err) {
                console.error('[YT-INIT] Dependency timeout or error:', err);
                this.initialize(true); // Fallback to degraded mode
            }
        },

        waitForDeps() {
            return new Promise((resolve, reject) => {
                let elapsed = 0;
                const timeout = 15000; // 15s timeout

                const check = () => {
                    const hasYT = typeof YT !== 'undefined' && YT.Player;
                    const hasAssetBus = !!window.AssetBus;

                    if (hasYT && hasAssetBus) {
                        resolve();
                        return;
                    }

                    elapsed += this.checkInterval;
                    if (elapsed > timeout) {
                        reject('Timeout waiting for dependencies (YT/AssetBus)');
                        return;
                    }

                    setTimeout(check, this.checkInterval);
                };
                check();
            });
        },

        initialize(degraded = false) {
            if (this.initialized) return;

            console.log(`[YT-INIT] Initializing (degraded: ${degraded})`);

            const container = document.getElementById('video-container');
            if (!container) return;

            // Mark container to prevent layout-bootstrap from interfering
            container.setAttribute('data-yt-initialized', 'true');

            if (degraded || typeof YT === 'undefined') {
                this.setupDegradedMode(container);
            } else {
                this.setupYouTubePlayer(container);
            }

            this.initialized = true;
        },

        setupYouTubePlayer(container) {
            const isPlaylist = videoId && videoId.startsWith('PL');
            
            // 🛡️ SECURITY FIX: The origin must strictly match the protocol and port
            // 'http://localhost:3001' is the correct origin for the local dev server.
            const currentOrigin = window.location.origin;
            
            const cfg = {
                height: '100%',
                width: '100%',
                host: 'https://www.youtube.com',
                playerVars: {
                    'autoplay': 1,
                    'controls': 0,          // No native controls
                    'disablekb': 1,        // Disable keyboard shortcuts
                    'modestbranding': 1,   // Hide YouTube logo
                    'rel': 0,              // Do not show related videos
                    'showinfo': 0,         // Deprecated but still useful for old API calls
                    'iv_load_policy': 3,   // Hide video annotations
                    'fs': 0,               // Disable fullscreen button
                    'enablejsapi': 1,
                    'origin': window.location.origin // Fixes postMessage target origin error
                },
                events: {
                    onReady: (e) => this.onPlayerReady(e),
                    onStateChange: (e) => this.onPlayerStateChange(e),
                    onError: (e) => this.onPlayerError(e)
                }
            };

            if (isPlaylist) {
                cfg.playerVars.listType = 'playlist';
                cfg.playerVars.list = videoId;
            } else {
                cfg.videoId = videoId;
                cfg.playerVars.playlist = videoId;
            }

            try {
                this.player = new YT.Player('video-container', cfg);
                window.player = this.player; // Global reference for legacy support
            } catch (e) {
                console.error('[YT-INIT] YT.Player constructor failed:', e);
                this.setupDegradedMode(container);
            }
        },

        setupDegradedMode(container) {
            container.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#000;color:#fff;flex-direction:column;gap:10px;padding:20px;text-align:center;">
                    <p>YouTube Player initialization failed or timed out.</p>
                    <button onclick="window.YTPlayerController.retry()" style="padding:10px 20px;cursor:pointer;background:#f00;color:#fff;border:none;border-radius:4px;">Retry Initialization</button>
                </div>
            `;
        },

        onPlayerReady(e) {
            console.log('[YT-INIT] ✅ Player ready');
            const c = document.getElementById('video-container');
            if (c) {
                c.style.display = 'block';
                c.style.visibility = 'visible';
                c.style.opacity = '1';
                c.style.minHeight = '400px';
                c.style.height = '100%';
            }

            // 🚀 Force Autoplay with Robust Fallbacks
            const playVideo = () => {
                try {
                    e.target.playVideo();
                    console.log('[YT-INIT] playVideo() called');
                    
                    // Double check state after a moment
                    setTimeout(() => {
                        const state = e.target.getPlayerState();
                        if (state !== 1 && state !== 3) { // 1=playing, 3=buffering
                            console.warn('[YT-INIT] Player not playing (state: ' + state + '), retrying...');
                            e.target.playVideo();
                        }
                    }, 1500);
                } catch (err) {
                    console.warn('[YT-INIT] Play attempt failed:', err);
                }
            };

            // Attempt immediate play
            playVideo();

            // Also trigger on any user interaction as a fallback for strict browser policies
            const userInteractionHandler = () => {
                if (e.target.getPlayerState() !== 1) {
                    console.log('[YT-INIT] Resuming play on user interaction');
                    playVideo();
                }
                document.removeEventListener('mousedown', userInteractionHandler);
                document.removeEventListener('keydown', userInteractionHandler);
                document.removeEventListener('touchstart', userInteractionHandler);
            };

            document.addEventListener('mousedown', userInteractionHandler);
            document.addEventListener('keydown', userInteractionHandler);
            document.addEventListener('touchstart', userInteractionHandler);
            
            // Theatre mode and layout updates
            try { this.enableTheatreMode(e.target); } catch(_) {}
            try { window.__layoutBootstrapApply && window.__layoutBootstrapApply(); } catch(_) {}
            try { window.dispatchEvent(new CustomEvent('yt:ready', { detail: e.target })); } catch(_) {}
        },

        onPlayerStateChange(e) {
            // Force play if paused by browser (e.g. after interaction required)
            if (e.data === YT.PlayerState.PAUSED) {
                // If it was playing and now paused (but not by user), try to resume
                // We only do this if it was recently playing
                console.log('[YT-INIT] State changed to PAUSED; attempt auto-resume...');
                // e.target.playVideo(); 
            }
        },

        onPlayerError(e) {
            console.error('[YT-INIT] Player error code:', e.data);
        },

        enableTheatreMode(p) {
            if (p && typeof p.getIframe === 'function') {
                const iframe = p.getIframe();
                const container = document.getElementById('video-container');
                if (iframe && container) {
                    iframe.classList.add('theatre-mode');
                    container.classList.add('theatre-mode');
                    document.body.classList.add('theatre-mode-active');
                }
            }
        },

        retry() {
            this.initialized = false;
            this.initAttempts = 0;
            this.start();
        }
    };

    // Export controller
    window.YTPlayerController = YTPlayerController;

    // Trigger initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => YTPlayerController.start());
    } else {
        YTPlayerController.start();
    }

    // Backup triggers
    window.addEventListener('load', () => {
        if (!YTPlayerController.initialized) {
            console.log('[YT-INIT] Backup trigger (window load)');
            YTPlayerController.start();
        }
    });

    window.addEventListener('auth:ready', () => {
        if (!YTPlayerController.initialized) {
            console.log('[YT-INIT] Backup trigger (auth ready)');
            YTPlayerController.start();
        }
    });

    // Handle the legacy global callback
    window.onYouTubeIframeAPIReady = function() {
        console.log('[YT-INIT] Global API callback received');
        if (window.YTPlayerController && !window.YTPlayerController.initialized) {
            window.YTPlayerController.start();
        }
    };

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
})();
