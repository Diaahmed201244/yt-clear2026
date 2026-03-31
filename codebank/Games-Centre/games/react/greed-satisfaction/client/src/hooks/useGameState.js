import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
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
export function useGameState() {
    const [totalCodes, setTotalCodes] = useLocalStorage('totalCodes', 1000);
    const [hasPlayedBefore, setHasPlayedBefore] = useLocalStorage('hasPlayedBefore', false);
    const [hasPlayedToday, setHasPlayedToday] = useLocalStorage('hasPlayedToday', false);
    const [gameState, setGameState] = useState({
        greedLevel: 0,
        isPlaying: false,
        boxes: [],
        currentRound: 0,
        phase: 'selection',
        shieldActive: false,
        shieldTimeLeft: 0,
        lastLostBalance: 0
    });
    const generateBoxOutcomes = useCallback(() => {
        const boxes = [];
        for (let i = 0; i < 6; i++) {
            const random = Math.random();
            const bombChance = OUTCOMES.BOMB.probability + (gameState.greedLevel * 0.03);
            const knifeChance = OUTCOMES.KNIFE.probability + (gameState.greedLevel * 0.02);
            let cumulativeProbability = 0;
            cumulativeProbability += OUTCOMES.SMALL_REWARD.probability;
            if (random < cumulativeProbability) {
                boxes.push({
                    type: 'reward',
                    value: Math.floor(Math.random() * (OUTCOMES.SMALL_REWARD.max - OUTCOMES.SMALL_REWARD.min + 1)) + OUTCOMES.SMALL_REWARD.min
                });
                continue;
            }
            cumulativeProbability += OUTCOMES.MEDIUM_REWARD.probability;
            if (random < cumulativeProbability) {
                boxes.push({
                    type: 'reward',
                    value: Math.floor(Math.random() * (OUTCOMES.MEDIUM_REWARD.max - OUTCOMES.MEDIUM_REWARD.min + 1)) + OUTCOMES.MEDIUM_REWARD.min
                });
                continue;
            }
            cumulativeProbability += OUTCOMES.JACKPOT.probability;
            if (random < cumulativeProbability) {
                boxes.push({
                    type: 'jackpot',
                    value: Math.floor(Math.random() * (OUTCOMES.JACKPOT.max - OUTCOMES.JACKPOT.min + 1)) + OUTCOMES.JACKPOT.min
                });
                continue;
            }
            cumulativeProbability += OUTCOMES.MULTIPLIER.probability;
            if (random < cumulativeProbability) {
                const multipliers = OUTCOMES.MULTIPLIER.multiplier;
                boxes.push({
                    type: 'multiplier',
                    multiplier: multipliers[Math.floor(Math.random() * multipliers.length)]
                });
                continue;
            }
            cumulativeProbability += bombChance;
            if (random < cumulativeProbability) {
                boxes.push({ type: 'bomb' });
                continue;
            }
            cumulativeProbability += knifeChance;
            if (random < cumulativeProbability) {
                boxes.push({ type: 'knife' });
                continue;
            }
            cumulativeProbability += OUTCOMES.THIEF.probability;
            if (random < cumulativeProbability) {
                boxes.push({
                    type: 'thief',
                    value: Math.floor(Math.random() * (OUTCOMES.THIEF.max - OUTCOMES.THIEF.min + 1)) + OUTCOMES.THIEF.min
                });
                continue;
            }
            cumulativeProbability += OUTCOMES.CURSE.probability;
            if (random < cumulativeProbability) {
                boxes.push({ type: 'curse' });
                continue;
            }
            cumulativeProbability += OUTCOMES.ELIXIR.probability;
            if (random < cumulativeProbability) {
                boxes.push({ type: 'elixir' });
                continue;
            }
            cumulativeProbability += OUTCOMES.SHIELD.probability;
            if (random < cumulativeProbability) {
                boxes.push({ type: 'shield' });
                continue;
            }
            boxes.push({ type: 'nothing' });
        }
        return boxes;
    }, [gameState.greedLevel]);
    const startNewRound = useCallback((recordPlay) => {
        if (totalCodes < 1)
            return false;
        if (recordPlay && !hasPlayedToday) {
            recordPlay().then((success) => {
                if (success) {
                    setHasPlayedToday(true);
                }
            });
        }
        setTotalCodes(prev => prev - 1);
        setGameState(prev => ({
            ...prev,
            isPlaying: true,
            boxes: generateBoxOutcomes(),
            currentRound: prev.currentRound + 1,
            phase: 'selection'
        }));
        return true;
    }, [totalCodes, setTotalCodes, generateBoxOutcomes, hasPlayedToday, setHasPlayedToday]);
    const openBox = useCallback((boxIndex) => {
        const outcome = gameState.boxes[boxIndex];
        setGameState(prev => {
            const newState = { ...prev };
            if (outcome.type === 'reward' && outcome.value) {
                setTotalCodes(prev => prev + outcome.value);
                newState.phase = 'decision';
            }
            else if (outcome.type === 'jackpot' && outcome.value) {
                setTotalCodes(prev => prev + outcome.value);
                newState.phase = 'decision';
            }
            else if (outcome.type === 'multiplier' && outcome.multiplier) {
                setTotalCodes(prev => prev * outcome.multiplier);
                newState.phase = 'decision';
            }
            else if (outcome.type === 'bomb') {
                if (newState.shieldActive) {
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
                    newState.phase = 'decision';
                }
                else {
                    const currentBalance = totalCodes;
                    const lostAmount = Math.floor(currentBalance / 2);
                    newState.lastLostBalance = lostAmount;
                    setTotalCodes(prev => Math.floor(prev / 2));
                    newState.phase = 'gameOver';
                }
            }
            else if (outcome.type === 'thief' && outcome.value) {
                if (newState.shieldActive) {
                    newState.phase = 'decision';
                }
                else {
                    newState.lastLostBalance = outcome.value;
                    setTotalCodes(prev => Math.max(0, prev - outcome.value));
                    newState.phase = 'decision';
                }
            }
            else if (outcome.type === 'curse') {
                if (newState.shieldActive) {
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
                if (newState.lastLostBalance > 0) {
                    setTotalCodes(prev => prev + newState.lastLostBalance);
                    newState.lastLostBalance = 0;
                }
                newState.phase = 'decision';
            }
            else if (outcome.type === 'shield') {
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
    const collectReward = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            greedLevel: 0,
            phase: 'selection',
            currentRound: 0
        }));
    }, []);
    const continueGame = useCallback(() => {
        if (totalCodes < 1) {
            return false;
        }
        setTotalCodes(prev => prev - 1);
        setGameState(prev => ({
            ...prev,
            greedLevel: Math.min(prev.greedLevel + 1, 5),
            boxes: generateBoxOutcomes(),
            phase: 'selection',
            isPlaying: true
        }));
        return true;
    }, [generateBoxOutcomes, totalCodes, setTotalCodes]);
    const resetGame = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            greedLevel: 0,
            isPlaying: false,
            boxes: generateBoxOutcomes(),
            currentRound: 0,
            phase: 'selection'
        }));
    }, [generateBoxOutcomes]);
    const markAsPlayed = useCallback(() => {
        setHasPlayedBefore(true);
    }, [setHasPlayedBefore]);
    useEffect(() => {
        let timer;
        if (gameState.shieldActive && gameState.shieldTimeLeft > 0) {
            timer = setInterval(() => {
                setGameState(prev => {
                    const newTimeLeft = prev.shieldTimeLeft - 1;
                    if (newTimeLeft <= 0) {
                        return { ...prev, shieldActive: false, shieldTimeLeft: 0 };
                    }
                    return { ...prev, shieldTimeLeft: newTimeLeft };
                });
            }, 1000);
        }
        return () => {
            if (timer)
                clearInterval(timer);
        };
    }, [gameState.shieldActive, gameState.shieldTimeLeft]);
    return {
        ...gameState,
        totalCodes,
        hasPlayedBefore,
        hasPlayedToday,
        startNewRound,
        openBox,
        collectReward,
        continueGame,
        resetGame,
        markAsPlayed
    };
}
