/**
 * routes/events.routes.js
 *
 * User event endpoints.
 *
 * Mount this router at /api/events:
 *   GET  /api/events/inbox   — fetch recent/unseen events for the authenticated user
 *   POST /api/events/ack     — mark one or more events as seen
 *   GET  /api/events/stream  — SSE stream for real-time push (replaces bare /events route)
 *   GET  /api/events         — legacy: read from in-memory event vault
 */

import { Router } from 'express';
import { query } from '../config/database.js';
import { readSessionFromCookie } from '../middleware/auth.js';
import { addClient } from '../services/sse.service.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/events/stream — per-user Server-Sent Events connection
// ---------------------------------------------------------------------------

/**
 * Opens a persistent SSE connection for the authenticated user.
 * The client must include a valid session cookie.
 * Sends an immediate `hello` event on connection, then streams updates
 * via the shared SSE client map (emitSSE / broadcastSSE).
 */
router.get('/stream', (req, res) => {
  try {   
    const s = readSessionFromCookie(req, res);
    if (!s || !s.userId) {
      return res.status(401).end();
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (res.flushHeaders) res.flushHeaders();

    // Send an immediate hello frame so the client knows it's connected
    res.write(`event: hello\ndata: {"ok":true}\n\n`);

    // Register client — keep-alive ping + auto-cleanup on close handled by service
    addClient(String(s.userId), res, req);
  } catch (err) {
    try {   
      res.status(500).end();
    } catch (_) {}
  }
});

// ---------------------------------------------------------------------------
// GET /api/events/inbox — fetch recent/unseen events for the current user
// ---------------------------------------------------------------------------

router.get('/inbox', async (req, res) => {
  try {   
    const s = readSessionFromCookie(req, res);
    if (!s || !s.userId) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    // Return empty list when DB is not configured (dev/test)
    if (!process.env.DATABASE_URL) {
      return res.json({ ok: true, events: [] });
    }

    const { rows } = await query(
      `SELECT id, type, meta, created_at, expires_at, seen
       FROM events
       WHERE user_id=$1
         AND (seen=0 OR created_at > datetime('now', '-24 hours'))
       ORDER BY created_at DESC
       LIMIT 100`,
      [s.userId]
    );

    return res.json({ ok: true, events: rows });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/events/ack — acknowledge (mark as seen) one or more events
// ---------------------------------------------------------------------------

router.post('/ack', async (req, res) => {
  try {   
    const s = readSessionFromCookie(req, res);
    if (!s || !s.userId) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const ids = Array.isArray((req.body || {}).ids) ? req.body.ids : [];
    if (!ids.length) {
      return res.json({ ok: true, updated: 0 });
    }

    if (!process.env.DATABASE_URL) {
      return res.json({ ok: true, updated: 0 });
    }

    // Build $2, $3, ... placeholders for the id list
    const placeholders = ids.map((_, i) => `$${i + 2}`).join(',');

    const { rowCount } = await query(
      `UPDATE events SET seen=1, updated_at=CURRENT_TIMESTAMP WHERE user_id=$1 AND id IN (${placeholders})`,
      [s.userId, ...ids]
    );

    return res.json({ ok: true, updated: rowCount | 0 });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/events — legacy: read from in-memory event vault
// ---------------------------------------------------------------------------

router.get('/', (req, res) => {
  try {   
    return res.json({
      status: 'success',
      events: globalThis.__eventVaultMem || [],
    });
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: e.message });
  }
});

export default router;
