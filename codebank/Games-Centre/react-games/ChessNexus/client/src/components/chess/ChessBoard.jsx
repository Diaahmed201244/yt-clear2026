"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChessBoard;
const react_chessboard_1 = require("react-chessboard");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function ChessBoard({ position, orientation, onMove, gameState, onFlipBoard, onExportFEN, onImportFEN, }) {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const onDrop = (sourceSquare, targetSquare) => {
        const move = sourceSquare + targetSquare;
        return onMove(move);
    };
    return (<div className="bg-white rounded-xl shadow-lg p-6">
      {/* Game Status Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${gameState.turn === 'w' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {gameState.turn === 'w' ? "White's Turn" : "Black's Turn"}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Move {gameState.moveNumber}
          </div>
          {gameState.isCheck && (<div className="text-sm font-medium text-red-600">Check!</div>)}
        </div>
        
        <div className="flex items-center space-x-2">
          <button_1.Button variant="ghost" size="sm" onClick={onFlipBoard} title="Flip Board">
            <lucide_react_1.RotateCcw className="w-4 h-4"/>
          </button_1.Button>
          <button_1.Button variant="ghost" size="sm" onClick={onExportFEN} title="Export FEN">
            <lucide_react_1.Download className="w-4 h-4"/>
          </button_1.Button>
          <button_1.Button variant="ghost" size="sm" onClick={onImportFEN} title="Import FEN">
            <lucide_react_1.Upload className="w-4 h-4"/>
          </button_1.Button>
        </div>
      </div>

      {/* Chess Timer */}
      <div className="flex justify-between mb-6">
        <div className="bg-gray-100 px-4 py-2 rounded-lg">
          <div className="text-xs text-gray-600">
            {orientation === 'white' ? 'Opponent' : 'You'}
          </div>
          <div className="chess-timer text-gray-900">
            <lucide_react_1.Clock className="inline w-4 h-4 mr-2"/>
            {formatTime(orientation === 'white' ? gameState.blackTime : gameState.whiteTime)}
          </div>
        </div>
        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg">
          <div className="text-xs text-gray-300">
            {orientation === 'white' ? 'You' : 'Opponent'}
          </div>
          <div className="chess-timer">
            <lucide_react_1.Clock className="inline w-4 h-4 mr-2"/>
            {formatTime(orientation === 'white' ? gameState.whiteTime : gameState.blackTime)}
          </div>
        </div>
      </div>

      {/* Chess Board */}
      <div className="flex justify-center">
        <div className="chess-board">
          <react_chessboard_1.Chessboard position={position} onPieceDrop={onDrop} boardOrientation={orientation} areArrowsAllowed={true} arePremovesAllowed={true} boardWidth={480} customDarkSquareStyle={{ backgroundColor: '#B58863' }} customLightSquareStyle={{ backgroundColor: '#F0D9B5' }}/>
        </div>
      </div>

      {/* AI Status */}
      {gameState.aiThinking && (<div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            <span className="text-sm text-blue-800">AI is thinking...</span>
          </div>
        </div>)}

      {/* Game Status Messages */}
      {gameState.isCheckmate && (<div className="mt-6 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-sm font-medium text-red-800">
            Checkmate! {gameState.turn === 'w' ? 'Black' : 'White'} wins!
          </div>
        </div>)}

      {gameState.isStalemate && (<div className="mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-sm font-medium text-yellow-800">
            Stalemate! The game is a draw.
          </div>
        </div>)}

      {gameState.isDraw && (<div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-800">
            Draw! The game has ended in a draw.
          </div>
        </div>)}
    </div>);
}
