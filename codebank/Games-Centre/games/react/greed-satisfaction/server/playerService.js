import { db } from './db';
import { players } from '@shared/schema';
import { eq } from 'drizzle-orm';
export class PlayerService {
    async getOrCreatePlayer(playerId) {
        const [existingPlayer] = await db
            .select()
            .from(players)
            .where(eq(players.playerId, playerId));
        if (existingPlayer) {
            return existingPlayer;
        }
        const [newPlayer] = await db
            .insert(players)
            .values({
            playerId,
            totalCodes: 1000,
            lastPlayDate: null,
        })
            .returning();
        return newPlayer;
    }
    async canPlayToday(playerId) {
        const player = await this.getOrCreatePlayer(playerId);
        if (!player.lastPlayDate) {
            return true;
        }
        const lastPlayDate = new Date(player.lastPlayDate);
        const today = new Date();
        lastPlayDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return lastPlayDate.getTime() !== today.getTime();
    }
    async recordPlay(playerId) {
        await db
            .update(players)
            .set({
            lastPlayDate: new Date(),
            updatedAt: new Date(),
        })
            .where(eq(players.playerId, playerId));
    }
    async updatePlayerCodes(playerId, totalCodes) {
        await db
            .update(players)
            .set({
            totalCodes,
            updatedAt: new Date(),
        })
            .where(eq(players.playerId, playerId));
    }
    async getTimeUntilNextPlay(playerId) {
        const player = await this.getOrCreatePlayer(playerId);
        if (!player.lastPlayDate) {
            return "You can play now!";
        }
        const lastPlayDate = new Date(player.lastPlayDate);
        const tomorrow = new Date(lastPlayDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const now = new Date();
        const timeDiff = tomorrow.getTime() - now.getTime();
        if (timeDiff <= 0) {
            return "You can play now!";
        }
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
            return `${hours}h ${minutes}m until next play`;
        }
        else {
            return `${minutes}m until next play`;
        }
    }
}
export const playerService = new PlayerService();
