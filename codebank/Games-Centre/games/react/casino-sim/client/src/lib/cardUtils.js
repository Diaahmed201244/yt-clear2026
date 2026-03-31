export function getCardDisplayColor(suit) {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-black';
}
export function getSuitSymbol(suit) {
    const symbols = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠'
    };
    return symbols[suit];
}
export function getCardDisplayValue(value) {
    return value;
}
export function formatCardForDisplay(card) {
    return {
        value: getCardDisplayValue(card.value),
        suit: getSuitSymbol(card.suit),
        color: getCardDisplayColor(card.suit)
    };
}
export function isCardRed(suit) {
    return suit === 'hearts' || suit === 'diamonds';
}
export function isCardBlack(suit) {
    return suit === 'clubs' || suit === 'spades';
}
