/**
 * routes/screenshot.routes.js
 *
 * Express router for the Screenshot Service.
 *
 * ⚠️  MOUNT NOTE: These routes were registered at ROOT level in the original
 *     server.js (i.e. /screenshot/*, NOT /api/screenshot/*).
 *     Mount this router WITHOUT the /api prefix in app.js, e.g.:
 *       app.use('/screenshot', screenshotRouter);
 *
 * Endpoints:
 *   GET  /health           — Readiness / health check (is the browser alive?)
 *   POST /capture          — Capture a screenshot of an arbitrary URL
 *   POST /capture-youtube  — Capture a frame from a YouTube video embed
 *
 * All heavy lifting is delegated to services/screenshot.service.js.
 * This file is intentionally thin: validate → call service → respond.
 */

import { Router } from 'express';
import {
  captureScreenshot,
  captureYouTubeFrame,
  getServiceHealth,
} from '../services/screenshot.service.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /health — return browser readiness status
// ---------------------------------------------------------------------------

router.get('/health', (_req, res) => {
  const health = getServiceHealth();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    browserReady: health.browserReady,
    isRunning: health.isRunning,
  });
});

// ---------------------------------------------------------------------------
// POST /capture — screenshot of an arbitrary URL
//
// Body (JSON):
//   url     {string}  required — page to screenshot
//   options {object}  optional — width, height, quality, fullPage, timeout
// ---------------------------------------------------------------------------

router.post('/capture', async (req, res) => {
  try {   
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`[Screenshot Route] Capturing screenshot for: ${url}`);
    const screenshot = await captureScreenshot(url, options);

    res.json({
      success: true,
      screenshot,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Screenshot Route] Capture failed:', error);
    res.status(500).json({
      error: 'Screenshot capture failed',
      message: error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// POST /capture-youtube — capture a frame from a YouTube video
//
// Body (JSON):
//   videoId   {string}  required — YouTube video ID
//   timestamp {number}  optional — seconds into the video to seek to
//   quality   {string}  optional — 'high' (default) or 'low'
//   options   {object}  optional — width, height overrides
// ---------------------------------------------------------------------------

router.post('/capture-youtube', async (req, res) => {
  try {   
    const { videoId, timestamp, quality = 'high', options = {} } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log(`[Screenshot Route] Capturing YouTube frame for: ${videoId} at ${timestamp ?? 'current'}s`);
    const result = await captureYouTubeFrame(videoId, timestamp, quality, options);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Screenshot Route] YouTube capture failed:', error);
    res.status(500).json({
      error: 'YouTube screenshot capture failed',
      message: error.message,
    });
  }
});

export default router;
