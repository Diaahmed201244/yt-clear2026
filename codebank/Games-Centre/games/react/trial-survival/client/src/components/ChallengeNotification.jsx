"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChallengeNotification;
const react_1 = require("react");
const gsap_1 = require("gsap");
const challengeDetails = {
    daily_survival: {
        title: "DAILY SURVIVAL CHALLENGE",
        description: "Complete 3 consecutive trials without using any power-ups",
        icon: "🏆",
        color: "from-yellow-600 to-orange-600"
    },
    speed_demon: {
        title: "SPEED DEMON CHALLENGE",
        description: "Complete Red Light Green Light in under 15 seconds",
        icon: "⚡",
        color: "from-blue-600 to-purple-600"
    },
    perfectionist: {
        title: "PERFECTIONIST CHALLENGE",
        description: "Complete Honeycomb Carve with perfect precision - zero errors",
        icon: "🎯",
        color: "from-green-600 to-teal-600"
    }
};
function ChallengeNotification({ challengeId, onClose }) {
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (challengeId) {
            setIsVisible(true);
            // Animate entrance
            gsap_1.default.from('.challenge-notification', {
                duration: 0.6,
                scale: 0,
                rotation: 180,
                opacity: 0,
                ease: 'back.out(1.7)'
            });
            // Auto-hide after 4 seconds
            const timer = setTimeout(() => {
                gsap_1.default.to('.challenge-notification', {
                    duration: 0.4,
                    scale: 0,
                    opacity: 0,
                    onComplete: () => {
                        setIsVisible(false);
                        onClose();
                    }
                });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [challengeId, onClose]);
    if (!isVisible || !challengeId)
        return null;
    const challenge = challengeDetails[challengeId];
    if (!challenge)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className={`challenge-notification bg-gradient-to-br ${challenge.color} rounded-2xl p-8 max-w-md mx-4 shadow-2xl border-2 border-white/20 pointer-events-auto`}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">{challenge.icon}</div>
          <h2 className="font-orbitron text-2xl font-bold text-white mb-3">
            CHALLENGE ACTIVATED!
          </h2>
          <h3 className="font-orbitron text-lg font-bold text-yellow-200 mb-4">
            {challenge.title}
          </h3>
          <p className="text-white/90 text-sm mb-6 leading-relaxed">
            {challenge.description}
          </p>
          
          <div className="bg-black/20 rounded-lg p-4 mb-4">
            <div className="text-yellow-300 font-bold text-sm mb-2">⚠️ CHALLENGE RULES</div>
            <div className="text-white/80 text-xs">
              {challengeId === 'daily_survival' && "• No power-ups allowed\n• Must complete 3 trials in sequence\n• One failure resets progress"}
              {challengeId === 'speed_demon' && "• Timer starts immediately\n• Must finish under 15 seconds\n• Movement precision still required"}
              {challengeId === 'perfectionist' && "• Zero tolerance for errors\n• Perfect tracing required\n• One mistake = challenge failed"}
            </div>
          </div>
          
          <button onClick={() => {
            gsap_1.default.to('.challenge-notification', {
                duration: 0.3,
                scale: 0,
                opacity: 0,
                onComplete: () => {
                    setIsVisible(false);
                    onClose();
                }
            });
        }} className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-white transition-colors border border-white/30">
            LET'S GO!
          </button>
        </div>
      </div>
    </div>);
}
