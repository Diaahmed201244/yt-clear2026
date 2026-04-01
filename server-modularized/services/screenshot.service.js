/**
 * services/screenshot.service.js
 *
 * Puppeteer-based screenshot capture service.
 *
 * Provides browser-level screenshots of arbitrary URLs and YouTube video frames.
 * The browser instance is lazily initialised on first use and kept alive for
 * subsequent requests. Each capture runs in an isolated page that is closed
 * after use (in a `finally` block) to prevent resource leaks.
 *
 * Exports:
 *   screenshotService           — the singleton service object
 *   captureScreenshot(url, opts)              — generic URL screenshot
 *   captureYouTubeFrame(videoId, ts, q, opts) — YouTube embed frame capture
 *   getServiceHealth()          — health/readiness check
 *   closeBrowser()              — graceful shutdown helper
 */

import puppeteer from 'puppeteer';

// ---------------------------------------------------------------------------
// Service singleton
// ---------------------------------------------------------------------------

const screenshotService = {
  browser: null,
  isRunning: false,
  config: {
    maxScreenshotSize: 1920 * 1080,
    screenshotTimeout: 30_000,
    browserOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    },
  },

  /**
   * Lazily launch the headless browser.
   */
  async initializeBrowser() {
    if (this.browser) return this.browser;

    console.log('[Screenshot Service] Launching browser...');
    this.browser = await puppeteer.launch(this.config.browserOptions);
    this.isRunning = true;
    console.log('[Screenshot Service] Browser launched successfully');
    return this.browser;
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Capture a screenshot of any URL.
 *
 * @param {string} url
 * @param {object} [options]
 * @param {number} [options.width=1920]
 * @param {number} [options.height=1080]
 * @param {string} [options.quality='high']
 * @param {boolean} [options.fullPage=false]
 * @param {number} [options.timeout]
 * @returns {Promise<{data: string, size: number, width: number, height: number, url: string}>}
 */
export async function captureScreenshot(url, options = {}) {
  const browser = await screenshotService.initializeBrowser();

  const opts = {
    width: 1920,
    height: 1080,
    quality: 'high',
    fullPage: false,
    timeout: screenshotService.config.screenshotTimeout,
    ...options,
  };

  let page;
  try {   
    page = await browser.newPage();
    await page.setViewport({
      width: opts.width,
      height: opts.height,
      deviceScaleFactor: opts.quality === 'high' ? 2 : 1,
    });

    console.log(`[Screenshot Service] Navigating to: ${url}`);
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: opts.timeout,
    });

    // BUG FIX: Replace deprecated page.waitForTimeout() with standard delay
    await new Promise((r) => setTimeout(r, 2000));

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: opts.fullPage,
      quality: opts.quality === 'high' ? undefined : 80,
    });

    console.log(`[Screenshot Service] Screenshot captured successfully (${screenshot.length} bytes)`);

    return {
      data: screenshot.toString('base64'),
      size: screenshot.length,
      width: opts.width,
      height: opts.height,
      url,
    };
  } catch (error) {
    console.error('[Screenshot Service] Screenshot capture failed:', error);
    throw error;
  } finally {
    if (page) await page.close();
  }
}

/**
 * Capture a frame from a YouTube video embed.
 *
 * @param {string} videoId
 * @param {number|null} [timestamp=null] — seek position in seconds
 * @param {string} [quality='high']
 * @param {object} [options]
 * @returns {Promise<{data: string, size: number, width: number, height: number, videoId: string, timestamp: number|null}>}
 */
export async function captureYouTubeFrame(videoId, timestamp = null, quality = 'high', options = {}) {
  const browser = await screenshotService.initializeBrowser();

  const opts = {
    width: 1920,
    height: 1080,
    quality,
    ...options,
  };

  let page;
  try {   
    page = await browser.newPage();
    await page.setViewport({
      width: opts.width,
      height: opts.height,
      deviceScaleFactor: opts.quality === 'high' ? 2 : 1,
    });

    const vq = opts.quality === 'high' ? 'hd1080' : 'hd720';
    const embedUrl =
      `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1` +
      `&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&enablejsapi=1` +
      `&color=white&theme=light&vq=${vq}` +
      (timestamp ? `&start=${Math.floor(timestamp)}` : '');

    console.log(`[Screenshot Service] Loading YouTube embed: ${embedUrl}`);
    await page.goto(embedUrl, {
      waitUntil: 'domcontentloaded',
      timeout: screenshotService.config.screenshotTimeout,
    });

    // BUG FIX: Replace deprecated page.waitForTimeout() with standard delay
    await page.waitForSelector('video', { timeout: 10_000 }).catch(() =>
      new Promise((r) => setTimeout(r, 3000))
    );
    await new Promise((r) => setTimeout(r, 3000));

    if (timestamp) {
      console.log(`[Screenshot Service] Seeking to ${timestamp}s`);
      await page.evaluate((seekTime) => {
        const video = document.querySelector('video');
        if (video) video.currentTime = seekTime;
      }, timestamp);
      await new Promise((r) => setTimeout(r, 2000));
    }

    const screenshot = await page.screenshot({
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: opts.width,
        height: opts.height,
      },
      quality: opts.quality === 'high' ? undefined : 80,
    });

    console.log(`[Screenshot Service] YouTube frame captured successfully (${screenshot.length} bytes)`);

    return {
      data: screenshot.toString('base64'),
      size: screenshot.length,
      width: opts.width,
      height: opts.height,
      videoId,
      timestamp,
    };
  } catch (error) {
    console.error('[Screenshot Service] YouTube frame capture failed:', error);
    throw error;
  } finally {
    if (page) await page.close();
  }
}

/**
 * Return a health / readiness snapshot.
 *
 * @returns {{ status: string, timestamp: string, browserReady: boolean, isRunning: boolean }}
 */
export function getServiceHealth() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    browserReady: !!screenshotService.browser,
    isRunning: screenshotService.isRunning,
  };
}

/**
 * Gracefully close the browser (call on SIGTERM / SIGINT).
 */
export async function closeBrowser() {
  if (screenshotService.browser) {
    await screenshotService.browser.close();
    screenshotService.browser = null;
    screenshotService.isRunning = false;
  }
}

export { screenshotService };
