class ChessGame {
    constructor() {
        this.board = new ChessBoard();
        this.timers = {
            white: 300, // 5 minutes in seconds
            black: 300
        };
        this.timerInterval = null;
        this.isFlipped = false;
        this.stats = JSON.parse(localStorage.getItem('chessnexus_stats')) || { wins: 0, losses: 0, draws: 0 };
        this.init();
        this.loadGameFromStorage();
        this.updateStatsDisplay();
      }

    saveGame() {
        const gameState = {
            board: this.board.board.map(row => row.map(square => ({
                piece: square.piece ? {
                    type: square.piece.constructor.name,
                    color: square.piece.color,
                    hasMoved: square.piece.hasMoved,
                    justMoved: square.piece instanceof Pawn ? square.piece.justMoved : undefined
                } : null
            }))),
            currentTurn: this.board.currentTurn,
            moveHistory: this.board.moveHistory,
            timers: this.timers,
            isFlipped: this.isFlipped
        };
        localStorage.setItem('chessnexus_game', JSON.stringify(gameState));
    }

    loadGameFromStorage() {
        const savedGame = localStorage.getItem('chessnexus_game');
        if (savedGame) {
            const gameState = JSON.parse(savedGame);
            
            // Restore board state
            gameState.board.forEach((row, i) => {
                row.forEach((square, j) => {
                    if (square.piece) {
                        const PieceClass = eval(square.piece.type);
            const PieceClasses = { Pawn, Rook, Knight, Bishop, Queen, King };
            gameState.board.forEach((row, i) => {
                row.forEach((square, j) => {
                    if (square.piece) {
                        const PieceClass = PieceClasses[square.piece.type];
                        if (!PieceClass) {
                            console.error('[Chess] Unknown piece type:', square.piece.type);
                            return;
                        }
                        const piece = new PieceClass(square.piece.color);
                        piece.hasMoved = square.piece.hasMoved;
                        if (piece instanceof Pawn) {
                            piece.justMoved = square.piece.justMoved;
                        }
                        this.board.board[i][j].piece = piece;
                    } else {
                        this.board.board[i][j].piece = null;
                    }
                });
            });

            // Restore other game state
            this.board.currentTurn = gameState.currentTurn;
            this.board.moveHistory = gameState.moveHistory;
            this.timers = gameState.timers;
            this.isFlipped = gameState.isFlipped;

            // Update display
            const boardContainer = document.getElementById('chessboard');
            this.board.renderBoard(boardContainer);
            this.updateTimerDisplay();
            this.board.moveHistory.forEach(move => this.board.updateMoveHistory());
        }
    }

    init() {
        // Initialize board
        const boardContainer = document.getElementById('chessboard');
        this.board.renderBoard(boardContainer);
    
        // Initialize controls
        document.getElementById('newGame').addEventListener('click', () => this.newGame());
        document.getElementById('undoMove').addEventListener('click', () => this.undoMove());
        document.getElementById('flipBoard').addEventListener('click', () => this.flipBoard());
        document.getElementById('saveGame').addEventListener('click', () => this.saveGame());
        document.getElementById('loadGame').addEventListener('click', () => this.loadGameFromStorage());
        document.getElementById('resign').addEventListener('click', () => this.resignGame());
    
        // Start timers
        this.startTimers();
      }

    newGame() {
        // Reset board
        this.board = new ChessBoard();
        const boardContainer = document.getElementById('chessboard');
        this.board.renderBoard(boardContainer);
    
        // Reset timers
        this.timers = {
            white: 300,
            black: 300
        };
        this.updateTimerDisplay();
    
        // Reset move history
        document.getElementById('moves').innerHTML = '';
    
        // Reset game status
        document.getElementById('status').textContent = 'White to move';
    
        // Clear any highlights
        this.board.clearHighlights();
    
        // Save new game state
        this.saveGame();
      }
    
      resignGame() {
        if (confirm('Are you sure you want to resign?')) {
          const winner = this.board.currentTurn === 'white' ? 'Black' : 'White';
          document.getElementById('status').textContent = `${winner} wins by resignation!`;
          this.stats[this.board.currentTurn === 'white' ? 'losses' : 'wins']++;
          localStorage.setItem('chessnexus_stats', JSON.stringify(this.stats));
          this.updateStatsDisplay();
          this.gameOver = true;
          clearInterval(this.timerInterval);
        }
      }
    
      updateStatsDisplay() {
        const statsDiv = document.getElementById('stats');
        if (statsDiv) {
          statsDiv.innerHTML = `
            Wins: ${this.stats.wins} | Losses: ${this.stats.losses} | Draws: ${this.stats.draws}
          `;
        }
      }

    undoMove() {
        if (this.board.moveHistory.length > 0) {
            const lastMove = this.board.moveHistory.pop();
            
            // Restore pieces to their original positions
            this.board.board[lastMove.from[0]][lastMove.from[1]].piece = lastMove.piece;
            this.board.board[lastMove.to[0]][lastMove.to[1]].piece = lastMove.captured;

            // Update display
            this.board.board[lastMove.from[0]][lastMove.from[1]].element.textContent = lastMove.piece.symbol;
            this.board.board[lastMove.to[0]][lastMove.to[1]].element.textContent = lastMove.captured ? lastMove.captured.symbol : '';

            // Switch turn back
            this.board.currentTurn = this.board.currentTurn === 'white' ? 'black' : 'white';
            document.getElementById('status').textContent = `${this.board.currentTurn.charAt(0).toUpperCase() + this.board.currentTurn.slice(1)} to move`;

            // Update move history display
            const movesContainer = document.getElementById('moves');
            if (movesContainer.lastChild) {
                movesContainer.removeChild(movesContainer.lastChild);
            }
        }
    }

    flipBoard() {
        this.isFlipped = !this.isFlipped;
        const boardContainer = document.getElementById('chessboard');
        boardContainer.style.transform = this.isFlipped ? 'rotate(180deg)' : '';
        
        // Rotate all squares
        const squares = boardContainer.getElementsByClassName('square');
        for (let square of squares) {
            square.style.transform = this.isFlipped ? 'rotate(180deg)' : '';
        }
    }

    startTimers() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            if (this.timers[this.board.currentTurn] > 0) {
                this.timers[this.board.currentTurn]--;
                this.updateTimerDisplay();
            } else {
                this.handleTimeout();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        ['white', 'black'].forEach(color => {
            const minutes = Math.floor(this.timers[color] / 60);
            const seconds = this.timers[color] % 60;
            document.querySelector(`.${color}-timer`).textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        });
    }

    handleTimeout() {
        clearInterval(this.timerInterval);
        const winner = this.board.currentTurn === 'white' ? 'Black' : 'White';
        document.getElementById('status').textContent = `${winner} wins on time!`;
        this.stats[this.board.currentTurn === 'white' ? 'losses' : 'wins']++;
        localStorage.setItem('chessnexus_stats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
        this.gameOver = true;
      }
}

// Mode selection functionality
function setupModeSelection() {
    const modeSelection = document.getElementById('mode-selection');
    const gameContainer = document.querySelector('.game-container');
    const modeButtons = document.querySelectorAll('.mode-options .btn');
    const startButton = document.getElementById('start-selected-mode');

    let selectedMode = 'practice';

    // Set up mode button selection
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modeButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedMode = button.dataset.mode;
        });
    });

    // Set up start button
    startButton.addEventListener('click', () => {
        modeSelection.style.display = 'none';
        gameContainer.classList.add('show');

        // Initialize game with selected mode
        const game = new ChessGame(selectedMode);
        window.currentChessGame = game;
    });

    // Show mode selection initially
    modeSelection.style.display = 'flex';
    gameContainer.classList.remove('show');
}

// Initialize mode selection when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupModeSelection();
});