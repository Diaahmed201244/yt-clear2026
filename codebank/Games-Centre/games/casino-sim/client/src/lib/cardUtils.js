"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCardDisplayColor = getCardDisplayColor;
exports.getSuitSymbol = getSuitSymbol;
exports.getCardDisplayValue = getCardDisplayValue;
exports.formatCardForDisplay = formatCardForDisplay;
exports.isCardRed = isCardRed;
exports.isCardBlack = isCardBlack;
function getCardDisplayColor(suit) {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-black';
}
function getSuitSymbol(suit) {
    const symbols = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠'
    };
    return symbols[suit];
}
function getCardDisplayValue(value) {
    return value;
}
function formatCardForDisplay(card) {
    return {
        value: getCardDisplayValue(card.value),
        suit: getSuitSymbol(card.suit),
        color: getCardDisplayColor(card.suit)
    };
}
function isCardRed(suit) {
    return suit === 'hearts' || suit === 'diamonds';
}
function isCardBlack(suit) {
    return suit === 'clubs' || suit === 'spades';
}
