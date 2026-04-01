class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.isEnabled = true;
        this.initializeAudioContext();
    }
    async initializeAudioContext() {
        try {   
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (this.audioContext.state === 'suspended') {
                const resumeContext = () => {
                    this.audioContext?.resume();
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
    }
    async loadSound(url) {
        if (!this.audioContext)
            return null;
        try {   
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        }
        catch (error) {
            console.error('Error loading sound:', error);
            return null;
        }
    }
    playBuffer(buffer) {
        if (!this.audioContext || !this.isEnabled)
            return;
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start();
    }
    playButtonClick() {
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
    playDealerVoice(text) {
        if (!this.isEnabled || !('speechSynthesis' in window))
            return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.7;
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('victoria'));
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        speechSynthesis.speak(utterance);
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    getEnabled() {
        return this.isEnabled;
    }
}
export const soundManager = new SoundManager();
