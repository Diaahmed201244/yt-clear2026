// Chess piece definitions
class Piece {
    constructor(color) {
        this.color = color;
        this.hasMoved = false;
    }

    getValidMoves(board, position) {
        return [];
    }

    isValidMove(board, from, to) {
        const validMoves = this.getValidMoves(board, from);
        return validMoves.some(move => move[0] === to[0] && move[1] === to[1]);
    }
}

class Pawn extends Piece {
    constructor(color) {
        super(color);
        this.justMoved = false; // Track if pawn just made a two-square move
    }

    getValidMoves(board, [row, col]) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;
        
        // Forward move
        if (board[row + direction]?.[col]?.piece === null) {
            moves.push([row + direction, col]);
            // Initial two-square move
            if (!this.hasMoved && board[row + 2 * direction]?.[col]?.piece === null) {
                moves.push([row + 2 * direction, col]);
            }
        }

        // Regular captures and en passant
        const captures = [[row + direction, col - 1], [row + direction, col + 1]];
        captures.forEach(([r, c]) => {
            if (board[r]?.[c]?.piece?.color === (this.color === 'white' ? 'black' : 'white')) {
                moves.push([r, c]);
            } else if (board[row]?.[c]?.piece instanceof Pawn && 
                      board[row][c].piece.color !== this.color &&
                      board[row][c].piece.justMoved) {
                moves.push([r, c]); // En passant capture
            }
        });

        return moves.filter(([r, c]) => r >= 0 && r < 8 && c >= 0 && c < 8);
    }

    get symbol() {
        return this.color === 'white' ? '♙' : '♟';
    }
}

class Rook extends Piece {
    getValidMoves(board, [row, col]) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        directions.forEach(([dr, dc]) => {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (board[r][c].piece === null) {
                    moves.push([r, c]);
                } else if (board[r][c].piece.color !== this.color) {
                    moves.push([r, c]);
                    break;
                } else {
                    break;
                }
                r += dr;
                c += dc;
            }
        });

        return moves;
    }

    get symbol() {
        return this.color === 'white' ? '♖' : '♜';
    }
}

class Knight extends Piece {
    getValidMoves(board, [row, col]) {
        const moves = [
            [row + 2, col + 1], [row + 2, col - 1],
            [row - 2, col + 1], [row - 2, col - 1],
            [row + 1, col + 2], [row + 1, col - 2],
            [row - 1, col + 2], [row - 1, col - 2]
        ];

        return moves.filter(([r, c]) => {
            return r >= 0 && r < 8 && c >= 0 && c < 8 && 
                   (board[r][c].piece === null || board[r][c].piece.color !== this.color);
        });
    }

    get symbol() {
        return this.color === 'white' ? '♘' : '♞';
    }
}

class Bishop extends Piece {
    getValidMoves(board, [row, col]) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        directions.forEach(([dr, dc]) => {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (board[r][c].piece === null) {
                    moves.push([r, c]);
                } else if (board[r][c].piece.color !== this.color) {
                    moves.push([r, c]);
                    break;
                } else {
                    break;
                }
                r += dr;
                c += dc;
            }
        });

        return moves;
    }

    get symbol() {
        return this.color === 'white' ? '♗' : '♝';
    }
}

class Queen extends Piece {
    getValidMoves(board, position) {
        const bishop = new Bishop(this.color);
        const rook = new Rook(this.color);
        return [...bishop.getValidMoves(board, position), ...rook.getValidMoves(board, position)];
    }

    get symbol() {
        return this.color === 'white' ? '♕' : '♛';
    }
}

class King extends Piece {
    getValidMoves(board, [row, col]) {
        const moves = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    if (board[r][c].piece === null || board[r][c].piece.color !== this.color) {
                        moves.push([r, c]);
                    }
                }
            }
        }

        // Castling
        if (!this.hasMoved) {
            // Kingside
            if (board[row][7]?.piece instanceof Rook && !board[row][7].piece.hasMoved) {
                if (!board[row][5].piece && !board[row][6].piece) {
                    moves.push([row, 6]);
                }
            }
            // Queenside
            if (board[row][0]?.piece instanceof Rook && !board[row][0].piece.hasMoved) {
                if (!board[row][1].piece && !board[row][2].piece && !board[row][3].piece) {
                    moves.push([row, 2]);
                }
            }
        }

        return moves;
    }

    get symbol() {
        return this.color === 'white' ? '♔' : '♚';
    }
}
