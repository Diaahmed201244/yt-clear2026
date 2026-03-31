"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameStartModal;
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function GameStartModal({ isOpen, onClose, onConfirm, gameState }) {
    const players = (gameState === null || gameState === void 0 ? void 0 : gameState.players) || [];
    const room = gameState === null || gameState === void 0 ? void 0 : gameState.room;
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="bg-black border-2 border-casino-gold max-w-lg">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="text-center space-y-6">
            <div className="text-6xl text-casino-gold animate-pulse">
              <lucide_react_1.Crown className="mx-auto"/>
            </div>
            
            <h2 className="text-casino-cream font-playfair text-3xl font-bold">
              Ready to Start?
            </h2>
          </dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-casino-green/20 rounded-lg p-4 border border-casino-green/30">
            <h3 className="text-casino-cream font-semibold mb-3">Game Settings</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-casino-cream">
                <span className="text-casino-gold">Players:</span> {players.length}/{(room === null || room === void 0 ? void 0 : room.maxPlayers) || 6}
              </div>
              <div className="text-casino-cream">
                <span className="text-casino-gold">Rounds:</span> {(room === null || room === void 0 ? void 0 : room.maxRounds) || 5}
              </div>
              <div className="text-casino-cream">
                <span className="text-casino-gold">Dealer:</span> {(room === null || room === void 0 ? void 0 : room.dealerName) || "Lady Victoria"}
              </div>
              <div className="text-casino-cream">
                <span className="text-casino-gold">Voice Chat:</span> Active
              </div>
            </div>
          </div>
          
          <div className="text-casino-cream text-sm text-center">
            All players will receive their cards once the game begins.
            <br />Voice chat will be enabled for all participants.
          </div>
          
          <div className="flex space-x-4">
            <button_1.Button onClick={onClose} className="flex-1 bg-gray-600 text-white hover:bg-gray-700 font-semibold py-3">
              Cancel
            </button_1.Button>
            <button_1.Button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-casino-green to-green-600 text-white hover:from-green-600 hover:to-green-700 font-semibold py-3 transform hover:scale-105">
              <i className="fas fa-play mr-2"></i>
              Start Game
            </button_1.Button>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
