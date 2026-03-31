"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommunityCards;
const lucide_react_1 = require("lucide-react");
function getCardDisplay(card) {
    const color = card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black';
    const suitSymbol = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠'
    }[card.suit];
    return { color, suitSymbol };
}
function getCardsToShow(phase, communityCards) {
    if (!communityCards || communityCards.length === 0)
        return [];
    switch (phase) {
        case 'flop':
            return communityCards.slice(0, 3);
        case 'turn':
            return communityCards.slice(0, 4);
        case 'river':
        case 'showdown':
            return communityCards.slice(0, 5);
        default:
            return [];
    }
}
function CommunityCards({ gameState, players }) {
    const activePlayerCount = players.filter(p => p.status !== 'folded').length;
    const cardsToShow = gameState ? getCardsToShow(gameState.currentPhase, gameState.communityCards || []) : [];
    const cardsNeeded = 5;
    const hiddenCards = cardsNeeded - cardsToShow.length;
    return (<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
      <div className="text-center">
        {/* Pot Display */}
        <div className="glass-morphism rounded-xl p-4 mb-6 min-w-64">
          <h3 className="text-yellow-400 font-orbitron font-bold text-lg mb-2">
            <lucide_react_1.Coins className="inline-block w-5 h-5 mr-2"/>
            CURRENT POT
          </h3>
          <div className="text-white font-orbitron text-3xl font-bold animate-pulse-glow">
            ${(gameState === null || gameState === void 0 ? void 0 : gameState.currentPot) || 0}
          </div>
          <div className="text-gray-400 text-sm mt-1">
            {activePlayerCount} Players Active
          </div>
        </div>
        
        {/* Community Cards */}
        <div className="flex justify-center space-x-3 mb-4">
          {/* Revealed Cards */}
          {cardsToShow.map((card, index) => {
            const { color, suitSymbol } = getCardDisplay(card);
            return (<div key={`revealed-${index}`} className="card-face w-16 h-24 flex items-center justify-center animate-card-flip shadow-lg">
                <div className="text-center">
                  <div className={`${color} text-2xl font-bold`}>{card.value}</div>
                  <div className={`${color} text-lg`}>{suitSymbol}</div>
                </div>
              </div>);
        })}
          
          {/* Hidden Cards */}
          {Array.from({ length: hiddenCards }).map((_, index) => (<div key={`hidden-${index}`} className="card-back w-16 h-24 flex items-center justify-center shadow-lg">
              <i className="fas fa-star text-yellow-400 text-xl"></i>
            </div>))}
        </div>
        
        {/* Round Info */}
        <div className="text-yellow-400 text-sm font-medium">
          {gameState ? (<>
              Round {gameState.currentRound} of {gameState.maxRounds} • {gameState.currentPhase === 'waiting' ? 'Waiting for Players' :
                gameState.currentPhase === 'dealing' ? 'Dealing Cards' :
                    gameState.currentPhase === 'flop' ? 'Flop Revealed' :
                        gameState.currentPhase === 'turn' ? 'Turn Revealed' :
                            gameState.currentPhase === 'river' ? 'River Revealed' :
                                gameState.currentPhase === 'showdown' ? 'Showdown' :
                                    'Game in Progress'}
            </>) : ('Waiting to Start...')}
        </div>
      </div>
    </div>);
}
