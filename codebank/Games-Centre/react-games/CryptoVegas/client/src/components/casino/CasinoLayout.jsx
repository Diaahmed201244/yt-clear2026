"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasinoLayout = CasinoLayout;
const react_1 = require("react");
const Navigation_1 = require("./Navigation");
const Balance_1 = require("./Balance");
const SlotsGame_1 = require("../games/SlotsGame");
const DiceGame_1 = require("../games/DiceGame");
const CrashGame_1 = require("../games/CrashGame");
const GameHistory_1 = require("./GameHistory");
const useCasino_1 = require("@/lib/stores/useCasino");
const useAudio_1 = require("@/lib/stores/useAudio");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function CasinoLayout() {
    const { currentGame } = (0, useCasino_1.useCasino)();
    const { isMuted, toggleMute } = (0, useAudio_1.useAudio)();
    const [showHistory, setShowHistory] = (0, react_1.useState)(false);
    const renderCurrentGame = () => {
        switch (currentGame) {
            case "slots":
                return <SlotsGame_1.SlotsGame />;
            case "dice":
                return <DiceGame_1.DiceGame />;
            case "crash":
                return <CrashGame_1.CrashGame />;
            default:
                return <SlotsGame_1.SlotsGame />;
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              🎰 Casino Royale
            </h1>
            <Balance_1.Balance />
          </div>
          
          <div className="flex items-center space-x-4">
            <button_1.Button variant="ghost" size="sm" onClick={toggleMute} className="text-gray-300 hover:text-white">
              {isMuted ? <lucide_react_1.VolumeX className="w-5 h-5"/> : <lucide_react_1.Volume2 className="w-5 h-5"/>}
            </button_1.Button>
            
            <button_1.Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)} className="border-green-500/30 text-green-400 hover:bg-green-500/10">
              {showHistory ? "Hide History" : "Show History"}
            </button_1.Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <Navigation_1.Navigation />
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            {renderCurrentGame()}
            
            {/* Game History */}
            {showHistory && (<div className="mt-6">
                <GameHistory_1.GameHistory />
              </div>)}
          </div>
        </div>
      </div>
    </div>);
}
