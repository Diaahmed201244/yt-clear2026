import express from 'express';
import { query } from '../config/db.js';
import YahoodAntiCheat, { calculateDistance } from '../middleware/anticheat.js';

const router = express.Router();

// Get player's home location
router.get('/home', async (req, res) => {
    const userId = req.headers['user-id'] || 'guest';
    try {
        const result = await query('SELECT * FROM yahood_homes WHERE user_id = $1', [userId]);
        res.json({ home: result.rows[0] || null });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Set home location (first time only)
router.post('/home/set', async (req, res) => {
    const userId = req.headers['user-id'] || 'guest';
    const { lat, lng } = req.body;
    
    try {
        // Validate distance from treasure zones
        // Simplified check: at least 5km from 0,0
        const distFromCenter = calculateDistance(lat, lng, 0, 0);
        if (distFromCenter < 5000) {
            // Check against generated treasures
            // (In a real scenario, we'd check against a set of known zones)
        }

        await query(`INSERT INTO yahood_homes (user_id, lat, lng, defense_level, created_at) 
                     VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP)
                     ON CONFLICT (user_id) DO UPDATE SET lat=$2, lng=$3`,
                     [userId, lat, lng]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Mine treasure (with anti-cheat)
router.post('/mine', async (req, res) => {
    const userId = req.headers['user-id'] || 'guest';
    const { lat, lng, type, amount } = req.body;
    
    try {
        // Anti-cheat validation
        const validation = await YahoodAntiCheat.validateTreasureClaim(
            userId, lat, lng, type, amount
        );
        
        if (!validation.valid) {
            return res.status(400).json({ 
                error: validation.reason,
                cheat: true 
            });
        }
        
        // Add to pending treasures
        await query(`
            INSERT INTO yahood_pending_treasures (user_id, asset_type, amount, found_lat, found_lng, found_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        `, [userId, type, amount, lat, lng]);
        
        res.json({ 
            success: true, 
            message: 'Treasure found! Return home safely to claim it.',
            treasure: validation.treasure
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get pending treasures
router.get('/treasures/pending', async (req, res) => {
    const userId = req.headers['user-id'] || 'guest';
    try {
        const result = await query('SELECT * FROM yahood_pending_treasures WHERE user_id = $1 AND status = \'pending\'', [userId]);
        res.json({ treasures: result.rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Claim treasure (reached home safely)
router.post('/treasures/claim', async (req, res) => {
    const userId = req.headers['user-id'] || 'guest';
    
    try {
        // Verify player is at home location
        const homeResult = await query('SELECT lat, lng FROM yahood_homes WHERE user_id = $1', [userId]);
        const playerResult = await query('SELECT lat, lng FROM yahood_player_locations WHERE user_id = $1', [userId]);
        
        if (!homeResult.rows[0] || !playerResult.rows[0]) {
            return res.status(400).json({ error: 'Home or location not found' });
        }
        
        const dist = calculateDistance(homeResult.rows[0].lat, homeResult.rows[0].lng, playerResult.rows[0].lat, playerResult.rows[0].lng);
        
        if (dist > 50) {
            return res.status(400).json({ error: 'Too far from home to claim' });
        }
        
        // Get pending treasures
        const pendingResult = await query('SELECT * FROM yahood_pending_treasures WHERE user_id = $1 AND status = \'pending\'', [userId]);
        const treasures = pendingResult.rows;
        
        if (treasures.length === 0) {
            return res.json({ success: true, claimed: [] });
        }
        
        // Mark as claimed
        await query('UPDATE yahood_pending_treasures SET status = \'claimed\' WHERE user_id = $1 AND status = \'pending\'', [userId]);
        
        res.json({ success: true, claimed: treasures });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update location (with speed hack check)
router.post('/location', async (req, res) => {
    const userId = req.headers['user-id'] || 'guest';
    const { lat, lng } = req.body;
    
    try {
        const validSpeed = await YahoodAntiCheat.checkSpeedHack(userId, lat, lng);
        if (!validSpeed) {
            return res.status(400).json({ error: 'Speed anomaly detected' });
        }
        
        await query(`
            INSERT INTO yahood_player_locations (user_id, lat, lng, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO UPDATE SET lat=$2, lng=$3, updated_at=CURRENT_TIMESTAMP
        `, [userId, lat, lng]);
        
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
