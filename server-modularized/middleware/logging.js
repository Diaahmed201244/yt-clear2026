/**
 * middleware/logging.js
 *
 * Request logging middleware.
 *
 * BUG FIX: req.body is NO LONGER logged — it can contain passwords and other
 * sensitive data. Only method, URL, status code, and response time are logged.
 *
 * Exports:
 *   requestLogger — Express middleware that logs every request
 */

/**
 * Log incoming requests with method, path, status code, and response time.
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  // Capture the response finish to log status + timing
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
}
