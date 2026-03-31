"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigation = Navigation;
const useCasino_1 = require("@/lib/stores/useCasino");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const useAuth_1 = require("@/lib/stores/useAuth");
const games = [
    { id: "slots", name: "Slot Machine", icon: "🎰", description: "Spin to win big!" },
    { id: "dice", name: "Dice", icon: "🎲", description: "High or low?" },
    { id: "crash", name: "Crash", icon: "🚀", description: "Cash out before crash!" },
];
function Navigation() {
    const { currentGame, setCurrentGame } = (0, useCasino_1.useCasino)();
    const { logout } = (0, useAuth_1.useAuth)();
    return (<card_1.Card className="p-4 casino-card">
      <h2 className="text-lg font-semibold text-green-400 mb-4 text-center">🎮 Games</h2>
      
      <div className="space-y-3">
        {games.map((game) => (<button key={game.id} onClick={() => setCurrentGame(game.id)} className={`
              w-full p-4 rounded-lg border-2 transition-all duration-300 text-left
              ${currentGame === game.id
                ? 'neon-border bg-green-500/10 text-green-300'
                : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-green-500/50 hover:bg-green-500/5'}
            `}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{game.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{game.name}</div>
                <div className="text-xs text-gray-400">{game.description}</div>
              </div>
            </div>
          </button>))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-600">
        <button_1.Button variant="outline" onClick={logout} className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
          Logout
        </button_1.Button>
      </div>
    </card_1.Card>);
}
