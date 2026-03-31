class ChessBoard {
    constructor() {
        this.board = this.createBoard();
        this.selectedPiece = null;
        this.currentTurn = 'white';
        this.moveHistory = [];
        this.gameOver = false;
        this.initializeBoard();
        this.initializeSounds();
    }

    initializeSounds() {
        this.moveSound = new Audio('sounds/move.mp3');
        this.captureSound = new Audio('sounds/capture.mp3');
        this.checkSound = new Audio('sounds/check.mp3');
    }

    playMoveSound(isCapture) {
        if (isCapture) {
            this.captureSound.play();
        } else {
            this.moveSound.play();
        }
    }

    isInCheck(color) {
        // Find the king
        let kingPos = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col].piece;
                if (piece instanceof King && piece.color === color) {
                    kingPos = [row, col];
                    break;
                }
            }
            if (kingPos) break;
        }

        // Check if any opponent piece can capture the king
        const opponentColor = color === 'white' ? 'black' : 'white';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col].piece;
                if (piece && piece.color === opponentColor) {
                    if (piece.isValidMove(this.board, [row, col], kingPos)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isInCheckmate(color) {
        if (!this.isInCheck(color)) return false;

        // Try all possible moves for all pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col].piece;
                if (piece && piece.color === color) {
                    const moves = piece.getValidMoves(this.board, [row, col]);
                    for (const [toRow, toCol] of moves) {
                        // Try the move
                        const originalPiece = this.board[toRow][toCol].piece;
                        this.board[toRow][toCol].piece = piece;
                        this.board[row][col].piece = null;

                        // Check if still in check
                        const stillInCheck = this.isInCheck(color);

                        // Undo the move
                        this.board[row][col].piece = piece;
                        this.board[toRow][toCol].piece = originalPiece;

                        if (!stillInCheck) return false;
                    }
                }
            }
        }
        return true;
    }

    createBoard() {
        const board = [];
        for (let i = 0; i < 8; i++) {
            board[i] = [];
            for (let j = 0; j < 8; j++) {
                board[i][j] = {
                    piece: null,
                    element: null
                };
            }
        }
        return board;
    }

    initializeBoard() {
        // Place pawns
        for (let col = 0; col < 8; col++) {
            this.board[1][col].piece = new Pawn('black');
            this.board[6][col].piece = new Pawn('white');
        }

        // Place other pieces
        const backRow = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];
        for (let col = 0; col < 8; col++) {
            this.board[0][col].piece = new backRow[col]('black');
            this.board[7][col].piece = new backRow[col]('white');
        }
    }

    renderBoard(container) {
        container.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                
                const piece = this.board[row][col].piece;
                if (piece) {
                    square.textContent = piece.symbol;
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                this.board[row][col].element = square;
                container.appendChild(square);
            }
        }
    }

    handleSquareClick(row, col) {
        const square = this.board[row][col];

        if (this.selectedPiece) {
            const [selectedRow, selectedCol] = this.selectedPiece;
            const piece = this.board[selectedRow][selectedCol].piece;

            if (piece && piece.color === this.currentTurn &&
                piece.isValidMove(this.board, [selectedRow, selectedCol], [row, col])) {
                this.movePiece(selectedRow, selectedCol, row, col);
                this.clearHighlights();
                this.selectedPiece = null;
                this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
                document.getElementById('status').textContent = `${this.currentTurn.charAt(0).toUpperCase() + this.currentTurn.slice(1)} to move`;
            } else {
                this.selectSquare(row, col);
            }
        } else {
            this.selectSquare(row, col);
        }
    }

    selectSquare(row, col) {
        const square = this.board[row][col];
        if (square.piece && square.piece.color === this.currentTurn) {
            this.clearHighlights();
            this.selectedPiece = [row, col];
            square.element.classList.add('selected');
            this.showValidMoves(row, col);
        }
    }

    showValidMoves(row, col) {
        const piece = this.board[row][col].piece;
        if (piece) {
            const validMoves = piece.getValidMoves(this.board, [row, col]);
            validMoves.forEach(([r, c]) => {
                this.board[r][c].element.classList.add('valid-move');
            });
        }
    }

    clearHighlights() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = this.board[row][col].element;
                square.classList.remove('selected', 'valid-move');
            }
        }
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol].piece;
        const capturedPiece = this.board[toRow][toCol].piece;

        // Handle en passant
        let enPassantCapture = null;
        if (piece instanceof Pawn) {
            if (Math.abs(fromCol - toCol) === 1 && !capturedPiece) {
                const enPassantRow = fromRow;
                enPassantCapture = this.board[enPassantRow][toCol].piece;
                this.board[enPassantRow][toCol].piece = null;
                this.board[enPassantRow][toCol].element.textContent = '';
            }
            // Set en passant flag for two-square pawn moves
            piece.justMoved = Math.abs(fromRow - toRow) === 2;
        }

        // Update board
        this.board[toRow][toCol].piece = piece;
        this.board[fromRow][fromCol].piece = null;
        piece.hasMoved = true;

        // Check for pawn promotion
        if (piece instanceof Pawn && (toRow === 0 || toRow === 7)) {
            this.showPromotionDialog(toRow, toCol);
        }

        // Update display
        this.board[toRow][toCol].element.textContent = piece.symbol;
        this.board[fromRow][fromCol].element.textContent = '';

        // Play move sound
        this.playMoveSound(!!capturedPiece || !!enPassantCapture);

        // Record move
        this.moveHistory.push({
            from: [fromRow, fromCol],
            to: [toRow, toCol],
            piece: piece,
            captured: capturedPiece || enPassantCapture,
            wasEnPassant: !!enPassantCapture,
            isCheck: this.isInCheck(this.currentTurn === 'white' ? 'black' : 'white'),
            isCheckmate: this.isInCheckmate(this.currentTurn === 'white' ? 'black' : 'white')
        });

        // Update move history display
        this.updateMoveHistory();

        // Check for check/checkmate
        const nextPlayer = this.currentTurn === 'white' ? 'black' : 'white';
        if (this.isInCheck(nextPlayer)) {
            if (this.isInCheckmate(nextPlayer)) {
                document.getElementById('status').textContent = `Checkmate! ${this.currentTurn.charAt(0).toUpperCase() + this.currentTurn.slice(1)} wins!`;
                this.gameOver = true;
            } else {
                document.getElementById('status').textContent = `Check! ${nextPlayer.charAt(0).toUpperCase() + nextPlayer.slice(1)} to move`;
            }
        }
    }

    updateMoveHistory() {
        const movesContainer = document.getElementById('moves');
        const move = this.moveHistory[this.moveHistory.length - 1];
        const moveText = document.createElement('div');
        
        const notation = this.getMoveNotation(move);
        moveText.textContent = `${this.moveHistory.length}. ${notation}`;
        movesContainer.appendChild(moveText);
        movesContainer.scrollTop = movesContainer.scrollHeight;
    }

    getMoveNotation(move) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        const from = `${files[move.from[1]]}${ranks[move.from[0]]}`;
        const to = `${files[move.to[1]]}${ranks[move.to[0]]}`;
        let notation = `${move.piece.symbol}${from}-${to}`;
        if (move.captured) notation += 'x';
        if (move.wasEnPassant) notation += ' e.p.';
        if (move.promotion) notation += `=${move.promotion.symbol}`;
        if (move.isCheckmate) notation += '#';
        else if (move.isCheck) notation += '+';
        return notation;
    }

    showPromotionDialog(row, col) {
        const modal = document.getElementById('promotionModal');
        const color = this.currentTurn;
        modal.style.display = 'flex';

        const handlePromotion = (pieceType) => {
            let newPiece;
            switch (pieceType) {
                case 'queen': newPiece = new Queen(color); break;
                case 'rook': newPiece = new Rook(color); break;
                case 'bishop': newPiece = new Bishop(color); break;
                case 'knight': newPiece = new Knight(color); break;
            }
            this.board[row][col].piece = newPiece;
            this.board[row][col].element.textContent = newPiece.symbol;
            modal.style.display = 'none';
            
            // Update the last move record with promotion information
            const lastMove = this.moveHistory[this.moveHistory.length - 1];
            lastMove.promotion = newPiece;
            this.updateMoveHistory();
        };

        const pieces = modal.querySelectorAll('.piece');
        pieces.forEach(piece => {
            piece.onclick = () => handlePromotion(piece.dataset.piece);
        });
    }
}
