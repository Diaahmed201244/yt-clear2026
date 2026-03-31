"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlayerPosition;
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
function PlayerPosition({ player, isCurrentUser, isPlayerTurn, onPlayCard }) {
    var _a, _b;
    const bars = player.bars || [];
    const cards = player.cards || [];
    const handleCardClick = (card) => {
        if (isCurrentUser && isPlayerTurn) {
            onPlayCard(card);
        }
    };
    const renderBars = () => {
        return bars.map((bar, index) => (<div key={index} className={(0, utils_1.cn)("w-6 h-4 rounded shadow-lg", bar.type === "gold" ? "gold-bar" : "silver-bar")}/>));
    };
    const renderCard = () => {
        if (player.currentCard) {
            // Show played card
            return (<div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg animate-card-flip w-11 h-16">
          <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
            <span className="text-casino-red text-sm font-bold">{player.currentCard}</span>
          </div>
        </div>);
        }
        if (isCurrentUser && cards.length > 0) {
            // Show player's hand
            return (<div className="flex space-x-1">
          {cards.slice(0, 3).map((card, index) => (<button key={index} onClick={() => handleCardClick(card)} disabled={!isPlayerTurn} className={(0, utils_1.cn)("bg-white border-2 border-gray-300 rounded-lg shadow-lg w-11 h-16 transition-transform hover:scale-105", isPlayerTurn ? "cursor-pointer hover:border-casino-gold" : "cursor-not-allowed opacity-60")}>
              <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                <span className="text-casino-red text-xs font-bold">
                  {card.rank}
                  {card.suit === "hearts" ? "♥" :
                        card.suit === "diamonds" ? "♦" :
                            card.suit === "clubs" ? "♣" : "♠"}
                </span>
              </div>
            </button>))}
        </div>);
        }
        // Show face-down card for other players
        return (<div className="bg-casino-red border border-casino-cream rounded-lg shadow-md w-9 h-12">
        <div className="w-full h-full bg-gradient-to-br from-casino-red to-red-900 rounded-lg flex items-center justify-center">
          <span className="text-casino-gold text-xs">👑</span>
        </div>
      </div>);
    };
    return (<div className={(0, utils_1.cn)("rounded-xl p-4 border shadow-xl backdrop-blur-sm", isCurrentUser
            ? "bg-black/60 border-2 border-casino-gold"
            : "bg-black/40 border border-gray-500")}>
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <div className={(0, utils_1.cn)("w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg", isCurrentUser ? "border-casino-gold bg-casino-gold text-black" : "border-gray-400 bg-gray-600 text-white")}>
            {((_b = (_a = player.playerName) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || "?"}
          </div>
          {isPlayerTurn && (<div className="absolute -top-1 -right-1 w-4 h-4 bg-casino-gold rounded-full animate-pulse-gold"></div>)}
        </div>
        
        <span className={(0, utils_1.cn)("font-semibold text-sm", isCurrentUser ? "text-casino-cream" : "text-gray-300")}>
          {isCurrentUser ? "You" : player.playerName}
        </span>
        
        {/* Bars */}
        {bars.length > 0 && (<div className="flex space-x-1">
            {renderBars()}
          </div>)}
        
        {/* Cards */}
        {renderCard()}
        
        {/* Turn Timer */}
        {isPlayerTurn && (<div className="bg-casino-gold text-black px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
            <lucide_react_1.Clock className="h-3 w-3"/>
            <span>Your Turn</span>
          </div>)}
      </div>
    </div>);
}
