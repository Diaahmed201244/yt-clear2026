"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const utils_1 = require("@/lib/utils");
const PotArea_1 = require("./PotArea");
const button_1 = require("@/components/ui/button");
const react_2 = require("react");
// Helper to generate avatar color and initials
function getAvatarColor(id) {
    const colors = ["#FFD700", "#FF69B4", "#1E90FF", "#32CD32", "#FF8C00", "#8A2BE2", "#00CED1", "#FF6347"];
    if (!id)
        return colors[0];
    let hash = 0;
    const str = id.toString();
    for (let i = 0; i < str.length; i++)
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
exports.default = (0, react_1.memo)(function CasinoTable({ gameState, currentUser, onFold, isActionLoading = false }) {
    var _a;
    const players = (gameState === null || gameState === void 0 ? void 0 : gameState.players) || [];
    const [betAmount, setBetAmount] = (0, react_2.useState)(0);
    // --- Turn Timer State ---
    const TURN_TIME = 20; // seconds
    const [turnTimeLeft, setTurnTimeLeft] = (0, react_2.useState)(TURN_TIME);
    const isActiveTurn = (gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) !== "waiting" && ((_a = gameState === null || gameState === void 0 ? void 0 : gameState.players[gameState.currentTurnIndex]) === null || _a === void 0 ? void 0 : _a.id) === (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id);
    (0, react_2.useEffect)(() => {
        if (!isActiveTurn) {
            setTurnTimeLeft(TURN_TIME);
            return;
        }
        setTurnTimeLeft(TURN_TIME);
        const interval = setInterval(() => {
            setTurnTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(interval);
                    // Optionally: auto-fold or auto-end turn here
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isActiveTurn, gameState === null || gameState === void 0 ? void 0 : gameState.currentTurnIndex]);
    const renderPlayer = (player, position, isCurrentUser = false, key) => {
        var _a;
        const positionClasses = {
            'bottom-center': 'absolute bottom-8 left-1/2 transform -translate-x-1/2',
            'bottom-right': 'absolute bottom-12 right-8',
            'right-middle': 'absolute right-4 top-1/2 transform -translate-y-1/2',
            'top-right': 'absolute top-12 right-8',
            'top-center': 'absolute top-8 left-1/2 transform -translate-x-1/2',
            'left-middle': 'absolute left-4 top-1/2 transform -translate-y-1/2',
        };
        return (<div className={positionClasses[position]} key={key}>
        <div className={(0, utils_1.cn)("rounded-xl p-4 border-2 shadow-xl backdrop-blur-sm", isCurrentUser
                ? "border-casino-gold bg-black/60"
                : "border-gray-500 bg-black/40")}>
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div className={(0, utils_1.cn)("w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold", isCurrentUser
                ? "border-casino-gold bg-casino-gold text-black"
                : "border-gray-400 bg-gray-600 text-white")}>
                {player.name[0].toUpperCase()}
              </div>
              
              {isCurrentUser && (gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) !== "waiting" && (<div className="absolute -top-1 -right-1 w-4 h-4 bg-casino-gold rounded-full animate-pulse-gold"></div>)}
            </div>
            
            <span className={(0, utils_1.cn)("font-semibold text-sm flex items-center gap-2", isCurrentUser ? "text-casino-cream" : "text-gray-300")}>
              <span style={{ background: getAvatarColor(player.name), color: '#222', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{getInitials(player.name)}</span>
              {isCurrentUser ? "You" : player.name}
            </span>
            
            {/* Player's Hand */}
            {player.hand && player.hand.length > 0 && (<div className="flex space-x-1 mt-8"> {/* Added mt-8 for more space below pot */}
                {player.hand.slice(0, 5).map((card, index) => (<div key={card.rank + card.suit + index} className="bg-white border-2 border-gray-300 rounded-lg shadow-lg w-11 h-16">
                    <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                      <span className={(0, utils_1.cn)("text-xs font-bold", (card.suit === "♥" || card.suit === "♦") ? "text-red-600" : "text-black")}>
                        {card.rank}{card.suit}
                      </span>
                    </div>
                  </div>))}
              </div>)}
            
            {!isCurrentUser && (<div className="bg-casino-red border border-casino-cream rounded-lg shadow-md w-9 h-12">
                <div className="w-full h-full bg-gradient-to-br from-casino-red to-red-900 rounded-lg flex items-center justify-center">
                  <i className="fas fa-crown text-casino-gold text-xs"></i>
                </div>
              </div>)}
            
            {/* Turn indicator - enhanced */}
            {(gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) !== "waiting" && (gameState === null || gameState === void 0 ? void 0 : gameState.currentTurnIndex) === players.indexOf(player) && (<div className={(0, utils_1.cn)("flex flex-col items-center mt-2", isCurrentUser ? "" : "opacity-80")}>
                <div className={(0, utils_1.cn)("bg-casino-gold text-black px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 shadow-lg animate-pulse-gold border-2 border-casino-gold", isCurrentUser ? "scale-110" : "")}>
                  <i className="fas fa-clock animate-spin-slow"></i>
                  <span>
                    {isCurrentUser
                    ? `Your Turn${turnTimeLeft < TURN_TIME ? ` (${turnTimeLeft}s)` : ''}`
                    : player.id === "bot"
                        ? "Bot's Turn"
                        : "Active"}
                  </span>
                </div>
                {/* Countdown bar */}
                {isCurrentUser && (<div className="w-24 h-2 bg-gray-700 rounded mt-1 overflow-hidden">
                    <div className="h-2 bg-casino-red transition-all duration-100 linear" style={{ width: `${(turnTimeLeft / TURN_TIME) * 100}%` }}></div>
                  </div>)}
              </div>)}

            {/* Betting Controls for current player during betting phase */}
            {isCurrentUser && (gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) !== "waiting" && ((_a = gameState === null || gameState === void 0 ? void 0 : gameState.players[gameState.currentTurnIndex]) === null || _a === void 0 ? void 0 : _a.id) === player.id && (<div className="flex flex-col items-center space-y-2 mt-4 w-full">
                  <>
                    <div className="flex space-x-2 mb-2">
                      <button_1.Button onClick={onFold} disabled={!onFold || isActionLoading} className="bg-casino-red text-white flex items-center justify-center min-w-[64px] focus-visible:ring-2 focus-visible:ring-casino-red focus-visible:ring-offset-2" aria-label="Fold" tabIndex={0}>
                        {isActionLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}Fold
                      </button_1.Button>
                    </div>
                  </>
                <div className="text-xs text-casino-cream mt-1">Balance: ${player.balance} | Current Bet: ${player.stake}</div>
              </div>)}
          </div>
        </div>
      </div>);
    };
    const positions = ['bottom-center', 'bottom-right', 'right-middle', 'top-right', 'top-center', 'left-middle'];
    return (<div className="casino-table velvet-texture rounded-3xl p-8 shadow-2xl border-4 border-casino-gold/30 relative overflow-hidden casino-table-height">
      
      {/* Dealer Area */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-casino-red/80 rounded-2xl p-4 border-2 border-casino-gold backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full border-2 border-casino-gold bg-gradient-to-b from-casino-gold to-yellow-600 flex items-center justify-center animate-dealer-wave">
              <span className="text-black font-bold text-lg">👩‍💼</span>
            </div>
            <div>
              <h3 className="text-casino-cream font-playfair font-semibold">
                Dealer
              </h3>
              <p className="text-casino-gold text-sm">
                {gameState === null || gameState === void 0 ? void 0 : gameState.dealerMessage}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="audio-visualizer">
                <div className="audio-bar"></div>
                <div className="audio-bar"></div>
                <div className="audio-bar"></div>
              </div>
              <i className="fas fa-microphone text-audio-active animate-pulse"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Card Deck Area */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* Stacked cards effect */}
          <div className="absolute bg-casino-red border-2 border-casino-cream rounded-lg shadow-lg transform rotate-1 w-15 h-24 -top-0.5 -left-0.5">
            <div className="w-full h-full bg-gradient-to-br from-casino-red to-red-900 rounded-lg flex items-center justify-center">
              <i className="fas fa-crown text-casino-gold text-2xl"></i>
            </div>
          </div>
          
          <div className="absolute bg-casino-red border-2 border-casino-cream rounded-lg shadow-lg transform -rotate-1 w-15 h-24 -top-0.5 left-0.5">
            <div className="w-full h-full bg-gradient-to-br from-casino-red to-red-900 rounded-lg flex items-center justify-center">
              <i className="fas fa-crown text-casino-gold text-2xl"></i>
            </div>
          </div>
          
          <div className="bg-casino-red border-2 border-casino-cream rounded-lg shadow-xl w-15 h-24 relative z-10">
            <div className="w-full h-full bg-gradient-to-br from-casino-red to-red-900 rounded-lg flex items-center justify-center">
              <i className="fas fa-crown text-casino-gold text-2xl"></i>
            </div>
          </div>
          
          {/* Cards remaining counter */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 text-casino-cream px-2 py-1 rounded text-xs">
            {gameState === null || gameState === void 0 ? void 0 : gameState.deck.length} cards
          </div>
        </div>
      </div>

      {/* Players */}
      {players.map((player, index) => {
            const isCurrentUser = player.id === (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id);
            const position = positions[index] || 'bottom-center';
            return renderPlayer(player, position, isCurrentUser, player.id || index);
        })}

      {/* Central Pot Area */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-8">
        <PotArea_1.default pot={(gameState === null || gameState === void 0 ? void 0 : gameState.pot) || 0}/>
      </div>

      {/* Game Status */}
      <div className="absolute top-4 right-4">
        <div className="bg-casino-green/80 rounded-lg px-3 py-2 border border-casino-green backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-casino-gold rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-semibold">
              {gameState === null || gameState === void 0 ? void 0 : gameState.roundStage}
            </span>
          </div>
          <div className="text-xs text-casino-cream mt-1">
            Players: {players.length}
          </div>
        </div>
      </div>
    </div>);
});
