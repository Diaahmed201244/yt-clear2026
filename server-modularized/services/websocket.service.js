/**
 * services/websocket.service.js
 *
 * WebSocket and Socket.IO setup for real-time communication.
 *
 * - Raw WebSocket (via `ws`) is initialised for general-purpose bidirectional
 *   messaging but currently unused in favour of SSE for push updates.
 * - Socket.IO is mounted on the `/ws` path for the E7ki Messenger feature.
 * - EADDRINUSE retry logic is provided so the server can recover from port
 *   conflicts without a full process restart.
 *
 * Exports:
 *   setupWebSocket(server)             — attach WS + Socket.IO to an HTTP server
 *   setupServerWithRetry(server, port) — listen with EADDRINUSE retry
 */

import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

// ---------------------------------------------------------------------------
// WebSocket + Socket.IO setup
// ---------------------------------------------------------------------------

/**
 * Attach a raw WebSocket server and a Socket.IO server to the given HTTP
 * server instance.
 *
 * @param {import('http').Server} server
 * @returns {Promise<{ io: SocketIOServer, wss: import('ws').WebSocketServer | null }>}
 */
export async function setupWebSocket(server) {
  // --- Raw WebSocket (ws) ---
  let wss = null;
  try { 
    const { WebSocketServer } = await import('ws');
    wss = new WebSocketServer({ server });
    const wsClients = new Map(); // userId → ws

    wss.on('connection', (ws) => {
      console.log('[WS] Client connected');

      ws.on('message', (msg) => {
        try { 
          const data = JSON.parse(msg.toString());
          if (data && data.type === 'AUTH' && data.userId) {
            ws.userId = String(data.userId);
            wsClients.set(ws.userId, ws);
            console.log('[WS] Authenticated:', ws.userId);
          }
        } catch (e) {
          console.error('[WS ERROR]', e?.message ?? e);
        }
      });

      ws.on('close', () => {
        if (ws.userId) wsClients.delete(ws.userId);
      });
    });
  } catch (e) {
    console.warn('[WS] WebSocket unavailable:', e?.message);
  }

  // --- Socket.IO (for E7ki Messenger) ---
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      credentials: true,
    },
    path: '/ws',
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try { 
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (_) {
      next(new Error('Invalid token'));
    }
  });

  return { io, wss };
}

// ---------------------------------------------------------------------------
// EADDRINUSE retry logic
// ---------------------------------------------------------------------------

/**
 * Start listening on the given port with automatic retry when EADDRINUSE
 * is encountered.
 *
 * @param {import('http').Server} server
 * @param {number} port
 * @returns {void}
 */
export function setupServerWithRetry(server, port) {
  let isRetrying = false;

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      if (isRetrying) return;
      isRetrying = true;
      console.error(`💥 Port ${port} is already in use. Retrying in 5 seconds...`);
      setTimeout(() => {
        isRetrying = false;
        server.close();
        server.listen(port);
      }, 5000);
    } else {
      console.error('💥 Server error:', e);
    }
  });

  server.listen(port);
}
