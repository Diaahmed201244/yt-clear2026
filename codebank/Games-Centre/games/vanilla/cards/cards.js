/**
 * Cards Game - Vanilla Implementation
 * Following Cards Game Design Patterns and Architecture
 */

// Game Configuration
const GAME_CONFIG = {
    symbols: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍍', '🥝', '🍉', '🍋', '🍐', '🍊'],
    difficulties: {
        easy: { pairs: 6, gridSize: '4x4' },
        medium: { pairs: 8, gridSize: '4x4' },
        hard: { pairs: 12, gridSize: '6x6' }
    },
    modes: {
        classic: { timeLimit: null, movePenalty: 0 },
        timed: { timeLimit: 120, movePenalty: 0 },
        speed: { timeLimit: 60, movePenalty: 1 }
    },
    animations: {
        flipDuration: 500,
        matchDuration: 500,
        mismatchDuration: 800
    }
};

// Game State
let gameState = {
    isRunning: false,
    isPaused: false,
    difficulty: 'medium',
    mode: 'classic',
    timeLeft: 0,
    moves: 0,
    pairsFound: 0,
    totalPairs: 0,
    flippedCards: [],
    matchedPairs: [],
    timer: null,
    bestTimes: {
        easy: localStorage.getItem('cards_best_time_easy') || null,
        medium: localStorage.getItem('cards_best_time_medium') || null,
        hard: localStorage.getItem('cards_best_time_hard') || null
    }
};

// DOM Elements
const elements = {
    container: document.getElementById('game-container'),
    header: document.getElementById('game-header'),
    title: document.querySelector('.game-title'),
    modeDisplay: document.getElementById('mode-display'),
    timeDisplay: document.getElementById('time-display'),
    startBtn: document.getElementById('start-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    resetBtn: document.getElementById('reset-btn'),
    difficultySelect: document.getElementById('difficulty-select'),
    modeSelect: document.getElementById('mode-select'),
    gameBoard: document.getElementById('game-board'),
    pairsFound: document.getElementById('pairs-found'),
    movesCount: document.getElementById('moves-count'),
    bestTime: document.getElementById('best-time'),
    overlay: document.getElementById('game-overlay'),
    overlayTitle: document.getElementById('overlay-title'),
    overlayMessage: document.getElementById('overlay-message'),
    finalTime: document.getElementById('final-time'),
    finalMoves: document.getElementById('final-moves'),
    playAgainBtn: document.getElementById('play-again-btn'),
    closeGameBtn: document.getElementById('close-game-btn')
};

// Game Runtime Integration
let gameRuntime = null;
let communication = null;
let presence = null;
let fairPlay = null;
let leaderboard = null;
let betting = null;

// Game Integration
import { gameIntegration } from '../_shared/game-integration.js';

// Initialize Game
document.addEventListener('DOMContentLoaded', async () => {
    try { 
        // Initialize game runtime and communication
        await initializeGameRuntime();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load saved best times
        updateBestTimeDisplay();
        
        // Initialize game board
        initializeGameBoard();
        
        // Notify game integration that game is ready
        gameIntegration.ready();
        
        // Log game initialization
        console.log('Cards Game initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize Cards Game:', error);
        showErrorMessage('Failed to initialize game. Please refresh and try again.');
    }
});

/**
 * Initialize Game Runtime and Core Systems
 */
async function initializeGameRuntime() {
    // Wait for game runtime to be available
    await waitForGameRuntime();
    
    // Initialize core systems
    communication = window.GameRuntime?.Communication;
    presence = window.GameRuntime?.Presence;
    fairPlay = window.GameRuntime?.FairPlay;
    leaderboard = window.GameRuntime?.Leaderboard;
    betting = window.GameRuntime?.Betting;
    
    if (!communication) {
        throw new Error('Game communication system not available');
    }
    
    // Register game with runtime
    gameRuntime = window.GameRuntime;
    await gameRuntime.registerGame('cards', {
        name: 'Cards Game',
        version: '1.0.0',
        modes: ['classic', 'timed', 'speed'],
        difficulties: ['easy', 'medium', 'hard'],
        supportsBetting: true,
        supportsLeaderboard: true
    });
    
    // Setup communication handlers
    setupCommunicationHandlers();
}

/**
 * Wait for Game Runtime to be available
 */
function waitForGameRuntime() {
    return new Promise((resolve, reject) => {
        const maxAttempts = 100;
        let attempts = 0;
        
        const checkRuntime = () => {
            if (window.GameRuntime && window.GameRuntime.isReady) {
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Game Runtime not available'));
            } else {
                attempts++;
                setTimeout(checkRuntime, 100);
            }
        };
        
        checkRuntime();
    });
}

/**
 * Setup Communication Handlers
 */
function setupCommunicationHandlers() {
    if (!communication) return;
    
    // Handle game state synchronization
    communication.on('game:state:update', (data) => {
        if (data.gameId === 'cards') {
            updateGameState(data.state);
        }
    });
    
    // Handle presence updates
    communication.on('presence:update', (data) => {
        updatePresenceIndicator(data);
    });
    
    // Handle fair play violations
    communication.on('fairplay:violation', (data) => {
        if (data.gameId === 'cards') {
            handleFairPlayViolation(data);
        }
    });
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Game Controls
    elements.startBtn.addEventListener('click', startGame);
    elements.pauseBtn.addEventListener('click', togglePause);
    elements.resetBtn.addEventListener('click', resetGame);
    
    // Difficulty and Mode Selection
    elements.difficultySelect.addEventListener('change', (e) => {
        gameState.difficulty = e.target.value;
        updateBestTimeDisplay();
    });
    
    elements.modeSelect.addEventListener('change', (e) => {
        gameState.mode = e.target.value;
        updateModeDisplay();
    });
    
    // Overlay Actions
    elements.playAgainBtn.addEventListener('click', () => {
        hideOverlay();
        startGame();
    });
    
    elements.closeGameBtn.addEventListener('click', () => {
        hideOverlay();
        // Close game or return to dashboard
        if (window.GameRuntime) {
            window.GameRuntime.exitGame('cards');
        }
    });
    
    // Keyboard Controls
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Window Events
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Initialize Game Board
 */
function initializeGameBoard() {
    const config = GAME_CONFIG.difficulties[gameState.difficulty];
    elements.gameBoard.dataset.gridSize = config.gridSize;
    updateGridSize(config.gridSize);
}

/**
 * Update Grid Size
 */
function updateGridSize(gridSize) {
    const [rows, cols] = gridSize.split('x').map(Number);
    elements.gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    elements.gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
}

/**
 * Start Game
 */
async function startGame() {
    try { 
        // Validate game state
        if (gameState.isRunning && !gameState.isPaused) {
            return; // Game already running
        }
        
        // Initialize game parameters
        const config = GAME_CONFIG.difficulties[gameState.difficulty];
        const modeConfig = GAME_CONFIG.modes[gameState.mode];
        
        gameState.totalPairs = config.pairs;
        gameState.pairsFound = 0;
        gameState.moves = 0;
        gameState.timeLeft = modeConfig.timeLimit || 0;
        gameState.flippedCards = [];
        gameState.matchedPairs = [];
        gameState.isRunning = true;
        gameState.isPaused = false;
        
        // Generate and shuffle cards
        const cards = generateCards(config.pairs);
        renderCards(cards);
        
        // Update UI
        updateUI();
        updateControlsState();
        updateModeDisplay();
        
        // Start timers and systems
        startTimers();
        await startGameSystems();
        
        // Log game start
        console.log('Cards Game started:', {
            difficulty: gameState.difficulty,
            mode: gameState.mode,
            totalPairs: gameState.totalPairs
        });
        
    } catch (error) {
        console.error('Failed to start game:', error);
        showErrorMessage('Failed to start game. Please try again.');
    }
}

/**
 * Generate Cards
 */
function generateCards(pairCount) {
    const symbols = GAME_CONFIG.symbols.slice(0, pairCount);
    const cards = [];
    
    // Create pairs
    symbols.forEach(symbol => {
        cards.push({ id: Date.now() + Math.random(), symbol, isMatched: false });
        cards.push({ id: Date.now() + Math.random(), symbol, isMatched: false });
    });
    
    // Shuffle cards
    return shuffleArray(cards);
}

/**
 * Shuffle Array (Fisher-Yates Algorithm)
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Render Cards
 */
function renderCards(cards) {
    elements.gameBoard.innerHTML = '';
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        cardElement.dataset.cardId = card.id;
        cardElement.dataset.symbol = card.symbol;
        
        // Card Front
        const cardFront = document.createElement('div');
        cardFront.className = 'card-face card-front';
        cardFront.textContent = card.symbol;
        
        // Card Back
        const cardBack = document.createElement('div');
        cardBack.className = 'card-face card-back';
        cardBack.textContent = '?';
        
        cardElement.appendChild(cardFront);
        cardElement.appendChild(cardBack);
        
        // Add click handler
        cardElement.addEventListener('click', () => handleCardClick(cardElement, card));
        
        elements.gameBoard.appendChild(cardElement);
    });
}

/**
 * Handle Card Click
 */
async function handleCardClick(cardElement, card) {
    // Validate click
    if (!gameState.isRunning || gameState.isPaused) return;
    if (card.isMatched || cardElement.classList.contains('flipped')) return;
    if (gameState.flippedCards.length >= 2) return;
    
    // Flip card
    flipCard(cardElement, true);
    gameState.flippedCards.push({ element: cardElement, card });
    
    // Check for match
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        await checkForMatch();
    }
}

/**
 * Flip Card
 */
function flipCard(cardElement, isFlipped) {
    if (isFlipped) {
        cardElement.classList.add('flipped');
    } else {
        cardElement.classList.remove('flipped');
    }
}

/**
 * Check for Match
 */
async function checkForMatch() {
    const [card1, card2] = gameState.flippedCards;
    
    if (card1.card.symbol === card2.card.symbol) {
        // Match found
        await handleMatch(card1, card2);
    } else {
        // No match
        await handleMismatch(card1, card2);
    }
    
    // Clear flipped cards
    gameState.flippedCards = [];
    
    // Check win condition
    if (gameState.pairsFound === gameState.totalPairs) {
        await handleWin();
    }
}

/**
 * Handle Match
 */
async function handleMatch(card1, card2) {
    // Mark as matched
    card1.card.isMatched = true;
    card2.card.isMatched = true;
    
    // Add matched class
    card1.element.classList.add('matched');
    card2.element.classList.add('matched');
    
    // Update state
    gameState.pairsFound++;
    gameState.matchedPairs.push(card1.card.symbol);
    
    // Update UI
    updateUI();
    
    // Wait for animation
    await sleep(GAME_CONFIG.animations.matchDuration);
}

/**
 * Handle Mismatch
 */
async function handleMismatch(card1, card2) {
    // Wait for animation
    await sleep(GAME_CONFIG.animations.mismatchDuration);
    
    // Flip cards back
    flipCard(card1.element, false);
    flipCard(card2.element, false);
    
    // Update UI
    updateUI();
}

/**
 * Handle Win
 */
async function handleWin() {
    gameState.isRunning = false;
    stopTimers();
    
    // Calculate score
    const score = calculateScore();
    
    // Update best time
    updateBestTime();
    
    // Show win overlay
    showWinOverlay(score);
    
    // Log win
    console.log('Game won!', {
        difficulty: gameState.difficulty,
        mode: gameState.mode,
        time: gameState.timeLeft,
        moves: gameState.moves,
        score: score
    });
    
    // Notify game integration
    gameIntegration.gameOver({
        score: score,
        won: true,
        difficulty: gameState.difficulty,
        mode: gameState.mode,
        time: GAME_CONFIG.modes[gameState.mode].timeLimit - gameState.timeLeft,
        moves: gameState.moves
    });
    
    // Notify systems
    await notifyWin(score);
}

/**
 * Calculate Score
 */
function calculateScore() {
    const baseScore = gameState.totalPairs * 100;
    const timeBonus = gameState.timeLeft * 10;
    const movePenalty = gameState.moves * 5;
    const difficultyMultiplier = getDifficultyMultiplier();
    
    let score = (baseScore + timeBonus - movePenalty) * difficultyMultiplier;
    return Math.max(0, Math.floor(score));
}

/**
 * Get Difficulty Multiplier
 */
function getDifficultyMultiplier() {
    switch (gameState.difficulty) {
        case 'easy': return 1.0;
        case 'medium': return 1.5;
        case 'hard': return 2.0;
        default: return 1.0;
    }
}

/**
 * Start Timers
 */
function startTimers() {
    // Stop existing timer
    stopTimers();
    
    // Start game timer
    if (GAME_CONFIG.modes[gameState.mode].timeLimit) {
        gameState.timeLeft = GAME_CONFIG.modes[gameState.mode].timeLimit;
        gameState.timer = setInterval(() => {
            gameState.timeLeft--;
            updateUI();
            
            if (gameState.timeLeft <= 0) {
                handleTimeUp();
            }
        }, 1000);
    }
}

/**
 * Stop Timers
 */
function stopTimers() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

/**
 * Handle Time Up
 */
async function handleTimeUp() {
    gameState.isRunning = false;
    stopTimers();
    
    // Show game over overlay
    showGameOverOverlay('Time is up!');
    
    // Notify game integration
    gameIntegration.gameOver({
        score: 0,
        won: false,
        difficulty: gameState.difficulty,
        mode: gameState.mode,
        time: 0,
        moves: gameState.moves,
        reason: 'time_up'
    });
    
    // Log time up
    console.log('Game over - Time up!');
}

/**
 * Toggle Pause
 */
function togglePause() {
    if (!gameState.isRunning) return;
    
    gameState.isPaused = !gameState.isPaused;
    updateControlsState();
    updateUI();
    
    if (gameState.isPaused) {
        stopTimers();
        elements.pauseBtn.textContent = 'Resume';
    } else {
        startTimers();
        elements.pauseBtn.textContent = 'Pause';
    }
}

/**
 * Reset Game
 */
function resetGame() {
    gameState.isRunning = false;
    gameState.isPaused = false;
    stopTimers();
    
    // Reset state
    gameState.pairsFound = 0;
    gameState.moves = 0;
    gameState.flippedCards = [];
    gameState.matchedPairs = [];
    
    // Update UI
    updateUI();
    updateControlsState();
    hideOverlay();
    
    // Clear board
    elements.gameBoard.innerHTML = '';
    initializeGameBoard();
}

/**
 * Update UI
 */
function updateUI() {
    // Update displays
    elements.pairsFound.textContent = gameState.pairsFound;
    elements.movesCount.textContent = gameState.moves;
    
    // Update timer
    if (GAME_CONFIG.modes[gameState.mode].timeLimit) {
        const minutes = Math.floor(gameState.timeLeft / 60);
        const seconds = gameState.timeLeft % 60;
        elements.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Warning color for low time
        if (gameState.timeLeft <= 10) {
            elements.timeDisplay.style.color = '#ff4444';
        } else {
            elements.timeDisplay.style.color = 'white';
        }
    } else {
        elements.timeDisplay.textContent = '--:--';
    }
}

/**
 * Update Controls State
 */
function updateControlsState() {
    const isRunning = gameState.isRunning;
    const isPaused = gameState.isPaused;
    
    elements.startBtn.disabled = isRunning && !isPaused;
    elements.pauseBtn.disabled = !isRunning;
    elements.resetBtn.disabled = !isRunning;
    
    // Add disabled class for styling
    if (elements.startBtn.disabled) elements.startBtn.classList.add('btn-disabled');
    else elements.startBtn.classList.remove('btn-disabled');
    
    if (elements.pauseBtn.disabled) elements.pauseBtn.classList.add('btn-disabled');
    else elements.pauseBtn.classList.remove('btn-disabled');
    
    if (elements.resetBtn.disabled) elements.resetBtn.classList.add('btn-disabled');
    else elements.resetBtn.classList.remove('btn-disabled');
}

/**
 * Update Mode Display
 */
function updateModeDisplay() {
    elements.modeDisplay.textContent = gameState.mode.charAt(0).toUpperCase() + gameState.mode.slice(1);
    elements.header.dataset.mode = gameState.mode;
}

/**
 * Update Best Time Display
 */
function updateBestTimeDisplay() {
    const bestTime = gameState.bestTimes[gameState.difficulty];
    elements.bestTime.textContent = bestTime ? formatTime(bestTime) : '--:--';
}

/**
 * Update Best Time
 */
function updateBestTime() {
    if (gameState.timeLeft > 0) {
        const currentTime = GAME_CONFIG.modes[gameState.mode].timeLimit - gameState.timeLeft;
        const currentBest = gameState.bestTimes[gameState.difficulty];
        
        if (!currentBest || currentTime < currentBest) {
            gameState.bestTimes[gameState.difficulty] = currentTime;
            localStorage.setItem(`cards_best_time_${gameState.difficulty}`, currentTime.toString());
            updateBestTimeDisplay();
        }
    }
}

/**
 * Show Win Overlay
 */
function showWinOverlay(score) {
    elements.overlayTitle.textContent = 'Congratulations!';
    elements.overlayMessage.textContent = `You found all ${gameState.totalPairs} pairs in ${formatTime(GAME_CONFIG.modes[gameState.mode].timeLimit - gameState.timeLeft)}!`;
    elements.finalTime.textContent = formatTime(GAME_CONFIG.modes[gameState.mode].timeLimit - gameState.timeLeft);
    elements.finalMoves.textContent = gameState.moves;
    
    elements.overlay.classList.remove('hidden');
}

/**
 * Show Game Over Overlay
 */
function showGameOverOverlay(message) {
    elements.overlayTitle.textContent = 'Game Over';
    elements.overlayMessage.textContent = message;
    elements.finalTime.textContent = '--:--';
    elements.finalMoves.textContent = gameState.moves;
    
    elements.overlay.classList.remove('hidden');
}

/**
 * Show Error Message
 */
function showErrorMessage(message) {
    elements.overlayTitle.textContent = 'Error';
    elements.overlayMessage.textContent = message;
    elements.finalTime.textContent = '';
    elements.finalMoves.textContent = '';
    
    elements.overlay.classList.remove('hidden');
}

/**
 * Hide Overlay
 */
function hideOverlay() {
    elements.overlay.classList.add('hidden');
}

/**
 * Format Time
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Sleep Utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Handle Keyboard Input
 */
function handleKeyboardInput(event) {
    switch (event.key) {
        case ' ':
            event.preventDefault();
            if (!gameState.isRunning) startGame();
            else togglePause();
            break;
        case 'Escape':
            if (gameState.isRunning) resetGame();
            break;
        case 'r':
        case 'R':
            if (!gameState.isRunning) resetGame();
            break;
    }
}

/**
 * Handle Before Unload
 */
function handleBeforeUnload(event) {
    if (gameState.isRunning) {
        event.preventDefault();
        event.returnValue = '';
    }
}

/**
 * Handle Visibility Change
 */
function handleVisibilityChange() {
    if (document.hidden && gameState.isRunning && !gameState.isPaused) {
        togglePause();
    }
}

/**
 * Start Game Systems
 */
async function startGameSystems() {
    try { 
        // Start presence detection
        if (presence) {
            await presence.startDetection('cards');
        }
        
        // Start fair play monitoring
        if (fairPlay) {
            await fairPlay.startMonitoring('cards');
        }
        
        // Register for leaderboard
        if (leaderboard) {
            await leaderboard.registerGame('cards');
        }
        
        // Initialize betting if available
        if (betting) {
            await betting.initializeGame('cards', gameState.difficulty);
        }
        
    } catch (error) {
        console.error('Failed to start game systems:', error);
    }
}

/**
 * Notify Win
 */
async function notifyWin(score) {
    try { 
        // Update leaderboard
        if (leaderboard) {
            await leaderboard.submitScore('cards', {
                score: score,
                difficulty: gameState.difficulty,
                mode: gameState.mode,
                time: GAME_CONFIG.modes[gameState.mode].timeLimit - gameState.timeLeft,
                moves: gameState.moves
            });
        }
        
        // Handle betting rewards
        if (betting) {
            await betting.handleWin('cards', score);
        }
        
        // Notify communication system
        if (communication) {
            await communication.emit('game:win', {
                gameId: 'cards',
                score: score,
                difficulty: gameState.difficulty,
                mode: gameState.mode
            });
        }
        
    } catch (error) {
        console.error('Failed to notify win:', error);
    }
}

/**
 * Handle Fair Play Violation
 */
function handleFairPlayViolation(data) {
    console.warn('Fair play violation detected:', data);
    
    // Show warning to user
    showErrorMessage('Suspicious activity detected. Game may be affected.');
    
    // Pause game
    if (gameState.isRunning) {
        togglePause();
    }
}

/**
 * Update Game State
 */
function updateGameState(state) {
    // Handle external state updates
    if (state.isRunning !== undefined) {
        gameState.isRunning = state.isRunning;
    }
    if (state.isPaused !== undefined) {
        gameState.isPaused = state.isPaused;
    }
    updateControlsState();
    updateUI();
}

/**
 * Update Presence Indicator
 */
function updatePresenceIndicator(data) {
    // Update UI based on presence data
    if (data.isPresent) {
        elements.container.style.filter = 'none';
    } else {
        elements.container.style.filter = 'grayscale(100%)';
    }
}

// Export for integration
window.CardsGame = {
    start: startGame,
    pause: togglePause,
    reset: resetGame,
    getState: () => gameState,
    getConfig: () => GAME_CONFIG
};