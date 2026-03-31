/**
 * config/cors.js
 *
 * CORS configuration with environment-driven origin whitelist.
 *
 * BUG FIX: The original allowed ALL origins unconditionally (`callback(null, true)`).
 * This version reads allowed origins from CORS_ORIGINS (comma-separated) and only
 * permits those in production. In development, all origins are accepted.
 *
 * Environment variables:
 *   CORS_ORIGINS — Comma-separated list of allowed origins.
 *                  Example: "https://app.example.com,https://admin.example.com"
 */

import { IS_PRODUCTION } from './index.js';

/**
 * Parse the CORS_ORIGINS env var into a Set of allowed origins.
 * Returns null when no origins are configured.
 */
function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) return null;

  return new Set(
    raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  );
}

/**
 * Build the cors options object.
 * In production, only whitelisted origins are accepted.
 * In development, all origins are accepted for convenience.
 */
function buildCorsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      // Non-browser requests (curl, server-to-server) have no origin header
      if (!origin) return callback(null, true);

      // Development mode — allow everything
      if (!IS_PRODUCTION) return callback(null, true);

      // Production with a whitelist
      if (allowedOrigins && allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      // Production without any whitelist configured — warn and allow
      // (prevents accidental lockout if CORS_ORIGINS is not yet set)
      if (!allowedOrigins) {
        console.warn(
          `⚠️  [CORS] No CORS_ORIGINS configured in production. Allowing origin: ${origin}`
        );
        return callback(null, true);
      }

      // Origin not in whitelist
      console.warn(`🚫 [CORS] Blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'X-CSRF-TOKEN',
    ],
  };
}

const corsOptions = buildCorsOptions();

export default corsOptions;
export { buildCorsOptions, getAllowedOrigins };
