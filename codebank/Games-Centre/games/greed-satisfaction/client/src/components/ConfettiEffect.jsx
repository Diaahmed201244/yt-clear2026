"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfettiEffect = ConfettiEffect;
const react_1 = require("react");
function ConfettiEffect({ trigger, onComplete }) {
    const [particles, setParticles] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (!trigger)
            return;
        const colors = ['#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#3B82F6'];
        const newParticles = [];
        for (let i = 0; i < 50; i++) {
            newParticles.push({
                id: i,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 2,
                duration: Math.random() * 2 + 2,
                left: Math.random() * 100 + '%'
            });
        }
        setParticles(newParticles);
        const timer = setTimeout(() => {
            setParticles([]);
            onComplete === null || onComplete === void 0 ? void 0 : onComplete();
        }, 4000);
        return () => clearTimeout(timer);
    }, [trigger, onComplete]);
    return (<div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (<div key={particle.id} className="absolute w-2 h-2 animate-confetti" style={{
                backgroundColor: particle.color,
                left: particle.left,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
            }}/>))}
    </div>);
}
