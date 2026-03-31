"use strict";
// Utility functions for casino games
Object.defineProperty(exports, "__esModule", { value: true });
exports.easeOutQuart = exports.sleep = exports.calculateCrashPayout = exports.generateCrashPoint = exports.calculateDiceWin = exports.rollDice = exports.checkSlotWin = exports.generateSlotReels = exports.SLOT_SYMBOLS = exports.formatCurrency = exports.generateRandomNumber = void 0;
const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.generateRandomNumber = generateRandomNumber;
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
// Slots game utilities
exports.SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '⭐', '💰'];
const generateSlotReels = () => {
    return Array(3).fill(null).map(() => Array(3).fill(null).map(() => exports.SLOT_SYMBOLS[(0, exports.generateRandomNumber)(0, exports.SLOT_SYMBOLS.length - 1)]));
};
exports.generateSlotReels = generateSlotReels;
const checkSlotWin = (reels) => {
    const winLines = [];
    let totalMultiplier = 0;
    // Check horizontal lines
    for (let row = 0; row < 3; row++) {
        if (reels[0][row] === reels[1][row] && reels[1][row] === reels[2][row]) {
            winLines.push(row);
            totalMultiplier += getSymbolMultiplier(reels[0][row]);
        }
    }
    // Check diagonal lines
    if (reels[0][0] === reels[1][1] && reels[1][1] === reels[2][2]) {
        winLines.push(3); // Top-left to bottom-right
        totalMultiplier += getSymbolMultiplier(reels[0][0]);
    }
    if (reels[0][2] === reels[1][1] && reels[1][1] === reels[2][0]) {
        winLines.push(4); // Top-right to bottom-left
        totalMultiplier += getSymbolMultiplier(reels[0][2]);
    }
    return {
        isWin: winLines.length > 0,
        lines: winLines,
        multiplier: totalMultiplier
    };
};
exports.checkSlotWin = checkSlotWin;
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
// Dice game utilities
const rollDice = () => {
    return (0, exports.generateRandomNumber)(1, 6);
};
exports.rollDice = rollDice;
const calculateDiceWin = (prediction, roll, bet) => {
    const isHigh = roll >= 4;
    const isLow = roll <= 3;
    if ((prediction === 'high' && isHigh) || (prediction === 'low' && isLow)) {
        return bet * 1.98; // 98% return rate
    }
    return 0;
};
exports.calculateDiceWin = calculateDiceWin;
// Crash game utilities
const generateCrashPoint = () => {
    // Generate crash point using exponential distribution
    // This creates realistic crash patterns similar to actual crash games
    const random = Math.random();
    const crashPoint = Math.floor((1 / (1 - random)) * 100) / 100;
    // Ensure minimum crash point of 1.00x and cap at reasonable max
    return Math.max(1.00, Math.min(crashPoint, 50.00));
};
exports.generateCrashPoint = generateCrashPoint;
const calculateCrashPayout = (bet, multiplier, cashoutMultiplier) => {
    if (cashoutMultiplier && cashoutMultiplier <= multiplier) {
        return bet * cashoutMultiplier;
    }
    return 0; // Lost if didn't cash out before crash
};
exports.calculateCrashPayout = calculateCrashPayout;
// Animation utilities
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
const easeOutQuart = (t) => {
    return 1 - Math.pow(1 - t, 4);
};
exports.easeOutQuart = easeOutQuart;
