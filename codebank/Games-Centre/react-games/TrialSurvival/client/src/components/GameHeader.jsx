"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameHeader;
function GameHeader({ currentStage, playersAlive, tokens, onLeaderboard, onPowerUpShop }) {
    return (<header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="font-orbitron text-2xl font-bold text-squid-pink">SURVIVE THE TRIALS</h1>
          <div className="px-3 py-1 bg-squid-cyan/20 rounded-full text-squid-cyan font-medium">
            <span>Stage {currentStage}/5</span>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-warning-yellow rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-black">💰</span>
            </div>
            <span className="font-orbitron font-bold text-warning-yellow">{tokens}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success-green rounded-full animate-pulse"></div>
            <span className="text-sm text-success-green">{playersAlive} Players Alive</span>
          </div>
          <div className="flex items-center space-x-3">
            {onPowerUpShop && (<button onClick={onPowerUpShop} className="px-4 py-2 bg-squid-pink/20 hover:bg-squid-pink/30 rounded-lg border border-squid-pink/50 transition-all duration-200 flex items-center space-x-2">
                <span className="text-lg">⚡</span>
                <span className="font-medium text-squid-pink">Shop</span>
              </button>)}
            {onLeaderboard && (<button onClick={onLeaderboard} className="px-4 py-2 bg-squid-cyan/20 hover:bg-squid-cyan/30 rounded-lg border border-squid-cyan/50 transition-all duration-200 flex items-center space-x-2">
                <span className="text-lg">🏆</span>
                <span className="font-medium text-squid-cyan">Rankings</span>
              </button>)}
          </div>
        </div>
      </div>
    </header>);
}
