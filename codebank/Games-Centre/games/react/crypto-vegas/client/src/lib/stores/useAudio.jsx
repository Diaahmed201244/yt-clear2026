"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAudio = void 0;
const zustand_1 = require("zustand");
exports.useAudio = (0, zustand_1.create)((set, get) => ({
    backgroundMusic: null,
    hitSound: null,
    successSound: null,
    isMuted: true, // Start muted by default
    setBackgroundMusic: (music) => set({ backgroundMusic: music }),
    setHitSound: (sound) => set({ hitSound: sound }),
    setSuccessSound: (sound) => set({ successSound: sound }),
    toggleMute: () => {
        const { isMuted } = get();
        const newMutedState = !isMuted;
        // Just update the muted state
        set({ isMuted: newMutedState });
        // Log the change
        console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
    },
    playHit: () => {
        const { hitSound, isMuted } = get();
        if (hitSound) {
            // If sound is muted, don't play anything
            if (isMuted) {
                console.log("Hit sound skipped (muted)");
                return;
            }
            // Clone the sound to allow overlapping playback
            const soundClone = hitSound.cloneNode();
            soundClone.volume = 0.3;
            soundClone.play().catch(error => {
                console.log("Hit sound play prevented:", error);
            });
        }
    },
    playSuccess: () => {
        const { successSound, isMuted } = get();
        if (successSound) {
            // If sound is muted, don't play anything
            if (isMuted) {
                console.log("Success sound skipped (muted)");
                return;
            }
            successSound.currentTime = 0;
            successSound.play().catch(error => {
                console.log("Success sound play prevented:", error);
            });
        }
    }
}));
