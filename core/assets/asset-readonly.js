
import { AssetTransactions } from './asset-transactions.js';

export const AssetReadonly = {
    /**
     * Get User Balance (Safe Read)
     * @param {string} userId 
     * @param {string} assetType 
     * @returns {Promise<number>}
     */
    async getBalance(userId, assetType) {
        return await AssetTransactions.getBalance(userId, assetType);
    },

    /**
     * Get All Balances for User (Convenience)
     * @param {string} userId
     * @returns {Promise<object>} { codes: 0, bars_silver: 0, ... }
     */
    async getAllBalances(userId) {
        // This is inefficient (N queries), but safe for now. 
        // Can be optimized to single query in Transactions later.
        const codes = await this.getBalance(userId, 'codes');
        const silver = await this.getBalance(userId, 'bars_silver');
        const gold = await this.getBalance(userId, 'bars_gold');

        return {
            codes,
            bars_silver: silver,
            bars_gold: gold
        };
    }
};
