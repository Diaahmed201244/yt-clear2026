"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RedLightGreenLight;
const react_1 = require("react");
const gsap_1 = require("gsap");
const enemyManager_1 = require("@/lib/enemyManager");
function RedLightGreenLight({ onGameComplete }) {
    const canvasRef = (0, react_1.useRef)(null);
    const [isGreenLight, setIsGreenLight] = (0, react_1.useState)(true);
    const [playerPosition, setPlayerPosition] = (0, react_1.useState)(0);
    const [gameTimer, setGameTimer] = (0, react_1.useState)(30);
    const [isGameActive, setIsGameActive] = (0, react_1.useState)(true);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const [playerHealth, setPlayerHealth] = (0, react_1.useState)(100);
    const [activePowerUps, setActivePowerUps] = (0, react_1.useState)([]);
    const enemyManagerRef = (0, react_1.useRef)(null);
    const gameStateRef = (0, react_1.useRef)({
        isMoving: false,
        lastMoveTime: 0,
        finishLine: 500,
        lastUpdate: 0,
        playerX: 50,
        playerY: 250,
        playerWidth: 20,
        playerHeight: 20
    });
    const drawGame = (0, react_1.useCallback)(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        // Update player position in game state
        gameStateRef.current.playerX = (playerPosition / gameStateRef.current.finishLine) * (canvas.width - 60);
        gameStateRef.current.playerY = canvas.height / 2 - 10;
        // Clear canvas
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw finish line
        ctx.fillStyle = '#FF6B8A';
        ctx.fillRect(canvas.width - 10, 0, 10, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Inter';
        ctx.fillText('FINISH', canvas.width - 60, 20);
        // Draw obstacles and hazards in background
        if (enemyManagerRef.current) {
            enemyManagerRef.current.render();
        }
        // Draw player with health-based coloring
        const playerX = gameStateRef.current.playerX;
        const playerY = gameStateRef.current.playerY;
        if (playerHealth > 60) {
            ctx.fillStyle = isGreenLight ? '#00FF88' : '#FF4444';
        }
        else if (playerHealth > 30) {
            ctx.fillStyle = isGreenLight ? '#FFAA00' : '#FF2222';
        }
        else {
            ctx.fillStyle = '#FF0000';
        }
        ctx.fillRect(playerX, playerY, gameStateRef.current.playerWidth, gameStateRef.current.playerHeight);
        // Draw player health bar
        ctx.fillStyle = '#333333';
        ctx.fillRect(playerX - 5, playerY - 15, 30, 8);
        ctx.fillStyle = playerHealth > 50 ? '#00FF00' : playerHealth > 25 ? '#FFAA00' : '#FF0000';
        ctx.fillRect(playerX - 5, playerY - 15, (30 * playerHealth) / 100, 8);
        // Draw AI players
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = '#666666';
            const aiX = Math.random() * canvas.width * 0.7;
            const aiY = (i + 1) * (canvas.height / 7);
            ctx.fillRect(aiX, aiY, 10, 10);
        }
        // Draw power-up indicators
        if (activePowerUps.length > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px Inter';
            ctx.fillText(`Active: ${activePowerUps.join(', ')}`, 10, canvas.height - 20);
        }
    }, [isGreenLight, playerPosition, playerHealth, activePowerUps]);
    const handleMove = () => {
        if (!isGameActive)
            return;
        if (isGreenLight) {
            const speedMultiplier = activePowerUps.includes('Speed Boost') ? 1.5 : 1;
            const moveAmount = 10 * speedMultiplier;
            const newPosition = Math.min(playerPosition + moveAmount, gameStateRef.current.finishLine);
            setPlayerPosition(newPosition);
            const newProgress = (newPosition / gameStateRef.current.finishLine) * 100;
            setProgress(newProgress);
            if (newPosition >= gameStateRef.current.finishLine) {
                setIsGameActive(false);
                onGameComplete(true);
            }
        }
        else {
            // Moved during red light - elimination
            setIsGameActive(false);
            gsap_1.default.to('.elimination-animation', {
                duration: 1,
                scale: 0,
                rotation: 360,
                ease: 'back.in(1.7)',
                onComplete: () => onGameComplete(false)
            });
        }
    };
    // Initialize enemies and obstacles
    (0, react_1.useEffect)(() => {
        if (!canvasRef.current)
            return;
        const canvas = canvasRef.current;
        enemyManagerRef.current = new enemyManager_1.EnemyManager(canvas);
        const enemyManager = enemyManagerRef.current;
        // Add sniper guards
        enemyManager.addEnemy(enemyManager.createSniper(canvas.offsetWidth * 0.3, 50));
        enemyManager.addEnemy(enemyManager.createSniper(canvas.offsetWidth * 0.7, canvas.offsetHeight - 100));
        // Add power-ups
        enemyManager.addPowerUp(enemyManager.createSpeedBoost(canvas.offsetWidth * 0.4, canvas.offsetHeight * 0.5));
        enemyManager.addPowerUp(enemyManager.createShield(canvas.offsetWidth * 0.6, canvas.offsetHeight * 0.4));
    }, []);
    (0, react_1.useEffect)(() => {
        if (!isGameActive)
            return;
        const gameLoop = () => {
            // Update enemies and check collisions
            if (enemyManagerRef.current) {
                enemyManagerRef.current.updateEnemies(gameStateRef.current.playerX, gameStateRef.current.playerY, 16 // ~60fps delta
                );
                // Check power-up collisions
                const hitPowerUp = enemyManagerRef.current.checkPlayerPowerUpCollision(gameStateRef.current.playerX, gameStateRef.current.playerY, gameStateRef.current.playerWidth, gameStateRef.current.playerHeight);
                if (hitPowerUp) {
                    setActivePowerUps(prev => [...prev, hitPowerUp.type]);
                    setTimeout(() => {
                        setActivePowerUps(prev => prev.filter(p => p !== hitPowerUp.type));
                    }, hitPowerUp.duration);
                }
            }
            drawGame();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
        // Light switching logic
        const switchLights = () => {
            if (!isGameActive)
                return;
            setIsGreenLight(prev => {
                const newLight = !prev;
                gsap_1.default.to('#currentLight', {
                    duration: 0.3,
                    backgroundColor: newLight ? '#00FF88' : '#FF4444',
                    scale: newLight ? 1.2 : 1,
                    ease: 'power2.out'
                });
                return newLight;
            });
        };
        const lightInterval = setInterval(() => {
            switchLights();
        }, Math.random() * 2000 + 1000);
        const timerInterval = setInterval(() => {
            setGameTimer(prev => {
                if (prev <= 1) {
                    setIsGameActive(false);
                    onGameComplete(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => {
            clearInterval(lightInterval);
            clearInterval(timerInterval);
        };
    }, [isGameActive, drawGame, onGameComplete, activePowerUps]);
    (0, react_1.useEffect)(() => {
        // Update progress bar
        gsap_1.default.to('#progressBar', {
            duration: 0.3,
            width: `${progress}%`,
            ease: 'power2.out'
        });
    }, [progress]);
    return (<div className="w-full max-w-4xl mx-auto p-6 elimination-animation">
      <div className="text-center mb-8">
        <h2 className="font-orbitron text-3xl font-bold mb-4">RED LIGHT, GREEN LIGHT</h2>
        <div className="flex justify-center items-center space-x-8 mb-6">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isGreenLight ? 'bg-success-green/20' : 'bg-elimination-red/20'}`}>
              <div id="currentLight" className={`w-10 h-10 rounded-full animate-pulse ${isGreenLight ? 'bg-success-green' : 'bg-elimination-red'}`}/>
            </div>
            <span className="text-sm font-medium">
              {isGreenLight ? 'GREEN LIGHT' : 'RED LIGHT'}
            </span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-orbitron font-bold">{gameTimer}</div>
            <span className="text-sm text-gray-400">seconds remaining</span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-squid-cyan">{playerPosition}m</div>
            <span className="text-sm text-gray-400">distance</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <canvas ref={canvasRef} className="w-full h-64 canvas-game rounded-lg"/>
      </div>

      <div className="flex justify-center space-x-4">
        <button className="px-8 py-3 bg-squid-pink hover:bg-squid-pink/80 rounded-lg font-orbitron font-bold transition-colors disabled:opacity-50" onClick={handleMove} disabled={!isGameActive}>
          MOVE FORWARD
        </button>
        <button className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-orbitron font-bold transition-colors">
          QUIT GAME
        </button>
      </div>

      <div className="mt-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress to Finish Line</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div id="progressBar" className="bg-squid-pink h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
        </div>
      </div>
    </div>);
}
