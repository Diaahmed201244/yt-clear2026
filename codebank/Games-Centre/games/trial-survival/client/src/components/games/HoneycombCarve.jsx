"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HoneycombCarve;
const react_1 = require("react");
const enemyManager_1 = require("@/lib/enemyManager");
const shapes = [
    { name: 'Circle', path: 'M50,20 A30,30 0 1,1 50,19' },
    { name: 'Star', path: 'M50,10 L55,25 L70,25 L58,35 L62,50 L50,40 L38,50 L42,35 L30,25 L45,25 Z' },
    { name: 'Triangle', path: 'M50,10 L80,80 L20,80 Z' },
    { name: 'Umbrella', path: 'M50,20 A30,30 0 1,1 50,19 M50,50 L50,80 M45,75 L55,75' }
];
function HoneycombCarve({ onGameComplete }) {
    const canvasRef = (0, react_1.useRef)(null);
    const [selectedShape, setSelectedShape] = (0, react_1.useState)(shapes[Math.floor(Math.random() * shapes.length)]);
    const [gameTimer, setGameTimer] = (0, react_1.useState)(60);
    const [isGameActive, setIsGameActive] = (0, react_1.useState)(true);
    const [traceProgress, setTraceProgress] = (0, react_1.useState)(0);
    const [cracksLevel, setCracksLevel] = (0, react_1.useState)(0);
    const [isTracing, setIsTracing] = (0, react_1.useState)(false);
    const [playerHealth, setPlayerHealth] = (0, react_1.useState)(100);
    const [electricFenceActive, setElectricFenceActive] = (0, react_1.useState)(false);
    const enemyManagerRef = (0, react_1.useRef)(null);
    const gameStateRef = (0, react_1.useRef)({
        lastMousePos: { x: 0, y: 0 },
        tracedPath: [],
        tolerance: 15,
        lastUpdate: 0,
        mistakes: 0,
        maxMistakes: 3
    });
    const drawGame = () => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        // Clear canvas
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw honeycomb background
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
        // Draw obstacles and enemies first (background layer)
        if (enemyManagerRef.current) {
            enemyManagerRef.current.render();
        }
        // Draw electric fence warning if active
        if (electricFenceActive) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, 20);
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
            ctx.fillRect(0, 0, 20, canvas.height);
            ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);
            ctx.fillStyle = '#FFFF00';
            ctx.font = '14px Inter';
            ctx.fillText('⚡ ELECTRIC FENCE ACTIVE ⚡', canvas.width / 2 - 100, 15);
        }
        // Draw shape outline
        ctx.strokeStyle = gameStateRef.current.mistakes > 1 ? '#FF4444' : '#654321';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        // Simple shape drawing based on selected shape
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = 80;
        ctx.beginPath();
        switch (selectedShape.name) {
            case 'Circle':
                ctx.arc(centerX, centerY, size, 0, 2 * Math.PI);
                break;
            case 'Triangle':
                ctx.moveTo(centerX, centerY - size);
                ctx.lineTo(centerX - size, centerY + size);
                ctx.lineTo(centerX + size, centerY + size);
                ctx.closePath();
                break;
            case 'Star':
                // Simple star shape
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI) / 5;
                    const x = centerX + Math.cos(angle) * size;
                    const y = centerY + Math.sin(angle) * size;
                    if (i === 0)
                        ctx.moveTo(x, y);
                    else
                        ctx.lineTo(x, y);
                }
                ctx.closePath();
                break;
            default:
                ctx.arc(centerX, centerY, size, 0, 2 * Math.PI);
        }
        ctx.stroke();
        // Draw traced path
        if (gameStateRef.current.tracedPath.length > 1) {
            ctx.strokeStyle = playerHealth > 50 ? '#00FF88' : '#FFAA00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            gameStateRef.current.tracedPath.forEach((point, index) => {
                if (index === 0)
                    ctx.moveTo(point.x, point.y);
                else
                    ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        }
        // Draw cracks
        if (cracksLevel > 0) {
            ctx.strokeStyle = '#FF4444';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            for (let i = 0; i < cracksLevel; i++) {
                ctx.beginPath();
                const startX = Math.random() * canvas.width;
                const startY = Math.random() * canvas.height;
                const endX = startX + (Math.random() - 0.5) * 40;
                const endY = startY + (Math.random() - 0.5) * 40;
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        }
        // Draw health bar
        ctx.fillStyle = '#333333';
        ctx.fillRect(10, 10, 200, 20);
        ctx.fillStyle = playerHealth > 60 ? '#00FF00' : playerHealth > 30 ? '#FFAA00' : '#FF0000';
        ctx.fillRect(10, 10, (200 * playerHealth) / 100, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Inter';
        ctx.fillText(`Health: ${playerHealth}%`, 15, 25);
        // Draw mistake counter
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Mistakes: ${gameStateRef.current.mistakes}/${gameStateRef.current.maxMistakes}`, 10, canvas.height - 10);
    };
    const handleMouseMove = (e) => {
        if (!isTracing || !isGameActive)
            return;
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Check if mouse is within tolerance of the shape outline
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const distance = Math.sqrt(Math.pow((x - centerX), 2) + Math.pow((y - centerY), 2));
        const expectedDistance = 80; // Size of our shape
        if (Math.abs(distance - expectedDistance) > gameStateRef.current.tolerance) {
            // Mouse strayed too far - add crack
            setCracksLevel(prev => {
                const newLevel = prev + 1;
                if (newLevel >= 5) {
                    setIsGameActive(false);
                    onGameComplete(false);
                }
                return newLevel;
            });
        }
        else {
            // Good tracing
            gameStateRef.current.tracedPath.push({ x, y });
            setTraceProgress(prev => {
                const newProgress = Math.min(prev + 2, 100);
                if (newProgress >= 100) {
                    setIsGameActive(false);
                    onGameComplete(true);
                }
                return newProgress;
            });
        }
        gameStateRef.current.lastMousePos = { x, y };
    };
    // Initialize enemies and obstacles
    (0, react_1.useEffect)(() => {
        if (!canvasRef.current)
            return;
        const canvas = canvasRef.current;
        enemyManagerRef.current = new enemyManager_1.EnemyManager(canvas);
        const enemyManager = enemyManagerRef.current;
        // Add guard that watches the player
        enemyManager.addEnemy(enemyManager.createGuard(50, 50));
        // Add electric fences around the edges (activated periodically)
        enemyManager.addObstacle(enemyManager.createElectricFence(0, 0, canvas.offsetWidth, 20));
        enemyManager.addObstacle(enemyManager.createElectricFence(0, canvas.offsetHeight - 20, canvas.offsetWidth, 20));
        enemyManager.addObstacle(enemyManager.createElectricFence(0, 0, 20, canvas.offsetHeight));
        enemyManager.addObstacle(enemyManager.createElectricFence(canvas.offsetWidth - 20, 0, 20, canvas.offsetHeight));
        // Add hazardous areas that activate when player makes mistakes
        enemyManager.addHazard(enemyManager.createPoisonGas(100, 100, 80, 80));
        enemyManager.addHazard(enemyManager.createLavaPool(canvas.offsetWidth - 180, canvas.offsetHeight - 180, 80, 80));
        // Electric fence activation pattern
        const fenceInterval = setInterval(() => {
            setElectricFenceActive(prev => !prev);
        }, 5000);
        return () => clearInterval(fenceInterval);
    }, []);
    (0, react_1.useEffect)(() => {
        if (!isGameActive)
            return;
        const gameLoop = () => {
            // Update enemies and check for environmental hazards
            if (enemyManagerRef.current) {
                enemyManagerRef.current.updateEnemies(gameStateRef.current.lastMousePos.x, gameStateRef.current.lastMousePos.y, 16);
                // Check for hazard damage when player makes mistakes
                if (gameStateRef.current.mistakes > 0) {
                    const hazardHit = enemyManagerRef.current.checkPlayerHazardCollision(gameStateRef.current.lastMousePos.x, gameStateRef.current.lastMousePos.y, 10, 10);
                    if (hazardHit) {
                        setPlayerHealth(prev => Math.max(0, prev - 5));
                    }
                }
                // Electric fence damage when active
                if (electricFenceActive && gameStateRef.current.lastMousePos.x && gameStateRef.current.lastMousePos.y) {
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const edgeDistance = 25;
                        if (gameStateRef.current.lastMousePos.x < edgeDistance ||
                            gameStateRef.current.lastMousePos.x > canvas.offsetWidth - edgeDistance ||
                            gameStateRef.current.lastMousePos.y < edgeDistance ||
                            gameStateRef.current.lastMousePos.y > canvas.offsetHeight - edgeDistance) {
                            setPlayerHealth(prev => Math.max(0, prev - 10));
                        }
                    }
                }
            }
            drawGame();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
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
    }, [isGameActive, selectedShape, cracksLevel, onGameComplete, electricFenceActive, playerHealth]);
    return (<div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="font-orbitron text-3xl font-bold mb-4">HONEYCOMB CARVE</h2>
        <div className="flex justify-center items-center space-x-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-squid-cyan">{selectedShape.name}</div>
            <span className="text-sm text-gray-400">shape to carve</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-orbitron font-bold">{gameTimer}</div>
            <span className="text-sm text-gray-400">seconds remaining</span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-warning-yellow">{cracksLevel}/5</div>
            <span className="text-sm text-gray-400">cracks</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <canvas ref={canvasRef} className="w-full h-64 canvas-game rounded-lg cursor-crosshair" onMouseDown={() => setIsTracing(true)} onMouseUp={() => setIsTracing(false)} onMouseMove={handleMouseMove} onMouseLeave={() => setIsTracing(false)}/>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-300 mb-4">
          Carefully trace around the {selectedShape.name.toLowerCase()} shape. 
          Stay within the lines or the honeycomb will crack!
        </p>
        <div className="flex justify-center space-x-4">
          <div className="px-4 py-2 bg-gray-700 rounded-lg">
            <span className="text-sm">Hold mouse button and trace carefully</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Carving Progress</span>
          <span>{Math.round(traceProgress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div className="bg-squid-cyan h-3 rounded-full transition-all duration-300" style={{ width: `${traceProgress}%` }}/>
        </div>
      </div>
    </div>);
}
