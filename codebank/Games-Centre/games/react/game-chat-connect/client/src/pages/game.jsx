"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Game;
const react_1 = require("react");
const module_1 = require();
const useWebSocket_1 = require("@/hooks/useWebSocket");
const useGameState_1 = require("@/hooks/useGameState");
const useWebRTC_1 = require("@/hooks/useWebRTC");
const use_toast_1 = require("@/hooks/use-toast");
const CasinoTable_1 = require("@/components/casino/CasinoTable");
const MoneyExchange_1 = require("@/components/casino/MoneyExchange");
const ChatSystem_1 = require("@/components/casino/ChatSystem");
const AudioCommunication_1 = require("@/components/casino/AudioCommunication");
const GameStartModal_1 = require("@/components/casino/GameStartModal");
const AudioSettingsModal_1 = require("@/components/casino/AudioSettingsModal");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const soundManager_1 = require("@/lib/soundManager");
const GameLogic_1 = require("@/lib/GameLogic");
const DealerAI_1 = require("@/lib/DealerAI");
function Game() {
    const [, params] = (0, module_1.useRoute)("/game/:roomCode");
    const roomCode = params === null || params === void 0 ? void 0 : params.roomCode;
    const [user, setUser] = (0, react_1.useState)(null);
    const [showGameStartModal, setShowGameStartModal] = (0, react_1.useState)(false);
    const [showAudioSettings, setShowAudioSettings] = (0, react_1.useState)(false);
    const { gameState, setGameState } = (0, useGameState_1.useGameState)();
    const { toast } = (0, use_toast_1.useToast)();
    const [isVsComputer, setIsVsComputer] = (0, react_1.useState)(false);
    const [botDifficulty, setBotDifficulty] = (0, react_1.useState)('easy');
    const botActionTimeout = (0, react_1.useRef)(null);
    // Round log state
    const [roundLog, setRoundLog] = (0, react_1.useState)([]);
    const lastWinnerSoundPlayed = (0, react_1.useRef)(false);
    const [showWinnerChip, setShowWinnerChip] = (0, react_1.useState)(false);
    const [botPersonality] = (0, react_1.useState)(() => (0, DealerAI_1.generateBotPersonality)());
    const [showRulesModal, setShowRulesModal] = (0, react_1.useState)(false);
    const [isActionLoading, setIsActionLoading] = (0, react_1.useState)(false);
    // Log betting actions
    const logAction = (0, react_1.useCallback)((msg) => {
        setRoundLog(log => [...log, msg]);
    }, []);
    // Initialize WebRTC
    const { localStream, remoteStreams, isConnected: isAudioConnected, startCall, endCall, toggleMute, isMuted, getAudioDevices, setAudioDevice } = (0, useWebRTC_1.useWebRTC)();
    // Prevent any automatic scrolling
    (0, react_1.useEffect)(() => {
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
                setShowGameStartModal(false);
                break;
            case 'game_reset':
                toast({
                    title: "Game Reset",
                    description: "A new round is ready to begin!",
                });
                break;
            case 'card_played':
                soundManager_1.soundManager.playCardFlip();
                toast({
                    title: "Card Played",
                    description: `${message.data.playerName} played ${message.data.card.rank}${message.data.card.suit}`,
                });
                break;
            // Handle WebRTC signaling
            case 'webrtc_offer':
            case 'webrtc_answer':
            case 'webrtc_ice_candidate':
                // Forward to WebRTC handler
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
        setIsVsComputer(localStorage.getItem("vs_computer") === "true");
        setBotDifficulty(localStorage.getItem("bot_difficulty") || 'easy');
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
    // Add bot player to game state if vs computer and not already present
    (0, react_1.useEffect)(() => {
        if (isVsComputer && gameState && gameState.players.length === 1) {
            // Add a bot player
            const botPlayer = {
                id: "bot",
                name: "Computer Bot",
                hand: [],
                hasFolded: false,
                balance: 1000,
                stake: 0,
            };
            setGameState(Object.assign(Object.assign({}, gameState), { players: [...gameState.players, botPlayer] }));
        }
    }, [isVsComputer, gameState, setGameState]);
    // Simulate bot action if it's the bot's turn
    (0, react_1.useEffect)(() => {
        if (!isVsComputer || !gameState || gameState.players.length < 2)
            return;
        const bot = gameState.players.find((p) => p.id === "bot");
        if (!bot)
            return;
        const currentPlayer = gameState.players[gameState.currentTurnIndex];
        if (currentPlayer.id === "bot") {
            // Simulate bot thinking and playing a card after a delay based on difficulty
            if (botActionTimeout.current)
                clearTimeout(botActionTimeout.current);
            let delay = 0;
            if (botDifficulty === 'easy')
                delay = 0;
            else if (botDifficulty === 'medium')
                delay = 1200;
            else if (botDifficulty === 'hard')
                delay = 800;
            botActionTimeout.current = setTimeout(() => {
                // Decide bot action
                const action = (0, DealerAI_1.decideAction)(bot, gameState, botDifficulty, botPersonality);
                // Send chat/emote
                const chatMsg = (0, DealerAI_1.getBotChat)(action, botPersonality);
                const emote = (0, DealerAI_1.getBotEmote)(action, botPersonality);
                if (chatMsg) {
                    send({ type: 'chat_message', data: { message: chatMsg, messageType: 'chat', playerId: bot.id, playerName: bot.name } });
                }
                if (emote) {
                    send({ type: 'chat_message', data: { message: emote, messageType: 'emote', playerId: bot.id, playerName: bot.name } });
                }
                // Act
                if (action === 'fold') {
                    // Simulate fold
                    send({ type: 'fold', data: { playerId: bot.id } });
                }
                else {
                    send({ type: 'end_turn', data: { playerId: bot.id } });
                }
            }, delay);
        }
        return () => {
            if (botActionTimeout.current)
                clearTimeout(botActionTimeout.current);
        };
    }, [isVsComputer, gameState, send, botDifficulty, botPersonality]);
    // Memoized derived values
    const bot = (0, react_1.useMemo)(() => { var _a; return ((_a = gameState === null || gameState === void 0 ? void 0 : gameState.players) === null || _a === void 0 ? void 0 : _a.find((p) => p.id === "bot")) || null; }, [gameState]);
    const currentUserObj = (0, react_1.useMemo)(() => { var _a; return ((_a = gameState === null || gameState === void 0 ? void 0 : gameState.players) === null || _a === void 0 ? void 0 : _a.find((p) => p.id === (user === null || user === void 0 ? void 0 : user.id))) || null; }, [gameState, user]);
    const currentPlayer = (0, react_1.useMemo)(() => { var _a, _b; return ((_a = gameState === null || gameState === void 0 ? void 0 : gameState.players) === null || _a === void 0 ? void 0 : _a[(_b = gameState === null || gameState === void 0 ? void 0 : gameState.currentTurnIndex) !== null && _b !== void 0 ? _b : 0]) || null; }, [gameState]);
    const pot = (0, react_1.useMemo)(() => (gameState === null || gameState === void 0 ? void 0 : gameState.pot) || 0, [gameState]);
    const handleInvitePlayer = (0, react_1.useCallback)(() => {
        if (roomCode) {
            soundManager_1.soundManager.playButtonClick();
            const inviteUrl = `${window.location.origin}/game/${roomCode}`;
            navigator.clipboard.writeText(inviteUrl);
            toast({
                title: "Invite Link Copied",
                description: "Share the link with friends to invite them to your table",
            });
        }
    }, [roomCode, soundManager_1.soundManager, toast]);
    const handleStartGame = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        soundManager_1.soundManager.playButtonClick();
        if (isConnected) {
            send({ type: 'start_game', data: {} });
            toast({ title: "Starting Game", description: "The game is now starting. Please wait..." });
        }
        else {
            toast({ title: "Unable to Start Game", description: "Please check your connection and try again", variant: "destructive" });
        }
    }), [soundManager_1.soundManager, toast, isConnected, send]);
    const handleResetGame = (0, react_1.useCallback)(() => {
        soundManager_1.soundManager.playButtonClick();
        send({ type: 'reset_game', data: {} });
        toast({ title: "Game Reset", description: "The game has been reset. You can start a new round now." });
    }, [soundManager_1.soundManager, send, toast]);
    const handleFold = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        if (!gameState || !user)
            return;
        setIsActionLoading(true);
        try {
            logAction(`${user.name || user.username} folds`);
            const newState = (0, GameLogic_1.playerFold)(gameState, user.id);
            setGameState(newState);
        }
        catch (err) {
            toast({ title: "Fold Failed", description: err.message || String(err), variant: "destructive" });
        }
        finally {
            setIsActionLoading(false);
        }
    }), [gameState, user, setGameState, logAction, toast]);
    // Handler to start next round
    const handleNextRound = (0, react_1.useCallback)(() => {
        if (!gameState)
            return;
        const newState = (0, GameLogic_1.initializeGame)(gameState.players);
        setGameState(newState);
    }, [gameState, setGameState]);
    // Log showdown and play win sound
    (0, react_1.useEffect)(() => {
        if ((gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) === "reveal" && gameState.winner && !lastWinnerSoundPlayed.current) {
            const winnerName = gameState.winner.name;
            logAction(`Winner: ${winnerName}`);
            soundManager_1.soundManager.playDealerVoice(`Congratulations ${winnerName}! You win the round!`);
            lastWinnerSoundPlayed.current = true;
        }
        if ((gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) !== "reveal") {
            lastWinnerSoundPlayed.current = false;
        }
    }, [gameState, logAction]);
    // Trigger chip animation to winner after showdown
    (0, react_1.useEffect)(() => {
        if ((gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) === "reveal" && gameState.winner) {
            setShowWinnerChip(true);
            setTimeout(() => setShowWinnerChip(false), 1200);
        }
        if ((gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) !== "reveal") {
            setShowWinnerChip(false);
        }
    }, [gameState === null || gameState === void 0 ? void 0 : gameState.roundStage, gameState.winner]);
    // Reset log on new round
    (0, react_1.useEffect)(() => {
        if ((gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) === "deal" && roundLog.length > 0) {
            setRoundLog([]);
        }
    }, [gameState === null || gameState === void 0 ? void 0 : gameState.roundStage]);
    if (!user) {
        return (<div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-casino-cream text-center">
          <lucide_react_1.Crown className="text-casino-gold text-6xl mx-auto mb-4"/>
          <h2 className="text-2xl font-bold mb-2">Loading Game...</h2>
          <p>Please wait while we prepare your table</p>
        </div>
      </div>);
    }
    return (<div className="h-screen bg-gradient-to-b from-gray-900 to-black font-inter overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-casino-red shadow-2xl border-b-4 border-casino-gold flex-shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-2">
            <div className="flex items-center space-x-4">
              <lucide_react_1.Crown className="text-casino-gold text-3xl"/>
              <h1 className="text-casino-cream font-playfair text-2xl md:text-3xl font-bold">
                Royal Casino
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Connection Status */}
              <div className="bg-black/30 rounded-lg px-3 py-2 border border-casino-gold/30">
                <div className="flex items-center space-x-2">
                  <div className={`connection-indicator ${isConnected ? 'connection-excellent' : 'connection-poor'}`}></div>
                  <span className="text-casino-cream text-sm font-semibold">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Player Balance */}
              <div className="bg-black/30 rounded-lg px-3 py-2 border border-casino-gold/30">
                <div className="flex items-center space-x-2">
                  <lucide_react_1.Users className="text-casino-gold h-4 w-4"/>
                  <span className="text-casino-cream font-semibold">
                    ${currentUserObj === null || currentUserObj === void 0 ? void 0 : currentUserObj.balance.toLocaleString()}
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
              
              {/* Audio Controls */}
              <div className="bg-black/30 rounded-lg px-3 py-2 border border-casino-gold/30">
                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className={`transition-colors ${isMuted ? 'text-audio-muted' : 'text-audio-active'} hover:text-white`}>
                    <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                  </button>
                  <button onClick={() => setShowAudioSettings(true)} className="text-casino-cream hover:text-white transition-colors">
                    <i className="fas fa-cog text-sm"></i>
                  </button>
                </div>
              </div>
              
              {/* Game Control Buttons */}
              {(gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) === 'waiting' && (<button_1.Button onClick={handleStartGame} className="bg-casino-green text-white hover:bg-green-600 font-semibold px-6 py-2 text-lg">
                  <lucide_react_1.Crown className="h-5 w-5 mr-2"/>
                  Start Game
                </button_1.Button>)}
              
              {(gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) === 'reveal' && (<button_1.Button onClick={handleResetGame} className="bg-casino-red text-white hover:bg-red-600 font-semibold px-6 py-2 text-lg">
                  <lucide_react_1.Crown className="h-5 w-5 mr-2"/>
                  New Round
                </button_1.Button>)}
              
              <button_1.Button onClick={handleInvitePlayer} className="bg-casino-gold text-black hover:bg-yellow-400 font-semibold px-4 py-2">
                <lucide_react_1.Share2 className="h-4 w-4 mr-2"/>
                Invite
              </button_1.Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Game Start Button - Prominent when waiting */}
        {(!gameState || (gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) === 'waiting') && (<div className="flex items-center justify-center min-h-full p-4">
            <div className="bg-gradient-to-r from-casino-green to-green-600 rounded-xl p-8 border-2 border-casino-gold shadow-2xl text-center max-w-md w-full">
              <div className="flex flex-col items-center space-y-4">
                <lucide_react_1.Crown className="text-casino-gold text-6xl animate-pulse"/>
                <h2 className="text-white text-3xl font-bold">Ready to Play?</h2>
                <p className="text-casino-cream text-lg">Click the button below to start the game</p>
                <button_1.Button onClick={handleStartGame} disabled={!isConnected} className="bg-casino-gold text-black hover:bg-yellow-400 font-bold text-xl px-12 py-4 rounded-lg transform hover:scale-105 transition-all shadow-lg">
                  <lucide_react_1.Crown className="h-6 w-6 mr-3"/>
                  START GAME
                  <lucide_react_1.Crown className="h-6 w-6 ml-3"/>
                </button_1.Button>
                {!isConnected && (<p className="text-casino-cream text-sm">Connecting to server...</p>)}
              </div>
            </div>
          </div>)}

        {/* Game Content - Only show when game is active */}
        {gameState && (gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) !== 'waiting' && (<div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <CasinoTable_1.default gameState={gameState} currentUser={user} onFold={handleFold} isActionLoading={isActionLoading}/>
            
            {/* Game Controls */}
            <div className="mt-6 bg-black/60 rounded-xl p-6 border border-casino-gold/30 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex space-x-4">
                  {(gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) === "reveal" && (<button_1.Button onClick={handleNextRound} className="bg-gradient-to-r from-casino-red to-red-600 text-white hover:from-red-600 hover:to-red-700 font-semibold transform hover:scale-105">
                      <i className="fas fa-redo mr-2"></i>
                      New Round
                    </button_1.Button>)}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-casino-cream">
                    <span className="text-sm">Status: </span>
                    <span className="font-semibold text-casino-gold">
                      {gameState === null || gameState === void 0 ? void 0 : gameState.dealerMessage}
                    </span>
                  </div>
                  {(gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) !== "waiting" && (<div className="bg-casino-red/50 rounded-lg px-3 py-2">
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
            <react_1.Suspense fallback={<div>Loading audio...</div>}>
              <AudioCommunication_1.default gameState={gameState} currentUser={user} localStream={localStream} remoteStreams={remoteStreams} isConnected={isAudioConnected} onToggleMute={toggleMute} isMuted={isMuted} onOpenSettings={() => setShowAudioSettings(true)}/>
            </react_1.Suspense>
            <MoneyExchange_1.default user={user} onExchange={(amount) => send({
                type: 'exchange_money',
                data: { amount }
            })}/>
            <react_1.Suspense fallback={<div>Loading chat...</div>}>
              <ChatSystem_1.default messages={(gameState === null || gameState === void 0 ? void 0 : gameState.messages) || []} onSendMessage={(message, messageType) => send({
                type: 'chat_message',
                data: { message, messageType }
            })}/>
            </react_1.Suspense>
          </div>
            </div>
          </div>)}
      </div>

      {/* Modals */}
      <react_1.Suspense fallback={null}>
        <GameStartModal_1.default isOpen={showGameStartModal} onClose={() => setShowGameStartModal(false)} onConfirm={() => { }} // handleConfirmStartGame is removed
     gameState={gameState}/>
      </react_1.Suspense>
      <react_1.Suspense fallback={null}>
        <AudioSettingsModal_1.default isOpen={showAudioSettings} onClose={() => setShowAudioSettings(false)} audioDevices={getAudioDevices()} onDeviceChange={setAudioDevice}/>
      </react_1.Suspense>
      {(gameState === null || gameState === void 0 ? void 0 : gameState.roundStage) === "reveal" && (<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-casino-green/90 rounded-xl p-8 border-4 border-casino-gold shadow-2xl text-center max-w-lg w-full">
            <h2 className="text-2xl font-bold text-casino-gold mb-4">Showdown!</h2>
            <div className="mb-4">
              {gameState.winner ? (<>
                  <div className="text-casino-cream text-lg mb-2">Winner:</div>
                  <div className="mb-2 animate-pulse">
                    <span className="font-bold text-casino-gold text-xl">{gameState.winner.name}</span>
                    <span className="ml-2 text-casino-cream">Hand: {gameState.winner.hand.map(c => `${c.rank}${c.suit}`).join(' ')}</span>
                  </div>
                </>) : (<div className="text-casino-cream">No winner this round.</div>)}
            </div>
            <button_1.Button onClick={handleNextRound} className="bg-casino-gold text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-400">Next Round</button_1.Button>
          </div>
        </div>)}
      {showRulesModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
          <div className="bg-casino-green/95 rounded-xl p-8 border-4 border-casino-gold shadow-2xl text-center max-w-lg w-full relative">
            <button onClick={() => setShowRulesModal(false)} className="absolute top-2 right-2 bg-casino-gold text-black font-bold px-3 py-1 rounded hover:bg-yellow-400">Close</button>
            <h2 className="text-2xl font-bold text-casino-gold mb-4">Texas Hold'em Rules</h2>
            <pre className="text-casino-cream text-left whitespace-pre-wrap text-base leading-relaxed">{`Texas Hold'em Rules:\n- Each player is dealt two private cards.\n- Five community cards are dealt face up in three stages: the flop (three cards), the turn (one card), and the river (one card).\n- The best five-card poker hand wins.`}</pre>
          </div>
        </div>)}
      <div className="fixed top-4 right-4 z-40 w-80 max-h-[80vh] overflow-y-auto bg-black/80 border-2 border-casino-gold rounded-xl p-4 shadow-xl">
        <h3 className="text-casino-gold font-bold mb-2">Round Log</h3>
        <ul className="text-casino-cream text-sm space-y-1">
          {roundLog.length === 0 ? <li>No actions yet.</li> : roundLog.map((entry, idx) => <li key={idx}>{entry}</li>)}
        </ul>
      </div>
    </div>);
}
