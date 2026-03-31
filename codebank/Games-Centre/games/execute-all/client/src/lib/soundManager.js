"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.soundManager = exports.SoundManager = void 0;
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        catch (error) {
            console.log('Web Audio API not supported');
        }
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    playCardFlip() {
        if (!this.enabled || !this.audioContext)
            return;
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        }
        catch (error) {
            console.log('Sound playback failed');
        }
    }
    playCoinSound() {
        if (!this.enabled || !this.audioContext)
            return;
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        }
        catch (error) {
            console.log('Sound playback failed');
        }
    }
    playWinSound() {
        if (!this.enabled || !this.audioContext)
            return;
        try {
            const frequencies = [523, 659, 784, 1047]; // C, E, G, C octave
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                }, index * 100);
            });
        }
        catch (error) {
            console.log('Sound playback failed');
        }
    }
    playDealerVoice(message) {
        if (!this.enabled)
            return;
        try {
            // Use Speech Synthesis API for dealer voice
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.rate = 0.9;
                utterance.pitch = 1.1;
                utterance.volume = 0.7;
                // Try to find a female voice
                const voices = speechSynthesis.getVoices();
                const femaleVoice = voices.find(voice => voice.name.toLowerCase().includes('female') ||
                    voice.name.toLowerCase().includes('woman') ||
                    voice.name.toLowerCase().includes('victoria'));
                if (femaleVoice) {
                    utterance.voice = femaleVoice;
                }
                speechSynthesis.speak(utterance);
            }
        }
        catch (error) {
            console.log('Speech synthesis not available');
        }
    }
    playButtonClick() {
        if (!this.enabled || !this.audioContext)
            return;
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        }
        catch (error) {
            console.log('Sound playback failed');
        }
    }
}
exports.SoundManager = SoundManager;
exports.soundManager = new SoundManager();
