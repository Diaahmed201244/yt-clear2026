"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Game;
const react_1 = require("react");
const wouter_1 = require("wouter");
const useWebSocket_1 = require("@/hooks/useWebSocket");
const useGameState_1 = require("@/hooks/useGameState");
const use_toast_1 = require("@/hooks/use-toast");
const CasinoTable_1 = require("@/components/casino/CasinoTable");
const MoneyExchange_1 = require("@/components/casino/MoneyExchange");
const ChatSystem_1 = require("@/components/casino/ChatSystem");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const soundManager_1 = require("@/lib/soundManager");
function Game() {
    const [, params] = (0, wouter_1.useRoute)("/game/:roomCode");
    const roomCode = params === null || params === void 0 ? void 0 : params.roomCode;
    const [user, setUser] = (0, react_1.useState)(null);
    const { gameState, setGameState } = (0, useGameState_1.useGameState)();
    const { toast } = (0, use_toast_1.useToast)();
    // Prevent any automatic scrolling
    (0, react_1.useEffect)(() => {
        // Disable scroll restoration completely
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
        return () => {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
        };
    }, []);
    const { isConnected, send } = (0, useWebSocket_1.useWebSocket)((message) => {
        switch (message.type) {
            case 'game_state':
                setGameState(message.data);
                break;
            case 'error':
                toast({
                    title: "Error",
                    description: message.data.message,
                    variant: "destructive",
                });
                break;
            case 'player_joined':
                toast({
                    title: "Player Joined",
                    description: `${message.data.playerName} joined the table`,
                });
                break;
            case 'game_started':
                soundManager_1.soundManager.playDealerVoice("Welcome to the table! Cards are now being dealt. Good luck everyone!");
                toast({
                    title: "Game Started",
                    description: "Let the cards be dealt!",
                });
                break;
            case 'card_played':
                soundManager_1.soundManager.playCardFlip();
                toast({
                    title: "Card Played",
                    description: `${message.data.playerName} played ${message.data.card.rank}${message.data.card.suit}`,
                });
                break;
        }
    });
    (0, react_1.useEffect)(() => {
        // Load user from localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);
    (0, react_1.useEffect)(() => {
        // Join room when connected
        if (isConnected && user && roomCode) {
            send({
                type: 'join_room',
                data: {
                    roomCode,
                    playerId: user.id,
                    playerName: user.username,
                }
            });
        }
    }, [isConnected, user, roomCode, send]);
    const handleInvitePlayer = () => {
        if (roomCode) {
            soundManager_1.soundManager.playButtonClick();
            const inviteUrl = `${window.location.origin}/game/${roomCode}`;
            navigator.clipboard.writeText(inviteUrl);
            toast({
                title: "Invite Link Copied",
                description: "Share the link with friends to invite them to your table",
            });
        }
    };
    const handleStartGame = () => {
        soundManager_1.soundManager.playButtonClick();
        soundManager_1.soundManager.playDealerVoice("Starting the game now. Please wait while I deal the cards.");
        send({ type: 'start_game', data: {} });
    };
    if (!user) {
        return (<div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-casino-cream text-center">
          <lucide_react_1.Crown className="text-casino-gold text-6xl mx-auto mb-4"/>
          <h2 className="text-2xl font-bold mb-2">Loading Game...</h2>
          <p>Please wait while we prepare your table</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-b from-gray-900 to-black font-inter">
      {/* Header */}
      <header className="bg-casino-red shadow-2xl border-b-4 border-casino-gold">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <lucide_react_1.Crown className="text-casino-gold text-3xl"/>
              <h1 className="text-casino-cream font-playfair text-2xl md:text-3xl font-bold">
                Royal Casino
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Player Balance */}
              <div className="bg-black/30 rounded-lg px-4 py-2 border border-casino-gold/30">
                <div className="flex items-center space-x-2">
                  <lucide_react_1.Users className="text-casino-gold h-4 w-4"/>
                  <span className="text-casino-cream font-semibold">
                    ${user.balance.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Room Code Display */}
              <div className="bg-casino-green/20 rounded-lg px-3 py-2 border border-casino-green">
                <div className="flex items-center space-x-2">
                  <lucide_react_1.Key className="text-casino-green h-4 w-4"/>
                  <span className="text-casino-cream text-sm font-mono">
                    {roomCode}
                  </span>
                </div>
              </div>
              
              <button_1.Button onClick={handleInvitePlayer} className="bg-casino-gold text-black hover:bg-yellow-400 font-semibold">
                <lucide_react_1.Share2 className="h-4 w-4 mr-2"/>
                Invite
              </button_1.Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <CasinoTable_1.default gameState={gameState} currentUser={user} onSendMessage={send}/>
            
            {/* Game Controls */}
            <div className="mt-6 bg-black/60 rounded-xl p-6 border border-casino-gold/30 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex space-x-4">
                  {(gameState === null || gameState === void 0 ? void 0 : gameState.room.gameStatus) === "waiting" && (<button_1.Button onClick={handleStartGame} className="bg-casino-gold text-black hover:bg-yellow-400 font-semibold">
                      Start Game
                    </button_1.Button>)}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-casino-cream">
                    <span className="text-sm">Status: </span>
                    <span className="font-semibold text-casino-gold">
                      {(gameState === null || gameState === void 0 ? void 0 : gameState.room.gameStatus) === "waiting" ? "Waiting for players" :
            (gameState === null || gameState === void 0 ? void 0 : gameState.room.gameStatus) === "playing" ? `Round ${gameState.room.currentRound}` :
                "Game finished"}
                    </span>
                  </div>
                  {(gameState === null || gameState === void 0 ? void 0 : gameState.room.gameStatus) === "playing" && (<div className="bg-casino-red/50 rounded-lg px-3 py-2">
                      <span className="text-casino-cream font-mono">
                        Players: {gameState.players.length}
                      </span>
                    </div>)}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <MoneyExchange_1.default user={user} onExchange={(amount) => send({
            type: 'exchange_money',
            data: { amount }
        })}/>
            
            <ChatSystem_1.default messages={(gameState === null || gameState === void 0 ? void 0 : gameState.messages) || []} onSendMessage={(message, messageType) => send({
            type: 'chat_message',
            data: { message, messageType }
        })}/>
          </div>
        </div>
      </div>
    </div>);
}
