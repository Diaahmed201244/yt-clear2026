// ALLOWED SCOPE:
// - services/codebank/shots/*
// - services/codebank/shots/shots-integration.js
// - services/codebank/shots/shots-db.js
//
// FORBIDDEN: any e7ki or community files, chat.js, auth or supabase files.
// Any changes outside allowed paths = CRITICAL VIOLATION.

// Shots! Tab JavaScript
class ShotsTab {
    constructor() {
        this.db = null;
        this.currentScreenshot = null;
        this.init();
    }

    async init() {
        try {
            console.log('🎬 Initializing Shots! tab...');
            
            // Initialize database
            await this.initDatabase();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load screenshots
            await this.loadScreenshots();
            
            // Clean up expired screenshots
            await this.cleanupExpiredScreenshots();
            
            console.log('✅ Shots! tab initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Shots! tab:', error);
            this.showError('Failed to initialize Shots! tab');
        }
    }

    getScreenshotTargetElement() {
        // Try to find the most appropriate target for screenshot
        const selectors = [
            // Main content areas
            '#main-content',
            '.main-content', 
            '#content',
            '.content',
            
            // Video/media containers
            '#video-container',
            '.video-container',
            '#player-container', 
            '.player-container',
            
            // App-specific containers
            '#app',
            '.app',
            '#codebank-app',
            '.codebank-app',
            
            // Current tab content
            '#current-tab-content',
            '.tab-content'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && this.isValidScreenshotTarget(element)) {
                return element;
            }
        }

        // Fallback: use body but filter out unwanted elements
        return document.body;
    }

    isValidScreenshotTarget(element) {
        // Ensure the element is visible and has content
        const rect = element.getBoundingClientRect();
        return (
            rect.width > 0 && 
            rect.height > 0 && 
            element.offsetParent !== null &&
            window.getComputedStyle(element).display !== 'none' &&
            window.getComputedStyle(element).visibility !== 'hidden'
        );
    }

    async initDatabase() {
        if (!window.shotsDB) {
            await new Promise((resolve)=>{ const s=document.createElement('script'); s.src='shots-db.js'; s.onload=resolve; s.onerror=resolve; document.head.appendChild(s); });
            if (!window.shotsDB) {
                await new Promise((resolve)=>{ const s=document.createElement('script'); s.src='/services/yt-clear/codebank/shots/shots-db.js'; s.onload=resolve; s.onerror=resolve; document.head.appendChild(s); });
            }
        }
        if (!window.shotsDB) { throw new Error('ShotsDB not found'); }
        this.db = window.shotsDB;
        await this.db.init();
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refresh-shots')?.addEventListener('click', () => {
            this.loadScreenshots();
        });

        // Clear all button
        document.getElementById('clear-all-shots')?.addEventListener('click', () => {
            this.showConfirmDialog(
                'Clear All Shots',
                'Are you sure you want to delete all screenshots? This action cannot be undone.',
                () => this.clearAllScreenshots()
            );
        });

        // Export button
        document.getElementById('export-shots')?.addEventListener('click', () => {
            this.exportScreenshots();
        });

        // Modal close
        document.getElementById('viewer-close')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Download shot
        document.getElementById('download-shot')?.addEventListener('click', () => {
            this.downloadCurrentShot();
        });

        // Delete shot
        document.getElementById('delete-shot')?.addEventListener('click', () => {
            this.deleteCurrentShot();
        });

        // Share shot
        document.getElementById('share-shot')?.addEventListener('click', () => {
            this.shareCurrentShot();
        });

        // Refresh gallery when new screenshots are added from other pages
        window.addEventListener('shots-updated', () => {
            this.loadScreenshots();
        });

        // Modal overlay click to close
        document.getElementById('viewer-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'viewer-modal') {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Confirmation dialog buttons
        document.getElementById('confirm-cancel')?.addEventListener('click', () => {
            this.hideConfirmDialog();
        });

        document.getElementById('confirm-ok')?.addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
            }
            this.hideConfirmDialog();
        });
    }

    async loadScreenshots() {
        this.showLoading(true);
        
        try {
            const screenshots = await this.db.getAllScreenshots();
            this.renderScreenshots(screenshots);
            this.updateStats(screenshots);
        } catch (error) {
            console.error('Failed to load screenshots:', error);
            this.showError('Failed to load screenshots');
        } finally {
            this.showLoading(false);
        }
    }

    renderScreenshots(screenshots) {
        const gallery = document.getElementById('shots-gallery');
        const emptyState = document.getElementById('empty-state');
        
        if (!gallery) return;

        if (screenshots.length === 0) {
            // Show empty state
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            gallery.innerHTML = '';
            if (emptyState) {
                gallery.appendChild(emptyState);
            }
            return;
        }

        // Hide empty state
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        // Create grid container
        const grid = document.createElement('div');
        grid.className = 'screenshots-grid';

        screenshots.forEach(screenshot => {
            const card = this.createScreenshotCard(screenshot);
            grid.appendChild(card);
        });

        // Clear and add grid
        gallery.innerHTML = '';
        gallery.appendChild(grid);
    }

    createScreenshotCard(screenshot) {
        const card = document.createElement('div');
        card.className = 'screenshot-card';
<<<<<<< HEAD
        
        const date = new Date(screenshot.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        const sizeStr = this.formatFileSize(screenshot.dataUrl.length);

        card.innerHTML = `
            <img src="${screenshot.dataUrl}" alt="Screenshot" class="screenshot-image" loading="lazy">
            <div class="screenshot-info">
                <span class="screenshot-date">${dateStr}</span>
=======
        card.setAttribute('data-id', screenshot.id);
        
        const date = new Date(screenshot.timestamp).toLocaleString();
        const sizeStr = this.formatFileSize(screenshot.dataUrl.length);
        const method = screenshot.method || 'web';
        const methodLabel = method === 'youtube-composite' ? 'YouTube Capture' : 
                          method === 'native' ? 'Native Capture' : 
                          method === 'standard' ? 'Standard Capture' : 'Web Capture';

        card.innerHTML = `
            <img src="${screenshot.dataUrl}" alt="Shot at ${date}" class="screenshot-image" loading="lazy">
            <div class="screenshot-info">
                <span class="screenshot-date">${date}</span>
                <span class="capture-badge ${method}">${methodLabel}</span>
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
                <span class="screenshot-size">${sizeStr}</span>
            </div>
            <div class="screenshot-actions">
                <button class="action-btn view" onclick="shotsTab.openModal('${screenshot.id}')">
<<<<<<< HEAD
                    👁️ View
                </button>
                <button class="action-btn download" onclick="shotsTab.downloadShot('${screenshot.id}')">
                    💾 Download
                </button>
                <button class="action-btn delete" onclick="shotsTab.deleteShot('${screenshot.id}')">
                    🗑️ Delete
=======
                    <span class="icon">👁️</span> View
                </button>
                <button class="action-btn download" onclick="shotsTab.downloadShot('${screenshot.id}')">
                    <span class="icon">💾</span> Save
                </button>
                <button class="action-btn delete" onclick="shotsTab.deleteShot('${screenshot.id}')">
                    <span class="icon">🗑️</span> Delete
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
                </button>
            </div>
        `;

        // Add click handler for the image
        const img = card.querySelector('.screenshot-image');
        img.addEventListener('click', () => {
            this.openModal(screenshot.id);
        });

        return card;
    }

    async openModal(screenshotId) {
        try {
            const screenshots = await this.db.getAllScreenshots();
            const screenshot = screenshots.find(s => s.id === screenshotId);
            
            if (!screenshot) {
                this.showError('Screenshot not found');
                return;
            }

            this.currentScreenshot = screenshot;
            
            const modal = document.getElementById('viewer-modal');
            const img = document.getElementById('viewer-image');
            const title = document.getElementById('viewer-title');
            const timestamp = document.getElementById('shot-timestamp');
            const size = document.getElementById('shot-size');

            if (modal && img && title && timestamp && size) {
                img.src = screenshot.dataUrl;
                img.alt = 'Screenshot from ' + new Date(screenshot.timestamp).toLocaleString();
                title.textContent = 'Screenshot';
                timestamp.textContent = new Date(screenshot.timestamp).toLocaleString();
                size.textContent = this.formatFileSize(screenshot.dataUrl.length);
                
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            console.error('Failed to open modal:', error);
            this.showError('Failed to open screenshot viewer');
        }
    }

    closeModal() {
        const modal = document.getElementById('viewer-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        this.currentScreenshot = null;
    }

    async deleteShot(screenshotId) {
        this.showConfirmDialog(
            'Delete Screenshot',
            'Are you sure you want to delete this screenshot?',
            async () => {
                try {
                    await this.db.deleteScreenshot(screenshotId);
                    await this.loadScreenshots();
                    this.closeModal();
                    this.showSuccess('Screenshot deleted successfully');
                } catch (error) {
                    console.error('Failed to delete screenshot:', error);
                    this.showError('Failed to delete screenshot');
                }
            }
        );
    }

    async deleteCurrentShot() {
        if (this.currentScreenshot) {
            await this.deleteShot(this.currentScreenshot.id);
        }
    }

    async downloadShot(screenshotId) {
        try {
            const screenshots = await this.db.getAllScreenshots();
            const screenshot = screenshots.find(s => s.id === screenshotId);
            
            if (!screenshot) {
                this.showError('Screenshot not found');
                return;
            }

            const link = document.createElement('a');
            link.href = screenshot.dataUrl;
            link.download = `screenshot-${new Date(screenshot.timestamp).toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('Screenshot downloaded');
        } catch (error) {
            console.error('Failed to download screenshot:', error);
            this.showError('Failed to download screenshot');
        }
    }

    downloadCurrentShot() {
        if (this.currentScreenshot) {
            this.downloadShot(this.currentScreenshot.id);
        }
    }

    async shareCurrentShot() {
        if (!this.currentScreenshot) return;

        try {
            if (navigator.share) {
                // Convert data URL to blob for sharing
                const response = await fetch(this.currentScreenshot.dataUrl);
                const blob = await response.blob();
                const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
                
                await navigator.share({
                    title: 'Screenshot',
                    text: 'Check out this screenshot!',
                    files: [file]
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(this.currentScreenshot.dataUrl);
                this.showSuccess('Screenshot URL copied to clipboard');
            }
        } catch (error) {
            console.error('Failed to share screenshot:', error);
            this.showError('Failed to share screenshot');
        }
    }

    async clearAllScreenshots() {
        try {
            const screenshots = await this.db.getAllScreenshots();
            
            for (const screenshot of screenshots) {
                await this.db.deleteScreenshot(screenshot.id);
            }
            
            await this.loadScreenshots();
            this.showSuccess('All screenshots cleared');
        } catch (error) {
            console.error('Failed to clear screenshots:', error);
            this.showError('Failed to clear screenshots');
        }
    }

    async exportScreenshots() {
        try {
            const screenshots = await this.db.getAllScreenshots();
            
            if (screenshots.length === 0) {
                this.showError('No screenshots to export');
                return;
            }

            // Create a simple HTML file with all screenshots
            let html = '<html><head><title>Shots! Export</title></head><body>';
            html += '<h1>Shots! Gallery Export</h1>';
            html += `<p>Exported on: ${new Date().toLocaleString()}</p>`;
            html += `<p>Total screenshots: ${screenshots.length}</p>`;
            
            screenshots.forEach((screenshot, index) => {
                const date = new Date(screenshot.timestamp).toLocaleString();
                html += `<div style="margin: 20px 0;">`;
                html += `<h3>Screenshot ${index + 1} - ${date}</h3>`;
                html += `<img src="${screenshot.dataUrl}" style="max-width: 100%; height: auto; border: 1px solid #ccc;">`;
                html += `</div>`;
            });
            
            html += '</body></html>';
            
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `shots-export-${new Date().toISOString().slice(0, 10)}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showSuccess('Screenshots exported successfully');
        } catch (error) {
            console.error('Failed to export screenshots:', error);
            this.showError('Failed to export screenshots');
        }
    }

    async cleanupExpiredScreenshots() {
        try {
            const deletedIds = await this.db.deleteExpiredScreenshots();
            if (deletedIds.length > 0) {
                console.log(`🧹 Cleaned up ${deletedIds.length} expired screenshots`);
                await this.loadScreenshots();
            }
        } catch (error) {
            console.error('Failed to cleanup expired screenshots:', error);
        }
    }

    updateStats(screenshots) {
        const totalShots = document.getElementById('total-shots');
        const storageUsed = document.getElementById('storage-used');
        
        if (totalShots) {
            totalShots.textContent = screenshots.length;
        }
        
        if (storageUsed) {
            const totalSize = screenshots.reduce((sum, shot) => sum + shot.dataUrl.length, 0);
            const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1);
            storageUsed.textContent = sizeInMB;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
    }

    showConfirmDialog(title, message, callback) {
        this.confirmCallback = callback;
        
        const dialog = document.getElementById('confirm-dialog');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        
        if (dialog && titleEl && messageEl) {
            titleEl.textContent = title;
            messageEl.textContent = message;
            dialog.classList.add('active');
        }
    }

    hideConfirmDialog() {
        const dialog = document.getElementById('confirm-dialog');
        if (dialog) {
            dialog.classList.remove('active');
        }
        this.confirmCallback = null;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10003;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        if (type === 'success') {
            notification.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
        } else {
            notification.style.background = 'linear-gradient(45deg, #2196F3, #1976D2)';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Helper function for global screenshot capture
function getScreenshotTargetForCapture() {
    // Try to find the most appropriate target for screenshot
    const selectors = [
        // Main content areas
        '#main-content',
        '.main-content', 
        '#content',
        '.content',
        
        // Video/media containers
        '#video-container',
        '.video-container',
        '#player-container', 
        '.player-container',
        
        // App-specific containers
        '#app',
        '.app',
        '#codebank-app',
        '.codebank-app',
        
        // YouTube iframe container
        '#yt-iframe',
        '.youtube-container',
        
        // Current tab content
        '#current-tab-content',
        '.tab-content'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && isValidScreenshotTarget(element)) {
            return element;
        }
    }

    // Fallback: use body but filter out unwanted elements
    return document.body;
}

function isValidScreenshotTarget(element) {
    // Ensure the element is visible and has content
    const rect = element.getBoundingClientRect();
    return (
        rect.width > 0 && 
        rect.height > 0 && 
        element.offsetParent !== null &&
        window.getComputedStyle(element).display !== 'none' &&
        window.getComputedStyle(element).visibility !== 'hidden'
    );
}

// Global function to capture screenshot and save to IndexedDB
async function captureAndSaveScreenshot() {
    try {
        console.log('📸 Capturing screenshot for Shots! tab...');
        
        // Capture target element instead of full page
        const targetElement = window.getScreenshotTargetForCapture?.() || document.body;
        if (!targetElement) {
            throw new Error('No valid target element found for screenshot');
        }

        const canvas = await html2canvas(targetElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scale: window.devicePixelRatio || 1,
            width: targetElement.offsetWidth,
            height: targetElement.offsetHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: targetElement.offsetWidth,
            windowHeight: targetElement.offsetHeight
        });
        
        const dataUrl = canvas.toDataURL('image/png');
        
        // Save to IndexedDB
        if (window.shotsDB) {
            await window.shotsDB.saveScreenshot(dataUrl);
            console.log('✅ Screenshot saved to IndexedDB');
            
            // Show success notification if Shots tab is open
            if (window.shotsTab) {
                window.shotsTab.showSuccess('Screenshot captured and saved!');
            }
            
            return true;
        } else {
            throw new Error('ShotsDB not available');
        }
    } catch (error) {
        console.error('❌ Failed to capture screenshot:', error);
        
        // Show error notification if Shots tab is open
        if (window.shotsTab) {
            window.shotsTab.showError('Failed to capture screenshot');
        }
        
        return false;
    }
}

// Initialize Shots tab when DOM is loaded
let shotsTab;

document.addEventListener('DOMContentLoaded', () => {
    // Wait for ShotsDB to be available
    const initShotsTab = () => {
        if (window.shotsDB) {
            shotsTab = new ShotsTab();
            window.shotsTab = shotsTab;
        } else {
            // Retry after a short delay
            setTimeout(initShotsTab, 100);
        }
    };
    
    initShotsTab();
});

// Listen for init message from parent (lazy init support)
window.addEventListener('message', (ev) => {
    if (!ev.data) return;
    if (ev.data.type === 'shots-init') {
        if (window.shotsTab && typeof window.shotsTab.init === 'function') {
            try { window.shotsTab.init(); } catch (e) { console.warn('shotsTab.init() error', e); }
        }
    }
});

// Export for global access
window.ShotsTab = ShotsTab;
window.captureAndSaveScreenshot = captureAndSaveScreenshot;
window.getScreenshotTargetForCapture = getScreenshotTargetForCapture;
window.isValidScreenshotTarget = isValidScreenshotTarget;
