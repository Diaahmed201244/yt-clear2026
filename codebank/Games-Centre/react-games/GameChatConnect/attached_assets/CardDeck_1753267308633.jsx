"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CardDeck;
const lucide_react_1 = require("lucide-react");
function CardDeck({ remainingCards }) {
    return (<div className="relative">
      {/* Stacked cards effect */}
      <div className="absolute bg-casino-red border-2 border-casino-cream rounded-lg shadow-lg transform rotate-1 w-15 h-24 -top-0.5 -left-0.5">
        <div className="w-full h-full bg-gradient-to-br from-casino-red to-red-900 rounded-lg flex items-center justify-center">
          <lucide_react_1.Crown className="text-casino-gold h-6 w-6"/>
        </div>
      </div>
      
      <div className="absolute bg-casino-red border-2 border-casino-cream rounded-lg shadow-lg transform -rotate-1 w-15 h-24 -top-0.5 left-0.5">
        <div className="w-full h-full bg-gradient-to-br from-casino-red to-red-900 rounded-lg flex items-center justify-center">
          <lucide_react_1.Crown className="text-casino-gold h-6 w-6"/>
        </div>
      </div>
      
      <div className="bg-casino-red border-2 border-casino-cream rounded-lg shadow-xl w-15 h-24 relative z-10">
        <div className="w-full h-full bg-gradient-to-br from-casino-red to-red-900 rounded-lg flex items-center justify-center">
          <lucide_react_1.Crown className="text-casino-gold h-6 w-6"/>
        </div>
      </div>
      
      {/* Cards remaining counter */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 text-casino-cream px-2 py-1 rounded text-xs">
        {remainingCards} cards
      </div>
    </div>);
}
