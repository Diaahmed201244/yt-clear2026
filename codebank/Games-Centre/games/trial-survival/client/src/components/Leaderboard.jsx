"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Leaderboard;
const react_query_1 = require("@tanstack/react-query");
const react_1 = require("react");
const gsap_1 = require("gsap");
function Leaderboard({ onClose }) {
    const { data: leaderboard = [], isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['/api/leaderboard'],
    });
    (0, react_1.useEffect)(() => {
        // Animate leaderboard entrance
        gsap_1.default.from('.leaderboard-content', {
            duration: 0.5,
            scale: 0.9,
            opacity: 0,
            ease: 'power2.out'
        });
        gsap_1.default.from('.leaderboard-item', {
            duration: 0.3,
            x: -50,
            opacity: 0,
            stagger: 0.1,
            delay: 0.2
        });
    }, []);
    return (<section className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50">
      <div className="container mx-auto px-6 py-8 h-full flex items-center justify-center">
        <div className="leaderboard-content bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-orbitron text-2xl font-bold">SURVIVAL LEADERBOARD</h2>
            <button className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors" onClick={onClose}>
              ✕
            </button>
          </div>

          {isLoading ? (<div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-squid-pink border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>) : leaderboard.length === 0 ? (<div className="text-center py-8">
              <p className="text-gray-400">No survivors yet. Be the first to complete the trials!</p>
            </div>) : (<div className="space-y-3">
              {leaderboard.map((player, index) => {
                var _a;
                return (<div key={player.id} className="leaderboard-item flex items-center justify-between p-4 glass-effect rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-warning-yellow text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-yellow-600 text-black' :
                                'bg-squid-pink'}`}>
                      <span>{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{player.playerName || `Player${(_a = player.playerId) === null || _a === void 0 ? void 0 : _a.slice(-3)}`}</div>
                      <div className="text-sm text-gray-400">
                        {player.trialsCompleted}/5 Trials Completed
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-warning-yellow">{player.tokens}</div>
                    <div className="text-sm text-gray-400">tokens</div>
                  </div>
                </div>);
            })}
            </div>)}
        </div>
      </div>
    </section>);
}
