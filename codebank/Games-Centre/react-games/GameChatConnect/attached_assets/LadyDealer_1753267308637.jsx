"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LadyDealer;
const lucide_react_1 = require("lucide-react");
function LadyDealer({ dealerName, status }) {
    return (<div className="bg-casino-red/80 rounded-2xl p-4 border-2 border-casino-gold backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full border-2 border-casino-gold bg-gradient-to-b from-casino-gold to-yellow-600 flex items-center justify-center animate-dealer-wave">
          <span className="text-black font-bold text-lg">👩‍💼</span>
        </div>
        <div>
          <h3 className="text-casino-cream font-playfair font-semibold">{dealerName}</h3>
          <p className="text-casino-gold text-sm">{status}</p>
        </div>
        <div className="text-casino-gold">
          <lucide_react_1.Mic className="h-5 w-5 animate-pulse"/>
        </div>
      </div>
    </div>);
}
