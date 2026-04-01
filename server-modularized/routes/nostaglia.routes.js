/**
 * routes/nostaglia.routes.js
 *
 * Nostaglia app routes.
 *
 * Nostaglia has its own SSE broadcast channel (separate from the main
 * per-user SSE stream). The broadcast is fan-out: every connected Nostaglia
 * client receives the same event payload.
 *
 * Mount this router at / (root) or wherever Nostaglia routes live:
 *   GET  /nostaglia/stream   — SSE broadcast stream for Nostaglia clients
 *   GET  /nostaglia          — serve Nostaglia SPA index.html
 *   GET  /nostaglia/*        — SPA client-side routing fallback
 *
 * Static asset serving for /nostaglia is handled in static.routes.js.
 */

import { Router } from 'express';
import path from 'path';
import {
  nostagliaClients,
  addNostagliaClient,
} from '../services/sse.service.js';

const router = Router();

// ---------------------------------------------------------------------------
// In-memory Nostaglia state (uploads, reactions, comments, shares, cycles)
// ---------------------------------------------------------------------------
// This mirrors the original nostagliaStore. Kept here so it survives the life
// of the process without requiring DB persistence for the prototype phase.

export const nostagliaStore = {
  uploads: [],
  reactions: new Map(),
  comments: new Map(),
  shares: new Map(),
  cycles: [],
};

// ---------------------------------------------------------------------------
// GET /nostaglia/stream — SSE broadcast stream for Nostaglia clients
// ---------------------------------------------------------------------------

/**
 * Opens a persistent SSE connection for a Nostaglia client.
 * No authentication required — Nostaglia uses broadcast-only push.
 * Sends an immediate `hello` event on connection.
 */
router.get('/nostaglia/stream', (req, res) => {
  try {   
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (res.flushHeaders) res.flushHeaders();

    // Send immediate hello frame
    res.write(`event: hello\ndata: {"ok":true}\n\n`);

    // Register client — auto-cleanup on close handled by service
    addNostagliaClient(res, req);
  } catch (err) {
    try {   
      res.status(500).end();
    } catch (_) {}
  }
});

// ---------------------------------------------------------------------------
// GET /nostaglia — serve Nostaglia SPA index.html
// ---------------------------------------------------------------------------

router.get('/nostaglia', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'codebank', 'nostaglia', 'index.html'));
});

// ---------------------------------------------------------------------------
// GET /nostaglia/* — SPA client-side routing fallback
// ---------------------------------------------------------------------------

router.get('/nostaglia/*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'codebank', 'nostaglia', 'index.html'));
});

export default router;
