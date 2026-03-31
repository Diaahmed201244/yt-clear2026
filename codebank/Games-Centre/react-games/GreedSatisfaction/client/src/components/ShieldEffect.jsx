"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShieldEffect = ShieldEffect;
function ShieldEffect({ isActive, timeLeft }) {
    if (!isActive)
        return null;
    const shieldOpacity = Math.max(0.1, timeLeft / 10);
    const pulseIntensity = timeLeft <= 3 ? 'animate-pulse' : '';
    return (<div className="fixed inset-0 pointer-events-none z-40">
      {/* Shield border effect */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${pulseIntensity}`} style={{
            width: '400px',
            height: '400px',
            border: `4px solid rgba(34, 197, 94, ${shieldOpacity})`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(34, 197, 94, ${shieldOpacity * 0.1}) 0%, transparent 70%)`,
            boxShadow: `0 0 30px rgba(34, 197, 94, ${shieldOpacity * 0.8}), inset 0 0 30px rgba(34, 197, 94, ${shieldOpacity * 0.3})`,
            animation: 'shieldPulse 2s ease-in-out infinite'
        }}/>
      
      {/* Shield timer display */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <div className="bg-green-900/80 backdrop-blur-sm border border-green-500 rounded-lg px-4 py-2">
          <div className="text-green-400 font-bold text-lg flex items-center gap-2">
            🛡️ Shield Active: {timeLeft}s
          </div>
          <div className="w-32 bg-green-900 rounded-full h-2 mt-1">
            <div className="bg-green-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${(timeLeft / 10) * 100}%` }}/>
          </div>
        </div>
      </div>

      {/* Protective particles */}
      <div className="shield-particles">
        {[...Array(12)].map((_, i) => (<div key={i} className="shield-particle" style={{
                left: `${50 + 30 * Math.cos((i * 30) * Math.PI / 180)}%`,
                top: `${50 + 30 * Math.sin((i * 30) * Math.PI / 180)}%`,
                animationDelay: `${i * 0.1}s`
            }}/>))}
      </div>
    </div>);
}
