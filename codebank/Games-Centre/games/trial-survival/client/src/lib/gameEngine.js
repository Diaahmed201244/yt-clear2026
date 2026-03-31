"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameEngine = exports.GameEngine = void 0;
const powerUpManager_1 = require("./powerUpManager");
class GameEngine {
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
    // AI Player simulation
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
    // Eliminate random AI players
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
    // Red Light Green Light AI behavior
    simulateRedLightGreenLightAI() {
        const aiPlayers = this.players.filter(p => p.isAI && !p.isEliminated);
        const movements = [];
        let eliminations = 0;
        aiPlayers.forEach(() => {
            // Random AI movement behavior
            const movement = Math.random() * 10 + 1; // 1-10 units
            const wrongMove = Math.random() < 0.1; // 10% chance of wrong move
            movements.push(movement);
            if (wrongMove) {
                eliminations++;
            }
        });
        return { movements, eliminations };
    }
    // Tug of War AI strength simulation
    simulateTugOfWarAI() {
        // Return AI team strength (varies over time)
        return Math.random() * 3 + 1; // 1-4 strength units
    }
    // Marbles AI betting simulation
    simulateMarblesAI(playerBet) {
        const aiBet = Math.min(Math.floor(Math.random() * 5) + 1, 10); // 1-5 marbles
        const aiGuess = Math.random() < 0.5 ? 'odd' : 'even';
        const aiNumber = Math.floor(Math.random() * 20) + 1; // 1-20
        return { aiBet, aiGuess, aiNumber };
    }
    // Glass Bridge AI path selection
    simulateGlassBridgeAI(currentStep) {
        // Random AI choice for glass panels
        return Math.random() < 0.5 ? 'left' : 'right';
    }
    // Update game state
    updateGameState(updates) {
        this.gameState = Object.assign(Object.assign({}, this.gameState), updates);
    }
    // Get current game state
    getGameState() {
        return this.gameState;
    }
    // Get alive players count
    getAlivePlayersCount() {
        return this.players.filter(p => !p.isEliminated).length;
    }
    // Initialize game with AI players
    initializeGame(aiPlayerCount = 455) {
        this.players = this.simulateAIPlayers(aiPlayerCount);
        this.gameState.playersAlive = this.players.length + 1; // +1 for human player
        this.gameState.isActive = true;
    }
    // Calculate elimination rates for each stage
    getEliminationRate(stage) {
        const rates = {
            1: 0.5, // Red Light Green Light
            2: 0.3, // Honeycomb
            3: 0.5, // Tug of War
            4: 0.5, // Marbles
            5: 0.8 // Glass Bridge
        };
        return rates[stage] || 0.5;
    }
    // Set game mode and adjust difficulty
    setGameMode(gameMode) {
        this.currentGameMode = gameMode;
        this.difficultyMultiplier = gameMode.difficulty;
    }
    // Set special challenge mode
    setChallengeMode(challengeId) {
        this.challengeMode = challengeId;
    }
    // Get adjusted timer based on difficulty and power-ups
    getAdjustedTimer(baseTimer) {
        var _a, _b;
        let timer = baseTimer;
        // Apply difficulty modifier
        if (((_a = this.currentGameMode) === null || _a === void 0 ? void 0 : _a.id) === 'hardcore') {
            timer = Math.floor(timer * 0.5); // 50% less time in hardcore
        }
        else if (((_b = this.currentGameMode) === null || _b === void 0 ? void 0 : _b.id) === 'blitz') {
            timer = Math.floor(timer * 0.75); // 25% less time in blitz
        }
        // Apply power-up effects
        const effects = powerUpManager_1.powerUpManager.getActiveEffects();
        effects.forEach(effect => {
            if (effect.type === 'time_extension') {
                timer += effect.value;
            }
        });
        return Math.max(timer, 5); // Minimum 5 seconds
    }
    // Get adjusted elimination rate based on difficulty
    getAdjustedEliminationRate(stage) {
        var _a, _b;
        let baseRate = this.getEliminationRate(stage);
        // Apply difficulty modifier
        if (((_a = this.currentGameMode) === null || _a === void 0 ? void 0 : _a.id) === 'hardcore') {
            baseRate = Math.min(baseRate * 1.25, 0.9); // Increase by 25%, max 90%
        }
        else if (((_b = this.currentGameMode) === null || _b === void 0 ? void 0 : _b.id) === 'survival') {
            baseRate = Math.min(baseRate * 1.1, 0.8); // Slight increase in survival mode
        }
        return baseRate;
    }
    // Calculate tokens based on performance and modifiers
    calculateTokenReward(baseReward, performance) {
        let reward = baseReward;
        // Game mode multiplier
        if (this.currentGameMode) {
            reward = Math.floor(reward * this.currentGameMode.tokenMultiplier);
        }
        // Performance bonuses
        if (performance.perfectExecution) {
            reward = Math.floor(reward * 1.5); // 50% bonus for perfect execution
        }
        if (performance.timeRemaining > 10) {
            reward = Math.floor(reward * 1.25); // 25% bonus for finishing with time
        }
        if (performance.livesRemaining && performance.livesRemaining > 1) {
            reward += (performance.livesRemaining - 1) * 25; // 25 tokens per extra life
        }
        // Power-up token multiplier
        const effects = powerUpManager_1.powerUpManager.getActiveEffects();
        effects.forEach(effect => {
            if (effect.type === 'token_multiplier') {
                reward = Math.floor(reward * effect.value);
            }
        });
        return reward;
    }
    // Check if player should be protected from elimination
    shouldProtectFromElimination() {
        const effects = powerUpManager_1.powerUpManager.getActiveEffects();
        return effects.some(effect => effect.type === 'second_chance');
    }
    // Apply power-up effects to game mechanics
    applyPowerUpEffects(gameType, baseValue) {
        const effects = powerUpManager_1.powerUpManager.getActiveEffects();
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
                        modifiedValue *= effect.value; // Increases tolerance
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
    // Generate special challenge objectives
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
                timeTarget: 15, // seconds for Red Light Green Light
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
    // Update challenge progress
    updateChallengeProgress(challengeId, progress) {
        // Return true if challenge is completed
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
    // Nightmare Chase specific AI behavior
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
    // Reset game
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
exports.GameEngine = GameEngine;
exports.gameEngine = new GameEngine();
