// extra-mode-engine.js
// Centralized Engine for Extra Mode - Event Driven & State Controlled
(function() {
  if (window.ExtraModeEngine) return;

  const SILVER_BAR_TIME = 300000; // 5 minutes
  const GOLD_BAR_TIME = 600000;  // 10 minutes

  window.ExtraModeEngine = {
    state: {
      watchTime: 0,
      barMode: 'silver',
      active: false
    },

    init() {
      console.log('[ExtraModeEngine] Initializing...');
      
      // Listen to central events
      window.EventBus.on('EXTRA_START_REQUESTED', (mode) => this.activate(mode));
      window.EventBus.on('EXTRA_STOP_REQUESTED', () => this.deactivate());
      window.EventBus.on('CHALLENGE_FAILED', () => this.deactivate());
      window.EventBus.on('REWARD_CLAIMED', () => this.resetProgress());

      // Watch visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.state.active) {
          console.log('[ExtraModeEngine] Tab hidden - deactivating extra mode');
          this.deactivate();
        }
      });
    },

    activate(mode = 'silver') {
      if (window.SYSTEM_STATE.mode !== 'NORMAL' && window.SYSTEM_STATE.mode !== 'EXTRA') return;
      
      // 🛡️ Rule: Don't start if reward is ready
      if (window.SYSTEM_STATE.mode === 'REWARD_READY') {
        console.warn('[ExtraModeEngine] Cannot start while reward is ready');
        return;
      }

      this.state.active = true;
      this.state.barMode = mode;
      
      window.SYSTEM_STATE.update({ mode: 'EXTRA' });
      window.EventBus.emit('EXTRA_STARTED', { mode });

      this.startTimer();
      console.log(`[ExtraModeEngine] Activated: ${mode}`);
    },

    deactivate() {
      if (!this.state.active) return;

      this.state.active = false;
      this.stopTimer();
      
      window.SYSTEM_STATE.update({ mode: 'NORMAL' });
      window.EventBus.emit('EXTRA_STOPPED');
      console.log('[ExtraModeEngine] Deactivated');
    },

    startTimer() {
      this.stopTimer(); // Ensure clean start
      
      this.timerId = window.TimerManager.setInterval(() => {
        this.state.watchTime += 100;
        
        // Emit progress
        const limit = this.state.barMode === 'silver' ? SILVER_BAR_TIME : GOLD_BAR_TIME;
        const progress = Math.min(100, (this.state.watchTime / limit) * 100);
        
        window.EventBus.emit('EXTRA_PROGRESS', { 
          progress, 
          watchTime: this.state.watchTime,
          limit 
        });

        if (progress >= 100) {
          this.onProgressComplete();
        }
      }, 100);
    },

    stopTimer() {
      if (this.timerId) {
        window.TimerManager.clearInterval(this.timerId);
        this.timerId = null;
      }
    },

    onProgressComplete() {
      this.stopTimer();
      const reward = {
        id: 'reward_' + Date.now(),
        type: this.state.barMode === 'silver' ? 'SILVER_CODE' : 'GOLD_CODE',
        timestamp: Date.now()
      };
      
      window.SYSTEM_STATE.update({ mode: 'REWARD_READY', reward });
      window.EventBus.emit('REWARD_READY', reward);
    },

    resetProgress() {
      this.state.watchTime = 0;
      window.EventBus.emit('EXTRA_PROGRESS', { progress: 0, watchTime: 0 });
    }
  };

  // Auto-init
  window.ExtraModeEngine.init();
})();
