"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameModeSelector;
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
function GameModeSelector({ gameMode, onGameModeChange }) {
    return (<card_1.Card className="mb-6">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-lg">Game Mode</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-3">
        <button_1.Button variant={gameMode === 'computer' ? 'default' : 'outline'} className="w-full justify-start" onClick={() => onGameModeChange('computer')}>
          <lucide_react_1.Bot className="mr-2 h-4 w-4"/>
          Play vs Computer
        </button_1.Button>
        
        <button_1.Button variant={gameMode === 'multiplayer' ? 'default' : 'outline'} className="w-full justify-start" onClick={() => onGameModeChange('multiplayer')}>
          <lucide_react_1.Users className="mr-2 h-4 w-4"/>
          Play with Friend
        </button_1.Button>
        
        <button_1.Button variant={gameMode === 'spectate' ? 'default' : 'outline'} className="w-full justify-start" onClick={() => onGameModeChange('spectate')}>
          <lucide_react_1.Eye className="mr-2 h-4 w-4"/>
          Spectate Game
        </button_1.Button>
      </card_1.CardContent>
    </card_1.Card>);
}
