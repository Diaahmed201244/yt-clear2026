/**
 * middleware/rate-limit.js
 *
 * Rate-limiting and spam-prevention middleware.
 *
 * Exports:
 *   spamPrevention    — custom per-IP+path request throttle (50 req / min)
 *   transferLimiter   — express-rate-limit for the transfer endpoint (10/min)
 *   apiLimiter        — express-rate-limit for general API routes (100/min)
 *
 * BUG FIX: requestCounts Map is capped at 10,000 entries to prevent memory
 * leaks. When the limit is reached, the oldest entries are evicted.
 */

import rateLimit from 'express-rate-limit';

// ---------------------------------------------------------------------------
// Custom spam prevention (per IP + path)
// ---------------------------------------------------------------------------

const REQUEST_SPAM_THRESHOLD = 50;  // max requests per window
const REQUEST_SPAM_WINDOW = 60_000; // 1 minute window
const MAX_MAP_SIZE = 10_000;        // prevent unbounded memory growth

/** @type {Map<string, { count: number, start: number }>} */
const requestCounts = new Map();

/**
 * Evict the oldest entries when the map exceeds MAX_MAP_SIZE.
 * Map iteration order is insertion order, so the first entries are oldest.
 */
function evictOldest() {
  if (requestCounts.size <= MAX_MAP_SIZE) return;

  const toRemove = requestCounts.size - MAX_MAP_SIZE;
  let removed = 0;
  for (const key of requestCounts.keys()) {
    if (removed >= toRemove) break;
    requestCounts.delete(key);
    removed++;
  }
}

/**
 * Custom spam-prevention middleware.
 * Tracks request counts per IP+path and returns 429 when the threshold
 * is exceeded within the time window.
 */
export function spamPrevention(req, res, next) {
  const key = req.ip + req.path;
  const now = Date.now();

  if (!requestCounts.has(key)) {
    evictOldest();
    requestCounts.set(key, { count: 1, start: now });
  } else {
    const data = requestCounts.get(key);
    if (now - data.start > REQUEST_SPAM_WINDOW) {
      requestCounts.set(key, { count: 1, start: now });
    } else {
      data.count++;
      if (data.count > REQUEST_SPAM_THRESHOLD) {
        console.warn(`[SPAM BLOCK] IP ${req.ip} blocked for ${req.path} (${data.count} requests)`);
        return res.status(429).json({
          success: false,
          error: 'Too many requests - possible infinite loop detected',
        });
      }
    }
  }
  next();
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.start > REQUEST_SPAM_WINDOW) requestCounts.delete(key);
  }
}, 60_000);

// ---------------------------------------------------------------------------
// express-rate-limit configurations
// ---------------------------------------------------------------------------

/**
 * Rate limiter for the transfer endpoint — 10 requests per minute per user/IP.
 */
export const transferLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (_req, res) => {
    res.status(429).json({ success: false, error: 'TRANSFER_RATE_LIMIT_EXCEEDED' });
  },
});

/**
 * General API rate limiter — 100 requests per minute per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ success: false, error: 'RATE_LIMIT_EXCEEDED' });
  },
});
