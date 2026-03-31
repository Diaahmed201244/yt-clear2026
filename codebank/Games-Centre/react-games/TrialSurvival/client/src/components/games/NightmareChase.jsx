"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NightmareChase;
const react_1 = require("react");
const powerUpManager_1 = require("@/lib/powerUpManager");
const enemyManager_1 = require("@/lib/enemyManager");
const bossManager_1 = require("@/lib/bossManager");
function NightmareChase({ onGameComplete }) {
    const canvasRef = (0, react_1.useRef)(null);
    const [playerPosition, setPlayerPosition] = (0, react_1.useState)({ x: 50, y: 300 });
    const [gameTimer, setGameTimer] = (0, react_1.useState)(90);
    const [isGameActive, setIsGameActive] = (0, react_1.useState)(true);
    const [score, setScore] = (0, react_1.useState)(0);
    const [keysCollected, setKeysCollected] = (0, react_1.useState)(0);
    const [lives, setLives] = (0, react_1.useState)(3);
    const [chasersDistance, setChasersDistance] = (0, react_1.useState)(100);
    const [activePowerUps, setActivePowerUps] = (0, react_1.useState)([]);
    const [bossHealth, setBossHealth] = (0, react_1.useState)(300);
    const enemyManagerRef = (0, react_1.useRef)(null);
    const bossManagerRef = (0, react_1.useRef)(null);
    const gameStateRef = (0, react_1.useRef)({
        obstacles: [],
        collectibles: [],
        scrollSpeed: 2,
        keysRequired: 3,
        playerSpeed: 4,
        chasers: [
            { x: 0, y: 250, speed: 1.5 },
            { x: -50, y: 350, speed: 1.2 },
            { x: -25, y: 200, speed: 1.8 }
        ],
        lastUpdate: 0,
        environmentHazards: [],
        bossPhase: 0
    });
    const generateObstacles = (0, react_1.useCallback)(() => {
        const obstacles = [];
        const canvas = canvasRef.current;
        if (!canvas)
            return obstacles;
        for (let i = 0; i < 15; i++) {
            obstacles.push({
                x: 200 + i * 120,
                y: Math.random() * (canvas.height - 100) + 50,
                width: 40,
                height: 60,
                type: Math.random() < 0.6 ? 'wall' : (Math.random() < 0.5 ? 'trap' : 'guard'),
                isActive: true
            });
        }
        return obstacles;
    }, []);
    const generateCollectibles = (0, react_1.useCallback)(() => {
        const collectibles = [];
        const canvas = canvasRef.current;
        if (!canvas)
            return collectibles;
        // Generate keys
        for (let i = 0; i < gameStateRef.current.keysRequired; i++) {
            collectibles.push({
                x: 300 + i * 200,
                y: Math.random() * (canvas.height - 100) + 50,
                type: 'key',
                collected: false
            });
        }
        // Generate tokens and power-ups
        for (let i = 0; i < 10; i++) {
            collectibles.push({
                x: 250 + i * 150,
                y: Math.random() * (canvas.height - 50) + 25,
                type: Math.random() < 0.7 ? 'token' : 'powerup',
                collected: false
            });
        }
        return collectibles;
    }, []);
    const drawGame = (0, react_1.useCallback)(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        // Clear canvas with dark atmosphere
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a0a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw fog effect
        ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';
        for (let i = 0; i < 5; i++) {
            const fogX = (Date.now() / 1000 + i * 100) % canvas.width;
            ctx.fillRect(fogX, 0, 150, canvas.height);
        }
        // Draw obstacles
        gameStateRef.current.obstacles.forEach(obstacle => {
            if (obstacle.x > -obstacle.width && obstacle.x < canvas.width + obstacle.width) {
                switch (obstacle.type) {
                    case 'wall':
                        ctx.fillStyle = '#444';
                        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                        ctx.strokeStyle = '#666';
                        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                        break;
                    case 'trap':
                        ctx.fillStyle = '#cc3333';
                        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                        // Animate trap
                        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
                        ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
                        ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
                        break;
                    case 'guard':
                        ctx.fillStyle = '#800080';
                        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                        // Guard eyes
                        ctx.fillStyle = '#ff0000';
                        ctx.fillRect(obstacle.x + 10, obstacle.y + 15, 8, 8);
                        ctx.fillRect(obstacle.x + 22, obstacle.y + 15, 8, 8);
                        break;
                }
            }
        });
        // Draw collectibles
        gameStateRef.current.collectibles.forEach(collectible => {
            if (!collectible.collected && collectible.x > -20 && collectible.x < canvas.width + 20) {
                const bounce = Math.sin(Date.now() / 300) * 3;
                switch (collectible.type) {
                    case 'key':
                        ctx.fillStyle = '#ffd700';
                        ctx.fillRect(collectible.x, collectible.y + bounce, 15, 15);
                        ctx.fillStyle = '#ffff00';
                        ctx.fillRect(collectible.x + 2, collectible.y + bounce + 2, 11, 11);
                        break;
                    case 'token':
                        ctx.fillStyle = '#00ff88';
                        ctx.beginPath();
                        ctx.arc(collectible.x + 7, collectible.y + bounce + 7, 7, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 'powerup':
                        ctx.fillStyle = '#ff6b8a';
                        ctx.beginPath();
                        ctx.arc(collectible.x + 7, collectible.y + bounce + 7, 8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText('P', collectible.x + 3, collectible.y + bounce + 12);
                        break;
                }
            }
        });
        // Draw player
        ctx.fillStyle = powerUpManager_1.powerUpManager.isActive('shield') ? '#00ffff' : '#ff6b8a';
        ctx.fillRect(playerPosition.x, playerPosition.y, 20, 20);
        // Player glow effect if shielded
        if (powerUpManager_1.powerUpManager.isActive('shield')) {
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
            ctx.fillRect(playerPosition.x, playerPosition.y, 20, 20);
            ctx.shadowBlur = 0;
        }
        // Draw chasers
        gameStateRef.current.chasers.forEach((chaser, index) => {
            const chaserColor = ['#ff0000', '#ff3300', '#ff6600'][index];
            ctx.fillStyle = chaserColor;
            ctx.fillRect(chaser.x, chaser.y, 25, 25);
            // Chaser glow
            ctx.shadowColor = chaserColor;
            ctx.shadowBlur = 15;
            ctx.fillRect(chaser.x + 2, chaser.y + 2, 21, 21);
            ctx.shadowBlur = 0;
        });
        // Draw finish line if keys collected
        if (keysCollected >= gameStateRef.current.keysRequired) {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(canvas.width - 30, 0, 30, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Inter';
            ctx.save();
            ctx.translate(canvas.width - 15, canvas.height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillText('EXIT', 0, 5);
            ctx.restore();
        }
    }, [playerPosition, keysCollected]);
    const checkCollisions = (0, react_1.useCallback)(() => {
        const playerRect = {
            x: playerPosition.x,
            y: playerPosition.y,
            width: 20,
            height: 20
        };
        // Check obstacle collisions
        gameStateRef.current.obstacles.forEach(obstacle => {
            if (obstacle.x < playerRect.x + playerRect.width &&
                obstacle.x + obstacle.width > playerRect.x &&
                obstacle.y < playerRect.y + playerRect.height &&
                obstacle.y + obstacle.height > playerRect.y) {
                if (obstacle.type === 'trap' && !powerUpManager_1.powerUpManager.isActive('shield')) {
                    setLives(prev => prev - 1);
                    setPlayerPosition({ x: 50, y: 300 }); // Reset position
                }
            }
        });
        // Check collectible collisions
        gameStateRef.current.collectibles.forEach((collectible, index) => {
            if (!collectible.collected &&
                collectible.x < playerRect.x + playerRect.width &&
                collectible.x + 15 > playerRect.x &&
                collectible.y < playerRect.y + playerRect.height &&
                collectible.y + 15 > playerRect.y) {
                gameStateRef.current.collectibles[index].collected = true;
                switch (collectible.type) {
                    case 'key':
                        setKeysCollected(prev => prev + 1);
                        setScore(prev => prev + 100);
                        break;
                    case 'token':
                        setScore(prev => prev + 25);
                        break;
                    case 'powerup':
                        // Activate random power-up
                        const powerUps = ['speed_boost', 'shield', 'time_master'];
                        const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
                        powerUpManager_1.powerUpManager.activatePowerUp(randomPowerUp);
                        break;
                }
            }
        });
        // Check chaser collisions
        gameStateRef.current.chasers.forEach(chaser => {
            const distance = Math.sqrt(Math.pow(chaser.x - playerPosition.x, 2) +
                Math.pow(chaser.y - playerPosition.y, 2));
            if (distance < 30 && !powerUpManager_1.powerUpManager.isActive('shield')) {
                setLives(prev => prev - 1);
                setPlayerPosition({ x: 50, y: 300 });
            }
        });
    }, [playerPosition]);
    const handleKeyPress = (0, react_1.useCallback)((e) => {
        if (!isGameActive)
            return;
        const speed = powerUpManager_1.powerUpManager.isActive('speed_boost') ?
            gameStateRef.current.playerSpeed * 1.5 :
            gameStateRef.current.playerSpeed;
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                setPlayerPosition(prev => (Object.assign(Object.assign({}, prev), { y: Math.max(0, prev.y - speed) })));
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                setPlayerPosition(prev => (Object.assign(Object.assign({}, prev), { y: Math.min(380, prev.y + speed) })));
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                setPlayerPosition(prev => (Object.assign(Object.assign({}, prev), { x: Math.max(0, prev.x - speed) })));
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                setPlayerPosition(prev => (Object.assign(Object.assign({}, prev), { x: Math.min(780, prev.x + speed) })));
                break;
        }
    }, [isGameActive]);
    // Initialize enemy systems
    (0, react_1.useEffect)(() => {
        if (!canvasRef.current)
            return;
        enemyManagerRef.current = new enemyManager_1.EnemyManager(canvasRef.current);
        bossManagerRef.current = new bossManager_1.BossManager(canvasRef.current);
        const enemyManager = enemyManagerRef.current;
        // Add various enemies throughout the level
        enemyManager.addEnemy(enemyManager.createHunter(400, 150));
        enemyManager.addEnemy(enemyManager.createPatrolEnemy(600, 200, [
            { x: 600, y: 200 },
            { x: 800, y: 300 }
        ]));
        enemyManager.addEnemy(enemyManager.createSniper(1000, 100));
        enemyManager.addEnemy(enemyManager.createGuard(1200, 250));
        // Add environmental hazards
        enemyManager.addHazard(enemyManager.createLavaPool(500, 350, 100, 50));
        enemyManager.addHazard(enemyManager.createPoisonGas(800, 50, 80, 80));
        // Add power-ups for survival
        enemyManager.addPowerUp(enemyManager.createShield(350, 200));
        enemyManager.addPowerUp(enemyManager.createSpeedBoost(750, 150));
    }, []);
    (0, react_1.useEffect)(() => {
        // Initialize game objects
        gameStateRef.current.obstacles = generateObstacles();
        gameStateRef.current.collectibles = generateCollectibles();
        // Set up power-up system
        powerUpManager_1.powerUpManager.initialize();
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress, generateObstacles, generateCollectibles]);
    (0, react_1.useEffect)(() => {
        if (!isGameActive)
            return;
        const gameLoop = () => {
            // Move obstacles and chasers
            gameStateRef.current.obstacles.forEach(obstacle => {
                obstacle.x -= gameStateRef.current.scrollSpeed;
            });
            gameStateRef.current.collectibles.forEach(collectible => {
                collectible.x -= gameStateRef.current.scrollSpeed;
            });
            // Update chasers
            gameStateRef.current.chasers.forEach(chaser => {
                chaser.x += chaser.speed;
                // Simple AI to follow player
                if (chaser.y < playerPosition.y - 10)
                    chaser.y += 0.5;
                if (chaser.y > playerPosition.y + 10)
                    chaser.y -= 0.5;
            });
            // Update enemy system
            if (enemyManagerRef.current) {
                enemyManagerRef.current.updateEnemies(playerPosition.x, playerPosition.y, 16);
                // Check power-up collisions
                const hitPowerUp = enemyManagerRef.current.checkPlayerPowerUpCollision(playerPosition.x, playerPosition.y, 20, 20);
                if (hitPowerUp) {
                    setActivePowerUps(prev => [...prev, hitPowerUp.type]);
                    setTimeout(() => {
                        setActivePowerUps(prev => prev.filter(p => p !== hitPowerUp.type));
                    }, hitPowerUp.duration);
                }
                // Check enemy collisions
                const hitEnemy = enemyManagerRef.current.checkPlayerEnemyCollision(playerPosition.x, playerPosition.y, 20, 20);
                if (hitEnemy && !activePowerUps.includes('Shield')) {
                    setLives(prev => prev - 1);
                    setPlayerPosition({ x: 50, y: 300 });
                }
                // Check hazard collisions
                const hitHazard = enemyManagerRef.current.checkPlayerHazardCollision(playerPosition.x, playerPosition.y, 20, 20);
                if (hitHazard && !activePowerUps.includes('Shield')) {
                    setLives(prev => Math.max(0, prev - 1));
                }
            }
            // Update boss system (when boss appears at end)
            if (bossManagerRef.current && playerPosition.x > 1000) {
                bossManagerRef.current.update(playerPosition.x, playerPosition.y, 16);
                const boss = bossManagerRef.current.getBoss();
                if (boss) {
                    setBossHealth(boss.health);
                    // Check boss collision
                    const bossCollision = bossManagerRef.current.checkCollisionWithPlayer(playerPosition.x, playerPosition.y, 20, 20);
                    if (bossCollision && !activePowerUps.includes('Shield')) {
                        setLives(prev => prev - 1);
                        setPlayerPosition({ x: Math.max(50, playerPosition.x - 100), y: 300 });
                    }
                }
            }
            checkCollisions();
            drawGame();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
        // Game timer
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
        return () => clearInterval(timerInterval);
    }, [isGameActive, playerPosition, checkCollisions, drawGame, onGameComplete]);
    (0, react_1.useEffect)(() => {
        // Check win condition
        if (keysCollected >= gameStateRef.current.keysRequired &&
            playerPosition.x >= 750) {
            setIsGameActive(false);
            onGameComplete(true);
        }
    }, [keysCollected, playerPosition, onGameComplete]);
    (0, react_1.useEffect)(() => {
        // Check lose condition
        if (lives <= 0) {
            setIsGameActive(false);
            onGameComplete(false);
        }
    }, [lives, onGameComplete]);
    return (<div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="font-orbitron text-3xl font-bold mb-4 text-elimination-red">NIGHTMARE CHASE</h2>
        <div className="flex justify-center items-center space-x-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-yellow">{keysCollected}/{gameStateRef.current.keysRequired}</div>
            <span className="text-sm text-gray-400">keys collected</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-orbitron font-bold">{gameTimer}</div>
            <span className="text-sm text-gray-400">seconds remaining</span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-squid-pink">{lives}</div>
            <span className="text-sm text-gray-400">lives</span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-squid-cyan">{score}</div>
            <span className="text-sm text-gray-400">score</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <canvas ref={canvasRef} className="w-full h-96 canvas-game rounded-lg border-2 border-elimination-red"/>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-300 mb-4">
          Escape from the nightmare facility! Collect all {gameStateRef.current.keysRequired} keys while avoiding traps and outrunning the chasers.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="font-bold text-warning-yellow">🗝️ Keys</div>
            <div className="text-gray-300">Required to escape</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="font-bold text-squid-cyan">💰 Tokens</div>
            <div className="text-gray-300">Bonus points</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="font-bold text-squid-pink">🔴 Traps</div>
            <div className="text-gray-300">Damage on contact</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-2">
            <div className="font-bold text-success-green">⚡ Power-ups</div>
            <div className="text-gray-300">Temporary abilities</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          Use WASD or Arrow Keys to move. Collect power-ups for advantages!
        </div>
      </div>

      {/* Active Power-ups Display */}
      <div className="flex justify-center space-x-2">
        {powerUpManager_1.powerUpManager.isActive('shield') && (<div className="bg-blue-600/20 px-3 py-1 rounded-full text-blue-400 text-sm">
            🛡️ Shield Active
          </div>)}
        {powerUpManager_1.powerUpManager.isActive('speed_boost') && (<div className="bg-yellow-600/20 px-3 py-1 rounded-full text-yellow-400 text-sm">
            ⚡ Speed Boost
          </div>)}
        {powerUpManager_1.powerUpManager.isActive('time_master') && (<div className="bg-purple-600/20 px-3 py-1 rounded-full text-purple-400 text-sm">
            ⏰ Time Extended
          </div>)}
      </div>
    </div>);
}
