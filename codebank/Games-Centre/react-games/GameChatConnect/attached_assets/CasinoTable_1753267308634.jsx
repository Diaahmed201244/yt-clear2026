"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CasinoTable;
const utils_1 = require("@/lib/utils");
const LadyDealer_1 = require("./LadyDealer");
const PlayerPosition_1 = require("./PlayerPosition");
const CardDeck_1 = require("./CardDeck");
const PotArea_1 = require("./PotArea");
const GameControls_1 = require("./GameControls");
const soundManager_1 = require("@/lib/soundManager");
function CasinoTable({ gameState, currentUser, onSendMessage }) {
    var _a;
    const handlePlayCard = (card) => {
        soundManager_1.soundManager.playCardFlip();
        soundManager_1.soundManager.playButtonClick();
        onSendMessage({
            type: 'play_card',
            data: { card }
        });
    };
    const isPlayerTurn = (gameState === null || gameState === void 0 ? void 0 : gameState.room) && (gameState === null || gameState === void 0 ? void 0 : gameState.players) ?
        ((_a = gameState.players[gameState.room.currentPlayerIndex]) === null || _a === void 0 ? void 0 : _a.playerId) === currentUser.id : false;
    // Position players around the table
    const getPlayerPositions = () => {
        if (!(gameState === null || gameState === void 0 ? void 0 : gameState.players))
            return [];
        const positions = [
            { style: "bottom-8 left-1/2 transform -translate-x-1/2" }, // Bottom center
            { style: "bottom-12 right-8" }, // Bottom right
            { style: "right-4 top-1/2 transform -translate-y-1/2" }, // Right middle
            { style: "top-12 right-8" }, // Top right
            { style: "top-12 left-8" }, // Top left
            { style: "left-4 top-1/2 transform -translate-y-1/2" }, // Left middle
        ];
        return gameState.players.map((player, index) => (Object.assign(Object.assign({}, player), { position: positions[index] || positions[0], isCurrentPlayer: player.playerId === currentUser.id, isPlayerTurn: isPlayerTurn && player.playerId === currentUser.id })));
    };
    const positionedPlayers = getPlayerPositions();
    return (<div className="casino-table velvet-texture rounded-3xl p-8 shadow-2xl border-4 border-casino-gold/30 relative overflow-hidden min-h-[600px]">
      
      {/* Dealer Area */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <LadyDealer_1.default dealerName={(gameState === null || gameState === void 0 ? void 0 : gameState.room.dealerName) || "Lady Victoria"} status={(gameState === null || gameState === void 0 ? void 0 : gameState.room.gameStatus) === "playing" ? "Dealing cards..." : "Waiting for players..."}/>
      </div>

      {/* Card Deck Area */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <CardDeck_1.default remainingCards={(gameState === null || gameState === void 0 ? void 0 : gameState.room.deck) ? gameState.room.deck.length : 52}/>
      </div>

      {/* Players */}
      {positionedPlayers.map((player, index) => (<div key={player.id} className={(0, utils_1.cn)("absolute", player.position.style)}>
          <PlayerPosition_1.default player={player} isCurrentUser={player.isCurrentPlayer} isPlayerTurn={player.isPlayerTurn} onPlayCard={handlePlayCard}/>
        </div>))}

      {/* Central Pot Area */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-8">
        <PotArea_1.default pot={(gameState === null || gameState === void 0 ? void 0 : gameState.room.pot) || []}/>
      </div>

      {/* Game Status */}
      <div className="absolute top-4 right-4">
        <div className="bg-casino-green/80 rounded-lg px-3 py-2 border border-casino-green backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-casino-gold rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-semibold">
              {(gameState === null || gameState === void 0 ? void 0 : gameState.room.gameStatus) === "waiting" ? "Waiting" :
            (gameState === null || gameState === void 0 ? void 0 : gameState.room.gameStatus) === "playing" ? `Round ${gameState.room.currentRound} of ${gameState.room.maxRounds}` :
                "Finished"}
            </span>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      {(gameState === null || gameState === void 0 ? void 0 : gameState.room.gameStatus) === "playing" && (<GameControls_1.default isPlayerTurn={isPlayerTurn} currentPlayer={gameState.players[gameState.room.currentPlayerIndex]} onPlayCard={handlePlayCard}/>)}
    </div>);
}
