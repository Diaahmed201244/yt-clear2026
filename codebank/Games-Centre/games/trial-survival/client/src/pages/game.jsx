"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Game;
const react_1 = require("react");
const GameHeader_1 = require("@/components/GameHeader");
const GameSelection_1 = require("@/components/GameSelection");
const RedLightGreenLight_1 = require("@/components/games/RedLightGreenLight");
const HoneycombCarve_1 = require("@/components/games/HoneycombCarve");
const TugOfWar_1 = require("@/components/games/TugOfWar");
const Marbles_1 = require("@/components/games/Marbles");
const GlassBridge_1 = require("@/components/games/GlassBridge");
const NightmareChase_1 = require("@/components/games/NightmareChase");
const PowerUpShop_1 = require("@/components/PowerUpShop");
const ChallengeStatus_1 = require("@/components/ChallengeStatus");
const ChallengeNotification_1 = require("@/components/ChallengeNotification");
const EliminationScreen_1 = require("@/components/EliminationScreen");
const VictoryScreen_1 = require("@/components/VictoryScreen");
const Leaderboard_1 = require("@/components/Leaderboard");
const PlayerCount_1 = require("@/components/PlayerCount");
const AudioControls_1 = require("@/components/AudioControls");
const useGameState_1 = require("@/hooks/useGameState");
const gsap_1 = require("gsap");
function Game() {
    const { gameState, player, currentScreen, setCurrentScreen, startGame, completeStage, eliminatePlayer, resetGame } = (0, useGameState_1.useGameState)();
    const [selectedStage, setSelectedStage] = (0, react_1.useState)(1);
    const [showLeaderboard, setShowLeaderboard] = (0, react_1.useState)(false);
    const [showPowerUpShop, setShowPowerUpShop] = (0, react_1.useState)(false);
    const [activeChallenge, setActiveChallenge] = (0, react_1.useState)(null);
    const [showChallengeNotification, setShowChallengeNotification] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        // Initialize GSAP animations
        gsap_1.default.from('.glass-effect', {
            duration: 0.5,
            y: 50,
            opacity: 0,
            stagger: 0.1
        });
    }, []);
    const handleStageSelection = (stageNumber) => {
        if (stageNumber <= gameState.currentStage) {
            setSelectedStage(stageNumber);
            setCurrentScreen('activeGame');
            startGame(stageNumber);
        }
    };
    const handleGameComplete = (success) => {
        if (success) {
            completeStage();
            if (gameState.currentStage >= 5) {
                setCurrentScreen('victory');
            }
            else {
                setCurrentScreen('gameSelection');
            }
        }
        else {
            eliminatePlayer();
            setCurrentScreen('elimination');
        }
    };
    const renderActiveGame = () => {
        switch (selectedStage) {
            case 1:
                return <RedLightGreenLight_1.default onGameComplete={handleGameComplete}/>;
            case 2:
                return <HoneycombCarve_1.default onGameComplete={handleGameComplete}/>;
            case 3:
                return <TugOfWar_1.default onGameComplete={handleGameComplete}/>;
            case 4:
                return <Marbles_1.default onGameComplete={handleGameComplete}/>;
            case 5:
                return <GlassBridge_1.default onGameComplete={handleGameComplete}/>;
            case 6:
                return <NightmareChase_1.default onGameComplete={handleGameComplete}/>;
            default:
                return <RedLightGreenLight_1.default onGameComplete={handleGameComplete}/>;
        }
    };
    const handlePowerUpPurchase = (cost) => {
        // Update tokens through the game state
        updateTokens(-cost);
    };
    const handleChallengeSelect = (challengeId) => {
        setActiveChallenge(challengeId);
        setShowChallengeNotification(challengeId);
        // Set appropriate stage based on challenge
        switch (challengeId) {
            case 'speed_demon':
                setSelectedStage(1); // Red Light Green Light for speed challenge
                break;
            case 'perfectionist':
                setSelectedStage(2); // Honeycomb Carve for precision challenge
                break;
            case 'daily_survival':
                setSelectedStage(1); // Start from first stage for survival challenge
                break;
            default:
                setSelectedStage(1);
        }
    };
    const handleChallengeComplete = (reward) => {
        updateTokens(reward);
        setActiveChallenge(null);
        setCurrentScreen('gameSelection');
    };
    const handleChallengeFail = () => {
        setActiveChallenge(null);
        setCurrentScreen('gameSelection');
    };
    return (<div className="bg-gray-900 text-white font-inter min-h-screen overflow-x-hidden">
      <GameHeader_1.default currentStage={gameState.currentStage} playersAlive={gameState.playersAlive} tokens={player.tokens} onLeaderboard={() => setShowLeaderboard(true)} onPowerUpShop={() => setShowPowerUpShop(true)}/>

      <main className="pt-20 min-h-screen">
        {currentScreen === 'gameSelection' && (<GameSelection_1.default currentStage={gameState.currentStage} onStageSelect={handleStageSelection} onChallengeSelect={handleChallengeSelect}/>)}

        {currentScreen === 'activeGame' && (<section className="min-h-screen flex items-center justify-center">
            {renderActiveGame()}
          </section>)}

        {currentScreen === 'elimination' && (<EliminationScreen_1.default trialsCompleted={player.trialsCompleted} finalRank={player.finalRank || 87} onRetry={() => {
                if (player.tokens >= 10) {
                    resetGame();
                    setCurrentScreen('gameSelection');
                }
            }} onReturnToMenu={() => setCurrentScreen('gameSelection')} canRetry={player.tokens >= 10}/>)}

        {currentScreen === 'victory' && (<VictoryScreen_1.default tokensEarned={500} finalRank={1} onContinue={() => setShowLeaderboard(true)}/>)}
      </main>

      <PlayerCount_1.default playersAlive={gameState.playersAlive}/>
      <AudioControls_1.default />

      {showLeaderboard && (<Leaderboard_1.default onClose={() => setShowLeaderboard(false)}/>)}
      
      {showPowerUpShop && (<PowerUpShop_1.default playerTokens={player.tokens} onPurchase={handlePowerUpPurchase} onClose={() => setShowPowerUpShop(false)}/>)}

      <ChallengeStatus_1.default challengeId={activeChallenge} onComplete={handleChallengeComplete} onFail={handleChallengeFail}/>

      <ChallengeNotification_1.default challengeId={showChallengeNotification} onClose={() => {
            setShowChallengeNotification(null);
            setCurrentScreen('activeGame');
        }}/>
    </div>);
}
