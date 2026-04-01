/**
 * YouTubeCaptureHelper - Utility to capture YouTube video content
 * Works around CORS limitations of html2canvas for YouTube iframes
 */
class YouTubeCaptureHelper {
    // Extract video ID from YouTube iframe src
    static extractVideoId(iframeSrc) {
        if (!iframeSrc) return null;
        const match = iframeSrc.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&]+)/);
        return match ? match[1] : null;
    }
    
    // Fetch YouTube thumbnail (CORS-safe via public CDN)
    static async getThumbnail(videoId) {
        const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default'];
        for (const quality of qualities) {
            try { 
                const url = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
                // Use anonymous crossOrigin for canvas compatibility
                const img = new Image();
                img.crossOrigin = "anonymous";
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = url;
                });
                
                // Convert image to data URL to ensure it's "clean" for the main canvas
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                return canvas.toDataURL('image/jpeg');
            } catch (e) { 
                continue; 
            }
        }
        return null;
    }
    
    // Main capture method - composite approach
    static async captureWithFallback(element) {
        if (!element) return null;
        
        const iframe = element.querySelector('iframe[src*="youtube"]');
        
        if (!iframe) {
            // No YouTube - use standard html2canvas
            console.log('[YouTubeCaptureHelper] No YouTube iframe found, using standard capture');
            const canvas = await html2canvas(element, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false
            });
            return {
                dataUrl: canvas.toDataURL('image/png'),
                method: 'standard'
            };
        }
        
        console.log('[YouTubeCaptureHelper] YouTube iframe detected, using composite capture');
        
        // Has YouTube - use composite method
        const videoId = this.extractVideoId(iframe.src);
        const thumbnail = videoId ? await this.getThumbnail(videoId) : null;
        
        // Temporarily hide iframe to capture the rest of the container
        const originalVisibility = iframe.style.visibility;
        iframe.style.visibility = 'hidden';
        
        const canvas = await html2canvas(element, {
            allowTaint: true,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        iframe.style.visibility = originalVisibility;
        
        // If we got a thumbnail, composite it onto the canvas where the iframe was
        if (thumbnail) {
            const ctx = canvas.getContext('2d');
            const img = new Image();
            await new Promise(resolve => {
                img.onload = resolve;
                img.src = thumbnail;
            });
            
            // Get iframe position relative to container
            const rect = iframe.getBoundingClientRect();
            const containerRect = element.getBoundingClientRect();
            
            // Calculate relative position and size
            const x = rect.left - containerRect.left;
            const y = rect.top - containerRect.top;
            const width = rect.width;
            const height = rect.height;
            
            ctx.drawImage(img, x, y, width, height);
            console.log('[YouTubeCaptureHelper] Composite successful with videoId:', videoId);
        } else {
            console.warn('[YouTubeCaptureHelper] Failed to get YouTube thumbnail, returning partial screenshot');
        }
        
        return {
            dataUrl: canvas.toDataURL('image/png'),
            method: 'youtube-composite',
            videoId: videoId
        };
    }
}

// Make it available globally
window.YouTubeCaptureHelper = YouTubeCaptureHelper;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = YouTubeCaptureHelper;
}
