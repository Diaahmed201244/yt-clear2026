import { evaluateSimpleHand } from "./GameLogic";
export function generateBotPersonality() {
    const personalities = [
        "aggressive", "conservative", "balanced", "trickster", "timid", "lucky", "showoff", "grumpy", "zen", "rookie"
    ];
    return personalities[Math.floor(Math.random() * personalities.length)];
}
export function chooseBetAmount(balance, minBet, difficulty) {
    if (difficulty === "easy")
        return minBet;
    if (difficulty === "medium")
        return Math.min(balance, minBet * 2 + Math.floor(Math.random() * minBet));
    return Math.min(balance, minBet * 3 + Math.floor(Math.random() * (minBet * 2)));
}
export function decideAction(player, gameState, difficulty, personality = "balanced") {
    if (player.hasFolded)
        return "fold";
    const handStrength = evaluateSimpleHand([...player.hand, ...gameState.sharedCards]);
    const currentStake = Math.max(...gameState.players.map(p => p.stake));
    const canCheck = player.stake === currentStake;
    if (personality === "aggressive") {
        if (handStrength > 10) {
            return "raise";
        }
        if (handStrength > 5) {
            return canCheck ? "check" : "call";
        }
        return "fold";
    }
    if (personality === "conservative") {
        if (handStrength > 12) {
            return "raise";
        }
        if (handStrength > 8) {
            return canCheck ? "check" : "call";
        }
        return "fold";
    }
    if (handStrength > 10) {
        return "raise";
    }
    if (handStrength > 6) {
        return canCheck ? "check" : "call";
    }
    return "fold";
}
export function getBotEmote(action, personality) {
    if (action === "raise" && personality === "aggressive")
        return "😏";
    if (action === "raise" && personality === "trickster")
        return "🃏";
    if (action === "raise" && personality === "lucky")
        return "🍀";
    if (action === "raise" && personality === "timid")
        return "😳";
    if (action === "raise" && personality === "showoff")
        return "😎";
    if (action === "raise" && personality === "grumpy")
        return "😠";
    if (action === "raise" && personality === "zen")
        return "🧘";
    if (action === "raise" && personality === "rookie")
        return "😅";
    if (action === "fold" && personality === "conservative")
        return "😬";
    if (action === "fold" && personality === "timid")
        return "😢";
    if (action === "fold" && personality === "grumpy")
        return "🙄";
    if (action === "fold" && personality === "zen")
        return "🌱";
    if (action === "fold" && personality === "rookie")
        return "😔";
    if (action === "call" && personality === "lucky")
        return "🤞";
    if (action === "call" && personality === "trickster")
        return "🤡";
    if (action === "call" && personality === "zen")
        return "🧘";
    if (action === "call" && personality === "rookie")
        return "😬";
    if (action === "call")
        return "🤔";
    if (action === "bet" && personality === "lucky")
        return "🎲";
    if (action === "bet" && personality === "trickster")
        return "🤡";
    if (action === "bet" && personality === "showoff")
        return "💪";
    if (action === "bet" && personality === "zen")
        return "🌸";
    if (action === "bet" && personality === "rookie")
        return "😅";
    if (action === "bet")
        return "💰";
    return "";
}
export function getBotChat(action, personality) {
    if (action === "raise" && personality === "aggressive")
        return "Let's spice it up!";
    if (action === "raise" && personality === "trickster")
        return "You won't see this coming!";
    if (action === "raise" && personality === "lucky")
        return "Feeling lucky!";
    if (action === "raise" && personality === "timid")
        return "Uhh... okay, here goes!";
    if (action === "raise" && personality === "showoff")
        return "Watch and learn!";
    if (action === "raise" && personality === "grumpy")
        return "Fine, take this!";
    if (action === "raise" && personality === "zen")
        return "The river flows...";
    if (action === "raise" && personality === "rookie")
        return "Is this how you do it?";
    if (action === "fold" && personality === "conservative")
        return "Not this time...";
    if (action === "fold" && personality === "timid")
        return "I'm out...";
    if (action === "fold" && personality === "grumpy")
        return "Whatever...";
    if (action === "fold" && personality === "zen")
        return "Letting go is winning.";
    if (action === "fold" && personality === "rookie")
        return "Oops, maybe next time.";
    if (action === "call" && personality === "lucky")
        return "Maybe luck is on my side.";
    if (action === "call" && personality === "trickster")
        return "Let's see what happens!";
    if (action === "call" && personality === "zen")
        return "I accept the present moment.";
    if (action === "call" && personality === "rookie")
        return "I'll try!";
    if (action === "call")
        return "I'll see that.";
    if (action === "bet" && personality === "lucky")
        return "Big money, big money!";
    if (action === "bet" && personality === "trickster")
        return "Just for fun!";
    if (action === "bet" && personality === "showoff")
        return "Easy money!";
    if (action === "bet" && personality === "zen")
        return "Betting is like breathing.";
    if (action === "bet" && personality === "rookie")
        return "Here goes nothing!";
    if (action === "bet")
        return "Feeling lucky!";
    return "";
}
