"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameHistory;
const scroll_area_1 = require("@/components/ui/scroll-area");
function GameHistory({ history }) {
    const getPlayerColor = (playerName) => {
        if (!playerName)
            return 'text-gray-400';
        if (playerName === 'Lady Victoria')
            return 'text-yellow-400';
        if (playerName === 'You')
            return 'text-blue-400';
        // Generate consistent colors for other players
        const colors = ['text-purple-400', 'text-green-400', 'text-pink-400', 'text-cyan-400', 'text-orange-400'];
        const hash = playerName.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    };
    const getActionMessage = (entry) => {
        const data = entry.data;
        switch (entry.action) {
            case 'join':
                return `Placed stake $${(data === null || data === void 0 ? void 0 : data.stake) || 0}`;
            case 'fold':
                return 'Folded';
            case 'play-card':
                return 'Played a card';
            case 'deal':
                return (data === null || data === void 0 ? void 0 : data.message) || 'Cards dealt';
            case 'reveal':
                return (data === null || data === void 0 ? void 0 : data.message) || 'Cards revealed';
            case 'winner':
                return `Won $${(data === null || data === void 0 ? void 0 : data.potWon) || 0} with ${(data === null || data === void 0 ? void 0 : data.handType) || 'best hand'}`;
            case 'new-round':
                return (data === null || data === void 0 ? void 0 : data.message) || 'New round started';
            default:
                return (data === null || data === void 0 ? void 0 : data.message) || 'Game action';
        }
    };
    return (<div className="w-full max-w-64">
      <div className="glass-morphism rounded-xl p-4 w-full max-h-80">
        <h3 className="text-yellow-400 font-orbitron font-bold text-lg mb-4">
          Game Log
        </h3>
        
        <scroll_area_1.ScrollArea className="h-60">
          <div className="space-y-2 text-xs">
            {history.length === 0 ? (<div className="text-gray-400 text-center py-4">
                No game activity yet...
              </div>) : (history.slice(-10).map((entry) => (<div key={entry.id} className="text-gray-400">
                  <span className={`font-medium ${getPlayerColor(entry.playerName)}`}>
                    {entry.playerName || 'System'}:
                  </span>{' '}
                  {getActionMessage(entry)}
                </div>)))}
          </div>
        </scroll_area_1.ScrollArea>
      </div>
    </div>);
}
