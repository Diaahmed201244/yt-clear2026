/**
 * routes/auth.routes.js
 *
 * Authentication and session management routes.
 *
 * Endpoints:
 *   POST /auth/dev-login       — Developer login (creates an in-memory session)
 *   POST /auth/logout           — Log out and clear session cookie
 *   POST /auth/send-hybrid-otp  — Send OTP via email + phone
 *   POST /auth/verify-hybrid-otp — Verify an OTP code
 *   POST /auth/resend-otp       — Resend OTP on a given channel
 *   POST /auth/signup           — Register a new user
 *   POST /auth/login            — Authenticate with email + password
 *   GET  /auth/me               — Get current user (requires auth)
 *   GET  /me                    — Session info alias (cookie-based)
 *   GET  /users/resolve         — Resolve a userId by email
 *   GET  /users/state           — Get user state (requires auth)
 *   GET  /auth/session          — Session endpoint (stub)
 *   POST /token/refresh         — Refresh JWT token using current session
 *
 * BUG FIX: All session cookies now set httpOnly: true (original had false).
 */

import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { query } from '../config/database.js';
import {
  devSessions,
  readSessionFromCookie,
  requireAuth,
  signJwt,
  sqliteFindUserByEmail,
  memFindUserByEmail,
  memCreateUser,
} from '../middleware/auth.js';

// OTP service — imported from project root (path may need adjustment at integration)
import {
  sendHybridOTP,
  verifyHybridOTP,
  resendOTP,
} from '../services/hybrid-otp-service.js';

const router = Router();

// ---------------------------------------------------------------------------
// DEV auth: quick login (no password)
// ---------------------------------------------------------------------------

router.post('/auth/dev-login', (req, res) => {
  try {
    const sessionId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    devSessions.set(sessionId, { userId, role: 'dev', sessionId });

    // BUG FIX: httpOnly: true (was false in original)
    res.cookie('session_token', sessionId, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('[AUTH] dev login success');

    const insertUser = async () => {
      await query(
        'INSERT INTO users (id, status, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING',
        [userId, 'active']
      );
    };
    insertUser().catch((err) => {
      console.error('[AUTH] User insert error:', err);
    });

    return res.status(200).json({ ok: true, userId, sessionId });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'dev login failed' });
  }
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

router.post('/auth/logout', (req, res) => {
  try {
    const token = req.cookies && req.cookies.session_token;
    if (token) devSessions.delete(token);
    res.clearCookie('session_token', { path: '/' });
    console.log('[AUTH] logout success');
  } catch (err) {
    console.error('[AUTH] Logout error:', err);
  }
  return res.status(200).json({ ok: true });
});

// ---------------------------------------------------------------------------
// Hybrid OTP flow
// ---------------------------------------------------------------------------

router.post('/auth/send-hybrid-otp', async (req, res) => {
  try {
    const { email, phone, countryCode } = req.body;

    if (!email || !phone || !countryCode) {
      return res.status(400).json({
        success: false,
        error: 'Email, phone number, and country code are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const result = await sendHybridOTP({ email, phone, countryCode });

    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        sessionId: result.sessionId,
        channels: result.channels,
        ...(result.mockOtp && { mockOtp: result.mockOtp }),
      });
    }

    return res.status(400).json({
      success: false,
      error: result.error,
      details: result.details,
    });
  } catch (error) {
    console.error('[HybridOTP API] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
});

router.post('/auth/verify-hybrid-otp', async (req, res) => {
  try {
    const { sessionId, otp, channel } = req.body;

    if (!sessionId || !otp || !channel) {
      return res.status(400).json({
        success: false,
        error: 'Session ID, OTP, and channel (email/phone) are required',
      });
    }

    const result = await verifyHybridOTP(sessionId, otp, channel);

    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        verified: result.verified,
        progress: result.progress,
        pendingChannel: result.pendingChannel,
        userData: result.userData,
      });
    }

    return res.status(400).json({ success: false, error: result.error });
  } catch (error) {
    console.error('[HybridOTP Verify] Error:', error);
    return res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

router.post('/auth/resend-otp', async (req, res) => {
  try {
    const { sessionId, channel } = req.body;

    if (!sessionId || !channel) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and channel are required',
      });
    }

    const result = await resendOTP(sessionId, channel);

    if (result.success) {
      return res.json({ success: true, message: `OTP resent via ${channel}` });
    }

    return res.status(400).json({ success: false, error: result.error });
  } catch (error) {
    console.error('[Resend OTP] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to resend OTP' });
  }
});

// ---------------------------------------------------------------------------
// Signup
// ---------------------------------------------------------------------------

router.post('/auth/signup', async (req, res) => {
  try {
    const { email, username, password, religion, country, phone, countryCode } = req.body;

    if (!email || !password || !religion || !country || !phone) {
      return res.status(400).json({ status: 'failed', error: 'All fields are required' });
    }

    const existing = process.env.DATABASE_URL
      ? await sqliteFindUserByEmail(email)
      : memFindUserByEmail(email);

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'USER_EXISTS',
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }

    // Clear any existing sessions for this email to prevent stale session conflicts
    for (const [sid, sess] of devSessions.entries()) {
      if (sess.email === email) {
        devSessions.delete(sid);
      }
    }

    const formattedPhone =
      phone && countryCode ? `${countryCode}${phone.replace(/\D/g, '')}` : phone;

    const created = await memCreateUser(email, username, password, {
      religion,
      country,
      phone: formattedPhone,
      phoneVerified: true,
      emailVerified: true,
      verifiedAt: new Date().toISOString(),
    });

    if (!created || !created.id) {
      throw new Error('User creation failed');
    }

    // Register user in UsersManager if available
    try {
      if (global.UsersManager && typeof global.UsersManager.registerUser === 'function') {
        await global.UsersManager.registerUser(created);
        console.log(`[Signup] Registered user ${created.id} in UsersManager`);
      }
    } catch (e) {
      console.warn('[Signup] UsersManager registration failed:', e.message);
    }

    const token = signJwt(created.id, email);
    const newSessionId = crypto.randomUUID();

    devSessions.set(newSessionId, {
      userId: created.id,
      role: 'user',
      sessionId: newSessionId,
      email,
      phone: formattedPhone,
      religion,
      country,
      verified: true,
    });

    // BUG FIX: httpOnly: true (was false in original)
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('session_token', newSessionId, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      status: 'success',
      userId: created.id,
      token,
      sessionId: newSessionId,
      user: {
        id: created.id,
        email,
        username,
        religion,
        country,
        phone: formattedPhone,
        verified: true,
      },
    });
  } catch (err) {
    console.error('[Signup Error]:', err);
    return res.status(500).json({ status: 'failed', error: err.message || 'Signup failed' });
  }
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ status: 'failed', error: 'Email and password required' });
    }

    const u = process.env.DATABASE_URL
      ? await sqliteFindUserByEmail(email)
      : memFindUserByEmail(email);

    if (!u) {
      return res.status(401).json({ status: 'failed', error: 'Invalid credentials' });
    }

    if (!u.password_hash) {
      return res.status(500).json({ status: 'failed', error: 'Account corrupted' });
    }

    // Handle PHP bcrypt format ($2y$ → $2a$)
    let storedHash = String(u.password_hash).trim();
    if (storedHash.startsWith('$2y$')) {
      storedHash = '$2a$' + storedHash.substring(4);
    }

    const ok = await bcrypt.compare(String(password).trim(), storedHash);
    if (!ok) {
      return res.status(401).json({ status: 'failed', error: 'Invalid credentials' });
    }

    const token = signJwt(u.id, u.email);
    const sessionId = crypto.randomUUID();

    devSessions.set(sessionId, {
      userId: u.id,
      role: u.user_type || 'user',
      sessionId,
      email: u.email,
      isUntrusted: u.is_untrusted || false,
    });

    // BUG FIX: httpOnly: true (was false in original)
    res.cookie('session_token', sessionId, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('[AUTH] Login success - userId:', u.id, 'sessionId:', sessionId);
    return res.json({ status: 'success', userId: u.id, token, sessionId });
  } catch (err) {
    console.error('[LOGIN ERROR]:', err);
    return res.status(500).json({ status: 'failed', error: 'Login failed' });
  }
});

// ---------------------------------------------------------------------------
// Whoami / session info
// ---------------------------------------------------------------------------

router.get('/auth/me', requireAuth, (req, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        sessionId: req.user.sessionId,
        role: req.user.role,
      },
    });
  } catch (_) {
    return res.json({ success: false, user: null });
  }
});

router.get('/me', (req, res) => {
  try {
    const s = readSessionFromCookie(req, res);
    if (!s) return res.json({ success: false, user: null });
    return res.json({
      success: true,
      user: {
        id: s.userId,
        email: s.email,
        sessionId: s.sessionId,
        role: s.role,
      },
    });
  } catch (_) {
    return res.json({ success: false, user: null });
  }
});

// ---------------------------------------------------------------------------
// User resolution
// ---------------------------------------------------------------------------

router.get('/users/resolve', async (req, res) => {
  try {
    const email = (req.query.email || '').trim();
    if (!email) return res.status(400).json({ status: 'failed', error: 'Email required' });

    const u = process.env.DATABASE_URL
      ? await sqliteFindUserByEmail(email)
      : memFindUserByEmail(email);

    if (!u) return res.status(404).json({ status: 'failed', error: 'User not found' });
    return res.json({ status: 'success', userId: u.id });
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: 'Resolve failed' });
  }
});

router.get('/users/state', requireAuth, async (req, res) => {
  try {
    const userId = (req.query.userId || '').trim();
    if (!userId) return res.status(400).json({ status: 'failed', error: 'UserId required' });

    if (req.user.id !== userId) {
      return res.status(403).json({ status: 'failed', error: 'unauthorized_access' });
    }

    // UsersManager is stubbed globally; return null when not available
    const usersManager = global.UsersManager || { getUser: () => null };
    const user = usersManager.getUser(userId);
    if (!user) return res.json({ status: 'success', user: null });
    return res.json({ status: 'success', user });
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: 'State fetch failed' });
  }
});

// ---------------------------------------------------------------------------
// Session stub
// ---------------------------------------------------------------------------

router.get('/auth/session', (_req, res) => {
  res.status(404).end();
});

// ---------------------------------------------------------------------------
// Token refresh — re-sign a JWT for the current session
// ---------------------------------------------------------------------------

router.post('/token/refresh', requireAuth, (req, res) => {
  try {
    const token = signJwt(req.user.id, req.user.email);
    return res.json({ success: true, token });
  } catch (err) {
    console.error('[TOKEN REFRESH ERROR]:', err);
    return res.status(500).json({ success: false, error: 'Token refresh failed' });
  }
});

export default router;
