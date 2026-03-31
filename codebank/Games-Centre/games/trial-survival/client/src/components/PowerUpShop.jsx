"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PowerUpShop;
const react_1 = require("react");
const powerUpManager_1 = require("@/lib/powerUpManager");
const gsap_1 = require("gsap");
function PowerUpShop({ playerTokens, onPurchase, onClose }) {
    const [selectedPowerUp, setSelectedPowerUp] = (0, react_1.useState)(null);
    const [purchaseAnimation, setPurchaseAnimation] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        // Animate shop entrance
        gsap_1.default.from('.shop-content', {
            duration: 0.5,
            scale: 0.9,
            opacity: 0,
            ease: 'power2.out'
        });
        gsap_1.default.from('.power-up-card', {
            duration: 0.3,
            y: 20,
            opacity: 0,
            stagger: 0.1,
            delay: 0.2
        });
    }, []);
    const handlePurchase = (powerUp) => {
        if (playerTokens >= powerUp.cost) {
            setPurchaseAnimation(powerUp.id);
            // Animate purchase
            gsap_1.default.to(`.power-up-${powerUp.id}`, {
                duration: 0.5,
                scale: 1.2,
                rotation: 360,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    onPurchase(powerUp.cost);
                    powerUpManager_1.powerUpManager.activatePowerUp(powerUp.id);
                    gsap_1.default.to(`.power-up-${powerUp.id}`, {
                        duration: 0.3,
                        scale: 1,
                        rotation: 0
                    });
                    setPurchaseAnimation(null);
                }
            });
        }
    };
    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'common': return 'text-gray-400 border-gray-400';
            case 'rare': return 'text-blue-400 border-blue-400';
            case 'epic': return 'text-purple-400 border-purple-400';
            case 'legendary': return 'text-yellow-400 border-yellow-400';
            default: return 'text-gray-400 border-gray-400';
        }
    };
    const getRarityGlow = (rarity) => {
        switch (rarity) {
            case 'common': return 'shadow-gray-400/20';
            case 'rare': return 'shadow-blue-400/30';
            case 'epic': return 'shadow-purple-400/40';
            case 'legendary': return 'shadow-yellow-400/50';
            default: return 'shadow-gray-400/20';
        }
    };
    return (<div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="shop-content bg-gray-800 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-orbitron text-3xl font-bold text-squid-pink mb-2">POWER-UP SHOP</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-warning-yellow rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-black">💰</span>
                </div>
                <span className="font-orbitron font-bold text-warning-yellow">{playerTokens}</span>
              </div>
            </div>
          </div>
          <button className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {powerUpManager_1.POWER_UPS.map((powerUp) => {
            const canAfford = playerTokens >= powerUp.cost;
            const isActive = powerUpManager_1.powerUpManager.isActive(powerUp.id);
            const isPurchasing = purchaseAnimation === powerUp.id;
            return (<div key={powerUp.id} className={`power-up-card power-up-${powerUp.id} relative glass-effect rounded-xl p-4 transition-all duration-300 cursor-pointer group ${canAfford ? 'hover:bg-white/10' : 'opacity-60'} ${getRarityColor(powerUp.rarity)} border ${getRarityGlow(powerUp.rarity)} ${isActive ? 'bg-success-green/20' : ''}`} onClick={() => !isPurchasing && canAfford && handlePurchase(powerUp)}>
                {/* Rarity Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${getRarityColor(powerUp.rarity)}`}>
                  {powerUp.rarity.toUpperCase()}
                </div>

                {/* Active Badge */}
                {isActive && (<div className="absolute top-2 left-2 px-2 py-1 bg-success-green rounded-full text-xs font-bold text-black">
                    ACTIVE
                  </div>)}

                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{powerUp.icon}</div>
                  <h3 className="font-orbitron text-lg font-bold mb-1">{powerUp.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${powerUp.type === 'active' ? 'bg-squid-pink/20 text-squid-pink' : 'bg-squid-cyan/20 text-squid-cyan'}`}>
                    {powerUp.type.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-4 min-h-[3rem]">{powerUp.description}</p>

                {powerUp.duration && (<div className="text-center mb-3">
                    <span className="text-xs text-gray-400">Duration: {powerUp.duration}s</span>
                  </div>)}

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-warning-yellow rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">💰</span>
                    </div>
                    <span className="font-bold text-warning-yellow">{powerUp.cost}</span>
                  </div>
                  
                  <button className={`px-4 py-2 rounded-lg font-medium transition-all ${isPurchasing
                    ? 'bg-gray-600 cursor-wait'
                    : canAfford
                        ? 'bg-squid-pink hover:bg-squid-pink/80'
                        : 'bg-gray-600 cursor-not-allowed'}`} disabled={!canAfford || isPurchasing || isActive}>
                    {isPurchasing ? 'PURCHASING...' :
                    isActive ? 'ACTIVE' :
                        canAfford ? 'BUY' : 'NOT ENOUGH'}
                  </button>
                </div>

                {/* Effects List */}
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="text-xs text-gray-400 mb-1">Effects:</div>
                  {powerUp.effects.map((effect, index) => (<div key={index} className="text-xs text-gray-300">
                      • {effect.type.replace('_', ' ').toUpperCase()}: {effect.value}x
                    </div>))}
                </div>
              </div>);
        })}
        </div>

        {/* Purchase Tips */}
        <div className="mt-8 bg-gray-700 rounded-lg p-4">
          <h3 className="font-orbitron font-bold mb-2">💡 Shop Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <strong className="text-squid-cyan">Active Power-ups:</strong> Temporary effects that activate immediately
            </div>
            <div>
              <strong className="text-squid-pink">Passive Power-ups:</strong> Permanent bonuses that stay active
            </div>
            <div>
              <strong className="text-warning-yellow">Rarity:</strong> Higher rarity = more powerful effects
            </div>
            <div>
              <strong className="text-success-green">Stacking:</strong> Some effects can stack with multiple uses
            </div>
          </div>
        </div>
      </div>
    </div>);
}
