/**
 * helpers/auth-helpers.js
 *
 * Re-exports authentication helper functions from middleware/auth.js.
 *
 * All auth-related helpers (JWT signing, session reading, user lookup/creation)
 * live in middleware/auth.js as the single source of truth. This module provides
 * a convenience import path so that non-middleware code can import auth helpers
 * from the helpers/ directory without reaching into middleware/.
 */

export {
  devSessions,
  readSessionFromCookie,
  requireAuth,
  signJwt,
  requireJwtAuth,
} from '../middleware/auth.js';
