"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VictoryScreen;
const react_1 = require("react");
const gsap_1 = require("gsap");
function VictoryScreen({ tokensEarned, finalRank, onContinue }) {
    (0, react_1.useEffect)(() => {
        // Animate victory screen entrance
        gsap_1.default.from('.victory-content', {
            duration: 1,
            y: -100,
            opacity: 0,
            ease: 'bounce.out'
        });
        gsap_1.default.from('.victory-trophy', {
            duration: 1,
            scale: 0,
            rotation: 360,
            ease: 'back.out(1.7)',
            delay: 0.3
        });
        gsap_1.default.from('.victory-details', {
            duration: 0.5,
            y: 50,
            opacity: 0,
            stagger: 0.1,
            delay: 0.8
        });
        // Confetti effect simulation
        gsap_1.default.to('.victory-trophy', {
            duration: 2,
            y: -10,
            yoyo: true,
            repeat: -1,
            ease: 'power2.inOut'
        });
    }, []);
    return (<section className="min-h-screen flex items-center justify-center">
      <div className="victory-content text-center max-w-md mx-auto p-8">
        <div className="victory-trophy w-32 h-32 mx-auto mb-6 rounded-full bg-success-green/20 flex items-center justify-center">
          <span className="text-4xl animate-bounce">🏆</span>
        </div>
        
        <h2 className="font-orbitron text-4xl font-bold text-success-green mb-4">YOU SURVIVED!</h2>
        <p className="text-gray-300 text-lg mb-8">
          Congratulations! You have completed all trials and earned your survival.
        </p>
        
        <div className="victory-details space-y-4">
          <div className="glass-effect rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tokens Earned:</span>
              <span className="font-bold text-warning-yellow">+{tokensEarned}</span>
            </div>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Final Ranking:</span>
              <span className="font-bold text-success-green">#{finalRank}</span>
            </div>
          </div>
        </div>

        <button className="w-full mt-8 px-6 py-3 bg-success-green hover:bg-success-green/80 rounded-lg font-orbitron font-bold transition-colors text-black" onClick={onContinue}>
          Continue to Leaderboard
        </button>
      </div>
    </section>);
}
