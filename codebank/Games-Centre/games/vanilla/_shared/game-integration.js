/**
 * Game Integration Utility
 * 
 * This module provides a simple API for games to integrate with the Games Centre dashboard.
 * Import this in your game and use the provided functions to report scores, handle game states, etc.
 * 
 * Usage in your game:
 * <script type="module">
 *   import { gameIntegration } from '../_shared/game-integration.js';
 *   
 *   // When game is ready
 *   gameIntegration.ready();
 *   
 *   // When game ends
 *   gameIntegration.gameOver({ score: 1000, won: true });
 * </script>
 */

class GameIntegration {
    constructor() {
        this.isInIframe = window.self !== window.top;
        this.gameSettings = {};

        // Listen for messages from parent (dashboard)
        if (this.isInIframe) {
            window.addEventListener('message', this._handleParentMessage.bind(this));
        }
    }

    /**
     * Notify the dashboard that the game is ready to start
     */
    ready() {
        this._postToParent({ type: 'READY' });
        console.log('[GameIntegration] Game ready');
    }

    /**
     * Notify the dashboard that the game has ended
     * @param {Object} result - Game result { score: number, won: boolean, rewardMultiplier: number }
     */
    gameOver(result) {
        this._postToParent({
            type: 'GAME_OVER',
            payload: result
        });
        console.log('[GameIntegration] Game over:', result);
    }

    /**
     * Send realtime score updates (optional)
     * @param {number} score - Current score
     */
    updateScore(score) {
        this._postToParent({
            type: 'SCORE_UPDATE',
            payload: { score }
        });
    }

    /**
     * Request to pause the game (if supported)
     */
    onPauseRequest(callback) {
        this._pauseCallback = callback;
    }

    /**
     * Request to resume the game (if supported)
     */
    onResumeRequest(callback) {
        this._resumeCallback = callback;
    }

    /**
     * Handle messages from parent dashboard
     */
    _handleParentMessage(event) {
        const { type, settings } = event.data;

        switch (type) {
            case 'GAME_START':
                this.gameSettings = settings || {};
                console.log('[GameIntegration] Game start with settings:', this.gameSettings);
                break;
            case 'PAUSE':
                if (this._pauseCallback) {
                    this._pauseCallback();
                }
                break;
            case 'RESUME':
                if (this._resumeCallback) {
                    this._resumeCallback();
                }
                break;
        }
    }

    /**
     * Post message to parent window
     */
    _postToParent(msg) {
        if (this.isInIframe && window.parent) {
            window.parent.postMessage(msg, '*');
            window.parent.postMessage(msg, window.location.origin);
        }
    }

    /**
     * Get betting amount (if applicable)
     */
    getBetAmount() {
        return this.gameSettings.bet || 0;
    }

    /**
     * Check if game is in iframe
     */
    isEmbedded() {
        return this.isInIframe;
    }
}

// Export singleton instance
export const gameIntegration = new GameIntegration();

// Also make it available globally for non-module scripts
if (typeof window !== 'undefined') {
    window.gameIntegration = gameIntegration;
}
