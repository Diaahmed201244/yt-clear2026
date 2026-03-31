/**
 * middleware/error-handler.js
 *
 * Global error handling for the Express app and the Node.js process.
 *
 * The original server.js registered uncaughtException / unhandledRejection
 * handlers TWICE (top of file + bottom). This module consolidates them into
 * a single registration via `setupGlobalErrorHandlers()`.
 *
 * Exports:
 *   setupGlobalErrorHandlers() — registers process-level error handlers (call ONCE)
 *   expressErrorHandler        — Express error-handling middleware (4-arg signature)
 */

// ---------------------------------------------------------------------------
// Process-level error handlers — call setupGlobalErrorHandlers() once at boot
// ---------------------------------------------------------------------------

/**
 * Register `uncaughtException` and `unhandledRejection` handlers on the
 * current process. Safe to call only ONCE — duplicate calls are a no-op
 * thanks to the guard flag.
 */
let _registered = false;

export function setupGlobalErrorHandlers() {
  if (_registered) return;
  _registered = true;

  process.on('uncaughtException', (err) => {
    console.error('💥 [CRITICAL] UNCAUGHT EXCEPTION:', err.message);
    console.error('Stack:', err.stack);
    console.error('Timestamp:', new Date().toISOString());

    if (err.code === 'EADDRINUSE') {
      console.error('Port already in use, exiting...');
    }

    // Intentionally NOT calling process.exit() — the process manager (PM2)
    // handles restarts, and an immediate exit can mask logs.
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 [CRITICAL] UNHANDLED REJECTION at:', promise, 'reason:', reason);
    console.error('Timestamp:', new Date().toISOString());
  });
}

// ---------------------------------------------------------------------------
// Express error-handling middleware (must have 4 arguments)
// ---------------------------------------------------------------------------

/**
 * Catch-all Express error handler. Mount this AFTER all routes:
 *
 *   app.use(expressErrorHandler);
 */
export function expressErrorHandler(err, req, res, _next) {
  console.error('🔥 GLOBAL ERROR:', err.message);
  console.error('Stack:', err.stack);

  if (!res.headersSent) {
    res.status(500).json({ success: false, error: err.message });
  }
}
