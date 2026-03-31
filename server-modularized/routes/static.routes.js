/**
 * routes/static.routes.js
 *
 * Static file serving configuration and SPA fallback.
 *
 * Usage — call this function AFTER all API routes are registered:
 *
 *   import { setupStaticRoutes } from './routes/static.routes.js';
 *   setupStaticRoutes(app);
 *
 * What this sets up (in mount order):
 *   1. /public          — primary public assets directory
 *   2. /services        — services sub-directory static assets
 *   3. /js, /styles     — legacy JS/CSS directories
 *   4. /yt-player       — YT player static assets
 *   5. /manifest.json, /sw.js — PWA files
 *   6. SPA fallback     — all unmatched GET requests → public/index.html
 *
 * BUG FIX (CRITICAL): The original served `__dirname` (the project root) as
 * the root static path, which exposed ALL server-side source files to the
 * public internet. We now serve ONLY `path.join(process.cwd(), 'public')`.
 *
 * Note: Sub-app-specific static routes (codebank, pebalaash, etc.) are
 * handled in their respective route files (nostaglia.routes.js, etc.).
 */

import path from 'path';
import express from 'express';

/**
 * Common static-serving options applied to all express.static mounts.
 */
const STATIC_OPTS = {
  maxAge: '1d',
  etag: true,
  lastModified: true,
};

/**
 * Static options for HTML files — never cache HTML so users always get fresh
 * app shells. Used as the setHeaders callback for the primary public mount.
 *
 * @param {import('http').ServerResponse} res
 * @param {string} filePath
 */
function noCacheHtml(res, filePath) {
  if (filePath && filePath.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}

/**
 * Set up all static file serving and the SPA fallback on the given Express app.
 *
 * Call this AFTER registering all API routes.
 *
 * @param {import('express').Application} app
 */
export function setupStaticRoutes(app) {
  const cwd = process.cwd();

  // ---------------------------------------------------------------------------
  // 1. Primary public assets — BUG FIX: serve only /public, never the project root
  // ---------------------------------------------------------------------------
  app.use(
    express.static(path.join(cwd, 'public'), {
      ...STATIC_OPTS,
      setHeaders: noCacheHtml,
    })
  );

  // ---------------------------------------------------------------------------
  // 2. /services — services sub-directory (read-only client assets)
  // ---------------------------------------------------------------------------
  app.use('/services', express.static(path.join(cwd, 'services'), STATIC_OPTS));

  // ---------------------------------------------------------------------------
  // 3. Legacy asset directories
  // ---------------------------------------------------------------------------
  app.use('/yt-player', express.static(path.join(cwd, 'yt-player'), STATIC_OPTS));
  app.use('/js', express.static(path.join(cwd, 'js'), STATIC_OPTS));
  app.use('/styles', express.static(path.join(cwd, 'styles'), STATIC_OPTS));

  // ---------------------------------------------------------------------------
  // 4. PWA files — served with explicit content-type where needed
  // ---------------------------------------------------------------------------
  app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(cwd, 'public', 'manifest.json'));
  });

  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(cwd, 'public', 'sw.js'));
  });

  // ---------------------------------------------------------------------------
  // 5. SPA fallback — all unmatched GET requests serve the main index.html
  //    This enables client-side routing (React Router, Vue Router, etc.)
  // ---------------------------------------------------------------------------
  app.get('*', (req, res) => {
    res.sendFile(path.join(cwd, 'public', 'index.html'));
  });
}

export default setupStaticRoutes;
