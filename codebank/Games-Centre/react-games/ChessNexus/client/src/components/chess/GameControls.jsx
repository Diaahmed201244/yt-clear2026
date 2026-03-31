"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameControls;
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
function GameControls({ onNewGame, onUndoMove, onOfferDraw, onResign, canUndo, gameStatus, }) {
    const isGameActive = gameStatus === 'active';
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-md">Game Controls</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-3">
        <button_1.Button variant="default" className="w-full justify-start bg-green-600 hover:bg-green-700" onClick={onNewGame}>
          <lucide_react_1.Play className="mr-2 h-4 w-4"/>
          New Game
        </button_1.Button>
        
        <button_1.Button variant="outline" className="w-full justify-start" onClick={onUndoMove} disabled={!canUndo || !isGameActive}>
          <lucide_react_1.Undo className="mr-2 h-4 w-4"/>
          Undo Move
        </button_1.Button>
        
        <button_1.Button variant="outline" className="w-full justify-start text-yellow-700 hover:bg-yellow-50" onClick={onOfferDraw} disabled={!isGameActive}>
          <lucide_react_1.Handshake className="mr-2 h-4 w-4"/>
          Offer Draw
        </button_1.Button>
        
        <button_1.Button variant="outline" className="w-full justify-start text-red-700 hover:bg-red-50" onClick={onResign} disabled={!isGameActive}>
          <lucide_react_1.Flag className="mr-2 h-4 w-4"/>
          Resign
        </button_1.Button>
      </card_1.CardContent>
    </card_1.Card>);
}
