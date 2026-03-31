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
        const deck = [...room.deck];
        const cardsPerPlayer = Math.floor(deck.length / players.length);
        for (let i = 0; i < players.length; i++) {
            const playerCards = deck.splice(0, cardsPerPlayer);
            await storage.updatePlayer(players[i].id, {
                cards: playerCards,
                isReady: true
            });
        }
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
        const currentPlayerInTurn = players[room.currentPlayerIndex];
        if (currentPlayerInTurn.playerId !== playerId) {
            return false;
        }
        await storage.updatePlayer(currentPlayer.id, { currentCard: `${card.rank}${card.suit}` });
        const nextPlayerIndex = (room.currentPlayerIndex + 1) % players.length;
        await storage.updateGameRoom(roomId, {
            currentPlayerIndex: nextPlayerIndex
        });
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
        const pot = room.pot;
        const winnerBars = [...winner.bars, ...pot];
        await storage.updatePlayer(winner.id, {
            bars: winnerBars,
            currentCard: null
        });
        for (const player of players) {
            if (player.id !== winner.id) {
                await storage.updatePlayer(player.id, { currentCard: null });
            }
        }
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
        for (const player of players) {
            const bars = player.bars;
            const totalValue = bars.reduce((sum, bar) => sum + bar.value, 0);
            const user = await storage.getUser(player.playerId);
            if (user) {
                await storage.updateUserBalance(player.playerId, user.balance + totalValue);
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
        const bars = [];
        let remaining = amount;
        while (remaining >= 100) {
            bars.push({ type: "gold", value: 100 });
            remaining -= 100;
        }
        while (remaining >= 10) {
            bars.push({ type: "silver", value: 10 });
            remaining -= 10;
        }
        await storage.updateUserBalance(playerId, user.balance - amount);
        const currentBars = player.bars;
        const newBars = [...currentBars, ...bars];
        await storage.updatePlayer(player.id, { bars: newBars });
        return bars;
    }
    getCardValue(cardString) {
        const rank = cardString.slice(0, -6);
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
