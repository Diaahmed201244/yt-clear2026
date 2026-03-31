"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameSelection;
const gameStages = [
    {
        id: 1,
        title: "RED LIGHT, GREEN LIGHT",
        description: "Move only during green light. Stop when red light appears. Any movement during red light results in elimination.",
        eliminationRate: "50%",
        color: "squid-pink",
        image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
    },
    {
        id: 2,
        title: "HONEYCOMB CARVE",
        description: "Carefully trace the shape without breaking the honeycomb. Precision and steady hands are required.",
        eliminationRate: "30%",
        color: "squid-cyan",
        image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
    },
    {
        id: 3,
        title: "TUG OF WAR",
        description: "Team strength determines survival. Click rapidly to overpower the opposing team or face elimination.",
        eliminationRate: "50%",
        color: "warning-yellow",
        image: "https://images.unsplash.com/photo-1552084162-ec07b3f162dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
    },
    {
        id: 4,
        title: "MARBLES",
        description: "Guess odd or even. Bet your marbles wisely. Wrong guess means elimination.",
        eliminationRate: "50%",
        color: "purple-500",
        image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
    },
    {
        id: 5,
        title: "GLASS BRIDGE",
        description: "Choose the correct glass panels. Some are strong, others will shatter. One wrong step is fatal.",
        eliminationRate: "80%",
        color: "blue-500",
        image: "https://pixabay.com/get/g3d33f4c8598760c9cb20962d489a48e5d235269ddd6df448b37db79233f5c2a113644438cb7478fda5991819d429bdc1921ec7629664ffa72bbb1dc1f6410a95_1280.jpg"
    },
    {
        id: 6,
        title: "NIGHTMARE CHASE",
        description: "Escape from the facility while avoiding deadly traps and outrunning relentless chasers. Collect keys to unlock the exit.",
        eliminationRate: "75%",
        color: "elimination-red",
        image: "https://images.unsplash.com/photo-1551847812-c7b82a3c18e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
    }
];
const specialChallenges = [
    {
        id: 'daily_survival',
        title: "DAILY SURVIVAL",
        description: "Complete 3 consecutive trials without power-ups. Resets every 24 hours.",
        reward: "250 Tokens + Shield Power-up",
        timeLeft: "18h 42m",
        difficulty: "Hard",
        isActive: true
    },
    {
        id: 'speed_demon',
        title: "SPEED DEMON",
        description: "Complete any trial 50% faster than normal time limit.",
        reward: "150 Tokens + Speed Boost",
        timeLeft: "6h 15m",
        difficulty: "Medium",
        isActive: true
    },
    {
        id: 'perfectionist',
        title: "PERFECTIONIST",
        description: "Complete Honeycomb Carve or Glass Bridge with perfect precision.",
        reward: "200 Tokens + Precision Aid",
        timeLeft: "12h 30m",
        difficulty: "Expert",
        isActive: true
    }
];
function GameSelection({ currentStage, onStageSelect, onChallengeSelect }) {
    return (<section className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h2 className="font-orbitron text-4xl font-bold mb-4">SELECT YOUR TRIAL</h2>
        <p className="text-gray-400 text-lg">Complete all stages to survive. Each trial brings new challenges and adventures.</p>
      </div>

      {/* Special Challenges Section */}
      <div className="mb-12">
        <h3 className="font-orbitron text-2xl font-bold mb-6 text-center text-squid-pink">⚡ SPECIAL CHALLENGES ⚡</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {specialChallenges.map((challenge) => (<div key={challenge.id} className="glass-effect rounded-lg p-4 border border-squid-pink/30 cursor-pointer hover:bg-squid-pink/5 transition-all duration-200 group" onClick={() => onChallengeSelect && onChallengeSelect(challenge.id)}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-orbitron font-bold text-sm text-squid-pink group-hover:text-squid-pink/80">{challenge.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${challenge.difficulty === 'Hard' ? 'bg-red-600/20 text-red-400' :
                challenge.difficulty === 'Expert' ? 'bg-purple-600/20 text-purple-400' :
                    'bg-yellow-600/20 text-yellow-400'}`}>
                  {challenge.difficulty}
                </span>
              </div>
              <p className="text-gray-300 text-xs mb-3 group-hover:text-gray-200">{challenge.description}</p>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-success-green font-medium">{challenge.reward}</span>
                <span className="text-gray-400">{challenge.timeLeft}</span>
              </div>
              <div className="text-center">
                <button className="w-full px-3 py-1 bg-squid-pink/20 hover:bg-squid-pink/30 rounded text-xs font-medium text-squid-pink border border-squid-pink/50 transition-colors">
                  ACCEPT CHALLENGE
                </button>
              </div>
            </div>))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {gameStages.map((stage) => {
            const isUnlocked = stage.id <= currentStage;
            const colorClass = stage.color.includes('-') ? stage.color : `${stage.color}`;
            return (<div key={stage.id} className={`glass-effect rounded-xl p-6 transition-all duration-300 cursor-pointer group ${isUnlocked ? 'hover:bg-squid-pink/10' : 'opacity-50 cursor-not-allowed'}`} onClick={() => isUnlocked && onStageSelect(stage.id)}>
              <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                <img src={stage.image} alt={stage.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
              </div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-orbitron text-xl font-bold">{stage.title}</h3>
                <div className={`w-8 h-8 bg-${colorClass} rounded-full flex items-center justify-center`}>
                  <span className={`font-bold ${colorClass === 'warning-yellow' ? 'text-black' : 'text-white'}`}>
                    {stage.id}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">{stage.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-elimination-red text-sm font-medium">
                  Elimination Rate: {stage.eliminationRate}
                </span>
                <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${isUnlocked
                    ? 'bg-squid-pink hover:bg-squid-pink/80'
                    : 'bg-gray-600 opacity-50 cursor-not-allowed'}`} disabled={!isUnlocked}>
                  {isUnlocked ? 'START TRIAL' : 'LOCKED'}
                </button>
              </div>
            </div>);
        })}

        {/* Final Challenge */}
        <div className="glass-effect rounded-xl p-6 hover:bg-success-green/10 transition-all duration-300 cursor-pointer group">
          <div className="aspect-video rounded-lg mb-4 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450" alt="Final Survival" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
          </div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-orbitron text-xl font-bold">FINAL SURVIVAL</h3>
            <div className="w-8 h-8 bg-success-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Only the strongest survive all trials. Claim your victory and join the elite survivors.
          </p>
          <div className="flex justify-between items-center">
            <span className="text-success-green text-sm font-medium">Victory Rate: 1%</span>
            <button className="px-4 py-2 bg-gray-600 rounded-lg font-medium opacity-50 cursor-not-allowed">
              LOCKED
            </button>
          </div>
        </div>
      </div>
    </section>);
}
