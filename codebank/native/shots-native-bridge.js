/**
 * NativeShotsBridge - For Capacitor mobile app
 * Bypasses CORS by using native OS screenshot APIs
 */
const isNative = window.Capacitor && window.Capacitor.isNativePlatform();

class NativeShotsBridge {
    static async capture() {
        if (!isNative) {
            console.log('[NativeShotsBridge] Not running on a native platform, falling back to web capture');
            return await this.webCapture();
        }
        
        try {
            // Using @capawesome/capacitor-screenshot as a more reliable alternative
            const { Screenshot } = await import('@capawesome/capacitor-screenshot');
            const { Filesystem, Directory } = await import('@capacitor/filesystem');
            const { Toast } = await import('@capacitor/toast');
            
            // Native screenshot (bypasses all CORS!)
            const result = await Screenshot.takeScreenshot({
                quality: 90,
                format: 'png'
            });
            
            if (!result || !result.base64String) {
                throw new Error('Native screenshot failed: No data returned');
            }
            
            // Save to app's private storage
            const timestamp = Date.now();
            const filename = `shots/screenshot_${timestamp}.png`;
            
            await Filesystem.writeFile({
                path: filename,
                data: result.base64String,
                directory: Directory.Data,
                recursive: true
            });
            
            await Toast.show({
                text: '📸 Screenshot saved to gallery',
                duration: 'short'
            });
            
            // Return data URL for IndexedDB storage
            return {
                dataUrl: `data:image/png;base64,${result.base64String}`,
                method: 'native'
            };
            
        } catch (error) {
            console.error('❌ Native capture failed:', error);
            return await this.webCapture();
        }
    }
    
    static async webCapture() {
        // Use the YouTube-safe method from Phase 1
        const target = document.querySelector('#video-container') || 
                      document.querySelector('.video-container') || 
                      document.body;
                      
        if (window.YouTubeCaptureHelper) {
            return await window.YouTubeCaptureHelper.captureWithFallback(target);
        } else {
            // Last resort fallback
            console.warn('[NativeShotsBridge] YouTubeCaptureHelper not available, using standard html2canvas');
            const canvas = await html2canvas(target);
            return {
                dataUrl: canvas.toDataURL('image/png'),
                method: 'standard'
            };
        }
    }
}

// Make it available globally
window.NativeShotsBridge = NativeShotsBridge;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NativeShotsBridge;
}
