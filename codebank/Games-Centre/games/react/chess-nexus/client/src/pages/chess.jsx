"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChessPage;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const AppHeader_1 = require("@/components/AppHeader");
const ChessBoard_1 = require("@/components/chess/ChessBoard");
const GameModeSelector_1 = require("@/components/chess/GameModeSelector");
const GameControls_1 = require("@/components/chess/GameControls");
const MoveHistory_1 = require("@/components/chess/MoveHistory");
const GameInfo_1 = require("@/components/chess/GameInfo");
const AISettings_1 = require("@/components/chess/AISettings");
const MultiplayerChat_1 = require("@/components/chess/MultiplayerChat");
const FENDialog_1 = require("@/components/chess/FENDialog");
const useChessGame_1 = require("@/hooks/useChessGame");
function ChessPage() {
    const [gameMode, setGameMode] = (0, react_1.useState)('computer');
    const [showFENDialog, setShowFENDialog] = (0, react_1.useState)(false);
    const [showChat, setShowChat] = (0, react_1.useState)(false);
    const { data: currentUser } = (0, react_query_1.useQuery)({
        queryKey: ['/api/user/current'],
    });
    const { game, gameState, moves, makeMove, startNewGame, undoMove, resignGame, offerDraw, flipBoard, exportFEN, importFEN, aiSettings, setAISettings, } = (0, useChessGame_1.useChessGame)(gameMode);
    const handleGameModeChange = (mode) => {
        setGameMode(mode);
        setShowChat(mode === 'multiplayer');
    };
    if (!currentUser) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50">
      <AppHeader_1.default user={currentUser}/>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <GameModeSelector_1.default gameMode={gameMode} onGameModeChange={handleGameModeChange}/>
            
            {gameMode === 'computer' && (<AISettings_1.default settings={aiSettings} onSettingsChange={setAISettings}/>)}
            
            <GameControls_1.default onNewGame={startNewGame} onUndoMove={undoMove} onOfferDraw={offerDraw} onResign={resignGame} canUndo={moves.length > 0} gameStatus={gameState.status}/>
          </div>

          {/* Main Chess Board */}
          <div className="lg:col-span-6">
            <ChessBoard_1.default position={gameState.fen} orientation={gameState.orientation} onMove={makeMove} gameState={gameState} onFlipBoard={flipBoard} onExportFEN={() => setShowFENDialog(true)} onImportFEN={() => setShowFENDialog(true)}/>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <MoveHistory_1.default moves={moves}/>
            <GameInfo_1.default game={game} gameState={gameState}/>
          </div>
        </div>
      </div>

      {/* Modals and Overlays */}
      {showFENDialog && (<FENDialog_1.default currentFEN={gameState.fen} onImport={importFEN} onExport={exportFEN} onClose={() => setShowFENDialog(false)}/>)}

      {showChat && gameMode === 'multiplayer' && game && (<MultiplayerChat_1.default gameId={game.id} currentUserId={currentUser.id} onClose={() => setShowChat(false)}/>)}
    </div>);
}
