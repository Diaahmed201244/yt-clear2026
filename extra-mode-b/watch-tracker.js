
// --- Extra Reward Mode Implementation ---
let watchSeconds = 0;
let watchInterval = null;
let extraModeActive = false;
let pressTimer = null;

function startExtraWatch() {
  // Check if current section allows extra mode (only Home section)
  const currentSection = window.currentSection || 'home';
  if (currentSection !== 'home') {
    console.warn('[Extra Mode] Cannot activate extra mode on', currentSection, 'section. Only available on Home section.');
    // Show popup notification
    if (window.showExtraModeBlockedPopup && typeof window.showExtraModeBlockedPopup === 'function') {
      window.showExtraModeBlockedPopup();
    }
    return; // Prevent activation
  }
  
  extraModeActive = true;
  watchSeconds = 0;
  clearInterval(watchInterval);

  watchInterval = setInterval(() => {
    if (document.visibilityState === "visible") {
      watchSeconds += 5 * 60; // 5 minutes in seconds
      checkBarReward();
    } else {
      cancelExtraMode("Lost visibility");
    }
  }, 5 * 60 * 1000);
}

function cancelExtraMode(reason) {
  console.log("Extra mode cancelled:", reason);
  watchSeconds = 0;
  extraModeActive = false;
  clearInterval(watchInterval);
  updateExtraDisplay("");
}

function checkBarReward() {
  const display = document.getElementById("code-display");

  if (watchSeconds >= 36000) { // 10 hours
    display.innerText = "1 Gold Bar";
    // saveToSupabase("1 Gold Bar"); // Removed - using Clerk for authentication
    cancelExtraMode("Gold reward complete");
  } else if (watchSeconds >= 3600 && watchSeconds % 3600 === 0) {
    display.innerText = "1 Silver Bar";
    // saveToSupabase("1 Silver Bar"); // Removed - using Clerk for authentication
    // Do NOT cancel, allow continued watching toward gold
  } else {
    // Show progress toward next bar
    updateExtraDisplay(formatExtraProgress());
  }
}

function updateExtraDisplay(text) {
  const display = document.getElementById("code-display");
  if (display) display.innerText = text;
}

function formatExtraProgress() {
  // Show time toward next bar
  const hours = Math.floor(watchSeconds / 3600);
  const mins = Math.floor((watchSeconds % 3600) / 60);
  let next = "";
  if (watchSeconds < 3600) {
    next = `Next Silver Bar: ${60 - mins} min`;
  } else if (watchSeconds < 36000) {
    next = `Silver Bars: ${hours} | Next Gold: ${10 - hours} hr`;
  }
  return `Extra Mode\n${next}`;
}

// Long press activation for Extra button
window.addEventListener("DOMContentLoaded", () => {
  const extraBtn = document.getElementById("extra-button");
  if (!extraBtn) return;
  extraBtn.addEventListener("mousedown", () => {
    pressTimer = setTimeout(startExtraWatch, 1500);
  });
  extraBtn.addEventListener("mouseup", () => clearTimeout(pressTimer));
  extraBtn.addEventListener("mouseleave", () => clearTimeout(pressTimer));
});

// Cancel Extra mode on focus loss
document.addEventListener("visibilitychange", () => {
  if (extraModeActive && document.visibilityState !== "visible") {
    cancelExtraMode("Lost focus");
  }
});

// Prevent normal code gen if extraModeActive
function shouldGenerateNormalCode() {
  return !extraModeActive;
}

// --- Normal code generation fallback (if not in extra mode) ---
let secondsWatched = 0;
let interval = null;

function startWatching() {
  if (extraModeActive) return;
  interval = setInterval(() => {
    if (document.visibilityState === "visible") {
      secondsWatched += 300;
      handleCodeGeneration();
    }
  }, 5 * 60 * 1000);
}

function resetWatching() {
  secondsWatched = 0;
}

function handleCodeGeneration() {
  if (!shouldGenerateNormalCode()) return;
  const display = document.getElementById("code-display");

  if (secondsWatched >= 36000) {
    display.innerText = "1 Gold Bar";
    saveToSupabase("1 Gold Bar");
    secondsWatched = 0;
  } else if (secondsWatched % 3600 < 300 && secondsWatched >= 3600) {
    display.innerText = "1 Silver Bar";
    saveToSupabase("1 Silver Bar");
  } else {
    // Mirror-only: do not generate codes here
    updateExtraDisplay(formatExtraProgress());
  }
}

// No local generation functions in mirror-only mode

function compress(code) {
  return LZString.compressToUTF16(code);
}

function saveToLocal(code) {
  localStorage.setItem("lastCode", code);
}

// Network persistence removed per mirror-only architecture

window.onload = () => startWatching();
