"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GlassBridge;
const react_1 = require("react");
const gsap_1 = require("gsap");
function GlassBridge({ onGameComplete }) {
    const canvasRef = (0, react_1.useRef)(null);
    const [currentStep, setCurrentStep] = (0, react_1.useState)(0);
    const [gameTimer, setGameTimer] = (0, react_1.useState)(45);
    const [isGameActive, setIsGameActive] = (0, react_1.useState)(true);
    const [panels, setPanels] = (0, react_1.useState)([]);
    const [playerPosition, setPlayerPosition] = (0, react_1.useState)(0);
    const totalSteps = 8;
    // Initialize panels
    (0, react_1.useEffect)(() => {
        const newPanels = [];
        for (let i = 0; i < totalSteps; i++) {
            // Randomly determine which panel is strong for each step
            const strongSide = Math.random() < 0.5 ? 'left' : 'right';
            newPanels.push({
                id: i * 2,
                isStrong: strongSide === 'left',
                isRevealed: false,
                side: 'left'
            });
            newPanels.push({
                id: i * 2 + 1,
                isStrong: strongSide === 'right',
                isRevealed: false,
                side: 'right'
            });
        }
        setPanels(newPanels);
    }, []);
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
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw bridge structure
        const stepWidth = canvas.width / totalSteps;
        const panelWidth = stepWidth * 0.4;
        const panelHeight = 60;
        const bridgeY = canvas.height / 2 - panelHeight / 2;
        for (let step = 0; step < totalSteps; step++) {
            const x = step * stepWidth;
            const leftPanel = panels[step * 2];
            const rightPanel = panels[step * 2 + 1];
            // Draw left panel
            if (leftPanel) {
                ctx.fillStyle = leftPanel.isRevealed
                    ? (leftPanel.isStrong ? '#00FF88' : '#FF4444')
                    : (step <= currentStep ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)');
                ctx.fillRect(x + 10, bridgeY, panelWidth, panelHeight);
                // Draw panel border
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 10, bridgeY, panelWidth, panelHeight);
            }
            // Draw right panel
            if (rightPanel) {
                ctx.fillStyle = rightPanel.isRevealed
                    ? (rightPanel.isStrong ? '#00FF88' : '#FF4444')
                    : (step <= currentStep ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)');
                ctx.fillRect(x + stepWidth - panelWidth - 10, bridgeY, panelWidth, panelHeight);
                // Draw panel border
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + stepWidth - panelWidth - 10, bridgeY, panelWidth, panelHeight);
            }
            // Draw step number
            ctx.fillStyle = '#fff';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${step + 1}`, x + stepWidth / 2, bridgeY - 10);
        }
        // Draw player
        if (currentStep < totalSteps) {
            const playerX = currentStep * stepWidth + stepWidth / 2;
            ctx.fillStyle = '#FF6B8A';
            ctx.fillRect(playerX - 10, bridgeY + panelHeight + 10, 20, 30);
        }
        // Draw finish line
        ctx.fillStyle = '#00FF88';
        ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '16px Inter';
        ctx.save();
        ctx.translate(canvas.width - 10, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('FINISH', 0, 5);
        ctx.restore();
    };
    const handlePanelClick = (side) => {
        if (!isGameActive || currentStep >= totalSteps)
            return;
        const leftPanel = panels[currentStep * 2];
        const rightPanel = panels[currentStep * 2 + 1];
        const selectedPanel = side === 'left' ? leftPanel : rightPanel;
        if (!selectedPanel)
            return;
        // Reveal the selected panel
        setPanels(prev => prev.map(panel => panel.id === selectedPanel.id
            ? Object.assign(Object.assign({}, panel), { isRevealed: true }) : panel));
        if (selectedPanel.isStrong) {
            // Correct choice - move to next step
            setCurrentStep(prev => prev + 1);
            setPlayerPosition(prev => prev + 1);
            // Animate success
            gsap_1.default.to('.panel-success', {
                duration: 0.3,
                scale: 1.1,
                yoyo: true,
                repeat: 1,
                ease: 'power2.out'
            });
            // Check if reached the end
            if (currentStep + 1 >= totalSteps) {
                setIsGameActive(false);
                onGameComplete(true);
            }
        }
        else {
            // Wrong choice - elimination
            gsap_1.default.to('.panel-break', {
                duration: 0.5,
                scale: 0,
                rotation: 180,
                ease: 'power2.in',
                onComplete: () => {
                    setIsGameActive(false);
                    onGameComplete(false);
                }
            });
        }
    };
    (0, react_1.useEffect)(() => {
        if (!isGameActive)
            return;
        const gameLoop = () => {
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
    }, [isGameActive, panels, currentStep, onGameComplete]);
    return (<div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="font-orbitron text-3xl font-bold mb-4">GLASS BRIDGE</h2>
        <div className="flex justify-center items-center space-x-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-squid-cyan">{currentStep}/{totalSteps}</div>
            <span className="text-sm text-gray-400">steps completed</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-orbitron font-bold">{gameTimer}</div>
            <span className="text-sm text-gray-400">seconds remaining</span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-warning-yellow">80%</div>
            <span className="text-sm text-gray-400">elimination rate</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <canvas ref={canvasRef} className="w-full h-80 canvas-game rounded-lg"/>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-300 mb-6">
          Choose the correct glass panel. One panel in each pair is strong (tempered glass), 
          the other will shatter. Choose wisely - one wrong step means elimination!
        </p>
        
        {isGameActive && currentStep < totalSteps && (<div className="flex justify-center space-x-8">
            <button className="panel-success px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-orbitron font-bold transition-colors" onClick={() => handlePanelClick('left')}>
              CHOOSE LEFT
            </button>
            <button className="panel-break px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-orbitron font-bold transition-colors" onClick={() => handlePanelClick('right')}>
              CHOOSE RIGHT
            </button>
          </div>)}
      </div>

      <div className="mt-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Bridge Progress</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div className="bg-squid-cyan h-3 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }}/>
        </div>
      </div>
    </div>);
}
