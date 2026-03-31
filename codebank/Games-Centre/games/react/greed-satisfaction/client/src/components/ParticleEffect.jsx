"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticleEffect = ParticleEffect;
const react_1 = require("react");
function ParticleEffect({ type, trigger, onComplete }) {
    const [particles, setParticles] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (!trigger)
            return;
        const newParticles = [];
        const particleCount = type === 'explosion' ? 30 : type === 'sparkle' ? 20 : 15;
        for (let i = 0; i < particleCount; i++) {
            const colors = getColorsForType(type);
            newParticles.push({
                id: i,
                x: 50 + (Math.random() - 0.5) * 20,
                y: 50 + (Math.random() - 0.5) * 20,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                velocity: {
                    x: (Math.random() - 0.5) * 6,
                    y: (Math.random() - 0.5) * 6
                },
                life: 1
            });
        }
        setParticles(newParticles);
        const timer = setTimeout(() => {
            setParticles([]);
            onComplete === null || onComplete === void 0 ? void 0 : onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [trigger, type, onComplete]);
    const getColorsForType = (type) => {
        switch (type) {
            case 'sparkle':
                return ['#FFD700', '#FFA500', '#FFFF00', '#FF69B4'];
            case 'explosion':
                return ['#FF4444', '#FF8800', '#FFAA00', '#CC0000'];
            case 'slice':
                return ['#C0C0C0', '#FF6B35', '#FFB84D'];
            case 'curse':
                return ['#800080', '#4B0082', '#8B008B', '#2F2F2F'];
            case 'steal':
                return ['#696969', '#2F4F4F', '#708090'];
            default:
                return ['#FFFFFF'];
        }
    };
    return (<div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (<div key={particle.id} className="absolute rounded-full opacity-80" style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                transform: `translate(-50%, -50%)`,
                animation: `particleMove 2s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`
            }}/>))}
    </div>);
}
