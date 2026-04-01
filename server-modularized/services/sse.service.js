/**
 * services/sse.service.js
 *
 * Server-Sent Events (SSE) client management for real-time updates.
 *
 * Manages two independent SSE client pools:
 *   1. __sseClients — per-user SSE connections (Map<userId, Set<res>>)
 *   2. nostagliaClients — broadcast-only SSE connections for the Nostaglia app
 *
 * Exports:
 *   __sseClients        — the raw Map for per-user connections
 *   nostagliaClients    — the raw Set for Nostaglia broadcast connections
 *   emitSSE(userId, payload)       — send an event to a specific user
 *   broadcastSSE(event, data)      — broadcast to all per-user SSE clients
 *   nostagliaBroadcast(event, payload) — broadcast to all Nostaglia SSE clients
 *   addClient(uid, res, req)       — register a per-user SSE client
 *   removeClient(uid, res)         — unregister a per-user SSE client
 *   addNostagliaClient(res, req)   — register a Nostaglia SSE client
 *   removeNostagliaClient(res)     — unregister a Nostaglia SSE client
 */

// ---------------------------------------------------------------------------
// Per-user SSE connections (userId → Set of response objects)
// ---------------------------------------------------------------------------

const __sseClients = new Map();

/**
 * Send an SSE payload to a specific user.
 *
 * @param {string} userId
 * @param {object} payload — will be JSON-stringified into the `data:` field
 */
let sseErrorCount = 0;
let lastSSEErrorTime = 0;

function logSSEError(msg) {
  const now = Date.now();
  if (now - lastSSEErrorTime > 60000) { // Reset every minute
    sseErrorCount = 0;
    lastSSEErrorTime = now;
  }
  sseErrorCount++;
  if (sseErrorCount <= 3) {
    console.error('[SSE]', msg);
  } else if (sseErrorCount === 4) {
    console.error('[SSE] ... suppressing further errors');
  }
}

function emitSSE(userId, payload) {
  try {
    const set = __sseClients.get(String(userId));
    if (!set) return;
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const res of set) {
      try {
        res.write(data);
      } catch (err) {
        logSSEError(`Write error: ${err.message}`);
      }
    }
  } catch (err) {
    logSSEError(`Broadcast error: ${err.message}`);
  }
}

/**
 * Broadcast an SSE event to ALL connected per-user clients.
 *
 * @param {string} event — SSE event name
 * @param {object} data  — will be JSON-stringified
 */
function broadcastSSE(event, data) {
  const frame = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const [, set] of __sseClients) {
    for (const res of set) {
      try {
        res.write(frame);
      } catch (err) {
        logSSEError(`Broadcast write error: ${err.message}`);
      }
    }
  }
}

/**
 * Register a per-user SSE response and wire up keep-alive + cleanup.
 *
 * @param {string} uid  — user ID
 * @param {import('http').ServerResponse} res
 * @param {import('http').IncomingMessage} req
 */
function addClient(uid, res, req) {
  const id = String(uid);
  if (!__sseClients.has(id)) __sseClients.set(id, new Set());
  __sseClients.get(id).add(res);

  // Keep-alive heartbeat every 15 s
  const keep = setInterval(() => {
    try {
      res.write(':\n\n');
    } catch (err) {
      logSSEError(`Keep-alive error: ${err.message}`);
    }
  }, 15_000);

  // BUG FIX: Always clean up on connection close
  req.on('close', () => {
    try {
      clearInterval(keep);
      __sseClients.get(id)?.delete(res);
    } catch (err) {
      logSSEError(`Close cleanup error: ${err.message}`);
    }
  });
}

/**
 * Explicitly remove a per-user SSE client.
 *
 * @param {string} uid
 * @param {import('http').ServerResponse} res
 */
function removeClient(uid, res) {
  __sseClients.get(String(uid))?.delete(res);
}

// ---------------------------------------------------------------------------
// Nostaglia broadcast SSE connections (simple Set of response objects)
// ---------------------------------------------------------------------------

const nostagliaClients = new Set();

/**
 * Broadcast an SSE event to all Nostaglia clients.
 *
 * @param {string} event   — SSE event name
 * @param {object} payload — will be JSON-stringified
 */
function nostagliaBroadcast(event, payload) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of nostagliaClients) {
    try {
      res.write(data);
    } catch (_) {
      // Stale connection — will be cleaned up on close
    }
  }
}

/**
 * Register a Nostaglia SSE response and wire up cleanup.
 *
 * @param {import('http').ServerResponse} res
 * @param {import('http').IncomingMessage} req
 */
function addNostagliaClient(res, req) {
  nostagliaClients.add(res);

  // BUG FIX: Clean up on connection close to prevent memory leaks
  req.on('close', () => {
    nostagliaClients.delete(res);
  });
}

/**
 * Explicitly remove a Nostaglia SSE client.
 *
 * @param {import('http').ServerResponse} res
 */
function removeNostagliaClient(res) {
  nostagliaClients.delete(res);
}

export {
  __sseClients,
  nostagliaClients,
  emitSSE,
  broadcastSSE,
  nostagliaBroadcast,
  addClient,
  removeClient,
  addNostagliaClient,
  removeNostagliaClient,
};
