"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AudioCommunication;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const slider_1 = require("@/components/ui/slider");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
function AudioCommunication({ gameState, currentUser, localStream, remoteStreams, isConnected, onToggleMute, isMuted, onOpenSettings }) {
    const [micVolume, setMicVolume] = (0, react_1.useState)([85]);
    const [volume, setVolume] = (0, react_1.useState)([90]);
    const [isPushToTalk, setIsPushToTalk] = (0, react_1.useState)(false);
    const pushToTalkRef = (0, react_1.useRef)(false);
    const players = (gameState === null || gameState === void 0 ? void 0 : gameState.players) || [];
    const handlePushToTalkStart = () => {
        pushToTalkRef.current = true;
        setIsPushToTalk(true);
        // TODO: Start audio transmission
    };
    const handlePushToTalkEnd = () => {
        pushToTalkRef.current = false;
        setIsPushToTalk(false);
        // TODO: Stop audio transmission
    };
    const renderAudioVisualizer = (isActive = false) => (<div className="audio-visualizer scale-75">
      {[1, 2, 3, 4, 5].map((i) => (<div key={i} className={(0, utils_1.cn)("audio-bar", isActive ? "bg-audio-active" : "bg-gray-500")} style={{
                height: isActive ? `${Math.random() * 15 + 5}px` : '5px',
                animationDelay: `${i * 0.1}s`
            }}/>))}
    </div>);
    return (<card_1.Card className="bg-black/80 border-casino-gold/30 backdrop-blur-sm">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-casino-cream font-playfair font-semibold text-lg flex items-center">
          <lucide_react_1.Headphones className="mr-2"/>
          Voice Chat
        </card_1.CardTitle>
      </card_1.CardHeader>
      
      <card_1.CardContent className="space-y-4">
        {/* Voice Participants */}
        <div className="space-y-3">
          {players.map((player) => {
            const isCurrentUser = player.playerId === (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id);
            const isActive = !player.isMuted && player.audioEnabled;
            return (<div key={player.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={(0, utils_1.cn)("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", isCurrentUser
                    ? "bg-casino-gold text-black"
                    : "bg-gray-600 text-white")}>
                    {player.playerName[0].toUpperCase()}
                  </div>
                  <span className={(0, utils_1.cn)("text-sm font-semibold", isCurrentUser ? "text-casino-cream" : "text-gray-300")}>
                    {isCurrentUser ? "You" : player.playerName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {isActive ? (<>
                      {renderAudioVisualizer(true)}
                      <lucide_react_1.Mic className="text-audio-active h-4 w-4"/>
                    </>) : (<>
                      <span className="text-xs text-gray-500">
                        {player.isMuted ? "Muted" : "Inactive"}
                      </span>
                      <lucide_react_1.MicOff className="text-audio-muted h-4 w-4"/>
                    </>)}
                </div>
              </div>);
        })}
        </div>
        
        {/* Audio Controls */}
        <div className="border-t border-gray-600 pt-4 space-y-3">
          {/* Push to Talk Button */}
          <button_1.Button onMouseDown={handlePushToTalkStart} onMouseUp={handlePushToTalkEnd} onMouseLeave={handlePushToTalkEnd} className={(0, utils_1.cn)("push-to-talk-button w-full py-4 font-semibold text-white flex items-center justify-center space-x-2 transition-all", isPushToTalk && "scale-95")}>
            <lucide_react_1.Mic className="h-5 w-5"/>
            <span>Hold to Talk</span>
          </button_1.Button>
          
          {/* Audio Settings */}
          <div className="grid grid-cols-2 gap-3">
            <button_1.Button onClick={onToggleMute} className={(0, utils_1.cn)("px-3 py-2 text-sm transition-colors", isMuted
            ? "bg-audio-muted hover:bg-red-600 text-white"
            : "bg-audio-active hover:bg-green-600 text-black")}>
              {isMuted ? <lucide_react_1.MicOff className="mr-1 h-4 w-4"/> : <lucide_react_1.Mic className="mr-1 h-4 w-4"/>}
              {isMuted ? "Unmute" : "Mute"}
            </button_1.Button>
            <button_1.Button onClick={onOpenSettings} className="bg-gray-800 hover:bg-gray-700 text-casino-cream px-3 py-2 text-sm">
              <lucide_react_1.Settings className="mr-1 h-4 w-4"/>
              Settings
            </button_1.Button>
          </div>
          
          {/* Volume Controls */}
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-casino-cream text-xs">Microphone</span>
                <span className="text-casino-gold text-xs">{micVolume[0]}%</span>
              </div>
              <slider_1.Slider value={micVolume} onValueChange={setMicVolume} max={100} step={1} className="w-full"/>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-casino-cream text-xs">Volume</span>
                <span className="text-casino-gold text-xs">{volume[0]}%</span>
              </div>
              <slider_1.Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-full"/>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-casino-cream">Audio Connection:</span>
            <span className={(0, utils_1.cn)("font-semibold", isConnected ? "text-audio-active" : "text-audio-muted")}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
