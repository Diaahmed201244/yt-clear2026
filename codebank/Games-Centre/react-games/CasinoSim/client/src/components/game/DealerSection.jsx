"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DealerSection;
const react_1 = require("react");
const DEALER_ANNOUNCEMENTS = [
    "Welcome to the table! Place your stakes and let's begin...",
    "All players have joined. Dealing cards now...",
    "The flop is revealed! Time to make your moves.",
    "Turn card coming up! Stakes are rising.",
    "River card! Final betting round begins.",
    "Time to reveal hands! Who will claim the pot?"
];
function DealerSection({ gameState, history }) {
    const [currentAnnouncement, setCurrentAnnouncement] = (0, react_1.useState)(DEALER_ANNOUNCEMENTS[0]);
    const [isAnimating, setIsAnimating] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Update announcement based on game phase
        if (gameState) {
            let announcement = DEALER_ANNOUNCEMENTS[0];
            switch (gameState.currentPhase) {
                case 'waiting':
                    announcement = "Welcome to the table! Place your stakes and let's begin...";
                    break;
                case 'dealing':
                    announcement = "Dealing cards to all players...";
                    break;
                case 'flop':
                    announcement = "The flop is revealed! Time to make your moves.";
                    break;
                case 'turn':
                    announcement = "Turn card revealed! Stakes are rising.";
                    break;
                case 'river':
                    announcement = "River card! Final betting round begins.";
                    break;
                case 'showdown':
                    announcement = "Time to reveal hands! Who will claim the pot?";
                    break;
            }
            if (announcement !== currentAnnouncement) {
                setIsAnimating(true);
                setCurrentAnnouncement(announcement);
                setTimeout(() => setIsAnimating(false), 300);
            }
        }
    }, [gameState === null || gameState === void 0 ? void 0 : gameState.currentPhase, currentAnnouncement]);
    return (<div className="flex justify-center w-full">
      <div className="glass-morphism rounded-2xl p-6 text-center min-w-80">
        {/* Lady Victoria AI Avatar */}
        <div className="relative mb-4">
          <img src="https://images.unsplash.com/photo-1494790108755-2616b612b1d8?ixlib=rb-4.0.3&w=80&h=80&fit=crop&crop=face" alt="Lady Victoria AI Dealer" className="w-20 h-20 rounded-full mx-auto border-4 border-yellow-400 shadow-lg"/>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <i className="fas fa-robot text-xs text-white"></i>
          </div>
        </div>
        
        <h3 className="text-yellow-400 font-orbitron font-bold text-lg mb-2">
          Lady Victoria AI
        </h3>
        <p className="text-gray-300 text-sm mb-4">Professional Dealer</p>
        
        {/* Dealer Speech Bubble */}
        <div className={`bg-green-700 rounded-lg p-3 relative ${isAnimating ? 'animate-dealer-speak' : ''}`}>
          <p className="text-white text-sm">"{currentAnnouncement}"</p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-700"></div>
          </div>
        </div>
      </div>
    </div>);
}
