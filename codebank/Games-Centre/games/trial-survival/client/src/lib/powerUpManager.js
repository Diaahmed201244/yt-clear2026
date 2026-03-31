"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.powerUpManager = exports.SPECIAL_CHALLENGES = exports.GAME_MODES = exports.ACHIEVEMENTS = exports.POWER_UPS = void 0;
exports.POWER_UPS = [
    {
        id: 'shield',
        name: 'Guardian Shield',
        description: 'Protects you from one elimination in the next game',
        cost: 150,
        type: 'active',
        rarity: 'rare',
        icon: '🛡️',
        effects: [{ type: 'second_chance', value: 1 }]
    },
    {
        id: 'speed_boost',
        name: 'Lightning Reflexes',
        description: 'Increases movement speed by 50% for 30 seconds',
        cost: 75,
        duration: 30,
        type: 'active',
        rarity: 'common',
        icon: '⚡',
        effects: [{ type: 'speed_boost', value: 1.5 }]
    },
    {
        id: 'time_master',
        name: 'Time Dilation',
        description: 'Extends game timer by 15 seconds',
        cost: 100,
        type: 'active',
        rarity: 'common',
        icon: '⏰',
        effects: [{ type: 'time_extension', value: 15 }]
    },
    {
        id: 'precision_aid',
        name: 'Steady Hands',
        description: 'Increases precision tolerance for tracing games',
        cost: 125,
        duration: 60,
        type: 'active',
        rarity: 'rare',
        icon: '🎯',
        effects: [{ type: 'precision_aid', value: 2 }]
    },
    {
        id: 'lucky_charm',
        name: 'Fortune\'s Favor',
        description: 'Increases luck-based success rate by 25%',
        cost: 200,
        type: 'passive',
        rarity: 'epic',
        icon: '🍀',
        effects: [{ type: 'luck_boost', value: 1.25 }]
    },
    {
        id: 'token_multiplier',
        name: 'Golden Touch',
        description: 'Doubles token rewards for the next 3 games',
        cost: 300,
        type: 'active',
        rarity: 'legendary',
        icon: '💰',
        effects: [{ type: 'token_multiplier', value: 2 }]
    }
];
exports.ACHIEVEMENTS = [
    {
        id: 'first_survivor',
        name: 'First Survivor',
        description: 'Complete your first trial',
        icon: '🏆',
        requirement: { type: 'complete_stages', value: 1 },
        reward: { tokens: 50 }
    },
    {
        id: 'trial_master',
        name: 'Trial Master',
        description: 'Complete all 5 trials',
        icon: '👑',
        requirement: { type: 'complete_stages', value: 5 },
        reward: { tokens: 500, powerUps: ['shield'] }
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete Red Light Green Light in under 15 seconds',
        icon: '🏃',
        requirement: { type: 'survive_time', value: 15, stageSpecific: 1 },
        reward: { tokens: 100, powerUps: ['speed_boost'] }
    },
    {
        id: 'precision_master',
        name: 'Precision Master',
        description: 'Complete Honeycomb Carve without any cracks',
        icon: '✨',
        requirement: { type: 'perfect_runs', value: 1, stageSpecific: 2 },
        reward: { tokens: 150, powerUps: ['precision_aid'] }
    },
    {
        id: 'token_collector',
        name: 'Token Collector',
        description: 'Accumulate 1000 tokens',
        icon: '💎',
        requirement: { type: 'tokens_earned', value: 1000 },
        reward: { tokens: 200, powerUps: ['token_multiplier'] }
    },
    {
        id: 'consecutive_champion',
        name: 'Consecutive Champion',
        description: 'Win 5 games in a row',
        icon: '🔥',
        requirement: { type: 'consecutive_wins', value: 5 },
        reward: { tokens: 300, powerUps: ['lucky_charm'] }
    }
];
exports.GAME_MODES = [
    {
        id: 'normal',
        name: 'Normal Mode',
        description: 'Standard Squid Game experience',
        difficulty: 1,
        tokenMultiplier: 1,
        specialRules: []
    },
    {
        id: 'hardcore',
        name: 'Hardcore Mode',
        description: 'Faster elimination rates, shorter timers',
        difficulty: 3,
        tokenMultiplier: 2,
        specialRules: [
            'Timer reduced by 50%',
            'Elimination rates increased by 25%',
            'No second chances'
        ],
        unlockRequirement: 'Complete all trials once'
    },
    {
        id: 'blitz',
        name: 'Blitz Mode',
        description: 'Complete all trials in rapid succession',
        difficulty: 2,
        tokenMultiplier: 1.5,
        specialRules: [
            'All trials must be completed in 10 minutes',
            'No breaks between stages',
            'Bonus tokens for speed'
        ],
        unlockRequirement: 'Complete 3 trials in normal mode'
    },
    {
        id: 'survival',
        name: 'Endless Survival',
        description: 'Survive as many rounds as possible',
        difficulty: 2,
        tokenMultiplier: 1.25,
        specialRules: [
            'Trials repeat with increasing difficulty',
            'Tokens earned per round survived',
            'Power-ups spawn randomly'
        ],
        unlockRequirement: 'Complete all trials twice'
    }
];
exports.SPECIAL_CHALLENGES = [
    {
        id: 'daily_survival',
        name: 'Daily Survival Challenge',
        description: 'Survive 3 consecutive trials without using power-ups',
        timeLimit: 24 * 60 * 60, // 24 hours
        reward: 250,
        type: 'survival',
        isActive: true
    },
    {
        id: 'speed_run',
        name: 'Speed Run Challenge',
        description: 'Complete Red Light Green Light in under 10 seconds',
        timeLimit: 60 * 60, // 1 hour
        reward: 150,
        type: 'speed',
        isActive: true
    },
    {
        id: 'precision_master',
        name: 'Perfect Precision',
        description: 'Complete Honeycomb Carve with zero tolerance errors',
        timeLimit: 2 * 60 * 60, // 2 hours
        reward: 200,
        type: 'precision',
        isActive: true
    }
];
class PowerUpManager {
    constructor() {
        this.activePowerUps = new Map();
        this.playerAchievements = new Set();
    }
    activatePowerUp(powerUpId) {
        const powerUp = exports.POWER_UPS.find(p => p.id === powerUpId);
        if (!powerUp)
            return false;
        const expiresAt = powerUp.duration ? Date.now() + (powerUp.duration * 1000) : undefined;
        this.activePowerUps.set(powerUpId, { powerUp, expiresAt });
        return true;
    }
    isActive(powerUpId) {
        const active = this.activePowerUps.get(powerUpId);
        if (!active)
            return false;
        if (active.expiresAt && Date.now() > active.expiresAt) {
            this.activePowerUps.delete(powerUpId);
            return false;
        }
        return true;
    }
    getActiveEffects() {
        const effects = [];
        for (const [id, { powerUp, expiresAt }] of this.activePowerUps) {
            if (expiresAt && Date.now() > expiresAt) {
                this.activePowerUps.delete(id);
                continue;
            }
            effects.push(...powerUp.effects);
        }
        return effects;
    }
    checkAchievements(stats) {
        var _a, _b;
        const newAchievements = [];
        for (const achievement of exports.ACHIEVEMENTS) {
            if (this.playerAchievements.has(achievement.id))
                continue;
            let earned = false;
            const req = achievement.requirement;
            switch (req.type) {
                case 'complete_stages':
                    earned = stats.trialsCompleted >= req.value;
                    break;
                case 'tokens_earned':
                    earned = stats.tokens >= req.value;
                    break;
                case 'consecutive_wins':
                    earned = stats.consecutiveWins >= req.value;
                    break;
                case 'survive_time':
                    if (req.stageSpecific && ((_a = stats.stageSpecific) === null || _a === void 0 ? void 0 : _a.stage) === req.stageSpecific) {
                        earned = stats.stageSpecific.time <= req.value;
                    }
                    break;
                case 'perfect_runs':
                    if (req.stageSpecific && ((_b = stats.stageSpecific) === null || _b === void 0 ? void 0 : _b.stage) === req.stageSpecific) {
                        earned = stats.stageSpecific.perfect;
                    }
                    break;
            }
            if (earned) {
                this.playerAchievements.add(achievement.id);
                newAchievements.push(achievement);
            }
        }
        return newAchievements;
    }
    getAvailablePowerUps() {
        return exports.POWER_UPS;
    }
    getGameModes() {
        return exports.GAME_MODES;
    }
    getSpecialChallenges() {
        return exports.SPECIAL_CHALLENGES.filter(c => c.isActive);
    }
}
exports.powerUpManager = new PowerUpManager();
