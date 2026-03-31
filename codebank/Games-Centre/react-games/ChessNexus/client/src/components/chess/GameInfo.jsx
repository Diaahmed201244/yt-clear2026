"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameInfo;
const card_1 = require("@/components/ui/card");
function GameInfo({ game, gameState }) {
    const timeControlText = (game === null || game === void 0 ? void 0 : game.timeControl)
        ? `${Math.floor(game.timeControl / 60)}+0`
        : "No limit";
    return (<div className="space-y-6">
      {/* Game Statistics */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-md">Game Info</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Opening:</span>
            <span className="font-medium">{gameState.opening || "Unknown"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Material:</span>
            <span className="font-medium">{gameState.material}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Evaluation:</span>
            <span className={`font-medium ${gameState.evaluation.startsWith('+')
            ? 'text-green-600'
            : gameState.evaluation.startsWith('-')
                ? 'text-red-600'
                : 'text-gray-600'}`}>
              {gameState.evaluation}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time Control:</span>
            <span className="font-medium">{timeControlText}</span>
          </div>
          {game && (<div className="flex justify-between">
              <span className="text-gray-600">Game Type:</span>
              <span className="font-medium capitalize">{game.gameType}</span>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Captured Pieces */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-md">Captured Pieces</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div>
            <div className="text-xs text-gray-600 mb-2">White Captured</div>
            <div className="flex space-x-1 min-h-[24px]">
              {/* This would be populated with actual captured pieces */}
              <span className="text-gray-400 text-sm">None</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-2">Black Captured</div>
            <div className="flex space-x-1 min-h-[24px]">
              {/* This would be populated with actual captured pieces */}
              <span className="text-gray-400 text-sm">None</span>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
