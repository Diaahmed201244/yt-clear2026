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
exports.DiceGame = DiceGame;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const neon_button_1 = require("@/components/ui/neon-button");
const useAuth_1 = require("@/lib/stores/useAuth");
const useCasino_1 = require("@/lib/stores/useCasino");
const useAudio_1 = require("@/lib/stores/useAudio");
const gameUtils_1 = require("@/lib/gameUtils");
function DiceGame() {
    const { user, updateBalance } = (0, useAuth_1.useAuth)();
    const { addGameResult } = (0, useCasino_1.useCasino)();
    const { playHit, playSuccess } = (0, useAudio_1.useAudio)();
    const [betAmount, setBetAmount] = (0, react_1.useState)(100);
    const [prediction, setPrediction] = (0, react_1.useState)('high');
    const [isRolling, setIsRolling] = (0, react_1.useState)(false);
    const [lastRoll, setLastRoll] = (0, react_1.useState)(null);
    const [lastResult, setLastResult] = (0, react_1.useState)(null);
    const [rollAnimation, setRollAnimation] = (0, react_1.useState)([]);
    const handleRoll = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        if (!user || isRolling || betAmount > user.balance || betAmount < 10) {
            return;
        }
        setIsRolling(true);
        setLastResult(null);
        playHit();
        // Update balance immediately
        updateBalance(user.balance - betAmount);
        // Animate dice roll
        for (let i = 0; i < 8; i++) {
            const animRoll = (0, gameUtils_1.rollDice)();
            setRollAnimation([animRoll]);
            yield (0, gameUtils_1.sleep)(150);
        }
        // Final roll
        const finalRoll = (0, gameUtils_1.rollDice)();
        setLastRoll(finalRoll);
        setRollAnimation([]);
        // Calculate result
        const payout = (0, gameUtils_1.calculateDiceWin)(prediction, finalRoll, betAmount);
        const won = payout > 0;
        if (won) {
            updateBalance(user.balance - betAmount + payout);
            playSuccess();
        }
        setLastResult({ won, payout });
        // Add to game history
        addGameResult({
            game: 'dice',
            bet: betAmount,
            result: { roll: finalRoll, prediction, won },
            payout
        });
        setIsRolling(false);
    }), [user, betAmount, prediction, isRolling, updateBalance, addGameResult, playHit, playSuccess]);
    const handleBetChange = (value) => {
        const amount = parseInt(value) || 0;
        setBetAmount(Math.max(10, Math.min(amount, (user === null || user === void 0 ? void 0 : user.balance) || 0)));
    };
    const quickBets = [50, 100, 250, 500, 1000];
    const getDiceEmoji = (roll) => {
        const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return faces[roll - 1] || '⚀';
    };
    const currentDiceDisplay = rollAnimation.length > 0
        ? getDiceEmoji(rollAnimation[0])
        : lastRoll ? getDiceEmoji(lastRoll) : '⚃';
    return (<card_1.Card className="p-6 casino-card">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-400 mb-2">🎲 Dice Game</h2>
        <p className="text-gray-400">Predict if the roll will be high (4-6) or low (1-3)</p>
      </div>

      {/* Dice Display */}
      <div className="mb-8 text-center">
        <div className="relative inline-block">
          <div className={`text-8xl mb-4 transition-transform duration-150 ${isRolling ? 'animate-bounce' : ''}`}>
            {currentDiceDisplay}
          </div>
          {lastRoll && !isRolling && (<div className="text-2xl font-bold text-white mb-2">
              Rolled: {lastRoll}
            </div>)}
        </div>
      </div>

      {/* Result Notification */}
      {lastResult && !isRolling && (<div className={`text-center mb-6 p-4 border rounded-lg ${lastResult.won
                ? 'bg-green-500/20 border-green-500/50'
                : 'bg-red-500/20 border-red-500/50'}`}>
          <div className={`text-2xl font-bold mb-2 ${lastResult.won ? 'text-green-400' : 'text-red-400'}`}>
            {lastResult.won ? '🎉 You Won!' : '💔 You Lost!'}
          </div>
          {lastResult.won && (<div className="text-lg text-white">
              Payout: {(0, gameUtils_1.formatCurrency)(lastResult.payout)} credits
            </div>)}
        </div>)}

      {/* Prediction Buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
          Make Your Prediction
        </label>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <neon_button_1.NeonButton variant={prediction === 'low' ? 'default' : 'secondary'} onClick={() => setPrediction('low')} disabled={isRolling} className="h-16 text-lg" glow={prediction === 'low'}>
            <div>
              <div className="font-bold">LOW</div>
              <div className="text-sm opacity-75">1, 2, 3</div>
            </div>
          </neon_button_1.NeonButton>
          <neon_button_1.NeonButton variant={prediction === 'high' ? 'default' : 'secondary'} onClick={() => setPrediction('high')} disabled={isRolling} className="h-16 text-lg" glow={prediction === 'high'}>
            <div>
              <div className="font-bold">HIGH</div>
              <div className="text-sm opacity-75">4, 5, 6</div>
            </div>
          </neon_button_1.NeonButton>
        </div>
      </div>

      {/* Betting Controls */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bet Amount
            </label>
            <input_1.Input type="number" min="10" max={(user === null || user === void 0 ? void 0 : user.balance) || 0} value={betAmount} onChange={(e) => handleBetChange(e.target.value)} className="bg-gray-800 border-gray-600 text-white" disabled={isRolling}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Potential Win
            </label>
            <div className="h-10 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md flex items-center text-green-400 font-medium">
              {(0, gameUtils_1.formatCurrency)(Math.floor(betAmount * 1.98))}
            </div>
          </div>
        </div>

        {/* Quick Bet Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Quick Bets
          </label>
          <div className="flex gap-2 flex-wrap">
            {quickBets.map((amount) => (<button_1.Button key={amount} variant="outline" size="sm" onClick={() => setBetAmount(amount)} disabled={isRolling || ((user === null || user === void 0 ? void 0 : user.balance) || 0) < amount} className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                {(0, gameUtils_1.formatCurrency)(amount)}
              </button_1.Button>))}
          </div>
        </div>

        {/* Roll Button */}
        <div className="text-center">
          <neon_button_1.NeonButton onClick={handleRoll} disabled={isRolling || !user || betAmount > ((user === null || user === void 0 ? void 0 : user.balance) || 0) || betAmount < 10} size="lg" glow className="text-xl px-12 py-4">
            {isRolling ? (<div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Rolling...
              </div>) : (`ROLL ${prediction.toUpperCase()} - ${(0, gameUtils_1.formatCurrency)(betAmount)}`)}
          </neon_button_1.NeonButton>
        </div>

        {/* Game Rules */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="font-medium text-gray-300 mb-2">How to Play:</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <div>• Predict if the dice roll will be HIGH (4, 5, 6) or LOW (1, 2, 3)</div>
            <div>• Correct predictions pay 1.98x your bet</div>
            <div>• 49% chance to win each prediction</div>
            <div>• Minimum bet: 10 credits</div>
          </div>
        </div>
      </div>
    </card_1.Card>);
}
