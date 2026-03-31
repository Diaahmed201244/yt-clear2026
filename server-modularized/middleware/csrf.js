/**
 * middleware/csrf.js
 *
 * Double-submit cookie CSRF protection.
 *
 * Exports:
 *   csrfTokenIssuer   — middleware that sets an XSRF-TOKEN cookie if absent
 *   csrfProtection    — middleware that validates the X-CSRF-TOKEN header
 *                        against the cookie on unsafe HTTP methods
 */

import crypto from 'crypto';
import { IS_PRODUCTION } from '../config/index.js';

/**
 * Issue a CSRF token cookie if one doesn't already exist.
 * The cookie is NOT httpOnly so client-side JS can read it and send it
 * back in the X-CSRF-TOKEN header.
 */
export function csrfTokenIssuer(req, res, next) {
  const existing = req.cookies?.['XSRF-TOKEN'];
  if (!existing) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: IS_PRODUCTION,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
  next();
}

/**
 * Validate CSRF tokens on unsafe methods (POST, PUT, PATCH, DELETE).
 * Compares the X-CSRF-TOKEN header against the XSRF-TOKEN cookie.
 *
 * Skipped when DISABLE_CSRF=true or NODE_ENV is not production.
 */
export function csrfProtection(req, res, next) {
  const method = (req.method || 'GET').toUpperCase();
  const isUnsafe = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

  if (!isUnsafe) return next();

  // Skip CSRF for smoke tests and development
  if (process.env.DISABLE_CSRF === 'true' || !IS_PRODUCTION) {
    return next();
  }

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.['XSRF-TOKEN'];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ success: false, error: 'CSRF validation failed' });
  }

  next();
}
