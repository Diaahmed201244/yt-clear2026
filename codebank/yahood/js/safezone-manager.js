class SafeZoneManager {
    constructor() {
        this.homeLocation = null;
        this.safeRadius = 100; // meters
        this.defenseLevel = 0;
        this.nearbyThreats = [];
    }
    
    async loadHome() {
        try {
            const response = await fetch('/api/yahood/home', {
                headers: { 'user-id': localStorage.getItem('user_id') || 'guest' }
            });
            const data = await response.json();
            
            if (data.home) {
                this.homeLocation = { lat: data.home.lat, lng: data.home.lng };
                this.defenseLevel = data.home.defense_level;
            }
            return this.homeLocation;
        } catch (e) {
            console.error('[SafeZone] Load home failed:', e);
            return null;
        }
    }
    
    async setHome(lat, lng) {
        try {
            const response = await fetch('/api/yahood/home/set', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': localStorage.getItem('user_id') || 'guest'
                },
                body: JSON.stringify({ lat, lng })
            });
            
            const data = await response.json();
            if (data.success) {
                this.homeLocation = { lat, lng };
                this.defenseLevel = 0;
            }
            return data;
        } catch (e) {
            console.error('[SafeZone] Set home failed:', e);
            return { success: false, error: e.message };
        }
    }
    
    isInSafeZone(lat, lng) {
        if (!this.homeLocation) return false;
        const distance = this.calculateDistance(lat, lng, this.homeLocation.lat, this.homeLocation.lng);
        return distance <= this.safeRadius;
    }
    
    isHomeReached(lat, lng) {
        if (!this.homeLocation) return false;
        const distance = this.calculateDistance(lat, lng, this.homeLocation.lat, this.homeLocation.lng);
        return distance <= 10; // 10m to trigger claim
    }
    
    async claimTreasures() {
        if (!this.homeLocation) {
            throw new Error('No home set');
        }
        
        try {
            const response = await fetch('/api/yahood/treasures/claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': localStorage.getItem('user_id') || 'guest'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Sync with ACC
                if (data.claimed && data.claimed.length > 0) {
                    for (const treasure of data.claimed) {
                        await window.YahoodBridge.addTreasure(
                            treasure.asset_type, 
                            treasure.amount, 
                            'Safe return home'
                        );
                    }
                }
                
                // Notify parent
                window.parent.postMessage({
                    type: 'safecode:sync',
                    force: true
                }, '*');
            }
            
            return data;
        } catch (e) {
            console.error('[SafeZone] Claim failed:', e);
            return { success: false, error: e.message };
        }
    }
    
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
}

window.SafeZoneManager = new SafeZoneManager();
