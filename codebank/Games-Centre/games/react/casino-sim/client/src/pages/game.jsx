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
const wouter_1 = require("wouter");
const react_1 = require("react");
const useWebSocket_1 = require("@/hooks/useWebSocket");
const useGameState_1 = require("@/hooks/useGameState");
const GameTable_1 = require("@/components/game/GameTable");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const card_1 = require("@/components/ui/card");
function Game() {
    const { gameId } = (0, wouter_1.useParams)();
    const [currentGameId, setCurrentGameId] = (0, react_1.useState)(gameId || '');
    const [playerName, setPlayerName] = (0, react_1.useState)('');
    const [playerId, setPlayerId] = (0, react_1.useState)(null);
    const [hasJoined, setHasJoined] = (0, react_1.useState)(false);
    const { socket, isConnected, sendMessage } = (0, useWebSocket_1.useWebSocket)();
    const { gameState, players, history, updateGameState } = (0, useGameState_1.useGameState)();
    (0, react_1.useEffect)(() => {
        if (!playerId) {
            // Generate a random player ID
            setPlayerId(Math.floor(Math.random() * 10000));
        }
    }, [playerId]);
    const createNewGame = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: `VIC-${Date.now()}`,
                    status: 'waiting',
                    currentRound: 1,
                    maxRounds: 4,
                    entryStake: 250,
                    currentPot: 0,
                    communityCards: [],
                    currentPhase: 'waiting',
                    currentPlayerIndex: 0,
                    turnTimeLimit: 30,
                }),
            });
            if (response.ok) {
                const game = yield response.json();
                setCurrentGameId(game.gameId);
            }
        }
        catch (error) {
            console.error('Failed to create game:', error);
        }
    });
    const joinGame = () => {
        if (socket && playerId && playerName && currentGameId) {
            sendMessage({
                type: 'join',
                gameId: currentGameId,
                playerId,
                playerName,
            });
            setHasJoined(true);
        }
    };
    const handleFold = () => {
        if (socket && hasJoined) {
            sendMessage({
                type: 'fold',
            });
        }
    };
    const handlePlayCard = () => {
        if (socket && hasJoined) {
            sendMessage({
                type: 'play-card',
                data: { action: 'play' },
            });
        }
    };
    // Listen for WebSocket messages
    (0, react_1.useEffect)(() => {
        if (socket) {
            const handleMessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    updateGameState(message);
                }
                catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
            socket.addEventListener('message', handleMessage);
            return () => socket.removeEventListener('message', handleMessage);
        }
    }, [socket, updateGameState]);
    if (!hasJoined) {
        return (<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center p-4">
        <card_1.Card className="w-full max-w-md p-6 glass-morphism">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white font-orbitron mb-2">
              Lady Victoria's Casino
            </h1>
            <p className="text-gray-300">Join the premium card game experience</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <input_1.Input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Enter your name" className="w-full"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Game ID
              </label>
              <input_1.Input type="text" value={currentGameId} onChange={(e) => setCurrentGameId(e.target.value)} placeholder="Enter game ID or create new" className="w-full"/>
            </div>

            <div className="flex space-x-2">
              <button_1.Button onClick={joinGame} disabled={!isConnected || !playerName || !currentGameId} className="flex-1 bg-green-600 hover:bg-green-700">
                Join Game
              </button_1.Button>
              <button_1.Button onClick={createNewGame} disabled={!isConnected} variant="outline" className="flex-1">
                New Game
              </button_1.Button>
            </div>

            <div className="text-center">
              <div className={`inline-flex items-center space-x-2 text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}/>
                <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
              </div>
            </div>
          </div>
        </card_1.Card>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 overflow-hidden">
      <GameTable_1.default gameState={gameState} players={players} history={history} currentPlayerId={playerId} currentPlayerName={playerName} onFold={handleFold} onPlayCard={handlePlayCard} isConnected={isConnected}/>
    </div>);
}
