/**
 * server.js
 *
 * Application bootstrap — the entry point for the Node.js process.
 *
 * Responsibilities:
 *   1. Register global process error handlers (uncaughtException, etc.)
 *   2. Create the HTTP server and attach Socket.IO / WebSocket
 *   3. Start listening on PORT (with EADDRINUSE retry)
 *   4. Run post-startup tasks: DB schema verification, event processor
 *
 * Keep this file as lean as possible. All application logic lives in app.js
 * and the modules it imports.
 */

import 'dotenv/config';
import http from 'http';

import app from './app.js';
import { PORT } from './config/index.js';
import { setupGlobalErrorHandlers } from './middleware/error-handler.js';
import { applyNeonCompressionDDL } from './db/schema.js';
import { setupWebSocket, setupServerWithRetry } from './services/websocket.service.js';
import { startEventProcessor } from './services/event-processor.service.js';
import { initializeServices, getServiceStatus } from './integration/compatibility-layer.js';

// ---------------------------------------------------------------------------
// 1. Register global process error handlers — call ONCE, at the very start
// ---------------------------------------------------------------------------
setupGlobalErrorHandlers();

// ---------------------------------------------------------------------------
// 2. Create HTTP server and attach WebSocket / Socket.IO
// ---------------------------------------------------------------------------
const server = http.createServer(app);

// setupWebSocket returns { io, wss }. Expose the Socket.IO instance globally
// so route handlers and services can emit events without circular imports.
setupWebSocket(server).then(({ io }) => {
  globalThis.__wss = io;
});

// ---------------------------------------------------------------------------
// 3. Start listening — with automatic EADDRINUSE retry
// ---------------------------------------------------------------------------
setupServerWithRetry(server, PORT);

// ---------------------------------------------------------------------------
// 4. Post-startup tasks — run after the server begins accepting connections
// ---------------------------------------------------------------------------
server.on('listening', async () => {
  const addr = server.address();
  const boundPort = typeof addr === 'object' ? addr?.port : addr;
  console.log(`🚀 Server listening on port ${boundPort} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);

  // Initialize custom services (ACC, Bankode, AI-Brain)
  console.log('🔧 Initializing custom services...');
  const serviceResult = await initializeServices();
  if (serviceResult.success) {
    console.log('✅ All custom services initialized');
    const status = getServiceStatus();
    console.log('📊 Service status:', JSON.stringify(status, null, 2));
  } else {
    console.error('⚠️  Some services failed to initialize:', serviceResult.error);
  }

  // Ensure the database schema is up-to-date
  applyNeonCompressionDDL().catch((err) =>
    console.error('⚠️  [DB] Schema migration failed:', err.message)
  );

  // Start the background event-processing loop
  startEventProcessor();
});
