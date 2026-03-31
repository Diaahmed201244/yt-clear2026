"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PotArea;
const react_1 = require("react");
const soundManager_1 = require("@/lib/soundManager");
function PotArea({ pot, showWinnerChip }) {
    const [animate, setAnimate] = (0, react_1.useState)(false);
    const prevPot = (0, react_1.useRef)(pot);
    (0, react_1.useEffect)(() => {
        if (pot > prevPot.current) {
            setAnimate(true);
            (soundManager_1.soundManager === null || soundManager_1.soundManager === void 0 ? void 0 : soundManager_1.soundManager.playButtonClick) && soundManager_1.soundManager.playButtonClick(); // Play chip sound
            setTimeout(() => setAnimate(false), 800);
        }
        prevPot.current = pot;
    }, [pot]);
    (0, react_1.useEffect)(() => {
        if (showWinnerChip) {
            (soundManager_1.soundManager === null || soundManager_1.soundManager === void 0 ? void 0 : soundManager_1.soundManager.playCardFlip) && soundManager_1.soundManager.playCardFlip(); // Play chip-to-winner sound
        }
    }, [showWinnerChip]);
    // Render a compact pot display (no popup)
    return (<div className="flex flex-col items-center justify-center mt-2 mb-2">
      <div className="flex items-center gap-2">
        <div className={`chip-animation ${animate ? 'chip-move' : ''}`}></div>
        <div className={`chip-winner-animation ${showWinnerChip ? 'chip-move-winner' : ''}`}></div>
        <span className="text-casino-gold font-bold text-base">Pot:</span>
        <span className="text-casino-cream text-lg">${pot}</span>
      </div>
      <style>{`
        .chip-animation {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: gold;
          box-shadow: 0 0 8px 2px #ffd70099;
          position: absolute;
          left: 50%;
          top: 0;
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0;
          z-index: 10;
        }
        .chip-move {
          animation: chipDrop 0.8s cubic-bezier(0.4, 0, 0.6, 1);
          opacity: 1;
        }
        @keyframes chipDrop {
          0% { top: -40px; opacity: 0; }
          40% { top: 10px; opacity: 1; }
          100% { top: 0; opacity: 0; }
        }
        .chip-winner-animation {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: gold;
          box-shadow: 0 0 8px 2px #ffd70099;
          position: absolute;
          left: 50%;
          top: 0;
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0;
          z-index: 20;
        }
        .chip-move-winner {
          animation: chipToWinner 1.2s cubic-bezier(0.4, 0, 0.6, 1);
          opacity: 1;
        }
        @keyframes chipToWinner {
          0% { left: 50%; top: 0; opacity: 1; }
          60% { left: 80%; top: -60px; opacity: 1; }
          100% { left: 90%; top: -100px; opacity: 0; }
        }
      `}</style>
    </div>);
}
