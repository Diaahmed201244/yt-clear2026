"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameControls;
const react_1 = require("react");
function GameControls({ gameState, isConnected, onStartGame, onCall, onFold, currentPlayerId, isCurrentPlayer }) {
    const [turnTimer, setTurnTimer] = (0, react_1.useState)(30);
    (0, react_1.useEffect)(() => {
        if ((gameState === null || gameState === void 0 ? void 0 : gameState.turnStartTime) && gameState.turnTimeLimit) {
            const startTime = new Date(gameState.turnStartTime).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            const remaining = Math.max(0, gameState.turnTimeLimit - elapsed);
            setTurnTimer(remaining);
            const interval = setInterval(() => {
                const currentTime = Date.now();
                const currentElapsed = Math.floor((currentTime - startTime) / 1000);
                const currentRemaining = Math.max(0, gameState.turnTimeLimit - currentElapsed);
                setTurnTimer(currentRemaining);
                if (currentRemaining <= 0) {
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState === null || gameState === void 0 ? void 0 : gameState.turnStartTime, gameState === null || gameState === void 0 ? void 0 : gameState.turnTimeLimit]);
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    return (<div className="w-full max-w-64">
      <div className="glass-morphism rounded-xl p-4 w-full">
        <h3 className="text-yellow-400 font-orbitron font-bold text-lg mb-4">
          Game Status
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Game ID:</span>
            <span className="text-white font-mono">
              {(gameState === null || gameState === void 0 ? void 0 : gameState.gameId) || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Round:</span>
            <span className="text-white">
              {gameState ? `${gameState.currentRound} of ${gameState.maxRounds}` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Turn Timer:</span>
            <span className="text-yellow-400 font-orbitron">
              {formatTime(turnTimer)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Entry Stake:</span>
            <span className="text-white">
              ${(gameState === null || gameState === void 0 ? void 0 : gameState.entryStake) || 0}
            </span>
          </div>
        </div>
        
        <div className="mt-4 space-y-4">
          {/* Game Action Buttons */}
          <div className="flex flex-col gap-2">
            {(gameState === null || gameState === void 0 ? void 0 : gameState.status) === 'waiting' && !currentPlayerId && (<button onClick={onStartGame} className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-md transition-colors">
                Join Game
              </button>)}
            
            {(gameState === null || gameState === void 0 ? void 0 : gameState.status) === 'active' && isCurrentPlayer && (<div className="space-y-2">
                <button onClick={onCall} className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition-colors" disabled={!isCurrentPlayer}>
                  Call
                </button>
                <button onClick={onFold} className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-colors" disabled={!isCurrentPlayer}>
                  Fold
                </button>
              </div>)}
            
            {(gameState === null || gameState === void 0 ? void 0 : gameState.status) === 'active' && !isCurrentPlayer && (<div className="text-center text-yellow-400">
                Waiting for other player's turn...
              </div>)}
          </div>

          {/* Connection Status */}
          <div className="pt-4 border-t border-gray-600">
            <div className="flex items-center space-x-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                {isConnected ? 'Connected to Game Server' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
