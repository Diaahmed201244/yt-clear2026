"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AudioControls;
const audioManager_1 = require("@/lib/audioManager");
function AudioControls() {
    const { isMusicPlaying, isSfxEnabled, toggleMusic, toggleSfx } = (0, audioManager_1.useAudioManager)();
    return (<div className="fixed bottom-6 left-6 space-y-2">
      <button className={`w-12 h-12 glass-effect rounded-full flex items-center justify-center hover:bg-white/20 transition-colors ${isMusicPlaying ? 'text-squid-pink' : 'text-gray-400'}`} onClick={toggleMusic} title={isMusicPlaying ? 'Pause Music' : 'Play Music'}>
        {isMusicPlaying ? '🎵' : '🔇'}
      </button>
      <button className={`w-12 h-12 glass-effect rounded-full flex items-center justify-center hover:bg-white/20 transition-colors ${isSfxEnabled ? 'text-squid-cyan' : 'text-gray-400'}`} onClick={toggleSfx} title={isSfxEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects'}>
        {isSfxEnabled ? '🔊' : '🔇'}
      </button>
    </div>);
}
