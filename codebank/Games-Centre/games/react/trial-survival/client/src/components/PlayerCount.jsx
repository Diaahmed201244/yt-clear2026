"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlayerCount;
const react_1 = require("react");
const gsap_1 = require("gsap");
function PlayerCount({ playersAlive }) {
    (0, react_1.useEffect)(() => {
        // Animate player count changes
        gsap_1.default.to('.player-count-number', {
            duration: 1,
            textContent: playersAlive,
            snap: { textContent: 1 },
            ease: 'power2.out'
        });
    }, [playersAlive]);
    return (<div className="fixed bottom-6 right-6 glass-effect rounded-lg p-4">
      <div className="text-center">
        <div className="player-count-number text-2xl font-orbitron font-bold text-squid-pink">
          {playersAlive}
        </div>
        <div className="text-sm text-gray-400">Players Alive</div>
      </div>
      <div className="mt-2 flex justify-center space-x-1">
        <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-success-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-success-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>);
}
