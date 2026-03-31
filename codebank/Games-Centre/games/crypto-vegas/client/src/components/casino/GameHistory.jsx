"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameHistory = GameHistory;
const useCasino_1 = require("@/lib/stores/useCasino");
const gameUtils_1 = require("@/lib/gameUtils");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function GameHistory() {
    const { gameHistory, clearHistory } = (0, useCasino_1.useCasino)();
    if (gameHistory.length === 0) {
        return (<card_1.Card className="p-6 casino-card text-center">
        <p className="text-gray-400">No games played yet. Start playing to see your history!</p>
      </card_1.Card>);
    }
    return (<card_1.Card className="p-6 casino-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-400">Game History</h3>
        <button_1.Button variant="outline" size="sm" onClick={clearHistory} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
          <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/>
          Clear
        </button_1.Button>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-2">
        {gameHistory.map((game) => (<div key={game.id} className={`
              flex items-center justify-between p-3 rounded-lg border
              ${game.payout > 0
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-red-500/30 bg-red-500/5'}
            `}>
            <div className="flex items-center space-x-3">
              <span className="text-xl">
                {game.game === 'slots' && '🎰'}
                {game.game === 'dice' && '🎲'}
                {game.game === 'crash' && '🚀'}
              </span>
              <div>
                <div className="font-medium text-white capitalize">{game.game}</div>
                <div className="text-xs text-gray-400">
                  {new Date(game.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-300">
                Bet: {(0, gameUtils_1.formatCurrency)(game.bet)}
              </div>
              <div className={`font-medium ${game.payout > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {game.payout > 0 ? '+' : ''}{(0, gameUtils_1.formatCurrency)(game.payout - game.bet)}
              </div>
            </div>
          </div>))}
      </div>
    </card_1.Card>);
}
