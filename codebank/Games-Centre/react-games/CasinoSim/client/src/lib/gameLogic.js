export function generateDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({ suit, value });
        });
    });
    return deck;
}
export function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
export function getCardValue(value) {
    switch (value) {
        case 'A': return 14;
        case 'K': return 13;
        case 'Q': return 12;
        case 'J': return 11;
        default: return parseInt(value);
    }
}
export function evaluateHand(cards) {
    if (cards.length < 5) {
        throw new Error('Hand evaluation requires at least 5 cards');
    }
    const cardValues = cards.map(card => ({
        ...card,
        numericValue: getCardValue(card.value)
    }));
    cardValues.sort((a, b) => b.numericValue - a.numericValue);
    const valueCounts = cardValues.reduce((acc, card) => {
        acc[card.numericValue] = (acc[card.numericValue] || 0) + 1;
        return acc;
    }, {});
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const values = Object.keys(valueCounts).map(Number).sort((a, b) => b - a);
    const suits = cardValues.map(card => card.suit);
    const suitCounts = suits.reduce((acc, suit) => {
        acc[suit] = (acc[suit] || 0) + 1;
        return acc;
    }, {});
    const isFlush = Math.max(...Object.values(suitCounts)) >= 5;
    const uniqueValues = Array.from(new Set(cardValues.map(card => card.numericValue))).sort((a, b) => b - a);
    let isStraight = false;
    let straightHigh = 0;
    for (let i = 0; i <= uniqueValues.length - 5; i++) {
        if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
            isStraight = true;
            straightHigh = uniqueValues[i];
            break;
        }
    }
    if (!isStraight && uniqueValues.includes(14) && uniqueValues.includes(5) && uniqueValues.includes(4) && uniqueValues.includes(3) && uniqueValues.includes(2)) {
        isStraight = true;
        straightHigh = 5;
    }
    if (isStraight && isFlush) {
        if (straightHigh === 14) {
            return { type: 'Royal Flush', rank: 9, value: straightHigh };
        }
        return { type: 'Straight Flush', rank: 8, value: straightHigh };
    }
    if (counts[0] === 4) {
        const fourOfAKindValue = values.find(v => valueCounts[v] === 4) || 0;
        return { type: 'Four of a Kind', rank: 7, value: fourOfAKindValue };
    }
    if (counts[0] === 3 && counts[1] === 2) {
        const threeOfAKindValue = values.find(v => valueCounts[v] === 3) || 0;
        return { type: 'Full House', rank: 6, value: threeOfAKindValue };
    }
    if (isFlush) {
        return { type: 'Flush', rank: 5, value: Math.max(...values) };
    }
    if (isStraight) {
        return { type: 'Straight', rank: 4, value: straightHigh };
    }
    if (counts[0] === 3) {
        const threeOfAKindValue = values.find(v => valueCounts[v] === 3) || 0;
        return { type: 'Three of a Kind', rank: 3, value: threeOfAKindValue };
    }
    if (counts[0] === 2 && counts[1] === 2) {
        const pairValues = values.filter(v => valueCounts[v] === 2).sort((a, b) => b - a);
        return { type: 'Two Pair', rank: 2, value: pairValues[0] };
    }
    if (counts[0] === 2) {
        const pairValue = values.find(v => valueCounts[v] === 2) || 0;
        return { type: 'One Pair', rank: 1, value: pairValue };
    }
    return { type: 'High Card', rank: 0, value: Math.max(...values) };
}
export function compareHands(hand1, hand2) {
    if (hand1.rank !== hand2.rank) {
        return hand1.rank - hand2.rank;
    }
    return hand1.value - hand2.value;
}
export function getBestHand(playerCards, communityCards) {
    const allCards = [...playerCards, ...communityCards];
    if (allCards.length < 5) {
        throw new Error('Not enough cards to evaluate hand');
    }
    const combinations = [];
    function generateCombinations(start, currentCombo) {
        if (currentCombo.length === 5) {
            combinations.push([...currentCombo]);
            return;
        }
        for (let i = start; i < allCards.length; i++) {
            currentCombo.push(allCards[i]);
            generateCombinations(i + 1, currentCombo);
            currentCombo.pop();
        }
    }
    generateCombinations(0, []);
    let bestHand = { type: 'High Card', rank: -1, value: -1, cards: [] };
    for (const combo of combinations) {
        const evaluation = evaluateHand(combo);
        if (evaluation.rank > bestHand.rank ||
            (evaluation.rank === bestHand.rank && evaluation.value > bestHand.value)) {
            bestHand = { ...evaluation, cards: combo };
        }
    }
    return bestHand;
}
