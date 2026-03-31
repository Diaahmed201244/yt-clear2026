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
exports.useChessGame = useChessGame;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const chess_js_1 = require("chess.js");
const useStockfish_1 = require("./useStockfish");
const queryClient_1 = require("@/lib/queryClient");
function useChessGame(gameMode) {
    const [game, setGame] = (0, react_1.useState)(null);
    const [chess] = (0, react_1.useState)(() => new chess_js_1.Chess());
    const [gameState, setGameState] = (0, react_1.useState)({
        fen: chess.fen(),
        turn: chess.turn(),
        status: 'active',
        orientation: 'white',
        whiteTime: 600,
        blackTime: 600,
        moveNumber: 1,
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        isDraw: false,
        aiThinking: false,
    });
    const [aiSettings, setAISettings] = (0, react_1.useState)({
        difficulty: 'intermediate',
        thinkTime: 1000,
    });
    const { requestMove: requestAIMove } = (0, useStockfish_1.useStockfish)(aiSettings);
    const { data: moves = [] } = (0, react_query_1.useQuery)({
        queryKey: game ? ['/api/games', game.id, 'moves'] : undefined,
        enabled: !!game,
    });
    const createGameMutation = (0, react_query_1.useMutation)({
        mutationFn: (gameData) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, queryClient_1.apiRequest)('POST', '/api/games', gameData);
            return response.json();
        }),
        onSuccess: (newGame) => {
            setGame(newGame);
        },
    });
    const addMoveMutation = (0, react_query_1.useMutation)({
        mutationFn: (moveData) => __awaiter(this, void 0, void 0, function* () {
            if (!game)
                throw new Error("No active game");
            const response = yield (0, queryClient_1.apiRequest)('POST', `/api/games/${game.id}/moves`, moveData);
            return response.json();
        }),
        onSuccess: () => {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/games', game === null || game === void 0 ? void 0 : game.id, 'moves'] });
        },
    });
    const updateGameMutation = (0, react_query_1.useMutation)({
        mutationFn: (updates) => __awaiter(this, void 0, void 0, function* () {
            if (!game)
                throw new Error("No active game");
            const response = yield (0, queryClient_1.apiRequest)('PATCH', `/api/games/${game.id}`, updates);
            return response.json();
        }),
        onSuccess: (updatedGame) => {
            setGame(updatedGame);
        },
    });
    const updateGameState = (0, react_1.useCallback)(() => {
        setGameState({
            fen: chess.fen(),
            turn: chess.turn(),
            status: chess.isGameOver() ? 'completed' : 'active',
            orientation: gameState.orientation,
            whiteTime: gameState.whiteTime,
            blackTime: gameState.blackTime,
            moveNumber: Math.floor(chess.history().length / 2) + 1,
            isCheck: chess.inCheck(),
            isCheckmate: chess.isCheckmate(),
            isStalemate: chess.isStalemate(),
            isDraw: chess.isDraw(),
            aiThinking: gameState.aiThinking,
        });
    }, [chess, gameState.orientation, gameState.whiteTime, gameState.blackTime, gameState.aiThinking]);
    const makeMove = (0, react_1.useCallback)((move) => {
        try {
            const moveObj = chess.move(move);
            if (!moveObj)
                return false;
            // Update game state
            updateGameState();
            // Save move to database
            if (game) {
                addMoveMutation.mutate({
                    moveNumber: Math.floor(chess.history().length / 2) + (chess.turn() === 'w' ? 0 : 1),
                    color: moveObj.color === 'w' ? 'white' : 'black',
                    san: moveObj.san,
                    uci: moveObj.from + moveObj.to + (moveObj.promotion || ''),
                    fen: chess.fen(),
                    capturedPiece: moveObj.captured || null,
                    isCheck: chess.inCheck(),
                    isCheckmate: chess.isCheckmate(),
                });
                // Update game state in database
                updateGameMutation.mutate({
                    currentFen: chess.fen(),
                    currentTurn: chess.turn() === 'w' ? 'white' : 'black',
                    moveCount: chess.history().length,
                    status: chess.isGameOver() ? 'completed' : 'active',
                    result: chess.isCheckmate()
                        ? (chess.turn() === 'w' ? 'black_wins' : 'white_wins')
                        : chess.isDraw()
                            ? 'draw'
                            : null,
                });
            }
            // Request AI move if playing against computer
            if (gameMode === 'computer' && chess.turn() !== gameState.orientation.charAt(0)) {
                setGameState(prev => (Object.assign(Object.assign({}, prev), { aiThinking: true })));
                setTimeout(() => {
                    requestAIMove(chess.fen()).then((aiMove) => {
                        if (aiMove) {
                            const aiMoveObj = chess.move(aiMove);
                            if (aiMoveObj) {
                                updateGameState();
                                if (game) {
                                    addMoveMutation.mutate({
                                        moveNumber: Math.floor(chess.history().length / 2) + (chess.turn() === 'w' ? 0 : 1),
                                        color: aiMoveObj.color === 'w' ? 'white' : 'black',
                                        san: aiMoveObj.san,
                                        uci: aiMoveObj.from + aiMoveObj.to + (aiMoveObj.promotion || ''),
                                        fen: chess.fen(),
                                        capturedPiece: aiMoveObj.captured || null,
                                        isCheck: chess.inCheck(),
                                        isCheckmate: chess.isCheckmate(),
                                    });
                                }
                            }
                        }
                        setGameState(prev => (Object.assign(Object.assign({}, prev), { aiThinking: false })));
                    });
                }, aiSettings.thinkTime);
            }
            return true;
        }
        catch (error) {
            console.error('Invalid move:', error);
            return false;
        }
    }, [chess, game, gameMode, gameState.orientation, aiSettings.thinkTime, requestAIMove, addMoveMutation, updateGameMutation, updateGameState]);
    const startNewGame = (0, react_1.useCallback)(() => {
        chess.reset();
        setGameState({
            fen: chess.fen(),
            turn: chess.turn(),
            status: 'active',
            orientation: 'white',
            whiteTime: 600,
            blackTime: 600,
            moveNumber: 1,
            isCheck: false,
            isCheckmate: false,
            isStalemate: false,
            isDraw: false,
            aiThinking: false,
        });
        // Create new game in database
        createGameMutation.mutate({
            gameType: gameMode,
            difficulty: gameMode === 'computer' ? aiSettings.difficulty : null,
            whitePlayerId: 1, // Current user
            blackPlayerId: gameMode === 'computer' ? null : null,
            timeControl: 600,
        });
    }, [chess, gameMode, aiSettings.difficulty, createGameMutation]);
    const undoMove = (0, react_1.useCallback)(() => {
        const move = chess.undo();
        if (move) {
            // If playing against computer, undo AI move too
            if (gameMode === 'computer') {
                chess.undo();
            }
            updateGameState();
        }
    }, [chess, gameMode, updateGameState]);
    const resignGame = (0, react_1.useCallback)(() => {
        if (game) {
            updateGameMutation.mutate({
                status: 'completed',
                result: gameState.orientation === 'white' ? 'black_wins' : 'white_wins',
            });
        }
    }, [game, gameState.orientation, updateGameMutation]);
    const offerDraw = (0, react_1.useCallback)(() => {
        // In a real implementation, this would send a draw offer to the opponent
        console.log('Draw offered');
    }, []);
    const flipBoard = (0, react_1.useCallback)(() => {
        setGameState(prev => (Object.assign(Object.assign({}, prev), { orientation: prev.orientation === 'white' ? 'black' : 'white' })));
    }, []);
    const exportFEN = (0, react_1.useCallback)(() => {
        return chess.fen();
    }, [chess]);
    const importFEN = (0, react_1.useCallback)((fen) => {
        try {
            chess.load(fen);
            updateGameState();
        }
        catch (error) {
            throw new Error('Invalid FEN string');
        }
    }, [chess, updateGameState]);
    (0, react_1.useEffect)(() => {
        updateGameState();
    }, [updateGameState]);
    return {
        game,
        gameState,
        moves,
        makeMove,
        startNewGame,
        undoMove,
        resignGame,
        offerDraw,
        flipBoard,
        exportFEN,
        importFEN,
        aiSettings,
        setAISettings,
    };
}
