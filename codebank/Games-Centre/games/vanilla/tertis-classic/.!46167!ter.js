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
