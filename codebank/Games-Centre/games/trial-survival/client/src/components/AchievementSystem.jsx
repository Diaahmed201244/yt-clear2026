"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AchievementSystem;
exports.AchievementProgress = AchievementProgress;
const react_1 = require("react");
const powerUpManager_1 = require("@/lib/powerUpManager");
const gsap_1 = require("gsap");
function AchievementSystem({ playerStats, onAchievementUnlocked }) {
    const [newAchievements, setNewAchievements] = (0, react_1.useState)([]);
    const [showNotification, setShowNotification] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const unlocked = powerUpManager_1.powerUpManager.checkAchievements(playerStats);
        if (unlocked.length > 0) {
            setNewAchievements(unlocked);
            setShowNotification(true);
            // Calculate total reward tokens
            const totalTokens = unlocked.reduce((sum, achievement) => sum + achievement.reward.tokens, 0);
            onAchievementUnlocked(totalTokens);
            // Animate notification
            gsap_1.default.from('.achievement-notification', {
                duration: 0.5,
                scale: 0,
                opacity: 0,
                ease: 'back.out(1.7)'
            });
            // Auto-hide after 5 seconds
            setTimeout(() => {
                gsap_1.default.to('.achievement-notification', {
                    duration: 0.3,
                    scale: 0,
                    opacity: 0,
                    onComplete: () => setShowNotification(false)
                });
            }, 5000);
        }
    }, [playerStats, onAchievementUnlocked]);
    const dismissNotification = () => {
        gsap_1.default.to('.achievement-notification', {
            duration: 0.3,
            scale: 0,
            opacity: 0,
            onComplete: () => setShowNotification(false)
        });
    };
    if (!showNotification || newAchievements.length === 0)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="achievement-notification bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-6 max-w-md mx-4 shadow-2xl border-2 border-yellow-400 pointer-events-auto">
        <div className="text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="font-orbitron text-xl font-bold text-yellow-100 mb-2">
            {newAchievements.length === 1 ? 'ACHIEVEMENT UNLOCKED!' : 'ACHIEVEMENTS UNLOCKED!'}
          </h3>
          
          <div className="space-y-3">
            {newAchievements.map((achievement, index) => (<div key={achievement.id} className="bg-black/20 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="text-left">
                    <h4 className="font-bold text-yellow-100">{achievement.name}</h4>
                    <p className="text-yellow-200 text-sm">{achievement.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-yellow-300 text-sm font-medium">
                        +{achievement.reward.tokens} tokens
                      </span>
                      {achievement.reward.powerUps && achievement.reward.powerUps.length > 0 && (<span className="text-pink-300 text-sm">
                          + Power-ups
                        </span>)}
                    </div>
                  </div>
                </div>
              </div>))}
          </div>

          <button onClick={dismissNotification} className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-black transition-colors">
            Awesome!
          </button>
        </div>
      </div>
    </div>);
}
// Achievement Progress Component
function AchievementProgress() {
    const [playerAchievements] = (0, react_1.useState)([]);
    return (<div className="bg-gray-800 rounded-xl p-6 max-w-4xl mx-auto">
      <h3 className="font-orbitron text-2xl font-bold mb-6 text-center text-warning-yellow">
        🏆 ACHIEVEMENTS
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {powerUpManager_1.ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = playerAchievements.includes(achievement.id);
            return (<div key={achievement.id} className={`p-4 rounded-lg border-2 transition-all ${isUnlocked
                    ? 'bg-yellow-600/20 border-yellow-400 shadow-yellow-400/20 shadow-lg'
                    : 'bg-gray-700/50 border-gray-600 opacity-60'}`}>
              <div className="text-center">
                <div className={`text-3xl mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <h4 className={`font-orbitron font-bold mb-1 ${isUnlocked ? 'text-yellow-300' : 'text-gray-400'}`}>
                  {achievement.name}
                </h4>
                <p className={`text-sm mb-3 ${isUnlocked ? 'text-yellow-200' : 'text-gray-500'}`}>
                  {achievement.description}
                </p>
                
                <div className="flex justify-center items-center space-x-2">
                  <span className={`text-sm font-medium ${isUnlocked ? 'text-success-green' : 'text-gray-400'}`}>
                    {achievement.reward.tokens} tokens
                  </span>
                  {achievement.reward.powerUps && achievement.reward.powerUps.length > 0 && (<span className={`text-xs px-2 py-1 rounded-full ${isUnlocked ? 'bg-pink-600/20 text-pink-300' : 'bg-gray-600/20 text-gray-400'}`}>
                      +Power-up
                    </span>)}
                </div>
                
                {isUnlocked && (<div className="mt-2 text-xs text-yellow-400 font-medium">
                    ✓ UNLOCKED
                  </div>)}
              </div>
            </div>);
        })}
      </div>
      
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-400 mb-2">
          Progress: {playerAchievements.length}/{powerUpManager_1.ACHIEVEMENTS.length} achievements unlocked
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(playerAchievements.length / powerUpManager_1.ACHIEVEMENTS.length) * 100}%` }}/>
        </div>
      </div>
    </div>);
}
