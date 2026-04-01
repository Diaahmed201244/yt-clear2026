// Rewards System - Handles CodeBank Integration and PostMessage
class RewardsSystem {
    constructor(game) {
        this.game = game;
        this.rewardsHistory = [];
        this.totalEarned = 0;
        
        this.init();
    }

    init() {
        this.setupPostMessageListener();
        this.setupParentMessageHandler();
    }

    setupPostMessageListener() {
        // Listen for messages from parent (CodeBank)
        window.addEventListener('message', (event) => {
            // Security check: Only accept messages from expected origin
            // In production, you might want to check event.origin
            if (event.data && event.data.type) {
                this.handleParentMessage(event.data);
            }
        });
    }

    setupParentMessageHandler() {
        // Handle different message types from parent
        this.messageHandlers = {
            'codebank:game_start': this.handleGameStart.bind(this),
            'codebank:game_pause': this.handleGamePause.bind(this),
            'codebank:game_resume': this.handleGameResume.bind(this),
            'codebank:game_reset': this.handleGameReset.bind(this),
            'codebank:check_balance': this.handleCheckBalance.bind(this),
            'codebank:sync_progress': this.handleSyncProgress.bind(this)
        };
    }

    handleParentMessage(data) {
        const handler = this.messageHandlers[data.type];
        if (handler) {
            handler(data);
        } else {
            console.log('Unknown message type:', data.type);
        }
    }

    handleGameStart(data) {
        console.log('Game start requested by parent');
        if (this.game && this.game.startGame) {
            this.game.startGame();
        }
    }

    handleGamePause(data) {
        console.log('Game pause requested by parent');
        if (this.game && this.game.pauseGame) {
            this.game.pauseGame();
        }
    }

    handleGameResume(data) {
        console.log('Game resume requested by parent');
        if (this.game && this.game.resumeGame) {
            this.game.resumeGame();
        }
    }

    handleGameReset(data) {
        console.log('Game reset requested by parent');
        this.resetGame();
    }

    handleCheckBalance(data) {
        console.log('Balance check requested by parent');
        this.sendBalanceUpdate();
    }

    handleSyncProgress(data) {
        console.log('Progress sync requested by parent');
        this.syncProgress();
    }

    // Reward Distribution Methods
    sendReward(amount, finalWin = false) {
        const rewardData = {
            type: 'millcode:reward',
            amount: amount,
            finalWin: finalWin,
            timestamp: Date.now(),
            level: this.game.state.level,
            questionIndex: this.game.state.questionIndex,
            totalScore: this.totalEarned + amount
        };

        // Send to parent (CodeBank)
        window.parent.postMessage(rewardData, '*');
        
        // Log reward
        this.logReward(rewardData);
        
        // Update local tracking
        this.totalEarned += amount;
        
        // Show reward notification
        this.showRewardNotification(amount, finalWin);
        
        console.log('Reward sent to parent:', rewardData);
    }

    logReward(rewardData) {
        this.rewardsHistory.push(rewardData);
        
        // Keep only last 50 rewards to prevent memory issues
        if (this.rewardsHistory.length > 50) {
            this.rewardsHistory = this.rewardsHistory.slice(-50);
        }
        
        // Save to localStorage for persistence
        this.saveToStorage();
    }

    showRewardNotification(amount, finalWin) {
        const notification = document.createElement('div');
        notification.className = 'reward-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${finalWin ? '🏆' : '💰'}</div>
                <div class="notification-text">
                    <div class="notification-title">${finalWin ? 'مليون!' : 'مكافأة'}</div>
                    <div class="notification-amount">+${amount.toLocaleString()} كود</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }

    // Progress and Statistics
    getGameStats() {
        const stats = {
            totalQuestions: this.game.state.questionIndex,
            correctAnswers: this.game.state.answers.filter(a => a.isCorrect).length,
            accuracy: 0,
            avgResponseTime: 0,
            totalEarned: this.totalEarned,
            rewardsHistory: this.rewardsHistory.slice(-10), // Last 10 rewards
            suspicionLevel: this.calculateSuspicionLevel()
        };

        if (stats.totalQuestions > 0) {
            stats.accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
            stats.avgResponseTime = Math.round(
                this.game.state.answers.reduce((sum, a) => sum + a.time, 0) / stats.totalQuestions
            );
        }

        return stats;
    }

    calculateSuspicionLevel() {
        const metrics = this.game.state.suspicionMetrics;
        let suspicionScore = 0;

        // Calculate suspicion score
        suspicionScore += metrics.blurCount * 10;
        suspicionScore += metrics.copyPasteEvents * 5;
        suspicionScore += metrics.rightClickCount;
        suspicionScore += metrics.tabSwitches * 15;

        // Check for perfect accuracy on hard questions
        const hardQuestions = this.game.state.answers.filter(a => 
            this.game.state.currentQuestion && this.game.state.currentQuestion.difficulty === 'hard'
        );
        if (hardQuestions.length > 0) {
            const hardAccuracy = hardQuestions.filter(a => a.isCorrect).length / hardQuestions.length;
            if (hardAccuracy === 1) {
                suspicionScore += 20;
            }
        }

        // Normalize to 0-100 scale
        suspicionScore = Math.min(suspicionScore, 100);

        return {
            score: suspicionScore,
            level: suspicionScore > 70 ? 'high' : suspicionScore > 30 ? 'medium' : 'low',
            flags: this.getSuspicionFlags()
        };
    }

    getSuspicionFlags() {
        const flags = [];
        const metrics = this.game.state.suspicionMetrics;

        if (metrics.blurCount > 2) flags.push('excessive_tab_switching');
        if (metrics.copyPasteEvents > 3) flags.push('copy_paste_detected');
        if (metrics.rightClickCount > 5) flags.push('excessive_right_clicks');
        if (metrics.tabSwitches > 2) flags.push('tab_visibility_changes');

        return flags;
    }

    // Communication with Parent
    sendBalanceUpdate() {
        const stats = this.getGameStats();
        window.parent.postMessage({
            type: 'millcode:balance_update',
            balance: this.totalEarned,
            stats: stats
        }, '*');
    }

    syncProgress() {
        const progress = {
            level: this.game.state.level,
            score: this.game.state.score,
            totalEarned: this.totalEarned,
            answers: this.game.state.answers,
            suspicionMetrics: this.game.state.suspicionMetrics,
            rewardsHistory: this.rewardsHistory
        };

        window.parent.postMessage({
            type: 'millcode:progress_sync',
            progress: progress
        }, '*');
    }

    // Game Management
    resetGame() {
        this.totalEarned = 0;
        this.rewardsHistory = [];
        this.saveToStorage();
        
        if (this.game && this.game.startGame) {
            this.game.startGame();
        }
    }

    // Storage Management
    saveToStorage() {
        try { 
            const data = {
                totalEarned: this.totalEarned,
                rewardsHistory: this.rewardsHistory,
                lastSync: Date.now()
            };
            
            localStorage.setItem('millcode_rewards', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save rewards to localStorage:', error);
        }
    }

    loadFromStorage() {
        try { 
            const data = localStorage.getItem('millcode_rewards');
            if (data) {
                const parsed = JSON.parse(data);
                this.totalEarned = parsed.totalEarned || 0;
                this.rewardsHistory = parsed.rewardsHistory || [];
                return true;
            }
        } catch (error) {
            console.warn('Failed to load rewards from localStorage:', error);
        }
        return false;
    }

    // Anti-Cheat Integration
    validateReward(amount, finalWin) {
        // Check if reward should be modified due to suspicious activity
        const suspicion = this.calculateSuspicionLevel();
        
        if (suspicion.score > 80) {
            // High suspicion - reduce reward
            const reducedAmount = Math.floor(amount * 0.5);
            console.warn('High suspicion detected, reducing reward:', amount, '->', reducedAmount);
            return reducedAmount;
        } else if (suspicion.score > 50) {
            // Medium suspicion - small reduction
            const reducedAmount = Math.floor(amount * 0.8);
            console.warn('Medium suspicion detected, slight reward reduction:', amount, '->', reducedAmount);
            return reducedAmount;
        }
        
        return amount;
    }

    // Speed-based scoring integration
    calculateSpeedBonus(baseAmount, responseTime) {
        const seconds = responseTime / 1000;
        
        if (seconds <= 3) {
            return Math.floor(baseAmount * 3); // 3x bonus for lightning fast
        } else if (seconds <= 6) {
            return Math.floor(baseAmount * 2); // 2x bonus for fast
        } else if (seconds <= 10) {
            return baseAmount; // Normal reward
        } else {
            return Math.floor(baseAmount * 0.5); // Penalty for slow
        }
    }

    // Achievement System
    checkAchievements() {
        const achievements = [];
        const stats = this.getGameStats();

        // Speed demon achievement
        if (stats.avgResponseTime < 3000) {
            achievements.push({
                id: 'speed_demon',
                name: 'سريع كالبرق',
                description: 'متوسط وقت الإجابة أقل من 3 ثوانٍ',
                reward: 5000
            });
        }

        // Perfect run achievement
        if (stats.accuracy === 100 && stats.totalQuestions >= 10) {
            achievements.push({
                id: 'perfect_run',
                name: 'مثالي',
                description: 'إجابات صحيحة بنسبة 100% في 10 أسئلة أو أكثر',
                reward: 10000
            });
        }

        // Millionaire achievement
        if (stats.totalEarned >= 1000000) {
            achievements.push({
                id: 'millionaire',
                name: 'مليونير',
                description: 'ربح مليون كود أو أكثر',
                reward: 50000
            });
        }

        return achievements;
    }

    // Export/Import for backup
    exportData() {
        return {
            version: '1.0',
            timestamp: Date.now(),
            totalEarned: this.totalEarned,
            rewardsHistory: this.rewardsHistory,
            stats: this.getGameStats()
        };
    }

    importData(data) {
        if (data && data.totalEarned !== undefined) {
            this.totalEarned = data.totalEarned;
            this.rewardsHistory = data.rewardsHistory || [];
            this.saveToStorage();
            return true;
        }
        return false;
    }
}

// Add CSS for reward notifications
const rewardStyles = `
.reward-notification {
    position: fixed;
    top: 20px;
    left: 20px;
    background: linear-gradient(135deg, #1e293b, #334155);
    border: 2px solid var(--gold-color);
    border-radius: 15px;
    padding: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    z-index: 4000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    min-width: 250px;
}

.reward-notification.show {
    transform: translateX(0);
}

.reward-notification.hide {
    transform: translateX(-100%);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 15px;
}

.notification-icon {
    font-size: 2rem;
    animation: bounce 0.5s ease-in-out;
}

.notification-text {
    text-align: right;
}

.notification-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--gold-color);
    margin-bottom: 5px;
}

.notification-amount {
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--text-color);
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}

/* Speed rating indicator styles */
.speed-indicator {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-right: 10px;
}

.speed-indicator.fast {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border: 1px solid #22c55e;
}

.speed-indicator.medium {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
    border: 1px solid #f59e0b;
}

.speed-indicator.slow {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid #ef4444;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = rewardStyles;
    document.head.appendChild(style);
}

// Export for use in game engine
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RewardsSystem;
}