export const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
export const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '⭐', '💰'];
export const generateSlotReels = () => {
    return Array(3).fill(null).map(() => Array(3).fill(null).map(() => SLOT_SYMBOLS[generateRandomNumber(0, SLOT_SYMBOLS.length - 1)]));
};
export const checkSlotWin = (reels) => {
    const winLines = [];
    let totalMultiplier = 0;
    for (let row = 0; row < 3; row++) {
        if (reels[0][row] === reels[1][row] && reels[1][row] === reels[2][row]) {
            winLines.push(row);
            totalMultiplier += getSymbolMultiplier(reels[0][row]);
        }
    }
    if (reels[0][0] === reels[1][1] && reels[1][1] === reels[2][2]) {
        winLines.push(3);
        totalMultiplier += getSymbolMultiplier(reels[0][0]);
    }
    if (reels[0][2] === reels[1][1] && reels[1][1] === reels[2][0]) {
        winLines.push(4);
        totalMultiplier += getSymbolMultiplier(reels[0][2]);
    }
    return {
        isWin: winLines.length > 0,
        lines: winLines,
        multiplier: totalMultiplier
    };
};
const getSymbolMultiplier = (symbol) => {
    const multipliers = {
        '💰': 10,
        '💎': 8,
        '⭐': 6,
        '🔔': 4,
        '🍇': 3,
        '🍊': 2,
        '🍋': 1.5,
        '🍒': 1
    };
    return multipliers[symbol] || 1;
};
export const rollDice = () => {
    return generateRandomNumber(1, 6);
};
export const calculateDiceWin = (prediction, roll, bet) => {
    const isHigh = roll >= 4;
    const isLow = roll <= 3;
    if ((prediction === 'high' && isHigh) || (prediction === 'low' && isLow)) {
        return bet * 1.98;
    }
    return 0;
};
export const generateCrashPoint = () => {
    const random = Math.random();
    const crashPoint = Math.floor((1 / (1 - random)) * 100) / 100;
    return Math.max(1.00, Math.min(crashPoint, 50.00));
};
export const calculateCrashPayout = (bet, multiplier, cashoutMultiplier) => {
    if (cashoutMultiplier && cashoutMultiplier <= multiplier) {
        return bet * cashoutMultiplier;
    }
    return 0;
};
export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
export const easeOutQuart = (t) => {
    return 1 - Math.pow(1 - t, 4);
};
