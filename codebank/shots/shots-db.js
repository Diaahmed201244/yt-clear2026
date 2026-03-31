// ShotsDB - IndexedDB utility for storing screenshots
class ShotsDB {
    constructor() {
        this.dbName = 'ShotsDB';
        this.version = 1;
        this.storeName = 'shotsStore';
        this.db = null;
    }

    // Initialize the database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // Save a screenshot
        if (!this.db) await this.init();

        const id = crypto.randomUUID();
        const timestamp = Date.now();

        const screenshot = {
            id,
            timestamp,
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(screenshot);

            request.onsuccess = () => resolve(screenshot);
            request.onerror = () => reject(request.error);
        });
    }

    // Get all screenshots
    async getAllScreenshots() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort by timestamp descending (most recent first)
                const screenshots = request.result.sort((a, b) => b.timestamp - a.timestamp);
                resolve(screenshots);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Delete a screenshot by ID
    async deleteScreenshot(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Delete expired screenshots (older than 30 days)
    async deleteExpiredScreenshots() {
        if (!this.db) await this.init();

        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');

            const range = IDBKeyRange.upperBound(thirtyDaysAgo);
            const request = index.openCursor(range);

            const deletedIds = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    deletedIds.push(cursor.value.id);
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve(deletedIds);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Get a small base64 preview (first 1000 characters)
    getPreview(dataUrl) {
        return dataUrl.substring(0, 1000) + '...';
    }
}

// Export singleton instance
const shotsDB = new ShotsDB();

// Make it available globally for the Shots! tab
window.shotsDB = shotsDB;

// Also export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = shotsDB;
}
if (typeof exports !== 'undefined') {
    exports.default = shotsDB;
}