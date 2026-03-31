// /js/pwa-install-handler.js
class DrDPWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }
    
    init() {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('[DrD] Already running as installed PWA');
            return;
        }
        
        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[DrD] Install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            console.log('[DrD] App installed successfully');
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.hideInstallUI();
        });
    }
    
    showInstallButton() {
        // Create floating install button
        const installBtn = document.createElement('div');
        installBtn.id = 'drd-install-btn';
        installBtn.innerHTML = `
            <div style="
                position: fixed;
                bottom: 80px;
                right: 20px;
                background: linear-gradient(145deg, #00d4ff, #0099cc);
                color: #000;
                padding: 15px 25px;
                border-radius: 50px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 10px 30px rgba(0, 212, 255, 0.4);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideIn 0.5s ease;
            ">
                <span>📲</span>
                <span>Install Dr.D App</span>
            </div>
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(installBtn);
        
        installBtn.addEventListener('click', () => this.triggerInstall());
        
        // Auto-hide after 10 seconds if not clicked
        setTimeout(() => {
            if (installBtn.parentNode) {
                installBtn.style.animation = 'slideIn 0.5s ease reverse';
                setTimeout(() => installBtn.remove(), 500);
            }
        }, 10000);
    }
    
    async triggerInstall() {
        if (!this.deferredPrompt) {
            console.log('[DrD] No install prompt available');
            this.showManualInstallInstructions();
            return;
        }
        
        // Show browser install prompt
        this.deferredPrompt.prompt();
        
        // Wait for user choice
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('[DrD] User accepted install');
        } else {
            console.log('[DrD] User dismissed install');
            // Show again after some time
            setTimeout(() => this.showInstallButton(), 60000);
        }
        
        this.deferredPrompt = null;
    }
    
    showManualInstallInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        const isDesktop = !isIOS && !isAndroid;
        
        let instructions = '';
        
        if (isIOS) {
            instructions = `
                <h3 style="color: #00d4ff; margin-bottom: 20px;">📱 Install on iPhone/iPad</h3>
                <ol style="text-align: left; line-height: 2; color: #ccc;">
                    <li>Tap the <strong>Share</strong> button (⬆️) in Safari</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Tap <strong>Add</strong> in the top right</li>
                </ol>
            `;
        } else if (isAndroid) {
            instructions = `
                <h3 style="color: #00d4ff; margin-bottom: 20px;">📱 Install on Android</h3>
                <ol style="text-align: left; line-height: 2; color: #ccc;">
                    <li>Tap the <strong>⋮ Menu</strong> in Chrome</li>
                    <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                    <li>Tap <strong>Add</strong> or <strong>Install</strong></li>
                </ol>
            `;
        } else if (isDesktop) {
            instructions = `
                <h3 style="color: #00d4ff; margin-bottom: 20px;">💻 Install on Desktop</h3>
                <ol style="text-align: left; line-height: 2; color: #ccc;">
                    <li>Click the <strong>⋮ Menu</strong> in Chrome/Edge</li>
                    <li>Go to <strong>Cast, save, and share</strong></li>
                    <li>Click <strong>"Install Dr.D..."</strong></li>
                    <li>Click <strong>Install</strong></li>
                </ol>
            `;
        }
        
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100000;
            " onclick="this.remove()">
                <div style="
                    background: linear-gradient(145deg, #1a1a2e, #0f0f0f);
                    padding: 40px;
                    border-radius: 20px;
                    max-width: 400px;
                    color: #fff;
                    text-align: center;
                    border: 1px solid rgba(0, 212, 255, 0.2);
                " onclick="event.stopPropagation()">
                    ${instructions}
                    <button onclick="this.closest('div').parentNode.remove()" 
                            style="
                                margin-top: 20px;
                                background: #00d4ff;
                                color: #000;
                                border: none;
                                padding: 12px 30px;
                                border-radius: 8px;
                                font-weight: bold;
                                cursor: pointer;
                            ">
                        Got it
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    hideInstallUI() {
        const btn = document.getElementById('drd-install-btn');
        if (btn) btn.remove();
    }
    
    // Check if running as installed app
    getInstallStatus() {
        return {
            isInstalled: this.isInstalled,
            displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
            platform: this.getPlatform()
        };
    }
    
    getPlatform() {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return 'ios';
        if (/Android/.test(navigator.userAgent)) return 'android';
        if (/Windows/.test(navigator.userAgent)) return 'windows';
        if (/Mac/.test(navigator.userAgent)) return 'mac';
        return 'unknown';
    }
}

// Initialize
window.drdInstaller = new DrDPWAInstaller();