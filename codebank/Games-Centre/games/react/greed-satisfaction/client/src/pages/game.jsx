"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Game;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const dialog_1 = require("@/components/ui/dialog");
const GameBox_1 = require("@/components/GameBox");
const ConfettiEffect_1 = require("@/components/ConfettiEffect");
const BalanceAnimations_1 = require("@/components/BalanceAnimations");
const ShieldEffect_1 = require("@/components/ShieldEffect");
const useGameState_1 = require("@/hooks/useGameState");
const use_toast_1 = require("@/hooks/use-toast");
const useDailyLimit_1 = require("@/hooks/useDailyLimit");
function Game() {
    const { totalCodes, greedLevel, isPlaying, boxes, phase, hasPlayedBefore, shieldActive, shieldTimeLeft, lastLostBalance, startNewRound, openBox, collectReward, continueGame, resetGame, markAsPlayed } = (0, useGameState_1.useGameState)();
    const { canPlay, timeUntilNext, message, isLoading: isDailyLimitLoading, recordPlay, updateCodes, isRecordingPlay } = (0, useDailyLimit_1.useDailyLimit)();
    const { toast } = (0, use_toast_1.useToast)();
    const [showConfetti, setShowConfetti] = (0, react_1.useState)(false);
    const [showInstructions, setShowInstructions] = (0, react_1.useState)(false);
    const [balanceAnimation, setBalanceAnimation] = (0, react_1.useState)(null);
    const [animatedBalance, setAnimatedBalance] = (0, react_1.useState)(totalCodes);
    (0, react_1.useEffect)(() => {
        if (!hasPlayedBefore) {
            setShowInstructions(true);
        }
    }, [hasPlayedBefore]);
    // Sync animated balance with actual balance when not animating
    (0, react_1.useEffect)(() => {
        if (!balanceAnimation) {
            setAnimatedBalance(totalCodes);
        }
    }, [totalCodes, balanceAnimation]);
    const handleBoxOpen = (index) => {
        const outcome = openBox(index);
        if ((outcome.type === 'reward' && outcome.value && outcome.value >= 200) ||
            outcome.type === 'jackpot' || outcome.type === 'multiplier') {
            setShowConfetti(true);
        }
        switch (outcome.type) {
            case 'bomb':
                if (shieldActive) {
                    toast({
                        title: "🛡️ PROTECTED!",
                        description: "Your shield protected you from the bomb!",
                    });
                }
                else {
                    setBalanceAnimation('fire');
                    // Animate balance burning down to zero
                    setTimeout(() => {
                        setAnimatedBalance(0);
                    }, 1000);
                    toast({
                        title: "💣 BOOM!",
                        description: "You hit a bomb and lost everything! Game over.",
                        variant: "destructive"
                    });
                }
                break;
            case 'knife':
                if (shieldActive) {
                    toast({
                        title: "🛡️ PROTECTED!",
                        description: "Your shield protected you from the knife!",
                    });
                }
                else {
                    setBalanceAnimation('slice');
                    // Animate balance being sliced in half
                    setTimeout(() => {
                        setAnimatedBalance(Math.floor(totalCodes / 2));
                    }, 500);
                    toast({
                        title: "✂️ SLICED!",
                        description: "The knife cut your total balance in half! Ouch!",
                        variant: "destructive"
                    });
                }
                break;
            case 'jackpot':
                // Animate balance increase
                setTimeout(() => {
                    setAnimatedBalance(totalCodes + (outcome.value || 0));
                }, 200);
                toast({
                    title: "🎰 JACKPOT!",
                    description: `INCREDIBLE! You won ${outcome.value} codes! What a win!`,
                });
                break;
            case 'multiplier':
                // Animate balance multiplication
                setTimeout(() => {
                    setAnimatedBalance(totalCodes * (outcome.multiplier || 1));
                }, 300);
                toast({
                    title: "⚡ MULTIPLIED!",
                    description: `Your total balance was multiplied by ${outcome.multiplier}x!`,
                });
                break;
            case 'thief':
                if (shieldActive) {
                    toast({
                        title: "🛡️ PROTECTED!",
                        description: "Your shield protected you from the thief!",
                    });
                }
                else {
                    toast({
                        title: "🥷 STOLEN!",
                        description: `A thief stole ${outcome.value} codes from your total balance!`,
                        variant: "destructive"
                    });
                }
                break;
            case 'curse':
                if (shieldActive) {
                    toast({
                        title: "🛡️ PROTECTED!",
                        description: "Your shield protected you from the curse!",
                    });
                }
                else {
                    toast({
                        title: "💀 CURSED!",
                        description: "You've been cursed! Your greed level increased dramatically!",
                        variant: "destructive"
                    });
                }
                break;
            case 'elixir':
                if (lastLostBalance > 0) {
                    setBalanceAnimation('heal');
                    // Animate balance being restored
                    setTimeout(() => {
                        setAnimatedBalance(totalCodes + lastLostBalance);
                    }, 200);
                    toast({
                        title: "💖 ELIXIR!",
                        description: `Your lost balance of ${lastLostBalance} codes has been restored!`,
                    });
                }
                else {
                    toast({
                        title: "💖 ELIXIR!",
                        description: "No lost balance to restore, but nice find!",
                    });
                }
                break;
            case 'shield':
                toast({
                    title: "🛡️ SHIELD ACTIVATED!",
                    description: "You are now protected from damage for 10 seconds!",
                });
                break;
            case 'reward':
                if (outcome.value) {
                    // Animate balance increase
                    setTimeout(() => {
                        setAnimatedBalance(totalCodes + outcome.value);
                    }, 200);
                    toast({
                        title: "🎉 Nice!",
                        description: `You won ${outcome.value} codes!`,
                    });
                }
                break;
            case 'nothing':
                toast({
                    title: "😐 Nothing",
                    description: "Better luck next time!",
                });
                break;
        }
    };
    const handleStartGame = () => {
        if (!canPlay) {
            toast({
                title: "Daily Limit Reached",
                description: `You can only play once per day. ${timeUntilNext}`,
                variant: "destructive"
            });
            return;
        }
        if (!startNewRound(recordPlay)) {
            toast({
                title: "Not Enough Codes",
                description: "You need at least 1 code to play!",
                variant: "destructive"
            });
        }
    };
    const handleCollect = () => {
        collectReward();
        toast({
            title: "💰 Round Complete!",
            description: `Well played! Starting fresh with lower risk.`,
        });
    };
    const handleContinue = () => {
        if (!continueGame()) {
            toast({
                title: "Not Enough Codes",
                description: "You need at least 1 code to continue!",
                variant: "destructive"
            });
            return;
        }
        toast({
            title: "🔥 Greed Rises!",
            description: "Your greed level increased. Higher bomb chance ahead!",
        });
    };
    const getStatusMessage = () => {
        if (phase === 'selection' && !isPlaying) {
            return `Choose a box to reveal your fate! Cost: 1 code`;
        }
        else if (phase === 'decision') {
            return `Collect to end safely, or continue for higher rewards but increased risk!`;
        }
        else if (phase === 'gameOver') {
            return "Game over! Start a new round when you're ready.";
        }
        return "Choose your fate...";
    };
    // Animated Number Component
    const AnimatedNumber = ({ value }) => {
        const [displayValue, setDisplayValue] = (0, react_1.useState)(value);
        (0, react_1.useEffect)(() => {
            if (value === displayValue)
                return;
            const duration = 800; // Animation duration
            const steps = 30; // Number of animation steps
            const stepValue = (value - displayValue) / steps;
            const stepTime = duration / steps;
            let currentStep = 0;
            const timer = setInterval(() => {
                currentStep++;
                if (currentStep >= steps) {
                    setDisplayValue(value);
                    clearInterval(timer);
                }
                else {
                    setDisplayValue(prev => prev + stepValue);
                }
            }, stepTime);
            return () => clearInterval(timer);
        }, [value, displayValue]);
        return <span>{Math.floor(displayValue).toLocaleString()}</span>;
    };
    return (<div className="min-h-screen game-bg text-white overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 dot-pattern"/>
      
      {/* Confetti Effect */}
      <ConfettiEffect_1.ConfettiEffect trigger={showConfetti} onComplete={() => setShowConfetti(false)}/>
      
      {/* Shield Effect */}
      <ShieldEffect_1.ShieldEffect isActive={shieldActive} timeLeft={shieldTimeLeft}/>
      
      {/* Balance Animations */}
      <BalanceAnimations_1.BalanceAnimations type={balanceAnimation} onComplete={() => setBalanceAnimation(null)} targetBalance={balanceAnimation === 'slice' ? Math.floor(totalCodes / 2) : balanceAnimation === 'heal' ? totalCodes + lastLostBalance : 0} initialBalance={totalCodes}/>

      {/* Header */}
      <header className="relative z-10 px-4 py-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              <lucide_react_1.Dice2 className="inline mr-2"/>
              Greed or Satisfaction
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <card_1.Card className="bg-gray-800/80 border-gray-700">
              <card_1.CardContent className="p-3">
                <div className="text-xs text-gray-400 mb-1">Total Codes</div>
                <div className="text-lg font-bold text-emerald-400">
                  <lucide_react_1.Coins className="inline w-4 h-4 mr-1"/>
                  <AnimatedNumber value={animatedBalance}/>
                </div>
              </card_1.CardContent>
            </card_1.Card>
            

            
            <card_1.Card className="bg-gray-800/80 border-gray-700">
              <card_1.CardContent className="p-3">
                <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                <div className="text-lg font-bold text-red-400">
                  <div className="flex items-center">
                    {'🔥'.repeat(greedLevel)}
                    <span className="ml-1 text-sm">{greedLevel}/5</span>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          {/* Game Status */}
          <div className="mb-8 text-center">
            <card_1.Card className="bg-gray-800/60 backdrop-blur-sm border-gray-700/50 inline-block">
              <card_1.CardContent className="p-6">
                <div className="text-lg font-semibold text-gray-300 mb-4">
                  {getStatusMessage()}
                </div>
                
                {/* Greed Meter */}
                <div className="max-w-xs mx-auto">
                  <div className="text-sm text-gray-400 mb-2">Greed Level</div>
                  <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full transition-all duration-500" style={{ width: `${(greedLevel / 5) * 100}%` }}/>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Higher greed = higher bomb chance
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Game Boxes Grid */}
          {boxes.length > 0 && (<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {boxes.map((outcome, index) => (<GameBox_1.GameBox key={`${phase}-${index}`} index={index} outcome={outcome} isDisabled={phase !== 'selection'} onOpen={handleBoxOpen}/>))}
            </div>)}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {phase === 'selection' && !isPlaying && (<div className="flex flex-col items-center gap-4">
                {!canPlay && (<card_1.Card className="bg-red-900/20 border-red-500/50">
                    <card_1.CardContent className="p-4 text-center">
                      <div className="text-red-400 font-semibold mb-2">Daily Limit Reached</div>
                      <div className="text-sm text-red-300">
                        You can only play once per day.
                      </div>
                      <div className="text-xs text-red-400 mt-1">
                        {timeUntilNext}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>)}
                
                <button_1.Button onClick={handleStartGame} disabled={!canPlay || isDailyLimitLoading || isRecordingPlay} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-indigo-500/25 border border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed" size="lg">
                  <lucide_react_1.Gift className="mr-2 w-5 h-5"/>
                  {isRecordingPlay ? 'Starting...' : boxes.length === 0 ? 'Start Game (1 Code)' : 'Play Again (1 Code)'}
                </button_1.Button>
              </div>)}

            {phase === 'decision' && (<>
                <button_1.Button onClick={handleCollect} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-emerald-500/25 border border-emerald-500/50" size="lg">
                  <lucide_react_1.PiggyBank className="mr-2 w-5 h-5"/>
                  Collect & Exit
                </button_1.Button>
                
                <button_1.Button onClick={handleContinue} className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-red-500/25 border border-red-500/50" size="lg">
                  <lucide_react_1.Dice2 className="mr-2 w-5 h-5"/>
                  Continue (1 Code)
                </button_1.Button>
              </>)}

            {phase === 'gameOver' && (<button_1.Button onClick={resetGame} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-indigo-500/25 border border-indigo-500/50" size="lg">
                <lucide_react_1.Dice2 className="mr-2 w-5 h-5"/>
                Start New Game
              </button_1.Button>)}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-6 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm text-gray-400 mb-2">
            <lucide_react_1.Info className="inline w-4 h-4 mr-1"/>
            New: 💰 Jackpots, ⚡ Multipliers, ✂️ Slicers, 🥷 Thieves, 💀 Curses, 💖 Elixirs, 🛡️ Shields
          </div>
          <div className="text-xs text-gray-500">
            Your progress is automatically saved to your browser
          </div>
        </div>
      </footer>

      {/* Help Button */}
      <dialog_1.Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <dialog_1.DialogTrigger asChild>
          <button_1.Button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/25 z-30" size="icon">
            <lucide_react_1.HelpCircle className="w-6 h-6"/>
          </button_1.Button>
        </dialog_1.DialogTrigger>
        <dialog_1.DialogContent className="bg-gray-800 border-gray-700 text-white">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              How to Play
            </dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <div className="space-y-4 text-gray-300">
            <div className="flex items-start gap-3">
              <div className="bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
              <div>Pay <strong className="text-red-400">1 code</strong> to start each round. <strong className="text-amber-400">You can only play once per day!</strong></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
              <div>Click any of the <strong className="text-amber-400">6 boxes</strong> to reveal your fate</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
              <div>Find: Rewards, Jackpots, Multipliers, Bombs, Knives, Thieves, Curses, Elixirs, or Shields</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</div>
              <div><strong className="text-green-400">Shields</strong> protect you from damage. <strong className="text-pink-400">Elixirs</strong> restore lost balance.</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">5</div>
              <div>After each win: <strong className="text-emerald-400">Collect safely</strong> or <strong className="text-red-400">risk it all</strong> for more</div>
            </div>
          </div>
          <button_1.Button onClick={() => {
            setShowInstructions(false);
            markAsPlayed();
        }} className="w-full bg-indigo-600 hover:bg-indigo-700 mt-6">
            Got It!
          </button_1.Button>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
