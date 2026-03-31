"use strict";
// ==========================
// FULL LOGIC FOR GAMBLING DECK GAME
// ==========================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeck = createDeck;
exports.evaluateSimpleHand = evaluateSimpleHand;
exports.initializeGame = initializeGame;
exports.startRound = startRound;
exports.proceedToFlop = proceedToFlop;
exports.proceedToTurn = proceedToTurn;
exports.proceedToRiver = proceedToRiver;
exports.playerFold = playerFold;
exports.revealWinner = revealWinner;
exports.shuffleDeck = shuffleDeck;
exports.dealHands = dealHands;
// Utilities
function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
}
function evaluateSimpleHand(cards) {
    const rankValue = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
        '7': 7, '8': 8, '9': 9, '10': 10,
        J: 11, Q: 12, K: 13, A: 14,
    };
    return Math.max(...cards.map(c => rankValue[c.rank])); // simple high-card
}
function initializeGame(players) {
    const deck = createDeck();
    return {
        players: players.map(p => (Object.assign(Object.assign({}, p), { hand: [], hasFolded: false, stake: 0 }))),
        pot: 0,
        deck,
        sharedCards: [],
        currentTurnIndex: 0,
        roundStage: 'waiting',
        dealerMessage: 'Waiting for game start...'
    };
}
function startRound(state, stake) {
    // Collect stakes and deal 2 cards each
    for (const player of state.players) {
        player.hand = [state.deck.pop(), state.deck.pop()];
        player.balance -= stake;
        player.stake = stake;
        state.pot += stake;
    }
    state.roundStage = 'deal';
    state.dealerMessage = 'Dealing cards to players...';
    return Object.assign({}, state);
}
function proceedToFlop(state) {
    state.sharedCards = [state.deck.pop(), state.deck.pop(), state.deck.pop()];
    state.roundStage = 'flop';
    state.dealerMessage = 'Flop revealed.';
    return Object.assign({}, state);
}
function proceedToTurn(state) {
    state.sharedCards.push(state.deck.pop());
    state.roundStage = 'turn';
    state.dealerMessage = 'Turn card revealed.';
    return Object.assign({}, state);
}
function proceedToRiver(state) {
    state.sharedCards.push(state.deck.pop());
    state.roundStage = 'river';
    state.dealerMessage = 'River card revealed.';
    return Object.assign({}, state);
}
function playerFold(state, playerId) {
    const player = state.players.find(p => p.id === playerId);
    if (player) {
        player.hasFolded = true;
    }
    state.dealerMessage = `${player === null || player === void 0 ? void 0 : player.name} has folded.`;
    return Object.assign({}, state);
}
function revealWinner(state) {
    const activePlayers = state.players.filter(p => !p.hasFolded);
    let bestScore = -1;
    let winner;
    for (const p of activePlayers) {
        const score = evaluateSimpleHand([...p.hand, ...state.sharedCards]);
        if (score > bestScore) {
            bestScore = score;
            winner = p;
        }
    }
    if (winner) {
        winner.balance += state.pot;
        state.dealerMessage = `🏆 ${winner.name} wins the pot of $${state.pot}!`;
        state.winner = winner;
    }
    state.roundStage = 'reveal';
    return Object.assign({}, state);
}
function shuffleDeck(deck) {
    return [...deck].sort(() => Math.random() - 0.5);
}
function dealHands(deck, numPlayers, cardsPerHand) {
    const hands = [];
    for (let i = 0; i < numPlayers; i++) {
        const hand = [];
        for (let j = 0; j < cardsPerHand; j++) {
            const cardIndex = i * cardsPerHand + j;
            if (cardIndex < deck.length) {
                hand.push(deck[cardIndex]);
            }
        }
        hands.push(hand);
    }
    return hands;
}
// Exports done. UI and multiplayer engine should use this module for all core logic transitions.
