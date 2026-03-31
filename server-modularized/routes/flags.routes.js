/**
 * routes/flags.routes.js
 *
 * Feature flag endpoints — read and toggle server-side feature flags.
 *
 * Flags are held in memory for the lifetime of the process. Restarting the
 * server resets all flags to their default values.
 *
 * Mount this router at /api:
 *   GET  /api/flags — return all current flag values
 *   POST /api/flags — set a flag to a new value ({ key, value })
 *
 * BUG FIX (CRITICAL): The original server.js referenced `featureFlags` and
 * `setFlag` that were never defined anywhere in the file, causing a
 * ReferenceError at runtime. Both are defined here in module scope.
 */

import { Router } from 'express';

const router = Router();

// ---------------------------------------------------------------------------
// In-process feature flag store
// BUG FIX: defined here — was undefined/missing in original server.js
// ---------------------------------------------------------------------------

const featureFlags = {
  maintenance: false,
  newFeature: false,
};

/**
 * Set a feature flag value.
 *
 * @param {string} key   — must be an existing key in featureFlags
 * @param {*}      value — new value (typically boolean)
 */
function setFlag(key, value) {
  featureFlags[key] = value;
}

// ---------------------------------------------------------------------------
// GET /api/flags — return all current flag values
// ---------------------------------------------------------------------------

router.get('/flags', (_req, res) => {
  res.json({ ok: true, flags: featureFlags });
});

// ---------------------------------------------------------------------------
// POST /api/flags — update a flag value
// Body: { key: string, value: any }
// ---------------------------------------------------------------------------

router.post('/flags', (req, res) => {
  const { key, value } = req.body || {};

  if (!(key in featureFlags)) {
    return res.status(400).json({ ok: false, error: 'UNKNOWN_FLAG' });
  }

  setFlag(key, value);
  res.json({ ok: true, flags: featureFlags });
});

export default router;
