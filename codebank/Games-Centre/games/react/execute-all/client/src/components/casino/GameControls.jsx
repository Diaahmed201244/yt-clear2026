"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameControls;
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
function GameControls({ isPlayerTurn, currentPlayer, onPlayCard }) {
    return (<card_1.Card className="mt-6 bg-black/60 border-casino-gold/30 backdrop-blur-sm">
      <card_1.CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <button_1.Button disabled={!isPlayerTurn} className="bg-casino-gold text-black hover:bg-yellow-400 font-semibold disabled:opacity-50">
              <lucide_react_1.Hand className="h-4 w-4 mr-2"/>
              Play Card
            </button_1.Button>
            <button_1.Button variant="outline" className="border-casino-red text-casino-red hover:bg-casino-red hover:text-white font-semibold">
              <lucide_react_1.Flag className="h-4 w-4 mr-2"/>
              Fold
            </button_1.Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-casino-cream">
              <span className="text-sm">Current Turn: </span>
              <span className="font-semibold text-casino-gold">
                {currentPlayer ? currentPlayer.playerName : "Waiting..."}
              </span>
            </div>
            {isPlayerTurn && (<div className="bg-casino-red/50 rounded-lg px-3 py-2 flex items-center space-x-2">
                <lucide_react_1.Clock className="text-casino-gold h-4 w-4"/>
                <span className="text-casino-cream font-mono text-sm">Your Turn</span>
              </div>)}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
