import { useState, useCallback } from "react";
class AudioManager {
    constructor() {
        this.audioElements = new Map();
        this.isMusicPlaying = false;
        this.isSfxEnabled = true;
        this.masterVolume = 0.7;
        this.audioCollection = {
            backgroundMusic: {
                src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzaD0fPLeTEFKHfM8N2QQAoUXrTn66hVFApKpOPwtWMcBjiPz/LNeSsEJX/L8N6QRAsUXrvnAB",
                volume: 0.3,
                loop: true
            },
            eliminationSound: {
                src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzaD0fPLeTEFKHfM8N2QQAoUXrTn66hVFApKpOPwtWMcBjiPz/LNeSsEJX/L8N6QRAsUXrvnAB",
                volume: 0.8,
                loop: false
            },
            victorySound: {
                src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzaD0fPLeTEFKHfM8N2QQAoUXrTn66hVFApKpOPwtWMcBjiPz/LNeSsEJX/L8N6QRAsUXrvnAB",
                volume: 0.8,
                loop: false
            },
            buttonClick: {
                src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzaD0fPLeTEFKHfM8N2QQAoUXrTn66hVFApKpOPwtWMcBjiPz/LNeSsEJX/L8N6QRAsUXrvnAB",
                volume: 0.5,
                loop: false
            },
            redLightGreenLight: {
                src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzaD0fPLeTEFKHfM8N2QQAoUXrTn66hVFApKpOPwtWMcBjiPz/LNeSsEJX/L8N6QRAsUXrvnAB",
                volume: 0.6,
                loop: false
            },
            honeycombCarve: {
                src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzaD0fPLeTEFKHfM8N2QQAoUXrTn66hVFApKpOPwtWMcBjiPz/LNeSsEJX/L8N6QRAsUXrvnAB",
                volume: 0.6,
                loop: false
            },
            tugOfWar: {
                src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzaD0fPLeTEFKHfM8N2QQAoUXrTn66hVFApKpOPwtWMcBjiPz/LNeSsEJX/L8N6QRAsUXrvnAB",
                volume: 0.6,
                loop: false
            },
            marbles: {
                src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzaD0fPLeTEFKHfM8N2QQAoUXrTn66hVFApKpOPwtWMcBjiPz/LNeSsEJX/L8N6QRAsUXrvnAB",
                volume: 0.6,
                loop: false
            },
            glassBridge: {
                src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzaD0fPLeTEFKHfM8N2QQAoUXrTn66hVFApKpOPwtWMcBjiPz/LNeSsEJX/L8N6QRAsUXrvnAB",
                volume: 0.6,
                loop: false
            }
        };
        this.initializeAudioElements();
    }
    initializeAudioElements() {
        Object.entries(this.audioCollection).forEach(([key, audioFile]) => {
            const audio = new Audio(audioFile.src);
            audio.volume = audioFile.volume * this.masterVolume;
            audio.loop = audioFile.loop;
            audio.preload = 'metadata';
            this.audioElements.set(key, audio);
        });
    }
    getAudioElement(key) {
        return this.audioElements.get(key);
    }
    playSound(key) {
        if (!this.isSfxEnabled && key !== 'backgroundMusic')
            return;
        const audio = this.getAudioElement(key);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(console.warn);
        }
    }
    stopSound(key) {
        const audio = this.getAudioElement(key);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
    playBackgroundMusic() {
        const music = this.getAudioElement('backgroundMusic');
        if (music && !this.isMusicPlaying) {
            music.play().catch(console.warn);
            this.isMusicPlaying = true;
        }
    }
    pauseBackgroundMusic() {
        const music = this.getAudioElement('backgroundMusic');
        if (music && this.isMusicPlaying) {
            music.pause();
            this.isMusicPlaying = false;
        }
    }
    toggleMusic() {
        if (this.isMusicPlaying) {
            this.pauseBackgroundMusic();
        }
        else {
            this.playBackgroundMusic();
        }
    }
    toggleSfx() {
        this.isSfxEnabled = !this.isSfxEnabled;
    }
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        Object.entries(this.audioCollection).forEach(([key, audioFile]) => {
            const audio = this.getAudioElement(key);
            if (audio) {
                audio.volume = audioFile.volume * this.masterVolume;
            }
        });
    }
    getMusicStatus() {
        return this.isMusicPlaying;
    }
    getSfxStatus() {
        return this.isSfxEnabled;
    }
}
const audioManager = new AudioManager();
export function useAudioManager() {
    const [isMusicPlaying, setIsMusicPlaying] = useState(audioManager.getMusicStatus());
    const [isSfxEnabled, setIsSfxEnabled] = useState(audioManager.getSfxStatus());
    const toggleMusic = useCallback(() => {
        audioManager.toggleMusic();
        setIsMusicPlaying(audioManager.getMusicStatus());
    }, []);
    const toggleSfx = useCallback(() => {
        audioManager.toggleSfx();
        setIsSfxEnabled(audioManager.getSfxStatus());
    }, []);
    const playSound = useCallback((key) => {
        audioManager.playSound(key);
    }, []);
    const stopSound = useCallback((key) => {
        audioManager.stopSound(key);
    }, []);
    return {
        isMusicPlaying,
        isSfxEnabled,
        toggleMusic,
        toggleSfx,
        playSound,
        stopSound
    };
}
export { audioManager };
