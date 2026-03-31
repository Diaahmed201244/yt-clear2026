import crypto from 'crypto';
import { query } from '../config/db.js';

// Secret seed for treasure generation (server-side only)
const TREASURE_SEED = process.env.YAHOOD_SEED || 'yahood-secret-2024';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

class YahoodAntiCheat {
    // Generate valid treasure locations deterministically
    static generateTreasureLocation(lat, lng) {
        const hash = crypto
            .createHash('sha256')
            .update(`${TREASURE_SEED}:${Math.floor(lat)}:${Math.floor(lng)}`)
            .digest('hex');
        
        // Use hash to determine if this grid cell has treasure
        const hasTreasure = parseInt(hash.substr(0, 8), 16) % 100 < 30; // 30% chance
        
        if (!hasTreasure) return null;
        
        // Determine treasure type and amount
        const typeCode = parseInt(hash.substr(8, 8), 16) % 100;
        let type, amount;
        
        if (typeCode < 60) {
            type = 'codes';
            amount = 10 + (parseInt(hash.substr(16, 8), 16) % 90);
        } else if (typeCode < 85) {
            type = 'silver';
            amount = 1 + (parseInt(hash.substr(16, 8), 16) % 5);
        } else {
            type = 'gold';
            amount = 1;
        }
        
        // Precise location within cell (100m variance)
        const preciseLat = lat + (parseInt(hash.substr(24, 8), 16) % 1000) / 10000 - 0.05;
        const preciseLng = lng + (parseInt(hash.substr(32, 8), 16) % 1000) / 10000 - 0.05;
        
        return {
            type,
            amount,
            lat: preciseLat,
            lng: preciseLng,
            valid: true
        };
    }
    
    // Validate client claim
    static async validateTreasureClaim(userId, claimedLat, claimedLng, claimedType, claimedAmount) {
        // Round to grid cell
        const gridLat = Math.round(claimedLat * 10) / 10;
        const gridLng = Math.round(claimedLng * 10) / 10;
        
        const validTreasure = this.generateTreasureLocation(gridLat, gridLng);
        
        if (!validTreasure) {
            return { valid: false, reason: 'No treasure at this location' };
        }
        
        // Check if already mined (prevent double-mining)
        const alreadyMinedResult = await query(`
            SELECT * FROM yahood_mined_treasures 
            WHERE grid_lat = $1 AND grid_lng = $2 AND mined_at > datetime('now', '-1 hour')
        `, [gridLat, gridLng]);
        
        if (alreadyMinedResult.rows.length > 0) {
            return { valid: false, reason: 'Treasure already mined recently' };
        }
        
        // Check distance (must be within 50m)
        const distance = calculateDistance(claimedLat, claimedLng, validTreasure.lat, validTreasure.lng);
        if (distance > 50) {
            return { valid: false, reason: 'Too far from treasure' };
        }
        
        // Validate type and amount match
        if (validTreasure.type !== claimedType || validTreasure.amount !== claimedAmount) {
            return { valid: false, reason: 'Treasure data mismatch' };
        }
        
        // Record mining
        await query(`
            INSERT INTO yahood_mined_treasures (user_id, grid_lat, grid_lng, type, amount, mined_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        `, [userId, gridLat, gridLng, claimedType, claimedAmount]);
        
        return { valid: true, treasure: validTreasure };
    }
    
    // Validate theft proximity
    static async validateTheftProximity(thiefId, victimId) {
        const thiefResult = await query('SELECT lat, lng FROM yahood_player_locations WHERE user_id = $1', [thiefId]);
        const victimResult = await query('SELECT lat, lng FROM yahood_player_locations WHERE user_id = $1', [victimId]);
        
        const thief = thiefResult.rows[0];
        const victim = victimResult.rows[0];
        
        if (!thief || !victim) return false;
        
        const distance = calculateDistance(thief.lat, thief.lng, victim.lat, victim.lng);
        return distance <= 10; // Must be within 10m
    }
    
    // Speed hack detection
    static async checkSpeedHack(userId, newLat, newLng) {
        const lastPosResult = await query(`
            SELECT lat, lng, updated_at 
            FROM yahood_player_locations 
            WHERE user_id = $1
        `, [userId]);
        
        const lastPos = lastPosResult.rows[0];
        
        if (!lastPos) return true; // First position
        
        const timeDiff = (Date.now() - new Date(lastPos.updated_at).getTime()) / 1000;
        const distance = calculateDistance(newLat, newLng, lastPos.lat, lastPos.lng);
        
        if (timeDiff === 0) return true;
        const speed = distance / timeDiff; // meters per second
        
        // Max walking speed: 5 m/s (18 km/h), running: 8 m/s
        if (speed > 10) {
            // Flag for review
            await query(`
                INSERT INTO yahood_cheat_logs (user_id, type, details, detected_at)
                VALUES ($1, 'speed_hack', $2, CURRENT_TIMESTAMP)
            `, [userId, JSON.stringify({ speed, distance, timeDiff })]);
            
            return false;
        }
        
        return true;
    }
}

export default YahoodAntiCheat;
export { calculateDistance };
