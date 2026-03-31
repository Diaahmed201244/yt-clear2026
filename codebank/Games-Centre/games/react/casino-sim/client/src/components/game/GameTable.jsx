"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameTable;
const DealerSection_1 = require("./DealerSection");
const CommunityCards_1 = require("./CommunityCards");
const PlayerPosition_1 = require("./PlayerPosition");
const GameControls_1 = require("./GameControls");
const GameHistory_1 = require("./GameHistory");
const WinnerModal_1 = require("./WinnerModal");
const react_1 = require("react");
const PLAYER_POSITIONS = [
    { className: "bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8", label: "bottom-center" },
    { className: "bottom-8 left-8", label: "bottom-left" },
    { className: "left-0 top-1/2 transform -translate-x-8 -translate-y-1/2", label: "left-center" },
    { className: "top-8 left-8", label: "top-left" },
    { className: "top-8 right-8", label: "top-right" },
    { className: "right-0 top-1/2 transform translate-x-8 -translate-y-1/2", label: "right-center" },
];
function GameTable({ gameState, players, history, currentPlayerId, currentPlayerName, onFold, onPlayCard, isConnected, }) {
    const [showWinnerModal, setShowWinnerModal] = (0, react_1.useState)(false);
    const [winner, setWinner] = (0, react_1.useState)(null);
    const currentPlayer = players.find((p) => p.playerId === currentPlayerId);
    const isCurrentPlayerTurn = (gameState === null || gameState === void 0 ? void 0 : gameState.currentPlayerIndex) === players.findIndex((p) => p.playerId === currentPlayerId);
    (0, react_1.useEffect)(() => {
        if ((gameState === null || gameState === void 0 ? void 0 : gameState.status) === 'roundComplete' && (currentPlayer === null || currentPlayer === void 0 ? void 0 : currentPlayer.status) === 'winner') {
            const winnerData = {
                id: currentPlayer.playerId,
                name: currentPlayer.playerName,
                hand: currentPlayer.hand || [],
                handType: gameState.winningHand || 'High Card',
                potWon: gameState.currentPot,
            };
            setWinner(winnerData);
            setShowWinnerModal(true);
        }
    }, [gameState, currentPlayer]);
    // ...existing code up to the first export default function GameTable...
    // (Remove duplicate interface/type declarations and duplicate component definition)
    return (<div className="min-h-screen p-4 overflow-hidden">
      <div className="w-full mx-auto">
        
        {/* Dealer Section - positioned above table */}
        <div className="flex justify-center mb-4">
          <DealerSection_1.default gameState={gameState} history={history}/>
        </div>

        {/* Main content area with responsive layout */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
          
          {/* Game History - left side on desktop, top on mobile */}
          <div className="w-full lg:w-64 order-2 lg:order-1">
            <GameHistory_1.default history={history}/>
          </div>

          {/* Main Game Table - center */}
          <div className="flex-1 flex justify-center order-1 lg:order-2">
            <div className="table-felt rounded-full relative shadow-2xl border-8 border-yellow-500" style={{
            width: 'min(900px, 90vw)',
            height: 'min(600px, 60vh)',
            minWidth: '320px',
            minHeight: '240px'
        }}>
          
          {/* Community Cards Area */}
          <CommunityCards_1.default gameState={gameState} players={players}/>

              {/* Community Cards Area */}
              <CommunityCards_1.default gameState={gameState} players={players}/>

              {/* Player Positions */}
              {players.map((player, index) => {
            const position = PLAYER_POSITIONS[index] || PLAYER_POSITIONS[0];
            const isCurrentUser = player.playerId === currentPlayerId;
            return (<div key={player.id} className={`absolute ${isCurrentUser ? 'z-20' : 'z-10'} ${position.className}`}>
                    <PlayerPosition_1.default player={player} isCurrentUser={isCurrentUser} isCurrentTurn={isCurrentPlayerTurn && isCurrentUser} gameState={gameState} onFold={onFold} onPlayCard={onPlayCard} playerName={isCurrentUser ? currentPlayerName : player.playerName}/>
                  </div>);
        })}

              {/* Decorative Chip Stacks */}
              <div className="absolute bottom-20 left-20 hidden lg:block">
                <div className="flex space-x-1">
                  <div className="poker-chip w-8 h-8 rounded-full animate-chip-stack"></div>
                  <div className="poker-chip w-8 h-8 rounded-full animate-chip-stack" style={{ animationDelay: '0.1s' }}></div>
                  <div className="poker-chip w-8 h-8 rounded-full animate-chip-stack" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              
              <div className="absolute top-20 right-20 hidden lg:block">
                <div className="flex space-x-1">
                  <div className="poker-chip w-8 h-8 rounded-full animate-chip-stack"></div>
                  <div className="poker-chip w-8 h-8 rounded-full animate-chip-stack" style={{ animationDelay: '0.1s' }}></div>
                </div>
              </div>

            </div>
          </div>

          {/* Game Controls - right side on desktop, bottom on mobile */}
          <div className="w-full lg:w-64 order-3">
            <GameControls_1.default gameState={gameState} isConnected={isConnected} onStartGame={onPlayCard} onCall={onPlayCard} onFold={onFold} currentPlayerId={currentPlayerId} isCurrentPlayer={isCurrentPlayerTurn}/>
          </div>

        </div>

        {/* Winner Modal */}
        {showWinnerModal && winner && (<WinnerModal_1.default winner={winner} onClose={() => {
                setShowWinnerModal(false);
                setWinner(null);
            }} onNewRound={() => {
                setShowWinnerModal(false);
                setWinner(null);
            }}/>)}

      </div>
    </div>);
}
