"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTime = formatTime;
exports.parseMove = parseMove;
exports.getSquareColor = getSquareColor;
exports.getPieceValue = getPieceValue;
exports.calculateMaterial = calculateMaterial;
exports.getOpeningName = getOpeningName;
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
function parseMove(move) {
    // Parse UCI format move (e.g., "e2e4", "e7e8q" for promotion)
    if (move.length < 4)
        return null;
    return {
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        promotion: move.length > 4 ? move[4] : null,
    };
}
function getSquareColor(square) {
    const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
    const rank = parseInt(square[1]) - 1; // 1=0, 2=1, etc.
    return (file + rank) % 2 === 0 ? 'dark' : 'light';
}
function getPieceValue(piece) {
    const values = {
        'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0,
        'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0,
    };
    return values[piece] || 0;
}
function calculateMaterial(fen) {
    const position = fen.split(' ')[0];
    let whiteMaterial = 0;
    let blackMaterial = 0;
    for (const char of position) {
        if (char.match(/[a-zA-Z]/)) {
            const value = getPieceValue(char);
            if (char === char.toUpperCase()) {
                whiteMaterial += value;
            }
            else {
                blackMaterial += value;
            }
        }
    }
    return { white: whiteMaterial, black: blackMaterial };
}
function getOpeningName(moves) {
    // Simple opening detection based on first few moves
    if (moves.length === 0)
        return "Starting Position";
    const firstMoves = moves.slice(0, 6).join(' ');
    const openings = {
        'e4 e5': 'King\'s Pawn Game',
        'e4 e5 Nf3': 'King\'s Knight Opening',
        'e4 e5 Nf3 Nc6': 'Italian Game',
        'd4 d5': 'Queen\'s Pawn Game',
        'd4 Nf6': 'Indian Defense',
        'Nf3 d5': 'Réti Opening',
        'c4': 'English Opening',
    };
    for (const [pattern, name] of Object.entries(openings)) {
        if (firstMoves.startsWith(pattern)) {
            return name;
        }
    }
    return "Unknown Opening";
}
