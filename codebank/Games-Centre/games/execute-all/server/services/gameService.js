import { storage } from "../storage";
export class GameService {
    createDeck() {
        const suits = ["hearts", "diamonds", "clubs", "spades"];
        const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        const deck = [];
        for (const suit of suits) {
            for (const rank of ranks) {
                let value = 0;
                if (rank === "A")
                    value = 14;
                else if (rank === "K")
                    value = 13;
                else if (rank === "Q")
                    value = 12;
                else if (rank === "J")
                    value = 11;
                else
                    value = parseInt(rank);
                deck.push({ rank, suit, value });
            }
        }
        // Shuffle the deck
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
    async startGame(roomId) {
        const room = await storage.getGameRoom(roomId);
        const players = await storage.getPlayersInRoom(roomId);
        if (!room || players.length < 2) {
            return false;
        }
        // Deal cards to players
        const deck = [...room.deck];
        const cardsPerPlayer = Math.floor(deck.length / players.length);
        for (let i = 0; i < players.length; i++) {
            const playerCards = deck.splice(0, cardsPerPlayer);
            await storage.updatePlayer(players[i].id, {
                cards: playerCards,
                isReady: true
            });
        }
        // Update room status
        await storage.updateGameRoom(roomId, {
            gameStatus: "playing",
            currentRound: 1,
            currentPlayerIndex: 0,
            deck: deck
        });
        return true;
    }
    async playCard(roomId, playerId, card) {
        const room = await storage.getGameRoom(roomId);
        const players = await storage.getPlayersInRoom(roomId);
        const currentPlayer = players.find(p => p.playerId === playerId);
        if (!room || !currentPlayer || room.gameStatus !== "playing") {
            return false;
        }
        // Check if it's player's turn
        const currentPlayerInTurn = players[room.currentPlayerIndex];
        if (currentPlayerInTurn.playerId !== playerId) {
            return false;
        }
        // Update player's current card
        await storage.updatePlayer(currentPlayer.id, { currentCard: `${card.rank}${card.suit}` });
        // Move to next player or end round
        const nextPlayerIndex = (room.currentPlayerIndex + 1) % players.length;
        await storage.updateGameRoom(roomId, {
            currentPlayerIndex: nextPlayerIndex
        });
        // Check if round is complete
        const updatedPlayers = await storage.getPlayersInRoom(roomId);
        const playersWithCards = updatedPlayers.filter(p => p.currentCard);
        if (playersWithCards.length === players.length) {
            await this.endRound(roomId);
        }
        return true;
    }
    async endRound(roomId) {
        const room = await storage.getGameRoom(roomId);
        const players = await storage.getPlayersInRoom(roomId);
        if (!room || !players.length)
            return;
        // Determine winner (highest card value)
        let winner = players[0];
        let highestValue = 0;
        for (const player of players) {
            if (player.currentCard) {
                const cardValue = this.getCardValue(player.currentCard);
                if (cardValue > highestValue) {
                    highestValue = cardValue;
                    winner = player;
                }
            }
        }
        // Transfer pot to winner
        const pot = room.pot;
        const winnerBars = [...winner.bars, ...pot];
        await storage.updatePlayer(winner.id, {
            bars: winnerBars,
            currentCard: null
        });
        // Clear other players' current cards
        for (const player of players) {
            if (player.id !== winner.id) {
                await storage.updatePlayer(player.id, { currentCard: null });
            }
        }
        // Update room
        const nextRound = room.currentRound + 1;
        const gameFinished = nextRound > room.maxRounds;
        await storage.updateGameRoom(roomId, {
            currentRound: nextRound,
            pot: [],
            gameStatus: gameFinished ? "finished" : "playing",
            currentPlayerIndex: 0
        });
        if (gameFinished) {
            await this.endGame(roomId);
        }
    }
    async endGame(roomId) {
        const players = await storage.getPlayersInRoom(roomId);
        // Calculate final scores and update user stats
        for (const player of players) {
            const bars = player.bars;
            const totalValue = bars.reduce((sum, bar) => sum + bar.value, 0);
            const user = await storage.getUser(player.playerId);
            if (user) {
                await storage.updateUserBalance(player.playerId, user.balance + totalValue);
                // Update wins if player has the most bars
                const isWinner = this.isPlayerWinner(player, players);
                if (isWinner) {
                    await storage.updateUserStats(player.playerId, user.wins + 1, user.totalEarnings + totalValue);
                }
            }
        }
    }
    async exchangeMoney(playerId, roomId, amount) {
        const user = await storage.getUser(playerId);
        const player = await storage.getPlayer(roomId, playerId);
        if (!user || !player || user.balance < amount) {
            return [];
        }
        // Convert money to bars
        const bars = [];
        let remaining = amount;
        // Gold bars for $100+
        while (remaining >= 100) {
            bars.push({ type: "gold", value: 100 });
            remaining -= 100;
        }
        // Silver bars for $10-99
        while (remaining >= 10) {
            bars.push({ type: "silver", value: 10 });
            remaining -= 10;
        }
        // Update user balance
        await storage.updateUserBalance(playerId, user.balance - amount);
        // Update player bars
        const currentBars = player.bars;
        const newBars = [...currentBars, ...bars];
        await storage.updatePlayer(player.id, { bars: newBars });
        return bars;
    }
    getCardValue(cardString) {
        // Extract rank from card string (e.g., "Ahearts" -> "A")
        const rank = cardString.slice(0, -6); // Remove suit part
        if (rank === "A")
            return 14;
        if (rank === "K")
            return 13;
        if (rank === "Q")
            return 12;
        if (rank === "J")
            return 11;
        return parseInt(rank);
    }
    isPlayerWinner(player, allPlayers) {
        const playerValue = player.bars.reduce((sum, bar) => sum + bar.value, 0);
        for (const otherPlayer of allPlayers) {
            if (otherPlayer.id !== player.id) {
                const otherValue = otherPlayer.bars.reduce((sum, bar) => sum + bar.value, 0);
                if (otherValue > playerValue) {
                    return false;
                }
            }
        }
        return true;
    }
    async generateRoomCode() {
        let code;
        let attempts = 0;
        do {
            code = `ROYAL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            attempts++;
        } while (await storage.getGameRoomByCode(code) && attempts < 10);
        return code;
    }
}
export const gameService = new GameService();
