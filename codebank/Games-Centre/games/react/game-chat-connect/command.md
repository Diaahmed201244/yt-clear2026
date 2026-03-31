// ==========================
// FULL LOGIC FOR GAMBLING DECK GAME
// ==========================

// This module defines the full logic and state management for a Texas Hold'em-like gambling card game.

// Key Features:
// - Supports any number of players (2+)
// - Dealer AI manages stakes, card dealing, round flow
// - Shared cards (flop, turn, river)
// - Player hands evaluated to determine winner
// - Supports folding, pot collection, and balance tracking

// Types
export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  hasFolded: boolean;
  balance: number;
  stake: number;
}

export interface GameState {
  players: Player[];
  pot: number;
  deck: Card[];
  sharedCards: Card[];
  currentTurnIndex: number;
  roundStage: 'waiting' | 'deal' | 'flop' | 'turn' | 'river' | 'reveal';
  dealerMessage: string;
  winner?: Player;
}

// Utilities
export function createDeck(): Card[] {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

export function evaluateSimpleHand(cards: Card[]): number {
  const rankValue: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
    '7': 7, '8': 8, '9': 9, '10': 10,
    J: 11, Q: 12, K: 13, A: 14,
  };
  return Math.max(...cards.map(c => rankValue[c.rank])); // simple high-card
}

export function initializeGame(players: Player[]): GameState {
  const deck = createDeck();
  return {
    players: players.map(p => ({ ...p, hand: [], hasFolded: false, stake: 0 })),
    pot: 0,
    deck,
    sharedCards: [],
    currentTurnIndex: 0,
    roundStage: 'waiting',
    dealerMessage: 'Waiting for game start...'
  };
}

export function startRound(state: GameState, stake: number): GameState {
  // Collect stakes and deal 2 cards each
  for (const player of state.players) {
    player.hand = [state.deck.pop()!, state.deck.pop()!];
    player.balance -= stake;
    player.stake = stake;
    state.pot += stake;
  }
  state.roundStage = 'deal';
  state.dealerMessage = 'Dealing cards to players...';
  return { ...state };
}

export function proceedToFlop(state: GameState): GameState {
  state.sharedCards = [state.deck.pop()!, state.deck.pop()!, state.deck.pop()!];
  state.roundStage = 'flop';
  state.dealerMessage = 'Flop revealed.';
  return { ...state };
}

export function proceedToTurn(state: GameState): GameState {
  state.sharedCards.push(state.deck.pop()!);
  state.roundStage = 'turn';
  state.dealerMessage = 'Turn card revealed.';
  return { ...state };
}

export function proceedToRiver(state: GameState): GameState {
  state.sharedCards.push(state.deck.pop()!);
  state.roundStage = 'river';
  state.dealerMessage = 'River card revealed.';
  return { ...state };
}

export function playerFold(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (player) {
    player.hasFolded = true;
  }
  state.dealerMessage = `${player?.name} has folded.`;
  return { ...state };
}

export function revealWinner(state: GameState): GameState {
  const activePlayers = state.players.filter(p => !p.hasFolded);
  let bestScore = -1;
  let winner: Player | undefined;

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
  return { ...state };
}

// Exports done. UI and multiplayer engine should use this module for all core logic transitions.





