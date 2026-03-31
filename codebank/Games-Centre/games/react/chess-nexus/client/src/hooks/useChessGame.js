import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Chess } from "chess.js";
import { useStockfish } from "./useStockfish";
import { apiRequest, queryClient } from "@/lib/queryClient";
export function useChessGame(gameMode) {
    const [game, setGame] = useState(null);
    const [chess] = useState(() => new Chess());
    const [gameState, setGameState] = useState({
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
    const [aiSettings, setAISettings] = useState({
        difficulty: 'intermediate',
        thinkTime: 1000,
    });
    const { requestMove: requestAIMove } = useStockfish(aiSettings);
    const { data: moves = [] } = useQuery({
        queryKey: game ? ['/api/games', game.id, 'moves'] : undefined,
        enabled: !!game,
    });
    const createGameMutation = useMutation({
        mutationFn: async (gameData) => {
            const response = await apiRequest('POST', '/api/games', gameData);
            return response.json();
        },
        onSuccess: (newGame) => {
            setGame(newGame);
        },
    });
    const addMoveMutation = useMutation({
        mutationFn: async (moveData) => {
            if (!game)
                throw new Error("No active game");
            const response = await apiRequest('POST', `/api/games/${game.id}/moves`, moveData);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/games', game?.id, 'moves'] });
        },
    });
    const updateGameMutation = useMutation({
        mutationFn: async (updates) => {
            if (!game)
                throw new Error("No active game");
            const response = await apiRequest('PATCH', `/api/games/${game.id}`, updates);
            return response.json();
        },
        onSuccess: (updatedGame) => {
            setGame(updatedGame);
        },
    });
    const updateGameState = useCallback(() => {
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
    const makeMove = useCallback((move) => {
        try {
            const moveObj = chess.move(move);
            if (!moveObj)
                return false;
            updateGameState();
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
            if (gameMode === 'computer' && chess.turn() !== gameState.orientation.charAt(0)) {
                setGameState(prev => ({ ...prev, aiThinking: true }));
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
                        setGameState(prev => ({ ...prev, aiThinking: false }));
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
    const startNewGame = useCallback(() => {
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
        createGameMutation.mutate({
            gameType: gameMode,
            difficulty: gameMode === 'computer' ? aiSettings.difficulty : null,
            whitePlayerId: 1,
            blackPlayerId: gameMode === 'computer' ? null : null,
            timeControl: 600,
        });
    }, [chess, gameMode, aiSettings.difficulty, createGameMutation]);
    const undoMove = useCallback(() => {
        const move = chess.undo();
        if (move) {
            if (gameMode === 'computer') {
                chess.undo();
            }
            updateGameState();
        }
    }, [chess, gameMode, updateGameState]);
    const resignGame = useCallback(() => {
        if (game) {
            updateGameMutation.mutate({
                status: 'completed',
                result: gameState.orientation === 'white' ? 'black_wins' : 'white_wins',
            });
        }
    }, [game, gameState.orientation, updateGameMutation]);
    const offerDraw = useCallback(() => {
        console.log('Draw offered');
    }, []);
    const flipBoard = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            orientation: prev.orientation === 'white' ? 'black' : 'white',
        }));
    }, []);
    const exportFEN = useCallback(() => {
        return chess.fen();
    }, [chess]);
    const importFEN = useCallback((fen) => {
        try {
            chess.load(fen);
            updateGameState();
        }
        catch (error) {
            throw new Error('Invalid FEN string');
        }
    }, [chess, updateGameState]);
    useEffect(() => {
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
