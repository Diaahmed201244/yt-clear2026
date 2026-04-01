"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {    step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try {    step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.soundManager = void 0;
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.isEnabled = true;
        // Initialize audio context on first user interaction
        this.initializeAudioContext();
    }
    initializeAudioContext() {
        return __awaiter(this, void 0, void 0, function* () {
            try {   
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                if (this.audioContext.state === 'suspended') {
                    // Resume context on first user interaction
                    const resumeContext = () => {
                        var _a;
                        (_a = this.audioContext) === null || _a === void 0 ? void 0 : _a.resume();
                        document.removeEventListener('click', resumeContext);
                        document.removeEventListener('keydown', resumeContext);
                    };
                    document.addEventListener('click', resumeContext);
                    document.addEventListener('keydown', resumeContext);
                }
            }
            catch (error) {
                console.warn('Web Audio API not supported:', error);
            }
        });
    }
    loadSound(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.audioContext)
                return null;
            try {   
                const response = yield fetch(url);
                const arrayBuffer = yield response.arrayBuffer();
                const audioBuffer = yield this.audioContext.decodeAudioData(arrayBuffer);
                return audioBuffer;
            }
            catch (error) {
                console.error('Error loading sound:', error);
                return null;
            }
        });
    }
    playBuffer(buffer) {
        if (!this.audioContext || !this.isEnabled)
            return;
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start();
    }
    // Play UI sounds
    playButtonClick() {
        // Use Web Audio API to generate a click sound
        if (!this.audioContext || !this.isEnabled)
            return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    playCardFlip() {
        if (!this.audioContext || !this.isEnabled)
            return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }
    playChipSound() {
        if (!this.audioContext || !this.isEnabled)
            return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    // Dealer voice simulation using speech synthesis
    playDealerVoice(text) {
        if (!this.isEnabled || !('speechSynthesis' in window))
            return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.7;
        // Try to use a female voice
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('victoria'));
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        speechSynthesis.speak(utterance);
    }
    // Enable/disable sound
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    // Get sound status
    getEnabled() {
        return this.isEnabled;
    }
}
exports.soundManager = new SoundManager();
