"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceAnimations = BalanceAnimations;
const react_1 = require("react");
function BalanceAnimations({ type, onComplete, targetBalance = 0, initialBalance = 1000 }) {
    const [animationStage, setAnimationStage] = (0, react_1.useState)(0);
    const [currentBalance, setCurrentBalance] = (0, react_1.useState)(initialBalance);
    (0, react_1.useEffect)(() => {
        if (!type)
            return;
        let timeouts = [];
        if (type === 'fire') {
            // Fire animation stages with balance burning
            timeouts.push(setTimeout(() => setAnimationStage(1), 100)); // Fire starts
            timeouts.push(setTimeout(() => setAnimationStage(2), 600)); // Fire spreads toward balance
            timeouts.push(setTimeout(() => setAnimationStage(3), 1000)); // Fire reaches balance
            // Burn balance down gradually
            const burnDuration = 1500;
            const burnInterval = setInterval(() => {
                setCurrentBalance(prev => {
                    const newBalance = Math.max(0, prev - (initialBalance / 20));
                    return newBalance;
                });
            }, burnDuration / 20);
            timeouts.push(setTimeout(() => {
                clearInterval(burnInterval);
                setCurrentBalance(0);
                setAnimationStage(4); // Final burn state
            }, 1200));
            timeouts.push(setTimeout(() => {
                setAnimationStage(0);
                setCurrentBalance(initialBalance);
                onComplete();
            }, 3000));
        }
        else if (type === 'slice') {
            // Slice animation stages with balance splitting
            timeouts.push(setTimeout(() => setAnimationStage(1), 100)); // Slash appears
            timeouts.push(setTimeout(() => setAnimationStage(2), 300)); // Slash reaches balance
            // Split balance animation
            const sliceDuration = 800;
            const sliceInterval = setInterval(() => {
                setCurrentBalance(prev => {
                    const newBalance = Math.max(targetBalance, prev - (initialBalance / 40));
                    return newBalance;
                });
            }, sliceDuration / 40);
            timeouts.push(setTimeout(() => {
                clearInterval(sliceInterval);
                setCurrentBalance(targetBalance);
                setAnimationStage(3); // Split effect
            }, 500));
            timeouts.push(setTimeout(() => {
                setAnimationStage(0);
                setCurrentBalance(initialBalance);
                onComplete();
            }, 2000));
        }
        else if (type === 'heal') {
            // Heal animation stages with balance restoration
            timeouts.push(setTimeout(() => setAnimationStage(1), 100)); // Healing starts
            // Restore balance gradually
            const healDuration = 1000;
            const healInterval = setInterval(() => {
                setCurrentBalance(prev => {
                    const newBalance = Math.min(targetBalance, prev + ((targetBalance - initialBalance) / 15));
                    return newBalance;
                });
            }, healDuration / 15);
            timeouts.push(setTimeout(() => {
                clearInterval(healInterval);
                setCurrentBalance(targetBalance);
                setAnimationStage(2); // Healing complete
            }, 600));
            timeouts.push(setTimeout(() => {
                setAnimationStage(0);
                setCurrentBalance(initialBalance);
                onComplete();
            }, 1500));
        }
        return () => {
            timeouts.forEach(timeout => clearTimeout(timeout));
        };
    }, [type, onComplete]);
    if (!type)
        return null;
    return (<div className="fixed inset-0 pointer-events-none z-50">
      {type === 'fire' && (<div className="absolute inset-0">
          {/* Fire particles starting from box area */}
          {animationStage >= 1 && (<div className="fire-container">
              {[...Array(30)].map((_, i) => (<div key={i} className="fire-particle" style={{
                        left: `${45 + Math.random() * 10}%`,
                        top: `${55 + Math.random() * 15}%`,
                        animationDelay: `${Math.random() * 0.3}s`,
                        animationDuration: `${1.5 + Math.random()}s`
                    }}/>))}
            </div>)}
          
          {/* Fire path spreading toward balance */}
          {animationStage >= 2 && (<div className="fire-path">
              <div className="bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 opacity-70" style={{
                    position: 'absolute',
                    left: '50%',
                    top: '60%',
                    width: '80px',
                    height: '200px',
                    transform: 'translateX(-50%)',
                    clipPath: 'polygon(40% 100%, 60% 100%, 80% 0%, 20% 0%)',
                    animation: 'fireTrail 0.8s ease-out forwards'
                }}/>
            </div>)}
          
          {/* Fire reaches and burns balance */}
          {animationStage >= 3 && (<div className="absolute top-0 right-0 left-0">
              <div className="flex justify-center items-center h-32">
                <div className="relative">
                  {/* Burning balance display */}
                  <div className="text-6xl font-bold text-red-400 animate-pulse" style={{
                    filter: 'drop-shadow(0 0 10px #ff4444)',
                    textShadow: '0 0 20px #ff6600'
                }}>
                    🔥 {Math.floor(currentBalance).toLocaleString()} 🔥
                  </div>
                  
                  {/* Fire particles around balance */}
                  {[...Array(15)].map((_, i) => (<div key={i} className="fire-particle" style={{
                        position: 'absolute',
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                        animationDelay: `${Math.random() * 0.5}s`
                    }}/>))}
                </div>
              </div>
            </div>)}
          
          {/* Final burn state */}
          {animationStage >= 4 && (<div className="absolute top-0 right-0 left-0">
              <div className="flex justify-center items-center h-32">
                <div className="text-6xl font-bold text-gray-500 opacity-50">
                  💀 0 💀
                </div>
              </div>
            </div>)}
        </div>)}

      {type === 'slice' && (<div className="absolute inset-0">
          {/* Slash effect traveling to balance */}
          {animationStage >= 1 && (<div className="slash-line bg-gray-300 shadow-lg" style={{
                    width: '400px',
                    height: '6px',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-30deg)',
                    animation: 'slashTravel 0.4s ease-out forwards',
                    boxShadow: '0 0 10px #c0c0c0'
                }}/>)}
          
          {/* Balance being sliced */}
          {animationStage >= 2 && (<div className="absolute top-0 right-0 left-0">
              <div className="flex justify-center items-center h-32">
                <div className="relative">
                  {/* Sliced balance display */}
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold text-emerald-400 animate-slideLeft" style={{
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                }}>
                      {Math.floor(currentBalance).toLocaleString()}
                    </div>
                    
                    {/* Slice line through balance */}
                    <div className="w-1 h-16 bg-gray-300 animate-flash" style={{
                    boxShadow: '0 0 10px #c0c0c0'
                }}/>
                    
                    <div className="text-5xl font-bold text-red-400 animate-slideRight" style={{
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                }}>
                      {Math.floor(initialBalance - currentBalance).toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Cutting sparks */}
                  {[...Array(10)].map((_, i) => (<div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{
                        left: `${45 + Math.random() * 10}%`,
                        top: `${40 + Math.random() * 20}%`,
                        animationDelay: `${Math.random() * 0.3}s`
                    }}/>))}
                </div>
              </div>
            </div>)}
          
          {/* Final split state with vanishing half */}
          {animationStage >= 3 && (<div className="absolute top-0 right-0 left-0">
              <div className="flex justify-center items-center h-32">
                <div className="text-5xl font-bold text-orange-400">
                  ✂️ {Math.floor(currentBalance).toLocaleString()} ✂️
                </div>
              </div>
            </div>)}
        </div>)}

      {type === 'heal' && (<div className="absolute inset-0">
          {/* Healing particles flowing to balance */}
          {animationStage >= 1 && (<div className="heal-container">
              {[...Array(20)].map((_, i) => (<div key={i} className="heal-particle" style={{
                        left: `${40 + Math.random() * 20}%`,
                        top: `${60 + Math.random() * 20}%`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        animation: 'healFlow 1s ease-out forwards'
                    }}/>))}
            </div>)}
          
          {/* Balance being restored */}
          {animationStage >= 1 && (<div className="absolute top-0 right-0 left-0">
              <div className="flex justify-center items-center h-32">
                <div className="relative">
                  {/* Restoring balance display */}
                  <div className="text-6xl font-bold text-green-400 animate-pulse" style={{
                    filter: 'drop-shadow(0 0 15px #22c55e)',
                    textShadow: '0 0 30px #22c55e'
                }}>
                    💚 {Math.floor(currentBalance).toLocaleString()} 💚
                  </div>
                  
                  {/* Healing aura */}
                  <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping" style={{
                    animation: 'healGlow 1s ease-out infinite'
                }}/>
                </div>
              </div>
            </div>)}
          
          {/* Final restored state */}
          {animationStage >= 2 && (<div className="absolute top-0 right-0 left-0">
              <div className="flex justify-center items-center h-32">
                <div className="text-6xl font-bold text-emerald-400 animate-bounce">
                  ✨ RESTORED! ✨
                </div>
              </div>
            </div>)}
        </div>)}
    </div>);
}
