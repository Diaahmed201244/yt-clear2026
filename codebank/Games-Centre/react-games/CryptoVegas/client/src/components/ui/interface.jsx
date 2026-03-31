"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interface = Interface;
const react_1 = require("react");
const useGame_1 = require("@/lib/stores/useGame");
const useAudio_1 = require("@/lib/stores/useAudio");
const button_1 = require("./button");
const card_1 = require("./card");
const lucide_react_1 = require("lucide-react");
function Interface() {
    const restart = (0, useGame_1.useGame)((state) => state.restart);
    const phase = (0, useGame_1.useGame)((state) => state.phase);
    const { isMuted, toggleMute } = (0, useAudio_1.useAudio)();
    // Handle clicks on the interface in the ready phase to start the game
    (0, react_1.useEffect)(() => {
        if (phase === "ready") {
            const handleClick = () => {
                const activeElement = document.activeElement;
                if (activeElement && 'blur' in activeElement) {
                    activeElement.blur();
                }
                const event = new KeyboardEvent("keydown", { code: "Space" });
                window.dispatchEvent(event);
            };
            window.addEventListener("click", handleClick);
            return () => window.removeEventListener("click", handleClick);
        }
    }, [phase]);
    return (<>
      {/* Top-right corner UI controls */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <button_1.Button variant="outline" size="icon" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? <lucide_react_1.VolumeX size={18}/> : <lucide_react_1.Volume2 size={18}/>}
        </button_1.Button>
        
        <button_1.Button variant="outline" size="icon" onClick={restart} title="Restart Game">
          <lucide_react_1.RotateCw size={18}/>
        </button_1.Button>
      </div>
      
      {/* Game completion overlay */}
      {phase === "ended" && (<div className="fixed inset-0 flex items-center justify-center z-20 bg-black/30">
          <card_1.Card className="w-full max-w-md mx-4 shadow-lg">
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center justify-center gap-2">
                <lucide_react_1.Trophy className="text-yellow-500"/>
                Level Complete!
              </card_1.CardTitle>
            </card_1.CardHeader>
            
            <card_1.CardContent>
              <p className="text-center text-muted-foreground">
                Congratulations! You successfully navigated the course.
              </p>
            </card_1.CardContent>
            
            <card_1.CardFooter className="flex justify-center">
              <button_1.Button onClick={restart} className="w-full">
                Play Again
              </button_1.Button>
            </card_1.CardFooter>
          </card_1.Card>
        </div>)}
      
      {/* Instructions panel */}
      <div className="fixed bottom-4 left-4 z-10">
        <card_1.Card className="w-auto max-w-xs bg-background/80 backdrop-blur-sm">
          <card_1.CardContent className="p-4">
            <h3 className="font-medium mb-2">Controls:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>WASD or Arrow Keys: Move the ball</li>
              <li>Space: Jump</li>
              <li>R: Restart game</li>
              <li>M: Toggle sound</li>
            </ul>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </>);
}
