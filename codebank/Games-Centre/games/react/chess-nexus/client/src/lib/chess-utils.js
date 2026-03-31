export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
export function parseMove(move) {
    if (move.length < 4)
        return null;
    return {
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        promotion: move.length > 4 ? move[4] : null,
    };
}
export function getSquareColor(square) {
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt(square[1]) - 1;
    return (file + rank) % 2 === 0 ? 'dark' : 'light';
}
export function getPieceValue(piece) {
    const values = {
        'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0,
        'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0,
    };
    return values[piece] || 0;
}
export function calculateMaterial(fen) {
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
export function getOpeningName(moves) {
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
