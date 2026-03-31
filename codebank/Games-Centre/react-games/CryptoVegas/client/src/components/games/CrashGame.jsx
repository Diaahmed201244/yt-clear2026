"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrashGame = CrashGame;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const neon_button_1 = require("@/components/ui/neon-button");
const useAuth_1 = require("@/lib/stores/useAuth");
const useCasino_1 = require("@/lib/stores/useCasino");
const useAudio_1 = require("@/lib/stores/useAudio");
const gameUtils_1 = require("@/lib/gameUtils");
function CrashGame() {
    const { user, updateBalance } = (0, useAuth_1.useAuth)();
    const { addGameResult } = (0, useCasino_1.useCasino)();
    const { playHit, playSuccess } = (0, useAudio_1.useAudio)();
    const [betAmount, setBetAmount] = (0, react_1.useState)(100);
    const [gamePhase, setGamePhase] = (0, react_1.useState)('betting');
    const [currentMultiplier, setCurrentMultiplier] = (0, react_1.useState)(1.00);
    const [crashPoint, setCrashPoint] = (0, react_1.useState)(null);
    const [playerBet, setPlayerBet] = (0, react_1.useState)(null);
    const [cashedOut, setCashedOut] = (0, react_1.useState)(false);
    const [cashoutMultiplier, setCashoutMultiplier] = (0, react_1.useState)(null);
    const [countdown, setCountdown] = (0, react_1.useState)(null);
    const gameInterval = (0, react_1.useRef)(null);
    const countdownInterval = (0, react_1.useRef)(null);
    // Start new game
    const startNewGame = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        setGamePhase('betting');
        setCurrentMultiplier(1.00);
        setCrashPoint(null);
        setPlayerBet(null);
        setCashedOut(false);
        setCashoutMultiplier(null);
        setCountdown(5);
        // Countdown before next round
        countdownInterval.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev === null || prev <= 1) {
                    if (countdownInterval.current) {
                        clearInterval(countdownInterval.current);
                    }
                    startFlying();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    }), []);
    const startFlying = (0, react_1.useCallback)(() => {
        const newCrashPoint = (0, gameUtils_1.generateCrashPoint)();
        setCrashPoint(newCrashPoint);
        setGamePhase('flying');
        setCountdown(null);
        console.log('Game starting, crash point:', newCrashPoint);
        let multiplier = 1.00;
        const startTime = Date.now();
        gameInterval.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            multiplier = 1.00 + (elapsed / 1000) * 0.5; // Increase by 0.5x per second
            setCurrentMultiplier(multiplier);
            if (multiplier >= newCrashPoint) {
                // Game crashed
                if (gameInterval.current) {
                    clearInterval(gameInterval.current);
                }
                setGamePhase('crashed');
                playHit();
                // Handle player result if they had a bet
                if (playerBet && !cashedOut) {
                    addGameResult({
                        game: 'crash',
                        bet: playerBet,
                        result: { crashPoint: newCrashPoint, cashedOut: false },
                        payout: 0
                    });
                }
                setTimeout(startNewGame, 3000);
            }
        }, 100);
    }, [playerBet, cashedOut, addGameResult, playHit, startNewGame]);
    // Place bet
    const placeBet = (0, react_1.useCallback)(() => {
        if (!user || gamePhase !== 'betting' || betAmount > user.balance || betAmount < 10) {
            return;
        }
        setPlayerBet(betAmount);
        updateBalance(user.balance - betAmount);
        playHit();
        console.log('Bet placed:', betAmount);
    }, [user, gamePhase, betAmount, updateBalance, playHit]);
    // Cash out
    const cashOut = (0, react_1.useCallback)(() => {
        if (!playerBet || cashedOut || gamePhase !== 'flying') {
            return;
        }
        setCashedOut(true);
        setCashoutMultiplier(currentMultiplier);
        const payout = Math.floor(playerBet * currentMultiplier);
        updateBalance(((user === null || user === void 0 ? void 0 : user.balance) || 0) + payout);
        playSuccess();
        addGameResult({
            game: 'crash',
            bet: playerBet,
            result: { crashPoint: crashPoint || 0, cashedOut: true, cashoutAt: currentMultiplier },
            payout
        });
        console.log('Cashed out at:', currentMultiplier, 'payout:', payout);
    }, [playerBet, cashedOut, gamePhase, currentMultiplier, user, updateBalance, playSuccess, addGameResult, crashPoint]);
    const handleBetChange = (value) => {
        const amount = parseInt(value) || 0;
        setBetAmount(Math.max(10, Math.min(amount, (user === null || user === void 0 ? void 0 : user.balance) || 0)));
    };
    // Initialize game on mount
    (0, react_1.useEffect)(() => {
        startNewGame();
        return () => {
            if (gameInterval.current) {
                clearInterval(gameInterval.current);
            }
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
        };
    }, [startNewGame]);
    const quickBets = [50, 100, 250, 500, 1000];
    const getMultiplierColor = () => {
        if (gamePhase === 'crashed')
            return 'text-red-500';
        if (currentMultiplier < 2)
            return 'text-green-400';
        if (currentMultiplier < 5)
            return 'text-yellow-400';
        if (currentMultiplier < 10)
            return 'text-orange-400';
        return 'text-red-400';
    };
    return (<card_1.Card className="p-6 casino-card">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-400 mb-2">🚀 Crash Game</h2>
        <p className="text-gray-400">Cash out before the rocket crashes!</p>
      </div>

      {/* Game Display */}
      <div className="mb-8 text-center">
        <div className="relative h-40 bg-gradient-to-b from-blue-900/20 to-purple-900/20 rounded-lg border border-gray-600 flex items-center justify-center mb-4">
          {countdown !== null ? (<div className="text-6xl font-bold text-white">
              {countdown}
            </div>) : (<>
              <div className={`crash-multiplier ${getMultiplierColor()}`}>
                {currentMultiplier.toFixed(2)}x
              </div>
              {gamePhase === 'flying' && (<div className="absolute top-4 left-4 text-4xl animate-bounce">
                  🚀
                </div>)}
              {gamePhase === 'crashed' && (<div className="absolute top-4 left-4 text-4xl">
                  💥
                </div>)}
            </>)}
        </div>
        
        {gamePhase === 'crashed' && crashPoint && (<div className="text-lg font-semibold text-red-400 mb-2">
            Crashed at {crashPoint.toFixed(2)}x
          </div>)}
        
        {cashedOut && cashoutMultiplier && (<div className="text-lg font-semibold text-green-400 mb-2">
            ✅ Cashed out at {cashoutMultiplier.toFixed(2)}x
          </div>)}
      </div>

      {/* Player Controls */}
      <div className="space-y-4">
        {/* Betting Controls - Only show during betting phase */}
        {gamePhase === 'betting' && !playerBet && (<>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bet Amount
                </label>
                <input_1.Input type="number" min="10" max={(user === null || user === void 0 ? void 0 : user.balance) || 0} value={betAmount} onChange={(e) => handleBetChange(e.target.value)} className="bg-gray-800 border-gray-600 text-white"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Potential @2x
                </label>
                <div className="h-10 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md flex items-center text-green-400 font-medium">
                  {(0, gameUtils_1.formatCurrency)(betAmount * 2)}
                </div>
              </div>
            </div>

            {/* Quick Bet Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quick Bets
              </label>
              <div className="flex gap-2 flex-wrap">
                {quickBets.map((amount) => (<button_1.Button key={amount} variant="outline" size="sm" onClick={() => setBetAmount(amount)} disabled={((user === null || user === void 0 ? void 0 : user.balance) || 0) < amount} className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                    {(0, gameUtils_1.formatCurrency)(amount)}
                  </button_1.Button>))}
              </div>
            </div>

            {/* Place Bet Button */}
            <div className="text-center">
              <neon_button_1.NeonButton onClick={placeBet} disabled={!user || betAmount > ((user === null || user === void 0 ? void 0 : user.balance) || 0) || betAmount < 10} size="lg" glow className="text-xl px-12 py-4">
                BET {(0, gameUtils_1.formatCurrency)(betAmount)}
              </neon_button_1.NeonButton>
            </div>
          </>)}

        {/* Cash Out Button - Show during flying phase if player has bet */}
        {gamePhase === 'flying' && playerBet && !cashedOut && (<div className="text-center">
            <neon_button_1.NeonButton onClick={cashOut} size="lg" glow className="text-xl px-12 py-4 pulse-neon">
              CASH OUT {(0, gameUtils_1.formatCurrency)(Math.floor(playerBet * currentMultiplier))}
            </neon_button_1.NeonButton>
          </div>)}

        {/* Waiting Message */}
        {((gamePhase === 'betting' && playerBet) || gamePhase === 'crashed') && (<div className="text-center py-8">
            <div className="text-gray-400">
              {gamePhase === 'betting' ? 'Waiting for round to start...' : 'Next round starting soon...'}
            </div>
            {playerBet && (<div className="text-green-400 font-medium mt-2">
                Your bet: {(0, gameUtils_1.formatCurrency)(playerBet)}
              </div>)}
          </div>)}

        {/* Game Rules */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="font-medium text-gray-300 mb-2">How to Play:</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <div>• Place your bet before the rocket takes off</div>
            <div>• Watch the multiplier increase as the rocket flies</div>
            <div>• Cash out before it crashes to win your bet × multiplier</div>
            <div>• If the rocket crashes before you cash out, you lose your bet</div>
            <div>• Higher multipliers = higher risk but bigger rewards!</div>
          </div>
        </div>
      </div>
    </card_1.Card>);
}
