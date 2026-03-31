/**
 * Tetris Classic Game Implementation
 * A complete, working Tetris game with proper mechanics
 */

// Game Configuration
const CONFIG = {
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    TILE_SIZE: 30,
    INITIAL_SPEED: 1000,
    SPEED_INCREMENT: 50,
    MIN_SPEED: 100,
    SCORES: {
        SINGLE: 100,
        DOUBLE: 300,
        TRIPLE: 500,
        TETRIS: 800,
        SOFT_DROP: 1,
        HARD_DROP: 2
    }
};

// Tetris Piece Definitions
const TETROMINOS = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: 'i-piece',
        name: 'I'
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 'j-piece',
        name: 'J'
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 'l-piece',
        name: 'L'
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: 'o-piece',
        name: 'O'
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: 's-piece',
        name: 'S'
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 't-piece',
        name: 'T'
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: 'z-piece',
        name: 'Z'
    }
};

// Game State
class GameState {
    constructor() {
        this.board = this.createEmptyBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.dropSpeed = CONFIG.INITIAL_SPEED;
        this.lastDropTime = 0;
        this.holdPiece = null;
        this.canHold = true;
    }

    createEmptyBoard() {
        return Array.from({ length: CONFIG.BOARD_HEIGHT }, () => 
            Array(CONFIG.BOARD_WIDTH).fill(null)
        );
    }

    reset() {
        this.board = this.createEmptyBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.dropSpeed = CONFIG.INITIAL_SPEED;
        this.holdPiece = null;
        this.canHold = true;
        this.spawnNewPiece();
    }
}

// Piece Class
class TetrisPiece {
    constructor(type) {
        this.type = type;
        this.shape = JSON.parse(JSON.stringify(TETROMINOS[type].shape));
        this.color = TETROMINOS[type].color;
        this.x = 3; // Start position
        this.y = 0;
        this.rotation = 0;
    }

    rotate() {
        // Create a copy of the current shape
        const rotated = Array.from({ length: this.shape[0] }, () => 
            Array(this.shape[0]).fill(0)
        );
        
        // Rotate 90 degrees clockwise
        for (let y = 0; y < this.shape.length; y++) {
            for (let x = 0; x < this.shape[y].length; x++) {
                rotated[x][this.shape.length - 1 - y] = this.shape[y][x];
            }
        }
        
        this.shape = rotated;
        this.rotation = (this.rotation + 90) % 360;
    }

    getPositions() {
        const positions = [];
        for (let y = 0; y < this.shape.length; y++) {
            for (let x = 0; x < this.shape[y].length; x++) {
                if (this.shape[y][x]) {
                    positions.push({
                        x: this.x + x,
                        y: this.y + y
                    });
                }
            }
        }
        return positions;
    }
}

// Main Game Class
class TetrisGame {
    constructor() {
        this.state = new GameState();
        this.gameLoopId = null;
        this.domElements = {
            board: document.getElementById('board'),
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            lines: document.getElementById('lines'),
            nextPiece: document.getElementById('next-piece'),
            gameOverBanner: document.getElementById('game-over-banner'),
            finalScore: document.getElementById('final-score'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            restartBtn: document.getElementById('restart-btn')
        };

        this.setupEventListeners();
        this.init();
    }

    init() {
        this.renderBoard();
        this.spawnNewPiece();
        this.updateUI();
        
        // Get game integration if available
        this.gameIntegration = window.gameIntegration || null;
        if (this.gameIntegration) {
            this.gameIntegration.ready();
        }
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Button controls
        this.domElements.startBtn.addEventListener('click', () => this.startGame());
        this.domElements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.domElements.resetBtn.addEventListener('click', () => this.resetGame());
        this.domElements.restartBtn.addEventListener('click', () => this.restartGame());

        // Mobile controls
        this.setupMobileControls();
    }

    setupMobileControls() {
        // Create mobile control buttons if on mobile
        if (window.innerWidth <= 768) {
            const controls = document.createElement('div');
            controls.className = 'mobile-controls';
            controls.innerHTML = `
                <div class="mobile-btn" id="btn-left">À</div>
                <div class="mobile-btn" id="btn-rotate">ó</div>
                <div class="mobile-btn" id="btn-right">¶</div>
                <div class="mobile-btn" id="btn-drop">“</div>
            `;
            document.body.appendChild(controls);

            document.getElementById('btn-left').addEventListener('click', () => this.moveLeft());
            document.getElementById('btn-rotate').addEventListener('click', () => this.rotatePiece());
            document.getElementById('btn-right').addEventListener('click', () => this.moveRight());
            document.getElementById('btn-drop').addEventListener('click', () => this.hardDrop());
        }
    }

    handleKeyPress(e) {
        if (this.state.gameOver || this.state.paused) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.moveLeft();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.moveRight();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.softDrop();
                break;
            case 'ArrowUp':
            case 'x':
            case 'X':
                e.preventDefault();
                this.rotatePiece();
                break;
            case 'z':
            case 'Z':
                e.preventDefault();
                this.rotatePiece(-1); // Counter-clockwise
                break;
            case ' ':
                e.preventDefault();
                this.hardDrop();
                break;
            case 'c':
            case 'C':
                e.preventDefault();
                this.holdPiece();
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }

    startGame() {
        if (this.state.gameOver) {
            this.resetGame();
        }
        if (!this.gameLoopId) {
            this.lastTime = performance.now();
            this.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    togglePause() {
        this.state.paused = !this.state.paused;
        this.domElements.pauseBtn.textContent = this.state.paused ? 'Resume' : 'Pause';
        
        if (this.state.paused) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        } else {
            this.lastTime = performance.now();
            this.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    resetGame() {
        this.state.reset();
        this.domElements.gameOverBanner.classList.add('hidden');
        this.renderBoard();
        this.updateUI();
        this.startGame();
    }

    restartGame() {
        this.resetGame();
    }

    gameLoop(time) {
        if (this.state.gameOver || this.state.paused) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        // Handle automatic dropping
        if (time - this.state.lastDropTime > this.state.dropSpeed) {
            this.moveDown();
            this.state.lastDropTime = time;
        }

        this.render();
        this.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    spawnNewPiece() {
        if (!this.state.nextPiece) {
            this.state.nextPiece = this.getRandomPiece();
        }
        
        this.state.currentPiece = this.state.nextPiece;
        this.state.nextPiece = this.getRandomPiece();
        this.state.canHold = true;

        // Check for game over
        if (this.isCollision()) {
            this.gameOver();
            return;
        }

        this.renderNextPiece();
    }

    getRandomPiece() {
        const pieces = Object.keys(TETROMINOS);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        return new TetrisPiece(randomPiece);
    }

    moveLeft() {
        this.state.currentPiece.x--;
        if (this.isCollision()) {
            this.state.currentPiece.x++;
        } else {
            this.render();
        }
    }

    moveRight() {
        this.state.currentPiece.x++;
        if (this.isCollision()) {
            this.state.currentPiece.x--;
        } else {
            this.render();
        }
    }

    moveDown() {
        this.state.currentPiece.y++;
        if (this.isCollision()) {
            this.state.currentPiece.y--;
            this.lockPiece();
        } else {
            this.render();
        }
    }

    softDrop() {
        this.state.currentPiece.y++;
        if (this.isCollision()) {
            this.state.currentPiece.y--;
            this.lockPiece();
        } else {
            this.addScore(CONFIG.SCORES.SOFT_DROP);
            this.render();
        }
    }

    hardDrop() {
        let dropDistance = 0;
        while (!this.isCollision()) {
            this.state.currentPiece.y++;
            dropDistance++;
        }
        this.state.currentPiece.y--;
        this.addScore(dropDistance * CONFIG.SCORES.HARD_DROP);
        this.lockPiece();
    }

    rotatePiece(direction = 1) {
        const originalShape = JSON.parse(JSON.stringify(this.state.currentPiece.shape));
        this.state.currentPiece.rotate();
        
        // Try wall kicks if collision occurs
        const kicks = [0, 1, -1, 2, -2]; // Try different offsets
        
        for (let kick of kicks) {
            this.state.currentPiece.x += kick;
            if (!this.isCollision()) {
                this.render();
                return;
            }
            this.state.currentPiece.x -= kick;
        }
        
        // If all kicks fail, revert rotation
        this.state.currentPiece.shape = originalShape;
    }

    holdPiece() {
        if (!this.state.canHold) return;

        if (this.state.holdPiece === null) {
            this.state.holdPiece = new TetrisPiece(this.state.currentPiece.type);
            this.spawnNewPiece();
        } else {
            const temp = this.state.holdPiece;
            this.state.holdPiece = new TetrisPiece(this.state.currentPiece.type);
            this.state.currentPiece = temp;
            this.state.currentPiece.x = 3;
            this.state.currentPiece.y = 0;
        }
        
        this.state.canHold = false;
        this.render();
        this.renderHoldPiece();
    }

    isCollision() {
        const positions = this.state.currentPiece.getPositions();
        
        for (let pos of positions) {
            // Check walls
            if (pos.x < 0 || pos.x >= CONFIG.BOARD_WIDTH) {
                return true;
            }
            // Check floor
            if (pos.y >= CONFIG.BOARD_HEIGHT) {
                return true;
            }
            // Check occupied cells
            if (pos.y >= 0 && this.state.board[pos.y][pos.x] !== null) {
                return true;
            }
        }
        return false;
    }

    lockPiece() {
        const positions = this.state.currentPiece.getPositions();
        
        for (let pos of positions) {
            if (pos.y >= 0) {
                this.state.board[pos.y][pos.x] = this.state.currentPiece.color;
            }
        }

        this.clearLines();
        this.spawnNewPiece();
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.state.board.length - 1; y >= 0; y--) {
            if (this.state.board[y].every(cell => cell !== null)) {
                // Remove the line
                this.state.board.splice(y, 1);
                // Add empty line at top
                this.state.board.unshift(Array(CONFIG.BOARD_WIDTH).fill(null));
                linesCleared++;
                y++; // Check the same line again since we moved everything down
            }
        }

        if (linesCleared > 0) {
            this.updateScore(linesCleared);
            this.updateLevel();
        }
    }

    updateScore(linesCleared) {
        const baseScores = [0, CONFIG.SCORES.SINGLE, CONFIG.SCORES.DOUBLE, CONFIG.SCORES.TRIPLE, CONFIG.SCORES.TETRIS];
        const scoreMultiplier = this.state.level;
        
        this.addScore(baseScores[linesCleared] * scoreMultiplier);
        this.state.lines += linesCleared;
    }

    updateLevel() {
        const newLevel = Math.floor(this.state.lines / 10) + 1;
        if (newLevel > this.state.level) {
            this.state.level = newLevel;
            this.updateSpeed();
        }
    }

    updateSpeed() {
        this.state.dropSpeed = Math.max(
            CONFIG.MIN_SPEED, 
            CONFIG.INITIAL_SPEED - (this.state.level - 1) * CONFIG.SPEED_INCREMENT
        );
    }

    addScore(points) {
        this.state.score += points;
        this.updateUI();
        
        // Send score update to integration
        if (this.gameIntegration) {
            this.gameIntegration.updateScore(this.state.score);
        }
    }

    gameOver() {
        this.state.gameOver = true;
        cancelAnimationFrame(this.gameLoopId);
        this.gameLoopId = null;
        
        this.domElements.gameOverBanner.classList.remove('hidden');
        this.domElements.finalScore.textContent = this.state.score;
        
        // Notify integration
        if (this.gameIntegration) {
            this.gameIntegration.gameOver({
                score: this.state.score,
                won: false,
                lines: this.state.lines,
                level: this.state.level
            });
        }
    }

    // Rendering Methods
    render() {
        this.renderBoard();
        this.renderCurrentPiece();
    }

    renderBoard() {
        this.domElements.board.innerHTML = '';
        
        for (let y = 0; y < CONFIG.BOARD_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.BOARD_WIDTH; x++) {
                if (this.state.board[y][x]) {
                    this.createBlock(x, y, this.state.board[y][x]);
                }
            }
        }
    }

    renderCurrentPiece() {
        const positions = this.state.currentPiece.getPositions();
        
        for (let pos of positions) {
            if (pos.y >= 0) {
                this.createBlock(pos.x, pos.y, this.state.currentPiece.color, true);
            }
        }
    }

    renderNextPiece() {
        this.domElements.nextPiece.innerHTML = '';
        
        if (!this.state.nextPiece) return;

        const offsetX = 1;
        const offsetY = 1;

        for (let y = 0; y < this.state.nextPiece.shape.length; y++) {
            for (let x = 0; x < this.state.nextPiece.shape[y].length; x++) {
                if (this.state.nextPiece.shape[y][x]) {
                    const block = document.createElement('div');
                    block.className = `block next-block ${this.state.nextPiece.color}`;
                    block.style.left = ((x + offsetX) * 24) + 'px';
                    block.style.top = ((y + offsetY) * 24) + 'px';
                    this.domElements.nextPiece.appendChild(block);
                }
            }
        }
    }

    createBlock(x, y, color, isMoving = false) {
        const block = document.createElement('div');
        block.className = `block ${color} ${isMoving ? 'moving' : ''}`;
        block.style.left = (x * CONFIG.TILE_SIZE) + 'px';
        block.style.top = (y * CONFIG.TILE_SIZE) + 'px';
        this.domElements.board.appendChild(block);
    }

    updateUI() {
        this.domElements.score.textContent = this.state.score;
        this.domElements.level.textContent = this.state.level;
        this.domElements.lines.textContent = this.state.lines;
    }
}

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    const game = new TetrisGame();
    
    // Auto-start on load
    game.startGame();
});