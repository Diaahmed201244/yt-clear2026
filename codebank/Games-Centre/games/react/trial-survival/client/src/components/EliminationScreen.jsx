"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EliminationScreen;
const react_1 = require("react");
const gsap_1 = require("gsap");
function EliminationScreen({ trialsCompleted, finalRank, onRetry, onReturnToMenu, canRetry }) {
    (0, react_1.useEffect)(() => {
        // Animate elimination screen entrance
        gsap_1.default.from('.elimination-content', {
            duration: 1,
            scale: 0,
            rotation: 360,
            ease: 'back.out(1.7)'
        });
        gsap_1.default.from('.elimination-details', {
            duration: 0.5,
            y: 50,
            opacity: 0,
            stagger: 0.1,
            delay: 0.5
        });
    }, []);
    return (<section className="min-h-screen flex items-center justify-center">
      <div className="elimination-content text-center max-w-md mx-auto p-8">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full elimination-effect flex items-center justify-center">
          <span className="text-4xl">💀</span>
        </div>
        
        <h2 className="font-orbitron text-4xl font-bold text-elimination-red mb-4">ELIMINATED</h2>
        <p className="text-gray-300 text-lg mb-8">
          You have been eliminated from the trials. Your survival ends here.
        </p>
        
        <div className="elimination-details space-y-4">
          <div className="glass-effect rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Trials Completed:</span>
              <span className="font-bold text-squid-cyan">{trialsCompleted}/5</span>
            </div>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Final Ranking:</span>
              <span className="font-bold text-warning-yellow">#{finalRank}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {canRetry && (<button className="w-full px-6 py-3 bg-squid-pink hover:bg-squid-pink/80 rounded-lg font-orbitron font-bold transition-colors" onClick={onRetry}>
              RETRY (Cost: 10 Tokens)
            </button>)}
          <button className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors" onClick={onReturnToMenu}>
            Return to Menu
          </button>
        </div>
      </div>
    </section>);
}
