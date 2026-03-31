"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PotArea;
const utils_1 = require("@/lib/utils");
function PotArea({ pot }) {
    const totalValue = pot.reduce((sum, bar) => sum + bar.value, 0);
    return (<div className="bg-black/50 rounded-xl p-4 border border-casino-gold/50 backdrop-blur-sm">
      <div className="text-center">
        <h4 className="text-casino-gold font-playfair font-semibold mb-2">Pot</h4>
        
        {pot.length > 0 ? (<>
            <div className="flex justify-center space-x-2 mb-2 flex-wrap">
              {pot.map((bar, index) => (<div key={index} className={(0, utils_1.cn)("w-8 h-6 rounded shadow-lg", bar.type === "gold" ? "gold-bar" : "silver-bar")}/>))}
            </div>
            <div className="text-casino-cream text-sm">
              Total: <span className="text-casino-gold font-semibold">${totalValue.toLocaleString()}</span>
            </div>
          </>) : (<div className="text-casino-cream/60 text-sm italic">No bets yet</div>)}
      </div>
    </div>);
}
