"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameBox = GameBox;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
function GameBox({ index, outcome, isDisabled, onOpen }) {
    const [isRevealed, setIsRevealed] = (0, react_1.useState)(false);
    const [isFlipping, setIsFlipping] = (0, react_1.useState)(false);
    const [specialAnimation, setSpecialAnimation] = (0, react_1.useState)('');
    const handleClick = () => {
        if (isDisabled || isRevealed || isFlipping)
            return;
        setIsFlipping(true);
        // Play sound effect based on outcome type
        playSound(outcome.type);
        setTimeout(() => {
            setIsRevealed(true);
            setIsFlipping(false);
            // Add special animations based on outcome
            switch (outcome.type) {
                case 'bomb':
                    setSpecialAnimation('animate-explosion');
                    break;
                case 'knife':
                    setSpecialAnimation('animate-slice');
                    break;
                case 'jackpot':
                case 'multiplier':
                    setSpecialAnimation('animate-sparkle');
                    break;
                case 'curse':
                    setSpecialAnimation('animate-curse');
                    break;
                case 'thief':
                    setSpecialAnimation('animate-steal');
                    break;
                case 'elixir':
                    setSpecialAnimation('animate-sparkle');
                    break;
                case 'shield':
                    setSpecialAnimation('animate-sparkle');
                    break;
            }
            onOpen(index);
        }, 400);
    };
    const playSound = (type) => {
        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const playTone = (frequency, duration, type = 'sine', volume = 0.1) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
        switch (type) {
            case 'bomb':
                // Explosion sound
                playTone(80, 0.1, 'sawtooth', 0.3);
                setTimeout(() => playTone(60, 0.1, 'sawtooth', 0.2), 50);
                setTimeout(() => playTone(40, 0.2, 'sawtooth', 0.1), 100);
                break;
            case 'knife':
                // Slicing sound
                playTone(800, 0.05, 'sawtooth', 0.2);
                setTimeout(() => playTone(600, 0.05, 'sawtooth', 0.15), 30);
                setTimeout(() => playTone(400, 0.1, 'sawtooth', 0.1), 60);
                break;
            case 'jackpot':
                // Victory fanfare
                playTone(523, 0.1, 'sine', 0.2); // C5
                setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 100); // E5
                setTimeout(() => playTone(784, 0.2, 'sine', 0.25), 200); // G5
                break;
            case 'multiplier':
                // Power-up sound
                playTone(400, 0.05, 'sine', 0.15);
                setTimeout(() => playTone(500, 0.05, 'sine', 0.15), 50);
                setTimeout(() => playTone(600, 0.1, 'sine', 0.2), 100);
                break;
            case 'reward':
                // Coin sound
                playTone(800, 0.1, 'sine', 0.15);
                setTimeout(() => playTone(1000, 0.1, 'sine', 0.1), 80);
                break;
            case 'thief':
                // Sneaky sound
                playTone(300, 0.1, 'triangle', 0.1);
                setTimeout(() => playTone(250, 0.1, 'triangle', 0.08), 100);
                break;
            case 'curse':
                // Ominous sound
                playTone(200, 0.3, 'sawtooth', 0.15);
                setTimeout(() => playTone(180, 0.2, 'sawtooth', 0.1), 150);
                break;
            case 'elixir':
                // Magical healing sound
                playTone(500, 0.1, 'sine', 0.15);
                setTimeout(() => playTone(700, 0.1, 'sine', 0.15), 100);
                setTimeout(() => playTone(900, 0.2, 'sine', 0.2), 200);
                break;
            case 'shield':
                // Protective shield sound
                playTone(300, 0.15, 'triangle', 0.2);
                setTimeout(() => playTone(400, 0.15, 'triangle', 0.18), 100);
                setTimeout(() => playTone(500, 0.2, 'triangle', 0.15), 200);
                break;
            default:
                // Default click sound
                playTone(600, 0.05, 'sine', 0.1);
        }
    };
    const getResultContent = () => {
        switch (outcome.type) {
            case 'reward':
                return {
                    icon: <lucide_react_1.Coins className="w-8 h-8 mb-2 animate-bounce"/>,
                    text: `+${outcome.value}`,
                    className: 'text-emerald-400 bg-emerald-900/50 border-emerald-500 animate-pulse'
                };
            case 'jackpot':
                return {
                    icon: <lucide_react_1.TrendingUp className="w-8 h-8 mb-2 animate-bounce text-yellow-400"/>,
                    text: `JACKPOT! +${outcome.value}`,
                    className: 'text-yellow-400 bg-yellow-900/50 border-yellow-500 animate-pulse'
                };
            case 'multiplier':
                return {
                    icon: <lucide_react_1.Zap className="w-8 h-8 mb-2 animate-spin text-purple-400"/>,
                    text: `${outcome.multiplier}x MULTIPLY!`,
                    className: 'text-purple-400 bg-purple-900/50 border-purple-500 animate-pulse'
                };
            case 'bomb':
                return {
                    icon: <lucide_react_1.Bomb className="w-8 h-8 mb-2 animate-shake text-red-400"/>,
                    text: 'BOOM!',
                    className: 'text-red-400 bg-red-900/50 border-red-500 animate-pulse'
                };
            case 'knife':
                return {
                    icon: <lucide_react_1.Scissors className="w-8 h-8 mb-2 animate-spin text-orange-400"/>,
                    text: 'SLICED!',
                    className: 'text-orange-400 bg-orange-900/50 border-orange-500 animate-pulse'
                };
            case 'thief':
                return {
                    icon: <lucide_react_1.UserX className="w-8 h-8 mb-2 animate-bounce text-gray-400"/>,
                    text: `-${outcome.value} STOLEN!`,
                    className: 'text-gray-400 bg-gray-900/50 border-gray-500 animate-pulse'
                };
            case 'curse':
                return {
                    icon: <lucide_react_1.Skull className="w-8 h-8 mb-2 animate-spin text-purple-600"/>,
                    text: 'CURSED!',
                    className: 'text-purple-600 bg-purple-900/50 border-purple-700 animate-pulse'
                };
            case 'elixir':
                return {
                    icon: <lucide_react_1.Heart className="w-8 h-8 mb-2 animate-bounce text-pink-400"/>,
                    text: 'ELIXIR!',
                    className: 'text-pink-400 bg-pink-900/50 border-pink-500 animate-pulse'
                };
            case 'shield':
                return {
                    icon: <lucide_react_1.Shield className="w-8 h-8 mb-2 animate-spin text-green-400"/>,
                    text: 'SHIELD!',
                    className: 'text-green-400 bg-green-900/50 border-green-500 animate-pulse'
                };
            default:
                return {
                    icon: <lucide_react_1.X className="w-8 h-8 mb-2"/>,
                    text: 'Nothing',
                    className: 'text-gray-400 bg-gray-700/50 border-gray-500'
                };
        }
    };
    const result = getResultContent();
    const handleMouseEnter = () => {
        if (!isDisabled && !isRevealed) {
            // Subtle hover sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    };
    return (<div className={`group cursor-pointer ${isDisabled ? 'pointer-events-none' : ''}`} onClick={handleClick} onMouseEnter={handleMouseEnter}>
      <div className={`
        box relative box-gradient rounded-2xl aspect-square border-2 border-gray-600 
        hover:border-indigo-500 transition-all duration-300 transform hover:scale-105 
        hover:shadow-xl hover:shadow-indigo-500/20 flex items-center justify-center 
        text-4xl text-gray-400 group-hover:text-indigo-400
        ${isFlipping ? 'animate-flip' : ''}
        ${isRevealed ? result.className : ''}
        ${specialAnimation}
      `}>
        {!isRevealed ? (<div className="flex flex-col items-center">
            <lucide_react_1.Gift className={`w-12 h-12 animate-float`} style={{ animationDelay: `${index * 0.5}s` }}/>
          </div>) : (<div className="flex flex-col items-center text-2xl font-bold">
            {result.icon}
            <span>{result.text}</span>
          </div>)}
      </div>
    </div>);
}
