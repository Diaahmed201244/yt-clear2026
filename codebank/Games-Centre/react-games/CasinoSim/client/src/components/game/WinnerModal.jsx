"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WinnerModal;
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
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
function WinnerModal({ winner, onClose, onNewRound }) {
    const handleNewRound = () => {
        onNewRound();
        onClose();
    };
    return (<dialog_1.Dialog open={true} onOpenChange={onClose}>
      <dialog_1.DialogContent className="glass-morphism rounded-2xl p-8 max-w-md mx-4 text-center animate-dealer-speak">
        <div className="mb-6">
          <lucide_react_1.Trophy className="text-yellow-400 w-16 h-16 mx-auto mb-4"/>
          <h2 className="text-yellow-400 font-orbitron font-bold text-2xl mb-2">
            Round Winner!
          </h2>
          <h3 className="text-white text-xl font-semibold">
            {winner.name}
          </h3>
        </div>
        
        <div className="mb-6">
          <div className="text-gray-400 text-sm mb-2">Winning Hand:</div>
          <div className="flex justify-center space-x-2 mb-4">
            {winner.hand.map((card, index) => {
            const { color, suitSymbol } = getCardDisplay(card);
            return (<div key={index} className="card-face w-12 h-18 flex items-center justify-center text-xs">
                  <div className="text-center">
                    <div className={`${color} font-bold`}>{card.value}</div>
                    <div className={color}>{suitSymbol}</div>
                  </div>
                </div>);
        })}
          </div>
          <div className="text-yellow-400 font-medium">
            {winner.handType}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="text-white font-orbitron text-2xl font-bold">
            ${winner.potWon}
          </div>
          <div className="text-gray-400 text-sm">Pot Won</div>
        </div>
        
        <button_1.Button onClick={handleNewRound} className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200">
          Start New Round
        </button_1.Button>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
