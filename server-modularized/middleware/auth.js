/**
 * middleware/auth.js
 *
 * Authentication middleware for JWT-based and session-cookie-based auth.
 *
 * Exports:
 *   devSessions       — Map of active dev sessions (sessionId → session data)
 *   readSessionFromCookie(req, res) — reads session from cookie, returns session or null
 *   requireJwtAuth     — Express middleware that verifies a Bearer JWT token
 *   signJwt(userId, email) — creates a signed JWT for the given user
 *   sqliteFindUserByEmail(email) — looks up a user row by email (case-insensitive)
 *   memFindUserByEmail(email) — looks up a user from the in-memory cache
 *   memCreateUser(email, username, password, profile) — creates a user in DB + memory
 *
 * BUG FIX: JWT_SECRET is imported from config — never hardcoded.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { JWT_SECRET } from '../config/index.js';
import { pool, query } from '../config/database.js';

// ---------------------------------------------------------------------------
// In-memory session store
// ---------------------------------------------------------------------------

/** Active dev sessions: sessionId → { userId, role, sessionId, ... } */
export const devSessions = new Map();

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

/**
 * Read a session from the `session_token` cookie.
 * Returns the session object or null if not found / invalid.
 * Clears stale cookies automatically.
 */
export function readSessionFromCookie(req, res) {
  try {
    const token = (req.cookies && req.cookies.session_token) || null;
    if (!token) return null;

    const session = devSessions.get(token);
    if (!session) {
      // Stale cookie — delete it
      if (res && typeof res.clearCookie === 'function') {
        res.clearCookie('session_token', { path: '/' });
      }
      return null;
    }
    return session;
  } catch (_) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Session-based auth middleware
// ---------------------------------------------------------------------------

/**
 * Express middleware — reads the session cookie and populates `req.user`.
 * Responds with 401 if no valid session is found.
 */
export function requireAuth(req, res, next) {
  try {
    const session = readSessionFromCookie(req, res);
    if (!session || !session.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    req.user = {
      id: session.userId,
      email: session.email || null,
      sessionId: session.sessionId || null,
      role: session.role || 'user',
    };
    next();
  } catch (_) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

/**
 * Sign a JWT for the given user.
 *
 * @param {string} userId
 * @param {string} email
 * @returns {string} signed JWT
 */
export function signJwt(userId, email) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Express middleware — verifies a Bearer JWT from the Authorization header.
 * On success, sets `req.auth = { userId, email }`.
 */
export function requireJwtAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const parts = header.split(' ');

    if (parts[0] !== 'Bearer' || !parts[1]) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const decoded = jwt.verify(parts[1], JWT_SECRET);
    req.auth = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

// ---------------------------------------------------------------------------
// User lookup / creation helpers
// ---------------------------------------------------------------------------

/** In-memory user cache: email → { id, email, username, password_hash, ... } */
const __authUsers = new Map();

/**
 * Find a user by email in the database (case-insensitive).
 *
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export async function sqliteFindUserByEmail(email) {
  try {
    const normalizedEmail = String(email).toLowerCase().trim();

    const r = await query(
      'SELECT id, email, password_hash, codes_count, silver_count, gold_count, last_sync_at, user_type, is_untrusted FROM users WHERE LOWER(email)=$1',
      [normalizedEmail]
    );

    console.log('[DB] sqliteFindUserByEmail query result:', {
      rowsFound: r.rows?.length || 0,
      email: normalizedEmail,
    });

    return r.rows[0] || null;
  } catch (e) {
    console.error('[DB ERROR] sqliteFindUserByEmail failed:', e.message);
    throw e;
  }
}

/**
 * Find a user by email in the in-memory cache.
 *
 * @param {string} email
 * @returns {Object|null}
 */
export function memFindUserByEmail(email) {
  return __authUsers.get(email) || null;
}

/**
 * Create (or update) a user in the database and in-memory cache.
 *
 * @param {string}  email
 * @param {string}  username
 * @param {string}  password   plain-text (will be hashed)
 * @param {Object}  profile    optional { religion, country, phone }
 * @param {Object}  usersManager  external users manager for balance init
 * @returns {Promise<{id: string}>}
 */
export async function memCreateUser(email, username, password, profile = {}, usersManager = null) {
  const normalizedEmail = String(email).toLowerCase().trim();
  const hash = await bcrypt.hash(password, 10);

  console.log('[SIGNUP] Creating user:', { email: normalizedEmail, profile });

  let id = crypto.randomUUID();

  try {
    if (process.env.DATABASE_URL) {
      // Check if user exists first
      const existing = await query(
        'SELECT id, password_hash FROM users WHERE LOWER(email)=$1',
        [normalizedEmail]
      );

      if (existing.rows && existing.rows[0]) {
        // User exists — update password and profile
        id = existing.rows[0].id;
        console.log(`[SIGNUP] User ${normalizedEmail} already exists, updating profile for id: ${id}`);

        await query(
          'UPDATE users SET password_hash=$1, username=$2, religion=$3, country=$4, phone=$5 WHERE id=$6',
          [
            hash,
            username || normalizedEmail.split('@')[0],
            profile.religion || null,
            profile.country || null,
            profile.phone || null,
            id,
          ]
        );
      } else {
        // Create new user
        await query(
          'INSERT INTO users(id, email, username, password_hash, religion, country, phone) VALUES($1,$2,$3,$4,$5,$6,$7)',
          [
            id,
            normalizedEmail,
            username || normalizedEmail.split('@')[0],
            hash,
            profile.religion || null,
            profile.country || null,
            profile.phone || null,
          ]
        );
        console.log(`[SIGNUP] User ${normalizedEmail} created in DB: ${id}`);
      }

      // Initialize default assets
      try {
        await query(
          'INSERT INTO user_assets(user_id, asset_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
          [id, 'init']
        );
      } catch (err) {
        console.error('[SIGNUP] User assets insert error:', err.message);
      }
    }
  } catch (e) {
    console.error('[SIGNUP][DB ERROR]', e.message);
  }

  // Keep in memory for current session compatibility
  __authUsers.set(normalizedEmail, {
    id,
    email: normalizedEmail,
    username: username || null,
    password_hash: hash,
    ...profile,
  });

  if (usersManager && !usersManager.getUser(id)) {
    usersManager.addUser({ id, balance: 100, assets: [] });
  }

  return { id };
}
