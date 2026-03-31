"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChallengeProgress = void 0;
exports.default = ChallengeStatus;
const react_1 = require("react");
const gsap_1 = require("gsap");
const challengeDetails = {
    daily_survival: {
        title: "DAILY SURVIVAL",
        description: "Complete 3 consecutive trials without power-ups",
        objective: "Trials completed without power-ups",
        target: 3,
        reward: 250,
        icon: "🏆"
    },
    speed_demon: {
        title: "SPEED DEMON",
        description: "Complete trial 50% faster than normal",
        objective: "Complete in under 15 seconds",
        target: 15,
        reward: 150,
        icon: "⚡"
    },
    perfectionist: {
        title: "PERFECTIONIST",
        description: "Complete with perfect precision",
        objective: "Zero errors allowed",
        target: 0,
        reward: 200,
        icon: "🎯"
    }
};
function ChallengeStatus({ challengeId, onComplete, onFail }) {
    const [progress, setProgress] = (0, react_1.useState)(0);
    const [timeRemaining, setTimeRemaining] = (0, react_1.useState)(0);
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (challengeId) {
            setIsVisible(true);
            setProgress(0);
            // Animate challenge banner entrance
            gsap_1.default.from('.challenge-banner', {
                duration: 0.5,
                y: -100,
                opacity: 0,
                ease: 'back.out(1.7)'
            });
            // Set initial timer based on challenge type
            if (challengeId === 'speed_demon') {
                setTimeRemaining(15);
                const timer = setInterval(() => {
                    setTimeRemaining(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            onFail();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
                return () => clearInterval(timer);
            }
        }
        else {
            setIsVisible(false);
        }
    }, [challengeId, onFail]);
    const updateProgress = (newProgress) => {
        setProgress(newProgress);
        // Animate progress bar
        gsap_1.default.to('.progress-fill', {
            duration: 0.3,
            width: `${(newProgress / getTarget()) * 100}%`,
            ease: 'power2.out'
        });
        // Check completion
        const challenge = challengeId ? challengeDetails[challengeId] : null;
        if (challenge && newProgress >= challenge.target) {
            setTimeout(() => {
                onComplete(challenge.reward);
                celebrateCompletion();
            }, 500);
        }
    };
    const celebrateCompletion = () => {
        // Success animation
        gsap_1.default.to('.challenge-banner', {
            duration: 0.3,
            scale: 1.1,
            backgroundColor: '#10B981',
            ease: 'back.out(1.7)',
            onComplete: () => {
                gsap_1.default.to('.challenge-banner', {
                    duration: 0.3,
                    scale: 1,
                    delay: 1,
                    onComplete: () => setIsVisible(false)
                });
            }
        });
    };
    const getTarget = () => {
        var _a;
        if (!challengeId)
            return 1;
        return ((_a = challengeDetails[challengeId]) === null || _a === void 0 ? void 0 : _a.target) || 1;
    };
    const getChallenge = () => {
        if (!challengeId)
            return null;
        return challengeDetails[challengeId];
    };
    if (!isVisible || !challengeId)
        return null;
    const challenge = getChallenge();
    if (!challenge)
        return null;
    return (<div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40">
      <div className="challenge-banner bg-gradient-to-r from-squid-pink to-purple-600 rounded-lg p-4 min-w-80 shadow-2xl border border-squid-pink/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{challenge.icon}</span>
            <h3 className="font-orbitron font-bold text-white">{challenge.title}</h3>
          </div>
          <div className="text-sm text-gray-200">
            {challengeId === 'speed_demon' && `${timeRemaining}s`}
          </div>
        </div>
        
        <p className="text-sm text-gray-200 mb-3">{challenge.description}</p>
        
        <div className="mb-2">
          <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
            <span>{challenge.objective}</span>
            <span>{progress}/{challenge.target}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="progress-fill bg-gradient-to-r from-warning-yellow to-success-green h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min((progress / challenge.target) * 100, 100)}%` }}/>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span className="text-success-green font-medium">Reward: {challenge.reward} tokens</span>
          {challengeId === 'speed_demon' && (<span className={`font-medium ${timeRemaining <= 5 ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
              Time: {timeRemaining}s
            </span>)}
        </div>
      </div>
    </div>);
    // Expose update function for games to use
    // This would be better handled through props or context in a real implementation
}
// Export the progress update function for games to use
const updateChallengeProgress = (challengeId, progress) => {
    // This is a simplified approach - in production you'd use proper state management
    const event = new CustomEvent('challengeProgress', {
        detail: { challengeId, progress }
    });
    window.dispatchEvent(event);
};
exports.updateChallengeProgress = updateChallengeProgress;
