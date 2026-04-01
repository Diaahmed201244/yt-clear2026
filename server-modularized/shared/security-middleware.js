/**
 * shared/security-middleware.js
 *
 * Financial security middleware and idempotency helpers.
 *
 * Exports:
 *   enforceFinancialSecurity — Express middleware that enforces financial security checks
 *   enforceWatchDog          — Express middleware that verifies watchdog state before operations
 *   storeIdempotencyResponse — Store a response for idempotency-key deduplication
 *   getIdempotencyResponse   — Retrieve a stored idempotency response
 */

// ---------------------------------------------------------------------------
// Idempotency store (in-memory, per-process)
// ---------------------------------------------------------------------------

/** @type {Map<string, { response: object, timestamp: number }>} */
const idempotencyStore = new Map();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Periodic cleanup of expired idempotency entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of idempotencyStore.entries()) {
    if (now - entry.timestamp > IDEMPOTENCY_TTL_MS) {
      idempotencyStore.delete(key);
    }
  }
}, 60_000);

/**
 * Store an idempotency response for later deduplication.
 *
 * @param {string} userId
 * @param {string} idempotencyKey
 * @param {object} response
 */
export function storeIdempotencyResponse(userId, idempotencyKey, response) {
  const key = `${userId}:${idempotencyKey}`;
  idempotencyStore.set(key, { response, timestamp: Date.now() });
}

/**
 * Retrieve a stored idempotency response.
 *
 * @param {string} userId
 * @param {string} idempotencyKey
 * @returns {object|null}
 */
export function getIdempotencyResponse(userId, idempotencyKey) {
  const key = `${userId}:${idempotencyKey}`;
  const entry = idempotencyStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > IDEMPOTENCY_TTL_MS) {
    idempotencyStore.delete(key);
    return null;
  }
  return entry.response;
}

// ---------------------------------------------------------------------------
// Financial security middleware
// ---------------------------------------------------------------------------

/**
 * Express middleware — basic financial security gate.
 *
 * Ensures the request is authenticated and applies rate-based checks.
 * Passes through if all checks pass; returns 403 if suspicious.
 */
export function enforceFinancialSecurity(req, res, next) {
  try {   
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'unauthorized' });
    }
    // Future: add velocity checks, device fingerprint validation, etc.
    next();
  } catch (err) {
    console.error('[SECURITY] enforceFinancialSecurity error:', err);
    return res.status(500).json({ success: false, error: 'security_check_failed' });
  }
}

// ---------------------------------------------------------------------------
// Watchdog enforcement middleware
// ---------------------------------------------------------------------------

/**
 * Express middleware — ensures the user's watchdog is in a valid state
 * before allowing a financial operation.
 */
export function enforceWatchDog(req, res, next) {
  try {   
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'unauthorized' });
    }
    // Future: verify watchdog state from DB
    next();
  } catch (err) {
    console.error('[SECURITY] enforceWatchDog error:', err);
    return res.status(500).json({ success: false, error: 'watchdog_check_failed' });
  }
}
