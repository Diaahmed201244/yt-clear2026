"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGameState = useGameState;
const react_1 = require("react");
const useLocalStorage_1 = require("./useLocalStorage");
const OUTCOMES = {
    SMALL_REWARD: { min: 10, max: 100, probability: 0.3 },
    MEDIUM_REWARD: { min: 200, max: 500, probability: 0.22 },
    JACKPOT: { min: 800, max: 1500, probability: 0.04 },
    MULTIPLIER: { multiplier: [2, 3, 5], probability: 0.06 },
    BOMB: { probability: 0.1 },
    KNIFE: { probability: 0.06 },
    THIEF: { min: 50, max: 200, probability: 0.04 },
    CURSE: { probability: 0.02 },
    ELIXIR: { probability: 0.08 },
    SHIELD: { probability: 0.08 }
};
function useGameState() {
    const [totalCodes, setTotalCodes] = (0, useLocalStorage_1.useLocalStorage)('totalCodes', 1000);
    const [hasPlayedBefore, setHasPlayedBefore] = (0, useLocalStorage_1.useLocalStorage)('hasPlayedBefore', false);
    const [hasPlayedToday, setHasPlayedToday] = (0, useLocalStorage_1.useLocalStorage)('hasPlayedToday', false);
    const [gameState, setGameState] = (0, react_1.useState)({
        greedLevel: 0,
        isPlaying: false,
        boxes: [],
        currentRound: 0,
        phase: 'selection',
        shieldActive: false,
        shieldTimeLeft: 0,
        lastLostBalance: 0
    });
    const generateBoxOutcomes = (0, react_1.useCallback)(() => {
        const boxes = [];
        for (let i = 0; i < 6; i++) {
            const random = Math.random();
            const bombChance = OUTCOMES.BOMB.probability + (gameState.greedLevel * 0.03);
            const knifeChance = OUTCOMES.KNIFE.probability + (gameState.greedLevel * 0.02);
            let cumulativeProbability = 0;
            // Small reward
            cumulativeProbability += OUTCOMES.SMALL_REWARD.probability;
            if (random < cumulativeProbability) {
                boxes.push({
                    type: 'reward',
                    value: Math.floor(Math.random() * (OUTCOMES.SMALL_REWARD.max - OUTCOMES.SMALL_REWARD.min + 1)) + OUTCOMES.SMALL_REWARD.min
                });
                continue;
            }
            // Medium reward
            cumulativeProbability += OUTCOMES.MEDIUM_REWARD.probability;
            if (random < cumulativeProbability) {
                boxes.push({
                    type: 'reward',
                    value: Math.floor(Math.random() * (OUTCOMES.MEDIUM_REWARD.max - OUTCOMES.MEDIUM_REWARD.min + 1)) + OUTCOMES.MEDIUM_REWARD.min
                });
                continue;
            }
            // Jackpot
            cumulativeProbability += OUTCOMES.JACKPOT.probability;
            if (random < cumulativeProbability) {
                boxes.push({
                    type: 'jackpot',
                    value: Math.floor(Math.random() * (OUTCOMES.JACKPOT.max - OUTCOMES.JACKPOT.min + 1)) + OUTCOMES.JACKPOT.min
                });
                continue;
            }
            // Multiplier
            cumulativeProbability += OUTCOMES.MULTIPLIER.probability;
            if (random < cumulativeProbability) {
                const multipliers = OUTCOMES.MULTIPLIER.multiplier;
                boxes.push({
                    type: 'multiplier',
                    multiplier: multipliers[Math.floor(Math.random() * multipliers.length)]
                });
                continue;
            }
            // Bomb
            cumulativeProbability += bombChance;
            if (random < cumulativeProbability) {
                boxes.push({ type: 'bomb' });
                continue;
            }
            // Knife (cuts balance in half)
            cumulativeProbability += knifeChance;
            if (random < cumulativeProbability) {
                boxes.push({ type: 'knife' });
                continue;
            }
            // Thief (steals from total balance)
            cumulativeProbability += OUTCOMES.THIEF.probability;
            if (random < cumulativeProbability) {
                boxes.push({
                    type: 'thief',
                    value: Math.floor(Math.random() * (OUTCOMES.THIEF.max - OUTCOMES.THIEF.min + 1)) + OUTCOMES.THIEF.min
                });
                continue;
            }
            // Curse (lose next round automatically)
            cumulativeProbability += OUTCOMES.CURSE.probability;
            if (random < cumulativeProbability) {
                boxes.push({ type: 'curse' });
                continue;
            }
            // Elixir (restores lost balance)
            cumulativeProbability += OUTCOMES.ELIXIR.probability;
            if (random < cumulativeProbability) {
                boxes.push({ type: 'elixir' });
                continue;
            }
            // Shield (protects from damage)
            cumulativeProbability += OUTCOMES.SHIELD.probability;
            if (random < cumulativeProbability) {
                boxes.push({ type: 'shield' });
                continue;
            }
            // Nothing
            boxes.push({ type: 'nothing' });
        }
        return boxes;
    }, [gameState.greedLevel]);
    const startNewRound = (0, react_1.useCallback)((recordPlay) => {
        if (totalCodes < 1)
            return false;
        // Record play on first game of the day if recordPlay function is provided
        if (recordPlay && !hasPlayedToday) {
            recordPlay().then((success) => {
                if (success) {
                    setHasPlayedToday(true);
                }
            });
        }
        setTotalCodes(prev => prev - 1);
        setGameState(prev => (Object.assign(Object.assign({}, prev), { isPlaying: true, boxes: generateBoxOutcomes(), currentRound: prev.currentRound + 1, phase: 'selection' })));
        return true;
    }, [totalCodes, setTotalCodes, generateBoxOutcomes, hasPlayedToday, setHasPlayedToday]);
    const openBox = (0, react_1.useCallback)((boxIndex) => {
        const outcome = gameState.boxes[boxIndex];
        setGameState(prev => {
            const newState = Object.assign({}, prev);
            if (outcome.type === 'reward' && outcome.value) {
                setTotalCodes(prev => prev + outcome.value);
                newState.phase = 'decision';
            }
            else if (outcome.type === 'jackpot' && outcome.value) {
                setTotalCodes(prev => prev + outcome.value);
                newState.phase = 'decision';
            }
            else if (outcome.type === 'multiplier' && outcome.multiplier) {
                // Multiply current total codes
                setTotalCodes(prev => prev * outcome.multiplier);
                newState.phase = 'decision';
            }
            else if (outcome.type === 'bomb') {
                if (newState.shieldActive) {
                    // Shield protects from bomb
                    newState.phase = 'decision';
                }
                else {
                    newState.lastLostBalance = totalCodes;
                    setTotalCodes(0);
                    newState.greedLevel = 0;
                    newState.phase = 'gameOver';
                }
            }
            else if (outcome.type === 'knife') {
                if (newState.shieldActive) {
                    // Shield protects from knife
                    newState.phase = 'decision';
                }
                else {
                    // Cuts total balance in half
                    const currentBalance = totalCodes;
                    const lostAmount = Math.floor(currentBalance / 2);
                    newState.lastLostBalance = lostAmount;
                    setTotalCodes(prev => Math.floor(prev / 2));
                    newState.phase = 'gameOver';
                }
            }
            else if (outcome.type === 'thief' && outcome.value) {
                if (newState.shieldActive) {
                    // Shield protects from thief
                    newState.phase = 'decision';
                }
                else {
                    // Steals from total balance
                    newState.lastLostBalance = outcome.value;
                    setTotalCodes(prev => Math.max(0, prev - outcome.value));
                    newState.phase = 'decision';
                }
            }
            else if (outcome.type === 'curse') {
                if (newState.shieldActive) {
                    // Shield protects from curse
                    newState.phase = 'decision';
                }
                else {
                    newState.lastLostBalance = totalCodes;
                    setTotalCodes(0);
                    newState.greedLevel = Math.min(newState.greedLevel + 2, 5);
                    newState.phase = 'gameOver';
                }
            }
            else if (outcome.type === 'elixir') {
                // Restores lost balance from this round
                if (newState.lastLostBalance > 0) {
                    setTotalCodes(prev => prev + newState.lastLostBalance);
                    newState.lastLostBalance = 0;
                }
                newState.phase = 'decision';
            }
            else if (outcome.type === 'shield') {
                // Activates protective shield for 10 seconds
                newState.shieldActive = true;
                newState.shieldTimeLeft = 10;
                newState.phase = 'decision';
            }
            else {
                newState.phase = 'decision';
            }
            newState.isPlaying = false;
            return newState;
        });
        return outcome;
    }, [gameState.boxes, gameState.shieldActive, totalCodes, setTotalCodes]);
    const collectReward = (0, react_1.useCallback)(() => {
        // Reset greed level and go back to selection
        setGameState(prev => (Object.assign(Object.assign({}, prev), { greedLevel: 0, phase: 'selection', currentRound: 0 })));
    }, []);
    const continueGame = (0, react_1.useCallback)(() => {
        // Check if player has enough codes to continue
        if (totalCodes < 1) {
            return false;
        }
        // Deduct 1 code and continue the game
        setTotalCodes(prev => prev - 1);
        setGameState(prev => (Object.assign(Object.assign({}, prev), { greedLevel: Math.min(prev.greedLevel + 1, 5), boxes: generateBoxOutcomes(), phase: 'selection', isPlaying: true })));
        return true;
    }, [generateBoxOutcomes, totalCodes, setTotalCodes]);
    const resetGame = (0, react_1.useCallback)(() => {
        setGameState(prev => (Object.assign(Object.assign({}, prev), { greedLevel: 0, isPlaying: false, boxes: generateBoxOutcomes(), currentRound: 0, phase: 'selection' })));
    }, [generateBoxOutcomes]);
    const markAsPlayed = (0, react_1.useCallback)(() => {
        setHasPlayedBefore(true);
    }, [setHasPlayedBefore]);
    // Shield timer countdown effect
    (0, react_1.useEffect)(() => {
        let timer;
        if (gameState.shieldActive && gameState.shieldTimeLeft > 0) {
            timer = setInterval(() => {
                setGameState(prev => {
                    const newTimeLeft = prev.shieldTimeLeft - 1;
                    if (newTimeLeft <= 0) {
                        return Object.assign(Object.assign({}, prev), { shieldActive: false, shieldTimeLeft: 0 });
                    }
                    return Object.assign(Object.assign({}, prev), { shieldTimeLeft: newTimeLeft });
                });
            }, 1000);
        }
        return () => {
            if (timer)
                clearInterval(timer);
        };
    }, [gameState.shieldActive, gameState.shieldTimeLeft]);
    return Object.assign(Object.assign({}, gameState), { totalCodes,
        hasPlayedBefore,
        hasPlayedToday,
        startNewRound,
        openBox,
        collectReward,
        continueGame,
        resetGame,
        markAsPlayed });
}
