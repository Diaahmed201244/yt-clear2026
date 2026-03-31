document.addEventListener("DOMContentLoaded", function() {
class ChessGame {
  constructor() {
    this.canvas = document.getElementById("chessboard");
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
        lookahead: 2
      },
      hard: {
        moveStrategy: "strategic_evaluation",
        lookahead: 3
      }
    };
    this.aiDifficulty = "medium";

    this.initBoard = this.initBoard.bind(this);

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

  initBoard() {
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
      newGameButton.removeEventListener("click", this.initBoard);
      newGameButton.addEventListener("click", this.initBoard);
    }

    this.canvas.addEventListener("click", this.handleBoardClick.bind(this));
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
        this.renderTile(x, y);
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
  }

  renderTile(x, y) {
    const isDark = (x + y) % 2 === 1;

    this.ctx.fillStyle = isDark ? "#505050" : "#989898";
    this.ctx.fillRect(
      x * this.tileSize,
      y * this.tileSize,
      this.tileSize,
      this.tileSize
    );

    const piece = this.board[y][x];
    if (piece) {
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

  handleBoardClick(event) {
    if (this.gameOver || !this.isPlayerTurn || this.currentPlayer !== "white")
      return;

    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.tileSize);
    const y = Math.floor((event.clientY - rect.top) / this.tileSize);

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

      if (
        !targetSquare &&
        this.lastMovedPawn &&
        this.lastMovedPawn.x === toX &&
        this.lastMovedPawn.y === fromY &&
        this.lastMovedPawn.movedTwo
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

      for (let x = fromX; x !== toX + direction; x += direction) {
        if (this.isSquareUnderAttack(x, fromY, piece.color)) {
          return false;
        }
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

  movePiece(selectedPiece, toX, toY) {
    const { piece, x, y } = selectedPiece;

    const capturedPiece = this.board[toY][toX];
    if (capturedPiece && capturedPiece.type === "king") {
      const winMessage = `${piece.color.toUpperCase()} wins by capturing the ${
        capturedPiece.color
      } king!`;
      this.handleGameEnd(winMessage);
      return false;
    }

    if (piece.type === "pawn" && Math.abs(toX - x) === 1 && !capturedPiece) {
      const direction = piece.color === "white" ? 1 : -1;
      if (
        this.lastMovedPawn &&
        this.lastMovedPawn.x === toX &&
        this.lastMovedPawn.y === y &&
        this.lastMovedPawn.movedTwo
      ) {
        this.board[y][toX] = null;
      }
    }

    if (piece.type === "pawn" && Math.abs(toY - y) === 2) {
      this.lastMovedPawn = {
        x: toX,
        y: toY,
        movedTwo: true
      };
    } else {
      this.lastMovedPawn = null;
    }

    if (piece.type === "king" && Math.abs(toX - x) === 2) {
      const rookX = toX > x ? 7 : 0;
      const rookNewX = toX > x ? toX - 1 : toX + 1;
      const rook = this.board[y][rookX];

      this.board[y][rookNewX] = rook;
      this.board[y][rookX] = null;
    }

    if (piece.type === "pawn" && (toY === 0 || toY === 7)) {
      piece.type = "queen";
      piece.piece = piece.color === "white" ? "♛".toUpperCase() : "♛";
    }

    piece.hasMoved = true;

    this.board[toY][toX] = piece;
    this.board[y][x] = null;

    this.moveHistory.push({
      piece: piece,
      from: { x, y },
      to: { toX, toY }
    });

    return true;
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
  }

  handleGameEnd(reason) {
    this.gameOver = true;
    const statusElement = document.getElementById("game-status");
    const modalContent = this.createGameEndModal(reason);

    if (statusElement) {
      statusElement.textContent = reason;
    }
    console.log(`Game ended: ${reason}`);
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
          bestMove = this.evaluateBestStrategicMove(legalMoves);
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

  evaluateBestStrategicMove(moves) {
    const weightedMoves = moves.map((move) => ({
      ...move,
      score: this.calculateMoveScore(move)
    }));

    return weightedMoves.reduce((best, current) =>
      current.score > (best?.score || -Infinity) ? current : best
    );
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
                console.error(
                  `Error checking move for piece at (${x},${y}) to (${toX},${toY}):`,
                  error
                );
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
          data[index] = 50;
          data[index + 1] = 50;
          data[index + 2] = 100;
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

  const instructionsModal = document.getElementById("instructions-modal");
  const startGameBtn = document.getElementById("start-game-btn");
  const gameContainer = document.getElementById("game-container");

  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }

      instructionsModal.classList.add("hidden");
      gameContainer.classList.remove("hidden");

      const ditherOverlay = document.createElement("div");
      ditherOverlay.id = "dither-overlay";
      document.body.appendChild(ditherOverlay);

      new ChessGame();
    });
  }

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
    }
  });
if (document.fullscreenElement) {
    document.exitFullscreen();
  }
});// ========================================
// Game Integration - Auto-added
// ========================================
(function() {
    const gameIntegration = window.gameIntegration;
    if (!gameIntegration) {
        console.warn('[Game] gameIntegration not available');
        return;
    }

    // Notify dashboard game is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            gameIntegration.ready();
        });
    } else {
        gameIntegration.ready();
    }

    // Track when game should end
    // You may need to manually call gameIntegration.gameOver({ score: X, won: true/false })
    // when your game ends
    console.log('[Game] Integration active - remember to call gameIntegration.gameOver() when game ends');
})();

// Mode selection functionality
function setupModeSelection() {
    const modeSelection = document.getElementById('mode-selection');
    const chessContainer = document.querySelector('.chess-container');
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
        chessContainer.classList.add('show');

        // Initialize game with selected mode
        const game = new ChessGame(selectedMode);
        window.currentChessGame = game;
    });

    // Show mode selection initially
    modeSelection.style.display = 'flex';
    chessContainer.classList.remove('show');
}

// Initialize mode selection when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupModeSelection();
});