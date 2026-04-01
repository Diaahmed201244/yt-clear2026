document.addEventListener("DOMContentLoaded", function() {

// Supabase gambling functions
const firebase = window.__SUPABASE_CLIENT__ || (window.Auth && window.Auth.client);
async function getCurrentUser() {
  if (!firebase || !firebase.auth) return null;
  const { data: { user } } = await firebase.auth.getUser();
  return user || null;
}

async function getUserBalance(userId) {
  if (!firebase) return 0;
  const { data, error } = await firebase
    .from('balances')
    .select('codes')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching balance:', error);
    return 0;
  }
  return data ? data.codes : 0;
}

async function updateUserBalance(userId, newCodes) {
  if (!firebase) return;
  const { error } = await firebase
    .from('balances')
    .upsert({ user_id: userId, codes: newCodes, updated_at: new Date().toISOString() });
  if (error) console.error('Error updating balance:', error);
}

async function handleChessGamble(result) {
  const user = await getCurrentUser();
  if (!user) {
    alert('Please log in to play with gambling.');
    return;
  }
  const userId = user.id;
  const currentCodes = await getUserBalance(userId);
  let newCodes;
  if (result === 'win') {
    newCodes = currentCodes + 2;
    alert('Congratulations! You won 2 codes.');
  } else if (result === 'lose') {
    newCodes = currentCodes - 1;
    if (newCodes < 0) newCodes = 0;
    alert('You lost 1 code.');
  } else {
    return; // draw, no change
  }
  await updateUserBalance(userId, newCodes);
}
class ChessGame {
  constructor() {
    this.canvas = document.getElementById("chessBoard");
    this.ctx = this.canvas.getContext("2d");
    this.boardSize = 8;
    this.tileSize = this.canvas.width / this.boardSize;

    this.currentPlayer = Math.random() < 0.5 ? "white" : "black";
    this.isPlayerTurn = this.currentPlayer === "white";

    this.selectedPiece = null;
    this.gameOver = false;

    this.board = null;
    this.moveHistory = [];
    this.lastMovedPawn = null;

    // Castling rights
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    };

    this.bayerMatrix = [
      [0, 48, 12, 60, 3, 51, 15, 63],
      [32, 16, 44, 28, 35, 19, 47, 31],
      [8, 56, 4, 52, 11, 59, 7, 55],
      [40, 24, 36, 20, 43, 27, 39, 23],
      [2, 50, 14, 62, 1, 49, 13, 61],
      [34, 18, 46, 30, 33, 17, 45, 29],
      [10, 58, 6, 54, 9, 57, 5, 53],
      [42, 26, 38, 22, 41, 25, 37, 21]
    ];

    this.aiDifficulties = {
      easy: {
        moveStrategy: "random",
        lookahead: 1
      },
      medium: {
        moveStrategy: "capture_priority",
        lookahead: 3
      },
      hard: {
        moveStrategy: "strategic_evaluation",
        lookahead: 4
      }
    };
    this.aiDifficulty = "medium";

    this.initBoard = this.initBoard.bind(this);

    this.turn = 0;
    this.initializeGameState();
  }

  initializeGameState() {
    this.initBoard();
    this.setupEventListeners();

    this.currentPlayer = Math.random() < 0.5 ? "white" : "black";
    this.isPlayerTurn = this.currentPlayer === "white";

    if (this.currentPlayer === "black") {
      this.isPlayerTurn = false;
      setTimeout(() => this.computerMove(), 1500);
    }
    this.updateGameStatus();
  }

  async initBoard() {
    const modeSelect = document.getElementById('mode');
    const mode = modeSelect ? modeSelect.value : 'single';
    if (mode === 'single') {
      if (!confirm('Play single-player with gambling? Win +2 codes, lose -1 code.')) {
        return; // cancel or switch
      }
    }
    this.board = Array(8)
      .fill()
      .map(() => Array(8).fill(null));
    this.setupInitialPieces();
    this.renderBoard();
    this.selectedPiece = null;
    this.gameOver = false;
    this.moveHistory = [];
    this.lastMovedPawn = null;

    this.currentPlayer = Math.random() < 0.5 ? "white" : "black";
    this.isPlayerTurn = this.currentPlayer === "white";

    if (this.currentPlayer === "black") {
      this.isPlayerTurn = false;
      setTimeout(() => this.computerMove(), 1500);
    }
    this.updateGameStatus();
  }

  setupEventListeners() {
    const newGameButton = document.getElementById("new-game");
    if (newGameButton) {
      newGameButton.addEventListener("click", this.initBoard.bind(this));
    } else {
      console.warn("New Game button not found");
    }

    const resetButton = document.getElementById("resetBtn");
    if (resetButton) {
      resetButton.addEventListener("click", this.initBoard.bind(this));
    } else {
      console.warn("Reset button not found");
    }

    // Handle invalid moves: Add visual/audio feedback
    this.invalidMoveFeedback = () => {
      // Flash invalid square red briefly
      if (this.selectedPiece) {
        const ctx = this.ctx;
        const tileX = this.selectedPiece.x * this.tileSize;
        const tileY = this.selectedPiece.y * this.tileSize;
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
        setTimeout(() => this.renderBoard(), 200);
      }
    };

    const undoButton = document.getElementById("undoBtn");
    if (undoButton) {
      undoButton.addEventListener("click", this.undoMove.bind(this));
    } else {
      console.warn("Undo button not found");
    }

    const difficultySelect = document.getElementById("difficulty");
    if (difficultySelect) {
      difficultySelect.addEventListener("change", (e) => {
        this.aiDifficulty = e.target.value;
      });
    } else {
      console.warn("Difficulty select not found");
    }

    this.canvas.addEventListener("click", this.handleBoardClick.bind(this));

    // Show instructions modal on load
    const instructionsModal = document.getElementById("instructions-modal");
    if (instructionsModal) {
      instructionsModal.style.display = "flex";
      const startBtn = document.getElementById("start-game-btn");
      if (startBtn) {
        startBtn.addEventListener("click", () => {
          instructionsModal.style.display = "none";
          document.getElementById("game-container").classList.remove("hidden");
          this.initBoard();
        });
      }
    }
  }

  setupInitialPieces() {
    const backRowPieces = [
      { type: "rook", piece: "♜" },
      { type: "knight", piece: "♞" },
      { type: "bishop", piece: "♝" },
      { type: "queen", piece: "♛" },
      { type: "king", piece: "♚" },
      { type: "bishop", piece: "♝" },
      { type: "knight", piece: "♞" },
      { type: "rook", piece: "♜" }
    ];

    for (let x = 0; x < 8; x++) {
      this.board[0][x] = {
        ...backRowPieces[x],
        color: "black",
        hasMoved: false
      };
      this.board[1][x] = {
        piece: "♟",
        type: "pawn",
        color: "black",
        hasMoved: false
      };
    }

    for (let x = 0; x < 8; x++) {
      this.board[6][x] = {
        piece: "♙",
        type: "pawn",
        color: "white",
        hasMoved: false
      };
      this.board[7][x] = {
        ...backRowPieces[x],
        color: "white",
        piece: backRowPieces[x].piece.toUpperCase(),
        hasMoved: false
      };
    }

    this.lastMovedPawn = null;
  }

  renderBoard() {
    this.ctx.fillStyle = "#F0F0F0";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        this.renderTile(x, y, false);
      }
    }

    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const ditherImageData = this.applyBayerDithering(imageData);
    this.ctx.putImageData(ditherImageData, 0, 0);

    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        this.renderPiece(x, y);
      }
    }
  }

  renderTile(x, y, renderPiece = true) {
    const isDark = (x + y) % 2 === 1;

    this.ctx.fillStyle = isDark ? "#505050" : "#989898";
    this.ctx.fillRect(
      x * this.tileSize,
      y * this.tileSize,
      this.tileSize,
      this.tileSize
    );

    const piece = this.board[y][x];
    if (renderPiece && piece) {
      this.ctx.fillStyle = piece.color === "white" ? "#FFFFFF" : "#000000";

      const fontSize = Math.floor(this.tileSize * 0.6);
      this.ctx.font = `${fontSize}px "Press Start 2P", monospace`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      const centerX = x * this.tileSize + this.tileSize / 2;
      const centerY =
        y * this.tileSize + this.tileSize / 2 + fontSize * 0.08 - 5;

      this.ctx.fillText(piece.piece, centerX, centerY);
    }
  }

  renderPiece(x, y) {
    const piece = this.board[y][x];
    if (piece) {
      this.ctx.fillStyle = piece.color === "white" ? "#FFFFFF" : "#000000";
      const fontSize = Math.floor(this.tileSize * 0.6);
      this.ctx.font = `${fontSize}px "Press Start 2P", monospace`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      const centerX = x * this.tileSize + this.tileSize / 2;
      const centerY = y * this.tileSize + this.tileSize / 2 + fontSize * 0.08 - 5;
      this.ctx.fillText(piece.piece, centerX, centerY);
    }
  }

  handleBoardClick(event) {
    if (this.gameOver || !this.isPlayerTurn || this.currentPlayer !== "white")
      return;

    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);

    if (x < 0 || x >= 8 || y < 0 || y >= 8) return;

    const clickedPiece = this.board[y][x];

    if (this.selectedPiece) {
      if (this.isValidMove(this.selectedPiece, x, y)) {
        if (this.wouldMoveLeaveKingInCheck(this.selectedPiece, x, y)) {
          this.selectedPiece = null;
          this.renderBoard();
          return;
        }

        this.movePiece(this.selectedPiece, x, y);
        this.selectedPiece = null;
        this.switchPlayer();

        this.isPlayerTurn = false;

        setTimeout(() => this.computerMove(), 500);
      } else {
        this.selectedPiece = null;
      }
      this.renderBoard();
    } else if (clickedPiece && clickedPiece.color === this.currentPlayer) {
      this.selectedPiece = { piece: clickedPiece, x, y };
      this.renderBoard(); // Highlight selected
    }

    this.updateGameStatus();
  }

  isValidMove(selectedPiece, toX, toY) {
    const { piece, x, y } = selectedPiece;
    const targetSquare = this.board[toY][toX];

    if (toX < 0 || toX >= 8 || toY < 0 || toY >= 8) {
      return false;
    }

    if (targetSquare && targetSquare.color === piece.color) {
      return false;
    }

    if (!this.isPathClear(x, y, toX, toY)) {
      return false;
    }

    switch (piece.type) {
      case "pawn":
        return this.validatePawnMove(piece, x, y, toX, toY);
      case "rook":
        return this.validateRookMove(x, y, toX, toY);
      case "knight":
        return this.validateKnightMove(x, y, toX, toY);
      case "bishop":
        return this.validateBishopMove(x, y, toX, toY);
      case "queen":
        return this.validateQueenMove(x, y, toX, toY);
      case "king":
        return this.validateKingMove(piece, x, y, toX, toY);
      default:
        return false;
    }
  }

  validatePawnMove(piece, fromX, fromY, toX, toY) {
    const direction = piece.color === "white" ? -1 : 1;
    const startingRow = piece.color === "white" ? 6 : 1;
    const targetSquare = this.board[toY][toX];

    if (toX === fromX) {
      if (
        fromY === startingRow &&
        toY === fromY + 2 * direction &&
        !this.board[fromY + direction][fromX] &&
        !targetSquare
      ) {
        return true;
      }
      return toY === fromY + direction && !targetSquare;
    }

    if (Math.abs(toX - fromX) === 1 && toY === fromY + direction) {
      if (targetSquare && targetSquare.color !== piece.color) {
        return true;
      }

      // En passant fix: Check if the target y matches the en passant position
      if (
        !targetSquare &&
        this.lastMovedPawn &&
        this.lastMovedPawn.x === toX &&
        this.lastMovedPawn.y === fromY &&
        this.lastMovedPawn.movedTwo &&
        this.turn - this.lastMovedPawn.turn === 1
      ) {
        return true;
      }
    }

    return false;
  }

  validateRookMove(fromX, fromY, toX, toY) {
    return fromX === toX || fromY === toY;
  }

  validateKnightMove(fromX, fromY, toX, toY) {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
  }

  validateBishopMove(fromX, fromY, toX, toY) {
    return Math.abs(toX - fromX) === Math.abs(toY - fromY);
  }

  validateQueenMove(fromX, fromY, toX, toY) {
    return (
      this.validateRookMove(fromX, fromY, toX, toY) ||
      this.validateBishopMove(fromX, fromY, toX, toY)
    );
  }

  validateKingMove(piece, fromX, fromY, toX, toY) {
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);

    if (dx <= 1 && dy <= 1) {
      return true;
    }

    if (!piece.hasMoved && dy === 0 && dx === 2) {
      const direction = toX > fromX ? 1 : -1;
      const rookX = direction === 1 ? 7 : 0;
      const rook = this.board[fromY][rookX];

      if (!rook || rook.type !== "rook" || rook.hasMoved) {
        return false;
      }

      for (let x = fromX + direction; x !== rookX; x += direction) {
        if (this.board[fromY][x]) {
          return false;
        }
      }

      const step = direction;
      for (let x = fromX + step; x <= toX; x += step) {
        if (this.isSquareUnderAttack(x, fromY, piece.color)) {
          return false;
        }
      }
      const newRookX = toX > fromX ? toX - 1 : toX + 1;
      if (this.isSquareUnderAttack(newRookX, fromY, piece.color)) {
        return false;
      }

      // Check if rook squares are safe
      if (this.isSquareUnderAttack(rookX, fromY, piece.color)) {
        return false;
      }

      return true;
    }

    return false;
  }

  isSquareUnderAttack(x, y, kingColor) {
    const opponentColor = kingColor === "white" ? "black" : "white";

    for (let fromY = 0; fromY < 8; fromY++) {
      for (let fromX = 0; fromX < 8; fromX++) {
        const piece = this.board[fromY][fromX];
        if (piece && piece.color === opponentColor) {
          if (
            this.canPieceAttackSquare(
              this.board,
              { piece, x: fromX, y: fromY },
              x,
              y
            )
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  canPieceAttackSquare(board, selectedPiece, targetX, targetY) {
    const { piece, x, y } = selectedPiece;

    switch (piece.type) {
      case "pawn":
        const direction = piece.color === "white" ? -1 : 1;
        return Math.abs(targetX - x) === 1 && targetY === y + direction;

      case "rook":
        if (targetX !== x && targetY !== y) return false;
        return this.isPathClearOnBoard(board, x, y, targetX, targetY);

      case "knight":
        const dx = Math.abs(targetX - x);
        const dy = Math.abs(targetY - y);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);

      case "bishop":
        if (Math.abs(targetX - x) !== Math.abs(targetY - y)) return false;
        return this.isPathClearOnBoard(board, x, y, targetX, targetY);

      case "queen":
        if (
          targetX !== x &&
          targetY !== y &&
          Math.abs(targetX - x) !== Math.abs(targetY - y)
        )
          return false;
        return this.isPathClearOnBoard(board, x, y, targetX, targetY);

      case "king":
        return Math.abs(targetX - x) <= 1 && Math.abs(targetY - y) <= 1;

      default:
        return false;
    }
  }

  isPathClear(fromX, fromY, toX, toY) {
    if (
      fromX < 0 ||
      fromX >= 8 ||
      fromY < 0 ||
      fromY >= 8 ||
      toX < 0 ||
      toX >= 8 ||
      toY < 0 ||
      toY >= 8
    ) {
      return false;
    }

    const piece = this.board[fromY][fromX];

    if (!piece) {
      return false;
    }

    if (piece.type === "knight") return true;

    if (fromX === toX && fromY === toY) return true;

    const dx = Math.sign(toX - fromX);
    const dy = Math.sign(toY - fromY);
    let x = fromX + dx;
    let y = fromY + dy;

    while (x !== toX || y !== toY) {
      if (x < 0 || x >= 8 || y < 0 || y >= 8) {
        break;
      }

      if (this.board[y][x]) {
        return false;
      }
      x += dx;
      y += dy;
    }

    return true;
  }

  movePiece(selectedPiece, toX, toY, temp = false) {
    const { piece, x, y } = selectedPiece;

    const capturedPiece = this.board[toY][toX];
    if (capturedPiece && capturedPiece.type === "king") {
      const winMessage = `${piece.color.toUpperCase()} wins by capturing the ${
        capturedPiece.color
      } king!`;
      this.handleGameEnd(winMessage);
      return false;
    }

    // En passant capture fix: Capture the pawn behind the en passant square
    if (piece.type === "pawn" && Math.abs(toX - x) === 1 && !capturedPiece) {
      if (
        this.lastMovedPawn &&
        this.lastMovedPawn.x === toX &&
        this.lastMovedPawn.y === fromY &&
        this.lastMovedPawn.movedTwo &&
        this.turn - this.lastMovedPawn.turn === 1
      ) {
        const capturedPawnY = piece.color === "white" ? toY + 1 : toY - 1;
        this.board[capturedPawnY][this.lastMovedPawn.x] = null;
        this.lastMovedPawn = null;
      }
    }

    // Set lastMovedPawn for double move
    if (piece.type === "pawn" && Math.abs(toY - y) === 2) {
      this.lastMovedPawn = {
        x: toX,
        y: toY,
        movedTwo: true,
        turn: this.turn
      };
    } else {
      this.lastMovedPawn = null;
    }

    // Castling rook move (already implemented correctly)
    if (piece.type === "king" && Math.abs(toX - x) === 2) {
      const rookX = toX > x ? 7 : 0;
      const rookNewX = toX > x ? toX - 1 : toX + 1;
      const rook = this.board[y][rookX];

      this.board[y][rookNewX] = { ...rook, hasMoved: true };
      this.board[y][rookX] = null;

      // Update castling rights
      const color = piece.color;
      this.castlingRights[color].kingside = false;
      this.castlingRights[color].queenside = false;
    }

    if (piece.type === "pawn" && (toY === 0 || toY === 7)) {
      piece.type = "queen";
      piece.piece = piece.color === "white" ? "♕" : "♛";
    }
  
    piece.hasMoved = true;

    this.board[toY][toX] = piece;
    this.board[y][x] = null;

    if (!temp) {
      this.moveHistory.push({
        piece: { ...piece, hasMoved: false }, // Save original
        from: { x, y },
        to: { toX, toY },
        capturedPiece: capturedPiece,
        lastMovedPawn: { ...this.lastMovedPawn }
      });
    }

    return true;
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
  }

  undoMove() {
    if (this.moveHistory.length > 0 && this.isPlayerTurn) {
      const lastMove = this.moveHistory.pop();
      const { piece, from, to, capturedPiece, lastMovedPawn } = lastMove;
      this.board[from.y][from.x] = piece;
      this.board[to.y][to.x] = capturedPiece;
      piece.hasMoved = false;
      this.lastMovedPawn = lastMovedPawn;
      this.switchPlayer();
      this.turn++;
      this.isPlayerTurn = true;
      this.turn -= 1;
      this.renderBoard();
      this.updateGameStatus();
    }
  }

  async handleGameEnd(reason) {
    this.gameOver = true;
    const statusElement = document.getElementById("game-status");
    const modalContent = this.createGameEndModal(reason);

    if (statusElement) {
      statusElement.textContent = reason;
    }
    console.log(`Game ended: ${reason}`);

    // Handle gambling if single-player
    const modeSelect = document.getElementById('mode');
    const mode = modeSelect ? modeSelect.value : 'single';
    if (mode === 'single') {
      let result = 'draw';
      if (reason.includes('WHITE wins') || reason.includes('checkmate')) {
        result = 'win';
      } else if (reason.includes('BLACK wins')) {
        result = 'lose';
      }
      await handleChessGamble(result);
    }
  }

  createGameEndModal(reason) {
    const existingModal = document.getElementById("game-end-modal");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.id = "game-end-modal";
    modal.classList.add("modal");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    const title = document.createElement("h1");
    title.textContent = reason.includes("white")
      ? "BLACK WINS!"
      : "WHITE WINS!";

    const message = document.createElement("p");
    message.textContent = reason;

    const newGameButton = document.createElement("button");
    newGameButton.textContent = "New Game";
    newGameButton.addEventListener("click", () => {
      modal.remove();
      this.initBoard();
    });

    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(newGameButton);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    return modal;
  }

  computerMove() {
    if (this.gameOver) return;

    if (this.currentPlayer === "black" && !this.isPlayerTurn) {
      try {   
        const legalMoves = this.findLegalMoves("black");

        if (legalMoves.length === 0) {
          if (this.isKingInCheck("black")) {
            this.handleGameEnd("WHITE wins by checkmate!");
          } else {
            this.handleGameEnd("Stalemate! The game is a draw.");
          }
          return;
        }

        const difficulty = this.aiDifficulties[this.aiDifficulty];
        let bestMove;

        switch (difficulty.moveStrategy) {
          case "random":
            bestMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            break;
          case "capture_priority":
            bestMove = this.selectBestCaptureMove(legalMoves);
            break;
          case "strategic_evaluation":
            bestMove = this.minimaxRoot(5, true); // Improve AI: Increase minimax depth to 5 for better lookahead
            break;
        }

        if (bestMove) {
          const moveSuccess = this.movePiece(
            { piece: bestMove.piece, x: bestMove.fromX, y: bestMove.fromY },
            bestMove.toX,
            bestMove.toY
          );

          if (moveSuccess) {
            this.switchPlayer();
            this.isPlayerTurn = true;

            const whiteLegalMoves = this.findLegalMoves("white");
            if (whiteLegalMoves.length === 0) {
              if (this.isKingInCheck("white")) {
                this.handleGameEnd("BLACK wins by checkmate!");
              } else {
                this.handleGameEnd("Stalemate! The game is a draw.");
              }
            }
          }
        }
      } catch (error) {
        console.warn("AI move error, falling back to random:", error);
        const legalMoves = this.findLegalMoves("black");
        if (legalMoves.length > 0) {
          const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
          this.movePiece(
            { piece: randomMove.piece, x: randomMove.fromX, y: randomMove.fromY },
            randomMove.toX,
            randomMove.toY
          );
          this.switchPlayer();
          this.isPlayerTurn = true;
        }
      }

      this.renderBoard();
      this.updateGameStatus();
    }
  }

  selectBestCaptureMove(moves) {
    const captureMoves = moves.filter(
      (move) =>
        this.board[move.toY][move.toX] &&
        this.board[move.toY][move.toX].color === "white"
    );

    return captureMoves.length > 0
      ? this.selectBestMove(captureMoves)
      : moves[Math.floor(Math.random() * moves.length)];
  }

  minimaxRoot(depth, isMaximizingPlayer) {
    let bestMove = null;
    let bestValue = isMaximizingPlayer ? -Infinity : Infinity;
    const legalMoves = this.findLegalMoves("black");
    for (let param of legalMoves) {
      const move = { piece: param.piece, fromX: param.fromX, fromY: param.fromY, toX: param.toX, toY: param.toY };
      const oldBoard = JSON.parse(JSON.stringify(this.board));
      const oldLastMovedPawn = this.lastMovedPawn;
      const oldTurn = this.turn;
      this.movePiece(move, move.toX, move.toY, true);
      const boardValue = this.minimax(depth - 1, -Infinity, Infinity, false, oldBoard, oldLastMovedPawn, oldTurn);
      this.board = oldBoard;
      this.lastMovedPawn = oldLastMovedPawn;
      this.turn = oldTurn;
      if (isMaximizingPlayer) {
        if (boardValue > bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }
      } else {
        if (boardValue < bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }
      }
    }
    return bestMove || legalMoves[Math.floor(Math.random() * legalMoves.length)]; // Fallback to random if no best
  }

  minimax(depth, alpha, beta, isMaximizingPlayer, tempBoard, tempLastMovedPawn, tempTurn) {
    if (depth === 0) {
      return this.calculateBoardScoreWithBoard(tempBoard);
    }

    const legalMoves = this.getLegalMovesFromBoard(tempBoard, "black", tempLastMovedPawn, tempTurn);
    if (legalMoves.length === 0) {
      if (this.isKingInCheckWithBoard(tempBoard, "black")) {
        return -10000;
      }
      return 0;
    }

    if (isMaximizingPlayer) {
      let maxEval = -Infinity;
      for (let param of legalMoves) {
        const move = { piece: param.piece, fromX: param.fromX, fromY: param.fromY, toX: param.toX, toY: param.toY };
        const newBoard = JSON.parse(JSON.stringify(tempBoard));
        this.movePieceWithBoard(newBoard, move, move.toX, move.toY, true, tempLastMovedPawn, tempTurn);
        const evalScore = this.minimax(depth - 1, alpha, beta, false, newBoard, this.lastMovedPawn, this.turn);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) {
          break;
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let param of legalMoves) {
        const move = { piece: param.piece, fromX: param.fromX, fromY: param.fromY, toX: param.toX, toY: param.toY };
        const newBoard = JSON.parse(JSON.stringify(tempBoard));
        this.movePieceWithBoard(newBoard, move, move.toX, move.toY, true, tempLastMovedPawn, tempTurn);
        const evalScore = this.minimax(depth - 1, alpha, beta, true, newBoard, this.lastMovedPawn, this.turn);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) {
          break;
        }
      }
      return minEval;
    }
  }

  getLegalMovesFromBoard(board, color, lastMovedPawn, turn) {
    // Simplified: return all possible moves without check validation for speed
    const moves = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.color === color) {
          for (let toY = 0; toY < 8; toY++) {
            for (let toX = 0; toX < 8; toX++) {
              if (this.isValidMoveWithBoard(piece, x, y, toX, toY, board, lastMovedPawn, turn)) {
                moves.push({ piece, fromX: x, fromY: y, toX, toY });
              }
            }
          }
        }
      }
    }
    return moves;
  }

  isValidMoveWithBoard(piece, fromX, fromY, toX, toY, board, lastMovedPawn, turn) {
    // Simplified validation without full check logic for AI speed
    const targetSquare = board[toY][toX];
    if (targetSquare && targetSquare.color === piece.color) return false;
    // Basic path clear and type rules (reuse existing logic where possible)
    switch (piece.type) {
      case "pawn":
        return this.validatePawnMoveWithBoard(piece, fromX, fromY, toX, toY, board, lastMovedPawn, turn);
      // Add other cases similarly
      default:
        return this.isPathClearWithBoard(fromX, fromY, toX, toY, board);
    }
  }

  validatePawnMoveWithBoard(piece, fromX, fromY, toX, toY, board, lastMovedPawn, turn) {
    // Similar to validatePawnMove but with params
    const direction = piece.color === "white" ? -1 : 1;
    const startingRow = piece.color === "white" ? 6 : 1;
    const targetSquare = board[toY][toX];

    if (toX === fromX) {
      if (
        fromY === startingRow &&
        toY === fromY + 2 * direction &&
        !board[fromY + direction][fromX] &&
        !targetSquare
      ) {
        return true;
      }
      return toY === fromY + direction && !targetSquare;
    }

    if (Math.abs(toX - fromX) === 1 && toY === fromY + direction) {
      if (targetSquare && targetSquare.color !== piece.color) {
        return true;
      }

      if (
        !targetSquare &&
        lastMovedPawn &&
        lastMovedPawn.x === toX &&
        lastMovedPawn.y === fromY + direction &&
        lastMovedPawn.movedTwo &&
        turn - lastMovedPawn.turn === 1
      ) {
        return true;
      }
    }

    return false;
  }

  isPathClearWithBoard(fromX, fromY, toX, toY, board) {
    // Similar to isPathClear but with board param
    const dx = Math.sign(toX - fromX);
    const dy = Math.sign(toY - fromY);
    let x = fromX + dx;
    let y = fromY + dy;

    while (x !== toX || y !== toY) {
      if (board[y][x]) {
        return false;
      }
      x += dx;
      y += dy;
    }

    return true;
  }

  movePieceWithBoard(board, selectedPiece, toX, toY, temp = false, lastMovedPawn, turn) {
    // Similar to movePiece but with board param, update lastMovedPawn
    const { piece, x, y } = selectedPiece;
    const capturedPiece = board[toY][toX];

    // En passant and other logic...

    piece.hasMoved = true;
    board[toY][toX] = piece;
    board[y][x] = null;

    if (piece.type === "pawn" && Math.abs(toY - y) === 2) {
      lastMovedPawn = {
        x: toX,
        y: toY,
        movedTwo: true,
        turn
      };
    }

    if (!temp) {
      turn += 1;
    }

    return true;
  }

  calculateBoardScoreWithBoard(board) {
    const pieceValues = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0
    };
    let score = 0;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          score += value * (piece.color === "black" ? 1 : -1);
          // Improve AI: Add positional bonuses (center control, pawn advancement)
          if (piece.color === "black") {
            score += this.getPositionalBonus(piece, x, y, true);
          } else {
            score -= this.getPositionalBonus(piece, x, y, false);
          }
        }
      }
    }
    return score;
  }

  isKingInCheckWithBoard(board, color) {
    // Similar to isKingInCheck but with board param
    let kingX, kingY;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.type === "king" && piece.color === color) {
          kingX = x;
          kingY = y;
          break;
        }
      }
      if (kingX !== undefined) break;
    }

    if (kingX === undefined) return false;

    const opponentColor = color === "white" ? "black" : "white";

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.color === opponentColor) {
          if (
            this.canPieceCaptureKing(board, { piece, x, y }, kingX, kingY)
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  evaluateBestStrategicMove(moves) {
    return this.minimaxRoot(4, true); // Use minimax for hard, depth 4
  }

  calculateMoveScore(move) {
    const pieceValues = {
      king: 1000,
      queen: 9,
      rook: 5,
      bishop: 3,
      knight: 3,
      pawn: 1
    };

    let score = 0;
    const targetPiece = this.board[move.toY][move.toX];

    if (targetPiece) {
      score += pieceValues[targetPiece.type] * 2;
    }

    const centerBonus = this.isCentralSquare(move.toX, move.toY) ? 2 : 0;
    score += centerBonus;

    const developmentBonus = this.isPieceDeveloped(move) ? 1 : 0;
    score += developmentBonus;

    return score;
  }

  calculateBoardScore() {
    const pieceValues = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0
    };
    let score = 0;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.board[y][x];
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          score += value * (piece.color === "black" ? 1 : -1);

          // Positional bonuses
          if (piece.color === "black") {
            score += this.getPositionalBonus(piece, x, y, true);
          } else {
            score -= this.getPositionalBonus(piece, x, y, false);
          }
        }
      }
    }
    return score;
  }

  getPositionalBonus(piece, x, y, isBlack) {
    let bonus = 0;
    // Center control
    if (x >= 3 && x <= 4 && y >= 3 && y <= 4) bonus += 0.5;

    // Pawn advancement
    if (piece.type === "pawn") {
      const advanced = isBlack ? (7 - y) / 7 : y / 7;
      bonus += advanced * 0.5;
    }

    // Knight/bishop development
    if (["knight", "bishop"].includes(piece.type) && y !== (isBlack ? 0 : 7)) bonus += 0.3;

    return bonus;
  }

  isCentralSquare(x, y) {
    return x >= 2 && x <= 5 && y >= 2 && y <= 5;
  }

  isPieceDeveloped(move) {
    const startingBackRows = { white: 7, black: 0 };
    return move.fromY !== startingBackRows[move.piece.color];
  }

  findAllPossibleMoves(color) {
    const moves = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.board[y][x];
        if (piece && piece.color === color) {
          for (let toY = 0; toY < 8; toY++) {
            for (let toX = 0; toX < 8; toX++) {
              try {   
                if (this.isValidMove({ piece, x, y }, toX, toY)) {
                  moves.push({ piece, fromX: x, fromY: y, toX, toY });
                }
              } catch (error) {
                // Skip invalid move silently
              }
            }
          }
        }
      }
    }
    return moves;
  }

  findLegalMoves(color) {
    const allMoves = this.findAllPossibleMoves(color);
    return allMoves.filter((move) => {
      return !this.wouldMoveLeaveKingInCheck(
        { piece: move.piece, x: move.fromX, y: move.fromY },
        move.toX,
        move.toY
      );
    });
  }

  wouldMoveLeaveKingInCheck(selectedPiece, toX, toY) {
    const { piece, x, y } = selectedPiece;
    const pieceColor = piece.color;

    const tempBoard = JSON.parse(JSON.stringify(this.board));

    tempBoard[toY][toX] = tempBoard[y][x];
    tempBoard[y][x] = null;

    let kingX, kingY;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const boardPiece = tempBoard[y][x];
        if (
          boardPiece &&
          boardPiece.type === "king" &&
          boardPiece.color === pieceColor
        ) {
          kingX = x;
          kingY = y;
          break;
        }
      }
      if (kingX !== undefined) break;
    }

    if (kingX === undefined) return false;

    const opponentColor = pieceColor === "white" ? "black" : "white";

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const boardPiece = tempBoard[y][x];
        if (boardPiece && boardPiece.color === opponentColor) {
          if (
            this.canPieceCaptureKing(
              tempBoard,
              { piece: boardPiece, x, y },
              kingX,
              kingY
            )
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  canPieceCaptureKing(board, selectedPiece, kingX, kingY) {
    const { piece, x, y } = selectedPiece;

    switch (piece.type) {
      case "pawn":
        const direction = piece.color === "white" ? -1 : 1;
        return Math.abs(kingX - x) === 1 && kingY === y + direction;

      case "rook":
        if (kingX !== x && kingY !== y) return false;
        return this.isPathClearOnBoard(board, x, y, kingX, kingY);

      case "knight":
        const dx = Math.abs(kingX - x);
        const dy = Math.abs(kingY - y);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);

      case "bishop":
        if (Math.abs(kingX - x) !== Math.abs(kingY - y)) return false;
        return this.isPathClearOnBoard(board, x, y, kingX, kingY);

      case "queen":
        if (
          kingX !== x &&
          kingY !== y &&
          Math.abs(kingX - x) !== Math.abs(kingY - y)
        )
          return false;
        return this.isPathClearOnBoard(board, x, y, kingX, kingY);

      case "king":
        return Math.abs(kingX - x) <= 1 && Math.abs(kingY - y) <= 1;

      default:
        return false;
    }
  }

  isPathClearOnBoard(board, fromX, fromY, toX, toY) {
    const dx = Math.sign(toX - fromX);
    const dy = Math.sign(toY - fromY);
    let x = fromX + dx;
    let y = fromY + dy;

    while (x !== toX || y !== toY) {
      if (board[y][x]) {
        return false;
      }
      x += dx;
      y += dy;
    }

    return true;
  }

  isKingInCheck(color) {
    let kingX, kingY;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.board[y][x];
        if (piece && piece.type === "king" && piece.color === color) {
          kingX = x;
          kingY = y;
          break;
        }
      }
      if (kingX !== undefined) break;
    }

    if (kingX === undefined) return false;

    const opponentColor = color === "white" ? "black" : "white";

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = this.board[y][x];
        if (piece && piece.color === opponentColor) {
          if (
            this.canPieceCaptureKing(this.board, { piece, x, y }, kingX, kingY)
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  applyBayerDithering(imageData) {
    const data = imageData.data;
    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const index = (y * this.canvas.width + x) * 4;
        const threshold = this.bayerMatrix[y % 8][x % 8] / 64;

        const gray = (data[index] + data[index + 1] + data[index + 2]) / 3;

        const ditherValue = gray > threshold * 255 ? 255 : 0;

        data[index] = ditherValue;
        data[index + 1] = ditherValue;
        data[index + 2] = ditherValue;

        if (ditherValue === 0) {
          // Fix dither: Use proper grayscale for retro look, avoid green tint
          data[index] = 0;
          data[index + 1] = 0;
          data[index + 2] = 0;
        } else {
          data[index] = 255;
          data[index + 1] = 255;
          data[index + 2] = 255;
        }
      }
    }
    return imageData;
  }

  updateGameStatus() {
    const statusElement = document.getElementById("game-status");

    if (!statusElement) {
      console.error("Status element not found in the DOM.");
      return;
    }

    let statusText = `Current Player: ${this.currentPlayer.toUpperCase()}`;

    if (this.isKingInCheck(this.currentPlayer)) {
      statusText += " - CHECK!";
    }

    statusElement.textContent = statusText;
  }

  selectBestMove(moves) {
    const pieceValues = {
      king: 1000,
      queen: 9,
      rook: 5,
      bishop: 3,
      knight: 3,
      pawn: 1
    };

    return moves.reduce((bestMove, currentMove) => {
      const targetPiece = this.board[currentMove.toY][currentMove.toX];
      const currentMoveValue = targetPiece ? pieceValues[targetPiece.type] : 0;
      const bestMoveValue =
        bestMove && this.board[bestMove.toY][bestMove.toX]
          ? pieceValues[this.board[bestMove.toY][bestMove.toX].type]
          : 0;

      return currentMoveValue > bestMoveValue ? currentMove : bestMove;
    }, null);
  }
}

});
