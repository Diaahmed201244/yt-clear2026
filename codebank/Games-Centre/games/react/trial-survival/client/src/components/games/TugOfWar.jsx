"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TugOfWar;
const react_1 = require("react");
const gsap_1 = require("gsap");
function TugOfWar({ onGameComplete }) {
    const [ropePosition, setRopePosition] = (0, react_1.useState)(0); // -100 to 100
    const [playerStrength, setPlayerStrength] = (0, react_1.useState)(0);
    const [aiStrength, setAiStrength] = (0, react_1.useState)(0);
    const [gameTimer, setGameTimer] = (0, react_1.useState)(60);
    const [isGameActive, setIsGameActive] = (0, react_1.useState)(true);
    const [clickCount, setClickCount] = (0, react_1.useState)(0);
    const canvasRef = (0, react_1.useRef)(null);
    const lastClickTime = (0, react_1.useRef)(0);
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
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        // Draw center line
        ctx.strokeStyle = '#FF6B8A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        // Draw danger zones
        ctx.fillStyle = '#FF4444';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, 50, canvas.height);
        ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);
        ctx.globalAlpha = 1;
        // Draw rope
        const ropeCenter = canvas.width / 2 + (ropePosition * (canvas.width / 200));
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(100, canvas.height / 2);
        ctx.lineTo(canvas.width - 100, canvas.height / 2);
        ctx.stroke();
        // Draw rope center marker
        ctx.fillStyle = '#FF6B8A';
        ctx.fillRect(ropeCenter - 5, canvas.height / 2 - 10, 10, 20);
        // Draw teams
        // Player team (right side)
        ctx.fillStyle = '#00FF88';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(canvas.width - 80 + (i * 10), canvas.height / 2 + 20, 8, 30);
        }
        // AI team (left side)
        ctx.fillStyle = '#FF4444';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(20 + (i * 10), canvas.height / 2 + 20, 8, 30);
        }
        // Draw strength indicators
        ctx.font = '16px Inter';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Player: ${playerStrength}`, canvas.width - 150, 30);
        ctx.fillText(`AI: ${aiStrength}`, 20, 30);
    };
    const handlePull = () => {
        if (!isGameActive)
            return;
        const now = Date.now();
        const timeDiff = now - lastClickTime.current;
        // Reward rapid clicking
        const strengthGain = timeDiff < 200 ? 3 : 1;
        setPlayerStrength(prev => prev + strengthGain);
        setClickCount(prev => prev + 1);
        lastClickTime.current = now;
        // Visual feedback
        gsap_1.default.to('.pull-button', {
            duration: 0.1,
            scale: 0.95,
            yoyo: true,
            repeat: 1,
            ease: 'power2.out'
        });
    };
    (0, react_1.useEffect)(() => {
        if (!isGameActive)
            return;
        const gameLoop = () => {
            drawGame();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
        // AI strength simulation
        const aiInterval = setInterval(() => {
            if (isGameActive) {
                setAiStrength(prev => prev + Math.random() * 2 + 1);
            }
        }, 300 + Math.random() * 200);
        // Game timer
        const timerInterval = setInterval(() => {
            setGameTimer(prev => {
                if (prev <= 1) {
                    setIsGameActive(false);
                    // Determine winner based on final rope position
                    onGameComplete(ropePosition > 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => {
            clearInterval(aiInterval);
            clearInterval(timerInterval);
        };
    }, [isGameActive, ropePosition, onGameComplete]);
    (0, react_1.useEffect)(() => {
        // Update rope position based on strength difference
        const strengthDiff = playerStrength - aiStrength;
        const newPosition = Math.max(-100, Math.min(100, strengthDiff / 2));
        setRopePosition(newPosition);
        // Check for victory/defeat conditions
        if (newPosition >= 90) {
            setIsGameActive(false);
            onGameComplete(true);
        }
        else if (newPosition <= -90) {
            setIsGameActive(false);
            onGameComplete(false);
        }
    }, [playerStrength, aiStrength, onGameComplete]);
    return (<div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="font-orbitron text-3xl font-bold mb-4">TUG OF WAR</h2>
        <div className="flex justify-center items-center space-x-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-success-green">{playerStrength}</div>
            <span className="text-sm text-gray-400">your strength</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-orbitron font-bold">{gameTimer}</div>
            <span className="text-sm text-gray-400">seconds remaining</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-elimination-red">{aiStrength}</div>
            <span className="text-sm text-gray-400">AI strength</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <canvas ref={canvasRef} className="w-full h-64 canvas-game rounded-lg"/>
      </div>

      <div className="text-center mb-6">
        <div className="mb-4">
          <div className="text-lg font-bold mb-2">
            Rope Position: {ropePosition > 0 ? '+' : ''}{ropePosition.toFixed(1)}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div className="h-4 rounded-full transition-all duration-300" style={{
            width: '50%',
            marginLeft: `${Math.max(0, Math.min(50, 25 + ropePosition / 4))}%`,
            backgroundColor: ropePosition > 0 ? '#00FF88' : '#FF4444'
        }}/>
          </div>
        </div>
        
        <button className="pull-button px-12 py-6 bg-squid-pink hover:bg-squid-pink/80 rounded-lg font-orbitron font-bold text-xl transition-colors disabled:opacity-50" onClick={handlePull} disabled={!isGameActive}>
          PULL! ({clickCount} clicks)
        </button>
        
        <p className="text-gray-300 mt-4">
          Click rapidly to pull the rope! Get the rope to your side to win!
        </p>
      </div>
    </div>);
}
