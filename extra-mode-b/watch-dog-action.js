// Watch-dog prayer time logic for Extra Mode


let PRAYER_TIMES = [];
let watchDogTimerId = null;
let watchDogAudioInst = null;

// Fetch real local prayer times using Aladhan API
function fetchPrayerTimes() {
  // Get user's location
// Action Layer: Watch-dog prayer time logic for Extra Mode
// Path: /extra-mode-b/watch-dog-action.js

let PRAYER_TIMES = [];
let watchDogTimerId = null;

/**
 * ACTION LAYER Responsibilities:
 * - Decide WHEN to trigger states
 * - Connect to external data (Aladhan API)
 * - Do NOT create dog instance
 * - Do NOT import Three.js
 */

// Fetch real local prayer times using Aladhan API
function fetchPrayerTimes() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lon}&method=2`;
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data && data.data && data.data.timings) {
            const t = data.data.timings;
            PRAYER_TIMES = [
              { name: 'Fajr', time: t.Fajr },
              { name: 'Dhuhr', time: t.Dhuhr },
              { name: 'Asr', time: t.Asr },
              { name: 'Maghrib', time: t.Maghrib },
              { name: 'Isha', time: t.Isha }
            ];
            console.log('Fetched prayer times:', PRAYER_TIMES);
          }
        })
        .catch(err => console.error('Failed to fetch prayer times:', err));
    }, function(error) {
      console.error('Geolocation error:', error);
    });
  } else {
    console.error('Geolocation not supported');
  }
}

// Fetch prayer times on load
            console.log('[ActionLayer] Fetched prayer times:', PRAYER_TIMES);
          }
        })
        .catch(err => console.error('[ActionLayer] Failed to fetch prayer times:', err));
    }, function(error) {
      console.error('[ActionLayer] Geolocation error:', error);
    });
  }
}

// Initial fetch
fetchPrayerTimes();

// Returns true if current time is within 30 min before/after any prayer
function isWithinPrayerWindow() {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const prayer of PRAYER_TIMES) {
    // Prayer time may be in "HH:mm" or "HH:mm (24h)" format
    let timeStr = prayer.time.split(' ')[0];
    const [h, m] = timeStr.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (Math.abs(nowMinutes - prayerMinutes) <= 30) {
      return true;
    }
  }
  return false;
}

// Watch-dog activation logic
function setWatchDogActive(active) {
  window.watchDogActive = active;
  // Add your watch-dog activation/deactivation code here
  if (active) {
    console.log('Watch-dog activated');
    try { document.body.classList.add('watch-dog-active'); } catch(_){}
    try { scheduleNextWatchDog(); } catch(_){}
  } else {
    console.log('Watch-dog deactivated (prayer window)');
    try { document.body.classList.remove('watch-dog-active'); } catch(_){}
    try { if (watchDogTimerId) { clearTimeout(watchDogTimerId); watchDogTimerId = null; } } catch(_){}
  }
}

// Call this when Extra Mode is toggled
/**
 * Triggers the watchdog state through the Adapter singleton
 * @param {boolean} active 
 */
function setWatchDogActive(active) {
  window.watchDogActive = active;
  
  // 🔗 Communication: Action Layer -> Adapter
  const guardian = window.__GUARDIAN__;
  const tm = window.TimerManager;
  
  if (active) {
    console.log('[ActionLayer] Watch-dog activated');
    try { document.body.classList.add('watch-dog-active'); } catch(_){}
    
    // Set 3D state to monitoring if active
    if (guardian && typeof guardian.setState === 'function') {
      guardian.setState('monitoring');
    }
  } else {
    console.log('[ActionLayer] Watch-dog deactivated');
    try { document.body.classList.remove('watch-dog-active'); } catch(_){}
    
    // Set 3D state to idle if deactivated
    if (guardian && typeof guardian.setState === 'function') {
      guardian.setState('idle');
    }
    
    if (watchDogTimerId) {
      if (tm) {
        tm.clearTimeout(watchDogTimerId);
      } else {
        clearTimeout(watchDogTimerId);
      }
      watchDogTimerId = null;
    }
  }
}

// Handle Extra Mode changes
function handleExtraModeChange(isActive) {
  if (isActive) {
    if (isWithinPrayerWindow()) {
      setWatchDogActive(false);
    } else {
      setWatchDogActive(true);
    }
  } else {
    setWatchDogActive(false);
  }
}

// Optionally, check every minute to re-activate after prayer window
setInterval(() => {
  if (window.extraModeActive) {
    handleExtraModeChange(true);
  }
}, 60000);

// Export for use in other scripts
window.handleExtraModeChange = handleExtraModeChange;
window.isWithinPrayerWindow = isWithinPrayerWindow;
window.setWatchDogActive = setWatchDogActive;

// React to explicit extra mode change events
try {
  window.addEventListener('extra-mode:changed', function(e){
    const active = !!(e && e.detail && e.detail.active);
    handleExtraModeChange(active);
  });
} catch(_){}

// --- Watch-dog random timing and action logic ---
// getRandomWatchDogIntervalMs: returns a randomized interval in milliseconds.
// The algorithm samples from a base uniform distribution [60s, 300s] and applies
// an additional jitter of [-20s, +20s], then clamps to [45s, 360s]. This yields
// unpredictable, human-feeling intervals that vary on each reschedule.
function getRandomWatchDogIntervalMs(){
  const base = 60000 + Math.random() * (300000 - 60000); // 60s..300s
  const jitter = (Math.random() * 40000) - 20000; // -20s..+20s
  const ms = Math.max(45000, Math.min(360000, Math.floor(base + jitter)));
  return ms;
}

function initWatchDogAudio(){
  try{
    if (!watchDogAudioInst) {
      watchDogAudioInst = new Audio('/services/yt-clear/extra-mode-b/watch-dog.mp3');
      watchDogAudioInst.preload = 'auto';
      watchDogAudioInst.volume = 0.35; // default volume, can be tuned
    }
  }catch(e){ console.warn('Watch-dog audio init failed', e); }
}

function playWatchDogSound(){
  try{
    initWatchDogAudio();
    if (watchDogAudioInst) {
      // Handle autoplay restrictions gracefully
      const p = watchDogAudioInst.play();
      if (p && typeof p.then === 'function') {
        p.catch(err => console.warn('Watch-dog audio playback blocked', err));
      }
    }
  }catch(e){ console.warn('Watch-dog audio play failed', e); }
}

function executeWatchDogAction(){
  try{
    // Only act when Extra Mode is active and dog is allowed (not in prayer window)
    if (!window.extraModeActive) return scheduleNextWatchDog();
    if (!window.watchDogActive) return scheduleNextWatchDog();
    // Perform the action: play sound and any visual cue
    playWatchDogSound();
  }catch(e){ console.warn('Watch-dog action failed', e); }
  finally{
    scheduleNextWatchDog();
  }
}

function scheduleNextWatchDog(){
  try{
    if (watchDogTimerId) { clearTimeout(watchDogTimerId); watchDogTimerId = null; }
    const delay = getRandomWatchDogIntervalMs();
    watchDogTimerId = setTimeout(executeWatchDogAction, delay);
  }catch(e){ console.warn('Watch-dog scheduling failed', e); }
}

// Expose for testing
window.getRandomWatchDogIntervalMs = getRandomWatchDogIntervalMs;
// Periodic check using TimerManager
if (window.TimerManager) {
  window.TimerManager.setInterval(() => {
    if (window.extraModeActive) {
      handleExtraModeChange(true);
    }
  }, 60000);
} else {
  console.warn('[ActionLayer] TimerManager not found, using direct setInterval');
  setInterval(() => {
    if (window.extraModeActive) {
      handleExtraModeChange(true);
    }
  }, 60000);
}

// Global exports
window.handleExtraModeChange = handleExtraModeChange;
window.isWithinPrayerWindow = isWithinPrayerWindow;
