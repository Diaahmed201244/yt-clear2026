/**
 * helpers/user-helpers.js
 *
 * Re-exports user lookup and creation helpers from middleware/auth.js.
 *
 * The canonical implementations of sqliteFindUserByEmail, memFindUserByEmail,
 * and memCreateUser live in middleware/auth.js (alongside the session store they
 * depend on). This module provides a shorter import path for route handlers and
 * services that only need the user-related utilities.
 */

export {
  sqliteFindUserByEmail,
  memFindUserByEmail,
  memCreateUser,
} from '../middleware/auth.js';
