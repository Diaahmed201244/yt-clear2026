"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlayerPosition;
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const PLACEHOLDER_AVATARS = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=60&h=60&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=60&h=60&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=60&h=60&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b612b1d8?ixlib=rb-4.0.3&w=60&h=60&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&w=60&h=60&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=60&h=60&fit=crop&crop=face",
];
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
function PlayerPosition({ player, isCurrentUser, isCurrentTurn, gameState, onFold, onPlayCard, playerName, }) {
    const avatarUrl = PLACEHOLDER_AVATARS[player.position % PLACEHOLDER_AVATARS.length];
    const borderColor = player.status === 'folded'
        ? 'border-gray-400'
        : isCurrentTurn
            ? 'border-yellow-400 animate-pulse-glow'
            : 'border-gray-400';
    const containerClass = isCurrentUser
        ? `glass-morphism rounded-2xl p-4 min-w-72 border-2 ${borderColor}`
        : `glass-morphism rounded-xl p-3 min-w-48 border-2 ${borderColor}`;
    return (<div className={containerClass}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img src={avatarUrl} alt={`${player.playerName} Avatar`} className={`w-${isCurrentUser ? '12' : '10'} h-${isCurrentUser ? '12' : '10'} rounded-full border-2 ${borderColor}`}/>
          <div>
            <h4 className={`text-white font-semibold ${isCurrentUser ? 'text-base' : 'text-sm'}`}>
              {isCurrentUser ? playerName : player.playerName}
            </h4>
            <div className={`text-yellow-400 font-orbitron ${isCurrentUser ? 'text-sm' : 'text-xs'}`}>
              ${player.balance}
            </div>
          </div>
        </div>
        
        {isCurrentTurn && (<div className="text-right">
            <div className="text-green-400 text-xs font-medium mb-1">
              {isCurrentUser ? 'YOUR TURN' : 'PLAYING'}
            </div>
            <div className="text-white text-sm">
              Stake: ${player.currentStake}
            </div>
          </div>)}
      </div>
      
      {/* Player's Hand */}
      <div className="flex justify-center space-x-2 mb-4">
        {player.status === 'folded' ? (<>
            <div className="bg-gray-600 w-10 h-14 rounded flex items-center justify-center text-gray-400 text-xs">
              FOLD
            </div>
            <div className="bg-gray-600 w-10 h-14 rounded flex items-center justify-center text-gray-400 text-xs">
              FOLD
            </div>
          </>) : player.hand && player.hand.length > 0 && isCurrentUser ? (
        // Show actual cards for current user
        player.hand.map((card, index) => {
            const { color, suitSymbol } = getCardDisplay(card);
            return (<div key={index} className={`card-face w-14 h-20 flex items-center justify-center shadow-lg ${isCurrentUser ? 'w-14 h-20' : 'w-10 h-14'}`}>
                <div className="text-center">
                  <div className={`${color} text-xl font-bold`}>{card.value}</div>
                  <div className={`${color} text-sm`}>{suitSymbol}</div>
                </div>
              </div>);
        })) : (
        // Show card backs for other players or when no cards dealt
        <>
            <div className={`card-back flex items-center justify-center shadow-lg text-yellow-400 ${isCurrentUser ? 'w-14 h-20 text-base' : 'w-10 h-14 text-xs'}`}>
              <i className="fas fa-star"></i>
            </div>
            <div className={`card-back flex items-center justify-center shadow-lg text-yellow-400 ${isCurrentUser ? 'w-14 h-20 text-base' : 'w-10 h-14 text-xs'}`}>
              <i className="fas fa-star"></i>
            </div>
          </>)}
      </div>
      
      {/* Status and Actions */}
      {isCurrentUser && isCurrentTurn && player.status === 'active' && (gameState === null || gameState === void 0 ? void 0 : gameState.currentPhase) !== 'waiting' ? (<div className="flex space-x-2">
          <button_1.Button onClick={onFold} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <lucide_react_1.X className="w-4 h-4 mr-2"/>
            Fold
          </button_1.Button>
          <button_1.Button onClick={onPlayCard} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            <lucide_react_1.Play className="w-4 h-4 mr-2"/>
            Play Card
          </button_1.Button>
        </div>) : (<div className={`text-center ${isCurrentUser ? 'text-sm' : 'text-xs'}`}>
          <span className={player.status === 'folded' ? 'text-red-400' :
                player.status === 'waiting' ? 'text-amber-400' :
                    'text-green-400'}>
            {player.status === 'folded' ? 'Folded' :
                player.status === 'waiting' ? 'Waiting...' :
                    player.status === 'active' ? (isCurrentTurn ? 'Turn' : 'Active') :
                        'Ready'}
          </span>
        </div>)}
    </div>);
}
