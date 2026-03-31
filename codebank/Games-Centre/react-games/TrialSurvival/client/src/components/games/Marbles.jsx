"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Marbles;
const react_1 = require("react");
const gsap_1 = require("gsap");
function Marbles({ onGameComplete }) {
    const [playerMarbles, setPlayerMarbles] = (0, react_1.useState)(10);
    const [aiMarbles, setAiMarbles] = (0, react_1.useState)(10);
    const [currentBet, setCurrentBet] = (0, react_1.useState)(1);
    const [selectedGuess, setSelectedGuess] = (0, react_1.useState)(null);
    const [gameTimer, setGameTimer] = (0, react_1.useState)(30);
    const [isGameActive, setIsGameActive] = (0, react_1.useState)(true);
    const [round, setRound] = (0, react_1.useState)(1);
    const [showResult, setShowResult] = (0, react_1.useState)(false);
    const [lastResult, setLastResult] = (0, react_1.useState)(null);
    const playRound = () => {
        if (!selectedGuess || !isGameActive || currentBet > playerMarbles)
            return;
        // AI picks a random number between 1-20
        const aiNumber = Math.floor(Math.random() * 20) + 1;
        const isOdd = aiNumber % 2 === 1;
        const actualResult = isOdd ? 'odd' : 'even';
        const isCorrect = selectedGuess === actualResult;
        setLastResult({
            aiNumber,
            playerGuess: selectedGuess,
            isCorrect
        });
        if (isCorrect) {
            setPlayerMarbles(prev => prev + currentBet);
            setAiMarbles(prev => prev - currentBet);
        }
        else {
            setPlayerMarbles(prev => prev - currentBet);
            setAiMarbles(prev => prev + currentBet);
        }
        setShowResult(true);
        setRound(prev => prev + 1);
        // Animate result
        gsap_1.default.from('.result-animation', {
            duration: 0.5,
            scale: 0,
            rotation: 360,
            ease: 'back.out(1.7)'
        });
        setTimeout(() => {
            setShowResult(false);
            setSelectedGuess(null);
            setCurrentBet(1);
        }, 2000);
    };
    (0, react_1.useEffect)(() => {
        if (!isGameActive)
            return;
        // Check win/lose conditions
        if (playerMarbles <= 0) {
            setIsGameActive(false);
            onGameComplete(false);
        }
        else if (aiMarbles <= 0) {
            setIsGameActive(false);
            onGameComplete(true);
        }
        // Game timer
        const timerInterval = setInterval(() => {
            setGameTimer(prev => {
                if (prev <= 1) {
                    setIsGameActive(false);
                    // Determine winner based on marbles
                    onGameComplete(playerMarbles > aiMarbles);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerInterval);
    }, [isGameActive, playerMarbles, aiMarbles, onGameComplete]);
    return (<div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="font-orbitron text-3xl font-bold mb-4">MARBLES</h2>
        <div className="flex justify-center items-center space-x-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-success-green">{playerMarbles}</div>
            <span className="text-sm text-gray-400">your marbles</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-orbitron font-bold">{gameTimer}</div>
            <span className="text-sm text-gray-400">seconds remaining</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-elimination-red">{aiMarbles}</div>
            <span className="text-sm text-gray-400">AI marbles</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-8 mb-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-4">Round {round}</h3>
          <p className="text-gray-300">
            The AI will pick a number between 1-20. Guess if it's odd or even!
          </p>
        </div>

        {showResult && lastResult && (<div className="result-animation bg-gray-700 rounded-lg p-6 mb-6 text-center">
            <h4 className="text-lg font-bold mb-2">Round Result</h4>
            <p>AI picked: <span className="text-squid-cyan font-bold">{lastResult.aiNumber}</span></p>
            <p>You guessed: <span className="text-warning-yellow font-bold">{lastResult.playerGuess}</span></p>
            <p className={`text-lg font-bold ${lastResult.isCorrect ? 'text-success-green' : 'text-elimination-red'}`}>
              {lastResult.isCorrect ? 'Correct! You win marbles!' : 'Wrong! You lose marbles!'}
            </p>
          </div>)}

        {!showResult && (<>
            {/* Bet Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Bet Amount</label>
              <div className="flex items-center space-x-4">
                <input type="range" min="1" max={playerMarbles} value={currentBet} onChange={(e) => setCurrentBet(parseInt(e.target.value))} className="flex-1" disabled={!isGameActive}/>
                <span className="text-lg font-bold text-warning-yellow w-12">{currentBet}</span>
              </div>
            </div>

            {/* Guess Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Your Guess</label>
              <div className="flex space-x-4">
                <button className={`flex-1 py-4 rounded-lg font-bold transition-colors ${selectedGuess === 'odd'
                ? 'bg-squid-pink text-white'
                : 'bg-gray-600 hover:bg-gray-500'}`} onClick={() => setSelectedGuess('odd')} disabled={!isGameActive}>
                  ODD
                </button>
                <button className={`flex-1 py-4 rounded-lg font-bold transition-colors ${selectedGuess === 'even'
                ? 'bg-squid-cyan text-white'
                : 'bg-gray-600 hover:bg-gray-500'}`} onClick={() => setSelectedGuess('even')} disabled={!isGameActive}>
                  EVEN
                </button>
              </div>
            </div>

            {/* Play Button */}
            <div className="text-center">
              <button className="px-8 py-3 bg-squid-pink hover:bg-squid-pink/80 rounded-lg font-orbitron font-bold transition-colors disabled:opacity-50" onClick={playRound} disabled={!selectedGuess || !isGameActive || currentBet > playerMarbles}>
                PLAY ROUND
              </button>
            </div>
          </>)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-400 mb-1">Your Marbles</div>
          <div className="flex justify-center space-x-1">
            {Array.from({ length: Math.min(playerMarbles, 10) }).map((_, i) => (<div key={i} className="w-3 h-3 bg-success-green rounded-full"/>))}
            {playerMarbles > 10 && <span className="text-success-green">+{playerMarbles - 10}</span>}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-400 mb-1">AI Marbles</div>
          <div className="flex justify-center space-x-1">
            {Array.from({ length: Math.min(aiMarbles, 10) }).map((_, i) => (<div key={i} className="w-3 h-3 bg-elimination-red rounded-full"/>))}
            {aiMarbles > 10 && <span className="text-elimination-red">+{aiMarbles - 10}</span>}
          </div>
        </div>
      </div>
    </div>);
}
