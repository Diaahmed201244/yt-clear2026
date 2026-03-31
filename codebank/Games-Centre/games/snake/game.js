/**
 * Snake Game - GameContract Implementation
 * Refactored to work with the new Games-Centre architecture
 */

class SnakeGame {
  constructor() {
    this.gameId = 'snake';
    this.title = 'Snake';
    this.category = 'classic';
    this.description = 'Classic snake game with modern features';
    this.config = null;
    this.state = 'IDLE';
    this.score = 0;
    this.highScore = 0;
    this.gameLoop = null;
    this.canvas = null;
    this.ctx = null;
    this.snake = null;
    this.food = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize the game
   */
  async init(config = {}) {
    console.log(`[SnakeGame] Initializing with config:`, config);

    this.config = {
      mode: config.mode || 'single-player',
      players: config.players || [{ id: 'player_1', type: 'human' }],
      ...config
    };

    // Set up canvas
    this.setupCanvas();

    // Initialize game state
    this.state = 'READY';
    this.score = 0;

    // Load high score
    this.loadHighScore();

    console.log(`[SnakeGame] Initialized for mode: ${this.config.mode}`);
    this.emit('game:initialized');
  }

  /**
   * Start the game
   */
  async start() {
    console.log(`[SnakeGame] Starting game`);

    if (this.state !== 'READY') {
      throw new Error('Game not ready to start');
    }

    // Initialize game objects
    this.initGameObjects();

    // Start game loop
    this.startGameLoop();

    this.state = 'RUNNING';
    console.log(`[SnakeGame] Game started`);
    this.emit('game:started');
  }

  /**
   * Handle game actions
   */
  onAction(action) {
    if (this.state !== 'RUNNING') return;

    console.log(`[SnakeGame] Handling action:`, action);

    switch (action.type) {
      case 'KEY_PRESS':
        this.handleKeyPress(action.key);
        break;

      case 'PAUSE':
        this.pause();
        break;

      case 'RESUME':
        this.resume();
        break;

      default:
        console.warn(`[SnakeGame] Unknown action type: ${action.type}`);
    }
  }

  /**
   * Handle game finish
   */
  onFinish(result) {
    console.log(`[SnakeGame] Game finished with result:`, result);

    // Stop game loop
    this.stopGameLoop();

    // Update high score if needed
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }

    this.state = 'COMPLETED';
    this.emit('game:finished', {
      score: this.score,
      highScore: this.highScore,
      result
    });
  }

  /**
   * Destroy the game and clean up
   */
  destroy() {
    console.log(`[SnakeGame] Destroying game`);

    // Stop game loop
    this.stopGameLoop();

    // Clean up resources
    this.cleanup();

    this.state = 'DESTROYED';
    this.emit('game:destroyed');
  }

  /**
   * Setup canvas
   */
  setupCanvas() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'snakeGameCanvas';
    this.canvas.width = 400;
    this.canvas.height = 400;

    // Get 2D context
    this.ctx = this.canvas.getContext('2d');

    // Add to document (or game container)
    document.body.appendChild(this.canvas);

    console.log(`[SnakeGame] Canvas setup complete`);
  }

  /**
   * Initialize game objects
   */
  initGameObjects() {
    // Initialize snake
    this.snake = {
      body: [{ x: 10, y: 10 }],
      direction: 'RIGHT',
      nextDirection: 'RIGHT'
    };

    // Initialize food
    this.food = this.generateFood();

    console.log(`[SnakeGame] Game objects initialized`);
  }

  /**
   * Start game loop
   */
  startGameLoop() {
    const gameSpeed = 150; // ms per frame

    this.gameLoop = setInterval(() => {
      this.update();
      this.render();
    }, gameSpeed);

    console.log(`[SnakeGame] Game loop started`);
  }

  /**
   * Stop game loop
   */
  stopGameLoop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
      console.log(`[SnakeGame] Game loop stopped`);
    }
  }

  /**
   * Update game state
   */
  update() {
    if (this.state !== 'RUNNING') return;

    // Update snake direction
    this.snake.direction = this.snake.nextDirection;

    // Move snake
    const head = { ...this.snake.body[0] };

    switch (this.snake.direction) {
      case 'UP': head.y--; break;
      case 'DOWN': head.y++; break;
      case 'LEFT': head.x--; break;
      case 'RIGHT': head.x++; break;
    }

    // Check collisions
    if (this.checkCollisions(head)) {
      this.onFinish({ status: 'GAME_OVER', reason: 'Collision' });
      return;
    }

    // Move snake body
    this.snake.body.unshift(head);

    // Check if snake ate food
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.food = this.generateFood();
      this.emit('game:score', { score: this.score });
    } else {
      this.snake.body.pop();
    }
  }

  /**
   * Render game
   */
  render() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw snake
    this.ctx.fillStyle = '#0f0';
    this.snake.body.forEach(segment => {
      this.ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
    });

    // Draw food
    this.ctx.fillStyle = '#f00';
    this.ctx.fillRect(this.food.x * 20, this.food.y * 20, 20, 20);

    // Draw score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
    this.ctx.fillText(`High: ${this.highScore}`, 10, 40);
  }

  /**
   * Check collisions
   */
  checkCollisions(head) {
    // Check wall collisions
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
      return true;
    }

    // Check self collisions
    for (let i = 1; i < this.snake.body.length; i++) {
      if (head.x === this.snake.body[i].x && head.y === this.snake.body[i].y) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate food at random position
   */
  generateFood() {
    let food;
    let validPosition = false;

    while (!validPosition) {
      food = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20)
      };

      // Check if food is on snake
      validPosition = !this.snake.body.some(segment =>
        segment.x === food.x && segment.y === food.y
      );
    }

    return food;
  }

  /**
   * Handle key presses
   */
  handleKeyPress(key) {
    // Prevent reverse direction
    switch (key) {
      case 'ArrowUp':
        if (this.snake.direction !== 'DOWN') {
          this.snake.nextDirection = 'UP';
        }
        break;

      case 'ArrowDown':
        if (this.snake.direction !== 'UP') {
          this.snake.nextDirection = 'DOWN';
        }
        break;

      case 'ArrowLeft':
        if (this.snake.direction !== 'RIGHT') {
          this.snake.nextDirection = 'LEFT';
        }
        break;

      case 'ArrowRight':
        if (this.snake.direction !== 'LEFT') {
          this.snake.nextDirection = 'RIGHT';
        }
        break;
    }
  }

  /**
   * Pause game
   */
  pause() {
    if (this.state === 'RUNNING') {
      this.state = 'PAUSED';
      this.stopGameLoop();
      console.log(`[SnakeGame] Game paused`);
      this.emit('game:paused');
    }
  }

  /**
   * Resume game
   */
  resume() {
    if (this.state === 'PAUSED') {
      this.state = 'RUNNING';
      this.startGameLoop();
      console.log(`[SnakeGame] Game resumed`);
      this.emit('game:resumed');
    }
  }

  /**
   * Load high score from storage
   */
  loadHighScore() {
    const savedHighScore = localStorage.getItem(`snake_highscore_${this.config.mode}`);
    this.highScore = savedHighScore ? parseInt(savedHighScore) : 0;
    console.log(`[SnakeGame] Loaded high score: ${this.highScore}`);
  }

  /**
   * Save high score to storage
   */
  saveHighScore() {
    localStorage.setItem(`snake_highscore_${this.config.mode}`, this.highScore.toString());
    console.log(`[SnakeGame] Saved high score: ${this.highScore}`);
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.ctx = null;
    this.snake = null;
    this.food = null;

    console.log(`[SnakeGame] Resources cleaned up`);
  }

  /**
   * Event system
   */
  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  emit(event, data) {
    const handlers = this.eventListeners.get(event) || [];
    handlers.forEach(handler => handler(data));

    // Also emit as DOM event
    window.dispatchEvent(new CustomEvent(`snake-game:${event}`, {
      detail: data
    }));
  }
}

// Export GameContract interface
export const GameContract = {
  init: SnakeGame.prototype.init,
  start: SnakeGame.prototype.start,
  onAction: SnakeGame.prototype.onAction,
  onFinish: SnakeGame.prototype.onFinish,
  destroy: SnakeGame.prototype.destroy
};

// Singleton instance
const snakeGame = new SnakeGame();
export default snakeGame;