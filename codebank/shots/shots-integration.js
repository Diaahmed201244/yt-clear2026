// Shots Integration for Play-Pause Button
// This file provides the interface for capturing screenshots when users interact with play-pause buttons

class ShotsIntegration {
    constructor() {
        this.isCapturing = false;
        this.init();
    }

<<<<<<< HEAD
    init() {
        console.log('🎬 Initializing Shots! integration...');
        
        // Wait for DOM and dependencies to be ready
        this.waitForDependencies().then(() => {
            this.setupPlayPauseIntegration();
            console.log('✅ Shots! integration ready');
        }).catch(error => {
            console.error('❌ Failed to initialize Shots! integration:', error);
        });
    }

    async waitForDependencies() {
        const maxAttempts = 50;
        let attempts = 0;

        while (attempts < maxAttempts) {
            if (window.html2canvas && window.shotsDB) {
                return true;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        throw new Error('Dependencies not loaded: html2canvas or shotsDB');
=======
    async init() {
        try {
            console.log('🎬 Initializing Shots! integration...');
            
            // Load required dependencies dynamically
            await this.loadDependencies();
            
            // Initialize database
            if (window.shotsDB && typeof window.shotsDB.init === 'function') {
                await window.shotsDB.init();
            }
            
            // Set up integration
            this.setupPlayPauseIntegration();
            
            console.log('✅ Shots! integration initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Shots! integration:', error);
            this.showErrorMessage('Failed to initialize Shots! integration');
        }
    }

    async loadDependencies() {
        const deps = [
            { id: 'html2canvas-script', src: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', check: () => window.html2canvas },
            { id: 'shots-db-script', src: 'shots-db.js', check: () => window.shotsDB },
            { id: 'youtube-helper-script', src: 'youtube-capture-helper.js', check: () => window.YouTubeCaptureHelper },
            { id: 'native-bridge-script', src: '../native/shots-native-bridge.js', check: () => window.NativeShotsBridge }
        ];

        for (const dep of deps) {
            if (!dep.check()) {
                await new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.id = dep.id;
                    script.src = dep.src;
                    script.onload = resolve;
                    script.onerror = () => {
                        console.warn(`⚠️ Failed to load ${dep.src} locally, trying alternative path...`);
                        const altScript = document.createElement('script');
                        // Handle relative path for native bridge specifically
                        if (dep.id === 'native-bridge-script') {
                            altScript.src = '/services/yt-clear/codebank/native/shots-native-bridge.js';
                        } else {
                            altScript.src = `/services/yt-clear/codebank/shots/${dep.src}`;
                        }
                        altScript.onload = resolve;
                        altScript.onerror = resolve;
                        document.head.appendChild(altScript);
                    };
                    document.head.appendChild(script);
                });
            }
        }
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    }

    setupPlayPauseIntegration() {
        // Listen for play-pause button events
        this.setupEventListeners();
        
        // Add global functions for play-pause buttons to use
        window.captureShotOnTap = () => this.captureShotOnTap();
        window.showShotsGallery = () => this.showShotsGallery();
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
            
            // Play-pause button's closest container
            '[data-play-pause]'
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

    setupEventListeners() {
        // Listen for custom play-pause events
        document.addEventListener('play-pause-tap', (event) => {
            console.log('📸 Play-pause tap detected, capturing screenshot...');
            this.captureShotOnTap();
        });

        document.addEventListener('play-pause-longpress', (event) => {
            console.log('🖼️ Play-pause long-press detected, showing gallery...');
            this.showShotsGallery();
        });

        // Listen for global click events on play-pause buttons
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-play-pause]');
            if (target) {
                // Determine if this is a tap or long-press
                this.handlePlayPauseButtonClick(target, event);
            }
        });
    }

    handlePlayPauseButtonClick(button, event) {
        const pressDuration = Date.now() - (button._pressStartTime || 0);
        
        if (pressDuration > 500) {
            // Long press
            this.showShotsGallery();
        } else {
            // Tap
            this.captureShotOnTap();
        }
    }

    // This function should be called by play-pause button handlers
    async captureShotOnTap() {
        if (this.isCapturing) {
            console.log('⚠️ Screenshot capture already in progress');
            return;
        }

        this.isCapturing = true;

        try {
            console.log('📸 Starting screenshot capture...');
            
            // Capture target element instead of full page
            const targetElement = this.getScreenshotTargetElement();
            if (!targetElement) {
                throw new Error('No valid target element found for screenshot');
            }

<<<<<<< HEAD
            const canvas = await html2canvas(targetElement, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                scale: window.devicePixelRatio || 1,
                logging: false,
                width: targetElement.offsetWidth,
                height: targetElement.offsetHeight,
                scrollX: 0,
                scrollY: 0,
                windowWidth: targetElement.offsetWidth,
                windowHeight: targetElement.offsetHeight
            });
            
            const dataUrl = canvas.toDataURL('image/png', 0.8);
            
            // Save to IndexedDB
            if (window.shotsDB) {
                await window.shotsDB.saveScreenshot(dataUrl);
                console.log('✅ Screenshot saved to IndexedDB');
=======
            // USE THE NEW HYBRID CAPTURE METHOD (PHASE 2 FIX)
            let captureResult;
            
            // Detect if running in Capacitor
            const isNative = window.Capacitor && window.Capacitor.isNativePlatform();
            
            if (isNative && window.NativeShotsBridge) {
                console.log('📱 Using native Capacitor capture...');
                captureResult = await window.NativeShotsBridge.capture();
            } else if (window.YouTubeCaptureHelper) {
                console.log('🌐 Using web YouTube-safe capture...');
                captureResult = await window.YouTubeCaptureHelper.captureWithFallback(targetElement);
            } else {
                console.warn('⚠️ No capture helper available, using standard html2canvas');
                const canvas = await html2canvas(targetElement);
                captureResult = {
                    dataUrl: canvas.toDataURL('image/png'),
                    method: 'standard'
                };
            }
            
            if (!captureResult || !captureResult.dataUrl) {
                throw new Error('Failed to generate screenshot data');
            }
            
            // Save to IndexedDB with metadata
            if (window.shotsDB) {
                await window.shotsDB.saveScreenshot(captureResult.dataUrl, {
                    method: captureResult.method || 'web',
                    videoId: captureResult.videoId || null,
                    target: targetElement.id || targetElement.className || 'body'
                });
                console.log(`✅ Screenshot saved to IndexedDB (Method: ${captureResult.method})`);
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
                
                // Show capture animation
                this.showCaptureAnimation();
                
                // Notify Shots tab to refresh if it's open
                this.notifyShotsTab();
                
                return true;
            } else {
                throw new Error('ShotsDB not available');
            }
        } catch (error) {
            console.error('❌ Failed to capture screenshot:', error);
            this.showErrorMessage('Failed to capture screenshot');
            return false;
        } finally {
            this.isCapturing = false;
        }
    }

    // This function should be called by play-pause button long-press handlers
    async showShotsGallery() {
        try {
            console.log('🖼️ Opening Shots gallery...');
            
            // Check if there are any screenshots
            if (window.shotsDB) {
                const screenshots = await window.shotsDB.getAllScreenshots();
                
                if (screenshots.length === 0) {
                    this.showNoScreenshotsMessage();
                    return;
                }
                
                // Show gallery modal
                this.showGalleryModal(screenshots);
            } else {
                this.showErrorMessage('Shots database not available');
            }
        } catch (error) {
            console.error('❌ Failed to show gallery:', error);
            this.showErrorMessage('Failed to open gallery');
        }
    }

    showCaptureAnimation() {
        // Create flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(flash);
        
        // Animate flash
        requestAnimationFrame(() => {
            flash.style.opacity = '1';
            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => {
                    if (flash.parentNode) {
                        flash.parentNode.removeChild(flash);
                    }
                }, 200);
            }, 100);
        });

        // Show success toast
        this.showToast('📸 Screenshot captured!', 'success');
    }

    showGalleryModal(screenshots) {
        // Remove existing modal
        const existingModal = document.getElementById('shots-gallery-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'shots-gallery-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                border-radius: 20px;
                padding: 20px;
                max-width: 90vw;
                max-height: 90vh;
                overflow: auto;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                position: relative;
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                ">
                    <h3 style="margin: 0; color: white; font-size: 1.3rem;">
                        🖼️ Shots Gallery (${screenshots.length})
                    </h3>
                    <button onclick="this.closest('#shots-gallery-modal').remove()" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 5px;
                        border-radius: 50%;
                        width: 35px;
                        height: 35px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='none'">
                        ✕
                    </button>
                </div>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                    max-height: 70vh;
                    overflow-y: auto;
                ">
                    ${screenshots.map(screenshot => {
                        const date = new Date(screenshot.timestamp).toLocaleString();
                        return `
                            <div style="
                                background: rgba(255, 255, 255, 0.1);
                                border-radius: 10px;
                                padding: 10px;
                                text-align: center;
                                border: 1px solid rgba(255, 255, 255, 0.2);
                                transition: all 0.3s ease;
                            " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                                <img src="${screenshot.dataUrl}" style="
                                    width: 100%;
                                    height: 120px;
                                    object-fit: cover;
                                    border-radius: 8px;
                                    margin-bottom: 10px;
                                    cursor: pointer;
                                " onclick="shotsIntegration.viewFullScreenshot('${screenshot.dataUrl}', '${date}')">
                                <div style="
                                    font-size: 0.8rem;
                                    color: rgba(255, 255, 255, 0.8);
                                    margin-bottom: 10px;
                                ">${date}</div>
                                <button onclick="shotsIntegration.downloadScreenshot('${screenshot.id}')" style="
                                    background: linear-gradient(45deg, #4CAF50, #45a049);
                                    color: white;
                                    border: none;
                                    padding: 8px 12px;
                                    border-radius: 15px;
                                    font-size: 0.8rem;
                                    cursor: pointer;
                                    margin-right: 5px;
                                    transition: all 0.3s ease;
                                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                    💾 Download
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    viewFullScreenshot(dataUrl, date) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
        `;

        modal.innerHTML = `
            <div style="position: relative; max-width: 95vw; max-height: 95vh;">
                <button onclick="this.closest('[style*=\"z-index: 10001\"]').remove()" style="
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 10px;
                ">✕</button>
                <img src="${dataUrl}" style="
                    max-width: 100%;
                    max-height: 100%;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                ">
                <div style="
                    position: absolute;
                    bottom: -40px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: white;
                    text-align: center;
                    font-size: 0.9rem;
                ">${date}</div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    async downloadScreenshot(screenshotId) {
        try {
            const screenshots = await window.shotsDB.getAllScreenshots();
            const screenshot = screenshots.find(s => s.id === screenshotId);
            
            if (screenshot) {
                const link = document.createElement('a');
                link.href = screenshot.dataUrl;
                link.download = `screenshot-${new Date(screenshot.timestamp).toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.showToast('💾 Screenshot downloaded!', 'success');
            }
        } catch (error) {
            console.error('Failed to download screenshot:', error);
            this.showToast('Failed to download screenshot', 'error');
        }
    }

    showNoScreenshotsMessage() {
        this.showToast('📸 No screenshots yet! Tap the play-pause button to capture your first shot!', 'info');
    }

    showErrorMessage(message) {
        this.showToast(`❌ ${message}`, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10002;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        if (type === 'success') {
            toast.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        } else if (type === 'error') {
            toast.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
        } else {
            toast.style.background = 'linear-gradient(45deg, #2196F3, #1976D2)';
        }

        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    notifyShotsTab() {
        // Trigger custom event to notify Shots tab
        const event = new CustomEvent('shots-updated', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }
}

// Initialize integration when dependencies are ready
let shotsIntegration;

function initShotsIntegration() {
    if (!shotsIntegration) {
        shotsIntegration = new ShotsIntegration();
        window.shotsIntegration = shotsIntegration;
    }
    return shotsIntegration;
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShotsIntegration);
} else {
    initShotsIntegration();
}

// Export for global use
window.initShotsIntegration = initShotsIntegration;
window.ShotsIntegration = ShotsIntegration;