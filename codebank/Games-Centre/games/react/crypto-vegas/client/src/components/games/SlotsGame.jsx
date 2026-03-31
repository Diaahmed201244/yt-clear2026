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
exports.SlotsGame = SlotsGame;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const neon_button_1 = require("@/components/ui/neon-button");
const useAuth_1 = require("@/lib/stores/useAuth");
const useCasino_1 = require("@/lib/stores/useCasino");
const useAudio_1 = require("@/lib/stores/useAudio");
const gameUtils_1 = require("@/lib/gameUtils");
function SlotsGame() {
    const { user, updateBalance } = (0, useAuth_1.useAuth)();
    const { addGameResult } = (0, useCasino_1.useCasino)();
    const { playHit, playSuccess } = (0, useAudio_1.useAudio)();
    const [reels, setReels] = (0, react_1.useState)([
        ['🍒', '🍋', '🍊'],
        ['🍇', '🔔', '💎'],
        ['⭐', '💰', '🍒']
    ]);
    const [betAmount, setBetAmount] = (0, react_1.useState)(100);
    const [isSpinning, setIsSpinning] = (0, react_1.useState)(false);
    const [lastWin, setLastWin] = (0, react_1.useState)(null);
    const handleSpin = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        if (!user || isSpinning || betAmount > user.balance || betAmount < 10) {
            return;
        }
        setIsSpinning(true);
        setLastWin(null);
        playHit();
        // Update balance immediately
        updateBalance(user.balance - betAmount);
        // Simulate spinning animation
        for (let i = 0; i < 10; i++) {
            setReels((0, gameUtils_1.generateSlotReels)());
            yield (0, gameUtils_1.sleep)(100);
        }
        // Generate final result
        const finalReels = (0, gameUtils_1.generateSlotReels)();
        setReels(finalReels);
        // Check for wins
        const winResult = (0, gameUtils_1.checkSlotWin)(finalReels);
        let payout = 0;
        if (winResult.isWin) {
            payout = Math.floor(betAmount * winResult.multiplier);
            updateBalance(user.balance - betAmount + payout);
            setLastWin({ amount: payout, lines: winResult.lines });
            playSuccess();
        }
        // Add to game history
        addGameResult({
            game: 'slots',
            bet: betAmount,
            result: { reels: finalReels, win: winResult },
            payout
        });
        setIsSpinning(false);
    }), [user, betAmount, isSpinning, updateBalance, addGameResult, playHit, playSuccess]);
    const handleBetChange = (value) => {
        const amount = parseInt(value) || 0;
        setBetAmount(Math.max(10, Math.min(amount, (user === null || user === void 0 ? void 0 : user.balance) || 0)));
    };
    const quickBets = [50, 100, 250, 500, 1000];
    return (<card_1.Card className="p-6 casino-card">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-400 mb-2">🎰 Slot Machine</h2>
        <p className="text-gray-400">Match 3 symbols in a line to win!</p>
      </div>

      {/* Slot Reels */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {reels.map((reel, reelIndex) => (<div key={reelIndex} className="slot-reel p-4">
              <div className={`space-y-2 ${isSpinning ? 'spinning' : ''}`}>
                {reel.map((symbol, symbolIndex) => (<div key={symbolIndex} className="text-4xl text-center p-2 bg-gray-800/50 rounded">
                    {symbol}
                  </div>))}
              </div>
            </div>))}
        </div>
      </div>

      {/* Win Notification */}
      {lastWin && (<div className="text-center mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <div className="text-2xl font-bold text-green-400 mb-2">
            🎉 BIG WIN! 🎉
          </div>
          <div className="text-lg text-white">
            You won {(0, gameUtils_1.formatCurrency)(lastWin.amount)} credits!
          </div>
          <div className="text-sm text-gray-300">
            {lastWin.lines.length} winning line{lastWin.lines.length > 1 ? 's' : ''}
          </div>
        </div>)}

      {/* Betting Controls */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bet Amount
            </label>
            <input_1.Input type="number" min="10" max={(user === null || user === void 0 ? void 0 : user.balance) || 0} value={betAmount} onChange={(e) => handleBetChange(e.target.value)} className="bg-gray-800 border-gray-600 text-white" disabled={isSpinning}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Win
            </label>
            <div className="h-10 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md flex items-center text-green-400 font-medium">
              {(0, gameUtils_1.formatCurrency)(betAmount * 10)}
            </div>
          </div>
        </div>

        {/* Quick Bet Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Quick Bets
          </label>
          <div className="flex gap-2 flex-wrap">
            {quickBets.map((amount) => (<button_1.Button key={amount} variant="outline" size="sm" onClick={() => setBetAmount(amount)} disabled={isSpinning || ((user === null || user === void 0 ? void 0 : user.balance) || 0) < amount} className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                {(0, gameUtils_1.formatCurrency)(amount)}
              </button_1.Button>))}
          </div>
        </div>

        {/* Spin Button */}
        <div className="text-center">
          <neon_button_1.NeonButton onClick={handleSpin} disabled={isSpinning || !user || betAmount > ((user === null || user === void 0 ? void 0 : user.balance) || 0) || betAmount < 10} size="lg" glow className="text-xl px-12 py-4">
            {isSpinning ? (<div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Spinning...
              </div>) : (`SPIN - ${(0, gameUtils_1.formatCurrency)(betAmount)}`)}
          </neon_button_1.NeonButton>
        </div>

        {/* Game Rules */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="font-medium text-gray-300 mb-2">Payouts:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
            <div>💰 💰 💰 = 10x</div>
            <div>💎 💎 💎 = 8x</div>
            <div>⭐ ⭐ ⭐ = 6x</div>
            <div>🔔 🔔 🔔 = 4x</div>
            <div>🍇 🍇 🍇 = 3x</div>
            <div>🍊 🍊 🍊 = 2x</div>
            <div>🍋 🍋 🍋 = 1.5x</div>
            <div>🍒 🍒 🍒 = 1x</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Diagonal lines also count as winning combinations
          </p>
        </div>
      </div>
    </card_1.Card>);
}
