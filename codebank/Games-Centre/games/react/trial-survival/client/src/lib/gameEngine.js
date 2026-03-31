import { powerUpManager } from "./powerUpManager";
export class GameEngine {
    constructor() {
        this.currentGameMode = null;
        this.difficultyMultiplier = 1;
        this.challengeMode = null;
        this.gameState = {
            currentStage: 1,
            playersAlive: 456,
            isActive: false,
            gameData: {}
        };
        this.players = [];
    }
    simulateAIPlayers(count) {
        const aiPlayers = [];
        for (let i = 0; i < count; i++) {
            aiPlayers.push({
                id: `ai_${i}`,
                username: `Player${String(i + 1).padStart(3, '0')}`,
                tokens: 100,
                currentStage: 1,
                trialsCompleted: 0,
                isEliminated: false,
                isAI: true
            });
        }
        return aiPlayers;
    }
    eliminateAIPlayers(eliminationRate) {
        const aiPlayers = this.players.filter(p => p.isAI && !p.isEliminated);
        const eliminationCount = Math.floor(aiPlayers.length * eliminationRate);
        for (let i = 0; i < eliminationCount; i++) {
            const randomIndex = Math.floor(Math.random() * aiPlayers.length);
            if (aiPlayers[randomIndex]) {
                aiPlayers[randomIndex].isEliminated = true;
            }
        }
        this.gameState.playersAlive = this.players.filter(p => !p.isEliminated).length;
    }
    simulateRedLightGreenLightAI() {
        const aiPlayers = this.players.filter(p => p.isAI && !p.isEliminated);
        const movements = [];
        let eliminations = 0;
        aiPlayers.forEach(() => {
            const movement = Math.random() * 10 + 1;
            const wrongMove = Math.random() < 0.1;
            movements.push(movement);
            if (wrongMove) {
                eliminations++;
            }
        });
        return { movements, eliminations };
    }
    simulateTugOfWarAI() {
        return Math.random() * 3 + 1;
    }
    simulateMarblesAI(playerBet) {
        const aiBet = Math.min(Math.floor(Math.random() * 5) + 1, 10);
        const aiGuess = Math.random() < 0.5 ? 'odd' : 'even';
        const aiNumber = Math.floor(Math.random() * 20) + 1;
        return { aiBet, aiGuess, aiNumber };
    }
    simulateGlassBridgeAI(currentStep) {
        return Math.random() < 0.5 ? 'left' : 'right';
    }
    updateGameState(updates) {
        this.gameState = { ...this.gameState, ...updates };
    }
    getGameState() {
        return this.gameState;
    }
    getAlivePlayersCount() {
        return this.players.filter(p => !p.isEliminated).length;
    }
    initializeGame(aiPlayerCount = 455) {
        this.players = this.simulateAIPlayers(aiPlayerCount);
        this.gameState.playersAlive = this.players.length + 1;
        this.gameState.isActive = true;
    }
    getEliminationRate(stage) {
        const rates = {
            1: 0.5,
            2: 0.3,
            3: 0.5,
            4: 0.5,
            5: 0.8
        };
        return rates[stage] || 0.5;
    }
    setGameMode(gameMode) {
        this.currentGameMode = gameMode;
        this.difficultyMultiplier = gameMode.difficulty;
    }
    setChallengeMode(challengeId) {
        this.challengeMode = challengeId;
    }
    getAdjustedTimer(baseTimer) {
        let timer = baseTimer;
        if (this.currentGameMode?.id === 'hardcore') {
            timer = Math.floor(timer * 0.5);
        }
        else if (this.currentGameMode?.id === 'blitz') {
            timer = Math.floor(timer * 0.75);
        }
        const effects = powerUpManager.getActiveEffects();
        effects.forEach(effect => {
            if (effect.type === 'time_extension') {
                timer += effect.value;
            }
        });
        return Math.max(timer, 5);
    }
    getAdjustedEliminationRate(stage) {
        let baseRate = this.getEliminationRate(stage);
        if (this.currentGameMode?.id === 'hardcore') {
            baseRate = Math.min(baseRate * 1.25, 0.9);
        }
        else if (this.currentGameMode?.id === 'survival') {
            baseRate = Math.min(baseRate * 1.1, 0.8);
        }
        return baseRate;
    }
    calculateTokenReward(baseReward, performance) {
        let reward = baseReward;
        if (this.currentGameMode) {
            reward = Math.floor(reward * this.currentGameMode.tokenMultiplier);
        }
        if (performance.perfectExecution) {
            reward = Math.floor(reward * 1.5);
        }
        if (performance.timeRemaining > 10) {
            reward = Math.floor(reward * 1.25);
        }
        if (performance.livesRemaining && performance.livesRemaining > 1) {
            reward += (performance.livesRemaining - 1) * 25;
        }
        const effects = powerUpManager.getActiveEffects();
        effects.forEach(effect => {
            if (effect.type === 'token_multiplier') {
                reward = Math.floor(reward * effect.value);
            }
        });
        return reward;
    }
    shouldProtectFromElimination() {
        const effects = powerUpManager.getActiveEffects();
        return effects.some(effect => effect.type === 'second_chance');
    }
    applyPowerUpEffects(gameType, baseValue) {
        const effects = powerUpManager.getActiveEffects();
        let modifiedValue = baseValue;
        effects.forEach(effect => {
            switch (effect.type) {
                case 'speed_boost':
                    if (gameType === 'movement') {
                        modifiedValue *= effect.value;
                    }
                    break;
                case 'precision_aid':
                    if (gameType === 'precision') {
                        modifiedValue *= effect.value;
                    }
                    break;
                case 'luck_boost':
                    if (gameType === 'luck') {
                        modifiedValue *= effect.value;
                    }
                    break;
            }
        });
        return modifiedValue;
    }
    getSpecialChallengeObjectives(challengeId) {
        const challenges = {
            daily_survival: {
                objective: 'Complete 3 consecutive trials without power-ups',
                progress: 0,
                target: 3,
                restrictions: ['no_powerups']
            },
            speed_demon: {
                objective: 'Complete trial 50% faster than normal',
                timeTarget: 15,
                currentTime: 0
            },
            perfectionist: {
                objective: 'Complete with perfect precision',
                errorTolerance: 0,
                currentErrors: 0
            }
        };
        return challenges[challengeId] || null;
    }
    updateChallengeProgress(challengeId, progress) {
        const challenge = this.getSpecialChallengeObjectives(challengeId);
        if (!challenge)
            return false;
        switch (challengeId) {
            case 'daily_survival':
                challenge.progress = progress.trialsCompleted;
                return challenge.progress >= challenge.target;
            case 'speed_demon':
                challenge.currentTime = progress.timeUsed;
                return challenge.currentTime <= challenge.timeTarget;
            case 'perfectionist':
                challenge.currentErrors = progress.errors;
                return challenge.currentErrors === challenge.errorTolerance;
            default:
                return false;
        }
    }
    simulateNightmareChaseAI() {
        return {
            chaserPositions: [
                { x: 0, y: 250, speed: 1.5 + (this.difficultyMultiplier * 0.2) },
                { x: -50, y: 350, speed: 1.2 + (this.difficultyMultiplier * 0.15) },
                { x: -25, y: 200, speed: 1.8 + (this.difficultyMultiplier * 0.25) }
            ],
            obstacleDensity: 0.3 + (this.difficultyMultiplier * 0.1),
            keyDistribution: [
                { x: 300, y: 150 },
                { x: 600, y: 250 },
                { x: 900, y: 350 }
            ]
        };
    }
    reset() {
        this.gameState = {
            currentStage: 1,
            playersAlive: 456,
            isActive: false,
            gameData: {}
        };
        this.players = [];
        this.currentGameMode = null;
        this.difficultyMultiplier = 1;
        this.challengeMode = null;
    }
}
export const gameEngine = new GameEngine();
